import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  showNavigation?: boolean;
  onImageClick?: () => void;
}

export default function ImageCarousel({ images, showNavigation = true, onImageClick }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  if (!images.length) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-900"
      onClick={(e) => {
        e.stopPropagation();
        onImageClick?.();
      }}
    >
      {/* Image Container */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
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

      {/* Navigation */}
      {showNavigation && images.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-105"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-105"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, index) => (
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
