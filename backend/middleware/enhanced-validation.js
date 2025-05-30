// ==========================================
// AI Interview Coach - Enhanced Validation Middleware
// ==========================================

const { body, validationResult } = require('express-validator');
const EnhancedContentValidator = require('../utils/enhanced-validators');
const { 
  ERROR_MESSAGES, 
  HTTP_STATUS, 
  VALIDATION_LIMITS,
  ALLOWED_MODELS 
} = require('../utils/constants');

// Initialize enhanced validator
const enhancedValidator = new EnhancedContentValidator();

/**
 * Enhanced validation rules for API request (Updated with resume rules)
 */
const enhancedApiValidationRules = () => {
  return [
    // Validate model field (existing)
    body('model')
      .notEmpty()
      .withMessage(ERROR_MESSAGES.INVALID_MODEL)
      .isString()
      .withMessage(ERROR_MESSAGES.INVALID_MODEL)
      .isIn(ALLOWED_MODELS)
      .withMessage(ERROR_MESSAGES.INVALID_MODEL),
    
    // Validate messages array (existing)
    body('messages')
      .notEmpty()
      .withMessage('Messages are required')
      .isArray({ min: 1, max: VALIDATION_LIMITS.MESSAGES.MAX_COUNT })
      .withMessage(`Messages must be an array with 1-${VALIDATION_LIMITS.MESSAGES.MAX_COUNT} items`),
    
    // Validate each message in the array (existing)
    body('messages.*.role')
      .notEmpty()
      .withMessage('Each message must have a role')
      .isIn(['system', 'user', 'assistant'])
      .withMessage('Message role must be system, user, or assistant'),
    
    body('messages.*.content')
      .notEmpty()
      .withMessage('Each message must have content')
      .isString()
      .withMessage('Message content must be a string')
      .isLength({ max: VALIDATION_LIMITS.MESSAGES.MAX_MESSAGE_LENGTH })
      .withMessage(`Message content too long (max ${VALIDATION_LIMITS.MESSAGES.MAX_MESSAGE_LENGTH} characters)`),
    
    // Enhanced resume summary validation rules
    body('resumeSummary')
      .optional()
      .isString()
      .withMessage(ERROR_MESSAGES.RESUME_SUMMARY_INVALID_FORMAT)
      .isLength({ max: 800 })
      .withMessage(ERROR_MESSAGES.RESUME_SUMMARY_TOO_LONG)
      .custom((value) => {
        if (value && value.trim().length > 0) {
          // Check for obvious non-professional content
          const lowercaseValue = value.toLowerCase();
          
          // Check for personal information that shouldn't be in resume
          const personalInfoPattern = /\b(age|married|single|children|religion|nationality|race|gender|height|weight)\b/i;
          if (personalInfoPattern.test(value)) {
            throw new Error(ERROR_MESSAGES.RESUME_SUMMARY_PERSONAL_INFO);
          }
          
          // Check for minimum professional content
          const professionalKeywords = ['experience', 'skilled', 'worked', 'years', 'developed', 'managed', 'led'];
          const hasProfessionalContent = professionalKeywords.some(keyword => 
            lowercaseValue.includes(keyword)
          );
          
          if (value.length > 100 && !hasProfessionalContent) {
            throw new Error(ERROR_MESSAGES.RESUME_SUMMARY_NOT_PROFESSIONAL);
          }
        }
        return true;
      })
  ];
};

/**
 * Enhanced content validation middleware
 */
