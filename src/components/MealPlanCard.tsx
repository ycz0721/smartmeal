import { Card } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';

interface MealPlanCardProps {
  meal: {
    day: number;
    mealType: string;
    title: string;
    description: string;
    servings: number;
    cookTime: number;
    imageUrl?: string;
  };
  onClick?: () => void;
}

const mealTypeMap: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

export function MealPlanCard({ meal, onClick }: MealPlanCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="h-32 bg-gray-200">
        {meal.imageUrl && (
          <img
            src={meal.imageUrl}
            alt={meal.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-3">
        <div className="text-xs text-orange-600 font-medium mb-1">
          第{meal.day}天 · {mealTypeMap[meal.mealType]}
        </div>
        <h3 className="font-bold text-sm mb-1">{meal.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {meal.description}
        </p>
        <div className="flex gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{meal.cookTime}分钟</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{meal.servings}人份</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
