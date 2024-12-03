# Testing Documentation

## Overview
The Recovery Directory platform implements comprehensive testing across all layers of the application. This document details testing strategies, tools, and best practices.

## Testing Stack

### Unit Testing
- Jest
- React Testing Library
- MSW (Mock Service Worker)
- Testing Library User Event

### Integration Testing
- Cypress
- Testing Library
- API mocking
- State management

### End-to-End Testing
- Cypress
- Test scenarios
- User flows
- Cross-browser testing

## Test Structure

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RehabCard } from './RehabCard';

describe('RehabCard', () => {
  const mockFacility = {
    id: '123',
    name: 'Test Facility',
    isVerified: true,
    // ... other props
  };

  it('shows verified badge for verified facility', () => {
    render(<RehabCard facility={mockFacility} />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('shows slideshow for verified facility with multiple images', () => {
    const facilityWithImages = {
      ...mockFacility,
      images: ['image1.jpg', 'image2.jpg']
    };
    render(<RehabCard facility={facilityWithImages} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
describe('Facility Listing Flow', () => {
  it('creates and verifies a facility', () => {
    cy.login('owner@test.com');
    cy.visit('/create-listing');
    cy.fillFacilityForm({
      name: 'New Facility',
      description: 'Test description',
      // ... other fields
    });
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/facility/');
    cy.get('[data-testid="verification-badge"]').should('exist');
  });
});
```

### E2E Tests
```typescript
describe('User Journey', () => {
  it('completes full facility verification process', () => {
    // Login
    cy.login('owner@test.com');

    // Create listing
    cy.createFacility({
      name: 'Test Facility',
      // ... other details
    });

    // Upload photos
    cy.uploadPhotos(['photo1.jpg', 'photo2.jpg']);

    // Complete payment
    cy.initiatePayment();
    cy.completeStripePayment();

    // Verify status
    cy.get('[data-testid="verified-badge"]').should('be.visible');
  });
});
```

## Test Categories

### Component Tests
1. Rendering
2. User interactions
3. State changes
4. Props validation
5. Error handling

### Feature Tests
1. Verification flow
2. Photo upload
3. Payment process
4. User management
5. Moderation system

### API Tests
1. Endpoints
2. Authentication
3. Error handling
4. Rate limiting
5. Data validation

## Test Environment

### Setup
```typescript
// jest.setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mocks
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/facilities', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        facilities: [
          // Mock data
        ]
      })
    );
  }),
  // Other handlers
];
```

## Testing Guidelines

### Component Testing
1. Test rendering
   - Default state
   - Different props
   - Edge cases
   - Error states

2. Test interactions
   - Click events
   - Form inputs
   - Keyboard events
   - Touch events

3. Test state changes
   - User actions
   - Prop updates
   - API responses
   - Error handling

### Integration Testing
1. Test flows
   - User journeys
   - Feature combinations
   - State persistence
   - Error recovery

2. Test interactions
   - Between components
   - With services
   - With state
   - With APIs

### E2E Testing
1. Test scenarios
   - Complete flows
   - User journeys
   - Edge cases
   - Error paths

2. Test environment
   - Multiple browsers
   - Different devices
   - Network conditions
   - State persistence

## Best Practices

### Writing Tests
1. Arrange-Act-Assert pattern
2. Clear test descriptions
3. Meaningful assertions
4. Proper setup/teardown
5. Isolated tests

### Test Organization
1. Consistent structure
2. Clear naming
3. Proper grouping
4. Shared utilities
5. Common setup

### Performance
1. Fast execution
2. Minimal setup
3. Efficient mocks
4. Parallel running
5. CI optimization

## Continuous Integration

### GitHub Actions
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

## Coverage

### Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Reports
- HTML reports
- Coverage badges
- Trend analysis
- CI integration

## Troubleshooting

### Common Issues
1. Flaky tests
2. Slow tests
3. Setup problems
4. Mock issues

### Solutions
1. Stable selectors
2. Proper cleanup
3. Isolated tests
4. Better mocks

## Future Improvements
1. Visual regression testing
2. Performance testing
3. Accessibility testing
4. Security testing
5. Load testing
6. API testing
7. Mobile testing
8. Browser testing
9. State testing
10. Documentation updates
