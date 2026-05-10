'use client';

import { useRouter } from 'next/navigation';
import { Utensils } from 'lucide-react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useUIStore } from '@/stores/ui';

const actions = [
  {
    icon: Utensils,
    label: '添加食谱',
    href: '/recipes/add',
  },
];

export function QuickActionsSheet() {
  const router = useRouter();
  const { quickActionsOpen, setQuickActionsOpen } = useUIStore();

  return (
    <BottomSheet open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
      <div className="px-6 pb-8">
        <h3 className="text-page-title text-center mb-6">快捷操作</h3>
        <div className="space-y-1">
          {actions.map((action) => (
            <button
              key={action.label}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                setQuickActionsOpen(false);
                router.push(action.href);
              }}
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <action.icon className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-body text-brand-text">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
