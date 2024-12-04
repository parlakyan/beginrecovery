import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Star,
  Edit2,
  AlertCircle,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { locationsService } from '../../services/locations';
import { CityInfo, FeaturedLocation } from '../../types';
import EditLocationModal from '../../components/EditLocationModal';

export default function LocationsPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<CityInfo | null>(null);

  // Fetch cities
  const fetchData = async () => {
    try {
      setLoading(true);
      const allCities = await locationsService.getAllCities();
      setCities(allCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFeatured = async (city: CityInfo) => {
    try {
      setLoading(true);
      await locationsService.toggleLocationFeatured(
        city.city,
        city.state,
        !city.isFeatured
      );
      await fetchData();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter cities based on search
  const filteredCities = cities.filter(city => {
    const searchLower = searchTerm.toLowerCase();
    return searchTerm === '' || 
      city.city.toLowerCase().includes(searchLower) ||
      city.state.toLowerCase().includes(searchLower) ||
      `${city.city}, ${city.state}`.toLowerCase().includes(searchLower);
  });

  // Sort cities: featured first, then by listing count
  const sortedCities = [...filteredCities].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return b.totalListings - a.totalListings;
  });

  const handleSave = async (data: Partial<FeaturedLocation>) => {
    try {
      setLoading(true);
      if (editingLocation?.id) {
        await locationsService.updateFeaturedLocation(editingLocation.id, data);
      } else {
        await locationsService.addFeaturedLocation({
          city: editingLocation!.city,
          state: editingLocation!.state,
          image: data.image || '',
          totalListings: editingLocation!.totalListings,
          coordinates: editingLocation!.coordinates,
          isFeatured: true
        });
      }
      await fetchData();
      setEditingLocation(null);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search locations..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="bg-white">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Locations Found</h2>
            <p className="text-gray-600">
              No cities with active listings found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">Location</th>
                  <th className="text-left py-4 px-4 font-semibold">Total Listings</th>
                  <th className="text-left py-4 px-4 font-semibold">Featured</th>
                  <th className="text-left py-4 px-4 font-semibold">Image</th>
                  <th className="text-left py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCities.map((city) => (
                  <tr key={`${city.city}-${city.state}`} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{city.city}</div>
                          <div className="text-sm text-gray-500">{city.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {city.totalListings} {city.totalListings === 1 ? 'listing' : 'listings'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        city.isFeatured
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {city.isFeatured ? 'Featured' : 'Not Featured'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {city.image ? (
                        <img 
                          src={city.image} 
                          alt={city.city}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFeatured(city)}
                          className={`p-1 rounded ${
                            city.isFeatured
                              ? 'text-yellow-500 hover:bg-yellow-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={city.isFeatured ? "Remove from Featured" : "Add to Featured"}
                        >
                          <Star className="w-5 h-5" fill={city.isFeatured ? "currentColor" : "none"} />
                        </button>
                        {city.isFeatured && (
                          <button
                            onClick={() => setEditingLocation(city)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Featured Location"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingLocation && (
        <EditLocationModal
          location={editingLocation}
          isOpen={true}
          onClose={() => setEditingLocation(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
