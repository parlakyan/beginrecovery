import express from 'express';
import { createSubscriptionSession, handleWebhookEvent } from '../stripe.js';

const router = express.Router();

// Create subscription session
router.post('/create-subscription', async (req, res) => {
  try {
    const { facilityId } = req.body;
    const session = await createSubscriptionSession({ facilityId });
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;