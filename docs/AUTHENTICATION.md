# Authentication System

## Overview
The authentication system uses Firebase Authentication with enhanced session management, role-based access control, and a robust token refresh strategy. The system maintains user sessions across page reloads while ensuring secure access to protected resources.

## Features

### Session Management
- Local persistence for maintaining login state
- Automatic token refresh every 45 minutes
- Secure session cleanup on logout
- Cross-tab session synchronization

### Role-Based Access Control
- User roles: user, owner, admin
- Protected route system
- Role-specific feature access
- Automatic role verification

### Security Features
- Secure password requirements
- Token-based authentication
- CSRF protection
- Rate limiting
- Session invalidation

## Components

### Protected Route Wrapper
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

Features:
- Role-based access control
- Automatic redirect to login
- Return URL preservation
- Loading state handling

### Auth Store
The central authentication state management:
```typescript
const { user, signIn, signOut, error } = useAuthStore();
```

Features:
- Centralized auth state
- Token refresh management
- Error handling
- Role management

## Implementation Details

### 1. Firebase Configuration
```typescript
// src/lib/firebase.ts
const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);
```

### 2. Protected Routes
```typescript
// src/App.tsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

### 3. Auth Forms
All auth forms include:
- Form validation
- Error handling
- Loading states
- Proper autocomplete attributes
- Return URL handling

## User Flows

### Sign In
1. User enters credentials
2. Credentials validated
3. Firebase auth token obtained
4. User role and permissions fetched
5. Token stored with local persistence
6. Redirect to intended destination

### Sign Out
1. Clear local auth state
2. Revoke Firebase token
3. Clear local storage
4. Redirect to home page

### Password Reset
1. User requests reset
2. Reset email sent
3. User clicks reset link
4. Token validated
5. New password set
6. Automatic sign in

## Error Handling

### Common Errors
- Invalid credentials
- Expired session
- Invalid reset token
- Network issues
- Permission denied

### Error Recovery
1. Clear invalid session
2. Redirect to login
3. Preserve return URL
4. Show user-friendly message

## Best Practices

### Security
1. Always use HTTPS
2. Implement rate limiting
3. Validate tokens server-side
4. Use secure password requirements
5. Implement session timeouts

### User Experience
1. Clear error messages
2. Loading indicators
3. Redirect preservation
4. Form validation
5. Autocomplete support

### Development
1. Type safety
2. Error boundaries
3. Proper cleanup
4. Consistent error handling
5. Performance optimization

## Configuration

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Firebase Rules
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null && auth.token.admin === true"
  }
}
```

## Troubleshooting

### Common Issues

#### Session Lost on Refresh
- Check persistence configuration
- Verify token refresh setup
- Check for storage errors

#### Permission Errors
- Verify user role
- Check token claims
- Validate route protection

#### Token Refresh Issues
- Check refresh timing
- Verify token validity
- Check network connectivity

## Testing

### Unit Tests
- Auth store tests
- Protected route tests
- Form validation tests
- Error handling tests

### Integration Tests
- Sign in flow
- Sign out flow
- Password reset flow
- Role-based access

### E2E Tests
- Complete auth flows
- Cross-browser testing
- Network error handling
- Session management

## Migration Guide

When updating from previous versions:

1. Update environment variables
2. Run database migrations
3. Update security rules
4. Clear existing sessions
5. Update client configurations

## Security Considerations

### Token Management
- Secure token storage
- Regular token refresh
- Proper token validation
- Token revocation on logout

### Session Security
- CSRF protection
- XSS prevention
- Session fixation protection
- Secure cookie handling

### Password Security
- Strong password requirements
- Secure reset process
- Rate limiting
- Account lockout

## Performance Optimization

### Token Refresh Strategy
- Optimized refresh timing
- Batch token updates
- Caching mechanisms
- Background refresh

### State Management
- Efficient auth store
- Minimal re-renders
- Proper cleanup
- Memory management
