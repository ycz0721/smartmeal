import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TabBar } from '@/components/TabBar';
import { QuickActionsSheet } from '@/components/QuickActionsSheet';
import { Providers } from '@/components/Providers';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <Providers>
      <div className="min-h-screen pb-16">
        {children}
        <TabBar />
        <QuickActionsSheet />
      </div>
    </Providers>
  );
}
