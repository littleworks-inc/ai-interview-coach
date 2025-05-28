// ==========================================
// AI Interview Coach - Custom Validators
// ==========================================

const { VALIDATION_LIMITS, ALLOWED_MODELS, SECURITY_PATTERNS } = require('./constants');

/**
 * Check if job description contains suspicious patterns (context-aware)
 * @param {string} text - The text to validate
 * @returns {object} - Validation result with isValid and reasons
 */
function validateJobDescriptionSecurity(text) {
  const issues = [];
  
  // First, check if this looks like a legitimate job description
  const hasJobIndicators = /\b(job|role|position|responsibilities|qualifications|requirements|experience|skills|company|about|salary|benefits)\b/gi.test(text);
  const hasTechnicalTerms = /\b(developer|engineer|programming|software|technical|computer|technology|system|application|database|web|mobile|cloud|api|framework|language)\b/gi.test(text);
  
  // If it looks like a job description, be more lenient with technical terms
  const isLikelyJobDescription = hasJobIndicators || hasTechnicalTerms;
  
  // Check for HTML/Script tags (always check)
  if (SECURITY_PATTERNS.HTML_TAGS.test(text)) {
    issues.push('HTML tags detected');
  }
  
  if (SECURITY_PATTERNS.SCRIPT_TAGS.test(text)) {
    issues.push('Script tags detected');
  }
  
  // Only flag SQL injection if it looks like actual malicious SQL
  // Allow mentions of "SQL" in job descriptions
  if (SECURITY_PATTERNS.SQL_INJECTION.test(text)) {
    // Double-check if this is actually malicious vs just mentioning SQL
    if (!isLikelyJobDescription || text.includes("'; DROP TABLE") || text.includes("1=1")) {
      issues.push('SQL injection patterns detected');
    }
  }
  
  // Only flag command injection if it looks like actual shell commands
  // Allow mentions of "shell scripting" in job descriptions
  if (SECURITY_PATTERNS.COMMAND_INJECTION.test(text)) {
    // Double-check if this is actually malicious vs technical skills
    if (!isLikelyJobDescription || text.includes("$(rm") || text.includes("; rm ")) {
      issues.push('Command injection patterns detected');
    }
  }
  
  // Check for prompt injection attempts
  if (SECURITY_PATTERNS.PROMPT_INJECTION.test(text)) {
    issues.push('Prompt injection patterns detected');
  }
  
  // Check for excessive repetition (potential DoS)
  if (SECURITY_PATTERNS.EXCESSIVE_REPEATS.test(text)) {
    issues.push('Excessive character repetition detected');
  }
  
  // Check for control characters
  if (SECURITY_PATTERNS.CONTROL_CHARS.test(text)) {
    issues.push('Invalid control characters detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    context: {
      isLikelyJobDescription,
      hasJobIndicators,
      hasTechnicalTerms
    }
  };
}

/**
 * Validate job description content and length
 * @param {string} jobDescription - The job description to validate
 * @returns {object} - Validation result
 */
function validateJobDescription(jobDescription) {
  const result = {
    isValid: true,
    errors: []
  };
  
  // Check if provided
  if (!jobDescription || typeof jobDescription !== 'string') {
    result.isValid = false;
    result.errors.push('Job description must be a string');
    return result;
  }
  
  // Trim whitespace for accurate length check
  const trimmed = jobDescription.trim();
  
  // Check minimum length
  if (trimmed.length < VALIDATION_LIMITS.JOB_DESCRIPTION.MIN_LENGTH) {
    result.isValid = false;
    result.errors.push(`Job description too short (minimum ${VALIDATION_LIMITS.JOB_DESCRIPTION.MIN_LENGTH} characters)`);
  }
  
  // Check maximum length
  if (trimmed.length > VALIDATION_LIMITS.JOB_DESCRIPTION.MAX_LENGTH) {
    result.isValid = false;
    result.errors.push(`Job description too long (maximum ${VALIDATION_LIMITS.JOB_DESCRIPTION.MAX_LENGTH} characters)`);
  }
  
  // Check line count (prevent extremely fragmented input)
  const lineCount = trimmed.split('\n').length;
  if (lineCount > VALIDATION_LIMITS.JOB_DESCRIPTION.MAX_LINES) {
    result.isValid = false;
    result.errors.push(`Too many lines (maximum ${VALIDATION_LIMITS.JOB_DESCRIPTION.MAX_LINES} lines)`);
  }
  
  // Security validation
  const securityCheck = validateJobDescriptionSecurity(trimmed);
  if (!securityCheck.isValid) {
    result.isValid = false;
    result.errors.push('Content contains suspicious patterns');
    result.securityIssues = securityCheck.issues;
  }
  
  return result;
}

