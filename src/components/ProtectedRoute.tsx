import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import useAuthStore from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
