import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  showNavigation?: boolean;
  onImageClick?: () => void;
  paginationPosition?: 'bottom' | 'elevated';
  isVerified?: boolean;
}

/**
 * ImageCarousel component
 * Shows all images for verified listings
 * Shows only the first image for unverified listings
 */
export default function ImageCarousel({ 
  images = [], 
  showNavigation = true, 
  onImageClick,
  paginationPosition = 'bottom',
  isVerified = false
}: ImageCarouselProps) {
  // For unverified listings, only use the first image
  const displayImages = isVerified ? images : [images[0]];
  const hasMultipleImages = displayImages.length > 1;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Debug logging
  useEffect(() => {
    console.log('ImageCarousel state:', {
      isVerified,
      totalImages: images.length,
      displayImages: displayImages.length,
      hasMultipleImages,
      showNavigation,
      timestamp: new Date().toISOString()
    });
  }, [isVerified, images.length, displayImages.length, hasMultipleImages, showNavigation]);

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

  if (!displayImages.length) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

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
