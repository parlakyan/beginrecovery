import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface ImageCarouselProps {
  images: string[];
  showNavigation?: boolean;
  onImageClick?: () => void;
}

export default function ImageCarousel({ images, showNavigation = true, onImageClick }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTransition = (newIndex: number, dir: 'left' | 'right') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(dir);
    setCurrentIndex(newIndex);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newIndex = (currentIndex + 1) % images.length;
    handleTransition(newIndex, 'right');
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    handleTransition(newIndex, 'left');
  };

  useEffect(() => {
    if (direction) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setDirection(null);
      }, 500); // Match with animation duration
      return () => clearTimeout(timer);
    }
  }, [direction]);

  if (!images.length) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onClick={(e) => {
        e.stopPropagation();
        onImageClick?.();
      }}
    >
      <div className="relative w-full h-full">
        {/* Current Image */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full",
            direction === 'left' && 'animate-slideLeft',
            direction === 'right' && 'animate-slideRight',
            !direction && 'animate-fadeIn'
          )}
          style={{ willChange: 'transform, opacity' }}
        >
          <img
            src={images[currentIndex]}
            alt="Current"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* Next/Previous Image */}
        {direction && (
          <div 
            className={cn(
              "absolute inset-0 w-full h-full",
              direction === 'left' && 'animate-slideInRight',
              direction === 'right' && 'animate-slideInLeft'
            )}
            style={{ willChange: 'transform' }}
          >
            <img
              src={images[
                direction === 'left' 
                  ? (currentIndex + 1) % images.length 
                  : (currentIndex - 1 + images.length) % images.length
              ]}
              alt={direction === 'left' ? 'Next' : 'Previous'}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}
      </div>
      
      {showNavigation && images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-105 z-10"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-105 z-10"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAnimating || index === currentIndex) return;
                  const dir = index > currentIndex ? 'right' : 'left';
                  handleTransition(index, dir);
                }}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentIndex 
                    ? 'w-4 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/75'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
