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

    const body = await req.json();
    const { planId, dayIndex, mealType, dishIndex, newRecipeId } = body;

    if (dayIndex === undefined || !mealType || dishIndex === undefined || !newRecipeId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    // Find the plan
    const plan = await prisma.mealPlan.findFirst({
      where: { id: planId || '', userId: session.user.id },
    });
    if (!plan) {
      return NextResponse.json({ error: '计划不存在' }, { status: 404 });
    }

    // Find the new recipe
    const newRecipe = await prisma.recipe.findFirst({
      where: { id: newRecipeId, userId: session.user.id },
    });
    if (!newRecipe) {
      return NextResponse.json({ error: '食谱不存在' }, { status: 404 });
    }

    // Parse and update meals
    let meals: any[];
    try {
      meals = JSON.parse(plan.meals);
    } catch {
      return NextResponse.json({ error: '计划数据异常' }, { status: 500 });
    }

    const dayMeal = meals[dayIndex];
    if (!dayMeal || !dayMeal[mealType]?.dishes) {
      return NextResponse.json({ error: '餐次不存在' }, { status: 404 });
    }

    const dishes = dayMeal[mealType].dishes;
    if (!dishes[dishIndex]) {
      return NextResponse.json({ error: '菜品不存在' }, { status: 404 });
    }

    const oldDishName = dishes[dishIndex].name;

    // Parse new recipe data
    let newIngredients: any[] = [];
    try {
      newIngredients = JSON.parse(newRecipe.ingredients);
    } catch {}

    let newSteps: string[] = [];
    try {
      newSteps = JSON.parse(newRecipe.steps);
    } catch {}

    let newTags: string[] = [];
    try {
      newTags = newRecipe.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    } catch {}

    // Replace the dish
    dishes[dishIndex] = {
      recipeId: newRecipe.id,
      name: newRecipe.title,
      cookTime: newRecipe.cookTime || 25,
      imageUrl: newRecipe.imageUrl || undefined,
      tags: newTags,
      ingredients: newIngredients,
      steps: newSteps,
    };

    // Save updated plan
    await prisma.mealPlan.update({
      where: { id: plan.id },
      data: { meals: JSON.stringify(meals) },
    });

    // Reconcile shopping list
    const shoppingItems = await reconcileShoppingList(session.user.id);

    return NextResponse.json({
      success: true,
      oldDishName,
      newDishName: newRecipe.title,
      shoppingCount: shoppingItems.length,
    });
  } catch (error) {
    console.error('替换菜品失败:', error);
    return NextResponse.json({ error: '替换失败' }, { status: 500 });
  }
}
