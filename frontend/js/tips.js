/* ==========================================
   AI Interview Coach - Tips Page JavaScript
   ========================================== */

/**
 * Show specific category and update navigation
 */
function showCategory(categoryId) {
  // Hide all category content
  const allContent = document.querySelectorAll('.category-content');
  allContent.forEach(content => {
    content.classList.remove('active');
  });
  
  // Show selected category
  const selectedContent = document.getElementById(categoryId);
  if (selectedContent) {
    selectedContent.classList.add('active');
  }
  
  // Update navigation buttons
  const allButtons = document.querySelectorAll('.category-btn');
  allButtons.forEach(btn => {
    if (btn.dataset.category === categoryId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Scroll to top of content
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  console.log('[TIPS PAGE] Showing category:', categoryId);
}

/**
 * Initialize tips page
 */
function initializeTipsPage() {
  console.log('[TIPS PAGE] Initializing...');
  
  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Numbers 1-5 to switch categories
    if (e.key >= '1' && e.key <= '5') {
      const categories = ['communication', 'technical', 'behavioral', 'body-language', 'preparation'];
      const categoryIndex = parseInt(e.key) - 1;
      if (categories[categoryIndex]) {
        showCategory(categories[categoryIndex]);
      }
    }
    
    // Ctrl+P for print
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      window.print();
    }
  });
  
  // Add smooth scroll for better UX
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Log initialization
  console.log('[TIPS PAGE] Initialized successfully');
  console.log('[TIPS PAGE] Keyboard shortcuts: 1-5 for categories, Ctrl+P to print');
}

/**
 * Add click handlers for better mobile support
 */
function addMobileSupport() {
  // Add touch-friendly interactions
  const categoryButtons = document.querySelectorAll('.category-btn');
  
  categoryButtons.forEach(btn => {
    // Add visual feedback for touch
    btn.addEventListener('touchstart', () => {
      btn.style.transform = 'translateY(-1px) scale(0.98)';
    });
    
    btn.addEventListener('touchend', () => {
      btn.style.transform = '';
    });
  });
}

/**
 * Handle print functionality
 */
function setupPrintSupport() {
  // Show all categories when printing
  window.addEventListener('beforeprint', () => {
    const allContent = document.querySelectorAll('.category-content');
    allContent.forEach(content => {
      content.classList.add('active');
    });
  });
  
  // Restore original state after printing
  window.addEventListener('afterprint', () => {
    const allContent = document.querySelectorAll('.category-content');
    allContent.forEach((content, index) => {
      if (index !== 0) { // Keep first category active
        content.classList.remove('active');
      }
    });
  });
}

/**
 * Add accessibility improvements
 */
function enhanceAccessibility() {
  // Add ARIA labels
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(btn => {
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', btn.classList.contains('active'));
  });
  
  // Add table accessibility
  const tables = document.querySelectorAll('.tips-table');
  tables.forEach(table => {
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Interview tips table');
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeTipsPage();
    addMobileSupport();
    setupPrintSupport();
    enhanceAccessibility();
  });
} else {
  initializeTipsPage();
  addMobileSupport();
  setupPrintSupport();
  enhanceAccessibility();
}