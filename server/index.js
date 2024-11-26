import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

// Initialize environment variables
dotenv.config();

// Initialize Firebase Admin
const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beginrecovery-bb288.firebaseio.com"
});

// Initialize Express
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

// Webhook endpoint must be before express.json() middleware
app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Update facility status in Firebase
      try {
        const facilityRef = admin.firestore()
          .collection('facilities')
          .doc(session.metadata.facilityId);

        await facilityRef.update({
          status: 'active',
          subscriptionId: session.subscription,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('Facility activated:', session.metadata.facilityId);
      } catch (error) {
        console.error('Error updating facility:', error);
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      
      // Find and update facility in Firebase
      try {
        const facilitiesRef = admin.firestore().collection('facilities');
        const snapshot = await facilitiesRef
          .where('subscriptionId', '==', subscription.id)
          .get();

        if (!snapshot.empty) {
          const facilityDoc = snapshot.docs[0];
          await facilityDoc.ref.update({
            status: 'inactive',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log('Facility deactivated:', facilityDoc.id);
        }
      } catch (error) {
        console.error('Error updating facility:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.send();
});

// Regular routes
app.use(express.json());

// API routes
app.post('/api/create-checkout-session', async (req, res) => {
  const { facilityId } = req.body;

  try {
    // Verify Firebase auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: process.env.VITE_STRIPE_PRICE_ID,
        quantity: 1,
      }],
      success_url: `${process.env.VITE_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/payment/cancel`,
      metadata: {
        facilityId,
        userId: decodedToken.uid
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle client-side routing - must be after API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});