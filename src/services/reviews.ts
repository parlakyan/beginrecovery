import { collection, doc, getDoc, setDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const REVIEWS_COLLECTION = 'reviews';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface GoogleReview {
  id: string;
  author: string;
  authorPhotoUrl?: string;
  rating: number;
  content: string;
  timestamp: number;
  helpful: number;
  googlePlaceId: string;
  facilityId: string;
}

export const reviewsService = {
  /**
   * Get cached reviews for a facility
   */
  async getFacilityReviews(facilityId: string): Promise<GoogleReview[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('facilityId', '==', facilityId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as GoogleReview);
    } catch (error) {
      console.error('Error getting facility reviews:', error);
      return [];
    }
  },

  /**
   * Check if reviews need to be refreshed
   */
  async needsRefresh(facilityId: string): Promise<boolean> {
    try {
      const metaRef = doc(db, REVIEWS_COLLECTION, `${facilityId}_meta`);
      const metaDoc = await getDoc(metaRef);

      if (!metaDoc.exists()) {
        return true;
      }

      const lastUpdated = metaDoc.data().lastUpdated?.toMillis() || 0;
      const now = Date.now();

      return now - lastUpdated > CACHE_DURATION;
    } catch (error) {
      console.error('Error checking reviews refresh:', error);
      return true;
    }
  },

  /**
   * Fetch fresh reviews from Google Places API
   */
  async refreshReviews(facilityId: string, googlePlaceId: string): Promise<void> {
    try {
      // Call our serverless function to get reviews
      const response = await fetch(`/.netlify/functions/google-places-reviews?placeId=${googlePlaceId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }

      const data = await response.json();
      const reviews = data.reviews;

      // Batch write reviews to Firestore
      const batch = reviews.map(async (review: any) => {
        const reviewDoc = {
          id: `${facilityId}_${review.time}`,
          author: review.author_name,
          authorPhotoUrl: review.profile_photo_url,
          rating: review.rating,
          content: review.text,
          timestamp: review.time,
          helpful: 0,
          googlePlaceId,
          facilityId
        };

        await setDoc(
          doc(db, REVIEWS_COLLECTION, reviewDoc.id),
          reviewDoc
        );
      });

      await Promise.all(batch);

      // Update metadata
      await setDoc(
        doc(db, REVIEWS_COLLECTION, `${facilityId}_meta`),
        {
          lastUpdated: Timestamp.now(),
          totalReviews: reviews.length,
          averageRating: reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
        }
      );

    } catch (error) {
      console.error('Error refreshing reviews:', error);
      throw error;
    }
  },

  /**
   * Get reviews, refreshing from Google if needed
   */
  async getReviews(facilityId: string, googlePlaceId: string): Promise<GoogleReview[]> {
    try {
      // Check if we need to refresh
      const needsRefresh = await this.needsRefresh(facilityId);

      if (needsRefresh) {
        await this.refreshReviews(facilityId, googlePlaceId);
      }

      // Get cached reviews
      return await this.getFacilityReviews(facilityId);
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  },

  /**
   * Mark a review as helpful
   */
  async markHelpful(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      await setDoc(reviewRef, {
        ...reviewDoc.data(),
        helpful: (reviewDoc.data().helpful || 0) + 1
      });
    } catch (error) {
      console.error('Error marking review helpful:', error);
      throw error;
    }
  }
};