/**
 * Validate AI model name against whitelist
 * @param {string} model - The model name to validate
 * @returns {boolean} - True if model is allowed
 */
function isValidModel(model) {
  return typeof model === 'string' && ALLOWED_MODELS.includes(model);
}

/**
 * Validate OpenRouter API message structure
 * @param {array} messages - Array of messages to validate
 * @returns {object} - Validation result
 */
function validateMessages(messages) {
  const result = {
    isValid: true,
    errors: []
  };
  
  // Check if messages is an array
  if (!Array.isArray(messages)) {
    result.isValid = false;
    result.errors.push('Messages must be an array');
    return result;
  }
  
  // Check message count
  if (messages.length === 0) {
    result.isValid = false;
    result.errors.push('At least one message is required');
    return result;
  }
  
  if (messages.length > VALIDATION_LIMITS.MESSAGES.MAX_COUNT) {
    result.isValid = false;
    result.errors.push(`Too many messages (maximum ${VALIDATION_LIMITS.MESSAGES.MAX_COUNT})`);
    return result;
  }
  
  // Validate each message
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    
    // Check message structure
    if (!message || typeof message !== 'object') {
      result.isValid = false;
      result.errors.push(`Message ${i + 1} must be an object`);
      continue;
    }
    
    // Check required fields
    if (!message.role || typeof message.role !== 'string') {
      result.isValid = false;
      result.errors.push(`Message ${i + 1} must have a valid role`);
    }
    
    if (!message.content || typeof message.content !== 'string') {
      result.isValid = false;
      result.errors.push(`Message ${i + 1} must have valid content`);
      continue;
    }
    
    // Check message length
    if (message.content.length > VALIDATION_LIMITS.MESSAGES.MAX_MESSAGE_LENGTH) {
      result.isValid = false;
      result.errors.push(`Message ${i + 1} content too long (maximum ${VALIDATION_LIMITS.MESSAGES.MAX_MESSAGE_LENGTH} characters)`);
    }
    
    // Validate role values
    const validRoles = ['system', 'user', 'assistant'];
    if (!validRoles.includes(message.role)) {
      result.isValid = false;
      result.errors.push(`Message ${i + 1} has invalid role: ${message.role}`);
    }
  }
  
  // Check if required roles are present
  const roles = messages.map(msg => msg.role);
  const hasSystem = roles.includes('system');
  const hasUser = roles.includes('user');
  
  if (!hasSystem) {
    result.isValid = false;
    result.errors.push('System message is required');
  }
  
  if (!hasUser) {
    result.isValid = false;
    result.errors.push('User message is required');
  }
  
  return result;
}

/**
 * Validate complete API request structure
 * @param {object} requestBody - The request body to validate
 * @returns {object} - Validation result
 */
function validateApiRequest(requestBody) {
  const result = {
    isValid: true,
    errors: []
  };
  
  // Check if body exists
  if (!requestBody || typeof requestBody !== 'object') {
    result.isValid = false;
    result.errors.push('Request body must be a valid object');
    return result;
  }
  
  // Validate model
  if (!requestBody.model) {
    result.isValid = false;
    result.errors.push('Model is required');
  } else if (!isValidModel(requestBody.model)) {
    result.isValid = false;
    result.errors.push('Invalid or unsupported model');
  }
  
  // Validate messages
  if (!requestBody.messages) {
    result.isValid = false;
    result.errors.push('Messages are required');
  } else {
    const messageValidation = validateMessages(requestBody.messages);
    if (!messageValidation.isValid) {
      result.isValid = false;
      result.errors.push(...messageValidation.errors);
    }
  }
  
  return result;
}

/**
 * Extract and validate job description from messages
 * @param {array} messages - Array of messages
 * @returns {object} - Validation result with job description
 */
function extractAndValidateJobDescription(messages) {
  const result = {
    isValid: true,
    jobDescription: '',
    errors: []
  };
  
  // Find user message (should contain job description)
  const userMessage = messages.find(msg => msg.role === 'user');
  if (!userMessage) {
    result.isValid = false;
    result.errors.push('User message not found');
    return result;
  }
  
  result.jobDescription = userMessage.content;
  
  // Validate the job description
  const validation = validateJobDescription(result.jobDescription);
  if (!validation.isValid) {
    result.isValid = false;
    result.errors.push(...validation.errors);
    if (validation.securityIssues) {
      result.securityIssues = validation.securityIssues;
    }
  }
  
  return result;
}

module.exports = {
  validateJobDescription,
  validateJobDescriptionSecurity,
  isValidModel,
  validateMessages,
  validateApiRequest,
  extractAndValidateJobDescription
};