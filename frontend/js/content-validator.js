/* ==========================================
   AI Interview Coach - Frontend Content Validator
   ========================================== */

/**
 * Frontend content validation service
 */
class ContentValidator {
  constructor() {
    this.apiEndpoint = 'http://localhost:3000/api/validate'; // We'll create this endpoint
    this.debounceDelay = 800; // Wait 800ms after user stops typing
    this.validationTimeouts = new Map();
  }

  /**
   * Real-time job description validation
   */
  validateJobDescription(text, callback) {
    // Clear existing timeout
    if (this.validationTimeouts.has('job')) {
      clearTimeout(this.validationTimeouts.get('job'));
    }

    // Set new timeout for debounced validation
    const timeoutId = setTimeout(() => {
      this.performJobValidation(text, callback);
    }, this.debounceDelay);

    this.validationTimeouts.set('job', timeoutId);
  }

  /**
   * Real-time resume summary validation
   */
  validateResumeSummary(text, callback) {
    // Clear existing timeout
    if (this.validationTimeouts.has('resume')) {
      clearTimeout(this.validationTimeouts.get('resume'));
    }

    // Set new timeout for debounced validation
    const timeoutId = setTimeout(() => {
      this.performResumeValidation(text, callback);
    }, this.debounceDelay);

    this.validationTimeouts.set('resume', timeoutId);
  }

