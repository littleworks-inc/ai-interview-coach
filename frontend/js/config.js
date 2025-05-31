// ==========================================
// AI Interview Coach - Runtime Configuration
// Auto-generated for environment: development
// Build timestamp: 2025-05-31T14:44:47.786Z
// ==========================================

window.APP_CONFIG = {
  "API_BASE_URL": "http://localhost:3000",
  "ANALYTICS_ENABLED": true,
  "ANALYTICS_BATCH_INTERVAL": 30000,
  "ANALYTICS_MAX_QUEUE_SIZE": 50,
  "DEBUG_MODE": true,
  "ENVIRONMENT": "development",
  "REQUEST_TIMEOUT": 90000,
  "VALIDATION_DEBOUNCE_DELAY": 800,
  "FEATURES": {
    "RESUME_ANALYSIS": true,
    "PRACTICE_MODE": false,
    "ADVANCED_ANALYTICS": true
  },
  "BUILD_TIMESTAMP": "2025-05-31T14:44:47.786Z",
  "BUILD_ENVIRONMENT": "development"
};

// Configuration helper functions
window.APP_CONFIG.getApiUrl = function(endpoint) {
  return this.API_BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
};

window.APP_CONFIG.isFeatureEnabled = function(featureName) {
  return this.FEATURES && this.FEATURES[featureName] === true;
};

window.APP_CONFIG.log = function(...args) {
  if (this.DEBUG_MODE) {
    console.log('[APP CONFIG]', ...args);
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.APP_CONFIG;
}

// Development helper - log configuration on load
if (window.APP_CONFIG.DEBUG_MODE) {
  console.log('[APP CONFIG] Configuration loaded for environment:', window.APP_CONFIG.ENVIRONMENT);
  console.log('[APP CONFIG] API Base URL:', window.APP_CONFIG.API_BASE_URL);
  console.log('[APP CONFIG] Features:', window.APP_CONFIG.FEATURES);
  console.log('[APP CONFIG] Build timestamp:', window.APP_CONFIG.BUILD_TIMESTAMP);
}
