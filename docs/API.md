# API Documentation

## Overview
The Recovery Directory platform provides a RESTful API for managing facilities, users, and platform features. This document details the API endpoints, authentication, and usage.

## Base URL
```
Production: https://api.beginrecovery.org
Development: http://localhost:3000
```

## Authentication

### Bearer Token
```http
Authorization: Bearer <token>
```

### Firebase Auth
```typescript
import { getAuth } from 'firebase/auth';
const auth = getAuth();
const token = await auth.currentUser?.getIdToken();
```

## Endpoints

### Facilities

#### List Facilities
```http
GET /api/facilities
```

Query Parameters:
```typescript
interface FacilityQuery {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    verified?: boolean;
    location?: string;
    treatments?: string[];
    amenities?: string[];
  };
  sort?: 'rating' | 'created' | 'name';
}
```

Response:
```typescript
interface FacilityResponse {
  facilities: Facility[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### Get Facility
```http
GET /api/facilities/:id
```

Response:
```typescript
interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  isVerified: boolean;
  images: string[];
  amenities: string[];
  tags: string[];
  rating: number;
  moderationStatus: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Create Facility
```http
POST /api/facilities
```

Request Body:
```typescript
interface CreateFacilityRequest {
  name: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  images?: string[];
  amenities?: string[];
  tags?: string[];
}
```

#### Update Facility
```http
PUT /api/facilities/:id
```

Request Body:
```typescript
interface UpdateFacilityRequest {
  name?: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  images?: string[];
  amenities?: string[];
  tags?: string[];
}
```

#### Delete Facility
```http
DELETE /api/facilities/:id
```

### Users

#### Get User Profile
```http
GET /api/users/me
```

Response:
```typescript
interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'owner' | 'user';
  createdAt: string;
  facilities?: string[];
}
```

#### Update Profile
```http
PUT /api/users/me
```

Request Body:
```typescript
interface UpdateProfileRequest {
  email?: string;
  password?: string;
  profile?: {
    name?: string;
    phone?: string;
  };
}
```

### Payments

#### Create Checkout Session
```http
POST /api/payments/create-checkout
```

Request Body:
```typescript
interface CreateCheckoutRequest {
  facilityId: string;
  successUrl: string;
  cancelUrl: string;
}
```

#### Webhook Handler
```http
POST /api/webhook
```

## Error Handling

### Error Response
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Rate Limiting

### Limits
- 100 requests per minute per IP
- 1000 requests per hour per user
- 50 concurrent requests

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

## Versioning

### URL Versioning
```
/api/v1/facilities
/api/v2/facilities
```

### Accept Header
```http
Accept: application/vnd.beginrecovery.v1+json
```

## Security

### CORS
```typescript
const corsOptions = {
  origin: [
    'https://beginrecovery.org',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};
```

### Input Validation
```typescript
import { z } from 'zod';

const FacilitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  location: z.string().min(1).max(200),
  phone: z.string().regex(/^\+?[\d\s-()]+$/),
  email: z.string().email()
});
```

## Testing

### Example Request
```typescript
const response = await fetch('/api/facilities', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Curl Example
```bash
curl -X GET "https://api.beginrecovery.org/api/facilities" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

## Best Practices

### Implementation
1. Use proper HTTP methods
2. Validate all input
3. Handle errors gracefully
4. Rate limit requests
5. Log API usage

### Security
1. Use HTTPS
2. Validate tokens
3. Sanitize input
4. Prevent injection
5. Monitor usage

### Performance
1. Cache responses
2. Optimize queries
3. Batch requests
4. Compress data
5. Monitor metrics

## Troubleshooting

### Common Issues
1. Authentication errors
2. Rate limiting
3. Invalid input
4. Server errors

### Solutions
1. Check token
2. Review limits
3. Validate input
4. Check logs

## Future Improvements
1. GraphQL API
2. WebSocket support
3. Better caching
4. More endpoints
5. Enhanced security
6. Better documentation
7. SDK development
8. API versioning
9. Performance optimization
10. Analytics integration
