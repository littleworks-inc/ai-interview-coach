/* ==========================================
   AI Interview Coach - Resume Summary Examples
   ATS-Compliant Examples (800 char limit)
   ========================================== */

const RESUME_EXAMPLES = {
  // Technology Industry
  tech: {
    entry: "Recent Computer Science graduate with 1 year internship experience at tech startup. Proficient in JavaScript, React, and Python with strong problem-solving skills. Built 3 web applications during internship, improved user interface loading speed by 30%. Eager to contribute to innovative software development team.",
    
    mid: "5 years full-stack development experience specializing in React, Node.js, and AWS cloud services. Led development of 12+ web applications serving 50K+ daily users. Mentored 3 junior developers and improved team code quality by 40%. Strong expertise in agile methodology and API integration.",
    
    senior: "12+ years engineering leadership experience managing teams of 15+ developers. Architected scalable systems handling 1M+ transactions daily, reduced infrastructure costs by 35%. Expert in microservices, cloud architecture, and DevOps practices. Proven track record of delivering complex projects on time and within budget."
  },

  // Finance Industry  
  finance: {
    entry: "Recent Finance graduate with internship experience at investment firm. Skilled in financial modeling, Excel, and data analysis with strong attention to detail. Assisted in managing $5M portfolio, prepared 20+ financial reports with 99% accuracy. Seeking growth opportunities in financial analysis and planning.",
    
    mid: "6 years financial analysis experience specializing in budget planning and risk assessment. Managed $25M annual budget, implemented cost-saving strategies reducing expenses by 20%. Expert in SQL, Tableau, and advanced Excel with CFA Level 2 certification. Strong track record in financial forecasting.",
    
    senior: "15+ years finance leadership experience managing $100M+ budgets and teams of 12+ analysts. Led financial planning initiatives resulting in 25% profit increase. Expert in regulatory compliance, mergers & acquisitions, and strategic planning. Proven ability to drive business growth through data-driven insights."
  },

  // Healthcare Industry
  healthcare: {
    entry: "Licensed RN with 2 years experience in medical-surgical units. Certified in BLS and ACLS with strong patient care and communication skills. Managed care for 15+ patients per shift, maintained 98% patient satisfaction scores. Committed to providing compassionate, evidence-based healthcare.",
    
    mid: "7 years nursing experience in ICU and emergency departments. Specialized in critical care with CCRN certification and trauma experience. Led quality improvement initiatives reducing patient readmission rates by 15%. Strong clinical judgment and ability to work under pressure in fast-paced environments.",
    
    senior: "12+ years healthcare leadership experience managing nursing teams of 25+ staff members. Implemented protocols improving patient outcomes by 30% and reducing costs by $500K annually. Expert in healthcare regulations, staff development, and process improvement. MSN degree with healthcare administration focus."
  },

  // Marketing Industry
  marketing: {
    entry: "Recent Marketing graduate with internship experience at digital agency. Skilled in social media management, Google Analytics, and content creation. Managed Instagram campaigns achieving 60% engagement increase and 1000+ new followers. Passionate about data-driven marketing strategies and brand storytelling.",
    
    mid: "5 years digital marketing experience specializing in PPC campaigns and SEO optimization. Generated $2M+ in revenue through Google Ads and Facebook campaigns with average 4:1 ROAS. Expert in marketing automation, A/B testing, and conversion optimization. Google Ads and Analytics certified professional.",
    
    senior: "10+ years marketing leadership experience managing $5M+ annual budgets and teams of 12+ marketers. Developed integrated campaigns resulting in 150% revenue growth and 40% market share increase. Expert in brand strategy, customer acquisition, and marketing technology stack optimization."
  },

  // Sales Industry
  sales: {
    entry: "Motivated sales professional with 1 year B2B experience and strong communication skills. Achieved 110% of quarterly quota in first year, generated $500K in new business revenue. Skilled in CRM management, lead qualification, and relationship building. Eager to grow in consultative sales environment.",
    
    mid: "6 years enterprise sales experience specializing in SaaS solutions and client relationship management. Consistently exceeded quotas by 20%+, managed $3M territory generating $15M+ total revenue. Expert in consultative selling, contract negotiation, and account expansion. Strong track record with C-level executives.",
    
    senior: "12+ years sales leadership experience managing teams of 20+ representatives across multiple territories. Built high-performing teams achieving 130% of annual targets, increased regional revenue by $25M. Expert in sales strategy, coaching, and business development. Proven ability to scale sales operations."
  },

  // Operations Industry
  operations: {
    entry: "Recent Business Administration graduate with internship experience in supply chain operations. Skilled in process analysis, data collection, and Excel with strong analytical mindset. Assisted in optimizing warehouse operations reducing processing time by 25%. Detail-oriented with excellent organizational skills.",
    
    mid: "5 years operations management experience specializing in logistics and process improvement. Managed daily operations for 50+ person facility, implemented lean practices reducing costs by 30%. Expert in project management, vendor relations, and quality control. Six Sigma Green Belt certified professional.",
    
    senior: "15+ years operations leadership experience managing multi-site facilities and teams of 100+ employees. Streamlined operations across 5 locations reducing costs by $2M annually while improving quality metrics by 40%. Expert in strategic planning, automation, and operational excellence initiatives."
  }
};

/**
 * Get resume example by industry and experience level
 * @param {string} industry - Industry type (tech, finance, healthcare, etc.)
 * @param {string} level - Experience level (entry, mid, senior)
 * @returns {string} Resume example text
 */
function getResumeExample(industry, level) {
  const normalizedIndustry = industry.toLowerCase().replace(/[^a-z]/g, '');
  const normalizedLevel = level.toLowerCase();
  
  // Try exact match first
  if (RESUME_EXAMPLES[normalizedIndustry] && RESUME_EXAMPLES[normalizedIndustry][normalizedLevel]) {
    return RESUME_EXAMPLES[normalizedIndustry][normalizedLevel];
  }
  
  // Fallback to tech mid-level if industry not found
  console.warn(`[RESUME EXAMPLES] No example found for ${industry}-${level}, using tech-mid fallback`);
  return RESUME_EXAMPLES.tech.mid;
}

/**
 * Get all available industries
 * @returns {Array} Array of industry objects with display names
 */
function getAvailableIndustries() {
  return [
    { key: 'tech', display: 'Technology', icon: '💻' },
    { key: 'finance', display: 'Finance', icon: '💰' },
    { key: 'healthcare', display: 'Healthcare', icon: '🏥' },
    { key: 'marketing', display: 'Marketing', icon: '📈' },
    { key: 'sales', display: 'Sales', icon: '🤝' },
    { key: 'operations', display: 'Operations', icon: '⚙️' }
  ];
}

/**
 * Get all experience levels
 * @returns {Array} Array of experience level objects
 */
function getExperienceLevels() {
  return [
    { key: 'entry', display: 'Entry Level', subtitle: '0-2 years', icon: '🌱' },
    { key: 'mid', display: 'Mid Level', subtitle: '3-7 years', icon: '📊' },
    { key: 'senior', display: 'Senior Level', subtitle: '8+ years', icon: '🎯' }
  ];
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RESUME_EXAMPLES,
    getResumeExample,
    getAvailableIndustries,
    getExperienceLevels
  };
}