async function enhancedContentValidation(req, res, next) {
  try {
    // Use sanitized body if available, otherwise use original body
    const requestBody = req.sanitizedBody || req.body;
    
    // Extract job description from user message
    const userMessage = requestBody.messages?.find(msg => msg.role === 'user');
    if (!userMessage) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'User message with job description is required',
        code: 'MISSING_USER_MESSAGE'
      });
    }
    
    const jobDescription = userMessage.content;
    const resumeSummary = requestBody.resumeSummary || '';
    
    // Run enhanced validation with new comprehensive system
    const validationResult = enhancedValidator.validateContent(jobDescription, resumeSummary);
    
    // Enhanced logging with resume-specific metrics
    console.log('[ENHANCED VALIDATION]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      jobDescriptionLength: jobDescription.length,
      resumeSummaryLength: resumeSummary.length,
      canProceed: validationResult.canProceed,
      qualityScores: validationResult.overallQuality,
      resumeAnalysis: validationResult.resumeSummary.analysis || {},
      hasErrors: validationResult.jobDescription.errors.length > 0 || validationResult.resumeSummary.errors.length > 0,
      hasWarnings: validationResult.jobDescription.warnings.length > 0 || validationResult.resumeSummary.warnings.length > 0,
      compatibility: validationResult.compatibility,
      recommendationCount: validationResult.recommendations.length
    });
    
    // Handle validation failures with specific resume error handling
    if (!validationResult.canProceed) {
      const jobErrors = validationResult.jobDescription.errors;
      const resumeErrors = validationResult.resumeSummary.errors;
      
      // Determine primary error source and appropriate response
      let errorMessage = ERROR_MESSAGES.INVALID_CONTENT;
      let errorCode = 'CONTENT_VALIDATION_FAILED';
      let errorDetails = {};
      
      // Prioritize job description errors (they're blocking)
      if (jobErrors.length > 0) {
        if (jobErrors.some(err => err.includes('inappropriate language') || err.includes('spam'))) {
          errorMessage = ERROR_MESSAGES.SUSPICIOUS_INPUT;
          errorCode = 'CONTENT_INAPPROPRIATE';
        } else if (jobErrors.some(err => err.includes('too long'))) {
          errorMessage = ERROR_MESSAGES.JOB_DESCRIPTION_TOO_LONG;
          errorCode = 'CONTENT_TOO_LONG';
        } else if (jobErrors.some(err => err.includes('too short'))) {
          errorMessage = ERROR_MESSAGES.JOB_DESCRIPTION_TOO_SHORT;
          errorCode = 'CONTENT_TOO_SHORT';
        } else if (jobErrors.some(err => err.includes('does not appear to be a job description'))) {
          errorMessage = ERROR_MESSAGES.NOT_JOB_DESCRIPTION;
          errorCode = 'NOT_JOB_DESCRIPTION';
        }
        
        errorDetails.jobDescriptionIssues = jobErrors;
      }
      
      // Handle resume-specific errors
      if (resumeErrors.length > 0) {
        if (resumeErrors.some(err => err.includes('inappropriate language'))) {
          errorMessage = ERROR_MESSAGES.RESUME_SUMMARY_INAPPROPRIATE;
          errorCode = 'RESUME_INAPPROPRIATE';
        } else if (resumeErrors.some(err => err.includes('exceeds 800 characters'))) {
          errorMessage = ERROR_MESSAGES.RESUME_SUMMARY_TOO_LONG;
          errorCode = 'RESUME_TOO_LONG';
        } else if (resumeErrors.some(err => err.includes('personal information'))) {
          errorMessage = ERROR_MESSAGES.RESUME_SUMMARY_PERSONAL_INFO;
          errorCode = 'RESUME_PERSONAL_INFO';
        }
        
        errorDetails.resumeIssues = resumeErrors;
      }
      
      // Combine suggestions from both sources
      errorDetails.suggestions = [
        ...validationResult.jobDescription.suggestions.slice(0, 3),
        ...validationResult.resumeSummary.suggestions.slice(0, 2)
      ];
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: errorMessage,
        code: errorCode,
        details: errorDetails
      });
    }
    
    // Store enhanced validation results for use in generation
    req.validationResults = validationResult;
    req.validatedJobDescription = jobDescription;
    req.validatedResumeSummary = resumeSummary;
    req.compatibilityAnalysis = validationResult.compatibility;
    req.recommendations = validationResult.recommendations;
    
    // Add comprehensive warnings to response headers
    const allWarnings = [
      ...validationResult.jobDescription.warnings,
      ...validationResult.resumeSummary.warnings,
      ...validationResult.compatibility.warnings
    ];
    
    if (allWarnings.length > 0) {
      res.set('X-Content-Warnings', JSON.stringify(allWarnings.slice(0, 5))); // Limit header size
    }
    
    // Add quality and compatibility scores to response headers
    res.set('X-Content-Quality', JSON.stringify(validationResult.overallQuality));
    res.set('X-Content-Compatibility', JSON.stringify({
      compatible: validationResult.compatibility.compatible,
      hasRecommendations: validationResult.recommendations.length > 0
    }));
    
    // Add resume analysis to headers for frontend use
    if (validationResult.resumeSummary.analysis.wordCount > 0) {
      res.set('X-Resume-Analysis', JSON.stringify({
        hasQuantifiableAchievements: validationResult.resumeSummary.analysis.hasQuantifiableAchievements,
        isProfessional: validationResult.resumeSummary.analysis.isProfessional,
        experienceLevel: validationResult.resumeSummary.analysis.hasExperienceIndicators ? 'detected' : 'unclear'
      }));
    }
    
    console.log('[ENHANCED VALIDATION SUCCESS]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      qualityScore: validationResult.overallQuality.combined,
      resumeQuality: validationResult.overallQuality.resume,
      compatible: validationResult.compatibility.compatible,
      warningsCount: allWarnings.length,
      recommendationsCount: validationResult.recommendations.length
    });
    
    next();
    
  } catch (error) {
    console.error('[ENHANCED VALIDATION ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.PROCESSING_ERROR,
      code: 'VALIDATION_ERROR'
    });
  }
}

/**
 * Pre-generation content quality check
 */
function preGenerationQualityCheck(req, res, next) {
  const validationResults = req.validationResults;
  
  if (!validationResults) {
    return next(); // Skip if no validation results available
  }
  
  const jobQuality = validationResults.jobDescription.scores?.quality || 0;
  const relevanceScore = validationResults.jobDescription.scores?.relevance || 0;
  
  // Check if content quality is extremely low
  if (jobQuality < 20 && relevanceScore < 30) {
    console.warn('[PRE-GENERATION QUALITY CHECK]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      jobQuality,
      relevanceScore,
      action: 'proceeding_with_warning'
    });
    
    // Add warning header but allow generation
    res.set('X-Quality-Warning', 'Low content quality detected - questions may be generic');
  }
  
  // Store quality context for AI prompt enhancement
  req.contentQuality = {
    jobQuality,
    relevanceScore,
    hasResumeSummary: !!req.validatedResumeSummary?.trim()
  };
  
  next();
}

/**
 * Complete enhanced validation middleware chain
 */
const enhancedValidateGenerateRequest = [
  ...enhancedApiValidationRules(),
  checkValidationResult,
  enhancedContentValidation,
  preGenerationQualityCheck
];

/**
 * Check express-validator results (existing function, kept for compatibility)
 */
function checkValidationResult(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    console.log('[EXPRESS VALIDATION ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      errors: errorDetails
    });
    
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_REQUEST,
      code: 'VALIDATION_FAILED',
      details: errorDetails.map(err => err.message)
    });
  }
  
  next();
}

module.exports = {
  enhancedApiValidationRules,
  enhancedContentValidation,
  preGenerationQualityCheck,
  enhancedValidateGenerateRequest,
  checkValidationResult,
  EnhancedContentValidator: enhancedValidator
};