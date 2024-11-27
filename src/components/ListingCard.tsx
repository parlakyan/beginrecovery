import { Facility } from '../types';

interface ListingCardProps {
  facility: Facility;
  onEdit?: () => void;
}

const ListingCard = ({ facility, onEdit }: ListingCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {facility.images && facility.images[0] && (
        <div className="h-48 overflow-hidden">
          <img
            src={facility.images[0]}
            alt={facility.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{facility.name}</h3>
        <p className="text-gray-600 mb-4">{facility.location}</p>
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded text-sm ${
            facility.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {facility.status}
          </span>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
