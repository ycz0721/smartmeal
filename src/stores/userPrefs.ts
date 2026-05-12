import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserPrefsState = {
  cuisines: string[];
  intolerances: string[];
  dietary: string[];
  familySize: number;
  mealPeople: string;
  setCuisines: (cuisines: string[]) => void;
  setIntolerances: (intolerances: string[]) => void;
  setDietary: (dietary: string[]) => void;
  setFamilySize: (size: number) => void;
  setMealPeople: (mealPeople: string) => void;
};

export const useUserPrefs = create<UserPrefsState>()(
  persist(
    (set) => ({
      cuisines: [],
      intolerances: [],
      dietary: [],
      familySize: 2,
      mealPeople: '',
      setCuisines: (cuisines) => set({ cuisines }),
      setIntolerances: (intolerances) => set({ intolerances }),
      setDietary: (dietary) => set({ dietary }),
      setFamilySize: (familySize) => set({ familySize }),
      setMealPeople: (mealPeople) => set({ mealPeople }),
    }),
    {
      name: 'user-prefs',
    }
  )
);
