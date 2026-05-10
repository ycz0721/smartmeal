'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { SectionHeader } from '@/components/SectionHeader';
import { HelpCircle, Settings, AlertTriangle, Heart } from 'lucide-react';

const quickSettings = [
  { icon: AlertTriangle, label: '不喜欢的食物', href: '/profile/settings/intolerances' },
];

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const phone = user?.phone || '未设置';
  const name = user?.name || '用户';
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favLoading, setFavLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/recipes?favorite=true');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch {} finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* User Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={name} size={56} />
          <div>
            <h2 className="text-card-title text-brand-text">{name}</h2>
            <p className="text-sm text-brand-secondary mt-0.5">{maskPhone(phone)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full border border-orange-500 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-orange-500" />
          </button>
          <button onClick={() => router.push('/profile/settings')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <Settings className="w-4 h-4 text-[#999999]" />
          </button>
        </div>
      </div>

      {/* Quick Settings Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickSettings.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="flex items-center gap-2 px-4 py-3 rounded-[20px] border border-[#EEEEEE] bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors"
          >
            <item.icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>

      {/* My Favorites */}
      <div className="space-y-3">
        <SectionHeader title="我的收藏" showViewAll onViewAll={() => router.push('/recipes')} />
        {favLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.slice(0, 5).map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => router.push(`/recipes/${recipe.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                  {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-50">
                      <span className="text-lg font-bold text-orange-500">{recipe.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <span className="flex-1 text-sm text-brand-text text-left truncate">{recipe.title}</span>
                <Heart className="w-4 h-4 text-red-500 flex-shrink-0" fill="#EF4444" />
              </button>
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <div className="text-4xl mb-3">❤️</div>
            <p className="text-sm text-brand-secondary">暂无收藏食谱</p>
          </Card>
        )}
      </div>
    </div>
  );
}
