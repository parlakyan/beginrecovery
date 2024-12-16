import React, { useEffect, useState } from 'react';
import { MessageCircle, Star, ThumbsUp } from 'lucide-react';
import { Facility, GoogleReview } from '../types';
import { reviewsService } from '../services/reviews';

interface ReviewsSectionProps {
  facility: Facility;
}

export default function ReviewsSection({ facility }: ReviewsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!facility.googlePlaceId) return;
      
      try {
        setLoading(true);
        const reviews = await reviewsService.getReviews(facility.id, facility.googlePlaceId);
        setReviews(reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [facility.id, facility.googlePlaceId]);

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
      const count = reviews.filter((r) => Math.floor(r.rating) === rating).length;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  if (!facility.googlePlaceId) {
    return null;
  }

  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Reviews</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
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
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.authorPhotoUrl && (
                      <img 
                        src={review.authorPhotoUrl} 
                        alt={review.author}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-semibold mb-1">{review.author}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(review.rating, `review-${review.id}`)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(review.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => reviewsService.markHelpful(review.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">Helpful ({review.helpful})</span>
                  </button>
                </div>
                <p className="text-gray-600">{review.content}</p>
              </div>
            ))}
          </div>

          {/* Google Attribution */}
          <div className="mt-8 text-center">
            <img 
              src="https://developers.google.com/static/maps/images/powered_by_google_on_white.png"
              alt="Powered by Google"
              className="h-8 mx-auto"
            />
          </div>
        </>
      )}
    </section>
  );
}
