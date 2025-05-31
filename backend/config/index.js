// ==========================================
// AI Interview Coach - Main Configuration Loader
// ==========================================

require('dotenv').config();
const { validateConfig } = require('./validation');

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment-specific configuration
let envConfig = {};
try {
  envConfig = require(`./${NODE_ENV}.js`);
} catch (error) {
  console.warn(`[CONFIG] No environment config found for ${NODE_ENV}, using defaults`);
  envConfig = require('./development.js');
}

// Base configuration that applies to all environments
const baseConfig = {
  // Environment info
  env: NODE_ENV,
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  isStaging: NODE_ENV === 'staging',
  
  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000,
    bodyLimit: process.env.BODY_LIMIT || '50kb'
  },
  
  // API configuration
  api: {
    baseUrl: process.env.API_BASE_URL || `http://localhost:${parseInt(process.env.PORT) || 3000}`,
    version: process.env.API_VERSION || 'v1',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000
  },
  
  // AI Service configuration
  ai: {
    provider: process.env.AI_PROVIDER || 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultModel: process.env.DEFAULT_AI_MODEL || 'qwen/qwen3-30b-a3b:free',
    timeout: parseInt(process.env.AI_TIMEOUT) || 90000,
    maxRetries: parseInt(process.env.AI_MAX_RETRIES) || 2
  },
  
  // Database configuration
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    path: process.env.DB_PATH || './database/analytics.db',
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10
  },
  
  // Security configuration
  security: {
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:8080', 'http://localhost:3000'],
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    aiRateLimitWindow: parseInt(process.env.AI_RATE_LIMIT_WINDOW) || 60000, // 1 minute
    aiRateLimitMax: parseInt(process.env.AI_RATE_LIMIT_MAX) || 5,
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    trustProxy: process.env.TRUST_PROXY === 'true'
  },
  
  // Frontend configuration (for injection)
  frontend: {
    apiUrl: process.env.FRONTEND_API_URL || process.env.API_BASE_URL || `http://localhost:${parseInt(process.env.PORT) || 3000}`,
    analyticsEnabled: process.env.FRONTEND_ANALYTICS_ENABLED !== 'false',
    debugMode: process.env.FRONTEND_DEBUG_MODE === 'true',
    environment: NODE_ENV
  },
  
  // Analytics configuration
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED !== 'false',
    adminPassword: process.env.ANALYTICS_ADMIN_PASSWORD || 'admin123',
    retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS) || 90,
    batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE) || 100
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug'),
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    logPath: process.env.LOG_PATH || './logs',
    maxLogFiles: parseInt(process.env.MAX_LOG_FILES) || 5,
    maxLogSize: process.env.MAX_LOG_SIZE || '10MB'
  },
  
  // Application metadata
  app: {
    name: process.env.APP_NAME || 'AI Interview Coach',
    version: process.env.npm_package_version || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Smart interview preparation platform',
    author: process.env.APP_AUTHOR || 'AI Interview Coach Team',
    homepage: process.env.APP_HOMEPAGE || 'https://ai-interview-coach.com'
  }
};

// Merge with environment-specific configuration
const config = {
  ...baseConfig,
  ...envConfig,
  // Deep merge nested objects
  server: { ...baseConfig.server, ...envConfig.server },
  api: { ...baseConfig.api, ...envConfig.api },
  ai: { ...baseConfig.ai, ...envConfig.ai },
  database: { ...baseConfig.database, ...envConfig.database },
  security: { ...baseConfig.security, ...envConfig.security },
  frontend: { ...baseConfig.frontend, ...envConfig.frontend },
  analytics: { ...baseConfig.analytics, ...envConfig.analytics },
  logging: { ...baseConfig.logging, ...envConfig.logging },
  app: { ...baseConfig.app, ...envConfig.app }
};

// Validate configuration
try {
  validateConfig(config);
} catch (error) {
  console.error('[CONFIG] Configuration validation failed:', error.message);
  process.exit(1);
}

// Log configuration summary (without sensitive data)
console.log('[CONFIG] Configuration loaded:', {
  environment: config.env,
  server: `${config.server.host}:${config.server.port}`,
  api: config.api.baseUrl,
  aiProvider: config.ai.provider,
  database: config.database.type,
  analyticsEnabled: config.analytics.enabled,
  corsOrigins: config.security.corsOrigins.length
});

module.exports = config;