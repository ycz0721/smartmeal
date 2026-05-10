'use client';

import { useRouter } from 'next/navigation';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ArrowLeftRight } from 'lucide-react';

interface DishItem {
  recipeId: string;
  name: string;
  cookTime: number;
  imageUrl?: string;
  tags: string[];
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

const MEAL_TYPE_ORDER = ['breakfast', 'lunch', 'dinner'];

interface ManagePlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId?: string;
  dayMeals: DayMeal[];
}

export function ManagePlanSheet({ open, onOpenChange, planId, dayMeals }: ManagePlanSheetProps) {
  const router = useRouter();

  const getMealTypesForDay = (day: DayMeal): string[] => {
    return MEAL_TYPE_ORDER.filter((mt) => mt in day);
  };

  const handleReplace = (dayIndex: number, mealType: string, dishIndex: number, dishName: string) => {
    const params = new URLSearchParams({
      replaceMode: 'true',
      planId: planId || '',
      dayIndex: String(dayIndex),
      mealType,
      dishIndex: String(dishIndex),
      dishName,
    });
    router.push(`/recipes?${params.toString()}`);
    onOpenChange(false);
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="px-4 pb-8">
        <h3 className="text-card-title text-brand-text text-center mb-4">编辑此计划</h3>

        {dayMeals.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto space-y-4">
            {dayMeals.map((day, dayIdx) => {
              const mealTypes = getMealTypesForDay(day);
              if (mealTypes.length === 0) return null;

              return (
                <div key={dayIdx}>
                  {/* Day header */}
                  <h4 className="text-sm font-bold text-brand-text mb-2 px-1">{day.day}</h4>

                  <div className="space-y-2">
                    {mealTypes.map((mt) => {
                      const group = day[mt] as MealTypeGroup;
                      const dishes = group?.dishes || [];
                      const typeLabel = MEAL_TYPE_CN[mt] || group?.type || mt;

                      return (
                        <div key={mt}>
                          <p className="text-xs text-brand-secondary font-medium mb-1 px-1">{typeLabel}</p>
                          <div className="rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08)] overflow-hidden">
                            {dishes.map((dish, di) => (
                              <div
                                key={di}
                                className={`flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                                  di < dishes.length - 1 ? 'border-b border-[#EEEEEE]' : ''
                                }`}
                              >
                                {/* Thumbnail */}
                                <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                  {dish.imageUrl ? (
                                    <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-orange-50">
                                      <span className="text-base font-bold text-orange-500">{dish.name.charAt(0)}</span>
                                    </div>
                                  )}
                                </div>
                                {/* Name */}
                                <span className="flex-1 text-sm text-brand-text truncate">{dish.name}</span>
                                {/* Replace button */}
                                <button
                                  onClick={() => handleReplace(dayIdx, mt, di, dish.name)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-orange-500 text-orange-500 text-xs font-medium hover:bg-orange-50 active:bg-orange-100 transition-colors flex-shrink-0"
                                >
                                  <ArrowLeftRight className="w-3 h-3" />
                                  替换
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-brand-secondary py-8 text-sm">当前没有菜品</p>
        )}
      </div>
    </BottomSheet>
  );
}
