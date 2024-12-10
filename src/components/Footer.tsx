import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Tags, Phone } from 'lucide-react';
import { locationsService } from '../services/locations';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';

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
  const [topLocations, setTopLocations] = useState<{ city: string; state: string; totalListings: number }[]>([]);
  const [featuredFacilities, setFeaturedFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both locations and featured facilities in parallel
        const [locations, featured] = await Promise.all([
          locationsService.getTopLocations(10),
          facilitiesService.getFeaturedFacilities()
        ]);
        
        // Only show locations that have at least one listing
        const validLocations = locations.filter(loc => loc.totalListings > 0);
        
        if (validLocations.length === 0) {
          setError('No locations found with active listings');
        }
        
        setTopLocations(validLocations);
        // Take only first 10 featured facilities
        setFeaturedFacilities(featured.slice(0, 10));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              {loading ? (
                // Loading skeleton
                Array(8).fill(0).map((_, index) => (
                  <li key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </li>
                ))
              ) : error ? (
                <li className="text-gray-400">{error}</li>
              ) : topLocations.length === 0 ? (
                <li className="text-gray-400">No locations available</li>
              ) : (
                topLocations.map((location, index) => (
                  <li key={index}>
                    <Link 
                      to={`/search?location=${encodeURIComponent(`${location.city}, ${location.state}`)}`} 
                      className="hover:text-blue-400 transition-colors"
                    >
                      Rehab Centers in {location.city}, {location.state} ({location.totalListings})
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Top Treatment Centers */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Top Treatment Centers</h3>
            </div>
            <ul className="space-y-3">
              {loading ? (
                // Loading skeleton
                Array(8).fill(0).map((_, index) => (
                  <li key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </li>
                ))
              ) : error ? (
                <li className="text-gray-400">{error}</li>
              ) : featuredFacilities.length === 0 ? (
                <li className="text-gray-400">No treatment centers available</li>
              ) : (
                featuredFacilities.map((facility) => (
                  <li key={facility.id}>
                    <Link 
                      to={`/${facility.slug}`} 
                      className="hover:text-blue-400 transition-colors"
                    >
                      {facility.name}
                    </Link>
                  </li>
                ))
              )}
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
