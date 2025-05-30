/* ==========================================
   ADD THIS TO frontend/js/main.js - Enhanced Input Functions
   ========================================== */

/**
 * Handle textarea focus with visual feedback
 */
function handleTextareaFocus() {
  const wrapper = document.getElementById('textareaWrapper');
  if (wrapper) {
    wrapper.classList.add('focused');
  }
}

/**
 * Handle textarea blur
 */
function handleTextareaBlur() {
  const wrapper = document.getElementById('textareaWrapper');
  if (wrapper) {
    wrapper.classList.remove('focused');
  }
}

/**
 * Load example job description
 */
function loadExampleJob(jobType) {
  const textarea = document.getElementById('jobDescription');
  if (!textarea) return;

  // Track example usage - ADD THIS LINE
  window.aiCoachAnalytics?.trackExampleUsage(jobType);
  
  const examples = {
    'software-engineer': `Software Engineer - Full Stack Development
Company: TechCorp Inc.

We are looking for a talented Software Engineer to join our growing development team. You will be responsible for developing and maintaining web applications using modern technologies.

Key Responsibilities:
• Design and develop scalable web applications using React, Node.js, and Python
• Collaborate with cross-functional teams including product managers and designers
• Write clean, maintainable, and well-tested code
• Participate in code reviews and technical discussions
• Debug and resolve technical issues across the full stack
• Contribute to system architecture and technical decision-making

Requirements:
• Bachelor's degree in Computer Science or related field
• 3+ years of experience in full-stack development
• Proficiency in JavaScript, React, Node.js, and Python
• Experience with databases (PostgreSQL, MongoDB)
• Knowledge of version control systems (Git)
• Strong problem-solving skills and attention to detail
• Excellent communication and teamwork abilities

Preferred Qualifications:
• Experience with cloud platforms (AWS, GCP)
• Knowledge of containerization (Docker, Kubernetes)
• Familiarity with CI/CD pipelines
• Experience with testing frameworks (Jest, Cypress)

Benefits:
• Competitive salary and equity package
• Health, dental, and vision insurance
• Flexible work arrangements
• Professional development opportunities
• Modern office with latest technology`,

    'product-manager': `Product Manager - Digital Platform
Company: InnovateTech Solutions

We are seeking an experienced Product Manager to lead our digital platform initiatives and drive product strategy for our B2B solutions.

Role Overview:
As a Product Manager, you will be responsible for defining product vision, strategy, and roadmap while working closely with engineering, design, and business stakeholders.

Key Responsibilities:
• Define and execute product strategy and roadmap for digital platform
• Conduct market research and competitive analysis
• Gather and prioritize product requirements from stakeholders
• Work closely with engineering teams to deliver high-quality products
• Analyze product metrics and user feedback to drive improvements
• Collaborate with sales and marketing teams on go-to-market strategies
• Present product updates to leadership and stakeholders

Required Qualifications:
• Bachelor's degree in Business, Engineering, or related field
• 4+ years of product management experience in B2B software
• Strong analytical and problem-solving skills
• Experience with product management tools (Jira, Confluence, Figma)
• Understanding of software development processes
• Excellent written and verbal communication skills
• Data-driven approach to decision making

Preferred Qualifications:
• MBA or advanced degree
• Experience in SaaS or platform products
• Technical background or engineering experience
• Knowledge of agile methodologies
• Experience with A/B testing and analytics tools

What We Offer:
• Competitive compensation package
• Stock options
• Comprehensive health benefits
• Remote-first work culture
• Learning and development budget`,

    'data-scientist': `Senior Data Scientist - Machine Learning
Company: DataDriven Analytics

Join our data science team to build cutting-edge machine learning solutions that drive business impact across our organization.

Position Summary:
We are looking for a Senior Data Scientist with expertise in machine learning and statistical analysis to help us solve complex business problems through data-driven insights.

Responsibilities:
• Design and implement machine learning models for predictive analytics
• Analyze large datasets to identify trends and business opportunities  
• Collaborate with product and engineering teams to deploy ML models
• Develop statistical models and algorithms for data analysis
• Create data visualizations and reports for stakeholders
• Mentor junior data scientists and analysts
• Stay current with latest developments in ML and data science

Required Skills:
• Master's or PhD in Data Science, Statistics, Computer Science, or related field
• 5+ years of experience in data science and machine learning
• Proficiency in Python, R, SQL, and data manipulation libraries
• Experience with ML frameworks (scikit-learn, TensorFlow, PyTorch)
• Strong statistical analysis and modeling skills
• Experience with big data technologies (Spark, Hadoop)
• Knowledge of cloud platforms (AWS, GCP, Azure)
• Excellent problem-solving and communication skills

Preferred Qualifications:
• Experience with deep learning and neural networks
• Knowledge of MLOps and model deployment practices
• Experience with A/B testing and experimental design
• Background in specific domains (NLP, computer vision, etc.)
• Publications in peer-reviewed journals or conferences

Benefits Package:
• Competitive salary with performance bonuses
• Comprehensive health and retirement benefits
• Flexible working hours and remote options
• Conference attendance and learning opportunities
• State-of-the-art computing resources`,

    'marketing-manager': `Marketing Manager - Digital Growth
Company: GrowthCo Marketing

We are seeking a results-driven Marketing Manager to lead our digital marketing initiatives and drive customer acquisition and engagement.

Job Description:
As a Marketing Manager, you will develop and execute comprehensive marketing strategies across multiple channels to drive brand awareness and revenue growth.

Key Responsibilities:
• Develop and implement integrated marketing campaigns across digital channels
• Manage social media strategy and content calendar
• Oversee email marketing campaigns and automation workflows
• Analyze marketing performance metrics and ROI
• Collaborate with sales team to generate and nurture leads
• Manage marketing budget and vendor relationships
• Create compelling content for various marketing channels
• Conduct market research and competitive analysis

Requirements:
• Bachelor's degree in Marketing, Communications, or related field
• 3-5 years of marketing experience, preferably in B2B or SaaS
• Proficiency in marketing automation tools (HubSpot, Marketo)
• Experience with Google Analytics, Google Ads, and social media platforms
• Strong project management and organizational skills
• Excellent written and verbal communication abilities
• Creative thinking with analytical mindset
• Experience with content management systems

Preferred Qualifications:
• Digital marketing certifications (Google, Facebook, HubSpot)
• Experience with SEO/SEM and conversion optimization
• Knowledge of design tools (Canva, Adobe Creative Suite)
• Event marketing and webinar experience
• Understanding of sales funnels and customer journey mapping

Compensation & Benefits:
• Competitive base salary plus performance incentives
• Health, dental, and vision insurance
• 401(k) with company matching
• Flexible PTO policy
• Professional development opportunities
• Modern office environment with remote work options`,

    'sales-rep': `Sales Representative - Software Solutions
Company: SalesTech Pro

Join our dynamic sales team to drive revenue growth by selling innovative software solutions to businesses across various industries.

Position Overview:
We are looking for a motivated Sales Representative to identify prospects, build relationships, and close deals while representing our cutting-edge software products.

Primary Responsibilities:
• Generate new business opportunities through prospecting and lead qualification
• Conduct product demonstrations and presentations to potential clients
• Build and maintain strong relationships with existing and prospective customers
• Negotiate contracts and close sales deals
• Meet and exceed monthly and quarterly sales targets
• Collaborate with marketing team on lead generation campaigns
• Maintain accurate records in CRM system (Salesforce)
• Provide customer feedback to product development team

Required Qualifications:
• Bachelor's degree in Business, Marketing, or related field
• 2+ years of B2B sales experience, preferably in software/technology
• Proven track record of meeting sales quotas
• Strong communication and presentation skills
• Experience with CRM systems and sales tools
• Self-motivated with strong work ethic
• Ability to work in fast-paced, team-oriented environment
• Willingness to travel (up to 25%)

Preferred Experience:
• SaaS or software sales background
• Experience selling to C-level executives
• Knowledge of consultative selling techniques
• Familiarity with sales methodologies (SPIN, Challenger, etc.)
• Previous success in outbound prospecting

Compensation Package:
• Base salary: $50,000 - $65,000
• Uncapped commission potential
• Comprehensive benefits package
• Company car or car allowance
• Sales incentive trips and bonuses
• Career advancement opportunities`
  };
  
  const example = examples[jobType];
  if (example) {
    textarea.value = example;
    updateCharacterCount();
    
    // Add visual feedback
    textarea.style.background = '#f0f9ff';
    setTimeout(() => {
      textarea.style.background = '';
    }, 1000);
    
    // Scroll to textarea
    textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    console.log(`[EXAMPLES] Loaded ${jobType} example`);
  }
}


