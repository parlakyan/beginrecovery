# Payment System Documentation

## Overview
The Recovery Directory platform uses Stripe for handling subscription payments for verified listings. This document details the payment system implementation and integration.

## Payment Flow

### Upgrade Process
1. User clicks "Upgrade to Verified" on facility card
2. System stores facility context in sessionStorage
3. Payment page displays facility name and details
4. User can choose between:
   - Complete payment for verified listing
   - Continue with free unverified listing
5. For paid listings:
   - Stripe Checkout session created
   - User completes payment
   - Webhook processes payment
   - Facility status updated to verified
6. For free listings:
   - Facility status updated to unverified
   - User redirected to listing page using slug
7. In both cases, facility data is preserved and proper navigation is handled

```mermaid
graph TD
    A[User] -->|Clicks Upgrade| B[Store Context]
    B -->|Show Details| C[Payment Page]
    C -->|Free Option| D[Update Status]
    C -->|Paid Option| E[Stripe Checkout]
    D -->|Generate Slug| F[Listing Page]
    E -->|Complete| G[Success Page]
    E -->|Cancel| H[Cancel Page]
    H -->|Try Again| C
    G -->|Webhook| I[Update Status]
    I -->|Navigate| J[Account Page]
```

## State Management

### Facility Context
```typescript
interface FacilityContext {
  facilityId: string;
  facility: Facility;
}

interface Facility {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  // other facility data
}
```

### Session Storage
```typescript
// Store facility data
sessionStorage.setItem('facilityData', JSON.stringify({
  facilityId,
  facility
}));

// Store payment data
sessionStorage.setItem('paymentData', JSON.stringify({
  facilityId,
  facility
}));

// Retrieve facility data
const facilityData = JSON.parse(
  sessionStorage.getItem('facilityData') || '{}'
) as StoredData;
```

## Stripe Integration

### Configuration
```typescript
// Stripe initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

### Environment Variables
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_STRIPE_PRICE_ID=price_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Components

### Payment Page
- Shows facility name and details
- Displays subscription price
- Offers free and paid options
- Handles payment initiation
- Preserves facility context
- Shows loading states
- Handles error cases
- Manages navigation

### Success Page
- Handles successful payments
- Shows confirmation
- Updates facility status
- Redirects to dashboard
- Cleans up session data
- Refreshes user token

### Cancel Page
- Handles cancelled payments
- Shows facility name
- Provides "Try Again" option
- Returns to payment page with context
- Offers account navigation
- Preserves facility state

## Server Implementation

### Create Checkout Session
```typescript
export async function createCheckoutSession(
  facilityId: string,
  customerId?: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID,
      quantity: 1
    }],
    metadata: {
      facilityId
    },
    success_url: '${YOUR_DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: '${YOUR_DOMAIN}/payment/cancel'
  });
  
  return session;
}
```

### Webhook Handler
```typescript
export async function handleWebhook(
  request: Request,
  signature: string
) {
  const event = stripe.webhooks.constructEvent(
    request.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleSuccessfulPayment(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleCancelledSubscription(event.data.object);
      break;
  }
}
```

## Database Schema

### Subscription
```typescript
interface Subscription {
  id: string;
  facilityId: string;
  customerId: string;
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Facility Updates
```typescript
interface FacilityPayment {
  subscriptionId: string;
  isVerified: boolean;
  verifiedUntil: Date;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  slug: string;
}
```

## Navigation Flow

### Payment Initiation
1. Store facility context in sessionStorage
2. Navigate to payment page
3. Display facility details
4. Show payment options

### Free Listing Flow
1. Update facility status
2. Generate/verify slug
3. Navigate to listing page
4. Clear session data

### Paid Listing Flow
1. Initialize Stripe
2. Create checkout session
3. Handle payment completion
4. Update facility status
5. Navigate to account page

### Payment Cancellation
1. Preserve facility context
2. Show facility name
3. Offer retry option
4. Provide account navigation
5. Maintain state on retry

### Payment Success
1. Process webhook
2. Update facility status
3. Clear session data
4. Redirect to dashboard
5. Show success message

## Error Handling

### Payment Errors
1. Invalid card
2. Insufficient funds
3. Network issues
4. Session expiration
5. Context loss
6. Navigation failures
7. Slug conflicts

### Recovery Strategies
1. Preserve context in sessionStorage
2. Provide clear error messages
3. Enable easy retries
4. Maintain facility reference
5. Fallback navigation options
6. Handle slug conflicts
7. Verify facility status

## Security

### Payment Security
- Stripe Elements
- HTTPS only
- Secure webhook
- Data encryption
- Session management
- Status verification

### Access Control
- User authentication
- Role verification
- Session validation
- Rate limiting
- Context validation
- Permission checks

## Testing

### Test Cards
```plaintext
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0000 0000 3220
```

### Test Webhooks
```bash
stripe listen --forward-to localhost:3000/webhook
```

### Test Cases
1. Successful payment
2. Failed payment
3. Free listing creation
4. Subscription cancellation
5. Webhook handling
6. Status updates
7. Context preservation
8. Navigation flows
9. Error recovery
10. Slug generation
11. Permission checks

## Monitoring

### Payment Metrics
- Success rate
- Conversion rate
- Average value
- Churn rate
- Navigation patterns
- Free vs paid ratio

### Error Tracking
- Payment failures
- Webhook errors
- System errors
- User errors
- Context losses
- Navigation issues
- Slug conflicts

## Best Practices

### Implementation
1. Use Stripe Elements
2. Implement proper error handling
3. Validate webhooks
4. Monitor transactions
5. Handle edge cases
6. Preserve context
7. Clear navigation
8. Verify slugs
9. Check permissions

### Security
1. Use HTTPS
2. Validate signatures
3. Secure credentials
4. Monitor activity
5. Regular audits
6. Protect session data
7. Verify status changes

### User Experience
1. Clear pricing
2. Simple flow
3. Good feedback
4. Error messages
5. Success confirmation
6. Facility context
7. Easy navigation
8. Retry options
9. Status indicators

## Troubleshooting

### Common Issues
1. Payment declined
2. Webhook failures
3. Status sync issues
4. Session timeouts
5. Context loss
6. Navigation errors
7. Slug conflicts
8. Permission errors

### Solutions
1. Check card details
2. Verify webhook setup
3. Check logs
4. Validate configuration
5. Test connectivity
6. Verify session storage
7. Check navigation state
8. Validate slugs
9. Verify permissions

## Future Improvements
1. Multiple plans
2. Trial periods
3. Promo codes
4. Better analytics
5. Enhanced reporting
6. Automated refunds
7. Subscription management
8. Payment methods
9. Invoice customization
10. Enhanced security
11. Improved navigation
12. Better context handling
13. Smarter retries
14. Enhanced error recovery
15. Slug customization
16. Status transitions
