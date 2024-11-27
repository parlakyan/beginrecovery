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
    <div className="min-h-screen">
      <NetworkStatus />
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'listing/:id',
        element: <ListingDetail />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'reset-password',
        element: <ResetPassword />
      },
      {
        path: 'create-listing',
        element: <CreateListing />
      },
      {
        path: 'payment/*',
        element: <Payment />
      },
      {
        path: 'account/*',
        element: <ProtectedRoute><AccountPage /></ProtectedRoute>
      },
      {
        path: 'admin/*',
        element: <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

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
