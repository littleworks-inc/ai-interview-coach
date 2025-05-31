// ==========================================
// AI Interview Coach - Configuration Validation
// ==========================================

/**
 * Validate configuration object
 * @param {object} config - Configuration object to validate
 * @throws {Error} If validation fails
 */
function validateConfig(config) {
  const errors = [];
  
  // Validate required environment variables based on environment
  const requiredVars = getRequiredVariables(config.env);
  
  for (const [key, description] of Object.entries(requiredVars)) {
    const value = getNestedValue(config, key);
    
    if (value === undefined || value === null || value === '') {
      errors.push(`Missing required configuration: ${key} (${description})`);
    }
  }
  
  // Validate specific configuration values
  validateServerConfig(config.server, errors);
  validateAiConfig(config.ai, errors);
  validateDatabaseConfig(config.database, errors);
  validateSecurityConfig(config.security, errors);
  validateAnalyticsConfig(config.analytics, errors);
  
  // Throw error if any validation failed
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.map(err => `  - ${err}`).join('\n')}`);
  }
  
  console.log('[CONFIG] ✅ Configuration validation passed');
}

/**
 * Get required variables based on environment
 * @param {string} env - Environment name
 * @returns {object} Required variables with descriptions
 */
function getRequiredVariables(env) {
  const base = {
    'ai.apiKey': 'OpenRouter API key for AI generation',
    'server.port': 'Server port number',
    'api.baseUrl': 'API base URL for client connections'
  };
  
  const production = {
    ...base,
    'security.corsOrigins': 'Allowed CORS origins for production',
    'analytics.adminPassword': 'Admin password for analytics dashboard',
    'database.path': 'Database file path or connection string'
  };
  
  const staging = {
    ...base,
    'security.corsOrigins': 'Allowed CORS origins for staging',
    'database.path': 'Database connection for staging'
  };
  
  switch (env) {
    case 'production':
      return production;
    case 'staging':
      return staging;
    default:
      return base;
  }
}

/**
 * Get nested value from object using dot notation
 * @param {object} obj - Object to search
 * @param {string} path - Dot notation path (e.g., 'ai.apiKey')
 * @returns {any} Value at path or undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Validate server configuration
 * @param {object} serverConfig - Server configuration
 * @param {array} errors - Array to push errors to
 */
function validateServerConfig(serverConfig, errors) {
  // Validate port
  if (!Number.isInteger(serverConfig.port) || serverConfig.port < 1 || serverConfig.port > 65535) {
    errors.push('Server port must be a valid integer between 1 and 65535');
  }
  
  // Validate timeout
  if (!Number.isInteger(serverConfig.timeout) || serverConfig.timeout < 1000) {
    errors.push('Server timeout must be at least 1000ms');
  }
  
  // Validate host
  if (!serverConfig.host || typeof serverConfig.host !== 'string') {
    errors.push('Server host must be a valid string');
  }
}

/**
 * Validate AI configuration
 * @param {object} aiConfig - AI configuration
 * @param {array} errors - Array to push errors to
 */
function validateAiConfig(aiConfig, errors) {
  // Validate API key
  if (!aiConfig.apiKey || typeof aiConfig.apiKey !== 'string') {
    errors.push('AI API key is required and must be a valid string');
  } else if (aiConfig.apiKey.length < 10) {
    errors.push('AI API key appears to be too short (minimum 10 characters)');
  }
  
  // Validate provider
  const validProviders = ['openrouter', 'openai', 'anthropic'];
  if (!validProviders.includes(aiConfig.provider)) {
    errors.push(`AI provider must be one of: ${validProviders.join(', ')}`);
  }
  
  // Validate timeout
  if (!Number.isInteger(aiConfig.timeout) || aiConfig.timeout < 5000) {
    errors.push('AI timeout must be at least 5000ms');
  }
  
  // Validate max retries
  if (!Number.isInteger(aiConfig.maxRetries) || aiConfig.maxRetries < 0 || aiConfig.maxRetries > 5) {
    errors.push('AI max retries must be between 0 and 5');
  }
  
  // Validate base URL
  if (!aiConfig.baseUrl || !isValidUrl(aiConfig.baseUrl)) {
    errors.push('AI base URL must be a valid URL');
  }
}

/**
 * Validate database configuration
 * @param {object} dbConfig - Database configuration
 * @param {array} errors - Array to push errors to
 */
function validateDatabaseConfig(dbConfig, errors) {
  // Validate database type
  const validTypes = ['sqlite', 'postgresql', 'mysql'];
  if (!validTypes.includes(dbConfig.type)) {
    errors.push(`Database type must be one of: ${validTypes.join(', ')}`);
  }
  
  // Validate path/connection string
  if (!dbConfig.path || typeof dbConfig.path !== 'string') {
    errors.push('Database path/connection string is required');
  }
  
  // Validate connection timeout
  if (!Number.isInteger(dbConfig.connectionTimeout) || dbConfig.connectionTimeout < 1000) {
    errors.push('Database connection timeout must be at least 1000ms');
  }
  
  // Validate max connections
  if (!Number.isInteger(dbConfig.maxConnections) || dbConfig.maxConnections < 1) {
    errors.push('Database max connections must be at least 1');
  }
}

/**
 * Validate security configuration
 * @param {object} securityConfig - Security configuration
 * @param {array} errors - Array to push errors to
 */
function validateSecurityConfig(securityConfig, errors) {
  // Validate CORS origins
  if (!Array.isArray(securityConfig.corsOrigins)) {
    errors.push('CORS origins must be an array');
  } else {
    for (const origin of securityConfig.corsOrigins) {
      if (origin !== '*' && !isValidUrl(origin) && !isValidOriginPattern(origin)) {
        errors.push(`Invalid CORS origin: ${origin}`);
      }
    }
  }
  
  // Validate rate limit settings
  if (!Number.isInteger(securityConfig.rateLimitWindow) || securityConfig.rateLimitWindow < 60000) {
    errors.push('Rate limit window must be at least 60000ms (1 minute)');
  }
  
  if (!Number.isInteger(securityConfig.rateLimitMax) || securityConfig.rateLimitMax < 1) {
    errors.push('Rate limit max must be at least 1');
  }
  
  if (!Number.isInteger(securityConfig.aiRateLimitWindow) || securityConfig.aiRateLimitWindow < 60000) {
    errors.push('AI rate limit window must be at least 60000ms (1 minute)');
  }
  
  if (!Number.isInteger(securityConfig.aiRateLimitMax) || securityConfig.aiRateLimitMax < 1) {
    errors.push('AI rate limit max must be at least 1');
  }
}

/**
 * Validate analytics configuration
 * @param {object} analyticsConfig - Analytics configuration
 * @param {array} errors - Array to push errors to
 */
function validateAnalyticsConfig(analyticsConfig, errors) {
  // Validate admin password
  if (!analyticsConfig.adminPassword || typeof analyticsConfig.adminPassword !== 'string') {
    errors.push('Analytics admin password is required');
  } else if (analyticsConfig.adminPassword.length < 6) {
    errors.push('Analytics admin password must be at least 6 characters');
  }
  
  // Validate retention days
  if (!Number.isInteger(analyticsConfig.retentionDays) || analyticsConfig.retentionDays < 1) {
    errors.push('Analytics retention days must be at least 1');
  }
  
  // Validate batch size
  if (!Number.isInteger(analyticsConfig.batchSize) || analyticsConfig.batchSize < 1 || analyticsConfig.batchSize > 1000) {
    errors.push('Analytics batch size must be between 1 and 1000');
  }
}

/**
 * Check if string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Check if string is a valid origin pattern (for CORS)
 * @param {string} origin - Origin to validate
 * @returns {boolean} True if valid origin pattern
 */
function isValidOriginPattern(origin) {
  // Allow localhost patterns
  if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
    return true;
  }
  
  // Allow IP patterns
  if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) {
    return true;
  }
  
  // Allow wildcard subdomains
  if (/^https?:\/\/\*\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(origin)) {
    return true;
  }
  
  return false;
}

/**
 * Validate environment-specific requirements
 * @param {string} env - Environment name
 * @param {object} config - Full configuration object
 * @returns {array} Array of validation errors
 */
function validateEnvironmentSpecific(env, config) {
  const errors = [];
  
  switch (env) {
    case 'production':
      // Production-specific validations
      if (config.analytics.adminPassword === 'admin123') {
        errors.push('Production environment should not use default admin password');
      }
      
      if (config.security.corsOrigins.includes('*')) {
        errors.push('Production environment should not allow all CORS origins (*)');
      }
      
      if (config.logging.level === 'debug') {
        errors.push('Production environment should not use debug logging level');
      }
      
      break;
      
    case 'staging':
      // Staging-specific validations
      if (config.security.corsOrigins.includes('*')) {
        errors.push('Staging environment should specify explicit CORS origins');
      }
      
      break;
      
    case 'development':
      // Development-specific validations (warnings, not errors)
      if (!config.frontend.debugMode) {
        console.warn('[CONFIG] Consider enabling debug mode in development');
      }
      
      break;
  }
  
  return errors;
}

module.exports = {
  validateConfig,
  validateEnvironmentSpecific,
  getRequiredVariables
};