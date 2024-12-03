# Deployment Documentation

## Overview
The Recovery Directory platform uses Netlify for frontend deployment and Firebase for backend services. This document details the deployment process and configuration.

## Architecture

### Frontend
- React application
- Netlify hosting
- Automatic deployments
- Environment configuration

### Backend
- Firebase services
- Netlify functions
- Stripe integration
- Storage configuration

## Prerequisites

### Accounts Required
1. Netlify account
2. Firebase account
3. Stripe account
4. GitHub account

### Environment Setup
```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Stripe
VITE_STRIPE_PUBLIC_KEY=
VITE_STRIPE_PRICE_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Deployment Process

### Initial Setup

1. Netlify Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize project
netlify init
```

2. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init
```

### Configuration Files

#### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 8888

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### firebase.json
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Build Process

1. Frontend Build
```bash
# Install dependencies
npm install

# Build application
npm run build

# Preview build
npm run preview
```

2. Function Deployment
```bash
# Build functions
netlify build

# Deploy functions
netlify deploy --prod
```

3. Firebase Deployment
```bash
# Deploy Firebase configuration
firebase deploy
```

## Deployment Environments

### Production
- Domain: beginrecovery.org
- Branch: main
- Environment: production

### Staging
- Domain: staging.beginrecovery.org
- Branch: staging
- Environment: staging

### Development
- Domain: dev.beginrecovery.org
- Branch: develop
- Environment: development

## Continuous Integration

### GitHub Actions
```yaml
name: CI/CD

on:
  push:
    branches: [ main, staging, develop ]
  pull_request:
    branches: [ main, staging ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
```

### Netlify Build
```yaml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[context.production]
  environment = { NODE_ENV = "production" }

[context.staging]
  environment = { NODE_ENV = "staging" }

[context.develop]
  environment = { NODE_ENV = "development" }
```

## Monitoring

### Error Tracking
- Sentry integration
- Error reporting
- Performance monitoring
- User feedback

### Analytics
- Firebase Analytics
- User tracking
- Event logging
- Performance metrics

## Security

### SSL Configuration
- Automatic SSL
- Force HTTPS
- Security headers
- CORS policy

### Environment Variables
- Secure storage
- Access control
- Key rotation
- Secret management

## Backup & Recovery

### Database Backup
- Daily backups
- Version control
- Recovery process
- Data retention

### Disaster Recovery
- Backup deployment
- Data restoration
- Service continuity
- Incident response

## Performance

### Optimization
1. Asset compression
2. Code splitting
3. Lazy loading
4. Cache control

### CDN Configuration
1. Asset caching
2. Edge locations
3. Cache invalidation
4. Performance rules

## Troubleshooting

### Common Issues
1. Build failures
2. Function errors
3. Database issues
4. Storage problems

### Solutions
1. Check logs
2. Verify configuration
3. Test locally
4. Review changes

## Best Practices

### Deployment
1. Version control
2. Environment separation
3. Automated testing
4. Rollback plan

### Security
1. Access control
2. Data encryption
3. Regular updates
4. Security scanning

### Monitoring
1. Error tracking
2. Performance monitoring
3. User feedback
4. System metrics

## Future Improvements
1. Docker containers
2. Kubernetes deployment
3. Enhanced monitoring
4. Automated testing
5. Performance optimization
6. Security enhancements
7. Backup automation
8. Deployment automation
9. Environment management
10. Documentation updates
