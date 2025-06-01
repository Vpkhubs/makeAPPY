import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import { 
  getUserById, 
  updateUser, 
  createSubscription, 
  updateSubscription,
  createPayment,
  updatePayment,
  addCredits,
  trackUsage 
} from '~/lib/db/queries';
import { PRICING } from '~/lib/db/schema';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return json({ error: 'Missing signature' }, { status: 400 });
    }

    // Initialize Stripe
    const stripe = new Stripe(context.cloudflare.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        context.cloudflare.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return json({ error: 'Invalid signature' }, { status: 400 });
    }

    const db = context.cloudflare.env.DB;

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in session metadata');
          return json({ error: 'Missing userId' }, { status: 400 });
        }

        if (session.mode === 'subscription') {
          // Handle subscription creation
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await createSubscription(db, {
            id: nanoid(),
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            plan: session.metadata?.plan as 'pro' | 'enterprise',
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          // Update user plan and add initial credits for Pro plan
          const plan = session.metadata?.plan as 'pro' | 'enterprise';
          const updates: any = { 
            plan,
            subscription_status: 'active',
            subscription_id: subscription.id,
          };

          if (plan === 'pro') {
            updates.credits = PRICING.plans.pro.credits_included;
          }

          await updateUser(db, userId, updates);

          // Track subscription
          await trackUsage(db, userId, 'subscription_created', {
            plan,
            subscription_id: subscription.id,
          });

        } else if (session.mode === 'payment') {
          // Handle one-time payment for credits
          const packageIndex = parseInt(session.metadata?.packageIndex || '0');
          const credits = parseInt(session.metadata?.credits || '0');

          // Create payment record
          await createPayment(db, {
            id: nanoid(),
            user_id: userId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            credits_purchased: credits,
            status: 'succeeded',
          });

          // Add credits to user
          await addCredits(db, userId, credits);

          // Track credit purchase
          await trackUsage(db, userId, 'credits_purchased', {
            credits,
            package_index: packageIndex,
            amount: session.amount_total,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateSubscription(db, subscription.id, {
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          await updateUser(db, userId, {
            subscription_status: subscription.status as any,
          });

          await trackUsage(db, userId, 'subscription_updated', {
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateUser(db, userId, {
            plan: 'free',
            subscription_status: null,
            subscription_id: null,
          });

          await trackUsage(db, userId, 'subscription_canceled', {
            subscription_id: subscription.id,
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = subscription.metadata?.userId;

          if (userId && subscription.metadata?.plan === 'pro') {
            // Add monthly credits for Pro plan
            await addCredits(db, userId, PRICING.plans.pro.credits_included);

            await trackUsage(db, userId, 'monthly_credits_added', {
              credits: PRICING.plans.pro.credits_included,
              invoice_id: invoice.id,
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = subscription.metadata?.userId;

          if (userId) {
            await updateUser(db, userId, {
              subscription_status: 'past_due',
            });

            await trackUsage(db, userId, 'payment_failed', {
              invoice_id: invoice.id,
              amount: invoice.amount_due,
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
