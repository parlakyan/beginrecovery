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

### React Components
- Use functional components
- Utilize hooks
- Follow component composition patterns

### State Management
- Use Zustand for global state
- Keep state logic minimal and focused

### Styling
- Use Tailwind CSS
- Follow design system in `docs/DESIGN_SYSTEM.md`

## Commit Messages
- Use conventional commits
- Format: `<type>(scope): description`
  - Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat(auth): add password reset functionality`

## Pull Request Process
1. Ensure code passes all lint checks
2. Update documentation if needed
3. Add tests for new features
4. Submit pull request with clear description

## Reporting Issues
- Use GitHub Issues
- Provide detailed description
- Include reproduction steps
- Specify environment details

## Code of Conduct
- Be respectful
- Collaborate constructively
- Welcome diverse perspectives
