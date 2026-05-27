import { create } from 'zustand';

type LootBoxState = {
  selectedChestId: number | null;
  selectChest: (chestId: number) => void;
  clearSelectedChest: () => void;
};

export const useLootBoxStore = create<LootBoxState>((set) => ({
  selectedChestId: null,
  selectChest: (chestId) => set({ selectedChestId: chestId }),
  clearSelectedChest: () => set({ selectedChestId: null }),
}));
