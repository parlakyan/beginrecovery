import { StrictMode, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import HomePage from './pages/HomePage';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AddListing from './pages/AddListing';
import CreateListing from './pages/CreateListing';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/payment/Success';
import PaymentCancel from './pages/payment/Cancel';
import ResetPassword from './pages/ResetPassword';
import AccountPage from './pages/AccountPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import NetworkStatus from './components/NetworkStatus';
import { useAuthStore } from './store/authStore';
import { auth } from './lib/firebase';
import { facilitiesService } from './services/firebase';
import { Loader2 } from 'lucide-react';

/**
 * Main Application Component
 * 
 * Handles:
 * - Route configuration
 * - Authentication persistence
 * - Protected routes
 * - Role-based access control
 * 
 * Routes:
 * - Public: Home, Login, Register, Reset Password
 * - Protected: Account, Create Listing, Payment
 * - Role-Based: Admin Dashboard (requires admin role)
 */
export default function App() {
  const { initialized } = useAuthStore();

  // Initialize app settings and run migrations
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set auth persistence to LOCAL to maintain session
        await setPersistence(auth, browserLocalPersistence);
        console.log('Auth persistence set to LOCAL');

        // Run slug migration for facilities
        await facilitiesService.migrateExistingSlugs();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    if (initialized) {
      initializeApp();
    }
  }, [initialized]);

  // Show loading screen while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading application...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/:slug" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes - Require Authentication */}
        <Route path="/create-listing" element={
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
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
        <Route path="/account/*" element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        } />

        {/* Admin Routes - Require Admin Role */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Network Status Indicator */}
      <NetworkStatus />
    </>
  );
}
