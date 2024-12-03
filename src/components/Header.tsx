import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Loader2, LayoutGrid, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';

export default function Header() {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const isHomePage = location.pathname === '/';
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get search query from URL if present
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  useEffect(() => {
    if (isHomePage) {
      const handleScroll = () => {
        const heroSearchInput = document.querySelector('.hero-search-input');
        if (heroSearchInput) {
          const rect = heroSearchInput.getBoundingClientRect();
          const isSearchVisible = rect.top > 0 && rect.bottom <= window.innerHeight;
          setShowSearch(!isSearchVisible);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setShowSearch(true);
    }
  }, [isHomePage]);

  const handleAuthAction = () => {
    setIsMobileMenuOpen(false);
    if (user) {
      navigate('/account');
    } else {
      navigate('/login', { state: { from: location } });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch}
            className={`hidden md:flex flex-1 max-w-xl mx-8 transition-opacity duration-300 ${
              showSearch ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search treatment centers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/resources" className="text-gray-600 hover:text-blue-600">Resources</Link>
            <Link to="/insurance" className="text-gray-600 hover:text-blue-600">Insurance</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 mr-4">About Us</Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <LayoutGrid className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={handleAuthAction}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <span className="hidden md:block">My Account</span>
                <User className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleAuthAction}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hidden md:block hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            {/* Search Bar - Mobile */}
            {showSearch && (
              <div className="p-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                    <input
                      type="search"
                      placeholder="Search treatment centers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                    />
                  </div>
                </form>
              </div>
            )}

            <nav className="py-4 space-y-2">
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
