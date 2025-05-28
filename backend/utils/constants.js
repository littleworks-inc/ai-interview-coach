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

module.exports = {
  VALIDATION_LIMITS,
  ALLOWED_MODELS,
  SECURITY_PATTERNS,
  ERROR_MESSAGES,
  HTTP_STATUS,
  RATE_LIMITS
};