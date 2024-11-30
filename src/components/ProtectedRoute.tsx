import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

/**
 * Props for ProtectedRoute component
 * 
 * @property children - React components to render when access is granted
 * @property requiredRole - Optional role requirement ('user', 'owner', 'admin')
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'owner' | 'admin';
}

/**
 * Protected Route Component
 * 
 * Handles route protection based on authentication and role requirements.
 * Supports role-based access control for admin and owner routes.
 * 
 * Features:
 * - Shows loading state while checking auth
 * - Redirects to login if not authenticated
 * - Redirects to home if role requirement not met
 * - Preserves attempted route for post-login redirect
 * 
 * Usage:
 * ```tsx
 * <ProtectedRoute requiredRole="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 * ```
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  // Debug logging for role checks
  React.useEffect(() => {
    if (user && requiredRole) {
      console.log('ProtectedRoute - Role Check:', {
        userEmail: user.email,
        userRole: user.role,
        requiredRole,
        hasAccess: user.role === requiredRole,
        path: location.pathname
      });
    }
  }, [user, requiredRole, location]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement if specified
  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute - Insufficient role:', {
      userRole: user.role,
      requiredRole
    });
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return <>{children}</>;
}
