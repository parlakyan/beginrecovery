import { Handler, HandlerEvent } from '@netlify/functions';
import { Client } from '@googlemaps/google-maps-services-js';

const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('VITE_GOOGLE_MAPS_API_KEY environment variable is required');
}

const client = new Client({});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

const handler: Handler = async (event: HandlerEvent) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'OPTIONS') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
      headers: corsHeaders
    };
  }

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      body: '',
      headers: corsHeaders
    };
  }

  // Get place ID from query string
  const placeId = event.queryStringParameters?.placeId;
  if (!placeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'placeId parameter is required' }),
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    };
  }

  try {
    // First get the place details to ensure it exists
    const placeDetails = await client.placeDetails({
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        fields: ['name', 'rating', 'user_ratings_total', 'reviews']
      }
    });

    const place = placeDetails.data.result;

    // Return place details and reviews
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: place.name,
        rating: place.rating,
        totalReviews: place.user_ratings_total,
        reviews: place.reviews?.map(review => ({
          author_name: review.author_name,
          profile_photo_url: review.profile_photo_url,
          rating: review.rating,
          text: review.text,
          time: review.time,
          relative_time: review.relative_time_description
        })) || []
      })
    };

  } catch (error) {
    console.error('Error fetching place details:', error);

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Error fetching place details',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };