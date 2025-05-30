// ==========================================
// AI Interview Coach - Content Filter
// ==========================================

/**
 * Content filtering for profanity, spam, and inappropriate content
 */
class ContentFilter {
  constructor() {
    // Basic profanity list (expandable)
    this.profanityList = [
      // Common profanity patterns - keeping it minimal for now
      'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard',
      // Add more as needed, can be loaded from external file
    ];
    
    // Spam patterns
    this.spamPatterns = {
      // Excessive repetition
      excessiveRepetition: /(.)\1{10,}/g,
      // Lorem ipsum detection
      loremIpsum: /lorem\s+ipsum|dolor\s+sit\s+amet/gi,
      // Random gibberish patterns
      gibberish: /^[a-z\s]{5,}$/gi,
      // Excessive caps
      excessiveCaps: /[A-Z]{20,}/g,
      // URL spam
      urlSpam: /(https?:\/\/[^\s]+.*){3,}/gi,
      // Email spam
      emailSpam: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}.*){3,}/gi
    };
  }

  /**
   * Check for profanity in content
   */
  containsProfanity(text) {
    const normalizedText = text.toLowerCase();
    const foundWords = [];
    
    for (const word of this.profanityList) {
      if (normalizedText.includes(word)) {
        foundWords.push(word);
      }
    }
    
    return {
      hasProfanity: foundWords.length > 0,
      foundWords: foundWords,
      severity: foundWords.length > 2 ? 'high' : foundWords.length > 0 ? 'medium' : 'none'
    };
  }

  /**
   * Check for spam patterns
   */
  detectSpam(text) {
    const issues = [];
    
    // Check each spam pattern
    if (this.spamPatterns.excessiveRepetition.test(text)) {
      issues.push('excessive_repetition');
    }
    
    if (this.spamPatterns.loremIpsum.test(text)) {
      issues.push('lorem_ipsum');
    }
    
    if (this.spamPatterns.excessiveCaps.test(text)) {
      issues.push('excessive_caps');
    }
    
    if (this.spamPatterns.urlSpam.test(text)) {
      issues.push('url_spam');
    }
    
    if (this.spamPatterns.emailSpam.test(text)) {
      issues.push('email_spam');
    }
    
    // Check for gibberish (very basic)
    const words = text.split(/\s+/);
    const shortWords = words.filter(word => word.length < 3);
    if (shortWords.length / words.length > 0.7 && words.length > 10) {
      issues.push('potential_gibberish');
    }
    
    return {
      isSpam: issues.length > 0,
      issues: issues,
      severity: issues.length > 2 ? 'high' : issues.length > 0 ? 'medium' : 'none'
    };
  }

  /**
   * Comprehensive content filter
   */
  filterContent(text) {
    const profanityCheck = this.containsProfanity(text);
    const spamCheck = this.detectSpam(text);
    
    const isInappropriate = profanityCheck.hasProfanity || spamCheck.isSpam;
    const severity = Math.max(
      profanityCheck.severity === 'high' ? 3 : profanityCheck.severity === 'medium' ? 2 : 1,
      spamCheck.severity === 'high' ? 3 : spamCheck.severity === 'medium' ? 2 : 1
    );
    
    return {
      isAppropriate: !isInappropriate,
      profanity: profanityCheck,
      spam: spamCheck,
      severity: severity > 2 ? 'high' : severity > 1 ? 'medium' : 'low',
      issues: [...(profanityCheck.foundWords || []), ...spamCheck.issues]
    };
  }
}

module.exports = ContentFilter;