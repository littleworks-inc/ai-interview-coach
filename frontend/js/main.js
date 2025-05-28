/* ==========================================
   AI Interview Coach - Main Application
   ========================================== */

// Global variables
let questionsData = [];

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  AI_MODEL: 'qwen/qwen3-30b-a3b:free',
  SYSTEM_PROMPT: `You are an AI Interview Coach. Based on the following job description, generate:

1. The top 3 most likely interview questions for this role (for testing purposes).
2. For each question, give a short example answer.

Format your response as:
1. [Question]
*Example Answer:* [Answer]

2. [Question]
*Example Answer:* [Answer]

3. [Question]
*Example Answer:* [Answer]`
};

/**
 * Main function to generate interview questions
 */
async function generateQuestions() {
  const prompt = document.getElementById("jobDescription").value.trim();
  const outputDiv = document.getElementById("output");
  
  // Validation
  if (!prompt) {
    outputDiv.innerHTML = "<div class='error'>Please paste a job description first!</div>";
    return;
  }
  
  // Show loading state
  outputDiv.innerHTML = "<div class='loading'>Analyzing job description and generating personalized questions...</div>";
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: CONFIG.AI_MODEL,
        messages: [
          {
            role: "system",
            content: CONFIG.SYSTEM_PROMPT
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    // Handle response
    if (!response.ok) {
      await handleApiError(response);
      return;
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Process and display results
    questionsData = parseInterviewQuestions(aiResponse);
    displayQuestions();

  } catch (error) {
    handleRequestError(error);
  }
}

/**
 * Handle API error responses
 */
async function handleApiError(response) {
  const outputDiv = document.getElementById("output");
  let errorData;
  
  try {
    errorData = await response.json();
  } catch (parseError) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const error = new Error(errorData.error || `HTTP ${response.status}`);
  error.response = {
    status: response.status,
    data: errorData
  };
  throw error;
}

/**
 * Handle request errors and display appropriate messages
 */
function handleRequestError(error) {
  console.error('[API ERROR]', error);
  
  const outputDiv = document.getElementById("output");
  let errorMessage = "Could not reach AI service. Please check your connection and try again.";
  let errorCode = "UNKNOWN_ERROR";
  
  // Parse different error types
  if (error.response) {
    // Server responded with an error status
    console.log('Server error response:', error.response.data);
    
    if (error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error;
      errorCode = error.response.data.code || "SERVER_ERROR";
    } else if (error.response.status === 413) {
      errorMessage = "Job description is too long. Please keep it under 10,000 characters.";
      errorCode = "CONTENT_TOO_LONG";
    } else if (error.response.status === 429) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
      errorCode = "RATE_LIMITED";
    } else if (error.response.status >= 500) {
      errorMessage = "Server error. Please try again later.";
      errorCode = "SERVER_ERROR";
    } else if (error.response.status === 400) {
      errorMessage = error.response.data?.error || "Invalid input. Please check your job description and try again.";
      errorCode = "VALIDATION_ERROR";
    }
  } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
    // Network/connection error
    errorMessage = "Unable to connect to the AI service. Please check your internet connection.";
    errorCode = "CONNECTION_ERROR";
  } else if (error.message) {
    // Use the error message if available
    errorMessage = error.message;
    errorCode = "REQUEST_ERROR";
  }
  
  // Display error
  outputDiv.innerHTML = `<div class='error'>${errorMessage}</div>`;
  console.error(`[${errorCode}] ${errorMessage}`, error);
}

/**
 * Parse AI response into structured question data
 */
