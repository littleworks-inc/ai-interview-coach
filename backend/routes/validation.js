// ==========================================
// AI Interview Coach - Validation Endpoints
// ==========================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const { EnhancedContentValidator } = require('../middleware/enhanced-validation');
const { sanitizeRequestBody } = require('../middleware/sanitization');
const router = express.Router();

// Rate limiting for validation endpoints (more lenient than generation)
const validationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 validation requests per minute per IP
  message: {
    error: 'Too many validation requests',
    code: 'VALIDATION_RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
router.use(validationLimiter);

/**
 * POST /api/validate/job - Validate job description only
 */
router.post('/job', sanitizeRequestBody, async (req, res) => {
  try {
    const { content } = req.sanitizedBody || req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        isValid: false,
        errors: ['Content is required'],
        warnings: [],
        suggestions: [],
        canProceed: false
      });
    }
    
    // Use enhanced validator
    const validator = new EnhancedContentValidator();
    const result = validator.validateJobDescription(content);
    
    // Log validation request
    console.log('[VALIDATION API - JOB]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      contentLength: content.length,
      isValid: result.isValid,
      canProceed: result.canProceed,
      errorsCount: result.errors.length,
      warningsCount: result.warnings.length
    });
    
    res.json({
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      suggestions: result.suggestions.slice(0, 5), // Limit suggestions
      canProceed: result.canProceed,
      scores: result.scores
    });
    
  } catch (error) {
    console.error('[VALIDATION API - JOB ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      error: error.message
    });
    
    res.status(500).json({
      isValid: false,
      errors: ['Validation service temporarily unavailable'],
      warnings: [],
      suggestions: [],
      canProceed: false
    });
  }
});

/**
 * POST /api/validate/resume - Validate resume summary only
 */
router.post('/resume', sanitizeRequestBody, async (req, res) => {
  try {
    const { content } = req.sanitizedBody || req.body;
    
    // Resume content is optional
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.json({
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: ['Adding a resume summary will personalize your questions'],
        canProceed: true,
        scores: { professional: 0, experience: 0, overall: 0 },
        analysis: {}
      });
    }
    
    // Use enhanced validator
    const validator = new EnhancedContentValidator();
    const result = validator.validateResumeSummary(content);
    
    // Log validation request
    console.log('[VALIDATION API - RESUME]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      contentLength: content.length,
      isValid: result.isValid,
      canProceed: result.canProceed,
      errorsCount: result.errors.length,
      warningsCount: result.warnings.length,
      qualityScore: result.scores?.overall || 0
    });
    
    res.json({
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      suggestions: result.suggestions.slice(0, 5), // Limit suggestions
      canProceed: result.canProceed,
      scores: result.scores,
      analysis: result.analysis
    });
    
  } catch (error) {
    console.error('[VALIDATION API - RESUME ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      error: error.message
    });
    
    res.status(500).json({
      isValid: false,
      errors: ['Validation service temporarily unavailable'],
      warnings: [],
      suggestions: [],
      canProceed: false
    });
  }
});

/**
 * POST /api/validate/both - Validate both job description and resume summary
 */
router.post('/both', sanitizeRequestBody, async (req, res) => {
  try {
    const { jobDescription, resumeSummary } = req.sanitizedBody || req.body;
    
    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({
        error: 'Job description is required',
        code: 'MISSING_JOB_DESCRIPTION'
      });
    }
    
    // Use enhanced validator
    const validator = new EnhancedContentValidator();
    const result = validator.validateContent(jobDescription, resumeSummary || '');
    
    // Log validation request
    console.log('[VALIDATION API - BOTH]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      jobDescriptionLength: jobDescription.length,
      resumeSummaryLength: (resumeSummary || '').length,
      canProceed: result.canProceed,
      overallQuality: result.overallQuality,
      compatible: result.compatibility?.compatible
    });
    
    res.json({
      jobDescription: {
        isValid: result.jobDescription.isValid,
        errors: result.jobDescription.errors,
        warnings: result.jobDescription.warnings,
        suggestions: result.jobDescription.suggestions.slice(0, 3),
        canProceed: result.jobDescription.canProceed,
        scores: result.jobDescription.scores
      },
      resumeSummary: {
        isValid: result.resumeSummary.isValid,
        errors: result.resumeSummary.errors,
        warnings: result.resumeSummary.warnings,
        suggestions: result.resumeSummary.suggestions.slice(0, 3),
        canProceed: result.resumeSummary.canProceed,
        scores: result.resumeSummary.scores,
        analysis: result.resumeSummary.analysis
      },
      compatibility: result.compatibility,
      canProceed: result.canProceed,
      overallQuality: result.overallQuality,
      recommendations: result.recommendations
    });
    
  } catch (error) {
    console.error('[VALIDATION API - BOTH ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      error: error.message
    });
    
    res.status(500).json({
      error: 'Validation service temporarily unavailable',
      code: 'VALIDATION_SERVICE_ERROR'
    });
  }
});

/**
 * GET /api/validate/health - Health check for validation service
 */
router.get('/health', (req, res) => {
  try {
    // Test the validator
    const validator = new EnhancedContentValidator();
    const testResult = validator.validateJobDescription('Test software engineer position');
    
    res.json({
      status: 'healthy',
      service: 'content-validation',
      features: {
        jobValidation: true,
        resumeValidation: true,
        contentFiltering: true,
        qualityScoring: true,
        compatibilityCheck: true
      },
      testResult: {
        functional: testResult.isValid !== undefined
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'content-validation',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;