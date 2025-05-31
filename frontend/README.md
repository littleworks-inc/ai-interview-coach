# AI Interview Coach - Frontend

Environment-based configuration system for the AI Interview Coach frontend application.

## Quick Start

```bash
# Install dependencies
npm install

# Development (default)
npm run dev
npm start

# Staging
npm run staging
npm run start:staging

# Production
npm run prod
npm run start:prod
```

## Environment Configuration

### Available Environments

- **development** - Local development with debug mode
- **staging** - Pre-production testing environment
- **production** - Live production environment
- **test** - Automated testing environment

### Build Commands

```bash
# Build configuration for specific environment
npm run build:dev      # Development
npm run build:staging  # Staging
npm run build:prod     # Production
npm run build:test     # Testing

# Build with deployment info
npm run info           # Shows configuration details
npm run deploy:staging # Clean build for staging
npm run deploy:prod    # Clean build for production
```

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Required
NODE_ENV=production

# Optional overrides
FRONTEND_API_URL=https://api.aiinterviewcoach.com
FRONTEND_ANALYTICS_ENABLED=true
FRONTEND_DEBUG_MODE=false
FEATURE_RESUME_ANALYSIS=true
```

## Configuration System

### How It Works

1. **Build Time**: `config/build.js` reads environment settings from `config/environments.js`
2. **Runtime**: Generated `js/config.js` provides configuration to the application
3. **Override**: Environment variables can override default settings

### Generated Configuration

The build process creates `js/config.js` with:

```javascript
window.APP_CONFIG = {
  API_BASE_URL: "https://api.aiinterviewcoach.com",
  ANALYTICS_ENABLED: true,
  DEBUG_MODE: false,
  ENVIRONMENT: "production",
  FEATURES: {
    RESUME_ANALYSIS: true,
    PRACTICE_MODE: false
  }
};
```

### Using Configuration in Code

```javascript
// Get API URL
const apiUrl = window.APP_CONFIG.getApiUrl('/api/generate');

// Check feature flags
if (window.APP_CONFIG.isFeatureEnabled('RESUME_ANALYSIS')) {
  // Enable resume analysis features
}

// Debug logging
window.APP_CONFIG.log('Debug message'); // Only logs if DEBUG_MODE is true
```

## File Structure

```
frontend/
├── config/
│   ├── environments.js    # Environment definitions
│   └── build.js          # Build-time configuration generator
├── js/
│   ├── config.js         # Generated runtime configuration
│   ├── app.js           # Updated to use configuration
│   └── analytics.js     # Updated to use configuration
├── package.json         # Build scripts
├── .env.example        # Environment variable examples
└── README.md           # This file
```

## Deployment

### Development
```bash
npm run dev && npm start
```
Opens on http://localhost:8080 with debug mode enabled.

### Staging
```bash
NODE_ENV=staging npm run deploy:staging
npm run start:staging
```

### Production
```bash
NODE_ENV=production npm run deploy:prod
# Upload files to your web server
```

### Docker Deployment
```dockerfile
# In your Dockerfile
ARG NODE_ENV=production
ARG FRONTEND_API_URL
ENV NODE_ENV=$NODE_ENV
ENV FRONTEND_API_URL=$FRONTEND_API_URL

RUN npm run build:$NODE_ENV
```

## Feature Flags

Control features through environment configuration:

```javascript
// In environments.js
FEATURES: {
  RESUME_ANALYSIS: true,    // Enable resume analysis
  PRACTICE_MODE: false,     // Disable practice mode
  ADVANCED_ANALYTICS: true  // Enable advanced analytics
}
```

## Troubleshooting

### Configuration Not Loading
1. Ensure `js/config.js` exists: `npm run build:dev`
2. Check console for errors: Enable debug mode
3. Verify environment: `npm run info`

### API Connection Issues
1. Check API URL: `window.APP_CONFIG.API_BASE_URL`
2. Verify CORS settings on backend
3. Test API endpoint manually

### Build Errors
```bash
# Validate configuration
npm run validate:config

# Clean and rebuild
npm run clean
npm run build:dev
```

## API Endpoints Used

- `GET /api/generate` - Generate interview questions
- `POST /api/validate` - Validate content
- `POST /api/analytics` - Send analytics events

## Development Tips

1. **Always build config first**: Run `npm run dev` before starting development
2. **Use debug mode**: Set `DEBUG_MODE: true` for detailed logging
3. **Test all environments**: Verify configuration works in dev, staging, and prod
4. **Check feature flags**: Use `window.APP_CONFIG.isFeatureEnabled()` for conditional features
5. **Monitor analytics**: Analytics are automatically configured per environment