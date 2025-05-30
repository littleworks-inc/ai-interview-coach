// ==========================================
// AI Interview Coach - Enhanced Content Validators (Updated)
// ==========================================

const ContentFilter = require('./content-filter');
const JobRelevanceValidator = require('./job-relevance');
const QualityScorer = require('./quality-scorer');
const ResumeSummaryValidator = require('./resume-summary-validator'); // NEW

/**
 * Comprehensive content validation system (Enhanced)
 */
class EnhancedContentValidator {
  constructor() {
    this.contentFilter = new ContentFilter();
    this.relevanceValidator = new JobRelevanceValidator();
    this.qualityScorer = new QualityScorer();
    this.resumeValidator = new ResumeSummaryValidator(); // NEW
  }

  /**
   * Validate job description with comprehensive checks (existing - unchanged)
   */
  validateJobDescription(text) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      scores: {},
      canProceed: true
    };

    // Basic checks first
    if (!text || typeof text !== 'string') {
      result.isValid = false;
      result.canProceed = false;
      result.errors.push('Job description is required');
      return result;
    }

    const trimmedText = text.trim();
    
    // Length validation
    if (trimmedText.length < 10) {
      result.isValid = false;
      result.canProceed = false;
      result.errors.push('Job description is too short (minimum 10 characters)');
      return result;
    }

    if (trimmedText.length > 10000) {
      result.isValid = false;
      result.canProceed = false;
      result.errors.push('Job description is too long (maximum 10,000 characters)');
      return result;
    }

    // Content appropriateness check
    const filterResult = this.contentFilter.filterContent(trimmedText);
    if (!filterResult.isAppropriate) {
      result.isValid = false;
      result.canProceed = false;
      
      if (filterResult.profanity.hasProfanity) {
        result.errors.push('Content contains inappropriate language. Please use professional language only.');
      }
      
      if (filterResult.spam.isSpam) {
        result.errors.push('Content appears to be spam or contains invalid patterns. Please provide a real job description.');
      }
      
      return result;
    }

    // Job relevance validation
    const relevanceResult = this.relevanceValidator.validateJobDescription(trimmedText);
    result.scores.relevance = relevanceResult.relevanceScore;
    
    if (!relevanceResult.isJobRelated) {
      result.isValid = false;
      result.canProceed = false;
      result.errors.push('Content does not appear to be a job description');
      result.suggestions.push(...relevanceResult.suggestions);
      return result;
    }

    if (relevanceResult.relevanceScore < 40) {
      result.warnings.push('Content has limited job-related information');
      result.suggestions.push(...relevanceResult.suggestions);
    }

    // Quality assessment
    const qualityResult = this.qualityScorer.quickQualityCheck(trimmedText, 'job_description');
    result.scores.quality = qualityResult.score;
    
    if (qualityResult.score < 30) {
      result.warnings.push('Content quality is low and may result in generic questions');
      result.suggestions.push(...qualityResult.suggestions);
    }

    // Determine if we can proceed
    result.canProceed = result.errors.length === 0;
    
    return result;
  }

  /**
   * Enhanced resume summary validation with specialized validator
   */
  validateResumeSummary(text) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      scores: {},
      canProceed: true,
      analysis: {} // NEW: Detailed analysis
    };

    // Resume summary is optional
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      result.suggestions.push('Adding a resume summary will help personalize your interview questions');
      result.suggestions.push('Include your experience level, key skills, and major achievements');
      return result;
    }

    const trimmedText = text.trim();
    
    // Basic content appropriateness check (from base filter)
    const filterResult = this.contentFilter.filterContent(trimmedText);
    if (!filterResult.isAppropriate) {
      result.isValid = false;
      result.canProceed = false;
      
      if (filterResult.profanity.hasProfanity) {
        result.errors.push('Resume summary contains inappropriate language');
      }
      
      if (filterResult.spam.isSpam) {
        result.errors.push('Resume summary appears to contain invalid content');
      }
      
      return result;
    }

    // NEW: Specialized resume validation
    const resumeValidation = this.resumeValidator.validateResumeSummary(trimmedText);
    
    // Merge results from specialized validator
    result.errors.push(...resumeValidation.errors);
    result.warnings.push(...resumeValidation.warnings);
    result.suggestions.push(...resumeValidation.suggestions);
    result.scores = {
      ...result.scores,
      ...resumeValidation.scores
    };
    result.analysis = resumeValidation.analysis;
    
    // Additional ATS-specific validation
    if (trimmedText.length > 800) {
      result.errors.push('Resume summary exceeds 800 characters (not ATS-friendly)');
      result.suggestions.push('Keep under 800 characters for better ATS compatibility');
    }
    
    // Professional format check
    if (trimmedText.length > 100 && !resumeValidation.analysis.hasExperienceIndicators) {
      result.warnings.push('Resume summary lacks clear experience indicators');
      result.suggestions.push('Include years of experience or specific role titles');
    }
    
    // Achievement density check
    if (trimmedText.length > 150 && !resumeValidation.analysis.hasQuantifiableAchievements) {
      result.suggestions.push('Add specific numbers, percentages, or metrics to showcase achievements');
    }

    // Determine if we can proceed
    result.canProceed = result.errors.length === 0;
    result.isValid = result.canProceed;
    
    return result;
  }

  /**
   * Enhanced content validation with specialized resume handling
   */
  validateContent(jobDescription, resumeSummary = '') {
    const jobValidation = this.validateJobDescription(jobDescription);
    const resumeValidation = this.validateResumeSummary(resumeSummary);
    
    // NEW: Enhanced compatibility check
    const compatibilityCheck = this.checkJobResumeCompatibility(
      jobDescription, 
      resumeSummary, 
      jobValidation, 
      resumeValidation
    );
    
    return {
      jobDescription: jobValidation,
      resumeSummary: resumeValidation,
      compatibility: compatibilityCheck, // NEW
      canProceed: jobValidation.canProceed && resumeValidation.canProceed,
      overallQuality: {
        job: jobValidation.scores.quality || 0,
        resume: resumeValidation.scores.overall || 0,
        combined: Math.round(((jobValidation.scores.quality || 0) + (resumeValidation.scores.overall || 0)) / 2)
      },
      recommendations: this.generateRecommendations(jobValidation, resumeValidation) // NEW
    };
  }

  /**
   * NEW: Check compatibility between job description and resume summary
   */
  checkJobResumeCompatibility(jobDescription, resumeSummary, jobValidation, resumeValidation) {
    if (!resumeSummary || resumeSummary.trim().length === 0) {
      return {
        compatible: true,
        warnings: [],
        suggestions: ['Adding a resume summary will improve question personalization']
      };
    }

    const compatibility = {
      compatible: true,
      warnings: [],
      suggestions: [],
      analysisPoints: []
    };

    // Check experience level alignment
    const jobLevel = this.extractJobLevel(jobDescription);
    const resumeLevel = this.extractResumeLevel(resumeSummary);
    
    if (jobLevel && resumeLevel && jobLevel !== resumeLevel) {
      compatibility.warnings.push(`Job appears to be ${jobLevel}-level but resume indicates ${resumeLevel}-level experience`);
      compatibility.suggestions.push('Ensure your experience level aligns with the job requirements');
    }

    // Check industry alignment
    const jobIndustry = this.extractIndustryKeywords(jobDescription);
    const resumeIndustry = this.extractIndustryKeywords(resumeSummary);
    
    const hasIndustryOverlap = jobIndustry.some(keyword => 
      resumeIndustry.includes(keyword)
    );
    
    if (jobIndustry.length > 0 && resumeIndustry.length > 0 && !hasIndustryOverlap) {
      compatibility.suggestions.push('Consider highlighting relevant skills that transfer between industries');
    }

    return compatibility;
  }

  /**
   * NEW: Generate personalized recommendations
   */
  generateRecommendations(jobValidation, resumeValidation) {
    const recommendations = [];

    // Job-specific recommendations
    if (jobValidation.scores.quality < 60) {
      recommendations.push({
        type: 'job_improvement',
        priority: 'high',
        message: 'Improve job description detail for better question personalization',
        actions: jobValidation.suggestions.slice(0, 2)
      });
    }

    // Resume-specific recommendations
    if (resumeValidation.scores.overall < 50 && resumeValidation.analysis.wordCount > 0) {
      recommendations.push({
        type: 'resume_improvement',
        priority: 'medium',
        message: 'Enhance resume summary for more targeted questions',
        actions: resumeValidation.suggestions.slice(0, 2)
      });
    }

    // Quality recommendations
    if (jobValidation.scores.quality > 70 && (!resumeValidation.analysis.wordCount || resumeValidation.scores.overall < 30)) {
      recommendations.push({
        type: 'personalization_opportunity',
        priority: 'low',
        message: 'Add a detailed resume summary to get highly personalized questions',
        actions: ['Include 2-3 specific achievements with numbers', 'Mention years of experience and key technologies']
      });
    }

    return recommendations;
  }

  /**
   * Helper: Extract job level from description
   */
  extractJobLevel(text) {
    const seniorTerms = ['senior', 'lead', 'principal', 'staff', 'director', '5+ years', '7+ years'];
    const midTerms = ['mid-level', '3-5 years', '2-4 years', 'experienced'];
    const juniorTerms = ['junior', 'entry', 'graduate', '0-2 years', 'new grad'];
    
    const normalizedText = text.toLowerCase();
    
    if (seniorTerms.some(term => normalizedText.includes(term))) return 'senior';
    if (midTerms.some(term => normalizedText.includes(term))) return 'mid';
    if (juniorTerms.some(term => normalizedText.includes(term))) return 'junior';
    
    return null;
  }

  /**
   * Helper: Extract experience level from resume
   */
  extractResumeLevel(text) {
    const normalizedText = text.toLowerCase();
    
    // Look for years of experience
    const yearMatches = text.match(/(\d+)\s*(years?|yrs?)/gi);
    if (yearMatches) {
      const years = parseInt(yearMatches[0]);
      if (years >= 7) return 'senior';
      if (years >= 3) return 'mid';
      return 'junior';
    }
    
    // Look for level indicators
    if (normalizedText.includes('senior') || normalizedText.includes('lead')) return 'senior';
    if (normalizedText.includes('experienced')) return 'mid';
    if (normalizedText.includes('recent graduate') || normalizedText.includes('entry')) return 'junior';
    
    return null;
  }

  /**
   * Helper: Extract industry keywords
   */
  extractIndustryKeywords(text) {
    const industries = [
      'software', 'technology', 'engineering', 'development', 'programming',
      'marketing', 'sales', 'business', 'finance', 'accounting',
      'healthcare', 'medical', 'research', 'education', 'consulting'
    ];
    
    const normalizedText = text.toLowerCase();
    return industries.filter(industry => normalizedText.includes(industry));
  }
}

module.exports = EnhancedContentValidator;