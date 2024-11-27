import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Logo from './Logo';

export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const clearAuth = useAuthStore(state => state.clearAuth);

  const handleSignOut = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
            <nav className="hidden md:ml-6 md:flex space-x-8">
              <Link
                to="/find-treatment"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Treatment
              </Link>
              <Link
                to="/resources"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Resources
              </Link>
              <Link
                to="/insurance"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Insurance
              </Link>
              <Link
                to="/about-us"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                About Us
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
            <button className="ml-4 md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
