// ==========================================
// AI Interview Coach - Build Configuration Injector
// ==========================================

const fs = require('fs');
const path = require('path');
const environments = require('./environments');

class ConfigBuilder {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.outputPath = path.join(__dirname, '../js/config.js');
    this.timestamp = new Date().toISOString();
  }

  /**
   * Generate configuration with environment variable overrides
   */
  generateConfig() {
    const envConfig = environments[this.environment];
    
    if (!envConfig) {
      throw new Error(`Environment '${this.environment}' not found. Available environments: ${Object.keys(environments).join(', ')}`);
    }

    // Allow environment variable overrides for deployment flexibility
    const finalConfig = {
      ...envConfig,
      
      // Core API settings
      API_BASE_URL: process.env.FRONTEND_API_URL || envConfig.API_BASE_URL,
      REQUEST_TIMEOUT: process.env.FRONTEND_REQUEST_TIMEOUT ? 
        parseInt(process.env.FRONTEND_REQUEST_TIMEOUT) : envConfig.REQUEST_TIMEOUT,
      
      // Analytics settings
      ANALYTICS_ENABLED: process.env.FRONTEND_ANALYTICS_ENABLED ? 
        process.env.FRONTEND_ANALYTICS_ENABLED === 'true' : envConfig.ANALYTICS_ENABLED,
      ANALYTICS_BATCH_INTERVAL: process.env.FRONTEND_ANALYTICS_INTERVAL ? 
        parseInt(process.env.FRONTEND_ANALYTICS_INTERVAL) : envConfig.ANALYTICS_BATCH_INTERVAL,
      
      // Debug and development
      DEBUG_MODE: process.env.FRONTEND_DEBUG_MODE ? 
        process.env.FRONTEND_DEBUG_MODE === 'true' : envConfig.DEBUG_MODE,
      
      // Feature flags (can be overridden)
      FEATURES: {
        ...envConfig.FEATURES,
        RESUME_ANALYSIS: process.env.FEATURE_RESUME_ANALYSIS ? 
          process.env.FEATURE_RESUME_ANALYSIS === 'true' : envConfig.FEATURES.RESUME_ANALYSIS,
        PRACTICE_MODE: process.env.FEATURE_PRACTICE_MODE ? 
          process.env.FEATURE_PRACTICE_MODE === 'true' : envConfig.FEATURES.PRACTICE_MODE,
        ADVANCED_ANALYTICS: process.env.FEATURE_ADVANCED_ANALYTICS ? 
          process.env.FEATURE_ADVANCED_ANALYTICS === 'true' : envConfig.FEATURES.ADVANCED_ANALYTICS
      },
      
      // Build metadata
      BUILD_TIMESTAMP: this.timestamp,
      BUILD_ENVIRONMENT: this.environment
    };

    // Validate the final configuration
    this.validateConfig(finalConfig);
    
    return finalConfig;
  }

  /**
   * Validate configuration before writing
   */
  validateConfig(config) {
    // Check API URL is valid
    try {
      new URL(config.API_BASE_URL);
    } catch (error) {
      throw new Error(`Invalid API_BASE_URL: ${config.API_BASE_URL}`);
    }
    
    // Check numeric values
    if (config.REQUEST_TIMEOUT < 1000) {
      throw new Error(`REQUEST_TIMEOUT too low: ${config.REQUEST_TIMEOUT}ms (minimum 1000ms)`);
    }
    
    if (config.ANALYTICS_BATCH_INTERVAL < 1000) {
      throw new Error(`ANALYTICS_BATCH_INTERVAL too low: ${config.ANALYTICS_BATCH_INTERVAL}ms (minimum 1000ms)`);
    }
    
    console.log(`[CONFIG BUILD] ✅ Configuration validation passed`);
  }

  /**
   * Write configuration file to frontend/js/config.js
   */
  writeConfigFile() {
    const config = this.generateConfig();
    
    // Ensure output directory exists
    const outputDir = path.dirname(this.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const configContent = `// ==========================================
// AI Interview Coach - Runtime Configuration
// Auto-generated for environment: ${this.environment}
// Build timestamp: ${this.timestamp}
// ==========================================

window.APP_CONFIG = ${JSON.stringify(config, null, 2)};

// Configuration helper functions
window.APP_CONFIG.getApiUrl = function(endpoint) {
  return this.API_BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
};

window.APP_CONFIG.isFeatureEnabled = function(featureName) {
  return this.FEATURES && this.FEATURES[featureName] === true;
};

window.APP_CONFIG.log = function(...args) {
  if (this.DEBUG_MODE) {
    console.log('[APP CONFIG]', ...args);
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.APP_CONFIG;
}

// Development helper - log configuration on load
if (window.APP_CONFIG.DEBUG_MODE) {
  console.log('[APP CONFIG] Configuration loaded for environment:', window.APP_CONFIG.ENVIRONMENT);
  console.log('[APP CONFIG] API Base URL:', window.APP_CONFIG.API_BASE_URL);
  console.log('[APP CONFIG] Features:', window.APP_CONFIG.FEATURES);
  console.log('[APP CONFIG] Build timestamp:', window.APP_CONFIG.BUILD_TIMESTAMP);
}
`;

    fs.writeFileSync(this.outputPath, configContent);
    
    console.log(`[CONFIG BUILD] 🎯 Configuration built successfully!`);
    console.log(`[CONFIG BUILD] Environment: ${this.environment}`);
    console.log(`[CONFIG BUILD] API Base URL: ${config.API_BASE_URL}`);
    console.log(`[CONFIG BUILD] Analytics: ${config.ANALYTICS_ENABLED ? 'Enabled' : 'Disabled'}`);
    console.log(`[CONFIG BUILD] Debug Mode: ${config.DEBUG_MODE ? 'Enabled' : 'Disabled'}`);
    console.log(`[CONFIG BUILD] Output: ${this.outputPath}`);
    
    return config;
  }

  /**
   * Generate environment info for deployment
   */
  generateDeploymentInfo() {
    const config = this.generateConfig();
    
    const deploymentInfo = {
      environment: this.environment,
      buildTimestamp: this.timestamp,
      apiBaseUrl: config.API_BASE_URL,
      features: config.FEATURES,
      analyticsEnabled: config.ANALYTICS_ENABLED,
      debugMode: config.DEBUG_MODE
    };
    
    const infoPath = path.join(__dirname, '../deployment-info.json');
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`[CONFIG BUILD] 📋 Deployment info written to: ${infoPath}`);
    
    return deploymentInfo;
  }
}

// Command line interface
if (require.main === module) {
  try {
    const builder = new ConfigBuilder();
    const config = builder.writeConfigFile();
    
    // Generate deployment info if requested
    if (process.argv.includes('--deployment-info')) {
      builder.generateDeploymentInfo();
    }
    
    // Show feature flags if requested
    if (process.argv.includes('--show-features')) {
      console.log('\n🚀 Feature Flags:');
      Object.entries(config.FEATURES).forEach(([feature, enabled]) => {
        console.log(`   ${feature}: ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error(`[CONFIG BUILD] ❌ Build failed:`, error.message);
    process.exit(1);
  }
}

module.exports = ConfigBuilder;