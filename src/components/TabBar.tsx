'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, BookOpen, ShoppingCart, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';

const tabs = [
  { name: '计划', href: '/plan', icon: Calendar },
  { name: '食谱', href: '/recipes', icon: BookOpen },
];

const tabsRight = [
  { name: '购物', href: '/groceries', icon: ShoppingCart },
  { name: '我的', href: '/profile', icon: User },
];

export function TabBar() {
  const pathname = usePathname();
  const { setQuickActionsOpen } = useUIStore();

  const renderTab = (tab: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = tab.icon;
    const isActive = pathname.startsWith(tab.href);
    return (
      <Link
        key={tab.href}
        href={tab.href}
        className={cn(
          'flex flex-col items-center justify-center flex-1 h-full space-y-0.5',
          isActive ? 'text-orange-500' : 'text-[#999999]'
        )}
      >
        <Icon className="w-6 h-6" />
        <span className="text-xs">{tab.name}</span>
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EEEEEE] z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-end h-16 relative">
          {tabs.map(renderTab)}

          {/* Center floating button */}
          <div className="flex-1 flex justify-center relative h-full">
            <button
              onClick={() => setQuickActionsOpen(true)}
              className="absolute -top-7 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center active:bg-orange-600 transition-colors"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>

          {tabsRight.map(renderTab)}
        </div>
      </nav>
    </>
  );
}
