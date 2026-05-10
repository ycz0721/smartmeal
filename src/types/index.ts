export type Ingredient = {
  name: string;
  amount: number;
  unit: string;
};

export type Recipe = {
  id: string;
  userId: string;
  title: string;
  description: string;
  servings: number;
  cookTime: number;
  imageUrl?: string;
  tags: string;
  ingredients: string;
  steps: string;
  source?: string;
  favorite: boolean;
  createdAt: Date;
};

export type MealPlan = {
  id: string;
  userId: string;
  weekStart: Date;
  isCurrent: boolean;
  meals: string;
  createdAt: Date;
};

export type UserPreferences = {
  cuisines: string[];
  intolerances: string[];
  dietary: string[];
  familySize: number;
};

export type Meal = {
  day: string;
  breakfast?: RecipeData;
  lunch?: RecipeData;
  dinner?: RecipeData;
};

export type RecipeData = {
  name: string;
  ingredients: Ingredient[];
  steps: string[];
  cookTime: number;
  tags: string[];
};

export type PantryItem = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  unit: string;
};

export type ShoppingItem = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
};
