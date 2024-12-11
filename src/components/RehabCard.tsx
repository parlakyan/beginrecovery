import React from 'react';
import { Star, MapPin, ArrowRight, ShieldCheck, ShieldAlert, Clock, XCircle, Edit, CreditCard, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ImageCarousel from './ImageCarousel';
import { Tag } from './ui';
import { Facility } from '../types';
import { facilitiesService } from '../services/facilities';

interface RehabCardProps {
  facility: Facility;
  onEdit?: (facility: Facility) => void;
  showOwnerControls?: boolean;
}

export default function RehabCard({ facility, onEdit, showOwnerControls = false }: RehabCardProps) {
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

  const handleCancelSubscription = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!facility.subscriptionId) return;

    try {
      // Call Stripe webhook to cancel subscription
      await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: facility.subscriptionId
        })
      });

      // Update facility status
      await facilitiesService.updateFacility(facility.id, {
        subscriptionId: undefined,
        isVerified: false
      });

      // Refresh the page or update UI
      window.location.reload();
    } catch (error) {
      console.error('Error canceling subscription:', error);
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

  // Get all tags to display
  const allTags = [
    ...facility.tags,
    ...(facility.conditions?.map(c => c.name) || []),
    ...(facility.therapies?.map(t => t.name) || [])
  ];

  return (
    <div 
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-full"
      onClick={handleNavigation}
    >
      <div className="relative h-[240px] flex-shrink-0">
        <ImageCarousel 
          images={facility.images} 
          showNavigation={facility.images.length > 1}
          onImageClick={handleNavigation}
          paginationPosition="bottom"
          isVerified={facility.isVerified}
        />
        <VerificationBadge />
        <ModerationBadge />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-20">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-semibold">{facility.rating}</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {facility.name}
          </h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{facility.location}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-2">{facility.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {allTags.slice(0, 3).map((tag, index) => (
              <Tag key={index} variant="secondary">{tag}</Tag>
            ))}
            {allTags.length > 3 && (
              <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm">
                +{allTags.length - 3} more
              </span>
            )}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
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

        {/* Owner Actions - Only show if editing is enabled */}
        {canEdit && (
          <div className="flex flex-col gap-2 mt-6">
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
            {isOwner && facility.isVerified && facility.subscriptionId && (
              <button 
                onClick={handleCancelSubscription}
                className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Cancel Subscription
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
