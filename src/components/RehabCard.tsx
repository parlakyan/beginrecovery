import React from 'react';
import { Star, MapPin, Phone, ArrowRight, ShieldCheck, ShieldAlert, Clock, XCircle, AlertCircle, Edit, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ImageCarousel from './ImageCarousel';
import { Tag } from './ui';
import { Facility } from '../types';

interface RehabCardProps {
  facility: Facility;
  onEdit?: (facility: Facility) => void;
}

/**
 * RehabCard component displays facility information in a card format
 * Status badges are only shown for:
 * - Pending (yellow)
 * - Rejected (red)
 * - Archived (gray)
 * Owner actions (Edit/Upgrade) are stacked vertically when both present
 */
export default function RehabCard({ facility, onEdit }: RehabCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.id === facility.ownerId;
  const isAdmin = user?.role === 'admin';
  const canEdit = (isOwner || isAdmin) && onEdit !== undefined;

  const handleNavigation = () => {
    window.scrollTo(0, 0);
    navigate(`/${facility.slug}`);
  };

  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/payment', { 
      state: { 
        facilityId: facility.id,
        facility: facility
      }
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(facility);
    }
  };

  // Moderation status badge - only visible to owners and only for pending/rejected/archived status
  const ModerationBadge = () => {
    if (!isOwner || facility.moderationStatus === 'approved') return null;

    const badges = {
      pending: {
        icon: <Clock className="w-4 h-4 text-yellow-600" />,
        text: 'Pending Review',
        classes: 'bg-yellow-50 border-yellow-200 text-yellow-700'
      },
      rejected: {
        icon: <XCircle className="w-4 h-4 text-red-600" />,
        text: 'Rejected',
        classes: 'bg-red-50 border-red-200 text-red-700'
      },
      archived: {
        icon: <XCircle className="w-4 h-4 text-gray-600" />,
        text: 'Archived',
        classes: 'bg-gray-50 border-gray-200 text-gray-700'
      }
    };

    const badge = badges[facility.moderationStatus || 'pending'];
    if (!badge) return null;

    return (
      <div className={`absolute top-16 left-4 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border z-20 ${badge.classes}`}>
        {badge.icon}
        <span className="text-sm font-medium">{badge.text}</span>
      </div>
    );
  };

  // Verification badge - visible to everyone
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
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-full">
      <div className="relative h-[240px] flex-shrink-0">
        {facility.isVerified ? (
          <ImageCarousel 
            images={facility.images} 
            showNavigation={facility.images.length > 1}
            onImageClick={handleNavigation}
            paginationPosition="bottom"
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${facility.images[0] || ''})` }}
            onClick={handleNavigation}
          />
        )}
        <VerificationBadge />
        <ModerationBadge />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-20">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-semibold">{facility.rating}</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow" onClick={handleNavigation}>
        <div className="flex-grow">
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
        </div>

        {/* Actions at the bottom */}
        <div className="mt-auto">
          {/* Owner Actions - Stacked vertically */}
          {canEdit && (
            <div className="flex flex-col gap-2 mb-4">
              <button 
                onClick={handleEdit}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Facility
              </button>
              {isOwner && !facility.isVerified && (
                <button 
                  onClick={handleUpgrade}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Upgrade to Verified
                </button>
              )}
            </div>
          )}

          {/* View Details Button */}
          <button 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 group/button"
          >
            View Details
            <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
