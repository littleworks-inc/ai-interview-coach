// ==========================================
// AI Interview Coach - Resume Summary Specific Validator
// ==========================================

/**
 * Specialized validation for resume summaries
 */
class ResumeSummaryValidator {
  constructor() {
    // Resume-specific keywords that indicate professional experience
    this.experienceKeywords = [
      'years', 'year', 'experience', 'worked', 'led', 'managed', 'developed',
      'implemented', 'achieved', 'accomplished', 'successful', 'expert',
      'skilled', 'proficient', 'specializing', 'background', 'career'
    ];
    
    // Professional achievement indicators
    this.achievementKeywords = [
      'increased', 'decreased', 'improved', 'optimized', 'delivered', 'exceeded',
      'reduced', 'generated', 'saved', 'grew', 'built', 'created', 'launched'
    ];
    
    // Industry/role indicators
    this.roleKeywords = [
      'engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator',
      'director', 'senior', 'junior', 'lead', 'principal', 'associate'
    ];
    
    // Red flags for resume summaries
    this.redFlags = {
      // Generic/template language
      generic: [
        'hardworking individual', 'team player', 'results-oriented',
        'detail-oriented', 'fast learner', 'self-motivated'
      ],
      
      // Personal information that shouldn't be in professional summary
      personal: [
        'age', 'married', 'single', 'children', 'religion', 'nationality',
        'race', 'gender', 'height', 'weight'
      ],
      
      // Unprofessional language
      unprofessional: [
        'awesome', 'amazing', 'incredible', 'best ever', 'rockstar',
        'ninja', 'guru', 'unicorn'
      ]
    };
  }

