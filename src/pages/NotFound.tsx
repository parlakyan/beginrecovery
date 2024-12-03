import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, FileSearch } from 'lucide-react';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTitle } from '../hooks/useTitle';

/**
 * NotFound (404) Page Component
 * 
 * Displays a user-friendly 404 error page when a route is not found
 * Includes options to go back or return to home page
 */
export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useTitle('404 - Page Not Found', 
    'The page you\'re looking for cannot be found. Please check the URL or return to the Recovery Directory homepage.'
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full mx-auto">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <FileSearch className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                <span className="text-blue-600">404</span> - Page Not Found
              </h1>
              <p className="text-lg text-gray-600">
                We couldn't find the page at <span className="font-medium">{location.pathname}</span>.<br />
                Please check the URL or use the options below to get back on track.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                className="sm:w-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </Button>
              
              <Link to="/" className="inline-flex">
                <Button variant="primary" className="w-full sm:w-auto">
                  <Home className="w-5 h-5" />
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
