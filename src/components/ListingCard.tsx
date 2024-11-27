import { Star, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Facility } from '../types';

export interface ListingCardProps {
  facility: Facility;
  onEdit?: () => void;
}

export default function ListingCard({ facility, onEdit }: ListingCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/listing/${facility.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative">
        {facility.images[0] && (
          <img
            src={facility.images[0]}
            alt={facility.name}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-semibold">{facility.rating}</span>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {facility.name}
        </h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{facility.location}</span>
          </div>

          {facility.phone && (
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{facility.phone}</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-2">{facility.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {facility.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
            >
              {amenity}
            </span>
          ))}
          {facility.amenities.length > 3 && (
            <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm">
              +{facility.amenities.length - 3} more
            </span>
          )}
        </div>

        {onEdit && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Edit Listing
          </button>
        )}
      </div>
    </div>
  );
}
