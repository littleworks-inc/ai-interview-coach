/* ==========================================
   AI Interview Coach - Main Application Logic
   ========================================== */

// ==========================================
// Configuration & Constants
// ==========================================

const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',  // Backend server URL
  ENDPOINTS: {
    GENERATE: '/api/generate'
  },
  TIMEOUT: 90000, // 90 seconds (increased from 45 seconds)
  MODEL: 'qwen/qwen3-30b-a3b:free'
};

// Optimized AI System Prompt
const SYSTEM_PROMPT = `You are an expert interview coach and hiring manager with 15+ years of experience across multiple industries. Your job is to generate personalized, realistic interview questions based on job descriptions.

INSTRUCTIONS:
1. Analyze the job description to understand: role level, required skills, industry, and key responsibilities
2. Generate 5-7 targeted interview questions that a real hiring manager would ask
3. For each question, provide a strong example answer that demonstrates relevant experience
4. Mix question types: behavioral (40%), technical/role-specific (40%), and situational (20%)
5. Ensure answers are realistic - don't over-qualify or under-qualify the candidate

CRITICAL: Always include the complete question text, not just the category.

OUTPUT FORMAT:
For each question, use this exact format:

**Question X: [Write the complete, specific question here - not just the category]**

**Example Answer:**
[Detailed, realistic answer that demonstrates relevant skills and experience]

---

QUESTION TYPES TO INCLUDE:
- Behavioral: "Tell me about a time when..." (use STAR method in answers)
- Technical: Role-specific skills and knowledge questions
- Situational: "How would you handle..." scenarios
- Cultural fit: Team dynamics and work style questions

ANSWER GUIDELINES:
- Use specific examples with quantifiable results when possible
- Show problem-solving process and learning
- Demonstrate soft skills (communication, leadership, teamwork)
- Keep answers concise but comprehensive (2-3 paragraphs max)
- Match the seniority level indicated in the job description
- Include specific numbers, percentages, or timeframes where relevant

IMPORTANT: Each question must be a complete, specific question that an interviewer would actually ask, not just a category label.`;

// ==========================================
// Main Generate Questions Function
// ==========================================

/**
 * Main function to generate interview questions
 * Called when user clicks the generate button
 */
async function generateQuestions() {
  console.log('[APP] Starting question generation...');
  
  try {
    // Get and validate input
    const jobDescription = getJobDescriptionInput();
    if (!jobDescription) {
      return;
    }
    
    // Update UI to loading state
    showLoadingState();
    
    // Prepare API request
    const requestPayload = {
      model: API_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: jobDescription
        }
      ]
    };
    
    console.log('[APP] Making API request...', {
      model: requestPayload.model,
      jobDescriptionLength: jobDescription.length,
      messageCount: requestPayload.messages.length
    });
    
    // Make API call
    const response = await makeApiRequest(requestPayload);
    
    // Process and display results
    const questions = parseQuestionsFromResponse(response);
    displayQuestions(questions);
    
    console.log('[APP] Questions generated successfully:', {
      questionCount: questions.length,
      totalLength: questions.reduce((sum, q) => sum + q.question.length + q.answer.length, 0)
    });
    
  } catch (error) {
    console.error('[APP] Error generating questions:', error);
    showErrorState(error);
  }
}

// ==========================================
// Input Validation & Processing
// ==========================================

/**
 * Get and validate job description input
 * @returns {string|null} Validated job description or null if invalid
 */
function getJobDescriptionInput() {
  const textarea = document.getElementById('jobDescription');
  if (!textarea) {
    console.error('[APP] Job description textarea not found');
    showErrorMessage('Unable to find job description input field.');
    return null;
  }
  
  const jobDescription = textarea.value.trim();
  
  // Basic validation
  if (!jobDescription) {
    showErrorMessage('Please enter a job description before generating questions.');
    textarea.focus();
    return null;
  }
  
  if (jobDescription.length < 10) {
    showErrorMessage('Job description is too short. Please provide more details.');
    textarea.focus();
    return null;
  }
  
  if (jobDescription.length > 10000) {
    showErrorMessage('Job description is too long. Please keep it under 10,000 characters.');
    textarea.focus();
    return null;
  }
  
  return jobDescription;
}