/**
 * Show resume summary section after job description is filled
 */
function showResumeSummarySection() {
  const resumeSection = document.getElementById('resumeSummarySection');
  const jobDescription = document.getElementById('jobDescription');
  
  if (resumeSection && jobDescription && jobDescription.value.trim().length > 50) {
    resumeSection.style.display = 'block';
    resumeSection.classList.add('active');
    
    // Smooth scroll to resume section
    setTimeout(() => {
      resumeSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }, 300);
    
    console.log('[RESUME] Summary section shown');
    
    // Track section reveal
    window.aiCoachAnalytics?.track('resume_section_shown', {
      job_description_length: jobDescription.value.length
    });
  }
}

/**
 * Hide resume summary section if job description is cleared
 */
function hideResumeSummarySection() {
  const resumeSection = document.getElementById('resumeSummarySection');
  const jobDescription = document.getElementById('jobDescription');
  
  if (resumeSection && jobDescription && jobDescription.value.trim().length < 50) {
    resumeSection.style.display = 'none';
    resumeSection.classList.remove('active');
    
    // Clear resume summary too
    const resumeTextarea = document.getElementById('resumeSummary');
    if (resumeTextarea) {
      resumeTextarea.value = '';
      updateResumeCharacterCount();
    }
    
    console.log('[RESUME] Summary section hidden');
  }
}

