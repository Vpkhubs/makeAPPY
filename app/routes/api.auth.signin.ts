import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getUserByEmail, createSession } from '~/lib/db/queries';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Get database from Cloudflare env
    const db = context.cloudflare.env.DB;
    if (!db) {
      return json({ error: 'Database not available' }, { status: 500 });
    }

    // Find user by email
    const user = await getUserByEmail(db, email);
    if (!user) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session
    const sessionId = nanoid();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await createSession(db, {
      id: sessionId,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
    });

    // Update last login
    await db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(user.id)
      .run();

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
    console.error('Sign in error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get session from cookie
export function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies.session || null;
}