// ==========================================
// API Communication
// ==========================================

/**
 * Make API request to generate questions
 * @param {Object} payload - Request payload
 * @returns {Promise<Object>} API response
 */
async function makeApiRequest(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error types
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 413) {
        throw new Error('Job description is too long. Please shorten it and try again.');
      } else if (response.status === 400) {
        throw new Error(errorData.error || 'Invalid job description. Please check your input.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again in a few minutes.');
      } else {
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from AI service. Please try again.');
    }
    
    return data;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again with a shorter job description.');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}

// ==========================================
// Response Processing
// ==========================================

/**
 * Parse questions from AI response
 * @param {Object} response - API response
 * @returns {Array} Array of question objects
 */
function parseQuestionsFromResponse(response) {
  const content = response.choices[0].message.content;
  const questions = [];
  
  // Split by question markers and clean up
  const sections = content.split(/\*\*Question \d+:/).filter(section => section.trim());
  
  sections.forEach((section, index) => {
    const lines = section.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return;
    
    // Extract question (first line, remove any remaining asterisks)
    const question = lines[0].replace(/\*\*/g, '').trim();
    
    // Find "Example Answer:" and extract everything after it
    let answerStartIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('example answer:')) {
        answerStartIndex = i + 1;
        break;
      }
    }
    
    let answer = '';
    if (answerStartIndex !== -1 && answerStartIndex < lines.length) {
      answer = lines.slice(answerStartIndex)
        .join('\n')
        .replace(/---/g, '')
        .trim();
    }
    
    if (question && answer) {
      questions.push({
        id: `q${index + 1}`,
        question: question,
        answer: answer
      });
    }
  });
  
  console.log('[APP] Parsed questions:', questions.length);
  return questions;
}

// ==========================================
// UI State Management
// ==========================================

/**
 * Show loading state while generating questions
 */
