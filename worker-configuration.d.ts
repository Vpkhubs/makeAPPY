interface Env {
  // AI Provider API Keys
  ANTHROPIC_API_KEY: string;
  GROQ_API_KEY: string;
  HUGGINGFACE_API_KEY: string;
  GOOGLE_API_KEY: string;
  TOGETHER_API_KEY: string;
  FIREWORKS_API_KEY: string;
  DEEPSEEK_API_KEY: string;
  OPENROUTER_API_KEY: string;
  OPENAI_API_KEY: string;
  PERPLEXITY_API_KEY: string;

  // Payment & Monetization
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRO_PRICE_ID: string;
  STRIPE_ENTERPRISE_PRICE_ID: string;

  // App Configuration
  APP_URL: string;

  // Database
  DB: D1Database;
}
