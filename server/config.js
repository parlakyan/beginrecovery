import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Generate a secure random string if JWT_SECRET is not provided
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

export const config = {
  jwt: {
    secret: JWT_SECRET,
    expiresIn: '24h'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publicKey: process.env.VITE_STRIPE_PUBLIC_KEY,
    priceId: process.env.VITE_STRIPE_PRICE_ID
  },
  appUrl: process.env.NODE_ENV === 'production' 
    ? 'https://beginrecovery.org'
    : 'http://localhost:5173',
  db: {
    path: './data.db'
  }
};