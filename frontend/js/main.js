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