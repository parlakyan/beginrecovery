import { Link } from 'react-router-dom';
import { Facility } from '../types';

export interface ListingCardProps {
  facility: Facility;
}

const ListingCard = ({ facility }: ListingCardProps) => {
  return (
    <Link to={`/listing/${facility.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
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
          <p className="text-gray-600 mb-4 line-clamp-2">{facility.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{facility.location}</span>
            <span className={`px-2 py-1 rounded text-sm ${
              facility.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {facility.status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
