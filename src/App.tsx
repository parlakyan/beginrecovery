import { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import AccountPage from './pages/AccountPage';
import AddListing from './pages/AddListing';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import AdminDashboard from './pages/AdminDashboard';
import Payment from './pages/Payment';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/add-listing"
          element={
            <ProtectedRoute>
              <AddListing />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/create-listing"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
