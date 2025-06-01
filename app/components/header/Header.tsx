import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { ModelSelector } from './ModelSelector';
import { useModelSelection } from '~/hooks/useModelSelection';
import { useState } from 'react';
import { useAuth } from '~/lib/auth/auth.client';
import { AuthModal } from '~/components/auth/AuthModal';
import { PricingModal } from '~/components/pricing/PricingModal';

export function Header() {
  const chat = useStore(chatStore);
  const { selectedModel, setSelectedModel } = useModelSelection();
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <header
      className={classNames(
        'flex items-center p-5 border-b h-[var(--header-height)] vaporwave-border scanlines',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 0, 51, 0.95) 50%, rgba(0, 0, 51, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid #ff00ff',
        boxShadow: '0 2px 20px rgba(255, 0, 255, 0.3)'
      }}
    >
      <div className="flex items-center gap-4 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-xl pulsing" style={{color: '#00ffff'}} />
        <a href="/" className="flex items-center gap-4">
          <img src="/APPYness-logo.png" alt="APPYness" className="h-12 w-auto floating" />
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm vaporwave-text" style={{color: '#00ffff'}}>AI Developer</span>
              <span className="text-sm italic pulsing" style={{color: '#ff00ff'}}>• Developing Joy</span>
            </div>
          </div>
        </a>
      </div>

      {/* Model Selector */}
      <div className="flex-1 flex justify-center items-center gap-4">
        <ClientOnly>
          {() => (
            <ModelSelector
              currentModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          )}
        </ClientOnly>
        <span className="px-4 truncate text-center text-bolt-elements-textPrimary">
          <ClientOnly>{() => <ChatDescription />}</ClientOnly>
        </span>
      </div>
      {/* Auth Section */}
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm text-white font-medium">{user.name || user.email}</div>
                <div className="text-xs text-gray-400">
                  <span className="capitalize">{user.plan}</span> • {user.credits} credits
                </div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Pricing Button */}
            <button
              onClick={() => setShowPricingModal(true)}
              className="px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-sm rounded-lg transition-all duration-200"
            >
              Upgrade
            </button>

            {/* Dashboard Link */}
            <a
              href="/dashboard"
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              Dashboard
            </a>

            {/* Sign Out */}
            <button
              onClick={signOut}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAuthMode('signin');
                setShowAuthModal(true);
              }}
              className="px-4 py-2 text-white hover:text-cyan-400 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200"
            >
              Sign Up
            </button>
          </div>
        )}

        {chat.started && (
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        )}
      </div>

      {/* Modals */}
      <ClientOnly>
        {() => (
          <>
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              initialMode={authMode}
            />
            <PricingModal
              isOpen={showPricingModal}
              onClose={() => setShowPricingModal(false)}
            />
          </>
        )}
      </ClientOnly>
    </header>
  );
}
