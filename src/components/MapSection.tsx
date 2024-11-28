import { MapPin } from 'lucide-react';

interface MapSectionProps {
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function MapSection({ coordinates }: MapSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Location</h2>
      
      {/* Placeholder for map - in production, use Google Maps or similar */}
      <div className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Map view will be available soon</p>
            <p className="text-sm text-gray-500">
              Coordinates: {coordinates.lat}, {coordinates.lng}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
