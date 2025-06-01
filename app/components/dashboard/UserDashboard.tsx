import { useState } from 'react';
import { useAuth } from '~/lib/auth/auth.client';
import { PRICING } from '~/lib/db/schema';

export function UserDashboard() {
  const { user, signOut } = useAuth();
  const [showBilling, setShowBilling] = useState(false);

  if (!user) return null;

  const getUsagePercentage = () => {
    if (user.plan === 'free') {
      return (user.appsGenerated / 3) * 100;
    }
    return 0; // Pro and Enterprise have different usage models
  };

  const getRemainingApps = () => {
    if (user.plan === 'free') {
      return Math.max(0, 3 - user.appsGenerated);
    }
    return 'Unlimited';
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-400';
      case 'pro': return 'text-purple-400';
      case 'enterprise': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-600';
      case 'pro': return 'bg-purple-600';
      case 'enterprise': return 'bg-cyan-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img src="/APPYness-logo.png" alt="APPYness" className="h-10 w-auto" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-400">Welcome back, {user.name || user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(user.plan)} text-white capitalize`}>
                {user.plan}
              </span>
              <button
                onClick={signOut}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Plan Status */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Current Plan</p>
                <p className={`text-2xl font-bold capitalize ${getPlanColor(user.plan)}`}>
                  {user.plan}
                </p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Available Credits</p>
                <p className="text-2xl font-bold text-cyan-400">{user.credits}</p>
              </div>
              <div className="p-3 bg-cyan-900/30 rounded-lg">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Apps Generated */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Apps Generated</p>
                <p className="text-2xl font-bold text-green-400">{user.appsGenerated}</p>
                {user.plan === 'free' && (
                  <p className="text-xs text-gray-500">
                    {getRemainingApps()} remaining this month
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Progress (Free Plan) */}
        {user.plan === 'free' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Monthly Usage</h3>
              <span className="text-sm text-gray-400">{user.appsGenerated}/3 apps</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
              ></div>
            </div>
            {user.appsGenerated >= 3 && (
              <p className="text-orange-400 text-sm mt-2">
                You've reached your monthly limit. Upgrade to Pro for unlimited access!
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg p-6 text-left transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Generate New App</h3>
                <p className="text-white/70 text-sm">Start building your next application</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setShowBilling(true)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-purple-500 rounded-lg p-6 text-left transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-900/30 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Billing & Plans</h3>
                <p className="text-gray-400 text-sm">Manage your subscription</p>
              </div>
            </div>
          </button>

          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-cyan-500 rounded-lg p-6 text-left transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-900/30 rounded-lg">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">View Analytics</h3>
                <p className="text-gray-400 text-sm">Track your app performance</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Apps */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-400">No applications generated yet</p>
              <p className="text-gray-500 text-sm mt-1">Start by generating your first app!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
