import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const validImages = images?.filter(img => img && img.startsWith('http')) || [];
  const hasMultipleImages = validImages.length > 1;

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Show placeholder if no valid images
  if (validImages.length === 0) {
    return (
      <div className="relative bg-gray-100 w-full h-64 flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {validImages.map((image, index) => (
            <div key={index} className="relative flex-[0_0_100%]">
              <img
                src={image}
                alt={`Facility view ${index + 1}`}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  // Replace broken image with placeholder
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-64 bg-gray-100 flex items-center justify-center">
                      <svg class="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  `;
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {hasMultipleImages && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            onClick={scrollPrev}
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            onClick={scrollNext}
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}
    </div>
  );
}
