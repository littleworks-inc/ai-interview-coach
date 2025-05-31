// ==========================================
// AI Interview Coach - Development Environment Configuration
// ==========================================

module.exports = {
  // Development-specific server settings
  server: {
    host: '0.0.0.0', // Allow external connections for testing
    timeout: 45000 // Longer timeout for debugging
  },
  
  // Development API settings
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 45000 // Longer timeout for development
  },
  
  // Development AI settings
  ai: {
    timeout: 120000, // 2 minutes for development/testing
    maxRetries: 1 // Fewer retries in development
  },
  
  // Development database settings
  database: {
    path: process.env.DB_PATH || './database/analytics-dev.db',
    connectionTimeout: 10000, // Longer timeout for development
    maxConnections: 5 // Fewer connections in development
  },
  
  // Development security settings (more permissive)
  security: {
    corsOrigins: [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'http://localhost:5500', // Live Server
      'http://127.0.0.1:5500'  // Live Server
    ],
    rateLimitWindow: 60000, // 1 minute
    rateLimitMax: 200, // More requests allowed
    aiRateLimitWindow: 60000, // 1 minute
    aiRateLimitMax: 20, // More AI requests for testing
    enableHelmet: false, // Disabled for easier debugging
    trustProxy: false
  },
  
  // Development frontend settings
  frontend: {
    apiUrl: process.env.FRONTEND_API_URL || 'http://localhost:3000',
    analyticsEnabled: true,
    debugMode: true, // Enable debug mode
    environment: 'development'
  },
  
  // Development analytics settings
  analytics: {
    enabled: true,
    adminPassword: process.env.ANALYTICS_ADMIN_PASSWORD || 'dev123',
    retentionDays: 30, // Shorter retention in development
    batchSize: 50 // Smaller batches for easier debugging
  },
  
  // Development logging settings
  logging: {
    level: 'debug', // Verbose logging
    enableFileLogging: false, // Console only in development
    logPath: './logs/dev'
  },
  
  // Development app settings
  app: {
    name: 'AI Interview Coach (Development)',
    description: 'Development instance of AI Interview Coach'
  },
  
  // Development-specific features
  features: {
    enableTestRoutes: true, // Enable test endpoints
    enableMockData: true, // Allow mock data generation
    enableConfigEndpoint: true, // Expose config endpoint for debugging
    enableDetailedErrors: true, // Show detailed error messages
    enableHotReload: true, // Enable hot reload features
    enableCORS: true, // Enable permissive CORS
    enableRequestLogging: true // Log all requests
  },
  
  // Development tools configuration
  devTools: {
    enableSwagger: true, // API documentation
    enableMetrics: true, // Performance metrics
    enableProfiler: false, // CPU profiling (can be enabled if needed)
    enableMemoryMonitoring: false // Memory monitoring
  }
};