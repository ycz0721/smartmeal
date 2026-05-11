'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/SectionHeader';
import { useUserPrefs } from '@/stores/userPrefs';
import { Card } from '@/components/ui/card';
import { Clock, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { GeneratePlanSheet } from '@/components/GeneratePlanSheet';
import { ManagePlanSheet } from '@/components/ManagePlanSheet';
import { BottomSheet } from '@/components/ui/bottom-sheet';

interface DishItem {
  recipeId: string;
  name: string;
  cookTime: number;
  imageUrl?: string;
  tags: string[];
  ingredients: any[];
  steps: string[];
}

interface MealTypeGroup {
  type: string;
  dishes: DishItem[];
}

interface DayMeal {
  day: string;
  [mealType: string]: MealTypeGroup | string;
}

const MEAL_TYPE_CN: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

const MEAL_TYPE_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
};

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generateSheetOpen, setGenerateSheetOpen] = useState(false);
  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishItem | null>(null);
  const { cuisines, intolerances, dietary, familySize } = useUserPrefs();

  useEffect(() => {
    fetchCurrentPlan();
    fetchHistory();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const res = await fetch('/api/plan/current');
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (error) {
      console.error('获取计划失败:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/plan/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.slice(0, 3));
      }
    } catch (error) {
      console.error('获取历史计划失败:', error);
    }
  };

  const handleGenerate = async ({ prompt, mealTypes, dishCombo }: {
    prompt: string;
    mealTypes: string[];
    dishCombo: string;
  }) => {
    setLoading(true);
    setGenerateSheetOpen(false);
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          cuisines,
          intolerances,
          dietary,
          familySize,
          days: 7,
          mealTypes,
          dishCombo,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        fetchHistory();
        toast.success(`已生成计划并自动同步 ${data.shoppingCount} 种食材到购物清单`);
      } else {
        const err = await res.json().catch(() => ({ error: '请求失败' }));
        toast.error(err.error || '生成计划失败，请重试');
      }
    } catch (error) {
      toast.error('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  const [cooking, setCooking] = useState(false);
  const [cookedDays, setCookedDays] = useState<Set<number>>(new Set());
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [faving, setFaving] = useState<string | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('sm_favs') || '[]');
      setFavoritedIds(new Set(data));
    } catch {}
  }, []);

  // Load cooked days from localStorage when plan loads/changes
  useEffect(() => {
    if (!plan?.id) return;
    try {
      const all = JSON.parse(localStorage.getItem('sm_cooked') || '{}');
      const days: number[] = all[plan.id] || [];
      setCookedDays(new Set(days));
    } catch {
      setCookedDays(new Set());
    }
  }, [plan?.id]);

  // Persist cooked days to localStorage
  const persistCooked = (days: Set<number>) => {
    if (!plan?.id) return;
    try {
      const all = JSON.parse(localStorage.getItem('sm_cooked') || '{}');
      all[plan.id] = [...days];
      localStorage.setItem('sm_cooked', JSON.stringify(all));
    } catch {}
  };

  const getDishes = (dayMeal?: DayMeal): { recipeId: string; ingredients: any[] }[] => {
    const result: { recipeId: string; ingredients: any[] }[] = [];
    const days = dayMeal ? [dayMeal] : dayMeals;
    for (const day of days) {
      const types = getMealTypesForDay(day);
      for (const mt of types) {
        const group = day[mt] as MealTypeGroup;
        for (const dish of group?.dishes || []) {
          if (dish.recipeId) result.push({ recipeId: dish.recipeId, ingredients: dish.ingredients || [] });
        }
      }
    }
    return result;
  };

  const handleFavorite = async (e: React.MouseEvent, dish: DishItem) => {
    e.stopPropagation();
    if (faving) return;
    setFaving(dish.recipeId);
    try {
      const res = await fetch('/api/recipes/favorite-from-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dish.name,
          cookTime: dish.cookTime,
          imageUrl: dish.imageUrl,
          tags: dish.tags,
          ingredients: dish.ingredients,
          steps: dish.steps,
        }),
      });
      if (res.ok) {
        const next = new Set([...favoritedIds, dish.recipeId]);
        setFavoritedIds(next);
        localStorage.setItem('sm_favs', JSON.stringify([...next]));
        toast.success(`已收藏「${dish.name}」`);
      }
    } catch {} finally {
      setFaving(null);
    }
  };

  const handleCookDay = async () => {
    if (!currentDay) return;
    const dishes = getDishes(currentDay);
    if (dishes.length === 0) return;
    setCooking(true);
    let done = 0;
    for (const dish of dishes) {
      const res = await fetch('/api/plan/cook-deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: dish.recipeId, ingredients: dish.ingredients }),
      });
      if (res.ok) done++;
    }
    const next = new Set([...cookedDays, selectedDay]);
    setCookedDays(next);
    persistCooked(next);
    setCooking(false);
    toast.success(`已烹饪 ${done}/${dishes.length} 道菜`);
  };

  const handleCookWeek = async () => {
    const dishes = getDishes();
    if (dishes.length === 0) return;
    setCooking(true);
    let done = 0;
    for (const dish of dishes) {
      const res = await fetch('/api/plan/cook-deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: dish.recipeId, ingredients: dish.ingredients }),
      });
      if (res.ok) done++;
    }
    const next = new Set(dayMeals.map((_, i) => i));
    setCookedDays(next);
    persistCooked(next);
    setCooking(false);
    toast.success(`本周已烹饪 ${done}/${dishes.length} 道菜`);
  };

  const parseMeals = (): DayMeal[] => {
    if (!plan?.meals) return [];
    try {
      return JSON.parse(plan.meals);
    } catch {
      return [];
    }
  };

  const getWeekRange = () => {
    if (plan?.weekStart) {
      const start = new Date(plan.weekStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
      return `${fmt(start)} - ${fmt(end)}`;
    }
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
    return `${fmt(monday)} - ${fmt(sunday)}`;
  };

  const dayMeals = parseMeals();
  const [selectedDay, setSelectedDay] = useState(0);

  // Reset selected day when plan changes
  useEffect(() => {
    setSelectedDay(0);
  }, [plan?.id]);

  const MEAL_TYPE_ORDER = ['breakfast', 'lunch', 'dinner'];

  const getMealTypesForDay = (dayMeal: DayMeal): string[] => {
    return MEAL_TYPE_ORDER.filter((mt) => mt in dayMeal);
  };

  const currentDay = dayMeals[selectedDay];
  const dayCooked = cookedDays.has(selectedDay);
  const weekCooked = dayMeals.length > 0 && dayMeals.every((_, i) => cookedDays.has(i));

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-brand-text">本周膳食计划</h1>
          <p className="text-secondary text-brand-secondary mt-0.5">{getWeekRange()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="h-9 px-4 text-sm" onClick={() => setManageSheetOpen(true)}>
            管理计划
          </Button>
        </div>
      </div>

      {/* Meal Plan Content */}
      {dayMeals.length > 0 && currentDay ? (
        <div className="space-y-4">
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {dayMeals.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`h-9 px-4 rounded-[20px] text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  i === selectedDay
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-orange-500 border border-orange-500'
                }`}
              >
                {d.day}
              </button>
            ))}
          </div>

          {/* Selected day meals */}
          <div className="space-y-3">
            {getMealTypesForDay(currentDay).map((mt) => {
              const group = currentDay[mt] as MealTypeGroup;
              const dishes = group?.dishes || [];
              const typeLabel = MEAL_TYPE_CN[mt] || group?.type || mt;
              const emoji = MEAL_TYPE_EMOJI[mt] || '🍽️';

              return (
                <div key={mt}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                      {emoji} {typeLabel}
                    </span>
                    <span className="text-xs text-brand-secondary">
                      {dishes.length}道菜
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {dishes.map((dish, di) => (
                      <Card
                        key={di}
                        className="overflow-hidden cursor-pointer active:opacity-80"
                        onClick={() => setSelectedDish(dish)}
                      >
                        <div className="aspect-[4/3] bg-gray-200 relative">
                          {dish.imageUrl ? (
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-50">
                              <span className="text-3xl font-bold text-orange-500">{dish.name.charAt(0)}</span>
                            </div>
                          )}
                          {/* Favorite heart */}
                          <button
                            onClick={(e) => handleFavorite(e, dish)}
                            disabled={faving === dish.recipeId}
                            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              favoritedIds.has(dish.recipeId) ? 'bg-red-500' : 'bg-black/40'
                            }`}
                          >
                            <Heart
                              className="w-3.5 h-3.5 text-white"
                              fill={favoritedIds.has(dish.recipeId) ? 'white' : 'none'}
                            />
                          </button>
                        </div>
                        <div className="p-2.5">
                          <h3 className="font-bold text-sm text-brand-text truncate">{dish.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-secondary text-brand-secondary">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {dish.cookTime}分钟
                            </span>
                          </div>
                          {dish.tags && dish.tags.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {dish.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cooking actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCookDay}
              disabled={cooking || dayCooked}
              className={`flex-1 h-10 rounded-lg text-sm font-medium active:opacity-80 disabled:opacity-100 ${
                dayCooked
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-gray-400 text-white'
              }`}
            >
              {dayCooked ? '✅ 本日已烹饪' : '🍳 本日待烹饪'}
            </button>
            <button
              onClick={handleCookWeek}
              disabled={cooking || weekCooked}
              className={`flex-1 h-10 rounded-lg text-sm font-medium active:opacity-80 disabled:opacity-100 ${
                weekCooked
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-gray-400 text-white'
              }`}
            >
              {weekCooked ? '✅ 本周已烹饪' : '🍳 本周待烹饪'}
            </button>
          </div>
        </div>
      ) : (
        <Card className="py-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-brand-secondary mb-1">还没有膳食计划</p>
          <p className="text-secondary text-brand-secondary">点击下方按钮生成本周计划</p>
        </Card>
      )}

      {/* History Section */}
      <div className="space-y-3">
        <SectionHeader title="历史膳食计划" showViewAll viewAllHref="/plan/history" />
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="text-sm text-brand-text flex-shrink-0">
                  {new Date(item.weekStart).toLocaleDateString('zh-CN', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs text-brand-secondary flex-shrink-0">
                  {item.isCurrent ? '⭐当前计划' : '由我创建'}
                </div>
                <div className="flex gap-1.5 flex-1 justify-end">
                  {['🥘', '🍜', '🥗'].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-sm"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <button className="text-brand-secondary p-1">
                  <span className="text-lg leading-none">···</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Card className="py-8 text-center">
            <p className="text-sm text-brand-secondary">暂无历史记录</p>
          </Card>
        )}
      </div>

      {/* Generate Button */}
      <div className="fixed bottom-20 left-4 right-4 z-10">
        <Button
          className="w-full h-12 rounded-lg text-base"
          onClick={() => setGenerateSheetOpen(true)}
          disabled={loading}
        >
          {loading ? '生成中...' : '📅 生成下周计划'}
        </Button>
      </div>

      {/* Spacer for bottom button */}
      <div className="h-20" />

      {/* Sheets */}
      <GeneratePlanSheet
        open={generateSheetOpen}
        onOpenChange={setGenerateSheetOpen}
        onGenerate={handleGenerate}
        loading={loading}
      />
      <ManagePlanSheet
        open={manageSheetOpen}
        onOpenChange={setManageSheetOpen}
        planId={plan?.id}
        dayMeals={dayMeals}
      />

      {/* Dish Detail Sheet */}
      <BottomSheet open={!!selectedDish} onOpenChange={(open) => !open && setSelectedDish(null)}>
        {selectedDish && (
          <div className="px-6 pb-8 space-y-4">
            <h3 className="text-card-title text-brand-text text-center">{selectedDish.name}</h3>
            {selectedDish.cookTime > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-brand-secondary">
                <Clock className="w-4 h-4" />
                <span>{selectedDish.cookTime}分钟</span>
              </div>
            )}
            {selectedDish.tags && selectedDish.tags.length > 0 && (
              <div className="flex justify-center gap-2 flex-wrap">
                {selectedDish.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-500">{tag}</span>
                ))}
              </div>
            )}
            {selectedDish.ingredients && selectedDish.ingredients.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-brand-text mb-2">食材清单</h4>
                <div className="space-y-1">
                  {selectedDish.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm text-brand-secondary">
                      <span>{ing.name}</span>
                      <span>{ing.amount}{ing.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedDish.steps && selectedDish.steps.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-brand-text mb-2">烹饪步骤</h4>
                <ol className="space-y-2">
                  {selectedDish.steps.map((step: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-brand-secondary">
                      <span className="font-bold text-orange-500 flex-shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
