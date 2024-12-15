import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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

export default function App() {
  const location = useLocation();
  const { user, refreshToken } = useAuthStore();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Refresh token periodically
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 45 * 60 * 1000); // 45 minutes

    return () => clearInterval(refreshInterval);
  }, [user, refreshToken]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/address-review" element={<AddressReviewPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/:slug" element={<ListingDetail />} />
      <Route path="/facility/:id" element={<ListingDetail />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
