import express from 'express';
import Stripe from 'stripe';
import { verifyToken } from '../middleware/auth.js';
import db from '../db.js';
import { config } from '../config.js';

const stripe = new Stripe(config.stripe.secretKey);
const router = express.Router();

// Create subscription
router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: config.stripe.priceId, // Monthly subscription price ID
        quantity: 1,
      }],
      success_url: `${config.appUrl}/add-listing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.appUrl}/add-listing`,
      metadata: {
        userId: req.user.id
      }
    });

    res.json({ clientSecret: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
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
      config.stripe.webhookSecret
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update facility payment status if facilityId is in metadata
        if (paymentIntent.metadata.facilityId) {
          await db.prepare(`
            UPDATE facilities 
            SET status = 'active',
                subscription_status = 'active',
                stripe_customer_id = ?
            WHERE id = ?
          `).run(paymentIntent.customer, paymentIntent.metadata.facilityId);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status;
        const customerId = subscription.customer;

        await db.prepare(`
          UPDATE facilities 
          SET subscription_status = ?
          WHERE stripe_customer_id = ?
        `).run(status, customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await db.prepare(`
          UPDATE facilities 
          SET subscription_status = 'cancelled',
              status = 'inactive'
          WHERE stripe_customer_id = ?
        `).run(customerId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await db.prepare(`
          UPDATE facilities 
          SET subscription_status = 'past_due'
          WHERE stripe_customer_id = ?
        `).run(customerId);
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Get subscription status
router.get('/subscription/:id', verifyToken, async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(req.params.id);
    res.json({ status: subscription.status });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/subscription/:id/cancel', verifyToken, async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.cancel(req.params.id);
    res.json({ status: subscription.status });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;