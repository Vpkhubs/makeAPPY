import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { ModelSelector } from './ModelSelector';
import { useModelSelection } from '~/hooks/useModelSelection';

export function Header() {
  const chat = useStore(chatStore);
  const { selectedModel, setSelectedModel } = useModelSelection();

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
      {chat.started && (
        <ClientOnly>
          {() => (
            <div className="mr-1">
              <HeaderActionButtons />
            </div>
          )}
        </ClientOnly>
      )}
    </header>
  );
}
