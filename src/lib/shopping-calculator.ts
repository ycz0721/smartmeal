import { prisma } from '@/lib/prisma';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface AggregatedIngredient extends Ingredient {
  _key: string;
}

function normalize(s: string): string {
  return s.trim();
}

function key(name: string, unit: string): string {
  return `${normalize(name)}_${unit}`;
}

/**
 * Extract all ingredients from the current meal plan, aggregated by name+unit.
 */
function parseCookedRecipes(cookedRecipesJson: string): Set<string> {
  try {
    const arr = JSON.parse(cookedRecipesJson);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function extractPlanIngredients(mealsJson: string, cookedRecipeIds?: Set<string>): AggregatedIngredient[] {
  const map: Record<string, AggregatedIngredient> = {};
  const skip = cookedRecipeIds || new Set();

  try {
    const days = JSON.parse(mealsJson);
    if (!Array.isArray(days)) return [];

    for (const day of days) {
      const mealTypes = Object.keys(day).filter((k: string) => k !== 'day');

      for (const mt of mealTypes) {
        const mealData = day[mt];
        const dishes = mealData?.dishes || [];

        for (const dish of dishes) {
          if (skip.has(dish.recipeId)) continue;
          const ingredients: Ingredient[] = dish.ingredients || [];
          for (const ing of ingredients) {
            const k = key(ing.name, ing.unit);
            if (map[k]) {
              map[k].amount += ing.amount || 0;
            } else {
              map[k] = {
                _key: k,
                name: normalize(ing.name),
                amount: ing.amount || 0,
                unit: ing.unit || '份',
              };
            }
          }
        }
      }
    }
  } catch {
    return [];
  }

  return Object.values(map);
}

/**
 * Subtract pantry stock from needed ingredients.
 * Returns only items where the shortfall is > 0.1.
 */
function subtractPantry(
  needed: AggregatedIngredient[],
  pantry: { name: string; amount: number; unit: string }[],
): Ingredient[] {
  const pantryMap: Record<string, number> = {};
  for (const item of pantry) {
    const k = key(item.name, item.unit);
    pantryMap[k] = (pantryMap[k] || 0) + item.amount;
  }

  const result: Ingredient[] = [];
  for (const ing of needed) {
    const stock = pantryMap[ing._key] || 0;
    const shortfall = Math.round((ing.amount - stock) * 10) / 10;
    if (shortfall > 0.05) {
      result.push({ name: ing.name, amount: shortfall, unit: ing.unit });
    }
  }

  return result;
}

/**
 * Rebuild the shopping list from scratch:
 * 1. Delete all existing ShoppingItems for the user
 * 2. Calculate needed ingredients from current plan
 * 3. Subtract pantry stock
 * 4. Insert shortfall items
 */
export async function reconcileShoppingList(userId: string): Promise<
  { id: string; name: string; amount: number; unit: string; checked: boolean }[]
> {
  // Delete all existing shopping items
  await prisma.shoppingItem.deleteMany({ where: { userId } });

  // Get current plan
  const plan = await prisma.mealPlan.findFirst({
    where: { userId, isCurrent: true },
  });

  if (!plan) return [];

  // Parse cooked recipes and exclude them from ingredient calculation
  const cookedRecipeIds = parseCookedRecipes(plan.cookedRecipes);

  // Extract needed ingredients (only from uncooked dishes)
  const needed = extractPlanIngredients(plan.meals, cookedRecipeIds);

  // Get pantry stock
  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId },
    select: { name: true, amount: true, unit: true },
  });

  // Calculate shortfall
  const shortfall = subtractPantry(needed, pantryItems);

  // Insert shortfall as new shopping items
  const created: { id: string; name: string; amount: number; unit: string; checked: boolean }[] = [];
  for (const ing of shortfall) {
    const item = await prisma.shoppingItem.create({
      data: {
        userId,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
      },
    });
    created.push({ id: item.id, name: item.name, amount: item.amount, unit: item.unit, checked: item.checked });
  }

  return created;
}
