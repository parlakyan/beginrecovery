import React from 'react';
import { MessageCircle, Star, ThumbsUp } from 'lucide-react';

interface ReviewsSectionProps {
  facility: {
    rating: number;
    reviewCount: number;
  };
}

const reviews = [
  {
    id: 'review-1',
    author: 'John D.',
    rating: 5,
    date: '2 months ago',
    content: "The staff was incredibly supportive and professional. The facility is beautiful and well-maintained. My recovery journey started here, and I'm forever grateful.",
    helpful: 12
  },
  {
    id: 'review-2',
    author: 'Sarah M.',
    rating: 5,
    date: '3 months ago',
    content: 'Outstanding treatment program with a perfect balance of therapy, activities, and personal time. The private rooms were comfortable and the amenities were excellent.',
    helpful: 8
  },
  {
    id: 'review-3',
    author: 'Michael R.',
    rating: 4,
    date: '4 months ago',
    content: 'Great experience overall. The therapists are highly qualified and genuinely care about your recovery. The location is peaceful and conducive to healing.',
    helpful: 6
  }
];

export default function ReviewsSection({ facility }: ReviewsSectionProps) {
  const renderStars = (rating: number, idPrefix: string) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={`${idPrefix}-star-${i}`}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderRatingBars = () => {
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = reviews.filter((r) => r.rating === rating).length;
      const percentage = (count / reviews.length) * 100;
      
      return (
        <div key={`rating-bar-${rating}`} className="flex items-center gap-2 mb-2">
          <div className="text-sm text-gray-600 w-8">{rating} star</div>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 w-8">{count}</div>
        </div>
      );
    });
  };

  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Reviews</h2>
      </div>

      {/* Overall Rating */}
      <div className="flex items-center gap-8 mb-8 p-6 bg-surface rounded-xl">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">{facility.rating}</div>
          <div className="flex items-center gap-1 mb-1">
            {renderStars(facility.rating, 'overall')}
          </div>
          <div className="text-sm text-gray-600">{facility.reviewCount} reviews</div>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1">
          {renderRatingBars()}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={`review-${review.id}`} className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold mb-1">{review.author}</div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(review.rating, `review-${review.id}`)}
                  </div>
                  <span className="text-sm text-gray-600">{review.date}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Helpful ({review.helpful})</span>
              </button>
            </div>
            <p className="text-gray-600">{review.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="bg-surface text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-surface-hover transition-colors">
          Show More Reviews
        </button>
      </div>
    </section>
  );
}
