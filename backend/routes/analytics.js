// ==========================================
// AI Interview Coach - Analytics Routes
// ==========================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const AnalyticsDB = require('../database/analytics-db');
const { calculateCost } = require('../utils/token-counter');
const router = express.Router();

// Initialize database
const analyticsDB = new AnalyticsDB();
analyticsDB.initialize().catch(console.error);

// Rate limiting for analytics endpoints
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: {
    error: 'Too many analytics requests',
    code: 'ANALYTICS_RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
router.use(analyticsLimiter);

/**
 * POST /api/analytics - Receive analytics events
 */
router.post('/', async (req, res) => {
  try {
    const { events, batch_id, session_info } = req.body;

    // Validate request
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'Invalid events data',
        code: 'INVALID_EVENTS'
      });
    }

    if (!session_info || !session_info.session_id) {
      return res.status(400).json({
        error: 'Session info required',
        code: 'MISSING_SESSION_INFO'
      });
    }

    // Process each event
    const processedEvents = [];
    
    for (const event of events) {
      // Validate event structure
      if (!event.session_id || !event.event_name || !event.properties) {
        console.warn('[ANALYTICS] Invalid event structure:', event);
        continue;
      }

      // Sanitize and prepare event data
      const eventData = {
        session_id: event.session_id,
        event_name: event.event_name,
        timestamp: event.properties.timestamp || Date.now(),
        properties: event.properties,
        page: event.properties.page || '/',
        batch_id: batch_id
      };

      // Record event in database
      await analyticsDB.recordEvent(eventData);
      processedEvents.push(eventData);

      // Update session data
      await analyticsDB.upsertSession({
        session_id: event.session_id,
        user_agent: event.properties.user_agent,
        referrer: event.properties.referrer || '',
        is_mobile: event.properties.viewport?.width < 768,
        timestamp: eventData.timestamp
      });

      // Handle special events with enhanced processing
      await handleSpecialEvents(eventData);
    }

    console.log('[ANALYTICS] Processed batch:', {
      batch_id,
      events_count: processedEvents.length,
      session_id: session_info.session_id
    });

    res.json({
      success: true,
      processed_events: processedEvents.length,
      batch_id: batch_id
    });

  } catch (error) {
    console.error('[ANALYTICS] Error processing events:', error);
    res.status(500).json({
      error: 'Failed to process analytics events',
      code: 'ANALYTICS_PROCESSING_ERROR'
    });
  }
});

/**
 * Handle events that need special processing (ENHANCED VERSION)
 */
