type Ingredient = {
  name: string;
  amount: number;
  unit: string;
};

const unitConversions: Record<string, { base: string; factor: number }> = {
  // 重量
  kg: { base: 'g', factor: 1000 },
  g: { base: 'g', factor: 1 },
  斤: { base: 'g', factor: 500 },
  两: { base: 'g', factor: 50 },
  // 体积
  l: { base: 'ml', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  勺: { base: 'ml', factor: 15 },
  茶勺: { base: 'ml', factor: 5 },
  杯: { base: 'ml', factor: 250 },
  // 数量
  个: { base: '个', factor: 1 },
  根: { base: '个', factor: 1 },
  片: { base: '个', factor: 1 },
  块: { base: '个', factor: 1 },
  瓣: { base: '个', factor: 1 },
};

export function normalizeUnit(amount: number, unit: string): { amount: number; unit: string } {
  const conversion = unitConversions[unit];
  if (!conversion) {
    return { amount, unit };
  }
  return {
    amount: amount * conversion.factor,
    unit: conversion.base,
  };
}

export function aggregateIngredients(ingredients: Ingredient[]): Ingredient[] {
  const map = new Map<string, { amount: number; unit: string }>();

  for (const ing of ingredients) {
    const normalized = normalizeUnit(ing.amount, ing.unit);
    const key = `${ing.name}-${normalized.unit}`;
    const existing = map.get(key);

    if (existing) {
      map.set(key, { amount: existing.amount + normalized.amount, unit: normalized.unit });
    } else {
      map.set(key, normalized);
    }
  }

  return Array.from(map.entries()).map(([key, value]) => ({
    name: key.split('-')[0],
    amount: value.amount,
    unit: value.unit,
  }));
}
