import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getUserByEmail, createUser, createSession } from '~/lib/db/queries';
import { PRICING } from '~/lib/db/schema';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Get database from Cloudflare env
    const db = context.cloudflare.env.DB;
    if (!db) {
      return json({ error: 'Database not available' }, { status: 500 });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(db, email);
    if (existingUser) {
      return json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = nanoid();
    const user = await createUser(db, {
      id: userId,
      email,
      password_hash: passwordHash,
      name: name || null,
      plan: 'free',
      credits: 0,
      apps_generated: 0,
    });

    // Create session
    const sessionId = nanoid();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await createSession(db, {
      id: sessionId,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    });

    // Track user registration
    await db.prepare(`
      INSERT INTO usage_tracking (id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `).bind(
      nanoid(),
      userId,
      'user_registration',
      JSON.stringify({ plan: 'free', source: 'web' })
    ).run();

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    // Set session cookie
    const headers = new Headers();
    headers.append('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/`);

    return json(
      { 
        success: true, 
        user: {
          ...userWithoutPassword,
          isAuthenticated: true,
        }
      },
      { headers }
    );

  } catch (error) {
    console.error('Sign up error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
