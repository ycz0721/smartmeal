import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserPrefsState = {
  cuisines: string[];
  intolerances: string[];
  dietary: string[];
  familySize: number;
  setCuisines: (cuisines: string[]) => void;
  setIntolerances: (intolerances: string[]) => void;
  setDietary: (dietary: string[]) => void;
  setFamilySize: (size: number) => void;
};

export const useUserPrefs = create<UserPrefsState>()(
  persist(
    (set) => ({
      cuisines: [],
      intolerances: [],
      dietary: [],
      familySize: 2,
      setCuisines: (cuisines) => set({ cuisines }),
      setIntolerances: (intolerances) => set({ intolerances }),
      setDietary: (dietary) => set({ dietary }),
      setFamilySize: (familySize) => set({ familySize }),
    }),
    {
      name: 'user-prefs',
    }
  )
);
