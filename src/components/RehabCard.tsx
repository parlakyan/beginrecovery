import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Star, ShieldCheck } from 'lucide-react';
import { Facility } from '../types';
import { Tag } from './ui';

interface RehabCardProps {
  facility: Facility;
  onEdit?: (facility: Facility) => void;
}

export default function RehabCard({ facility, onEdit }: RehabCardProps) {
  const mainImage = facility.images[0] || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-video">
        <img
          src={mainImage}
          alt={facility.name}
          className="w-full h-full object-cover"
        />
        
        {/* Verified Badge */}
        {facility.isVerified && (
          <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified</span>
          </div>
        )}

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={() => onEdit(facility)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/${facility.slug}`} className="block group">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {facility.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center text-yellow-400">
            <Star className="w-5 h-5 fill-current" />
            <span className="ml-1 text-gray-900 font-medium">{facility.rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500">({facility.reviewCount} reviews)</span>
        </div>

        <div className="mt-2 text-gray-600">
          {facility.location}
        </div>

        {/* Tags */}
        {facility.tags && facility.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {facility.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} variant="primary">{tag}</Tag>
            ))}
            {facility.tags.length > 3 && (
              <span className="text-sm text-gray-500">
                +{facility.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