/**
 * Load resume example based on industry and level
 * @param {string} industry - Industry key (tech, finance, etc.)
 * @param {string} level - Experience level (entry, mid, senior)
 */
function loadResumeExample(industry, level) {
  const textarea = document.getElementById('resumeSummary');
  if (!textarea) {
    console.error('[RESUME] Resume textarea not found');
    return;
  }
  
  // Get example from the RESUME_EXAMPLES data
  const example = getResumeExample(industry, level);
  
  if (example) {
    textarea.value = example;
    updateResumeCharacterCount();
    
    // Visual feedback
    textarea.style.background = '#f0f9ff';
    setTimeout(() => {
      textarea.style.background = '';
    }, 1000);
    
    // Focus textarea
    textarea.focus();
    
    // Track example usage
    window.aiCoachAnalytics?.track('resume_example_used', {
      industry: industry,
      level: level,
      example_length: example.length
    });
    
    console.log(`[RESUME] Loaded ${industry}-${level} example`);
  } else {
    console.error(`[RESUME] No example found for ${industry}-${level}`);
    showNotification('Example not found. Please try another option.', 'error');
  }
}

/**
 * Update character count for resume summary
 */
function updateResumeCharacterCount() {
  const textarea = document.getElementById('resumeSummary');
  const charCount = document.getElementById('resumeCharCount');
  const charStatus = document.getElementById('resumeCharStatus');
  const charWarning = document.getElementById('resumeCharWarning');
  const wrapper = document.getElementById('resumeTextareaWrapper');
  
  if (!textarea || !charCount || !charStatus) {
    console.error('[RESUME] Character counter elements not found');
    return;
  }
  
  const currentLength = textarea.value.length;
  const maxLength = 800; // ATS-friendly limit
  const optimalLength = 500; // Sweet spot for ATS
  
  // Update counter display
  charCount.textContent = currentLength.toLocaleString();
  
  // Remove all existing classes
  charCount.className = '';
  charStatus.className = 'char-status';
  if (wrapper) {
    wrapper.classList.remove('char-warning', 'char-danger');
  }
  if (charWarning) {
    charWarning.style.display = 'none';
    charWarning.className = 'char-warning';
  }
  
  // Determine status and apply appropriate styling
  if (currentLength === 0) {
    charStatus.textContent = '';
  } else if (currentLength < 100) {
    charCount.className = 'char-warning';
    charStatus.textContent = 'Too short - add more details';
    charStatus.classList.add('char-warning');
  } else if (currentLength <= optimalLength) {
    // Optimal range (100-500 characters)
    charCount.className = 'char-safe';
    charStatus.textContent = '✅ Perfect length for ATS';
    charStatus.classList.add('char-safe');
  } else if (currentLength <= maxLength * 0.9) {
    // Good range (500-720 characters)
    charCount.className = 'char-safe';
    charStatus.textContent = '✅ Good length';
    charStatus.classList.add('char-safe');
  } else if (currentLength <= maxLength) {
    // Warning zone (720-800 characters)
    charCount.className = 'char-warning';
    charStatus.textContent = '⚠️ Getting long';
    charStatus.classList.add('char-warning');
    if (wrapper) wrapper.classList.add('char-warning');
    
    if (charWarning) {
      const remaining = maxLength - currentLength;
      charWarning.innerHTML = `<strong>Notice:</strong> ${remaining} characters remaining. Consider keeping it concise for ATS systems.`;
      charWarning.style.display = 'block';
    }
  } else {
    // Over limit (800+ characters)
    charCount.className = 'char-danger';
    charStatus.textContent = '❌ Too long for ATS';
    charStatus.classList.add('char-danger');
    if (wrapper) wrapper.classList.add('char-danger');
    
    if (charWarning) {
      const overBy = currentLength - maxLength;
      charWarning.innerHTML = `<strong>Warning:</strong> ${overBy} characters over ATS-friendly limit. Please shorten for better results.`;
      charWarning.style.display = 'block';
      charWarning.classList.add('error');
    }
  }
}

