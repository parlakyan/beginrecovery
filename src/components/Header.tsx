import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, User, Loader2, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';

export default function Header() {
  const { user, loading, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAuthAction = () => {
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Find Treatment</Link>
            <Link to="/resources" className="text-gray-600 hover:text-blue-600">Resources</Link>
            <Link to="/insurance" className="text-gray-600 hover:text-blue-600">Insurance</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600">About Us</Link>
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
                <button className="p-2 text-gray-600 hover:text-blue-600 md:hidden">
                  <Menu className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}