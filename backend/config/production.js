// ==========================================
// AI Interview Coach - Production Environment Configuration
// ==========================================

module.exports = {
  // Production server settings
  server: {
    host: process.env.HOST || '0.0.0.0',
    timeout: 30000 // Standard timeout for production
  },
  
  // Production API settings
  api: {
    baseUrl: process.env.API_BASE_URL, // Must be set via environment variable
    timeout: 30000
  },
  
  // Production AI settings
  ai: {
    timeout: 90000, // 90 seconds for production
    maxRetries: 3 // More retries for reliability
  },
  
  // Production database settings
  database: {
    path: process.env.DB_PATH || process.env.DATABASE_URL, // Support both file and URL
    connectionTimeout: 5000, // Faster timeout for production
    maxConnections: 20 // More connections for production load
  },
  
  // Production security settings (strict)
  security: {
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [],
    rateLimitWindow: 900000, // 15 minutes
    rateLimitMax: 100, // Conservative limit
    aiRateLimitWindow: 60000, // 1 minute
    aiRateLimitMax: 5, // Strict AI rate limiting
    enableHelmet: true, // Full security headers
    trustProxy: true // Behind reverse proxy in production
  },
  
  // Production frontend settings
  frontend: {
    apiUrl: process.env.FRONTEND_API_URL || process.env.API_BASE_URL,
    analyticsEnabled: true,
    debugMode: false, // No debug mode in production
    environment: 'production'
  },
  
  // Production analytics settings
  analytics: {
    enabled: true,
    adminPassword: process.env.ANALYTICS_ADMIN_PASSWORD, // Must be set
    retentionDays: 90, // Standard retention
    batchSize: 100 // Optimal batch size
  },
  
  // Production logging settings
  logging: {
    level: 'info', // Info level for production
    enableFileLogging: true, // File logging for production
    logPath: process.env.LOG_PATH || '/var/log/ai-interview-coach',
    maxLogFiles: 10,
    maxLogSize: '50MB'
  },
  
  // Production app settings
  app: {
    name: 'AI Interview Coach',
    description: 'Professional interview preparation platform',
    homepage: process.env.APP_HOMEPAGE || 'https://ai-interview-coach.com'
  },
  
  // Production-specific features (restrictive)
  features: {
    enableTestRoutes: false, // No test routes in production
    enableMockData: false, // No mock data
    enableConfigEndpoint: false, // No config exposure
    enableDetailedErrors: false, // Generic error messages
    enableHotReload: false, // No hot reload
    enableCORS: true, // CORS with restrictions
    enableRequestLogging: false // Minimal logging for performance
  },
  
  // Production monitoring
  monitoring: {
    enableHealthChecks: true, // Health check endpoints
    enableMetrics: true, // Performance metrics
    enableAlerting: true, // Error alerting
    enableUptime: true, // Uptime monitoring
    metricsEndpoint: '/metrics', // Prometheus metrics endpoint
    healthEndpoint: '/health' // Health check endpoint
  },
  
  // Production performance settings
  performance: {
    enableCompression: true, // Enable gzip compression
    enableCaching: true, // Enable response caching
    cacheTTL: 300, // 5 minutes cache TTL
    enableConnectionPooling: true, // Database connection pooling
    maxConcurrentRequests: 1000, // Maximum concurrent requests
    requestTimeout: 30000 // Request timeout
  },
  
  // Production backup settings
  backup: {
    enableAutomaticBackup: true,
    backupInterval: '0 2 * * *', // Daily at 2 AM
    backupRetentionDays: 30,
    backupPath: process.env.BACKUP_PATH || '/var/backups/ai-interview-coach'
  }
};