import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DetailCarouselProps {
  images: string[];
}

export default function DetailCarousel({ images }: DetailCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative h-[600px] bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
      
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {images.map((image, index) => (
            <div key={index} className="embla__slide relative h-full flex-[0_0_100%]">
              <img
                src={image}
                alt={`Facility view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>
    </div>
  );
}