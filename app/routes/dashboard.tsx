import { type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { UserDashboard } from '~/components/dashboard/UserDashboard';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard - APPYness AI Developer' },
    { name: 'description', content: 'Manage your APPYness AI account, view usage, and upgrade your plan.' }
  ];
};

export default function Dashboard() {
  return (
    <ClientOnly>
      {() => <UserDashboard />}
    </ClientOnly>
  );
}
