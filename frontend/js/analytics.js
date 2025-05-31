/* ==========================================
   AI Interview Coach - Analytics System
   ========================================== */

class AnalyticsManager {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.eventQueue = [];
    this.isOnline = navigator.onLine;
    
    // Use configuration for settings
    this.batchInterval = window.APP_CONFIG?.ANALYTICS_BATCH_INTERVAL || 30000;
    this.maxQueueSize = window.APP_CONFIG?.ANALYTICS_MAX_QUEUE_SIZE || 50;
    this.apiEndpoint = window.APP_CONFIG?.getApiUrl ? 
      window.APP_CONFIG.getApiUrl('/api/analytics') : 
      'http://localhost:3000/api/analytics';
    this.enabled = window.APP_CONFIG?.ANALYTICS_ENABLED !== false;
    
    if (this.enabled) {
      this.init();
      window.APP_CONFIG?.log('Analytics initialized for environment:', window.APP_CONFIG.ENVIRONMENT);
    } else if (window.APP_CONFIG?.DEBUG_MODE) {
      console.log('[ANALYTICS] Disabled by configuration');
    }
  }

  /**
   * Initialize analytics system
   */
  init() {
    this.setupEventListeners();
    this.startBatchProcessor();
    this.trackPageView();
    
    console.log('[ANALYTICS] Initialized with session:', this.sessionId);
  }

  /**
   * Get or create anonymous session ID
   */
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('ai_coach_session_id');
    
    if (!sessionId) {
      // Generate cryptographically secure session ID
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      sessionId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      localStorage.setItem('ai_coach_session_id', sessionId);
      localStorage.setItem('ai_coach_session_created', Date.now().toString());
    }
    
    return sessionId;
  }

  /**
   * Setup event listeners for automatic tracking
   */
  setupEventListeners() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processBatch(); // Send queued events when back online
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page unload - send remaining events
    window.addEventListener('beforeunload', () => {
      this.sendQueuedEvents(true); // Synchronous send
    });

    // Track engagement
    this.trackEngagement();
  }

  /**
   * Track basic page engagement
   */
  trackEngagement() {
    let startTime = Date.now();
    let isActive = true;

    // Track time on page
    const trackTimeSpent = () => {
      if (isActive) {
        const timeSpent = Date.now() - startTime;
        this.track('page_engagement', {
          time_spent_ms: timeSpent,
          is_mobile: this.isMobile()
        });
      }
    };

    // Track when user becomes inactive/active
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackTimeSpent();
        isActive = false;
      } else {
        startTime = Date.now();
        isActive = true;
      }
    });

    // Track time spent every 30 seconds for active users
    setInterval(() => {
      if (isActive && !document.hidden) {
        const timeSpent = Date.now() - startTime;
        if (timeSpent > 30000) { // Only track if user has been active for 30+ seconds
          this.track('engagement_heartbeat', {
            time_spent_ms: timeSpent,
            page: window.location.pathname
          });
          startTime = Date.now(); // Reset counter
        }
      }
    }, 30000);
  }

  /**
   * Track an event
   */
  track(eventName, properties = {}) {
    const event = {
      session_id: this.sessionId,
      event_name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        page: window.location.pathname,
        user_agent: navigator.userAgent.substring(0, 100), // Truncated for privacy
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    this.addToQueue(event);
    console.log('[ANALYTICS] Event tracked:', eventName, properties);
  }

  /**
   * Track page view
   */
  trackPageView() {
    this.track('page_view', {
      referrer: document.referrer || 'direct',
      is_mobile: this.isMobile(),
      session_start: this.isNewSession()
    });
  }

  /**
   * Add event to queue
   */
  addToQueue(event) {
    this.eventQueue.push(event);
    
    // Prevent queue from growing too large
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue = this.eventQueue.slice(-this.maxQueueSize);
    }
  }

  /**
   * Start batch processor
   */
  startBatchProcessor() {
    setInterval(() => {
      if (this.eventQueue.length > 0 && this.isOnline) {
        this.processBatch();
      }
    }, this.batchInterval);
  }

  /**
   * Process event batch
   */
  async processBatch() {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = []; // Clear queue

    try {
      await this.sendEvents(eventsToSend);
      console.log('[ANALYTICS] Batch sent successfully:', eventsToSend.length, 'events');
    } catch (error) {
      console.warn('[ANALYTICS] Batch send failed, re-queuing events:', error.message);
      // Re-queue events at the beginning
      this.eventQueue = [...eventsToSend, ...this.eventQueue];
    }
  }

  /**
   * Send events to backend
   */
  async sendEvents(events, isSync = false) {
    const payload = {
      events: events,
      batch_id: this.generateBatchId(),
      session_info: {
        session_id: this.sessionId,
        session_created: localStorage.getItem('ai_coach_session_created'),
        total_events: events.length
      }
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };

    if (isSync) {
      // Synchronous request for page unload
      navigator.sendBeacon(this.apiEndpoint, JSON.stringify(payload));
    } else {
      const response = await fetch(this.apiEndpoint, requestOptions);
      
      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
    }
  }

  /**
   * Send queued events immediately
   */
  sendQueuedEvents(isSync = false) {
    if (this.eventQueue.length > 0) {
      const events = [...this.eventQueue];
      this.eventQueue = [];
      this.sendEvents(events, isSync);
    }
  }

  /**
   * Utility functions
   */
  generateBatchId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  isNewSession() {
    const created = localStorage.getItem('ai_coach_session_created');
    return created ? (Date.now() - parseInt(created)) < 60000 : true; // New if created < 1 minute ago
  }

  /**
   * Public API for manual tracking
   */
  /**
 * Enhanced question generation tracking with tokens and parsing
 */
