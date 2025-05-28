/* ==========================================
   AI Interview Coach - Character Counter
   ========================================== */

/**
 * Update character count and provide visual feedback
 */
function updateCharacterCount() {
  const textarea = document.getElementById('jobDescription');
  const charCount = document.getElementById('charCount');
  const charStatus = document.getElementById('charStatus');
  const charWarning = document.getElementById('charWarning');
  const generateBtn = document.querySelector('.generate-btn');
  
  if (!textarea || !charCount || !charStatus || !charWarning || !generateBtn) {
    console.error('[CHARACTER COUNTER] Required elements not found');
    return;
  }
  
  const currentLength = textarea.value.length;
  const maxLength = 10000;
  const minLength = 10;
  
  // Update counter display
  charCount.textContent = currentLength.toLocaleString();
  
  // Remove all existing classes
  charCount.className = '';
  charStatus.className = 'char-status';
  textarea.classList.remove('char-warning', 'char-danger', 'char-over');
  charWarning.style.display = 'none';
  charWarning.className = 'char-warning';
  
  // Determine status and apply appropriate styling
  if (currentLength === 0) {
    charStatus.textContent = '';
  } else if (currentLength < minLength) {
    charCount.className = 'char-warning';
    charStatus.textContent = `${minLength - currentLength} more needed`;
    charStatus.classList.add('char-warning');
  } else if (currentLength <= maxLength * 0.7) {
    // Safe zone (0-70%)
    charCount.className = 'char-safe';
    charStatus.textContent = '✅ Good length';
    charStatus.classList.add('char-safe');
  } else if (currentLength <= maxLength * 0.9) {
    // Warning zone (70-90%)
    charCount.className = 'char-warning';
    charStatus.textContent = '⚠️ Getting long';
    charStatus.classList.add('char-warning');
    textarea.classList.add('char-warning');
  } else if (currentLength <= maxLength) {
    // Danger zone (90-100%)
    charCount.className = 'char-danger';
    charStatus.textContent = '🔥 Almost at limit';
    charStatus.classList.add('char-danger');
    textarea.classList.add('char-danger');
    
    const remaining = maxLength - currentLength;
    charWarning.innerHTML = `<strong>Warning:</strong> Only ${remaining} characters remaining. Consider shortening your job description.`;
    charWarning.style.display = 'block';
  } else {
    // Over limit
    const overBy = currentLength - maxLength;
    charCount.className = 'char-over';
    charStatus.textContent = `❌ ${overBy.toLocaleString()} over limit`;
    charStatus.classList.add('char-over');
    textarea.classList.add('char-over');
    
    charWarning.innerHTML = `<strong>Error:</strong> Your job description is ${overBy.toLocaleString()} characters too long. Please reduce the length to continue.`;
    charWarning.style.display = 'block';
    charWarning.classList.add('error');
    
    // Disable generate button when over limit
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.5';
    generateBtn.style.cursor = 'not-allowed';
    return;
  }
  
  // Re-enable generate button if it was disabled
  generateBtn.disabled = false;
  generateBtn.style.opacity = '1';
  generateBtn.style.cursor = 'pointer';
}

/**
 * Initialize character counter when page loads
 */
function initializeCharacterCounter() {
  const textarea = document.getElementById('jobDescription');
  
  if (textarea) {
    // Set initial count
    updateCharacterCount();
    
    // Add event listeners
    textarea.addEventListener('input', updateCharacterCount);
    textarea.addEventListener('paste', function() {
      // Update count after paste event completes
      setTimeout(updateCharacterCount, 10);
    });
    
    console.log('[CHARACTER COUNTER] Initialized successfully');
  } else {
    console.error('[CHARACTER COUNTER] Textarea not found during initialization');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCharacterCounter);
} else {
  initializeCharacterCounter();
}