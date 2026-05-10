'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TagFilter } from '@/components/TagFilter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

function RecipesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const replaceMode = searchParams.get('replaceMode') === 'true';
  const replaceDishName = searchParams.get('dishName') || '';
  const replacePlanId = searchParams.get('planId') || '';
  const replaceDayIndex = searchParams.get('dayIndex') || '';
  const replaceMealType = searchParams.get('mealType') || '';
  const replaceDishIndex = searchParams.get('dishIndex') || '';

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<any>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch('/api/recipes');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('获取食谱失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleSelect = (recipe: any) => {
    setPendingRecipe(recipe);
    setConfirmOpen(true);
  };

  const handleConfirmReplace = async () => {
    if (!pendingRecipe) return;
    setReplacing(true);
    setConfirmOpen(false);

    try {
      const res = await fetch('/api/plan/replace-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: replacePlanId,
          dayIndex: parseInt(replaceDayIndex),
          mealType: replaceMealType,
          dishIndex: parseInt(replaceDishIndex),
          newRecipeId: pendingRecipe.id,
        }),
      });

      if (res.ok) {
        toast.success('替换成功');
        // Clear replace params and go back to plan
        router.push('/plan');
      } else {
        const err = await res.json();
        toast.error(err.error || '替换失败');
      }
    } catch {
      toast.error('替换失败');
    } finally {
      setReplacing(false);
      setPendingRecipe(null);
    }
  };

  const cancelReplace = () => {
    router.push('/recipes');
  };

  const filteredRecipes = selectedTag
    ? recipes.filter((r) => r.tags && r.tags.includes(selectedTag))
    : recipes;

  return (
    <div className="p-4 space-y-4">
      {/* Replace mode banner */}
      {replaceMode && (
        <div className="flex items-center justify-between bg-orange-500 text-white px-4 py-3 rounded-lg">
          <p className="text-sm">
            请选择替换「<span className="font-bold">{replaceDishName}</span>」的菜品
          </p>
          <button onClick={cancelReplace} className="p-0.5 flex-shrink-0 ml-2">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-page-title text-brand-text">食谱</h1>
        {!replaceMode && (
          <Link href="/recipes/add">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </Link>
        )}
      </div>

      {/* Tag Filter */}
      <TagFilter selectedTag={selectedTag} onTagChange={setSelectedTag} />

      {/* Recipe List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="space-y-3">
          {filteredRecipes.map((recipe) => {
            const card = (
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-50">
                      <span className="text-4xl font-bold text-orange-500">{recipe.title.charAt(0)}</span>
                    </div>
                  )}
                  {/* Vegetarian badge */}
                  {recipe.tags && recipe.tags.includes('素食') && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">&#10003;</span>
                    </div>
                  )}
                  {/* Title overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                    <h3 className="text-white font-bold text-base">{recipe.title}</h3>
                  </div>
                  {/* Play button for video */}
                  {recipe.imageUrl && recipe.imageUrl.endsWith('.mp4') && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[12px] border-l-orange-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Select button in replace mode */}
                  {replaceMode && (
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelect(recipe);
                        }}
                        disabled={replacing}
                        className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 active:bg-orange-700 transition-colors"
                      >
                        选择
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );

            if (replaceMode) {
              return (
                <div key={recipe.id} className="cursor-pointer" onClick={() => handleSelect(recipe)}>
                  {card}
                </div>
              );
            }

            return (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                {card}
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <div className="text-5xl mb-4">&#128214;</div>
          <p className="text-brand-secondary mb-1">还没有食谱</p>
          <Link href="/recipes/add" className="text-orange-500 text-sm">添加第一个食谱</Link>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[90vw] max-w-md rounded-xl">
          <DialogTitle className="text-center text-brand-text">确认替换</DialogTitle>
          <div className="text-center text-sm text-brand-secondary mt-2">
            <p>
              确认用「<span className="font-bold text-brand-text">{pendingRecipe?.title}</span>」替换「<span className="font-bold text-brand-text">{replaceDishName}</span>」？
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="secondary"
              className="flex-1 h-10"
              onClick={() => setConfirmOpen(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1 h-10"
              onClick={handleConfirmReplace}
              disabled={replacing}
            >
              {replacing ? '替换中...' : '确认'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div className="p-4 space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    }>
      <RecipesContent />
    </Suspense>
  );
}
