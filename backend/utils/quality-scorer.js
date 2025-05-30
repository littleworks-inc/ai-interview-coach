// ==========================================
// AI Interview Coach - Content Quality Scorer
// ==========================================

/**
 * Comprehensive content quality assessment
 */
class QualityScorer {
  constructor() {
    // Quality indicators
    this.qualityMetrics = {
      // Structure indicators
      structure: {
        hasBulletPoints: /[•\-\*]\s+/g,
        hasNumberedList: /\d+\.\s+/g,
        hasSections: /\n\s*\n/g,
        hasHeadings: /^[A-Z][A-Za-z\s:]+$/gm
      },
      
      // Professional language indicators
      professional: {
        actionVerbs: ['manage', 'lead', 'develop', 'implement', 'coordinate', 'analyze', 'design', 'create', 'optimize', 'execute'],
        qualificationTerms: ['required', 'preferred', 'must have', 'should have', 'experience with', 'knowledge of', 'proficiency in'],
        professionalTerms: ['bachelor', 'master', 'degree', 'certification', 'years of experience', 'proven track record']
      },
      
      // Content depth indicators
      depth: {
        quantifiers: /\d+[\+\-]?\s*(years?|months?|%|percent|dollar|million|thousand)/gi,
        specificSkills: /\b(javascript|python|java|react|angular|aws|sql|mongodb|kubernetes|docker|agile|scrum)\b/gi,
        companyInfo: /\b(company|organization|team|startup|enterprise|fortune|industry)\b/gi
      }
    };
  }

  /**
   * Calculate structure quality score
   */
  calculateStructureScore(text) {
    let score = 0;
    const metrics = this.qualityMetrics.structure;
    
    // Check for organized structure
    if (metrics.hasBulletPoints.test(text) || metrics.hasNumberedList.test(text)) {
      score += 25; // Well-organized content
    }
    
    // Check for sections/paragraphs
    const sections = text.match(metrics.hasSections);
    if (sections && sections.length >= 2) {
      score += 20; // Multiple sections
    }
    
    // Check for headings
    if (metrics.hasHeadings.test(text)) {
      score += 15; // Has section headings
    }
    
    // Length appropriateness
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 50 && wordCount <= 500) {
      score += 20; // Appropriate length
    } else if (wordCount > 500) {
      score += 10; // Long but acceptable
    }
    
    // Line breaks and readability
    const lines = text.split('\n').length;
    if (lines > 5) {
      score += 20; // Multiple lines indicate structure
    }
    