  /**
   * Perform job description validation
   */
  async performJobValidation(text, callback) {
    if (!text || text.trim().length < 10) {
      callback({
        isValid: text.trim().length === 0, // Empty is valid, too short is not
        errors: text.trim().length > 0 && text.trim().length < 10 ? ['Job description too short'] : [],
        warnings: [],
        suggestions: text.trim().length === 0 ? ['Paste a job description to get started'] : ['Add more details about the role'],
        canProceed: text.trim().length === 0
      });
      return;
    }

    try {
      // Client-side basic validation
      const clientValidation = this.clientSideJobValidation(text);
      
      // If client-side validation fails, don't call server
      if (!clientValidation.canProceed) {
        callback(clientValidation);
        return;
      }

      // Call server for comprehensive validation (we'll create this endpoint)
      const response = await fetch(`${this.apiEndpoint}/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text })
      });

      if (response.ok) {
        const result = await response.json();
        callback(result);
      } else {
        // Fallback to client-side validation
        callback(clientValidation);
      }

    } catch (error) {
      console.warn('[CONTENT VALIDATOR] Server validation failed, using client-side:', error);
      callback(this.clientSideJobValidation(text));
    }
  }

  /**
   * Perform resume summary validation
   */
  async performResumeValidation(text, callback) {
    // Empty resume is valid (it's optional)
    if (!text || text.trim().length === 0) {
      callback({
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: ['Adding a resume summary will personalize your questions'],
        canProceed: true,
        analysis: {}
      });
      return;
    }

    try {
      // Client-side basic validation
      const clientValidation = this.clientSideResumeValidation(text);
      
      // If severe client-side issues, don't call server
      if (clientValidation.errors.length > 0) {
        callback(clientValidation);
        return;
      }

      // Call server for comprehensive validation
      const response = await fetch(`${this.apiEndpoint}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text })
      });

      if (response.ok) {
        const result = await response.json();
        callback(result);
      } else {
        // Fallback to client-side validation
        callback(clientValidation);
      }

    } catch (error) {
      console.warn('[CONTENT VALIDATOR] Resume validation failed, using client-side:', error);
      callback(this.clientSideResumeValidation(text));
    }
  }

  /**
   * Client-side job description validation (basic checks)
   */
  clientSideJobValidation(text) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      canProceed: true,
      scores: { quality: 0, relevance: 0 }
    };

    const trimmed = text.trim();

    // Length checks
    if (trimmed.length < 10) {
      result.isValid = false;
      result.canProceed = false;
      result.errors.push('Job description too short (minimum 10 characters)');
      return result;
    }

    if (trimmed.length > 10000) {
      result.isValid = false;
      result.canProceed = false;
      result.errors.push('Job description too long (maximum 10,000 characters)');
      return result;
    }

    // Basic profanity check (simple words)
    const profanityWords = ['fuck', 'shit', 'damn', 'bitch'];
    const hasProfanity = profanityWords.some(word => 
      trimmed.toLowerCase().includes(word)
    );

    if (hasProfanity) {
      result.isValid = false;
      result.canProceed = false;
      result.errors.push('Please use professional language only');
      return result;
    }

    // Basic job relevance check
    const jobKeywords = ['job', 'position', 'role', 'responsibilities', 'requirements', 'experience', 'skills'];
    const jobKeywordCount = jobKeywords.filter(keyword => 
      trimmed.toLowerCase().includes(keyword)
    ).length;

    if (jobKeywordCount === 0 && trimmed.length > 50) {
      result.warnings.push('Content may not be a job description');
      result.suggestions.push('Make sure you\'re pasting a real job posting');
    }

    // Quality scoring (basic)
    let qualityScore = 0;
    if (trimmed.length >= 100) qualityScore += 30;
    if (jobKeywordCount >= 2) qualityScore += 40;
    if (trimmed.includes('\n') || trimmed.includes('•')) qualityScore += 20; // Has structure
    if (/\d/.test(trimmed)) qualityScore += 10; // Has numbers

    result.scores.quality = qualityScore;
    result.scores.relevance = Math.min(jobKeywordCount * 20, 100);

    // Suggestions based on quality
    if (qualityScore < 50) {
      result.suggestions.push('Add more details about job requirements and responsibilities');
    }

    return result;
  }

  /**
   * Client-side resume summary validation (basic checks)
   */
  clientSideResumeValidation(text) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      canProceed: true,
      scores: { professional: 0, experience: 0, overall: 0 },
      analysis: {}
    };

    const trimmed = text.trim();

    // Empty is valid (optional field)
    if (trimmed.length === 0) {
      return result;
    }

    // Length checks
    if (trimmed.length > 800) {
      result.isValid = false;
      result.errors.push('Resume summary too long (maximum 800 characters for ATS compatibility)');
      result.suggestions.push('Keep it concise - focus on key achievements and skills');
    }

    if (trimmed.length < 20) {
      result.warnings.push('Resume summary is very brief');
      result.suggestions.push('Add more details about your experience and achievements');
    }

    // Basic profanity check
    const profanityWords = ['fuck', 'shit', 'damn', 'bitch'];
    const hasProfanity = profanityWords.some(word => 
      trimmed.toLowerCase().includes(word)
    );

    if (hasProfanity) {
      result.isValid = false;
      result.canProceed = false;
      result.errors.push('Please use professional language only');
      return result;
    }

    // Personal information check (basic)
    const personalInfo = ['age', 'married', 'single', 'children', 'religion'];
    const hasPersonalInfo = personalInfo.some(info => 
      trimmed.toLowerCase().includes(info)
    );

    if (hasPersonalInfo) {
      result.warnings.push('Avoid personal information in professional summary');
      result.suggestions.push('Focus on work experience, skills, and achievements only');
    }

    // Professional content check
    const professionalWords = ['experience', 'skilled', 'years', 'worked', 'developed', 'managed', 'led'];
    const professionalCount = professionalWords.filter(word => 
      trimmed.toLowerCase().includes(word)
    ).length;

    // Experience indicators
    const hasYearsExperience = /\d+\s*(years?|yrs?)/i.test(trimmed);
    const hasAchievements = /\d+[%$]|\d+\s*(million|thousand|percent)/i.test(trimmed);

    // Scoring
    let professionalScore = professionalCount * 15;
    let experienceScore = 0;

    if (hasYearsExperience) experienceScore += 40;
    if (hasAchievements) experienceScore += 30;
    if (professionalCount >= 3) experienceScore += 30;

    result.scores.professional = Math.min(professionalScore, 100);
    result.scores.experience = Math.min(experienceScore, 100);
    result.scores.overall = Math.round((professionalScore + experienceScore) / 2);

    // Analysis
    result.analysis = {
      wordCount: trimmed.split(/\s+/).length,
      hasExperienceIndicators: hasYearsExperience,
      hasQuantifiableAchievements: hasAchievements,
      isProfessional: professionalCount >= 2,
      hasPersonalInfo: hasPersonalInfo
    };

    // Suggestions based on analysis
    if (!hasYearsExperience && trimmed.length > 50) {
      result.suggestions.push('Include your years of experience or career level');
    }

    if (!hasAchievements && trimmed.length > 100) {
      result.suggestions.push('Add specific achievements with numbers or percentages');
    }

    if (professionalCount < 2) {
      result.suggestions.push('Include more professional experience details');
    }

    // Determine if can proceed
    result.canProceed = result.errors.length === 0;

    return result;
  }

  /**
   * Validate both job and resume together
   */
  async validateBoth(jobText, resumeText, callback) {
    try {
      const jobValidation = this.clientSideJobValidation(jobText);
      const resumeValidation = this.clientSideResumeValidation(resumeText);

      // Check compatibility
      const compatibility = this.checkCompatibility(jobText, resumeText);

      const result = {
        job: jobValidation,
        resume: resumeValidation,
        compatibility: compatibility,
        canProceed: jobValidation.canProceed && resumeValidation.canProceed,
        overallQuality: {
          job: jobValidation.scores.quality,
          resume: resumeValidation.scores.overall,
          combined: Math.round((jobValidation.scores.quality + resumeValidation.scores.overall) / 2)
        }
      };

      callback(result);

    } catch (error) {
      console.error('[CONTENT VALIDATOR] Combined validation error:', error);
      callback({
        job: { isValid: false, errors: ['Validation failed'], canProceed: false },
        resume: { isValid: false, errors: ['Validation failed'], canProceed: false },
        canProceed: false
      });
    }
  }

  /**
   * Basic compatibility check between job and resume
   */
  checkCompatibility(jobText, resumeText) {
    if (!resumeText || resumeText.trim().length === 0) {
      return {
        compatible: true,
        warnings: [],
        suggestions: ['Adding a resume summary will improve question personalization']
      };
    }

    const compatibility = {
      compatible: true,
      warnings: [],
      suggestions: []
    };

    // Basic level matching
    const jobLower = jobText.toLowerCase();
    const resumeLower = resumeText.toLowerCase();

    // Check for level indicators
    const seniorJob = /senior|lead|principal|director|\d+\+?\s*years/i.test(jobText);
    const seniorResume = /senior|lead|\d+\+?\s*years/i.test(resumeText);

    if (seniorJob && !seniorResume) {
      compatibility.warnings.push('Job appears to be senior-level but resume may indicate less experience');
      compatibility.suggestions.push('Highlight your most relevant experience and achievements');
    }

    // Basic industry alignment (simple keyword matching)
    const techJob = /software|developer|engineer|programming|javascript|python/i.test(jobText);
    const techResume = /software|developer|engineer|programming|javascript|python/i.test(resumeText);

    if (techJob && resumeText.length > 50 && !techResume) {
      compatibility.suggestions.push('Consider highlighting any technical skills or related experience');
    }

    return compatibility;
  }
}

// Initialize global content validator
const contentValidator = new ContentValidator();

// Make available globally
window.contentValidator = contentValidator;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentValidator;
}