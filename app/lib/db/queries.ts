/**
 * Database query functions for APPYness AI
 */

import type { User, Session, AppGeneration, Payment, Subscription } from './schema';

// User queries
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  return result as User | null;
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return result as User | null;
}

export async function createUser(db: D1Database, userData: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO users (
      id, email, password_hash, name, avatar, plan, credits, apps_generated,
      subscription_status, subscription_id, customer_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    userData.id,
    userData.email,
    userData.password_hash,
    userData.name,
    userData.avatar,
    userData.plan,
    userData.credits,
    userData.apps_generated,
    userData.subscription_status,
    userData.subscription_id,
    userData.customer_id,
    now,
    now
  ).run();

  return {
    ...userData,
    created_at: now,
    updated_at: now,
  };
}

export async function updateUser(db: D1Database, id: string, updates: Partial<User>): Promise<void> {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field as keyof User]);

  await db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`)
    .bind(...values, id)
    .run();
}

// Session queries
export async function createSession(db: D1Database, sessionData: Session): Promise<void> {
  await db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    sessionData.id,
    sessionData.user_id,
    sessionData.expires_at
  ).run();
}

export async function getSessionById(db: D1Database, sessionId: string): Promise<Session | null> {
  const result = await db.prepare(`
    SELECT * FROM sessions 
    WHERE id = ? AND expires_at > CURRENT_TIMESTAMP
  `).bind(sessionId).first();
  
  return result as Session | null;
}

export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
}

export async function cleanupExpiredSessions(db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP').run();
}

// App generation queries
export async function createAppGeneration(db: D1Database, appData: Omit<AppGeneration, 'created_at'>): Promise<AppGeneration> {
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO app_generations (
      id, user_id, title, description, complexity, model_used, tokens_used,
      cost_credits, status, generated_code, deployment_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    appData.id,
    appData.user_id,
    appData.title,
    appData.description,
    appData.complexity,
    appData.model_used,
    appData.tokens_used,
    appData.cost_credits,
    appData.status,
    appData.generated_code,
    appData.deployment_url,
    now
  ).run();

  return {
    ...appData,
    created_at: now,
  };
}

export async function updateAppGeneration(db: D1Database, id: string, updates: Partial<AppGeneration>): Promise<void> {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field as keyof AppGeneration]);

  if (updates.status === 'completed' && !updates.completed_at) {
    fields.push('completed_at');
    setClause.replace(setClause, setClause + ', completed_at = CURRENT_TIMESTAMP');
  }

  await db.prepare(`UPDATE app_generations SET ${setClause} WHERE id = ?`)
    .bind(...values, id)
    .run();
}

export async function getAppGenerationsByUserId(db: D1Database, userId: string, limit = 50): Promise<AppGeneration[]> {
  const results = await db.prepare(`
    SELECT * FROM app_generations 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `).bind(userId, limit).all();
  
  return results.results as AppGeneration[];
}

export async function getAppGenerationById(db: D1Database, id: string): Promise<AppGeneration | null> {
  const result = await db.prepare('SELECT * FROM app_generations WHERE id = ?').bind(id).first();
  return result as AppGeneration | null;
}

// Payment queries
export async function createPayment(db: D1Database, paymentData: Omit<Payment, 'created_at' | 'updated_at'>): Promise<Payment> {
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO payments (
      id, user_id, stripe_payment_intent_id, amount, currency, credits_purchased,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    paymentData.id,
    paymentData.user_id,
    paymentData.stripe_payment_intent_id,
    paymentData.amount,
    paymentData.currency,
    paymentData.credits_purchased,
    paymentData.status,
    now,
    now
  ).run();

  return {
    ...paymentData,
    created_at: now,
    updated_at: now,
  };
}

export async function updatePayment(db: D1Database, id: string, updates: Partial<Payment>): Promise<void> {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field as keyof Payment]);

  await db.prepare(`UPDATE payments SET ${setClause} WHERE id = ?`)
    .bind(...values, id)
    .run();
}

export async function getPaymentsByUserId(db: D1Database, userId: string): Promise<Payment[]> {
  const results = await db.prepare(`
    SELECT * FROM payments 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `).bind(userId).all();
  
  return results.results as Payment[];
}

// Subscription queries
export async function createSubscription(db: D1Database, subData: Omit<Subscription, 'created_at' | 'updated_at'>): Promise<Subscription> {
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO subscriptions (
      id, user_id, stripe_subscription_id, stripe_customer_id, plan, status,
      current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    subData.id,
    subData.user_id,
    subData.stripe_subscription_id,
    subData.stripe_customer_id,
    subData.plan,
    subData.status,
    subData.current_period_start,
    subData.current_period_end,
    subData.cancel_at_period_end,
    now,
    now
  ).run();

  return {
    ...subData,
    created_at: now,
    updated_at: now,
  };
}

export async function getSubscriptionByUserId(db: D1Database, userId: string): Promise<Subscription | null> {
  const result = await db.prepare(`
    SELECT * FROM subscriptions 
    WHERE user_id = ? AND status IN ('active', 'trialing')
    ORDER BY created_at DESC 
    LIMIT 1
  `).bind(userId).first();
  
  return result as Subscription | null;
}

export async function updateSubscription(db: D1Database, id: string, updates: Partial<Subscription>): Promise<void> {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field as keyof Subscription]);

  await db.prepare(`UPDATE subscriptions SET ${setClause} WHERE id = ?`)
    .bind(...values, id)
    .run();
}

// Usage tracking
export async function trackUsage(db: D1Database, userId: string, action: string, details?: any): Promise<void> {
  const { nanoid } = await import('nanoid');
  
  await db.prepare(`
    INSERT INTO usage_tracking (id, user_id, action, details, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    nanoid(),
    userId,
    action,
    details ? JSON.stringify(details) : null
  ).run();
}

// Credit management
export async function addCredits(db: D1Database, userId: string, amount: number): Promise<void> {
  await db.prepare(`
    UPDATE users 
    SET credits = credits + ? 
    WHERE id = ?
  `).bind(amount, userId).run();
}

export async function deductCredits(db: D1Database, userId: string, amount: number): Promise<boolean> {
  const result = await db.prepare(`
    UPDATE users 
    SET credits = credits - ? 
    WHERE id = ? AND credits >= ?
  `).bind(amount, userId, amount).run();
  
  return result.changes > 0;
}