  /**
   * Validate resume summary content specifically
   */
  validateResumeSummary(text) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      scores: {
        professional: 0,
        experience: 0,
        achievements: 0,
        overall: 0
      },
      analysis: {}
    };

    if (!text || text.trim().length === 0) {
      result.suggestions.push('Adding a resume summary will significantly improve question personalization');
      return result;
    }

    const normalizedText = text.toLowerCase();
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Length validation
    if (text.length < 50) {
      result.warnings.push('Resume summary is very brief');
      result.suggestions.push('Add more details about your experience, skills, and achievements');
    }

    if (text.length > 800) {
      result.errors.push('Resume summary exceeds 800 characters (not ATS-friendly)');
      result.suggestions.push('Shorten to under 800 characters for better ATS compatibility');
    }

    // Professional language check
    const professionalScore = this.calculateProfessionalScore(normalizedText);
    result.scores.professional = professionalScore;

    // Experience indicators check
    const experienceScore = this.calculateExperienceScore(normalizedText);
    result.scores.experience = experienceScore;

    // Achievement indicators check
    const achievementScore = this.calculateAchievementScore(normalizedText);
    result.scores.achievements = achievementScore;

    // Red flags check
    const redFlagCheck = this.checkRedFlags(normalizedText);
    if (redFlagCheck.hasRedFlags) {
      result.warnings.push(...redFlagCheck.warnings);
      result.suggestions.push(...redFlagCheck.suggestions);
    }

    // First person check (resume should be in first person)
    const firstPersonCheck = this.checkFirstPerson(normalizedText);
    if (!firstPersonCheck.isFirstPerson) {
      result.warnings.push('Resume summary should be written in first person');
      result.suggestions.push('Use "I" statements or implied first person (e.g., "Experienced developer..." instead of "John is an experienced developer...")');
    }

    // Quantifiable achievements check
    const quantifiableCheck = this.checkQuantifiableAchievements(text);
    if (quantifiableCheck.count === 0 && text.length > 100) {
      result.suggestions.push('Include specific numbers, percentages, or timeframes to make achievements more impactful');
    }

    // Calculate overall score
    result.scores.overall = Math.round(
      (professionalScore * 0.4) + (experienceScore * 0.3) + (achievementScore * 0.3)
    );

    // Analysis summary
    result.analysis = {
      wordCount: words.length,
      sentenceCount: sentences.length,
      hasQuantifiableAchievements: quantifiableCheck.count > 0,
      hasExperienceIndicators: experienceScore > 30,
      isProfessional: professionalScore > 50,
      redFlagsFound: redFlagCheck.redFlags
    };

    // Final validation
    if (result.errors.length > 0) {
      result.isValid = false;
    }

    return result;
  }

  /**
   * Calculate professional language score
   */
  calculateProfessionalScore(text) {
    let score = 0;

    // Check for professional terminology
    let profTermCount = 0;
    for (const term of this.roleKeywords) {
      if (text.includes(term)) {
        profTermCount++;
      }
    }
    score += Math.min(profTermCount * 15, 60);

    // Check for experience keywords
    let expTermCount = 0;
    for (const term of this.experienceKeywords) {
      if (text.includes(term)) {
        expTermCount++;
      }
    }
    score += Math.min(expTermCount * 10, 40);

    return Math.min(score, 100);
  }

  /**
   * Calculate experience indicators score
   */
  calculateExperienceScore(text) {
    let score = 0;

    // Look for years of experience
    const yearPatterns = /(\d+)\s*(years?|yrs?|months?)/g;
    const yearMatches = text.match(yearPatterns);
    if (yearMatches) {
      score += 30;
    }

    // Look for specific technologies/tools
    const techPatterns = /\b(javascript|python|java|react|angular|sql|aws|docker|kubernetes|agile|scrum|nodejs|html|css)\b/gi;
    const techMatches = text.match(techPatterns);
    if (techMatches) {
      score += Math.min(techMatches.length * 10, 40);
    }

    // Look for role progression indicators
    const progressionTerms = ['promoted', 'advanced', 'grew from', 'started as', 'currently', 'now'];
    for (const term of progressionTerms) {
      if (text.includes(term)) {
        score += 15;
        break;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate achievement indicators score
   */
  calculateAchievementScore(text) {
    let score = 0;

    // Check for achievement verbs
    let achievementCount = 0;
    for (const verb of this.achievementKeywords) {
      if (text.includes(verb)) {
        achievementCount++;
      }
    }
    score += Math.min(achievementCount * 15, 60);

    // Check for quantifiable results
    const quantifiablePatterns = /\d+([%$kmb]|\s*(percent|million|thousand|hours|projects|people|team))/gi;
    const quantMatches = text.match(quantifiablePatterns);
    if (quantMatches) {
      score += Math.min(quantMatches.length * 20, 40);
    }

    return Math.min(score, 100);
  }

  /**
   * Check for red flags in resume summary
   */
  checkRedFlags(text) {
    const redFlags = [];
    const warnings = [];
    const suggestions = [];

    // Check for generic language
    for (const phrase of this.redFlags.generic) {
      if (text.includes(phrase)) {
        redFlags.push(phrase);
        warnings.push(`Avoid generic phrases like "${phrase}"`);
        suggestions.push('Use specific examples and achievements instead of generic descriptors');
      }
    }

    // Check for personal information
    for (const info of this.redFlags.personal) {
      if (text.includes(info)) {
        redFlags.push(info);
        warnings.push('Resume summary contains personal information that should be omitted');
        suggestions.push('Focus on professional experience, skills, and achievements only');
      }
    }

    // Check for unprofessional language
    for (const term of this.redFlags.unprofessional) {
      if (text.includes(term)) {
        redFlags.push(term);
        warnings.push(`"${term}" may seem unprofessional in a resume summary`);
        suggestions.push('Use more formal, professional language');
      }
    }

    return {
      hasRedFlags: redFlags.length > 0,
      redFlags,
      warnings,
      suggestions
    };
  }

  /**
   * Check if content is written in first person
   */
  checkFirstPerson(text) {
    const firstPersonIndicators = [
      ' i ', ' my ', ' me ', ' myself ', 'i am', 'i have', 'i work',
      // Implied first person (professional style)
      'experienced', 'skilled', 'proficient', 'specialized'
    ];

    const hasFirstPerson = firstPersonIndicators.some(indicator => 
      text.includes(indicator)
    );

    // Check for third person (red flag)
    const thirdPersonIndicators = [' he ', ' she ', ' his ', ' her ', ' they ', ' their '];
    const hasThirdPerson = thirdPersonIndicators.some(indicator => 
      text.includes(indicator)
    );

    return {
      isFirstPerson: hasFirstPerson && !hasThirdPerson,
      hasThirdPerson
    };
  }

  /**
   * Check for quantifiable achievements
   */
  checkQuantifiableAchievements(text) {
    const quantPatterns = [
      /\d+\s*%/g,                           // Percentages
      /\$\d+/g,                             // Dollar amounts
      /\d+\s*(million|thousand|k|m|b)/gi,   // Large numbers
      /\d+\s*(years?|months?)/gi,           // Time periods
      /\d+\s*(people|team|projects|clients)/gi // Counts
    ];

    let totalMatches = 0;
    for (const pattern of quantPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        totalMatches += matches.length;
      }
    }

    return {
      count: totalMatches,
      hasQuantifiableData: totalMatches > 0
    };
  }
}

module.exports = ResumeSummaryValidator;