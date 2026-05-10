'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Heart, ArrowLeft, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  cookTime: number;
  imageUrl?: string;
  tags: string;
  ingredients: string;
  steps: string;
  favorite: boolean;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllIngredients, setShowAllIngredients] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [params.id]);

  const fetchRecipe = async () => {
    try {
      const res = await fetch(`/api/recipes/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecipe(data);
      }
    } catch (error) {
      console.error('获取食谱详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!recipe) return;
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/favorite`, { method: 'PATCH' });
      if (res.ok) {
        setRecipe({ ...recipe, favorite: !recipe.favorite });
        toast.success(recipe.favorite ? '已取消收藏' : '已收藏');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  if (loading) return <div className="p-4 text-center text-brand-secondary">加载中...</div>;
  if (!recipe) return <div className="p-4 text-center text-brand-secondary">食谱不存在</div>;

  const ingredients = JSON.parse(recipe.ingredients);
  const steps = JSON.parse(recipe.steps);
  const tags = recipe.tags.split(',').filter((t: string) => t.trim());
  const displayIngredients = showAllIngredients ? ingredients : ingredients.slice(0, 5);

  return (
    <div className="pb-24">
      {/* Cover Image */}
      <div className="relative aspect-video bg-gray-200">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <span className="text-5xl font-bold text-orange-500">{recipe.title.charAt(0)}</span>
          </div>
        )}
        <button
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5 text-brand-text" />
        </button>
        <button
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
          onClick={toggleFavorite}
        >
          <Heart
            className="w-5 h-5"
            fill={recipe.favorite ? '#F97316' : 'none'}
            stroke={recipe.favorite ? '#F97316' : '#666666'}
          />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Title & Meta */}
        <div>
          <h1 className="text-xl font-bold text-brand-text">{recipe.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-brand-secondary">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings}人份</span>
            </div>
            <span>|</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{recipe.cookTime}分钟</span>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((tag: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {recipe.description && (
          <div>
            <h2 className="text-card-title text-brand-text mb-2">简介</h2>
            <p className="text-sm text-brand-secondary leading-relaxed">{recipe.description}</p>
          </div>
        )}

        <div className="border-t border-[#EEEEEE]" />

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-card-title text-brand-text">食材清单</h2>
            <span className="text-xs text-brand-secondary">{recipe.servings}人份</span>
          </div>
          <div className="space-y-2">
            {displayIngredients.map((ing: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#EEEEEE] last:border-0">
                <span className="text-sm text-brand-text">{ing.name}</span>
                <span className="text-sm text-brand-secondary">
                  {ing.amount}{ing.unit}
                </span>
              </div>
            ))}
          </div>
          {ingredients.length > 5 && (
            <button
              className="text-orange-500 text-sm mt-3 font-medium"
              onClick={() => setShowAllIngredients(!showAllIngredients)}
            >
              {showAllIngredients ? '收起' : '查看更多'}
            </button>
          )}
        </div>

        <div className="border-t border-[#EEEEEE]" />

        {/* Steps */}
        <div>
          <h2 className="text-card-title text-brand-text mb-3">烹饪步骤</h2>
          <div className="space-y-3">
            {steps.map((step: string, i: number) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <p className="text-sm text-brand-text flex-1 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-[#EEEEEE] p-4 z-10">
        <Button className="w-full h-12 rounded-lg text-base">
          <ChefHat className="w-5 h-5 mr-2" />
          立即烹饪
        </Button>
      </div>
    </div>
  );
}