async function handleSpecialEvents(eventData) {
  const { event_name, session_id, timestamp, properties } = eventData;

  try {
    switch (event_name) {
      case 'question_generation':
        // Record generation stats (existing)
        await analyticsDB.recordGenerationStat({
          session_id,
          timestamp,
          success: properties.success,
          job_description_length: properties.job_description_length,
          question_count: properties.question_count,
          response_time_ms: properties.response_time_ms,
          error_message: properties.error
        });
        
        // NEW: Token usage tracking
        if (properties.total_tokens) {
          const costInfo = calculateCost(
            properties.input_tokens || 0,
            properties.output_tokens || 0,
            properties.model_name || 'qwen/qwen3-30b-a3b:free'
          );
          
          await analyticsDB.recordTokenUsage({
            session_id,
            request_id: properties.request_id || generateRequestId(),
            timestamp,
            input_tokens: properties.input_tokens || 0,
            input_characters: properties.job_description_length || 0,
            job_description_length: properties.job_description_length || 0,
            output_tokens: properties.output_tokens || 0,
            output_characters: properties.raw_response_length || 0,
            questions_generated: properties.question_count || 0,
            total_tokens: properties.total_tokens,
            estimated_cost_cents: costInfo.totalCostCents,
            model_name: properties.model_name || 'unknown',
            response_time_ms: properties.response_time_ms || 0
          });
        }
        
        // NEW: Parsing analytics tracking
        await analyticsDB.recordParsingAnalytics({
          session_id,
          request_id: properties.request_id || generateRequestId(),
          timestamp,
          parsing_attempted: true,
          parsing_successful: properties.parsing_successful !== false,
          raw_response_length: properties.raw_response_length || 0,
          questions_found: properties.question_count || 0,
          questions_with_answers: Math.max(0, (properties.question_count || 0) - (properties.malformed_questions || 0)),
          malformed_questions: properties.malformed_questions || 0,
          quality_score: properties.quality_score || 0,
          parsing_errors: [],
          warning_flags: [],
          has_proper_format: properties.parsing_successful !== false,
          has_question_markers: properties.parsing_successful !== false,
          has_answer_sections: properties.parsing_successful !== false
        });
        
        // Update daily costs
        if (properties.total_tokens) {
          const date = new Date(timestamp).toISOString().split('T')[0];
          const costInfo = calculateCost(
            properties.input_tokens || 0,
            properties.output_tokens || 0,
            properties.model_name || 'qwen/qwen3-30b-a3b:free'
          );
          
          await analyticsDB.updateDailyCosts(date, {
            total_tokens: properties.total_tokens,
            estimated_cost_cents: costInfo.totalCostCents
          }, properties.success);
        }
        break;

      case 'token_usage':
        await analyticsDB.recordTokenUsage({
          session_id,
          request_id: properties.request_id || generateRequestId(),
          timestamp,
          ...properties
        });
        break;
        
      case 'parsing_analytics':
        await analyticsDB.recordParsingAnalytics({
          session_id,
          request_id: properties.request_id || generateRequestId(),
          timestamp,
          ...properties
        });
        break;
        
      case 'user_feedback':
        await analyticsDB.recordFeedback({
          session_id,
          timestamp,
          feedback_type: properties.feedback_type,
          rating: properties.rating,
          details: JSON.stringify(properties.details || {})
        });
        break;

      case 'usage_alert':
        // Record usage alerts
        await analyticsDB.runQuery(`
          INSERT INTO usage_alerts (
            alert_type, threshold_value, current_value, 
            alert_triggered, date, details
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          properties.alert_type,
          properties.threshold_value,
          properties.current_value,
          true,
          new Date().toISOString().split('T')[0],
          JSON.stringify(properties.details || {})
        ]);
        break;
    }
  } catch (error) {
    console.warn('[ANALYTICS] Error handling special event:', error.message);
    // Don't throw - special event processing is optional
  }
}

/**
 * Generate request ID helper
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * GET /api/analytics/summary - Get enhanced analytics summary (admin only)
 */
router.get('/summary', async (req, res) => {
  try {
    // Simple admin authentication (improve this in production)
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ANALYTICS_ADMIN_PASSWORD || 'admin123';
    
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'ANALYTICS_UNAUTHORIZED'
      });
    }

    const days = parseInt(req.query.days) || 7;
    
    // Use enhanced summary if available, fallback to basic
    let summary;
    try {
      summary = await analyticsDB.getEnhancedAnalyticsSummary(days);
    } catch (error) {
      console.warn('[ANALYTICS] Enhanced summary failed, using basic:', error.message);
      summary = await analyticsDB.getAnalyticsSummary(days);
    }

    res.json({
      success: true,
      data: summary,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ANALYTICS] Error getting summary:', error);
    res.status(500).json({
      error: 'Failed to get analytics summary',
      code: 'ANALYTICS_SUMMARY_ERROR'
    });
  }
});

/**
 * GET /api/analytics/tokens - Get token usage statistics (admin only)
 */
router.get('/tokens', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ANALYTICS_ADMIN_PASSWORD || 'admin123';
    
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'ANALYTICS_UNAUTHORIZED'
      });
    }

    const days = parseInt(req.query.days) || 7;
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);

    const tokenStats = await analyticsDB.allQuery(`
      SELECT 
        DATE(datetime(timestamp/1000, 'unixepoch')) as date,
        COUNT(*) as requests,
        SUM(total_tokens) as total_tokens,
        SUM(input_tokens) as input_tokens,
        SUM(output_tokens) as output_tokens,
        SUM(estimated_cost_cents) as cost_cents,
        AVG(response_time_ms) as avg_response_time,
        model_name
      FROM token_usage 
      WHERE timestamp >= ?
      GROUP BY date, model_name
      ORDER BY date DESC, model_name
    `, [since]);

    res.json({
      success: true,
      data: tokenStats,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ANALYTICS] Error getting token stats:', error);
    res.status(500).json({
      error: 'Failed to get token statistics',
      code: 'TOKEN_STATS_ERROR'
    });
  }
});

/**
 * GET /api/analytics/parsing - Get parsing quality statistics (admin only)
 */
router.get('/parsing', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ANALYTICS_ADMIN_PASSWORD || 'admin123';
    
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'ANALYTICS_UNAUTHORIZED'
      });
    }

    const days = parseInt(req.query.days) || 7;
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);

    const parsingStats = await analyticsDB.allQuery(`
      SELECT 
        DATE(datetime(timestamp/1000, 'unixepoch')) as date,
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN parsing_successful THEN 1 END) as successful_attempts,
        AVG(quality_score) as avg_quality_score,
        AVG(questions_found) as avg_questions_found,
        COUNT(CASE WHEN malformed_questions > 0 THEN 1 END) as responses_with_errors
      FROM parsing_analytics 
      WHERE timestamp >= ?
      GROUP BY date
      ORDER BY date DESC
    `, [since]);

    res.json({
      success: true,
      data: parsingStats,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ANALYTICS] Error getting parsing stats:', error);
    res.status(500).json({
      error: 'Failed to get parsing statistics',
      code: 'PARSING_STATS_ERROR'
    });
  }
});

/**
 * GET /api/analytics/costs - Get cost analysis (admin only)
 */
router.get('/costs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ANALYTICS_ADMIN_PASSWORD || 'admin123';
    
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'ANALYTICS_UNAUTHORIZED'
      });
    }

    const days = parseInt(req.query.days) || 30; // Default to 30 days for cost analysis
    const sinceDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    const costStats = await analyticsDB.allQuery(`
      SELECT 
        date,
        total_requests,
        total_tokens,
        total_cost_cents,
        successful_requests,
        failed_requests,
        avg_tokens_per_request
      FROM daily_costs 
      WHERE date >= ?
      ORDER BY date DESC
    `, [sinceDate]);

    // Calculate totals
    const totals = costStats.reduce((acc, day) => ({
      total_requests: acc.total_requests + (day.total_requests || 0),
      total_tokens: acc.total_tokens + (day.total_tokens || 0),
      total_cost_cents: acc.total_cost_cents + (day.total_cost_cents || 0),
      successful_requests: acc.successful_requests + (day.successful_requests || 0),
      failed_requests: acc.failed_requests + (day.failed_requests || 0)
    }), { total_requests: 0, total_tokens: 0, total_cost_cents: 0, successful_requests: 0, failed_requests: 0 });

    res.json({
      success: true,
      data: {
        daily_breakdown: costStats,
        totals: {
          ...totals,
          total_cost_dollars: Math.round(totals.total_cost_cents) / 100,
          avg_cost_per_request: totals.total_requests > 0 ? 
            Math.round(totals.total_cost_cents / totals.total_requests * 100) / 100 : 0,
          success_rate: totals.total_requests > 0 ? 
            Math.round(totals.successful_requests / totals.total_requests * 100) : 0
        }
      },
      period_days: days,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ANALYTICS] Error getting cost stats:', error);
    res.status(500).json({
      error: 'Failed to get cost statistics',
      code: 'COST_STATS_ERROR'
    });
  }
});

/**
 * GET /api/analytics/health - Enhanced health check for analytics system
 */
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await analyticsDB.getQuery('SELECT 1');
    
    // Check if enhanced tables exist
    const tables = await analyticsDB.allQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN (
        'sessions', 'events', 'token_usage', 'parsing_analytics', 'daily_costs'
      )
    `);
    
    const hasEnhancedTables = tables.length >= 5;
    
    // Get basic stats
    const [sessionCount, eventCount, tokenCount] = await Promise.all([
      analyticsDB.getQuery('SELECT COUNT(*) as count FROM sessions').catch(() => ({ count: 0 })),
      analyticsDB.getQuery('SELECT COUNT(*) as count FROM events').catch(() => ({ count: 0 })),
      analyticsDB.getQuery('SELECT COUNT(*) as count FROM token_usage').catch(() => ({ count: 0 }))
    ]);
    
    res.json({
      status: 'healthy',
      database: 'connected',
      enhanced_analytics: hasEnhancedTables,
      tables_found: tables.map(t => t.name),
      stats: {
        total_sessions: sessionCount.count || 0,
        total_events: eventCount.count || 0,
        total_token_records: tokenCount.count || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;