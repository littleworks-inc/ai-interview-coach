// ==========================================
// AI Interview Coach - Admin Dashboard Routes
// ==========================================

const express = require('express');
const path = require('path');
const AnalyticsDB = require('../database/analytics-db');
const router = express.Router();

// Initialize database
const analyticsDB = new AnalyticsDB();
let dbInitialized = false;

// Initialize database with error handling
async function ensureDBInitialized() {
  if (!dbInitialized) {
    try {
      await analyticsDB.initialize();
      dbInitialized = true;
      console.log('[ADMIN] Analytics database initialized successfully');
    } catch (error) {
      console.error('[ADMIN] Failed to initialize analytics database:', error);
      throw error;
    }
  }
}

// Simple authentication middleware
function requireAuth(req, res, next) {
  const password = req.query.password || req.body.password;
  const adminPassword = process.env.ANALYTICS_ADMIN_PASSWORD || 'admin123';
  
  if (password !== adminPassword) {
    return res.status(401).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Login - AI Interview Coach</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
          input, button { width: 100%; padding: 10px; margin: 10px 0; }
          button { background: #007cba; color: white; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <h2>🎯 AI Interview Coach - Admin Access</h2>
        <form method="GET">
          <input type="password" name="password" placeholder="Admin Password" required>
          <button type="submit">Access Dashboard</button>
        </form>
        <p><small>Default password: admin123</small></p>
      </body>
      </html>
    `);
  }
  next();
}

/**
 * GET /admin/debug - Debug analytics data (TEMPORARY)
 */
router.get('/debug', requireAuth, async (req, res) => {
  try {
    await ensureDBInitialized();
    
    const days = 30;
    console.log('[DEBUG] Testing enhanced summary...');
    
    const summary = await analyticsDB.getEnhancedAnalyticsSummary(days);
    
    res.json({
      success: true,
      summary: summary,
      debug_info: {
        hasTokens: !!summary.tokens,
        hasParsing: !!summary.parsing,
        hasCosts: !!summary.costs,
        tokenCount: summary.tokens ? summary.tokens.total_tokens : 'no tokens',
        parsingAttempts: summary.parsing ? summary.parsing.total_attempts : 'no parsing'
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * GET /admin/analytics - Enhanced Analytics Dashboard (ONLY VERSION)
 */
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    // Ensure database is initialized
    await ensureDBInitialized();
    
    const days = parseInt(req.query.days) || 30; // Default to 30 days
    
    console.log(`[ADMIN] Loading dashboard for ${days} days`);
    
    // Get enhanced analytics data
    const [summary, recentEvents, popularEvents, errorEvents] = await Promise.all([
      // Use enhanced summary with explicit error handling
      analyticsDB.getEnhancedAnalyticsSummary(days).then(result => {
        console.log('[ADMIN] Enhanced summary loaded:', {
          hasTokens: !!result.tokens,
          hasParsing: !!result.parsing,
          hasCosts: !!result.costs
        });
        return result;
      }).catch((err) => {
        console.error('[ADMIN] Enhanced analytics failed, using basic:', err.message);
        return analyticsDB.getAnalyticsSummary(days);
      }),
      
      // Recent events
      analyticsDB.allQuery(`
        SELECT event_name, COUNT(*) as count, 
               MAX(timestamp) as last_occurrence
        FROM events 
        WHERE timestamp >= ?
        GROUP BY event_name 
        ORDER BY count DESC 
        LIMIT 10
      `, [Date.now() - (days * 24 * 60 * 60 * 1000)]).catch(() => []),
      
      // Most popular pages
      analyticsDB.allQuery(`
        SELECT page, COUNT(*) as visits
        FROM events 
        WHERE event_name = 'page_view' AND timestamp >= ?
        GROUP BY page 
        ORDER BY visits DESC 
        LIMIT 5
      `, [Date.now() - (days * 24 * 60 * 60 * 1000)]).catch(() => []),
      
      // Recent errors
      analyticsDB.allQuery(`
        SELECT properties, timestamp
        FROM events 
        WHERE event_name = 'error_occurred' AND timestamp >= ?
        ORDER BY timestamp DESC 
        LIMIT 5
      `, [Date.now() - (days * 24 * 60 * 60 * 1000)]).catch(() => [])
    ]);

    console.log('[ADMIN] Summary data received:', {
      basicMetrics: !!summary.sessions,
      tokenMetrics: !!summary.tokens,
      parsingMetrics: !!summary.parsing,
      costMetrics: !!summary.costs
    });

    // Generate enhanced HTML dashboard
    const html = generateDashboardHTML(summary, recentEvents, popularEvents, errorEvents, days);
    res.send(html);
    
  } catch (error) {
    console.error('[ADMIN] Dashboard error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dashboard Error - AI Interview Coach</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; }
          .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h2>🎯 AI Interview Coach - Dashboard Error</h2>
        <div class="error">
          <h3>Unable to load analytics dashboard</h3>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><a href="?password=${req.query.password}&init=true">Try to initialize database</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * Generate HTML for enhanced analytics dashboard
 */
function generateDashboardHTML(summary, recentEvents, popularPages, errors, days) {
  const formatNumber = (num) => num ? parseFloat(num).toLocaleString() : '0';
  const formatDate = (timestamp) => new Date(timestamp).toLocaleString();
  const formatCost = (cents) => `$${(cents / 100).toFixed(4)}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Analytics Dashboard - AI Interview Coach</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      margin: 0; padding: 20px; background: #f5f5f5; 
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; 
    }
    .metrics-grid { 
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
      gap: 15px; margin-bottom: 30px; 
    }
    .metric-card { 
      background: white; padding: 20px; border-radius: 10px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center;
    }
    .metric-number { 
      font-size: 1.8em; font-weight: bold; color: #667eea; margin-bottom: 5px; 
    }
    .metric-label { color: #666; font-size: 0.85em; }
    .metric-change { font-size: 0.75em; margin-top: 5px; }
    .metric-change.positive { color: #28a745; }
    .metric-change.negative { color: #dc3545; }
    .section { 
      background: white; padding: 20px; border-radius: 10px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; 
    }
    .section h3 { margin-top: 0; color: #333; display: flex; align-items: center; gap: 8px; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .three-column { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    .status-good { color: #28a745; font-weight: bold; }
    .status-warning { color: #ffc107; font-weight: bold; }
    .status-bad { color: #dc3545; font-weight: bold; }
    .progress-bar { 
      width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; 
    }
    .progress-fill { height: 100%; background: #667eea; transition: width 0.3s ease; }
    .refresh-btn { 
      background: #667eea; color: white; padding: 10px 20px; 
      border: none; border-radius: 5px; cursor: pointer; margin-left: 10px; 
    }
    .period-selector { margin-bottom: 20px; }
    .period-selector select { padding: 8px; border-radius: 5px; border: 1px solid #ddd; }
    .error-item { 
      background: #fff5f5; border-left: 4px solid #dc3545; 
      padding: 10px; margin: 5px 0; border-radius: 5px; 
    }
    .empty-state { 
      text-align: center; padding: 40px; color: #666; 
      background: #f8f9fa; border-radius: 10px; margin: 20px 0; 
    }
    .cost-free { color: #28a745; font-weight: bold; }
    .quality-excellent { color: #28a745; }
    .quality-good { color: #ffc107; }
    .quality-poor { color: #dc3545; }
    @media (max-width: 768px) {
      .two-column, .three-column { grid-template-columns: 1fr; }
      .metrics-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎯 AI Interview Coach - Enhanced Analytics Dashboard</h1>
      <p>Complete system insights: Usage, Performance, Quality & Costs</p>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>Last ${days} days • Enhanced tracking active</span>
        <span>Updated: ${new Date().toLocaleString()}</span>
      </div>
    </div>

    <!-- Period Selector -->
    <div class="period-selector">
      <label>Time Period: </label>
      <select onchange="window.location.href='?password=${process.env.ANALYTICS_ADMIN_PASSWORD || 'admin123'}&days=' + this.value">
        <option value="1" ${days === 1 ? 'selected' : ''}>Last 24 hours</option>
        <option value="7" ${days === 7 ? 'selected' : ''}>Last 7 days</option>
        <option value="30" ${days === 30 ? 'selected' : ''}>Last 30 days</option>
      </select>
      <button class="refresh-btn" onclick="window.location.reload()">🔄 Refresh</button>
    </div>

    <!-- Key Metrics Grid -->
    <div class="metrics-grid">
      <!-- Basic Metrics -->
      <div class="metric-card">
        <div class="metric-number">${formatNumber(summary.sessions?.total_sessions)}</div>
        <div class="metric-label">Total Sessions</div>
      </div>
      <div class="metric-card">
        <div class="metric-number">${formatNumber(summary.generations?.total_generations)}</div>
        <div class="metric-label">Questions Generated</div>
      </div>
      <div class="metric-card">
        <div class="metric-number">${summary.success_rate}%</div>
        <div class="metric-label">Success Rate</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${summary.success_rate}%"></div>
        </div>
      </div>
      
      <!-- Token Metrics -->
      ${summary.tokens ? `
      <div class="metric-card">
        <div class="metric-number">${formatNumber(summary.tokens.total_tokens)}</div>
        <div class="metric-label">Total Tokens</div>
      </div>
      <div class="metric-card">
        <div class="metric-number">${formatNumber(summary.tokens.avg_tokens_per_request)}</div>
        <div class="metric-label">Avg Tokens/Request</div>
      </div>
      ` : ''}
      
      <!-- Parsing Metrics -->
      ${summary.parsing ? `
      <div class="metric-card">
        <div class="metric-number">${summary.parsing.success_rate}%</div>
        <div class="metric-label">Parsing Success</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${summary.parsing.success_rate}%"></div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-number">${summary.parsing.avg_quality_score}</div>
        <div class="metric-label">Avg Quality Score</div>
      </div>
      ` : ''}
      
      <!-- Cost Metrics -->
      ${summary.costs ? `
      <div class="metric-card">
        <div class="metric-number cost-free">${formatCost(summary.costs.total_cost_cents)}</div>
        <div class="metric-label">Total Cost</div>
        <div class="metric-change">Free model in use 🎉</div>
      </div>
      ` : ''}
      
      <!-- Performance -->
      <div class="metric-card">
        <div class="metric-number">${formatNumber(summary.generations?.avg_response_time)}ms</div>
        <div class="metric-label">Avg Response Time</div>
      </div>
    </div>

    <!-- Enhanced Analytics Sections -->
    <div class="two-column">
      <!-- Token Usage Analysis -->
      ${summary.tokens ? `
      <div class="section">
        <h3>🪙 Token Usage Analysis</h3>
        <table>
          <tr>
            <td><strong>Total Requests:</strong></td>
            <td>${formatNumber(summary.tokens.total_requests)}</td>
          </tr>
          <tr>
            <td><strong>Input Tokens:</strong></td>
            <td>${formatNumber(summary.tokens.total_input_tokens)}</td>
          </tr>
          <tr>
            <td><strong>Output Tokens:</strong></td>
            <td>${formatNumber(summary.tokens.total_output_tokens)}</td>
          </tr>
          <tr>
            <td><strong>Avg Response Time:</strong></td>
            <td>${summary.tokens.avg_response_time}ms</td>
          </tr>
        </table>
      </div>
      ` : `
      <div class="section">
        <h3>🪙 Token Usage Analysis</h3>
        <div class="empty-state">
          <h4>No token data yet</h4>
          <p>Generate some questions to see token usage analytics.</p>
        </div>
      </div>
      `}

      <!-- Parsing Quality Analysis -->
      ${summary.parsing ? `
      <div class="section">
        <h3>🔍 Parsing Quality Analysis</h3>
        <table>
          <tr>
            <td><strong>Total Attempts:</strong></td>
            <td>${formatNumber(summary.parsing.total_attempts)}</td>
          </tr>
          <tr>
            <td><strong>Successful:</strong></td>
            <td>${formatNumber(summary.parsing.successful_attempts)}</td>
          </tr>
          <tr>
            <td><strong>Success Rate:</strong></td>
            <td class="${summary.parsing.success_rate > 95 ? 'status-good' : summary.parsing.success_rate > 80 ? 'status-warning' : 'status-bad'}">${summary.parsing.success_rate}%</td>
          </tr>
          <tr>
            <td><strong>Avg Quality Score:</strong></td>
            <td class="${summary.parsing.avg_quality_score > 85 ? 'quality-excellent' : summary.parsing.avg_quality_score > 70 ? 'quality-good' : 'quality-poor'}">${summary.parsing.avg_quality_score}/100</td>
          </tr>
          <tr>
            <td><strong>Avg Questions/Response:</strong></td>
            <td>${summary.parsing.avg_questions_per_response}</td>
          </tr>
          <tr>
            <td><strong>Responses with Errors:</strong></td>
            <td>${formatNumber(summary.parsing.responses_with_errors)}</td>
          </tr>
        </table>
      </div>
      ` : `
      <div class="section">
        <h3>🔍 Parsing Quality Analysis</h3>
        <div class="empty-state">
          <h4>No parsing data yet</h4>
          <p>Generate some questions to see parsing quality analytics.</p>
        </div>
      </div>
      `}
    </div>

    <!-- Popular Events -->
    <div class="section">
      <h3>📊 Popular Events</h3>
      ${recentEvents.length === 0 ? `
        <div class="empty-state">
          <h4>No events recorded yet</h4>
          <p>Start using the application to see analytics data here.</p>
        </div>
      ` : `
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Count</th>
              <th>Last Occurrence</th>
            </tr>
          </thead>
          <tbody>
            ${recentEvents.map(event => `
              <tr>
                <td>${event.event_name}</td>
                <td>${formatNumber(event.count)}</td>
                <td>${formatDate(event.last_occurrence)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>

    <!-- System Health -->
    <div class="section">
      <h3>💚 System Health & Performance</h3>
      <div class="three-column">
        <div>
          <h4>Database Status</h4>
          <p><strong>Connection:</strong> <span class="status-good">✅ Connected</span></p>
          <p><strong>Enhanced Analytics:</strong> <span class="status-good">✅ Active</span></p>
          <p><strong>Total Records:</strong> ${formatNumber(summary.events?.total_events)} events</p>
        </div>
        <div>
          <h4>Performance Metrics</h4>
          <p><strong>Success Rate:</strong> 
            <span class="${summary.success_rate > 95 ? 'status-good' : summary.success_rate > 80 ? 'status-warning' : 'status-bad'}">
              ${summary.success_rate}%
            </span>
          </p>
          ${summary.parsing ? `
          <p><strong>Parsing Quality:</strong> 
            <span class="${summary.parsing.avg_quality_score > 85 ? 'status-good' : summary.parsing.avg_quality_score > 70 ? 'status-warning' : 'status-bad'}">
              ${summary.parsing.avg_quality_score}/100
            </span>
          </p>
          ` : ''}
          <p><strong>Avg Response Time:</strong> ${formatNumber(summary.generations?.avg_response_time)}ms</p>
        </div>
        <div>
          <h4>Usage Statistics</h4>
          <p><strong>Total Sessions:</strong> ${formatNumber(summary.sessions?.total_sessions)}</p>
          <p><strong>Mobile Users:</strong> ${formatNumber(summary.sessions?.mobile_sessions)}</p>
          ${summary.tokens ? `<p><strong>Total Tokens:</strong> ${formatNumber(summary.tokens.total_tokens)}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Recent Errors -->
    <div class="section">
      <h3>🚨 Recent Errors</h3>
      ${errors.length === 0 ? '<p class="status-good">No errors in the selected period! 🎉</p>' : ''}
      ${errors.map(error => {
        const props = JSON.parse(error.properties);
        return `
          <div class="error-item">
            <strong>${formatDate(error.timestamp)}</strong><br>
            <strong>Error:</strong> ${props.error_message || 'Unknown error'}<br>
            <strong>Context:</strong> ${JSON.stringify(props.context || {})}<br>
          </div>
        `;
      }).join('')}
    </div>
  </div>

  <script>
    // Auto-refresh every 5 minutes
    setTimeout(() => window.location.reload(), 5 * 60 * 1000);
  </script>
</body>
</html>`;
}

module.exports = router;