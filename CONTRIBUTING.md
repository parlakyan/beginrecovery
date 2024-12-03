# Contributing to Recovery Directory

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a new branch for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- Stripe account

### Setup
1. Install dependencies
   ```bash
   npm install
   ```

2. Create `.env` file with required configurations

3. Run development server
   ```bash
   npm run dev
   ```

## Code Guidelines

### TypeScript
- Use strict TypeScript mode
- Provide type annotations
- Avoid `any` type
- Use proper interfaces for facility and user types

### React Components
- Use functional components
- Utilize hooks
- Follow component composition patterns
- Handle verification status appropriately
- Follow established patterns for photo handling

### Verification System
When working with facility-related features:
- Always check facility.isVerified for conditional rendering
- Follow established patterns for verified vs unverified features
- Test both verification states
- Document verification-dependent features
- Handle verification status changes properly

### Photo Handling
When working with facility photos:
- Follow guidelines in `docs/PHOTO_UPLOAD.md`
- Respect verification-based display rules:
  - Verified: Show all photos with slideshow
  - Unverified: Show only first photo
- Use ImageCarousel component correctly
- Handle photo uploads properly
- Test both verified and unverified states

### Component Guidelines

#### ImageCarousel
- Always pass isVerified prop
- Handle navigation appropriately
- Test touch interactions
- Follow responsive design patterns

#### RehabCard
- Maintain consistent layout
- Keep CTAs at bottom
- Handle verification badge properly
- Test all user role scenarios

#### EditListingModal
- Preserve form state
- Handle photo updates correctly
- Test verification transitions
- Maintain proper validation

### State Management
- Use Zustand for global state
- Keep state logic minimal and focused
- Handle verification state properly
- Maintain proper user role states

### Styling
- Use Tailwind CSS
- Follow design system in `docs/DESIGN_SYSTEM.md`
- Maintain consistent verification indicators
- Use proper badge styling

## Testing Guidelines

### Verification Testing
Test all features in both states:
- Verified facility features
- Unverified facility features
- Verification status transitions
- User role permissions

### Photo System Testing
Test all photo scenarios:
- Single photo display
- Multiple photo slideshow
- Upload functionality
- Verification-based display
- Error states

## Documentation Requirements

When adding or modifying features:
1. Update component documentation
2. Document verification dependencies
3. Update README.md if needed
4. Update PHOTO_UPLOAD.md for photo-related changes
5. Add proper JSDoc comments

## Commit Messages
- Use conventional commits
- Format: `<type>(scope): description`
  - Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat(auth): add password reset functionality`
- Include verification context if relevant

## Pull Request Process
1. Ensure code passes all lint checks
2. Update documentation if needed
3. Add tests for new features
4. Test verification-dependent features
5. Test photo system changes
6. Submit pull request with clear description

### PR Description Template
```markdown
## Changes
- List changes here

## Verification Features
- [ ] Tested verified facility features
- [ ] Tested unverified facility features
- [ ] Checked verification transitions
- [ ] Updated relevant documentation

## Photo System
- [ ] Tested photo upload
- [ ] Verified display rules
- [ ] Checked error handling
- [ ] Updated documentation
```

## Reporting Issues
- Use GitHub Issues
- Provide detailed description
- Include reproduction steps
- Specify environment details
- Note verification status if relevant
- Include screenshots if visual

## Code of Conduct
- Be respectful
- Collaborate constructively
- Welcome diverse perspectives
- Maintain professional communication
