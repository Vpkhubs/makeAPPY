import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { VaporwaveBackground } from '~/components/vaporwave/VaporwaveBackground';
import { MatrixRain } from '~/components/vaporwave/MatrixRain';

export const meta: MetaFunction = () => {
  return [{ title: 'APPYness AI Developer - Developing Joy' }, { name: 'description', content: 'APPYness AI Developer - Developing Joy through intelligent app creation. Build amazing applications with our AI-powered development platform.' }];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full relative">
      <VaporwaveBackground />
      <MatrixRain />
      <div className="relative z-20">
        <Header />
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      </div>
    </div>
  );
}