    return Math.min(score, 100);
  }

  /**
   * Calculate professional language score
   */
  calculateProfessionalScore(text) {
    let score = 0;
    const normalizedText = text.toLowerCase();
    const professional = this.qualityMetrics.professional;
    
    // Check for action verbs
    let actionVerbCount = 0;
    for (const verb of professional.actionVerbs) {
      if (normalizedText.includes(verb)) {
        actionVerbCount++;
      }
    }
    score += Math.min(actionVerbCount * 8, 40); // Max 40 points
    
    // Check for qualification terms
    let qualTermCount = 0;
    for (const term of professional.qualificationTerms) {
      if (normalizedText.includes(term)) {
        qualTermCount++;
      }
    }
    score += Math.min(qualTermCount * 10, 30); // Max 30 points
    
    // Check for professional terms
    let profTermCount = 0;
    for (const term of professional.professionalTerms) {
      if (normalizedText.includes(term)) {
        profTermCount++;
      }
    }
    score += Math.min(profTermCount * 10, 30); // Max 30 points
    
    return Math.min(score, 100);
  }

  /**
   * Calculate content depth score
   */
  calculateDepthScore(text) {
    let score = 0;
    const depth = this.qualityMetrics.depth;
    
    // Check for quantifiable information
    const quantifiers = text.match(depth.quantifiers);
    if (quantifiers) {
      score += Math.min(quantifiers.length * 15, 45); // Max 45 points
    }
    
    // Check for specific skills
    const skills = text.match(depth.specificSkills);
    if (skills) {
      score += Math.min(skills.length * 10, 30); // Max 30 points
    }
    
    // Check for company/context information
    const companyInfo = text.match(depth.companyInfo);
    if (companyInfo) {
      score += Math.min(companyInfo.length * 5, 25); // Max 25 points
    }
    
    return Math.min(score, 100);
  }

  /**
   * Comprehensive quality assessment
   */
  assessQuality(text, contentType = 'job_description') {
    const structureScore = this.calculateStructureScore(text);
    const professionalScore = this.calculateProfessionalScore(text);
    const depthScore = this.calculateDepthScore(text);
    
    // Weighted average based on content type
    let overallScore;
    if (contentType === 'job_description') {
      overallScore = (structureScore * 0.3) + (professionalScore * 0.4) + (depthScore * 0.3);
    } else if (contentType === 'resume_summary') {
      overallScore = (structureScore * 0.2) + (professionalScore * 0.5) + (depthScore * 0.3);
    } else {
      overallScore = (structureScore + professionalScore + depthScore) / 3;
    }
    
    return {
      overallScore: Math.round(overallScore),
      breakdown: {
        structure: structureScore,
        professional: professionalScore,
        depth: depthScore
      },
      assessment: this.getQualityAssessment(overallScore),
      suggestions: this.generateQualitySuggestions(structureScore, professionalScore, depthScore, contentType)
    };
  }

  /**
   * Get quality assessment based on score
   */
  getQualityAssessment(score) {
    if (score >= 80) {
      return {
        level: 'excellent',
        message: 'High-quality, well-structured content',
        confidence: 'high'
      };
    } else if (score >= 60) {
      return {
        level: 'good',
        message: 'Good quality content with room for improvement',
        confidence: 'medium'
      };
    } else if (score >= 40) {
      return {
        level: 'fair',
        message: 'Adequate content but lacks detail or structure',
        confidence: 'medium'
      };
    } else if (score >= 20) {
      return {
        level: 'poor',
        message: 'Low quality content that needs significant improvement',
        confidence: 'high'
      };
    } else {
      return {
        level: 'very_poor',
        message: 'Very low quality content, likely not useful for interview preparation',
        confidence: 'high'
      };
    }
  }

  /**
   * Generate specific improvement suggestions
   */
  generateQualitySuggestions(structureScore, professionalScore, depthScore, contentType) {
    const suggestions = [];
    
    if (structureScore < 50) {
      suggestions.push('Improve organization with bullet points or clear sections');
      suggestions.push('Break content into readable paragraphs');
    }
    
    if (professionalScore < 50) {
      suggestions.push('Include more specific job requirements and qualifications');
      suggestions.push('Use professional language and industry terminology');
    }
    
    if (depthScore < 50) {
      suggestions.push('Add specific details like required years of experience');
      suggestions.push('Include technical skills, tools, or technologies');
      suggestions.push('Mention company size, industry, or work environment');
    }
    
    if (contentType === 'job_description' && structureScore < 30) {
      suggestions.push('Include sections like: Job Title, Responsibilities, Requirements, Company Info');
    }
    
    if (contentType === 'resume_summary' && depthScore < 40) {
      suggestions.push('Include quantifiable achievements (numbers, percentages, timeframes)');
      suggestions.push('Mention specific technologies, tools, or methodologies you\'ve used');
    }
    
    return suggestions;
  }

  /**
   * Quick quality check for validation
   */
  quickQualityCheck(text, contentType = 'job_description') {
    const quality = this.assessQuality(text, contentType);
    
    return {
      isAcceptable: quality.overallScore >= 30, // Minimum threshold
      score: quality.overallScore,
      level: quality.assessment.level,
      needsImprovement: quality.overallScore < 60,
      suggestions: quality.suggestions.slice(0, 3) // Top 3 suggestions
    };
  }
}

module.exports = QualityScorer;