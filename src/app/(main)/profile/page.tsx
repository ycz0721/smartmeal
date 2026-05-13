'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { SectionHeader } from '@/components/SectionHeader';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { FamilyCreateSheet } from '@/components/FamilyCreateSheet';
import { FamilyJoinSheet } from '@/components/FamilyJoinSheet';
import { HelpCircle, Settings, AlertTriangle, Heart, Users } from 'lucide-react';
import { useUserPrefs } from '@/stores/userPrefs';

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
  const { mealPeople, setMealPeople } = useUserPrefs();
  const [mealPeopleInput, setMealPeopleInput] = useState('');
  const [mealPeopleSheetOpen, setMealPeopleSheetOpen] = useState(false);
  const [familyCreateOpen, setFamilyCreateOpen] = useState(false);
  const [familyJoinOpen, setFamilyJoinOpen] = useState(false);

  useEffect(() => {
    fetchFavorites();
    fetchMealPeople();
  }, []);

  useEffect(() => {
    setMealPeopleInput(mealPeople);
  }, [mealPeople]);

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

  const fetchMealPeople = async () => {
    try {
      const res = await fetch('/api/profile/prefs');
      if (res.ok) {
        const data = await res.json();
        if (data.mealPeople !== undefined) {
          setMealPeopleInput(data.mealPeople);
          setMealPeople(data.mealPeople);
        }
      }
    } catch {}
  };

  const saveMealPeople = useCallback(async (value: string) => {
    setMealPeople(value);
    try {
      await fetch('/api/profile/prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealPeople: value }),
      });
    } catch {}
  }, [setMealPeople]);

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
        <button
          onClick={() => {
            setMealPeopleInput(mealPeople);
            setMealPeopleSheetOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-[20px] border border-[#EEEEEE] bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors"
        >
          <Users className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="truncate">家庭用餐人数</span>
          {mealPeople && (
            <span className="text-xs text-orange-500 ml-auto truncate">{mealPeople}</span>
          )}
        </button>
      </div>

      {/* Family Space Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setFamilyCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-[20px] border border-[#EEEEEE] bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors"
        >
          <span className="text-base flex-shrink-0">🏠</span>
          <span className="truncate">创建家庭空间</span>
        </button>
        <button
          onClick={() => setFamilyJoinOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-[20px] border border-[#EEEEEE] bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors"
        >
          <span className="text-base flex-shrink-0">➕</span>
          <span className="truncate">加入家庭空间</span>
        </button>
      </div>

      {/* Family Sheets */}
      <FamilyCreateSheet open={familyCreateOpen} onOpenChange={setFamilyCreateOpen} />
      <FamilyJoinSheet open={familyJoinOpen} onOpenChange={setFamilyJoinOpen} />

      {/* Meal People BottomSheet */}
      <BottomSheet open={mealPeopleSheetOpen} onOpenChange={setMealPeopleSheetOpen} className="bg-[#1E1E1E]">
        <div className="px-6 pb-8 space-y-5">
          <h3 className="text-lg font-bold text-white text-center" style={{ color: '#FFFFFF' }}>
            家庭用餐人数
          </h3>
          <input
            type="text"
            autoFocus
            placeholder="如：2个大人1个小孩"
            value={mealPeopleInput}
            onChange={(e) => setMealPeopleInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { saveMealPeople(mealPeopleInput); setMealPeopleSheetOpen(false); } }}
            className="w-full h-11 rounded-[10px] px-4 text-sm text-white placeholder:text-[#888888] focus:outline-none"
            style={{ backgroundColor: '#2A2A2A' }}
          />
          <button
            onClick={() => { saveMealPeople(mealPeopleInput); setMealPeopleSheetOpen(false); }}
            className="w-full h-11 rounded-[10px] bg-[#F97316] text-white text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            保存
          </button>
        </div>
      </BottomSheet>

      {/* My Favorites */}
      <div className="space-y-3">
        <SectionHeader title="我的收藏" showViewAll onViewAll={() => router.push('/recipes?favorite=true')} />
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
