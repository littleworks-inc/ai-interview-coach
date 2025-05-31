// ==========================================
// AI Interview Coach - Frontend Environment Configuration
// ==========================================

const environments = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    ANALYTICS_ENABLED: true,
    ANALYTICS_BATCH_INTERVAL: 30000, // 30 seconds
    ANALYTICS_MAX_QUEUE_SIZE: 50,
    DEBUG_MODE: true,
    ENVIRONMENT: 'development',
    REQUEST_TIMEOUT: 90000, // 90 seconds
    VALIDATION_DEBOUNCE_DELAY: 800, // 800ms
    FEATURES: {
      RESUME_ANALYSIS: true,
      PRACTICE_MODE: false,
      ADVANCED_ANALYTICS: true
    }
  },

  staging: {
    API_BASE_URL: 'https://staging-api.aiinterviewcoach.com',
    ANALYTICS_ENABLED: true,
    ANALYTICS_BATCH_INTERVAL: 15000, // 15 seconds - more frequent for testing
    ANALYTICS_MAX_QUEUE_SIZE: 100,
    DEBUG_MODE: true, // Keep debug on for staging
    ENVIRONMENT: 'staging',
    REQUEST_TIMEOUT: 60000, // 60 seconds
    VALIDATION_DEBOUNCE_DELAY: 500, // Faster validation for testing
    FEATURES: {
      RESUME_ANALYSIS: true,
      PRACTICE_MODE: true, // Enable beta features in staging
      ADVANCED_ANALYTICS: true
    }
  },

  production: {
    API_BASE_URL: 'https://api.aiinterviewcoach.com',
    ANALYTICS_ENABLED: true,
    ANALYTICS_BATCH_INTERVAL: 30000, // 30 seconds
    ANALYTICS_MAX_QUEUE_SIZE: 50,
    DEBUG_MODE: false,
    ENVIRONMENT: 'production',
    REQUEST_TIMEOUT: 90000, // 90 seconds
    VALIDATION_DEBOUNCE_DELAY: 800, // 800ms
    FEATURES: {
      RESUME_ANALYSIS: true,
      PRACTICE_MODE: false, // Disable until fully tested
      ADVANCED_ANALYTICS: true
    }
  },

  // Special environment for testing
  test: {
    API_BASE_URL: 'http://localhost:3001', // Different port for test server
    ANALYTICS_ENABLED: false, // Disable analytics in tests
    ANALYTICS_BATCH_INTERVAL: 1000,
    ANALYTICS_MAX_QUEUE_SIZE: 10,
    DEBUG_MODE: true,
    ENVIRONMENT: 'test',
    REQUEST_TIMEOUT: 5000, // Short timeout for tests
    VALIDATION_DEBOUNCE_DELAY: 100, // Fast validation for tests
    FEATURES: {
      RESUME_ANALYSIS: true,
      PRACTICE_MODE: true,
      ADVANCED_ANALYTICS: false
    }
  }
};

// Validation function to ensure all required keys are present
function validateEnvironment(envName, config) {
  const requiredKeys = [
    'API_BASE_URL', 'ANALYTICS_ENABLED', 'ANALYTICS_BATCH_INTERVAL',
    'DEBUG_MODE', 'ENVIRONMENT', 'REQUEST_TIMEOUT'
  ];
  
  const missing = requiredKeys.filter(key => config[key] === undefined);
  
  if (missing.length > 0) {
    throw new Error(`Environment '${envName}' is missing required keys: ${missing.join(', ')}`);
  }
  
  // Validate URL format
  try {
    new URL(config.API_BASE_URL);
  } catch (error) {
    throw new Error(`Environment '${envName}' has invalid API_BASE_URL: ${config.API_BASE_URL}`);
  }
  
  return true;
}

// Validate all environments on load
Object.entries(environments).forEach(([name, config]) => {
  validateEnvironment(name, config);
});

module.exports = environments;