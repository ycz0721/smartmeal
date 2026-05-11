import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reconcileShoppingList } from '@/lib/shopping-calculator';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { recipeId, ingredients: fallbackIngredients } = await req.json();
    if (!recipeId) {
      return NextResponse.json({ error: '缺少食谱ID' }, { status: 400 });
    }

    let ingredients: any[];
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (recipe && recipe.userId === session.user.id) {
      ingredients = JSON.parse(recipe.ingredients);
    } else if (fallbackIngredients && Array.isArray(fallbackIngredients)) {
      ingredients = fallbackIngredients;
    } else {
      return NextResponse.json({ error: '食谱未找到' }, { status: 404 });
    }

    let deducted = 0;

    for (const ing of ingredients) {
      const pantryItem = await prisma.pantryItem.findFirst({
        where: { userId: session.user.id, name: ing.name, unit: ing.unit },
      });
      if (!pantryItem) continue;

      const newAmount = Math.round((pantryItem.amount - (ing.amount || 0)) * 10) / 10;
      if (newAmount <= 0.05) {
        await prisma.pantryItem.delete({ where: { id: pantryItem.id } });
      } else {
        await prisma.pantryItem.update({
          where: { id: pantryItem.id },
          data: { amount: newAmount },
        });
      }
      deducted++;
    }

    // Mark this recipe as cooked in the current plan, so it won't be counted again
    const plan = await prisma.mealPlan.findFirst({
      where: { userId: session.user.id, isCurrent: true },
    });
    if (plan) {
      let cooked: string[] = [];
      try { cooked = JSON.parse(plan.cookedRecipes || '[]'); } catch {}
      if (!cooked.includes(recipeId)) {
        cooked.push(recipeId);
        await prisma.mealPlan.update({
          where: { id: plan.id },
          data: { cookedRecipes: JSON.stringify(cooked) },
        });
      }
    }

    // Refresh shopping list (now excluding cooked dishes from calculation)
    const shoppingItems = await reconcileShoppingList(session.user.id);

    return NextResponse.json({
      deducted,
      message: `已从冰箱扣除 ${deducted} 种食材`,
      shoppingCount: shoppingItems.length,
    });
  } catch (error) {
    console.error('烹饪扣减失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
