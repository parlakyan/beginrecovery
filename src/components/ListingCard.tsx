import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, Shield, ShieldCheck, Tag } from 'lucide-react';
import { Facility } from '../types';

interface ListingCardProps {
  facility: Facility;
}

export default function ListingCard({ facility }: ListingCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={facility.images[0] || 'https://via.placeholder.com/400x300'}
          alt={facility.name}
          className="w-full h-full object-cover"
        />
        {facility.isVerified && (
          <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-md">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-900">{facility.rating.toFixed(1)}</span>
          </div>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-sm text-gray-600">{facility.reviewCount} reviews</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link to={`/listing/${facility.id}`} className="hover:text-blue-600 transition-colors">
            {facility.name}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{facility.location}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {facility.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {facility.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{facility.tags.length - 3} more</span>
          )}
        </div>

        {/* Contact Info */}
        {facility.phone && (
          <div className="flex items-center text-gray-600 mb-4">
            <Phone className="w-4 h-4 mr-1" />
            <a 
              href={`tel:${facility.phone}`}
              className="text-sm hover:text-blue-600 transition-colors"
            >
              {facility.phone}
            </a>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-2 mt-4">
          <Link
            to={`/listing/${facility.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          <button 
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Check Insurance
          </button>
        </div>
      </div>
    </div>
  );
}
