import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Tags, Phone } from 'lucide-react';

const popularLocations = [
  'Los Angeles, CA',
  'New York City, NY',
  'Miami, FL',
  'Malibu, CA',
  'San Diego, CA',
  'Phoenix, AZ',
  'Houston, TX',
  'Chicago, IL'
];

const popularCenters = [
  'Serenity Recovery Center',
  'New Horizons Wellness',
  'Pacific View Recovery',
  'Desert Hope Treatment',
  'Oceanfront Healing',
  'Mountain Serenity Rehab',
  'Valley Recovery Solutions',
  'Sunrise Treatment Center'
];

const specializations = [
  'Eating Disorder Treatment',
  'Depression Treatment',
  'Executive Rehab',
  'Teen Rehab Centers',
  'Dual Diagnosis Rehabs',
  'Residential Trauma Treatment',
  'Sex Addiction Treatment',
  'Christian Treatment Centers',
  'PTSD Treatment',
  'Anxiety Treatment',
  'Luxury Rehab Centers',
  'Veterans Treatment'
];

export default function Footer() {
  const navigate = useNavigate();

  const handleListCenter = () => {
    navigate('/create-listing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Popular Locations */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Popular Locations</h3>
            </div>
            <ul className="space-y-3">
              {popularLocations.map((location, index) => (
                <li key={index}>
                  <Link to={`/search?location=${encodeURIComponent(location)}`} className="hover:text-blue-400 transition-colors">
                    Rehab Centers in {location}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Treatment Centers */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Top Treatment Centers</h3>
            </div>
            <ul className="space-y-3">
              {popularCenters.map((center, index) => (
                <li key={index}>
                  <Link to={`/search?center=${encodeURIComponent(center)}`} className="hover:text-blue-400 transition-colors">
                    {center}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specializations */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Tags className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Top Specializations</h3>
            </div>
            <ul className="space-y-3">
              {specializations.map((specialization, index) => (
                <li key={index}>
                  <Link to={`/search?specialization=${encodeURIComponent(specialization)}`} className="hover:text-blue-400 transition-colors">
                    {specialization}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Treatment Providers CTA */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Treatment Providers</h3>
            </div>
            <p className="mb-6 text-gray-400">
              List your rehabilitation center with us and reach thousands of people seeking recovery support.
            </p>
            <button 
              onClick={handleListCenter}
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              List Your Center
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Recovery Directory. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookie-policy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Cookie Policy
              </Link>
              <Link to="/hipaa" className="text-gray-400 hover:text-blue-400 transition-colors">
                HIPAA Notice
              </Link>
              <Link to="/accessibility" className="text-gray-400 hover:text-blue-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-500 text-center md:text-left">
            This website is for informational purposes only. If you are having a medical emergency, please call 911.
          </p>
        </div>
      </div>
    </footer>
  );
}