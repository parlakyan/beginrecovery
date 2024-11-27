import { StrictMode } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route,
  Outlet
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CreateListing from './pages/CreateListing';
import Payment from './pages/Payment';
import ResetPassword from './pages/ResetPassword';
import AccountPage from './pages/AccountPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import NetworkStatus from './components/NetworkStatus';
import { useAuthStore } from './store/authStore';

const AppLayout = () => {
  return (
    <>
      <NetworkStatus />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="listing/:id" element={<ListingDetail />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="create-listing" element={<CreateListing />} />
      <Route path="payment/*" element={<Payment />} />
      <Route 
        path="account/*" 
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="admin/*" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function App() {
  const { initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
