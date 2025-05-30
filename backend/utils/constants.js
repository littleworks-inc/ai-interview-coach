// ==========================================
// AI Interview Coach - Validation Constants
// ==========================================

// Input Validation Limits
const VALIDATION_LIMITS = {
  // Job description limits
  JOB_DESCRIPTION: {
    MIN_LENGTH: 10,           // Minimum 10 characters
    MAX_LENGTH: 10000,        // Maximum 10,000 characters
    MAX_LINES: 500           // Maximum 500 lines
  },
  
  // Request payload limits
  REQUEST: {
    MAX_SIZE_BYTES: 51200,    // 50KB maximum request size
    TIMEOUT_MS: 30000         // 30 second timeout
  },
  
  // OpenRouter API message limits
  MESSAGES: {
    MAX_COUNT: 10,            // Maximum 10 messages per request
    MAX_MESSAGE_LENGTH: 15000, // Maximum length per message
    REQUIRED_ROLES: ['system', 'user'] // Required message roles
  }
};

// Allowed AI Models (whitelist for security)
const ALLOWED_MODELS = [
  'qwen/qwen3-30b-a3b:free',           // Current default model
  'microsoft/phi-3-mini-128k-instruct:free',
  'microsoft/phi-3-medium-128k-instruct:free',
  'google/gemma-7b-it:free',
  'meta-llama/llama-3-8b-instruct:free',
  'huggingfaceh4/zephyr-7b-beta:free'
];

// Dangerous patterns to detect in input (context-aware)
const SECURITY_PATTERNS = {
  // HTML/Script injection patterns
  HTML_TAGS: /<[^>]*>/g,
  SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  
  // Actual SQL injection attempts (not just mentioning SQL)
  SQL_INJECTION: /(\bunion\s+select\b|\bselect\s+\*\s+from\b|\bdrop\s+table\b|\b;\s*delete\s+from\b|\b'\s*or\s+'1'\s*=\s*'1)/gi,
  
  // Actual command injection attempts (not technical terms)
  COMMAND_INJECTION: /(\$\(.*\)|\`.*\`|;\s*(rm|cat|ls|wget|curl)\s|\|\s*(nc|netcat)\s)/gi,
  
  // Suspicious characters and patterns
  EXCESSIVE_REPEATS: /(.)\1{50,}/g,     // Same character repeated 50+ times
  CONTROL_CHARS: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, // Control characters
  
  // Prompt injection attempts (more specific)
  PROMPT_INJECTION: /(ignore\s+previous\s+instructions|forget\s+everything|system\s*:\s*ignore|assistant\s*:\s*now|user\s*:\s*override)/gi,
  
  // Legitimate technical terms that should NOT be flagged
  ALLOWED_TECHNICAL_TERMS: /\b(sql|mysql|postgresql|shell\s+script|bash|exec|execute|python|javascript|typescript|linux|kubernetes|aws|devops|ci\/cd|docker|terraform|ansible|jenkins|git|api|json|xml|html|css|react|node|java|scala|php|ruby|go|rust|c\+\+|database|server|network|security|cloud|infrastructure)\b/gi
};

// Error messages (user-friendly, no technical details)
const ERROR_MESSAGES = {
  // Validation errors
  INVALID_REQUEST: 'Invalid request format. Please check your input and try again.',
  MISSING_JOB_DESCRIPTION: 'Job description is required.',
  JOB_DESCRIPTION_TOO_SHORT: `Job description must be at least ${VALIDATION_LIMITS.JOB_DESCRIPTION.MIN_LENGTH} characters.`,
  JOB_DESCRIPTION_TOO_LONG: `Job description is too long. Please keep it under ${VALIDATION_LIMITS.JOB_DESCRIPTION.MAX_LENGTH} characters.`,

  // NEW: Enhanced content validation messages
  CONTENT_INAPPROPRIATE: 'Content contains inappropriate language or patterns. Please use professional language only.',
  NOT_JOB_DESCRIPTION: 'The content provided does not appear to be a job description. Please paste a real job posting.',
  CONTENT_LOW_QUALITY: 'Content quality is too low to generate meaningful interview questions. Please provide more detailed information.',
  RESUME_SUMMARY_TOO_LONG: 'Resume summary is too long. Please keep it under 800 characters for optimal results.',

  // Resume Summary Specific Error Messages
  RESUME_SUMMARY_INVALID_FORMAT: 'Resume summary must be a valid text string',
  RESUME_SUMMARY_TOO_LONG: 'Resume summary exceeds 800 characters. Keep it concise for ATS compatibility.',
  RESUME_SUMMARY_INAPPROPRIATE: 'Resume summary contains inappropriate language. Please use professional language only.',
  RESUME_SUMMARY_PERSONAL_INFO: 'Resume summary should not include personal information (age, marital status, etc.). Focus on professional experience only.',
  RESUME_SUMMARY_NOT_PROFESSIONAL: 'Resume summary does not appear to describe professional experience. Include work experience, skills, and achievements.',
  RESUME_SUMMARY_TOO_GENERIC: 'Resume summary is too generic. Include specific achievements, technologies, and quantifiable results.',
  RESUME_SUMMARY_MISSING_EXPERIENCE: 'Resume summary should include your years of experience or career level.',
  RESUME_SUMMARY_MISSING_ACHIEVEMENTS: 'Consider adding specific achievements with numbers or percentages to make your summary more impactful.',
  RESUME_SUMMARY_UNPROFESSIONAL_LANGUAGE: 'Resume summary contains unprofessional language. Use formal, business-appropriate terminology.',
  RESUME_SUMMARY_THIRD_PERSON: 'Resume summary should be written in first person (use "I" or implied first person style).',
  
  // Content Compatibility Messages
  CONTENT_MISMATCH_EXPERIENCE_LEVEL: 'Your experience level may not match the job requirements. Consider highlighting transferable skills.',
  CONTENT_MISMATCH_INDUSTRY: 'Your background appears to be in a different industry. Emphasize relevant transferable skills and experience.',
  
  // Quality Enhancement Messages
  CONTENT_QUALITY_LOW_COMBINED: 'Both job description and resume summary could be more detailed for better interview preparation.',
  PERSONALIZATION_OPPORTUNITY: 'Add a more detailed resume summary to get highly personalized interview questions.',
  
  
  // Security errors
  INVALID_CONTENT: 'The content contains invalid characters or patterns. Please remove any special formatting and try again.',
  SUSPICIOUS_INPUT: 'The input appears to contain suspicious content. Please use plain text only.',
  
  // API errors
  INVALID_MODEL: 'The selected AI model is not available. Please try again.',
  REQUEST_TOO_LARGE: 'Request is too large. Please reduce the content size.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  
  // Generic errors
  PROCESSING_ERROR: 'Unable to process your request. Please try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Rate limiting configuration
const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    MAX_REQUESTS: 100            // 100 requests per window
  },
  STRICT: {
    WINDOW_MS: 60 * 1000,        // 1 minute
    MAX_REQUESTS: 5              // 5 requests per minute for AI generation
  }
};

// Add resume-specific validation limits
const RESUME_VALIDATION = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 800,
  OPTIMAL_LENGTH: 400,
  MIN_PROFESSIONAL_WORDS: 5,
  RECOMMENDED_SENTENCES: 3
};

module.exports = {
  VALIDATION_LIMITS,
  RESUME_VALIDATION, // NEW
  ALLOWED_MODELS,
  SECURITY_PATTERNS,
  ERROR_MESSAGES, // Updated with resume messages
  HTTP_STATUS,
  RATE_LIMITS
};