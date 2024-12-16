import React, { useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import HomePage from './pages/HomePage';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ResetPasswordPage from './pages/ResetPassword';
import NotFoundPage from './pages/NotFound';
import PaymentPage from './pages/Payment';
import SearchResults from './pages/SearchResults';
import AdminDashboard from './pages/AdminDashboard';
import AddressReviewPage from './pages/admin/AddressReviewPage';
import PaymentSuccess from './pages/payment/Success';
import PaymentCancel from './pages/payment/Cancel';

// Protected route wrapper
function ProtectedRoute({ 
  children, 
  requiredRole = 'user'
}: { 
  children: JSX.Element, 
  requiredRole?: 'user' | 'owner' | 'admin' 
}) {
  const { user, initialized } = useAuthStore();

  // Show nothing while auth is initializing
  if (!initialized) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'owner' && user.role !== 'owner' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}

// Error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const location = useLocation();
  const { initialized } = useAuthStore();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show nothing while auth is initializing
  if (!initialized) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/:slug" element={<ListingDetail />} />
          <Route path="/facility/:id" element={<ListingDetail />} />

          {/* Protected routes */}
          <Route path="/create-listing" element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/payment/success" element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          } />
          <Route path="/payment/cancel" element={
            <ProtectedRoute>
              <PaymentCancel />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/address-review" element={
            <ProtectedRoute requiredRole="admin">
              <AddressReviewPage />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
