/**
 * Client-side authentication utilities for APPYness AI
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  appsGenerated: number;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
  subscriptionId?: string;
  customerId?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

class AuthManager {
  private user: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const stored = localStorage.getItem('appyness_user');
      if (stored) {
        this.user = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
  }

  private saveUserToStorage(user: User | null) {
    try {
      if (user) {
        localStorage.setItem('appyness_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('appyness_user');
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.user));
  }

  subscribe(listener: (user: User | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        this.user = data.user;
        this.saveUserToStorage(this.user);
        this.notifyListeners();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Sign in failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async signUp(email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        this.user = data.user;
        this.saveUserToStorage(this.user);
        this.notifyListeners();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Sign up failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async signOut(): Promise<void> {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.user = null;
      this.saveUserToStorage(null);
      this.notifyListeners();
    }
  }

  async refreshUser(): Promise<void> {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        this.saveUserToStorage(this.user);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }

  async updateCredits(amount: number): Promise<void> {
    if (this.user) {
      this.user.credits = Math.max(0, this.user.credits + amount);
      this.saveUserToStorage(this.user);
      this.notifyListeners();
    }
  }

  async incrementAppsGenerated(): Promise<void> {
    if (this.user) {
      this.user.appsGenerated += 1;
      this.saveUserToStorage(this.user);
      this.notifyListeners();
    }
  }

  canGenerateApp(): boolean {
    if (!this.user) return false;
    
    switch (this.user.plan) {
      case 'free':
        return this.user.appsGenerated < 3; // 3 free apps per month
      case 'pro':
        return this.user.credits > 0;
      case 'enterprise':
        return true; // Unlimited
      default:
        return false;
    }
  }

  getAppGenerationCost(complexity: 'simple' | 'standard' | 'complex' | 'enterprise'): number {
    const costs = {
      simple: 1,
      standard: 3,
      complex: 8,
      enterprise: 20,
    };
    return costs[complexity];
  }
}

export const authManager = new AuthManager();

// React hook for using auth in components
export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  canGenerateApp: () => boolean;
  getAppGenerationCost: (complexity: 'simple' | 'standard' | 'complex' | 'enterprise') => number;
} {
  const [authState, setAuthState] = useState<AuthState>({
    user: authManager.getUser(),
    isLoading: false,
    isAuthenticated: authManager.isAuthenticated(),
  });

  useEffect(() => {
    const unsubscribe = authManager.subscribe((user) => {
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: user !== null,
      });
    });

    return unsubscribe;
  }, []);

  return {
    ...authState,
    signIn: authManager.signIn.bind(authManager),
    signUp: authManager.signUp.bind(authManager),
    signOut: authManager.signOut.bind(authManager),
    refreshUser: authManager.refreshUser.bind(authManager),
    canGenerateApp: authManager.canGenerateApp.bind(authManager),
    getAppGenerationCost: authManager.getAppGenerationCost.bind(authManager),
  };
}

// Import React hooks
import { useState, useEffect } from 'react';
