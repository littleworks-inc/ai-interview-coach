/* ==========================================
   AI Interview Coach - Unified Navigation JavaScript
   ========================================== */

class UnifiedNavigation {
  constructor() {
    this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
    this.mainNav = document.getElementById('mainNav');
    this.currentPage = this.getCurrentPage();
    
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setActiveNavigation();
    this.setupScrollBehavior();
    
    console.log('[UNIFIED NAV] Initialized for page:', this.currentPage);
  }

  setupMobileMenu() {
    if (!this.mobileMenuToggle || !this.mainNav) {
      console.log('[UNIFIED NAV] Mobile menu elements not found');
      return;
    }

    this.mobileMenuToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.closeMobileMenu();
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!this.mainNav.contains(event.target) && 
          !this.mobileMenuToggle.contains(event.target)) {
        this.closeMobileMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    const isOpen = this.mainNav.classList.contains('mobile-open');
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.mainNav.classList.add('mobile-open');
    this.mobileMenuToggle.textContent = '✕';
    this.mobileMenuToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    this.mainNav.classList.remove('mobile-open');
    this.mobileMenuToggle.textContent = '☰';
    this.mobileMenuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    const pageMap = {
      'index.html': 'home',
      '': 'home',
      'app.html': 'app',
      'tips.html': 'tips'
    };
    
    return pageMap[filename] || 'unknown';
  }

  setActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    let activeSelector = null;
    
    switch (this.currentPage) {
      case 'app':
        activeSelector = '[data-page="app"]';
        break;
      case 'tips':
        activeSelector = '[data-page="tips"]';
        break;
    }

    if (activeSelector) {
      const activeLink = document.querySelector(activeSelector);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }

  setupScrollBehavior() {
    const hashLinks = document.querySelectorAll('a[href*="#"]');
    
    hashLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  handleHashOnLoad() {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const targetElement = document.getElementById(hash.substring(1));
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.unifiedNavigation = new UnifiedNavigation();
    window.unifiedNavigation.handleHashOnLoad();
  });
} else {
  window.unifiedNavigation = new UnifiedNavigation();
  window.unifiedNavigation.handleHashOnLoad();
}