function parseInterviewQuestions(text) {
  const lines = text.split('\n');
  const questions = [];
  let currentQuestion = '';
  let currentAnswer = '';
  let questionNumber = 0;

  lines.forEach(line => {
    line = line.trim();
    
    // Match numbered questions (1. 2. 3. etc.)
    const questionMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentAnswer) {
        questions.push({
          number: questionNumber,
          question: cleanText(currentQuestion),
          answer: cleanText(currentAnswer)
        });
      }
      
      questionNumber = parseInt(questionMatch[1]);
      currentQuestion = questionMatch[2];
      currentAnswer = '';
    } 
    // Match example answers
    else if (line.toLowerCase().includes('example answer:') || line.toLowerCase().includes('*example answer:*')) {
      currentAnswer = line.replace(/\*?example answer:\*?/i, '').trim();
    }
    // Continue building current question or answer
    else if (line && !questionMatch) {
      if (currentAnswer) {
        currentAnswer += ' ' + line;
      } else if (currentQuestion) {
        currentQuestion += ' ' + line;
      }
    }
  });

  // Don't forget the last question
  if (currentQuestion && currentAnswer) {
    questions.push({
      number: questionNumber,
      question: cleanText(currentQuestion),
      answer: cleanText(currentAnswer)
    });
  }

  return questions;
}

/**
 * Clean text by removing markdown formatting
 */
function cleanText(text) {
  return text
    .replace(/\*\*/g, '') // Remove ** markdown
    .replace(/\*/g, '')   // Remove * markdown
    .trim();
}

/**
 * Display parsed questions in the UI
 */
function displayQuestions() {
  const outputDiv = document.getElementById("output");
  
  if (questionsData.length === 0) {
    outputDiv.innerHTML = "<div class='error'>No questions could be generated. Please try with a different job description.</div>";
    return;
  }

  let html = `
    <div class="results-header">
      <h2 class="results-title">📝 Your Interview Questions (${questionsData.length})</h2>
      <button class="copy-all-btn" onclick="copyAllQuestions()">
        📋 Copy All Questions
      </button>
    </div>
  `;

  questionsData.forEach((qa, index) => {
    html += `
      <div class="question-card">
        <div class="question-header">
          <h3 class="question-text">
            <span class="question-icon">❓</span>
            <span>${qa.number || index + 1}. ${qa.question}</span>
          </h3>
          <div class="question-controls">
            <button class="copy-qa-btn" onclick="copyQuestionAnswer(${index})">
              📋 Copy Q&A
            </button>
          </div>
        </div>
        <div class="answer-section">
          <div class="answer-label">
            💡 Example Answer:
          </div>
          <p class="answer-text">${qa.answer}</p>
        </div>
      </div>
    `;
  });

  outputDiv.innerHTML = html;
}

/**
 * Copy individual question and answer
 */
function copyQuestionAnswer(index) {
  const qa = questionsData[index];
  const textToCopy = `Q: ${qa.question}\nA: ${qa.answer}`;
  
  copyToClipboard(textToCopy, 'Question & Answer copied!');
}

/**
 * Copy all questions and answers
 */
function copyAllQuestions() {
  let textToCopy = 'AI Interview Coach - Interview Questions\n\n';
  
  questionsData.forEach((qa, index) => {
    textToCopy += `${qa.number || index + 1}. ${qa.question}\n`;
    textToCopy += `   Answer: ${qa.answer}\n\n`;
  });
  
  copyToClipboard(textToCopy, 'All questions copied!');
}

/**
 * Copy text to clipboard and show notification
 */
function copyToClipboard(text, message) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(message);
    }).catch(err => {
      console.error('Failed to copy using Clipboard API:', err);
      fallbackCopyToClipboard(text, message);
    });
  } else {
    // Fallback for older browsers
    fallbackCopyToClipboard(text, message);
  }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopyToClipboard(text, message) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showNotification(message);
  } catch (err) {
    console.error('Failed to copy using fallback method:', err);
    showNotification('Copy failed. Please try again.');
  }
  
  document.body.removeChild(textArea);
}

/**
 * Show notification popup
 */
function showNotification(message) {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create new notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('[APP] AI Interview Coach initialized successfully');
  
  // Verify required elements exist
  const requiredElements = ['jobDescription', 'output'];
  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  
  if (missingElements.length > 0) {
    console.error('[APP] Missing required elements:', missingElements);
    return false;
  }
  
  return true;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}