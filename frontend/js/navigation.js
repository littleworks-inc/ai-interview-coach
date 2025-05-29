/* ==========================================
   AI Interview Coach - Navigation JavaScript
   ========================================== */

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  
  if (!mobileMenuToggle || !mainNav) {
    console.log('[NAV] Mobile menu elements not found');
    return;
  }
  
  // Toggle mobile menu
  mobileMenuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('mobile-open');
    
    // Update toggle icon
    if (mainNav.classList.contains('mobile-open')) {
      mobileMenuToggle.textContent = '✕';
      mobileMenuToggle.setAttribute('aria-label', 'Close menu');
    } else {
      mobileMenuToggle.textContent = '☰';
      mobileMenuToggle.setAttribute('aria-label', 'Open menu');
    }
  });
  
  // Close menu when clicking nav links on mobile
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        mainNav.classList.remove('mobile-open');
        mobileMenuToggle.textContent = '☰';
        mobileMenuToggle.setAttribute('aria-label', 'Open menu');
      }
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!mainNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
      mainNav.classList.remove('mobile-open');
      mobileMenuToggle.textContent = '☰';
      mobileMenuToggle.setAttribute('aria-label', 'Open menu');
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mainNav.classList.remove('mobile-open');
      mobileMenuToggle.textContent = '☰';
      mobileMenuToggle.setAttribute('aria-label', 'Open menu');
    }
  });
  
  console.log('[NAV] Navigation initialized successfully');
}

/**
 * Handle coming soon links
 */
function handleComingSoonLinks() {
  const comingSoonLinks = document.querySelectorAll('.nav-link.coming-soon');
  
  comingSoonLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Show coming soon notification
      showComingSoonNotification(link.textContent.trim());
    });
  });
}

/**
 * Show coming soon notification
 */
function showComingSoonNotification(featureName) {
  // Remove existing notification
  const existingNotification = document.querySelector('.coming-soon-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'coming-soon-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">🚀</span>
      <div class="notification-text">
        <strong>${featureName}</strong> is coming soon!
        <br>
        <small>Follow our roadmap for updates</small>
      </div>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    z-index: 1000;
    max-width: 300px;
    animation: slideInRight 0.3s ease;
  `;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .notification-icon {
      font-size: 24px;
    }
    .notification-text {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
    }
    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }
    .notification-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `;
  
  if (!document.querySelector('#coming-soon-styles')) {
    style.id = 'coming-soon-styles';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 4000);
}

/**
 * Set active navigation item based on current page
 */
function setActiveNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link:not(.coming-soon)');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index.html') ||
        (currentPage === 'index.html' && linkPage === 'index.html') ||
        (currentPage === 'tips.html' && linkPage === 'tips.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    handleComingSoonLinks();
    setActiveNavigation();
  });
} else {
  initializeNavigation();
  handleComingSoonLinks();
  setActiveNavigation();
}