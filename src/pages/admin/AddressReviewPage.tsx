import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { importService } from '../../services/imports/importService';
import { ImportedFacility } from '../../services/imports/types';
import AddressReviewModal from '../../components/AddressReviewModal';

export default function AddressReviewPage() {
  const [facilities, setFacilities] = useState<ImportedFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<ImportedFacility | null>(null);

  // Fetch facilities that need review
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await importService.getFacilitiesNeedingReview();
      setFacilities(data);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-8">
        <MapPin className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold">Address Review</h1>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-8">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium">Addresses Need Review</div>
          <p className="text-sm mt-1">
            The following facilities had partial or incomplete address matches. 
            Please review and update their addresses to ensure accurate location data.
          </p>
        </div>
      </div>

      {/* Facilities List */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      ) : facilities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No facilities need address review
        </div>
      ) : (
        <div className="space-y-4">
          {facilities.map(facility => (
            <div 
              key={facility.facilityId}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setSelectedFacility(facility)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{facility.name}</h3>
                  <a 
                    href={facility.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    {facility.website}
                  </a>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Needs Review
                </span>
              </div>
              <div className="mt-2 text-gray-600">
                {facility.rawAddress}
              </div>
              {facility.geocodingError && (
                <div className="mt-2 text-sm text-red-600">
                  Error: {facility.geocodingError}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedFacility && (
        <AddressReviewModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          onUpdate={fetchFacilities}
        />
      )}
    </div>
  );
}
