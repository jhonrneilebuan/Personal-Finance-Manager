import { create } from 'zustand';

type FinanceState = {
  revision: number;
  markChanged: () => void;
};

export const useFinanceStore = create<FinanceState>((set) => ({
  revision: 0,
  markChanged: () => set((state) => ({ revision: state.revision + 1 })),
}));

