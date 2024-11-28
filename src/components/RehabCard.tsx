import React from 'react';
import { Star, MapPin, Phone, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageCarousel from './ImageCarousel';
import { Tag } from './ui';
import { Facility } from '../types';

export default function RehabCard({ facility }: { facility: Facility }) {
  const navigate = useNavigate();

  const handleNavigation = () => {
    window.scrollTo(0, 0);
    navigate(`/listing/${facility.id}`);
  };

  const VerificationBadge = () => (
    <div className={`absolute top-4 left-4 ${facility.isVerified ? 'bg-green-50' : 'bg-gray-50'} backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border ${facility.isVerified ? 'border-green-200' : 'border-gray-200'} z-20`}>
      {facility.isVerified ? (
        <>
          <ShieldCheck className={`w-4 h-4 text-green-600`} />
          <span className="text-sm font-medium text-green-700">Verified</span>
        </>
      ) : (
        <>
          <ShieldAlert className={`w-4 h-4 text-gray-600`} />
          <span className="text-sm font-medium text-gray-700">Unverified</span>
        </>
      )}
    </div>
  );

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100">
      <div className="relative h-[240px]">
        <ImageCarousel 
          images={facility.images} 
          showNavigation={facility.images.length > 1}
          onImageClick={handleNavigation}
          paginationPosition="bottom"
        />
        <VerificationBadge />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-20">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-semibold">{facility.rating}</span>
        </div>
      </div>

      <div className="p-6" onClick={handleNavigation}>
        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {facility.name}
        </h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{facility.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{facility.phone}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-2">{facility.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {facility.tags.slice(0, 2).map((tag, index) => (
            <Tag key={index} variant="secondary">{tag}</Tag>
          ))}
          {facility.tags.length > 2 && (
            <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm">
              +{facility.tags.length - 2} more
            </span>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-6">
          {facility.amenities.slice(0, 3).map((amenity, index) => (
            <Tag key={index} variant="primary">{amenity}</Tag>
          ))}
          {facility.amenities.length > 3 && (
            <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm">
              +{facility.amenities.length - 3} more
            </span>
          )}
        </div>

        <button 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 group/button"
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
