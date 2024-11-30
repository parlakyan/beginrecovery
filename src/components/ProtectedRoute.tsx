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
 * 
 * Dependencies:
 * - useAuthStore: Authentication state management
 * - react-router-dom: Navigation and location handling
 * 
 * @param props.children - Components to render when access is granted
 * @param props.requiredRole - Optional role requirement
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  // Get auth state and loading status
  const { user, loading } = useAuthStore();
  const location = useLocation();

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if role requirement not met
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return <>{children}</>;
}
