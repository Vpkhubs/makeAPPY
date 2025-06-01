import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import Stripe from 'stripe';
import { getSessionFromRequest } from './api.auth.signin';
import { getUserById } from '~/lib/db/queries';
import { PRICING } from '~/lib/db/schema';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { packageIndex } = await request.json();

    if (typeof packageIndex !== 'number' || packageIndex < 0 || packageIndex >= PRICING.credits.packages.length) {
      return json({ error: 'Invalid package' }, { status: 400 });
    }

    // Get user from session
    const sessionId = getSessionFromRequest(request);
    if (!sessionId) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = context.cloudflare.env.DB;
    const user = await getUserById(db, sessionId);
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize Stripe
    const stripe = new Stripe(context.cloudflare.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    // Get credit package details
    const creditPackage = PRICING.credits.packages[packageIndex];
    const totalCredits = creditPackage.credits + creditPackage.bonus;

    // Create or get Stripe customer
    let customerId = user.customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Update user with customer ID
      await db.prepare('UPDATE users SET customer_id = ? WHERE id = ?')
        .bind(customerId, user.id)
        .run();
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${totalCredits} APPYness Credits`,
              description: `${creditPackage.credits} credits + ${creditPackage.bonus} bonus credits`,
              images: [`${context.cloudflare.env.APP_URL}/APPYness-logo.png`],
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${context.cloudflare.env.APP_URL}/dashboard?success=true&credits=${totalCredits}`,
      cancel_url: `${context.cloudflare.env.APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        packageIndex: packageIndex.toString(),
        credits: totalCredits.toString(),
      },
    });

    return json({ url: session.url });

  } catch (error) {
    console.error('Payment creation error:', error);
    return json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
