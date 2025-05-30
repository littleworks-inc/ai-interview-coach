/* ==========================================
   AI Interview Coach - Validation UI Manager
   ========================================== */

/**
 * Manages validation UI feedback and visual states
 */
class ValidationUI {
  constructor() {
    this.validationStates = {
      job: { isValid: true, canProceed: true },
      resume: { isValid: true, canProceed: true }
    };
    
    this.initialize();
  }

  /**
   * Initialize validation UI
   */
  initialize() {
    this.setupJobDescriptionValidation();
    this.setupResumeSummaryValidation();
    this.setupGenerateButtonControl();
    
    console.log('[VALIDATION UI] Initialized');
  }

  /**
   * Setup job description real-time validation
   */
  setupJobDescriptionValidation() {
    const textarea = document.getElementById('jobDescription');
    const wrapper = document.getElementById('textareaWrapper');
    
    if (!textarea || !wrapper) return;

    // Add validation feedback container
    this.createValidationFeedback('job', wrapper);

    // Setup real-time validation
    textarea.addEventListener('input', (e) => {
      const text = e.target.value;
      
      // Update character count (existing functionality)
      if (typeof updateCharacterCount === 'function') {
        updateCharacterCount();
      }
      
      // Show validation feedback (new)
      window.contentValidator.validateJobDescription(text, (result) => {
        this.updateValidationFeedback('job', result);
        this.validationStates.job = result;
        this.updateGenerateButtonState();
      });
    });

    // Initial validation
    if (textarea.value.trim()) {
      window.contentValidator.validateJobDescription(textarea.value, (result) => {
        this.updateValidationFeedback('job', result);
        this.validationStates.job = result;
      });
    }
  }

  /**
   * Setup resume summary real-time validation
   */
  setupResumeSummaryValidation() {
    const textarea = document.getElementById('resumeSummary');
    const wrapper = document.getElementById('resumeTextareaWrapper');
    
    if (!textarea || !wrapper) return;

    // Add validation feedback container
    this.createValidationFeedback('resume', wrapper);

    // Setup real-time validation
    textarea.addEventListener('input', (e) => {
      const text = e.target.value;
      
      // Update character count (existing functionality)
      if (typeof updateResumeCharacterCount === 'function') {
        updateResumeCharacterCount();
      }
      
      // Show validation feedback (new)
      window.contentValidator.validateResumeSummary(text, (result) => {
        this.updateValidationFeedback('resume', result);
        this.validationStates.resume = result;
        this.updateGenerateButtonState();
      });
    });

    // Initial validation
    if (textarea.value.trim()) {
      window.contentValidator.validateResumeSummary(textarea.value, (result) => {
        this.updateValidationFeedback('resume', result);
        this.validationStates.resume = result;
      });
    }
  }

  /**
   * Create validation feedback container
   */
  createValidationFeedback(type, wrapper) {
    const feedbackId = `${type}-validation-feedback`;
    
    // Remove existing feedback
    const existing = document.getElementById(feedbackId);
    if (existing) {
      existing.remove();
    }

    // Create new feedback container
    const feedback = document.createElement('div');
    feedback.id = feedbackId;
    feedback.className = 'validation-feedback';
    feedback.style.display = 'none';
    
    // Insert after the wrapper
    wrapper.parentNode.insertBefore(feedback, wrapper.nextSibling);
  }

  /**
   * Update validation feedback display
   */
  updateValidationFeedback(type, result) {
    const feedbackContainer = document.getElementById(`${type}-validation-feedback`);
    if (!feedbackContainer) return;

    // Clear previous content
    feedbackContainer.innerHTML = '';
    feedbackContainer.className = 'validation-feedback';

    // If no issues, hide feedback
    if (result.errors.length === 0 && result.warnings.length === 0 && result.suggestions.length === 0) {
      feedbackContainer.style.display = 'none';
      return;
    }

    // Show feedback container
    feedbackContainer.style.display = 'block';

    // Add errors
    if (result.errors.length > 0) {
      feedbackContainer.classList.add('has-errors');
      const errorsDiv = this.createFeedbackSection('errors', result.errors, '❌');
      feedbackContainer.appendChild(errorsDiv);
    }

    // Add warnings
    if (result.warnings.length > 0) {
      feedbackContainer.classList.add('has-warnings');
      const warningsDiv = this.createFeedbackSection('warnings', result.warnings, '⚠️');
      feedbackContainer.appendChild(warningsDiv);
    }

    // Add suggestions (limit to 3 most important)
    if (result.suggestions.length > 0) {
      const topSuggestions = result.suggestions.slice(0, 3);
      const suggestionsDiv = this.createFeedbackSection('suggestions', topSuggestions, '💡');
      feedbackContainer.appendChild(suggestionsDiv);
    }

    // Add quality score if available
    if (result.scores && (result.scores.quality > 0 || result.scores.overall > 0)) {
      const score = result.scores.overall || result.scores.quality || 0;
      const scoreDiv = this.createScoreDisplay(score, type);
      feedbackContainer.appendChild(scoreDiv);
    }
  }