function showLoadingState() {
  const output = document.getElementById('output');
  const generateBtn = document.querySelector('.generate-btn');
  
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <span class="btn-icon">⏳</span>
      <span>Generating Questions...</span>
    `;
  }
  
  if (output) {
    output.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">
          <h3>Generating personalized interview questions...</h3>
          <p>This usually takes 15-30 seconds. Please wait while our AI analyzes your job description.</p>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    `;
    
    // Scroll to output
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Show error state
 * @param {Error} error - Error object
 */
function showErrorState(error) {
  const output = document.getElementById('output');
  const generateBtn = document.querySelector('.generate-btn');
  
  // Reset button
  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <span class="btn-icon">✨</span>
      <span>Generate Interview Questions</span>
    `;
  }
  
  if (output) {
    output.innerHTML = `
      <div class="error">
        <div class="error-icon">❌</div>
        <div class="error-content">
          <h3>Unable to Generate Questions</h3>
          <p><strong>Error:</strong> ${error.message}</p>
          <div class="error-actions">
            <button onclick="generateQuestions()" class="retry-btn">
              <span>🔄</span> Try Again
            </button>
            <button onclick="clearOutput()" class="clear-btn">
              <span>🗑️</span> Clear
            </button>
          </div>
        </div>
      </div>
    `;
    
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Display generated questions
 * @param {Array} questions - Array of question objects
 */
function displayQuestions(questions) {
  const output = document.getElementById('output');
  const generateBtn = document.querySelector('.generate-btn');
  
  // Reset button
  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <span class="btn-icon">✨</span>
      <span>Generate Interview Questions</span>
    `;
  }
  
  if (!output || questions.length === 0) {
    showErrorMessage('No questions were generated. Please try again.');
    return;
  }
  
  // Generate HTML for results
  const resultsHTML = `
    <div class="results-section">
      <!-- Results Header -->
      <div class="results-header">
        <h2 class="results-title">
          🎯 Your Personalized Interview Questions
        </h2>
        <button onclick="copyAllQuestions()" class="copy-all-btn">
          <span>📋</span>
          Copy All Questions
        </button>
      </div>
      
      <!-- Success Message -->
      <div class="success-message">
        <span class="success-icon">✅</span>
        <div class="success-text">
          <strong>Generated ${questions.length} personalized questions</strong> based on your job description.
          Each question includes an expert example answer to help you prepare.
        </div>
      </div>
      
      <!-- Questions -->
      <div class="questions-container">
        ${questions.map((q, index) => `
          <div class="question-card" id="${q.id}">
            <div class="question-header">
              <h3 class="question-text">
                <span class="question-number">${index + 1}.</span>
                <span class="question-icon">❓</span>
                ${escapeHtml(q.question)}
              </h3>
              <div class="question-controls">
                <button onclick="copyQuestionAndAnswer('${q.id}')" class="copy-qa-btn">
                  <span>📋</span>
                  Copy Q&A
                </button>
              </div>
            </div>
            <div class="answer-section">
              <div class="answer-label">
                <span>💡</span>
                <strong>Example Answer:</strong>
              </div>
              <div class="answer-text">${formatAnswer(q.answer)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      

    </div>
  `;
  
  output.innerHTML = resultsHTML;
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Add subtle animation to cards
  setTimeout(() => {
    const cards = document.querySelectorAll('.question-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      }, index * 100);
    });
  }, 100);
}

// ==========================================
// Copy Functionality
// ==========================================

/**
 * Copy all questions and answers to clipboard
 */
async function copyAllQuestions() {
  const questions = getAllQuestions();
  
  if (questions.length === 0) {
    showNotification('No questions to copy', 'error');
    return;
  }
  
  const text = questions.map((q, index) => 
    `Question ${index + 1}: ${q.question}\n\nExample Answer:\n${q.answer}\n\n${'='.repeat(50)}\n`
  ).join('\n');
  
  try {
    await navigator.clipboard.writeText(text);
    showNotification(`Copied all ${questions.length} questions and answers!`);
  } catch (error) {
    console.error('[APP] Copy failed:', error);
    showNotification('Copy failed. Please select and copy manually.', 'error');
  }
}

/**
 * Copy specific question and answer to clipboard
 * @param {string} questionId - ID of the question to copy
 */
async function copyQuestionAndAnswer(questionId) {
  const questionElement = document.getElementById(questionId);
  if (!questionElement) {
    showNotification('Question not found', 'error');
    return;
  }
  
  const questionText = questionElement.querySelector('.question-text').textContent.replace('❓', '').trim();
  const answerText = questionElement.querySelector('.answer-text').textContent.trim();
  
  const text = `Question: ${questionText}\n\nExample Answer:\n${answerText}`;
  
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Question and answer copied!');
  } catch (error) {
    console.error('[APP] Copy failed:', error);
    showNotification('Copy failed. Please select and copy manually.', 'error');
  }
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Get all questions from the current display
 * @returns {Array} Array of question objects
 */
function getAllQuestions() {
  const questionCards = document.querySelectorAll('.question-card');
  const questions = [];
  
  questionCards.forEach(card => {
    const questionText = card.querySelector('.question-text').textContent.replace('❓', '').trim();
    const answerText = card.querySelector('.answer-text').textContent.trim();
    
    questions.push({
      question: questionText,
      answer: answerText
    });
  });
  
  return questions;
}

/**
 * Format answer text for display
 * @param {string} answer - Raw answer text
 * @returns {string} Formatted HTML
 */
function formatAnswer(answer) {
  return escapeHtml(answer)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show notification message
 * @param {string} message - Message to show
 * @param {string} type - Type of notification (success, error)
 */
function showNotification(message, type = 'success') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Show error message in place
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
  showNotification(message, 'error');
}

/**
 * Clear the output area
 */
function clearOutput() {
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = 'Your interview questions will appear here.';
  }
}

// ==========================================
// Initialization
// ==========================================

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('[APP] AI Interview Coach initialized');
  console.log('[APP] API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    model: API_CONFIG.MODEL,
    timeout: API_CONFIG.TIMEOUT
  });
  
  // Add global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[APP] Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
  
  // Test if required elements exist
  const requiredElements = ['jobDescription', 'output'];
  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  
  if (missingElements.length > 0) {
    console.error('[APP] Missing required elements:', missingElements);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}