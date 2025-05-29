// ==========================================
// AI Interview Coach - Secure Backend Server
// ==========================================

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import our custom middleware
const { sanitizeRequestBody } = require('./middleware/sanitization');
const { validateGenerateRequest } = require('./middleware/validation');
const { 
  errorHandler, 
  notFoundHandler, 
  asyncErrorHandler,
  setupGlobalErrorHandlers 
} = require('./middleware/errorHandler');
const { RATE_LIMITS, HTTP_STATUS } = require('./utils/constants');

const tipsRouter = require('./routes/tips');

// Add this import at the top with other route imports
const analyticsRouter = require('./routes/analytics');

const adminRouter = require('./routes/admin');

// Setup global error handlers
setupGlobalErrorHandlers();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Security Middleware (Applied First)
// ==========================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false // Disable for API server
}));

// Rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.WINDOW_MS,
  max: RATE_LIMITS.GENERAL.MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.GENERAL.WINDOW_MS / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/';
  }
});

// Strict rate limiting for AI generation endpoint
const aiLimiter = rateLimit({
  windowMs: RATE_LIMITS.STRICT.WINDOW_MS,
  max: RATE_LIMITS.STRICT.MAX_REQUESTS,
  message: {
    error: 'Too many AI requests, please wait a moment before trying again.',
    code: 'AI_RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.STRICT.WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// ==========================================
// Basic Middleware
// ==========================================

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Body parser with size limits and error handling
app.use(express.json({ 
  limit: '50kb',
  type: 'application/json'
}));

// Handle JSON payload too large errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 413) {
    return res.status(413).json({
      error: 'Request too large. Please reduce the job description length.',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Job description is too long. Please keep it under 10,000 characters.',
      code: 'CONTENT_TOO_LONG'
    });
  }
  next(error);
});

app.use(express.urlencoded({ 
  extended: true, 
  limit: '50kb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ==========================================
// Routes
// ==========================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Interview Coach API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      generate: 'POST /api/generate',
      tips: 'GET /api/tips',           // NEW
      health: 'GET /health'
    }
  });
});

// Tips endpoints - NEW ADDITION
app.use('/api/tips', tipsRouter);

// Analytics endpoints - NEW
app.use('/api/analytics', analyticsRouter);

// Admin dashboard
app.use('/admin', adminRouter);

// Main AI generation endpoint with full security stack
app.post('/api/generate', 
  aiLimiter,                    // Apply strict rate limiting
  sanitizeRequestBody,          // Sanitize input
  validateGenerateRequest,      // Validate request
  asyncErrorHandler(async (req, res) => {
    try {
      // Use sanitized body for the API call
      const { model, messages } = req.sanitizedBody;
      
      console.log('[API REQUEST]', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        model: model,
        messageCount: messages.length,
        jobDescriptionLength: req.validatedJobDescription?.length || 0
      });
      
      // Make request to OpenRouter API
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.HTTP_REFERER || 'http://localhost:3000',
            'X-Title': 'AI Interview Coach'
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log('[API SUCCESS]', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        responseLength: JSON.stringify(response.data).length,
        tokensUsed: response.data.usage?.total_tokens || 'unknown'
      });
      
      // Return the AI response
      res.json(response.data);
      
    } catch (error) {
      console.error('[API ERROR]', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Let the error handler middleware deal with this
      throw error;
    }
  })
);

// ==========================================
// Error Handling Middleware (Applied Last)
// ==========================================

// Handle 404 routes
app.use(notFoundHandler);

// Main error handler
app.use(errorHandler);

// ==========================================
// Server Startup
// ==========================================

// Validate required environment variables
function validateEnvironment() {
  const required = ['OPENROUTER_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('[STARTUP ERROR] Missing required environment variables:', missing.join(', '));
    console.error('Please create a .env file with the required variables.');
    process.exit(1);
  }
}

// Start server
function startServer() {
  validateEnvironment();
  
  const server = app.listen(PORT, () => {
    console.log('\n🎯 AI Interview Coach Backend');
    console.log('================================');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🛡️  Security features enabled`);
    console.log(`🔒 Rate limiting active`);
    console.log(`📝 Input validation active`);
    console.log(`🧹 Input sanitization active`);
    console.log('================================\n');
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n[SHUTDOWN] Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('[SHUTDOWN] Server closed successfully');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('\n[SHUTDOWN] Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('[SHUTDOWN] Server closed successfully');
      process.exit(0);
    });
  });
}

// Start the server
startServer();

module.exports = app;