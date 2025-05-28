// ==========================================
// AI Interview Coach - Input Sanitization
// ==========================================

const { SECURITY_PATTERNS } = require('../utils/constants');

/**
 * Sanitize text content by removing/replacing dangerous patterns
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let sanitized = text;
  
  // Remove HTML tags (but preserve content)
  sanitized = sanitized.replace(SECURITY_PATTERNS.HTML_TAGS, '');
  
  // Remove script tags completely
  sanitized = sanitized.replace(SECURITY_PATTERNS.SCRIPT_TAGS, '');
  
  // Remove control characters (but keep newlines and tabs)
  sanitized = sanitized.replace(SECURITY_PATTERNS.CONTROL_CHARS, '');
  
  // Normalize excessive repetition (replace with max 3 consecutive chars)
  sanitized = sanitized.replace(/(.)\1{3,}/g, '$1$1$1');
  
  // Normalize whitespace
  sanitized = sanitized
    .replace(/\r\n/g, '\n')        // Normalize line endings
    .replace(/\r/g, '\n')          // Convert old Mac line endings
    .replace(/\t/g, '    ')        // Convert tabs to spaces
    .replace(/\n{3,}/g, '\n\n')    // Limit consecutive newlines to 2
    .replace(/[ ]{2,}/g, ' ')      // Replace multiple spaces with single space
    .trim();                       // Trim leading/trailing whitespace
  
  return sanitized;
}

/**
 * Sanitize job description with specific business rules
 * @param {string} jobDescription - Job description to sanitize
 * @returns {string} - Sanitized job description
 */
function sanitizeJobDescription(jobDescription) {
  let sanitized = sanitizeText(jobDescription);
  
  // Additional job description specific cleaning
  
  // Remove common copy-paste artifacts
  sanitized = sanitized
    .replace(/^(job description|position|role):\s*/i, '')  // Remove redundant headers
    .replace(/\b(apply now|click here|visit our website)\b/gi, '')  // Remove call-to-action text
    .replace(/https?:\/\/[^\s]+/g, '[URL]')  // Replace URLs with placeholder
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')  // Replace emails with placeholder
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');  // Replace phone numbers
  
  // Clean up formatting artifacts from copy-paste
  sanitized = sanitized
    .replace(/_{3,}/g, '')  // Remove underline formatting
    .replace(/-{3,}/g, '')  // Remove dash formatting
    .replace(/={3,}/g, '')  // Remove equals formatting
    .replace(/\*{3,}/g, '')  // Remove asterisk formatting
  
  return sanitized.trim();
}

/**
 * Deep sanitize an object recursively
 * @param {any} obj - Object to sanitize
 * @returns {any} - Sanitized object
 */
function deepSanitize(obj) {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize the key as well
      const sanitizedKey = sanitizeText(key);
      sanitizedObj[sanitizedKey] = deepSanitize(value);
    }
    return sanitizedObj;
  }
  
  return obj;
}

/**
 * Express middleware to sanitize request body
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function sanitizeRequestBody(req, res, next) {
  try {
    if (req.body) {
      // Create a sanitized copy of the request body
      req.sanitizedBody = deepSanitize(req.body);
      
      // Special handling for job descriptions in messages
      if (req.sanitizedBody.messages && Array.isArray(req.sanitizedBody.messages)) {
        req.sanitizedBody.messages = req.sanitizedBody.messages.map(message => {
          if (message.role === 'user' && message.content) {
            // Apply job description specific sanitization to user messages
            message.content = sanitizeJobDescription(message.content);
          } else if (message.content) {
            // Apply general text sanitization to other messages
            message.content = sanitizeText(message.content);
          }
          return message;
        });
      }
      
      // Log sanitization info (without sensitive data)
      const originalLength = JSON.stringify(req.body).length;
      const sanitizedLength = JSON.stringify(req.sanitizedBody).length;
      
      if (originalLength !== sanitizedLength) {
        console.log(`[SANITIZATION] Content sanitized: ${originalLength} -> ${sanitizedLength} bytes`);
      }
    }
    
    next();
  } catch (error) {
    console.error('[SANITIZATION ERROR]', error.message);
    // If sanitization fails, we should not proceed
    return res.status(400).json({
      error: 'Unable to process request content',
      code: 'SANITIZATION_FAILED'
    });
  }
}

/**
 * Extract clean job description from sanitized messages
 * @param {array} messages - Sanitized messages array
 * @returns {string} - Clean job description
 */
function extractCleanJobDescription(messages) {
  if (!Array.isArray(messages)) {
    return '';
  }
  
  const userMessage = messages.find(msg => msg.role === 'user');
  return userMessage ? userMessage.content : '';
}

/**
 * Validate that sanitization didn't remove too much content
 * @param {string} original - Original text
 * @param {string} sanitized - Sanitized text
 * @returns {object} - Validation result
 */
function validateSanitizationResult(original, sanitized) {
  const originalLength = original.length;
  const sanitizedLength = sanitized.length;
  const reductionRatio = (originalLength - sanitizedLength) / originalLength;
  
  // If more than 50% of content was removed, it might be suspicious
  const isSuspicious = reductionRatio > 0.5 && originalLength > 100;
  
  return {
    originalLength,
    sanitizedLength,
    reductionRatio,
    isSuspicious,
    isValid: !isSuspicious && sanitizedLength > 0
  };
}

module.exports = {
  sanitizeText,
  sanitizeJobDescription,
  deepSanitize,
  sanitizeRequestBody,
  extractCleanJobDescription,
  validateSanitizationResult
};