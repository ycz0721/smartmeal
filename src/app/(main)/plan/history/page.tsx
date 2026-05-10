'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface MealPlan {
  id: string;
  weekStart: string;
  isCurrent: boolean;
  meals: string;
  createdAt: string;
}

export default function PlanHistoryPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plan/history');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('获取历史计划失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
  };

  const parseDishes = (mealsJson: string): { day: string; dishes: string[] }[] => {
    try {
      const days = JSON.parse(mealsJson);
      if (!Array.isArray(days)) return [];
      return days.map((day: any) => {
        const allDishes: string[] = [];
        for (const key of Object.keys(day)) {
          if (key === 'day') continue;
          for (const dish of day[key]?.dishes || []) {
            if (dish.name) allDishes.push(dish.name);
          }
        }
        return { day: day.day || '未知', dishes: allDishes };
      });
    } catch {
      return [];
    }
  };

  const totalDishes = (mealsJson: string): number => {
    try {
      const days = JSON.parse(mealsJson);
      if (!Array.isArray(days)) return 0;
      let count = 0;
      for (const day of days) {
        for (const key of Object.keys(day)) {
          if (key === 'day') continue;
          count += day[key]?.dishes?.length || 0;
        }
      }
      return count;
    } catch {
      return 0;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5 text-brand-text" />
        </button>
        <h1 className="text-page-title text-brand-text">我的膳食计划</h1>
      </div>

      {loading ? (
        <p className="text-center text-brand-secondary text-sm py-8">加载中...</p>
      ) : plans.length > 0 ? (
        <div className="space-y-3">
          {plans.map((plan) => {
            const isExpanded = expandedId === plan.id;
            const days = parseDishes(plan.meals);
            const dishCount = totalDishes(plan.meals);

            return (
              <Card key={plan.id} className="overflow-hidden">
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-brand-text">
                        {formatDate(plan.weekStart)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {plan.isCurrent ? (
                          <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                            当前计划
                          </span>
                        ) : (
                          <span className="text-xs text-brand-secondary">共 {dishCount} 道菜</span>
                        )}
                      </div>
                    </div>
                    <span className="text-brand-secondary text-sm">{isExpanded ? '收起' : '展开'}</span>
                  </div>
                </button>

                {/* Expanded dish list */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#EEEEEE] pt-3">
                    {days.map((day, di) => (
                      <div key={di}>
                        <p className="text-xs font-medium text-brand-secondary mb-1.5">{day.day}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {day.dishes.map((name, ni) => (
                            <span
                              key={ni}
                              className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <div className="text-5xl mb-4">&#128203;</div>
          <p className="text-sm text-brand-secondary">暂无历史计划</p>
        </Card>
      )}
    </div>
  );
}
