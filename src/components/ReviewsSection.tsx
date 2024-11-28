import { Star } from 'lucide-react';
import { Facility } from '../types';

interface ReviewsSectionProps {
  facility: Facility;
}

export default function ReviewsSection({ facility }: ReviewsSectionProps) {
  // Mock reviews data
  const reviews = [
    {
      id: 1,
      author: 'John D.',
      rating: 5,
      date: '2 months ago',
      content: 'Excellent facility with caring staff. The amenities were top-notch and the environment was very conducive to recovery.',
      helpful: 12
    },
    {
      id: 2,
      author: 'Sarah M.',
      rating: 4,
      date: '3 months ago',
      content: 'Very professional team and great support system. The facility is clean and well-maintained.',
      helpful: 8
    },
    {
      id: 3,
      author: 'Michael R.',
      rating: 5,
      date: '1 month ago',
      content: 'The staff here truly cares about your recovery. They go above and beyond to ensure you have everything you need.',
      helpful: 15
    }
  ];

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Reviews</h2>
      
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">{review.author}</div>
                <div className="text-sm text-gray-500">{review.date}</div>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
            </div>
            <p className="text-gray-600 mb-3">{review.content}</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>Helpful ({review.helpful})</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
