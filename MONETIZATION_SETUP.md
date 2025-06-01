# 🚀 APPYness AI Monetization Setup Guide

This guide will help you set up the complete monetization system for APPYness AI, including authentication, payments, and subscription management.

## 📋 Prerequisites

- Cloudflare account with Workers/Pages access
- Stripe account for payment processing
- Node.js 20+ and pnpm installed

## 🔧 Step 1: Install Dependencies

```bash
pnpm add stripe bcryptjs nanoid
pnpm add -D @types/bcryptjs
```

## 🗄️ Step 2: Set Up Cloudflare D1 Database

1. **Create D1 Database:**
```bash
npx wrangler d1 create appyness-ai-db
```

2. **Update wrangler.toml with your database ID:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "appyness-ai-db"
database_id = "your-actual-database-id-here"
```

3. **Initialize Database Schema:**
```bash
npx wrangler d1 execute appyness-ai-db --file=./scripts/init-db.sql
```

## 💳 Step 3: Set Up Stripe

1. **Create Stripe Account:** Go to [stripe.com](https://stripe.com) and create an account

2. **Get API Keys:** From your Stripe Dashboard → Developers → API keys
   - Copy your Publishable key (pk_test_...)
   - Copy your Secret key (sk_test_...)

3. **Create Products and Prices:**
   
   **Pro Plan ($29.99/month):**
   ```bash
   # Create product
   stripe products create \
     --name="APPYness Pro" \
     --description="Professional AI app development with 100 monthly credits"
   
   # Create price (replace prod_xxx with your product ID)
   stripe prices create \
     --product=prod_xxx \
     --unit-amount=2999 \
     --currency=usd \
     --recurring[interval]=month
   ```

   **Enterprise Plan ($99.99/month):**
   ```bash
   # Create product
   stripe products create \
     --name="APPYness Enterprise" \
     --description="Unlimited AI app development with premium features"
   
   # Create price (replace prod_xxx with your product ID)
   stripe prices create \
     --product=prod_xxx \
     --unit-amount=9999 \
     --currency=usd \
     --recurring[interval]=month
   ```

4. **Set Up Webhooks:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.pages.dev/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret (whsec_...)

## 🔐 Step 4: Configure Environment Variables

### Local Development (.env.local):
```bash
# Payment & Monetization Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id_here

# App Configuration
APP_URL=http://localhost:5173
```

### Production (Cloudflare Dashboard):
1. Go to Cloudflare Dashboard → Workers & Pages → Your App → Settings → Environment Variables
2. Add all the environment variables from above with your production values
3. Set `APP_URL` to your production domain

## 🚀 Step 5: Deploy to Cloudflare

1. **Build and Deploy:**
```bash
pnpm run build
npx wrangler pages deploy ./build/client
```

2. **Set up Custom Domain (Optional):**
   - Go to Cloudflare Dashboard → Workers & Pages → Your App → Custom domains
   - Add your domain and configure DNS

## 💰 Step 6: Pricing Configuration

The pricing is configured in `app/lib/db/schema.ts`:

```typescript
export const PRICING = {
  plans: {
    free: {
      name: 'Free',
      price: 0,
      apps_per_month: 3,
      features: ['3 apps per month', 'Basic templates', 'Community support'],
    },
    pro: {
      name: 'Pro',
      price: 2999, // $29.99 in cents
      credits_included: 100,
      features: [
        'Pay-per-app generation',
        'Advanced AI models',
        'Custom styling',
        'Priority support',
        'Export source code',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: 9999, // $99.99 in cents
      features: [
        'Unlimited app generation',
        'All AI models',
        'Custom branding',
        'API access',
        'Dedicated support',
        'On-premise deployment',
      ],
    },
  },
  credits: {
    packages: [
      { credits: 10, price: 999, bonus: 0 }, // $9.99
      { credits: 25, price: 1999, bonus: 5 }, // $19.99 + 5 bonus
      { credits: 50, price: 3999, bonus: 15 }, // $39.99 + 15 bonus
      { credits: 100, price: 6999, bonus: 35 }, // $69.99 + 35 bonus
    ],
  },
  app_costs: {
    simple: 1, // 1 credit
    standard: 3, // 3 credits
    complex: 8, // 8 credits
    enterprise: 20, // 20 credits
  },
};
```

## 🧪 Step 7: Testing

### Test Authentication:
1. Visit your app
2. Click "Sign Up" and create an account
3. Verify you can sign in/out
4. Check the dashboard shows correct user info

### Test Payments:
1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Test credit purchases and subscriptions
3. Verify webhooks are working in Stripe Dashboard

### Test App Generation:
1. Try generating apps with different complexities
2. Verify credit deduction works correctly
3. Test free tier limits

## 📊 Step 8: Analytics & Monitoring

### Stripe Dashboard:
- Monitor payments and subscriptions
- View customer data
- Track revenue metrics

### Cloudflare Analytics:
- Monitor API usage
- Track database performance
- View error logs

### Database Queries:
```sql
-- View user statistics
SELECT plan, COUNT(*) as users FROM users GROUP BY plan;

-- View revenue by month
SELECT 
  strftime('%Y-%m', created_at) as month,
  SUM(amount) / 100.0 as revenue_usd
FROM payments 
WHERE status = 'succeeded'
GROUP BY month;

-- View app generation stats
SELECT 
  complexity,
  COUNT(*) as generations,
  SUM(cost_credits) as total_credits
FROM app_generations 
GROUP BY complexity;
```

## 🔒 Security Considerations

1. **API Keys:** Never commit API keys to version control
2. **Webhook Signatures:** Always verify Stripe webhook signatures
3. **Session Management:** Sessions expire after 30 days
4. **Password Security:** Passwords are hashed with bcrypt (12 rounds)
5. **Database Access:** Use prepared statements to prevent SQL injection

## 🎯 Customization Options

### Adjust Pricing:
- Modify `PRICING` object in `app/lib/db/schema.ts`
- Update Stripe products/prices accordingly

### Add Features:
- Extend user schema for additional fields
- Add new subscription tiers
- Implement usage-based billing

### Branding:
- Update colors in pricing modals
- Customize email templates (Stripe)
- Add your logo to payment pages

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Errors:**
   - Verify D1 database ID in wrangler.toml
   - Check environment variables are set

2. **Stripe Webhook Failures:**
   - Verify webhook URL is correct
   - Check webhook signing secret
   - Review Cloudflare logs

3. **Authentication Issues:**
   - Clear browser localStorage
   - Check session expiration
   - Verify password hashing

### Debug Commands:
```bash
# View D1 database
npx wrangler d1 execute appyness-ai-db --command="SELECT * FROM users LIMIT 5;"

# Check Cloudflare logs
npx wrangler pages deployment tail

# Test Stripe webhooks locally
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

## 📈 Next Steps

1. **Marketing Integration:** Add analytics tracking
2. **Email Marketing:** Integrate with services like Mailchimp
3. **Customer Support:** Add help desk integration
4. **Advanced Features:** API access for Enterprise customers
5. **Mobile App:** Consider React Native version

## 🎉 Congratulations!

Your APPYness AI platform now has a complete monetization system with:
- ✅ User authentication and management
- ✅ Subscription billing with Stripe
- ✅ Credit-based app generation
- ✅ Usage tracking and analytics
- ✅ Scalable infrastructure on Cloudflare

Start generating revenue from your AI-powered app development platform! 🚀