/**
 * Handle resume textarea focus
 */
function handleResumeTextareaFocus() {
  const wrapper = document.getElementById('resumeTextareaWrapper');
  if (wrapper) {
    wrapper.classList.add('focused');
  }
  
  // Track engagement
  window.aiCoachAnalytics?.track('resume_textarea_focused', {
    current_length: document.getElementById('resumeSummary')?.value.length || 0
  });
}

/**
 * Handle resume textarea blur
 */
function handleResumeTextareaBlur() {
  const wrapper = document.getElementById('resumeTextareaWrapper');
  if (wrapper) {
    wrapper.classList.remove('focused');
  }
  
  // Track completion if user added content
  const textarea = document.getElementById('resumeSummary');
  if (textarea && textarea.value.trim().length > 0) {
    window.aiCoachAnalytics?.track('resume_summary_completed', {
      final_length: textarea.value.length,
      is_ats_compliant: textarea.value.length <= 800
    });
  }
}

/**
 * Get resume summary input value
 * @returns {string} Resume summary text or empty string
 */
function getResumeSummary() {
  const textarea = document.getElementById('resumeSummary');
  return textarea ? textarea.value.trim() : '';
}

/**
 * Enhanced job description input handler with resume section toggle
 * Call this function when job description changes
 */
function handleJobDescriptionChange() {
  const jobDescription = document.getElementById('jobDescription');
  if (!jobDescription) return;
  
  const length = jobDescription.value.trim().length;
  
  // Show resume section when job description has enough content
  if (length > 50) {
    showResumeSummarySection();
  } else {
    hideResumeSummarySection();
  }
}

/**
 * Initialize resume summary functionality
 */
function initializeResumeSummary() {
  const jobDescriptionTextarea = document.getElementById('jobDescription');
  const resumeTextarea = document.getElementById('resumeSummary');
  
  if (jobDescriptionTextarea) {
    // Add event listener to job description to show/hide resume section
    jobDescriptionTextarea.addEventListener('input', handleJobDescriptionChange);
    jobDescriptionTextarea.addEventListener('paste', () => {
      // Handle paste events with slight delay
      setTimeout(handleJobDescriptionChange, 100);
    });
  }
  
  if (resumeTextarea) {
    // Initialize character count
    updateResumeCharacterCount();
    
    // Add paste event listener for character count update
    resumeTextarea.addEventListener('paste', () => {
      setTimeout(updateResumeCharacterCount, 10);
    });
  }
  
  console.log('[RESUME] Summary functionality initialized');
}

/**
 * Clear resume summary
 */
function clearResumeSummary() {
  const textarea = document.getElementById('resumeSummary');
  if (textarea) {
    textarea.value = '';
    updateResumeCharacterCount();
    
    // Track clearing
    window.aiCoachAnalytics?.track('resume_summary_cleared');
    
    console.log('[RESUME] Summary cleared');
  }
}

/**
 * Validate resume summary for ATS compliance
 * @returns {object} Validation result with recommendations
 */
function validateResumeSummary() {
  const summary = getResumeSummary();
  const validation = {
    isValid: true,
    warnings: [],
    recommendations: [],
    atsScore: 100
  };
  
  if (summary.length === 0) {
    validation.warnings.push('No resume summary provided');
    validation.recommendations.push('Add a brief professional summary for better personalization');
    return validation;
  }
  
  // Length validation
  if (summary.length < 100) {
    validation.warnings.push('Summary is very short');
    validation.recommendations.push('Add more details about your experience and achievements');
    validation.atsScore -= 20;
  } else if (summary.length > 800) {
    validation.isValid = false;
    validation.warnings.push('Summary exceeds ATS-friendly length');
    validation.recommendations.push('Shorten to under 800 characters for better ATS compatibility');
    validation.atsScore -= 30;
  }
  
  // Content validation
  const hasNumbers = /\d/.test(summary);
  const hasExperience = /\b(\d+\s*(year|yr|month|experience|exp))/i.test(summary);
  const hasSkills = summary.length > 200; // Assume longer summaries have more skills
  
  if (!hasNumbers) {
    validation.recommendations.push('Consider adding quantifiable achievements (numbers, percentages)');
    validation.atsScore -= 10;
  }
  
  if (!hasExperience) {
    validation.recommendations.push('Mention your years of experience or career level');
    validation.atsScore -= 15;
  }
  
  return validation;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeResumeSummary);
} else {
  initializeResumeSummary();
}