  /**
   * Create feedback section (errors, warnings, suggestions)
   */
  createFeedbackSection(type, items, icon) {
    const section = document.createElement('div');
    section.className = `feedback-section feedback-${type}`;
    
    const header = document.createElement('div');
    header.className = 'feedback-header';
    header.innerHTML = `<span class="feedback-icon">${icon}</span><span class="feedback-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`;
    
    const list = document.createElement('ul');
    list.className = 'feedback-list';
    
    items.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = typeof item === 'string' ? item : item.message;
      list.appendChild(listItem);
    });
    
    section.appendChild(header);
    section.appendChild(list);
    
    return section;
  }

  /**
   * Create quality score display
   */
  createScoreDisplay(score, type) {
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'quality-score';
    
    let scoreClass = 'score-good';
    let scoreLabel = 'Good';
    
    if (score < 40) {
      scoreClass = 'score-poor';
      scoreLabel = 'Needs Improvement';
    } else if (score < 70) {
      scoreClass = 'score-fair';
      scoreLabel = 'Fair';
    }
    
    scoreDiv.innerHTML = `
      <div class="score-container">
        <span class="score-label">Quality Score:</span>
        <span class="score-value ${scoreClass}">${score}/100</span>
        <span class="score-text">${scoreLabel}</span>
      </div>
    `;
    
    return scoreDiv;
  }

  /**
   * Setup generate button state control
   */
  setupGenerateButtonControl() {
    this.generateButton = document.querySelector('.generate-btn');
    if (this.generateButton) {
      // Store original onclick handler
      this.originalOnClick = this.generateButton.onclick;
      this.generateButton.onclick = (e) => {
        if (!this.canProceedWithGeneration()) {
          e.preventDefault();
          this.showValidationModal();
          return false;
        }
        // Call original handler if validation passes
        if (this.originalOnClick) {
          return this.originalOnClick(e);
        }
      };
    }
  }

  /**
   * Update generate button state based on validation
   */
  updateGenerateButtonState() {
    if (!this.generateButton) return;

    const canProceed = this.canProceedWithGeneration();
    
    if (canProceed) {
      this.generateButton.disabled = false;
      this.generateButton.classList.remove('validation-blocked');
      this.generateButton.title = '';
    } else {
      // Don't disable, but add visual indication
      this.generateButton.classList.add('validation-blocked');
      this.generateButton.title = 'Please fix validation issues before generating questions';
    }
  }

  /**
   * Check if generation can proceed
   */
  canProceedWithGeneration() {
    return this.validationStates.job.canProceed && this.validationStates.resume.canProceed;
  }

  /**
   * Show validation modal when user tries to generate with issues
   */
  showValidationModal() {
    const modal = this.createValidationModal();
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Auto-remove after user interaction or timeout
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 10000);
  }

  /**
   * Create validation modal
   */
  createValidationModal() {
    const modal = document.createElement('div');
    modal.className = 'validation-modal';
    
    const issues = [];
    
    if (!this.validationStates.job.canProceed) {
      issues.push(...this.validationStates.job.errors);
    }
    
    if (!this.validationStates.resume.canProceed) {
      issues.push(...this.validationStates.resume.errors);
    }
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>⚠️ Please Fix Validation Issues</h3>
          <button class="modal-close" onclick="this.closest('.validation-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p>Please resolve the following issues before generating questions:</p>
          <ul>
            ${issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" onclick="this.closest('.validation-modal').remove()">
            I'll Fix These Issues
          </button>
        </div>
      </div>
    `;
    
    return modal;
  }
}

// Initialize validation UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.validationUI = new ValidationUI();
  });
} else {
  window.validationUI = new ValidationUI();
}