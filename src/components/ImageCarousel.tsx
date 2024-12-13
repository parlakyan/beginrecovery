import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getStreetViewUrl, DEFAULT_FACILITY_IMAGE } from '../utils/images';

interface ImageCarouselProps {
  /** Array of image URLs to display */
  images: string[];
  /** Whether to show navigation controls (arrows and dots). Only applies to verified listings with multiple images */
  showNavigation?: boolean;
  /** Callback function when an image is clicked */
  onImageClick?: () => void;
  /** Position of the pagination dots */
  paginationPosition?: 'bottom' | 'elevated';
  /** Whether the facility is verified. Verified listings show all images in a carousel, unverified show only the first image */
  isVerified?: boolean;
  /** Facility coordinates for Street View fallback */
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * ImageCarousel Component
 * 
 * Displays facility images with different behaviors based on verification status:
 * - Verified listings: Shows all images in a carousel with navigation
 * - Unverified listings: Shows only the first image without navigation
 * 
 * Fallback order:
 * 1. Facility images
 * 2. Google Street View (if coordinates exist)
 * 3. Default placeholder image
 */
export default function ImageCarousel({ 
  images = [], 
  showNavigation = true, 
  onImageClick,
  paginationPosition = 'bottom',
  isVerified = false,
  coordinates
}: ImageCarouselProps) {
  // Get fallback images
  const streetViewUrl = coordinates ? getStreetViewUrl(coordinates.lat, coordinates.lng) : null;
  
  // Determine which images to display
  let displayImages: string[] = [];
  if (images.length > 0) {
    // Use facility images if available
    displayImages = isVerified ? images : [images[0]];
  } else if (streetViewUrl) {
    // Use Street View if no facility images but coordinates exist
    displayImages = [streetViewUrl];
  } else {
    // Use default placeholder as last resort
    displayImages = [DEFAULT_FACILITY_IMAGE];
  }

  const hasMultipleImages = displayImages.length > 1;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const nextSlide = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isTransitioning || !hasMultipleImages) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
  }, [isTransitioning, hasMultipleImages, displayImages.length]);

  const prevSlide = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isTransitioning || !hasMultipleImages) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length);
  }, [isTransitioning, hasMultipleImages, displayImages.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !hasMultipleImages) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const paginationClasses = {
    bottom: 'bottom-4',
    elevated: 'bottom-24'
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-900"
      onClick={(e) => {
        e.stopPropagation();
        onImageClick?.();
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Image Container */}
      <div className="absolute inset-0">
        {displayImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ willChange: 'opacity' }}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        ))}
      </div>

      {/* Navigation - Only show for verified listings with multiple images */}
      {showNavigation && hasMultipleImages && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-105 hidden md:block"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-105 hidden md:block"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className={`absolute left-1/2 -translate-x-1/2 flex gap-2 z-10 ${paginationClasses[paginationPosition]}`}>
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isTransitioning || index === currentIndex) return;
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                }}
                className={`transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-4 h-2 bg-white' 
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                } rounded-full`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
