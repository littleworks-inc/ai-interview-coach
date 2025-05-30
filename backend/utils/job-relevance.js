// ==========================================
// AI Interview Coach - Job Relevance Validator
// ==========================================

/**
 * Validates if content is actually job-related
 */
class JobRelevanceValidator {
  constructor() {
    // Job-related keywords (expandable)
    this.jobKeywords = [
      // Role indicators
      'job', 'position', 'role', 'career', 'employment', 'opportunity',
      // Responsibility keywords
      'responsibilities', 'duties', 'requirements', 'qualifications', 'skills',
      'experience', 'education', 'background', 'knowledge',
      // Company/hiring keywords
      'company', 'team', 'department', 'organization', 'employer', 'hire', 'hiring',
      'candidate', 'applicant', 'interview', 'apply', 'application',
      // Work-related terms
      'work', 'working', 'manage', 'develop', 'lead', 'coordinate', 'implement',
      'collaborate', 'support', 'maintain', 'analyze', 'design', 'create'
    ];
    
    // Professional industries/domains
    this.industryKeywords = [
      'software', 'engineer', 'developer', 'programming', 'technology', 'IT',
      'marketing', 'sales', 'business', 'finance', 'accounting', 'management',
      'healthcare', 'medical', 'nurse', 'doctor', 'research', 'science',
      'education', 'teaching', 'legal', 'law', 'consulting', 'operations'
    ];
    
    // Technical skills (common across industries)
    this.skillKeywords = [
      'leadership', 'communication', 'analytical', 'problem-solving', 'teamwork',
      'project management', 'customer service', 'strategic', 'creative'
    ];
  }

  /**
   * Calculate job relevance score
   */
  calculateRelevanceScore(text) {
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\W+/);
    const totalWords = words.length;
    
    if (totalWords < 10) {
      return {
        score: 0,
        reason: 'too_short',
        details: 'Content too short to be a meaningful job description'
      };
    }
    
    let score = 0;
    const foundKeywords = {
      job: [],
      industry: [],
      skills: []
    };
    
    // Check job keywords
    for (const keyword of this.jobKeywords) {
      if (normalizedText.includes(keyword)) {
        foundKeywords.job.push(keyword);
        score += 5; // Higher weight for job-specific terms
      }
    }
    
    // Check industry keywords
    for (const keyword of this.industryKeywords) {
      if (normalizedText.includes(keyword)) {
        foundKeywords.industry.push(keyword);
        score += 3;
      }
    }
    
    // Check skill keywords
    for (const keyword of this.skillKeywords) {
      if (normalizedText.includes(keyword)) {
        foundKeywords.skills.push(keyword);
        score += 2;
      }
    }
    
    // Normalize score (0-100)
    const maxPossibleScore = Math.min(totalWords * 2, 100); // Reasonable max
    const normalizedScore = Math.min((score / maxPossibleScore) * 100, 100);
    
    return {
      score: Math.round(normalizedScore),
      foundKeywords: foundKeywords,
      totalMatches: foundKeywords.job.length + foundKeywords.industry.length + foundKeywords.skills.length,
      assessment: this.assessRelevance(normalizedScore, foundKeywords)
    };
  }

  /**
   * Assess relevance based on score and keywords
   */
  assessRelevance(score, foundKeywords) {
    if (score >= 70) {
      return {
        level: 'high',
        message: 'Content appears to be a well-structured job description',
        confidence: 'high'
      };
    } else if (score >= 40) {
      return {
        level: 'medium',
        message: 'Content has some job-related elements but could be more detailed',
        confidence: 'medium'
      };
    } else if (score >= 20) {
      return {
        level: 'low',
        message: 'Content has minimal job-related information',
        confidence: 'low'
      };
    } else {
      return {
        level: 'very_low',
        message: 'Content does not appear to be a job description',
        confidence: 'high'
      };
    }
  }

  /**
   * Validate job description content
   */
  validateJobDescription(text) {
    const relevanceScore = this.calculateRelevanceScore(text);
    
    return {
      isJobRelated: relevanceScore.score >= 20, // Minimum threshold
      relevanceScore: relevanceScore.score,
      assessment: relevanceScore.assessment,
      foundKeywords: relevanceScore.foundKeywords,
      suggestions: this.generateSuggestions(relevanceScore)
    };
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(relevanceScore) {
    const suggestions = [];
    
    if (relevanceScore.foundKeywords.job.length === 0) {
      suggestions.push('Include basic job information (position title, responsibilities, requirements)');
    }
    
    if (relevanceScore.foundKeywords.industry.length === 0) {
      suggestions.push('Add industry-specific terms or technical skills relevant to the role');
    }
    
    if (relevanceScore.score < 40) {
      suggestions.push('Provide more details about job requirements, qualifications, and responsibilities');
    }
    
    if (relevanceScore.score < 20) {
      suggestions.push('This doesn\'t appear to be a job description. Please paste a job posting from a company or job board');
    }
    
    return suggestions;
  }
}

module.exports = JobRelevanceValidator;