import { useState } from 'react';
import { useAuth } from '~/lib/auth/auth.client';
import { PRICING } from '~/lib/db/schema';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComplexity?: 'simple' | 'standard' | 'complex' | 'enterprise';
}

export function PricingModal({ isOpen, onClose, selectedComplexity }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [selectedCredits, setSelectedCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const handleSubscribe = async (plan: 'pro' | 'enterprise') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = async (packageIndex: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageIndex }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getComplexityCost = (complexity: string) => {
    return PRICING.app_costs[complexity as keyof typeof PRICING.app_costs] || 1;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Vaporwave glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-lg blur-xl opacity-30 animate-pulse"></div>
        
        <div className="relative bg-gray-900 border border-purple-500/30 rounded-lg p-8 shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-400 text-lg">
              Unlock the full power of AI-driven app development
            </p>
            {selectedComplexity && (
              <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/20">
                <p className="text-purple-300">
                  <span className="capitalize">{selectedComplexity}</span> app generation costs{' '}
                  <span className="font-bold text-cyan-300">{getComplexityCost(selectedComplexity)} credits</span>
                </p>
              </div>
            )}
          </div>

          {/* Current user info */}
          {isAuthenticated && user && (
            <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">Current Plan: <span className="capitalize text-purple-400">{user.plan}</span></p>
                  <p className="text-gray-400">Credits: <span className="text-cyan-400">{user.credits}</span></p>
                  <p className="text-gray-400">Apps Generated: <span className="text-green-400">{user.appsGenerated}</span></p>
                </div>
                {user.plan === 'free' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Free apps remaining:</p>
                    <p className="text-xl font-bold text-green-400">{Math.max(0, 3 - user.appsGenerated)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Free Plan */}
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-600">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <div className="text-3xl font-bold text-gray-300 mb-4">$0<span className="text-sm">/month</span></div>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  {PRICING.plans.free.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full py-2 px-4 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                >
                  Current Plan
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500/50 relative">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <div className="text-3xl font-bold text-white mb-4">
                  ${(PRICING.plans.pro.price / 100).toFixed(2)}<span className="text-sm">/month</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                  {PRICING.plans.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe('pro')}
                  disabled={isLoading || user?.plan === 'pro'}
                  className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {user?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-lg border border-cyan-500/50">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-white mb-4">
                  ${(PRICING.plans.enterprise.price / 100).toFixed(2)}<span className="text-sm">/month</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                  {PRICING.plans.enterprise.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe('enterprise')}
                  disabled={isLoading || user?.plan === 'enterprise'}
                  className="w-full py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {user?.plan === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
                </button>
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="border-t border-gray-600 pt-8">
            <h3 className="text-2xl font-bold text-center text-white mb-6">
              Or Buy Credits
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRICING.credits.packages.map((pkg, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400 mb-1">
                      {pkg.credits + pkg.bonus}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {pkg.credits} + {pkg.bonus} bonus credits
                    </div>
                    <div className="text-lg font-semibold text-white mb-4">
                      ${(pkg.price / 100).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleBuyCredits(index)}
                      disabled={isLoading}
                      className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      Buy Credits
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App Generation Costs */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h4 className="text-lg font-semibold text-white mb-4">App Generation Costs</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(PRICING.app_costs).map(([complexity, cost]) => (
                <div key={complexity} className="text-center">
                  <div className="capitalize text-gray-300 font-medium">{complexity}</div>
                  <div className="text-cyan-400 font-bold">{cost} credits</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
