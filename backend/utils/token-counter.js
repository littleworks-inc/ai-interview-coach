// ==========================================
// AI Interview Coach - Token Counter & Cost Calculator
// ==========================================

/**
 * Estimate token count for text (approximation)
 * OpenAI-style tokenization: ~4 characters per token on average
 */
function estimateTokenCount(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // More accurate estimation considering:
  // - Whitespace and punctuation
  // - Common words vs rare words
  // - Special characters
  
  const words = text.trim().split(/\s+/);
  const characters = text.length;
  
  // Rough estimation: average 3.5 characters per token
  // This accounts for tokenizer efficiency
  return Math.ceil(characters / 3.5);
}

/**
 * Calculate cost based on model and token usage
 * OpenRouter pricing (as of 2024)
 */
function calculateCost(inputTokens, outputTokens, modelName) {
  const pricing = {
    // Free models (cost = 0)
    'qwen/qwen3-30b-a3b:free': { input: 0, output: 0 },
    'microsoft/phi-3-mini-128k-instruct:free': { input: 0, output: 0 },
    'microsoft/phi-3-medium-128k-instruct:free': { input: 0, output: 0 },
    'google/gemma-7b-it:free': { input: 0, output: 0 },
    'meta-llama/llama-3-8b-instruct:free': { input: 0, output: 0 },
    'huggingfaceh4/zephyr-7b-beta:free': { input: 0, output: 0 },
    
    // Paid models (cost per 1K tokens in cents)
    'openai/gpt-4o': { input: 0.5, output: 1.5 },
    'openai/gpt-4-turbo': { input: 1.0, output: 3.0 },
    'openai/gpt-3.5-turbo': { input: 0.05, output: 0.15 },
    'anthropic/claude-3-opus': { input: 1.5, output: 7.5 },
    'anthropic/claude-3-sonnet': { input: 0.3, output: 1.5 },
    'anthropic/claude-3-haiku': { input: 0.025, output: 0.125 }
  };
  
  const modelPricing = pricing[modelName] || { input: 0, output: 0 };
  
  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;
  
  return {
    inputCostCents: Math.round(inputCost * 100) / 100,
    outputCostCents: Math.round(outputCost * 100) / 100,
    totalCostCents: Math.round((inputCost + outputCost) * 100) / 100,
    isFreeModel: modelPricing.input === 0 && modelPricing.output === 0
  };
}

/**
 * Analyze response quality and parsing success
 */
function analyzeResponseQuality(rawResponse, parsedQuestions) {
  const analysis = {
    rawResponseLength: rawResponse.length,
    questionsFound: parsedQuestions.length,
    questionsWithAnswers: 0,
    malformedQuestions: 0,
    qualityScore: 0,
    parsingErrors: [],
    warningFlags: [],
    hasProperFormat: false,
    hasQuestionMarkers: false,
    hasAnswerSections: false
  };
  
  // Check for proper formatting markers
  analysis.hasQuestionMarkers = /\*\*Question \d+:/i.test(rawResponse);
  analysis.hasAnswerSections = /\*\*Example Answer:/i.test(rawResponse);
  analysis.hasProperFormat = analysis.hasQuestionMarkers && analysis.hasAnswerSections;
  
  // Analyze parsed questions
  parsedQuestions.forEach((q, index) => {
    if (q.question && q.answer) {
      analysis.questionsWithAnswers++;
      
      // Check for quality issues
      if (q.question.length < 10) {
        analysis.parsingErrors.push(`Question ${index + 1} too short`);
        analysis.malformedQuestions++;
      }
      
      if (q.answer.length < 50) {
        analysis.warningFlags.push(`Answer ${index + 1} may be too brief`);
      }
      
      if (q.question.toLowerCase().includes('behavioral') && !q.question.includes('?')) {
        analysis.parsingErrors.push(`Question ${index + 1} appears to be category label, not actual question`);
        analysis.malformedQuestions++;
      }
    } else {
      analysis.malformedQuestions++;
      analysis.parsingErrors.push(`Question ${index + 1} missing question or answer`);
    }
  });
  
  // Calculate quality score (0-100)
  let score = 0;
  
  // Base score for having questions
  if (analysis.questionsFound > 0) score += 30;
  
  // Score for proper formatting
  if (analysis.hasProperFormat) score += 20;
  
  // Score for complete questions
  const completionRate = analysis.questionsFound > 0 ? 
    (analysis.questionsWithAnswers / analysis.questionsFound) : 0;
  score += completionRate * 30;
  
  // Penalty for malformed questions
  const errorRate = analysis.questionsFound > 0 ? 
    (analysis.malformedQuestions / analysis.questionsFound) : 0;
  score -= errorRate * 20;
  
  // Bonus for good quantity (5-7 questions is ideal)
  if (analysis.questionsFound >= 5 && analysis.questionsFound <= 7) {
    score += 10;
  }
  
  // Bonus for no errors
  if (analysis.parsingErrors.length === 0) score += 10;
  
  analysis.qualityScore = Math.max(0, Math.min(100, Math.round(score)));
  
  return analysis;
}

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

module.exports = {
  estimateTokenCount,
  calculateCost,
  analyzeResponseQuality,
  generateRequestId
};