import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Loader2, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';

/**
 * Header Component
 * Main navigation component with responsive design
 * 
 * Features:
 * - Responsive navigation
 * - User authentication status
 * - Admin dashboard access
 * - Mobile menu
 * 
 * Admin Access:
 * - Shows admin dashboard link when user.role === 'admin'
 * - Available in both desktop and mobile views
 */
export default function Header() {
  const { user, loading, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Log user role for debugging
  React.useEffect(() => {
    if (user) {
      console.log('Header - User Role Check:', {
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin'
      });
    }
  }, [user]);

  /**
   * Handles user logout
   * Clears auth state and redirects to login
   */
  const handleLogout = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Handles auth-related navigation
   * Redirects to account page or login based on auth state
   */
  const handleAuthAction = () => {
    setIsMobileMenuOpen(false);
    if (user) {
      navigate('/account');
    } else {
      navigate('/login', { state: { from: location } });
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Find Treatment</Link>
            <Link to="/resources" className="text-gray-600 hover:text-blue-600">Resources</Link>
            <Link to="/insurance" className="text-gray-600 hover:text-blue-600">Insurance</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600">About Us</Link>
            {/* Admin Dashboard Link - Only visible for admin users */}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <LayoutGrid className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleAuthAction}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                    >
                      <span className="hidden md:block">My Account</span>
                      <User className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-blue-600 md:flex items-center gap-2 hidden"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAuthAction}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hidden md:block hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                )}
                <button 
                  className="p-2 text-gray-600 hover:text-blue-600 md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="py-4 space-y-2">
              <Link 
                to="/" 
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Treatment
              </Link>
              <Link 
                to="/resources" 
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/insurance" 
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Insurance
              </Link>
              <Link 
                to="/about" 
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              {/* Admin Dashboard Link - Only visible for admin users */}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              {!user && (
                <div className="px-4 pt-2">
                  <button
                    onClick={handleAuthAction}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                </div>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
