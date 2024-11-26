import api from './api';

interface Review {
  id: string;
  facilityId: string;
  rating: number;
  content: string;
  authorName: string;
  helpfulCount: number;
  createdAt: string;
}

export const reviewsApi = {
  getByFacility: (facilityId: string) => 
    api.get<Review[]>(`/reviews/facility/${facilityId}`),
  
  create: (data: { facilityId: string; rating: number; content: string }) => 
    api.post<Review>('/reviews', data),
  
  markHelpful: (reviewId: string) => 
    api.post(`/reviews/${reviewId}/helpful`)
};