trackQuestionGeneration(success, details = {}) {
  this.track('question_generation', {
    success: success,
    job_description_length: details.jobDescriptionLength || 0,
    question_count: details.questionCount || 0,
    response_time_ms: details.responseTime || 0,
    error: details.error || null,
    
    // Token tracking
    input_tokens: details.inputTokens || 0,
    output_tokens: details.outputTokens || 0,
    total_tokens: details.totalTokens || 0,
    
    // Parsing analytics
    parsing_successful: details.parsingSuccessful || false,
    quality_score: details.qualityScore || 0,
    malformed_questions: details.malformedQuestions || 0,
    
    // Request metadata
    request_id: details.requestId || '',
    model_name: details.model || '',
    raw_response_length: details.rawResponseLength || 0
  });
}

/**
 * Track detailed token usage
 */
trackTokenUsage(details = {}) {
  this.track('token_usage', {
    request_id: details.requestId || '',
    session_id: this.sessionId,
    
    // Input tokens
    input_tokens: details.inputTokens || 0,
    input_characters: details.inputCharacters || 0,
    job_description_length: details.jobDescriptionLength || 0,
    
    // Output tokens
    output_tokens: details.outputTokens || 0,
    output_characters: details.outputCharacters || 0,
    questions_generated: details.questionsGenerated || 0,
    
    // Total usage
    total_tokens: details.totalTokens || 0,
    
    // Cost and performance
    estimated_cost_cents: details.estimatedCostCents || 0,
    model_name: details.modelName || '',
    response_time_ms: details.responseTimeMs || 0
  });
}

/**
 * Track parsing attempts and results
 */
trackParsingAnalytics(details = {}) {
  this.track('parsing_analytics', {
    request_id: details.requestId || '',
    session_id: this.sessionId,
    
    // Parsing results
    parsing_attempted: details.parsingAttempted !== false, // default true
    parsing_successful: details.parsingSuccessful || false,
    
    // Response quality
    raw_response_length: details.rawResponseLength || 0,
    questions_found: details.questionsFound || 0,
    questions_with_answers: details.questionsWithAnswers || 0,
    malformed_questions: details.malformedQuestions || 0,
    
    // Quality metrics
    quality_score: details.qualityScore || 0,
    parsing_errors: details.parsingErrors || [],
    warning_flags: details.warningFlags || [],
    
    // Structure analysis
    has_proper_format: details.hasProperFormat || false,
    has_question_markers: details.hasQuestionMarkers || false,
    has_answer_sections: details.hasAnswerSections || false
  });
}

/**
 * Track cost and usage alerts
 */
trackUsageAlert(alertType, threshold, currentValue, details = {}) {
  this.track('usage_alert', {
    alert_type: alertType, // 'DAILY_COST', 'DAILY_TOKENS', 'PARSING_FAILURE_RATE'
    threshold_value: threshold,
    current_value: currentValue,
    details: details
  });
}

  trackCopyAction(type, details = {}) {
    this.track('copy_action', {
      copy_type: type, // 'single_qa', 'all_questions'
      question_number: details.questionNumber || null,
      total_questions: details.totalQuestions || 0
    });
  }

  trackExampleUsage(exampleType) {
    this.track('example_usage', {
      example_type: exampleType
    });
  }

  trackError(error, context = {}) {
    this.track('error_occurred', {
      error_message: error.message || error,
      error_type: error.name || 'unknown',
      context: context,
      stack_trace: error.stack ? error.stack.substring(0, 500) : null
    });
  }

  trackFeedback(type, rating, details = {}) {
    this.track('user_feedback', {
      feedback_type: type, // 'question_quality', 'answer_quality', 'general'
      rating: rating, // 1-5 or true/false
      details: details
    });
  }
}



// Initialize analytics
const analytics = new AnalyticsManager();

// Make analytics available globally
window.aiCoachAnalytics = analytics;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsManager;
}