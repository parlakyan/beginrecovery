import { useState, useEffect } from 'react';
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

  // Reset index when facilities change
  useEffect(() => {
    setCurrentIndex(0);
  }, [facilities]);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : facilities.length - 3));
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev < facilities.length - 3 ? prev + 1 : 0));
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  };

  // Don't render if we don't have enough facilities
  if (facilities.length < 3) return null;

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Navigation Buttons */}
      <button
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Previous facilities"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Next facilities"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
        >
          {facilities.map((facility) => (
            <div 
              key={facility.id}
              className="w-1/3 flex-shrink-0 px-3"
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
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: Math.max(0, facilities.length - 2) }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (isAnimating) return;
              setIsAnimating(true);
              setCurrentIndex(index);
              setTimeout(() => setIsAnimating(false), 500);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
