# User Roles & Permissions Documentation

## Overview
The Recovery Directory platform implements a role-based access control system with three main roles:
- Admin
- Facility Owner
- Regular User

For detailed authentication implementation and session management, see [Authentication Documentation](./AUTHENTICATION.md).

## Role Definitions

### Admin Role
Administrators have full platform control and moderation capabilities.

#### Permissions
1. Facility Management
   - View all facilities
   - Edit any facility
   - Delete facilities
   - Toggle verification status
   - Feature/unfeature facilities

2. Moderation
   - Approve/reject listings
   - Archive facilities
   - Restore archived facilities
   - Set moderation status

3. User Management
   - View all users
   - Manage user roles
   - Access user data

4. Platform Management
   - Access admin dashboard
   - View platform statistics
   - Manage system settings

### Facility Owner Role
Owners can manage their own facility listings.

#### Permissions
1. Facility Management
   - Create new listings
   - Edit own listings
   - View own listings
   - Upload facility photos
   - Manage facility information

2. Listing Features
   - Access owner dashboard
   - View listing status
   - Upgrade to verified status
   - Manage photos and content

3. Analytics
   - View listing statistics
   - Track visitor data
   - Monitor engagement

4. Communication
   - Receive inquiries
   - Manage contact information
   - Update availability status

### Regular User Role
Basic platform users with browsing capabilities.

#### Permissions
1. Browsing
   - View facilities
   - Search listings
   - Filter results
   - View facility details

2. Interaction
   - Save favorite facilities
   - Contact facilities
   - Submit inquiries
   - Share listings

## Implementation

### Role Assignment
```typescript
enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  USER = 'user'
}
```

### Access Control
```typescript
// Example permission check
const canEdit = (user: User, facility: Facility) => {
  return user.role === 'admin' || 
         (user.role === 'owner' && user.id === facility.ownerId);
};
```

### Component Access
```typescript
// Example protected component
const AdminDashboard = () => {
  const { user } = useAuthStore();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return <Dashboard />;
};
```

## Role-Based Features

### Admin Features
1. Admin Dashboard
   - Facility management
   - User management
   - Moderation tools
   - Analytics dashboard

2. Moderation Tools
   - Approval workflow
   - Content moderation
   - Status management
   - User management

### Owner Features
1. Owner Dashboard
   - Listing management
   - Analytics
   - Upgrade options
   - Photo management

2. Management Tools
   - Edit listings
   - Update status
   - Manage photos
   - Track performance

### User Features
1. User Dashboard
   - Saved facilities
   - Recent searches
   - Preferences
   - Contact history

## Security Considerations

### Authentication
- Firebase Authentication integration
- Role-based routing with protected routes
- Secure session management
- Token refresh strategy

For detailed authentication implementation, see [Authentication Documentation](./AUTHENTICATION.md#implementation-details).

### Authorization
- Server-side role checks
- Client-side access control
- API endpoint protection
- Data access validation

For security best practices, see [Authentication Security Guide](./AUTHENTICATION.md#security-considerations).

### Data Access
- Role-based queries
- Filtered responses
- Secure endpoints
- Data validation

## Best Practices

### Development
1. Always check user roles
2. Implement proper guards
3. Validate permissions
4. Handle unauthorized access
5. Log security events

### UI/UX
1. Clear role indicators
2. Appropriate feature access
3. Helpful error messages
4. Intuitive navigation
5. Role-specific content

### Testing
1. Test all role scenarios
2. Verify permission checks
3. Validate access control
4. Test edge cases
5. Security testing

## Troubleshooting

### Common Issues
1. Permission denied errors
2. Role assignment issues
3. Access control problems
4. Authentication failures

For authentication-specific troubleshooting, see [Authentication Troubleshooting Guide](./AUTHENTICATION.md#troubleshooting).

### Solutions
1. Verify user role
2. Check permission settings
3. Clear cache/session
4. Review security rules
5. Check authentication

## Future Improvements
1. Custom role creation
2. Role hierarchies
3. Granular permissions
4. Role analytics
5. Enhanced security

For planned authentication improvements, see [Authentication Updates](./AUTHENTICATION.md#updates-and-maintenance).
