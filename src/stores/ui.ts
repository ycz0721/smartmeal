import { create } from 'zustand';

type UIState = {
  quickActionsOpen: boolean;
  setQuickActionsOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>()((set) => ({
  quickActionsOpen: false,
  setQuickActionsOpen: (quickActionsOpen) => set({ quickActionsOpen }),
}));
