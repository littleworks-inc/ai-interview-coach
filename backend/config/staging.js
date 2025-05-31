// ==========================================
// AI Interview Coach - Staging Environment Configuration
// ==========================================

module.exports = {
  // Staging server settings (production-like but more permissive)
  server: {
    host: process.env.HOST || '0.0.0.0',
    timeout: 35000 // Slightly longer timeout for testing
  },
  
  // Staging API settings
  api: {
    baseUrl: process.env.API_BASE_URL, // Must be set for staging
    timeout: 35000
  },
  
  // Staging AI settings
  ai: {
    timeout: 90000, // Same as production
    maxRetries: 2 // Fewer retries than production for faster feedback
  },
  
  // Staging database settings
  database: {
    path: process.env.DB_PATH || process.env.STAGING_DATABASE_URL,
    connectionTimeout: 7000, // Moderate timeout
    maxConnections: 10 // Moderate connection pool
  },
  
  // Staging security settings (moderate)
  security: {
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
      'https://staging.ai-interview-coach.com',
      'https://staging-frontend.ai-interview-coach.com'
    ],
    rateLimitWindow: 600000, // 10 minutes
    rateLimitMax: 150, // More lenient than production
    aiRateLimitWindow: 60000, // 1 minute
    aiRateLimitMax: 10, // More AI requests for testing
    enableHelmet: true, // Enable security headers
    trustProxy: true // Behind reverse proxy
  },
  
  // Staging frontend settings
  frontend: {
    apiUrl: process.env.FRONTEND_API_URL || process.env.API_BASE_URL,
    analyticsEnabled: true,
    debugMode: true, // Enable debug mode for testing
    environment: 'staging'
  },
  
  // Staging analytics settings
  analytics: {
    enabled: true,
    adminPassword: process.env.ANALYTICS_ADMIN_PASSWORD || 'staging123',
    retentionDays: 60, // Medium retention
    batchSize: 75 // Medium batch size
  },
  
  // Staging logging settings
  logging: {
    level: 'debug', // Verbose logging for debugging
    enableFileLogging: true, // File logging enabled
    logPath: process.env.LOG_PATH || '/var/log/ai-interview-coach-staging',
    maxLogFiles: 5,
    maxLogSize: '20MB'
  },
  
  // Staging app settings
  app: {
    name: 'AI Interview Coach (Staging)',
    description: 'Staging environment for AI Interview Coach',
    homepage: process.env.APP_HOMEPAGE || 'https://staging.ai-interview-coach.com'
  },
  
  // Staging-specific features (testing-friendly)
  features: {
    enableTestRoutes: true, // Enable test routes for QA
    enableMockData: true, // Allow mock data for testing
    enableConfigEndpoint: true, // Allow config inspection
    enableDetailedErrors: true, // Detailed errors for debugging
    enableHotReload: false, // No hot reload in staging
    enableCORS: true, // CORS enabled with restrictions
    enableRequestLogging: true // Enable for debugging
  },
  
  // Staging testing configuration
  testing: {
    enableTestEndpoints: true, // Special endpoints for testing
    allowDataReset: true, // Allow resetting test data
    enableMockAI: false, // Use real AI but allow mocking
    testDataRetentionDays: 7, // Clean up test data weekly
    enablePerformanceTesting: true // Allow performance testing
  },
  
  // Staging monitoring (production-like)
  monitoring: {
    enableHealthChecks: true,
    enableMetrics: true,
    enableAlerting: false, // No alerts in staging
    enableUptime: true,
    metricsEndpoint: '/metrics',
    healthEndpoint: '/health'
  },
  
  // Staging performance settings (production-like but more relaxed)
  performance: {
    enableCompression: true,
    enableCaching: false, // Disable caching for testing
    cacheTTL: 60, // Short cache for testing
    enableConnectionPooling: true,
    maxConcurrentRequests: 500, // Lower than production
    requestTimeout: 35000
  },
  
  // Staging deployment settings
  deployment: {
    environment: 'staging',
    autoDeployBranch: 'develop', // Auto-deploy from develop branch
    enableBlueGreen: false, // Simple deployment for staging
    healthCheckTimeout: 30000,
    rollbackOnFailure: true
  }
};