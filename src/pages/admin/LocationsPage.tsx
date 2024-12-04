import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { locationsService } from '../../services/locations';
import { FeaturedLocation } from '../../types';
import EditLocationModal from '../../components/EditLocationModal';
import ConfirmationDialog from '../../components/ConfirmationDialog';

export default function LocationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<FeaturedLocation[]>([]);
  const [availableCities, setAvailableCities] = useState<Array<{ city: string; state: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<FeaturedLocation | null>(null);

  // Confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; locationId: string | null }>({
    isOpen: false,
    locationId: null
  });

  // Fetch locations and available cities
  const fetchData = async () => {
    try {
      setLoading(true);
      const [featuredLocations, cities] = await Promise.all([
        locationsService.getFeaturedLocations(),
        locationsService.getAllCities()
      ]);
      
      setLocations(featuredLocations);
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter locations based on search
  const filteredLocations = locations.filter(location => {
    const searchString = `${location.city}, ${location.state}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Filter available cities based on search and already featured
  const filteredCities = availableCities.filter(city => {
    const searchString = `${city.city}, ${city.state}`.toLowerCase();
    const isAlreadyFeatured = locations.some(
      loc => loc.city === city.city && loc.state === city.state
    );
    return !isAlreadyFeatured && searchString.includes(searchTerm.toLowerCase());
  });

  const handleAdd = async (city: { city: string; state: string; count: number }) => {
    try {
      setLoading(true);
      await locationsService.addFeaturedLocation({
        city: city.city,
        state: city.state,
        image: '',
        totalListings: city.count
      });
      await fetchData();
    } catch (error) {
      console.error('Error adding location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await locationsService.deleteFeaturedLocation(id);
      await fetchData();
      setDeleteDialog({ isOpen: false, locationId: null });
    } catch (error) {
      console.error('Error deleting location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = locations.findIndex(loc => loc.id === id);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= locations.length) return;
      
      const newLocations = [...locations];
      [newLocations[currentIndex], newLocations[newIndex]] = [newLocations[newIndex], newLocations[currentIndex]];
      
      const orderedIds = newLocations.map(loc => loc.id);
      await locationsService.reorderFeaturedLocations(orderedIds);
      await fetchData();
    } catch (error) {
      console.error('Error moving location:', error);
    }
  };

  const handleSave = async (data: Partial<FeaturedLocation>) => {
    if (!editingLocation) return;
    try {
      setLoading(true);
      await locationsService.updateFeaturedLocation(editingLocation.id, data);
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
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Featured Locations</h2>
            <p className="text-gray-600">
              Add locations to feature them on the homepage.
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {/* Featured Locations */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Currently Featured</h2>
              {filteredLocations.map((location, index) => (
                <div 
                  key={location.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {location.image ? (
                      <img 
                        src={location.image} 
                        alt={location.city}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{location.city}, {location.state}</h3>
                      <p className="text-sm text-gray-600">{location.totalListings} listings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMove(location.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleMove(location.id, 'down')}
                      disabled={index === locations.length - 1}
                      className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingLocation(location)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, locationId: location.id })}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Available Cities */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Available Cities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCities.map((city) => (
                  <div 
                    key={`${city.city}-${city.state}`}
                    className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{city.city}, {city.state}</h3>
                      <p className="text-sm text-gray-600">{city.count} listings</p>
                    </div>
                    <button
                      onClick={() => handleAdd(city)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, locationId: null })}
        onConfirm={() => {
          if (deleteDialog.locationId) {
            handleDelete(deleteDialog.locationId);
          }
        }}
        title="Remove Featured Location"
        message="Are you sure you want to remove this location from the featured list?"
        type="warning"
      />
    </div>
  );
}
