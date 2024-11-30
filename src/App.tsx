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

export default function App() {
  const { initialized } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set auth persistence to LOCAL
        await setPersistence(auth, browserLocalPersistence);
        console.log('Auth persistence set to LOCAL');

        // Run the migration when the app starts
        await facilitiesService.migrateExistingSlugs();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    if (initialized) {
      initializeApp();
    }
  }, [initialized]);

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
        <Route path="/" element={<HomePage />} />
        {/* Support both old and new URL formats */}
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/:slug" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route 
          path="/account/*" 
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NetworkStatus />
    </>
  );
}
