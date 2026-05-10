import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateMealPlan } from '@/lib/ai';
import { reconcileShoppingList } from '@/lib/shopping-calculator';

export const runtime = 'nodejs';

const MEAL_TYPE_NAMES: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

function generateDefaultMeals(days: number, mealTypes: string[], dishCombo: string) {
  const mealTemplates = [
    { name: '番茄炒蛋', cookTime: 15, tags: ['快手菜', '家常'], type: '素' },
    { name: '宫保鸡丁', cookTime: 25, tags: ['中餐', '经典'], type: '荤' },
    { name: '清蒸鲈鱼', cookTime: 20, tags: ['海鲜', '健康'], type: '荤' },
    { name: '麻婆豆腐', cookTime: 15, tags: ['川菜', '素食'], type: '素' },
    { name: '红烧肉', cookTime: 40, tags: ['荤菜', '经典'], type: '荤' },
    { name: '蒜蓉西兰花', cookTime: 10, tags: ['素食', '健康'], type: '素' },
    { name: '糖醋排骨', cookTime: 35, tags: ['荤菜', '经典'], type: '荤' },
    { name: '蛋炒饭', cookTime: 10, tags: ['快手菜', '主食'], type: '素' },
    { name: '酸辣土豆丝', cookTime: 10, tags: ['快手菜', '素食'], type: '素' },
    { name: '回锅肉', cookTime: 25, tags: ['川菜', '荤菜'], type: '荤' },
    { name: '清炒时蔬', cookTime: 8, tags: ['素食', '健康'], type: '素' },
    { name: '红烧茄子', cookTime: 15, tags: ['素食', '家常'], type: '素' },
    { name: '水煮鱼', cookTime: 30, tags: ['川菜', '海鲜'], type: '荤' },
    { name: '可乐鸡翅', cookTime: 25, tags: ['荤菜', '快手菜'], type: '荤' },
    { name: '干煸四季豆', cookTime: 15, tags: ['川菜', '素食'], type: '素' },
    { name: '鱼香肉丝', cookTime: 20, tags: ['川菜', '荤菜'], type: '荤' },
    { name: '蚝油生菜', cookTime: 5, tags: ['素食', '快手菜'], type: '素' },
    { name: '黄焖鸡', cookTime: 30, tags: ['荤菜', '家常'], type: '荤' },
    { name: '凉拌黄瓜', cookTime: 5, tags: ['凉菜', '快手菜'], type: '素' },
    { name: '京酱肉丝', cookTime: 20, tags: ['荤菜', '经典'], type: '荤' },
    { name: '紫菜蛋花汤', cookTime: 5, tags: ['汤品', '快手'], type: '汤' },
    { name: '番茄蛋汤', cookTime: 5, tags: ['汤品', '家常'], type: '汤' },
    { name: '冬瓜排骨汤', cookTime: 40, tags: ['汤品', '营养'], type: '汤' },
    { name: '玉米排骨汤', cookTime: 45, tags: ['汤品', '营养'], type: '汤' },
  ];

  // Determine how many dishes per meal based on dishCombo
  let dishesPerMeal = 2;
  if (dishCombo.includes('一菜一汤')) dishesPerMeal = 2;
  else if (dishCombo.includes('三')) dishesPerMeal = 3;
  else if (dishCombo.includes('两荤')) dishesPerMeal = 3;
  else if (dishCombo.includes('一荤两素')) dishesPerMeal = 3;
  else if (dishCombo.includes('一荤一素')) dishesPerMeal = 2;

  const meals: any[] = [];
  const shuffled = [...mealTemplates].sort(() => Math.random() - 0.5);

  let idx = 0;
  for (let day = 0; day < days; day++) {
    const dayMeal: any = { day: `第${day + 1}天` };

    for (const mt of mealTypes) {
      const dishes = [];
      for (let d = 0; d < dishesPerMeal; d++) {
        const tpl = shuffled[idx % shuffled.length];
        const defaultIngredients = [
          { name: '主料', amount: 300, unit: '克' },
          { name: '盐', amount: 1, unit: '茶匙' },
          { name: '酱油', amount: 2, unit: '汤匙' },
          { name: '食用油', amount: 3, unit: '汤匙' },
          { name: '蒜', amount: 2, unit: '瓣' },
        ];
        dishes.push({
          name: d === 0 ? tpl.name : tpl.name + '（小份）',
          ingredients: defaultIngredients,
          steps: [
            '准备所有食材，清洗干净并切好备用。',
            '锅中倒入食用油，中火加热。',
            '放入主料翻炒至变色。',
            '加入调味料，翻炒均匀。',
            '出锅装盘，趁热享用。',
          ],
          cookTime: tpl.cookTime,
          tags: tpl.tags,
        });
        idx++;
      }
      dayMeal[mt] = { dishes };
    }

    meals.push(dayMeal);
  }

  return meals;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { prompt, cuisines, intolerances, dietary, familySize, days, mealTypes, dishCombo } = body;
    const numDays = days || 6;
    const selectedMealTypes: string[] = mealTypes || ['dinner'];
    const selectedCombo: string = dishCombo || '一荤一素一汤';

    // Fetch recently generated dishes from plan history to avoid repeats
    const recentPlans = await prisma.mealPlan.findMany({
      where: { userId: session.user.id },
      select: { meals: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    const recentDishNames: string[] = [];
    for (const p of recentPlans) {
      try {
        const meals = JSON.parse(p.meals);
        for (const day of meals) {
          for (const key of Object.keys(day)) {
            if (key === 'day') continue;
            for (const dish of day[key]?.dishes || []) {
              if (dish.name) recentDishNames.push(dish.name);
            }
          }
        }
      } catch {}
    }

    // Fetch pantry items to pass to AI
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId: session.user.id },
      select: { name: true, amount: true, unit: true },
    });

    let allMeals;
    try {
      const result = await generateMealPlan({
        prompt: prompt || '',
        cuisines: cuisines || [],
        intolerances: intolerances || [],
        dietary: dietary || [],
        familySize: familySize || 2,
        days: numDays,
        mealTypes: selectedMealTypes,
        dishCombo: selectedCombo,
        recentDishes: recentDishNames,
        pantryItems,
      });
      allMeals = result.meals;
    } catch (aiError) {
      console.error('AI 生成失败，使用本地兜底:', aiError);
      allMeals = generateDefaultMeals(numDays, selectedMealTypes, selectedCombo);
    }

    // Build plan dishes (no DB save — recipes are user-managed only)
    const enrichedMeals = [];
    for (const dayMeal of allMeals) {
      const enrichedDay: any = { day: dayMeal.day };

      for (const mt of selectedMealTypes) {
        const mealData = dayMeal[mt];
        if (!mealData) continue;

        const dishes = mealData.dishes || [mealData];
        const enrichedDishes = [];

        for (const dish of dishes) {

          enrichedDishes.push({
            recipeId: crypto.randomUUID(),
            name: dish.name,
            cookTime: dish.cookTime || 25,
            imageUrl: null,
            tags: dish.tags || ['家常菜'],
            ingredients: dish.ingredients || [],
            steps: dish.steps || [],
          });
        }

        enrichedDay[mt] = {
          type: MEAL_TYPE_NAMES[mt] || mt,
          dishes: enrichedDishes,
        };
      }

      enrichedMeals.push(enrichedDay);
    }

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    await prisma.mealPlan.updateMany({
      where: { userId: session.user.id, isCurrent: true },
      data: { isCurrent: false },
    });

    const plan = await prisma.mealPlan.create({
      data: {
        userId: session.user.id,
        weekStart: startDate,
        isCurrent: true,
        meals: JSON.stringify(enrichedMeals),
      },
    });

    // Auto-reconcile shopping list after generating new plan
    const shoppingItems = await reconcileShoppingList(session.user.id);

    return NextResponse.json({ plan, shoppingCount: shoppingItems.length });
  } catch (error) {
    console.error('生成计划失败:', error);
    return NextResponse.json({ error: '生成计划失败' }, { status: 500 });
  }
}
