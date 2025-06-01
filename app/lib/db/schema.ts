/**
 * Database schema for APPYness AI monetization
 * Using Cloudflare D1 (SQLite)
 */

export const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  credits INTEGER NOT NULL DEFAULT 0,
  apps_generated INTEGER NOT NULL DEFAULT 0,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  subscription_id TEXT,
  customer_id TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- App generations table
CREATE TABLE IF NOT EXISTS app_generations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  complexity TEXT NOT NULL CHECK (complexity IN ('simple', 'standard', 'complex', 'enterprise')),
  model_used TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_credits INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  generated_code TEXT,
  deployment_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  credits_purchased INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'app_generation', 'credit_purchase', 'subscription_change'
  details TEXT, -- JSON string with additional details
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- API keys table for enterprise customers
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  last_used_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_app_generations_user_id ON app_generations (user_id);
CREATE INDEX IF NOT EXISTS idx_app_generations_created_at ON app_generations (created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking (user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys (user_id);

-- Triggers to update updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_payments_updated_at 
  AFTER UPDATE ON payments
  BEGIN
    UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_subscriptions_updated_at 
  AFTER UPDATE ON subscriptions
  BEGIN
    UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;

// TypeScript interfaces for type safety
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  apps_generated: number;
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscription_id?: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface AppGeneration {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  complexity: 'simple' | 'standard' | 'complex' | 'enterprise';
  model_used: string;
  tokens_used: number;
  cost_credits: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generated_code?: string;
  deployment_url?: string;
  created_at: string;
  completed_at?: string;
}

export interface Payment {
  id: string;
  user_id: string;
  stripe_payment_intent_id?: string;
  amount: number;
  currency: string;
  credits_purchased: number;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan: 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  action: string;
  details?: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  name: string;
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

// Pricing configuration
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
} as const;
