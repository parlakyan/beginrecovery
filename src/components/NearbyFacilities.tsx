import { Facility } from '../types';

export interface NearbyFacilitiesProps {
  facility: Facility;
}

const NearbyFacilities = ({ facility }: NearbyFacilitiesProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Nearby Facilities</h3>
      <p className="text-gray-600 mb-4">Other facilities near {facility.name}</p>
      
      {/* Placeholder for future nearby facilities implementation */}
      <div className="text-center text-gray-500 py-4">
        Nearby facilities coming soon
      </div>
    </div>
  );
};

export default NearbyFacilities;
