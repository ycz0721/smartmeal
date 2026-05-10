'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, ChevronRight } from 'lucide-react';

const settingsGroups: { title: string; items: { label: string; href: string; value?: string }[] }[] = [
  {
    title: '偏好设置',
    items: [
      { label: '不喜欢的食物', href: '/profile/settings/intolerances' },
    ],
  },
  {
    title: '关于',
    items: [
      { label: '应用版本', href: '#', value: 'v0.6.8' },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#EEEEEE] bg-white">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5 text-brand-text" />
        </button>
        <h1 className="text-card-title text-brand-text">设置</h1>
        <button className="w-9 h-9 rounded-full border border-orange-500 flex items-center justify-center">
          <HelpCircle className="w-4 h-4 text-orange-500" />
        </button>
      </div>

      {/* Settings Groups */}
      <div className="p-4 space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs text-brand-secondary font-medium mb-2 px-1">{group.title}</h3>
            <div className="rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08)] overflow-hidden">
              {group.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => item.href !== '#' && router.push(item.href)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-[#EEEEEE] last:border-0"
                >
                  <span className="text-sm text-brand-text">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {item.value && (
                      <span className="text-sm text-brand-secondary">{item.value}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-brand-secondary" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="px-4 space-y-4">
        <Button
          variant="secondary"
          className="w-full h-12"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          退出登录
        </Button>
        <div className="text-center">
          <button className="text-sm text-[#EF4444]">注销账户</button>
        </div>
      </div>
    </div>
  );
}
