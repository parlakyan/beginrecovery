import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';

export default function Footer() {
  const [recentFacilities, setRecentFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const facilities = await facilitiesService.getFacilities();
        setRecentFacilities(facilities.slice(0, 3)); // Get first 3 facilities
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const popularLocations = [
    { city: 'Los Angeles', state: 'CA' },
    { city: 'New York', state: 'NY' },
    { city: 'Chicago', state: 'IL' },
    { city: 'Houston', state: 'TX' },
    { city: 'Phoenix', state: 'AZ' },
    { city: 'Philadelphia', state: 'PA' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">About Us</h3>
            <p className="text-sm mb-4">
              We help people find the best treatment centers for their needs.
              Our mission is to make recovery accessible to everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">
                Facebook
              </a>
              <a href="#" className="hover:text-white">
                Twitter
              </a>
              <a href="#" className="hover:text-white">
                LinkedIn
              </a>
            </div>
          </div>

          {/* Recent Treatment Centers */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Centers</h3>
            <ul className="space-y-2">
              {recentFacilities.map((facility) => (
                <li key={facility.id}>
                  <Link
                    to={`/${facility.slug}`}
                    className="text-sm hover:text-white"
                  >
                    {facility.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Locations */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Popular Locations</h3>
            <ul className="space-y-2">
              {popularLocations.map((loc) => (
                <li key={`${loc.city}-${loc.state}`}>
                  <Link
                    to={`/search?location=${encodeURIComponent(`${loc.city}, ${loc.state}`)}`}
                    className="text-sm hover:text-white"
                  >
                    {loc.city}, {loc.state}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Recovery Directory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
