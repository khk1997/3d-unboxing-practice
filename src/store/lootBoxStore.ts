import { create } from 'zustand';
import { chests, lootTables, rewardMilestones } from '@/data/chests';
import type { Chest, Reward } from '@/data/chests';

type OpeningState = 'idle' | 'revealed';

type LootBoxState = {
  gems: number;
  freeOpenCount: number;
  openedCount: number;
  openedChestIds: number[];
  openingState: OpeningState;
  selectedChestId: number | null;
  revealedReward: Reward | null;
  nextMilestone: typeof rewardMilestones[number] | null;
  canOpenChest: (chest: Chest) => boolean;
  openChest: (chestId: number) => void;
  claimReward: () => void;
};

function pickReward(chest: Chest): Reward {
  const table = lootTables[chest.lootTableId];

  if (!table?.length) {
    return {
      id: `chest-${chest.id}-fallback`,
      name: chest.reward,
      rarity: chest.rarity as Reward['rarity'],
    };
  }

  const totalWeight = table.reduce((total, reward) => total + reward.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const reward of table) {
    roll -= reward.weight;

    if (roll <= 0) {
      return {
        id: reward.id,
        name: reward.name,
        rarity: reward.rarity,
      };
    }
  }

  const fallbackReward = table[table.length - 1];

  return {
    id: fallbackReward.id,
    name: fallbackReward.name,
    rarity: fallbackReward.rarity,
  };
}

function getNextMilestone(openedCount: number) {
  return rewardMilestones.find((milestone) => milestone.opensRequired > openedCount) ?? null;
}

export const useLootBoxStore = create<LootBoxState>((set, get) => ({
  gems: 2480,
  freeOpenCount: 1,
  openedCount: 0,
  openedChestIds: [],
  openingState: 'idle',
  selectedChestId: null,
  revealedReward: null,
  nextMilestone: getNextMilestone(0),
  canOpenChest: (chest) => get().freeOpenCount > 0 || get().gems >= chest.cost,
  openChest: (chestId) => {
    const chest = chests.find((item) => item.id === chestId);

    if (!chest || get().openedChestIds.includes(chestId) || !get().canOpenChest(chest)) {
      return;
    }

    const hasFreeOpen = get().freeOpenCount > 0;
    const openedCount = get().openedCount + 1;

    set({
      gems: hasFreeOpen ? get().gems : get().gems - chest.cost,
      freeOpenCount: hasFreeOpen ? get().freeOpenCount - 1 : get().freeOpenCount,
      openedCount,
      openedChestIds: [...get().openedChestIds, chestId],
      openingState: 'revealed',
      selectedChestId: chestId,
      revealedReward: pickReward(chest),
      nextMilestone: getNextMilestone(openedCount),
    });
  },
  claimReward: () =>
    set({
      openingState: 'idle',
      selectedChestId: null,
      revealedReward: null,
    }),
}));
