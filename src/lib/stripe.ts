import Stripe from 'stripe';
import { env } from '@/lib/env';

let stripe: Stripe | null = null;

export const getStripe = () => {
  if (!stripe) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY missing');
    }
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      typescript: true,
    });
  }
  return stripe;
};