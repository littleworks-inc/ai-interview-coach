// ==========================================
// AI Interview Coach - Resume Validation Helper Messages
// ==========================================

/**
 * Generate contextual error messages and suggestions for resume validation
 */
class ResumeValidationMessages {
  
  /**
   * Get user-friendly error message based on validation results
   */
  static getErrorMessage(errorType, context = {}) {
    const messages = {
      'too_long': {
        message: 'Resume summary is too long for optimal ATS processing',
        suggestion: `Shorten to under 800 characters (currently ${context.currentLength || 'unknown'})`
      },
      
      'inappropriate_content': {
        message: 'Resume summary contains inappropriate content',
        suggestion: 'Use professional language and remove any offensive or unprofessional terms'
      },
      
      'personal_information': {
        message: 'Resume summary contains personal information',
        suggestion: 'Remove personal details like age, marital status, or physical characteristics. Focus on professional experience only.'
      },
      
      'not_professional': {
        message: 'Content does not appear to be a professional resume summary',
        suggestion: 'Include work experience, skills, achievements, and career-relevant information'
      },
      
      'too_generic': {
        message: 'Resume summary is too generic',
        suggestion: 'Add specific achievements, technologies you\'ve used, and quantifiable results (numbers, percentages)'
      },
      
      'third_person': {
        message: 'Resume summary should be written in first person',
        suggestion: 'Use "I" statements or implied first person style (e.g., "Experienced developer" instead of "John is an experienced developer")'
      },
      
      'unprofessional_language': {
        message: 'Resume summary contains unprofessional language',
        suggestion: 'Replace casual terms with professional business language'
      }
    };
    
    return messages[errorType] || {
      message: 'Resume summary needs improvement',
      suggestion: 'Please review and revise your professional summary'
    };
  }
  
  /**
   * Get improvement suggestions based on analysis
   */
  static getImprovementSuggestions(analysis) {
    const suggestions = [];
    
    if (!analysis.hasExperienceIndicators) {
      suggestions.push({
        priority: 'high',
        message: 'Add your years of experience',
        example: 'e.g., "5+ years of software development experience"'
      });
    }
    
    if (!analysis.hasQuantifiableAchievements) {
      suggestions.push({
        priority: 'medium',
        message: 'Include specific achievements with numbers',
        example: 'e.g., "Increased sales by 25%" or "Managed team of 8 developers"'
      });
    }
    
    if (analysis.wordCount < 50) {
      suggestions.push({
        priority: 'medium',
        message: 'Add more detail about your background',
        example: 'Include key skills, technologies, and notable accomplishments'
      });
    }
    
    if (analysis.redFlagsFound && analysis.redFlagsFound.length > 0) {
      suggestions.push({
        priority: 'high',
        message: 'Replace generic phrases with specific examples',
        example: 'Instead of "hard worker," say "Consistently exceeded quarterly targets by 15%"'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Get ATS optimization tips
   */
  static getATSOptimizationTips(length, hasKeywords) {
    const tips = [];
    
    if (length > 600) {
      tips.push('Keep under 600 characters for optimal ATS scanning');
    }
    
    if (!hasKeywords) {
      tips.push('Include industry-specific keywords and technical skills');
    }
    
    tips.push('Use standard formatting without special characters');
    tips.push('Focus on achievements rather than job duties');
    
    return tips;
  }
  
  /**
   * Generate comprehensive feedback object
   */
  static generateFeedback(validationResult) {
    const feedback = {
      status: validationResult.isValid ? 'valid' : 'invalid',
      score: validationResult.scores.overall || 0,
      errors: validationResult.errors.map(error => ({
        message: error,
        severity: 'error'
      })),
      warnings: validationResult.warnings.map(warning => ({
        message: warning,
        severity: 'warning'
      })),
      suggestions: this.getImprovementSuggestions(validationResult.analysis || {}),
      atsOptimization: this.getATSOptimizationTips(
        validationResult.analysis?.wordCount || 0,
        validationResult.analysis?.isProfessional || false
      )
    };
    
    return feedback;
  }
}

module.exports = ResumeValidationMessages;