import React from 'react';
import { Edit2, Trash2, Star, MapPin, Phone, Eye, EyeOff } from 'lucide-react';
import { Facility } from '../types';

interface ListingCardProps {
  listing: Facility;
  onEdit: () => void;
}

export default function ListingCard({ listing, onEdit }: ListingCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto">
          <img
            src={listing.images[0]}
            alt={listing.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {listing.phone}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  {listing.rating} ({listing.reviewCount} reviews)
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edit listing"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete listing"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                title={listing.status === 'active' ? 'Deactivate listing' : 'Activate listing'}
              >
                {listing.status === 'active' ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}