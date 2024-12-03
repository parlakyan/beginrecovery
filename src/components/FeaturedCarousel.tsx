import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Facility } from '../types';
import RehabCard from './RehabCard';

interface FeaturedCarouselProps {
  facilities: Facility[];
  onEdit?: (facility: Facility) => void;
}

export default function FeaturedCarousel({ facilities, onEdit }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [totalSlides, setTotalSlides] = useState(0);

  // Update items per view based on screen size
  const updateItemsPerView = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1024) { // lg breakpoint
      setItemsPerView(3);
    } else if (width >= 768) { // md breakpoint
      setItemsPerView(2);
    } else {
      setItemsPerView(1);
    }
  }, []);

  // Update total slides based on items per view
  useEffect(() => {
    setTotalSlides(Math.max(0, facilities.length - itemsPerView + 1));
    // Reset current index if it's out of bounds
    setCurrentIndex(prev => Math.min(prev, Math.max(0, facilities.length - itemsPerView)));
  }, [facilities.length, itemsPerView]);

  // Set up resize listener
  useEffect(() => {
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [updateItemsPerView]);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : totalSlides - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev < totalSlides - 1 ? prev + 1 : 0));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Don't render if we don't have enough facilities
  if (facilities.length === 0) return null;

  return (
    <div className="relative max-w-7xl mx-auto">
      {/* Navigation Buttons */}
      {facilities.length > itemsPerView && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Previous facilities"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Next facilities"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div className="overflow-hidden px-4">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            gap: '1.5rem' // 24px gap
          }}
        >
          {facilities.map((facility) => (
            <div 
              key={facility.id}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / itemsPerView}% - ${(1.5 * (itemsPerView - 1)) / itemsPerView}rem)` }}
            >
              <RehabCard
                facility={facility}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
