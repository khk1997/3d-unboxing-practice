import { create } from 'zustand';
import { chests, lootTables } from '@/data/chests';
import type { Chest, Reward } from '@/data/chests';

type OpeningState = 'idle' | 'sleeping' | 'revealed';

const initialGems = 2400;
const initialFreeOpenCount = 1;
const dailyLuckyKingRewardId = 'daily-lucky-king';
const luckBoostRewardId = 'luck-plus-one';
const bossBlessingRewardId = 'boss-blessing';
const halfPriceRewardId = 'one-more-pull';
const chieftainPrizeRewardId = 'chieftain-prize';
const almostJackpotRewardId = 'almost-jackpot';
const sleepingChestRewardId = 'sleeping-chest';
const mysteryComfortPrizeRewardId = 'mystery-comfort-prize';
const chieftainPityPenalty = 2;
const almostJackpotPityBonus = 1;
const bossBlessingFreeOpenBonus = 1;
const maxFreeOpenCount = 3;
const halfPriceDiscountRate = 0.5;
const halfPriceBonus = 1;
const maxDiscountOpenCount = 3;
const sleepingOpenBonus = 1;
const maxSleepingOpenCount = 1;
const sleepingOpenDelay = 3000;
const dailyLuckyKingGemBonus = 2400;
const ssrRatesByBoostLevel = [3, 7, 10] as const;
const ssrPityTarget = 27;

export type SsrBoostLevel = 0 | 1 | 2;

export type RewardHistoryItem = {
  id: string;
  chestId: number;
  openedNumber: number;
  reward: Reward;
  pityBonus?: number;
  pityPenalty?: number;
  freeOpenBonus?: number;
  discountBonus?: number;
  discountUsed?: boolean;
  sleepingBonus?: number;
  sleepingUsed?: boolean;
};

type LootBoxState = {
  gems: number;
  freeOpenCount: number;
  discountOpenCount: number;
  sleepingOpenCount: number;
  openedCount: number;
  openedChestIds: number[];
  openingState: OpeningState;
  selectedChestId: number | null;
  revealedReward: Reward | null;
  rewardHistory: RewardHistoryItem[];
  ssrBoostLevel: SsrBoostLevel;
  pendingSsrBoostLevel: SsrBoostLevel;
  ssrRate: number;
  pendingSsrRate: number;
  pullsSinceSsr: number;
  ssrPityTarget: number;
  canOpenChest: (chest: Chest) => boolean;
  openChest: (chestId: number) => void;
  claimReward: () => void;
};

function getSsrRate(boostLevel: SsrBoostLevel) {
  return ssrRatesByBoostLevel[boostLevel];
}

function getNextBoostLevel(boostLevel: SsrBoostLevel): SsrBoostLevel {
  return Math.min(boostLevel + 1, 2) as SsrBoostLevel;
}

function buildBoostedLootTable(table: typeof lootTables[string], ssrRate: number) {
  const ssrRewards = table.filter((reward) => reward.rarity === 'SSR');
  const standardRewards = table.filter((reward) => reward.rarity !== 'SSR');

  if (!ssrRewards.length || ssrRate <= 0) {
    return table;
  }

  const standardTotal = standardRewards.reduce((total, reward) => total + reward.weight, 0);
  const ssrTotal = ssrRewards.reduce((total, reward) => total + reward.weight, 0);
  const standardRate = 100 - ssrRate;

  return [
    ...standardRewards.map((reward) => ({
      ...reward,
      weight: (reward.weight / standardTotal) * standardRate,
    })),
    ...ssrRewards.map((reward) => ({
      ...reward,
      weight: (reward.weight / ssrTotal) * ssrRate,
    })),
  ];
}

function pickGuaranteedSsrReward(table: typeof lootTables[string]): Reward | null {
  const ssrRewards = table.filter((reward) => reward.rarity === 'SSR');

  if (!ssrRewards.length) {
    return null;
  }

  const totalWeight = ssrRewards.reduce((total, reward) => total + reward.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const reward of ssrRewards) {
    roll -= reward.weight;

    if (roll <= 0) {
      return {
        id: reward.id,
        name: reward.name,
        rarity: reward.rarity,
      };
    }
  }

  const fallbackReward = ssrRewards[ssrRewards.length - 1];

  return {
    id: fallbackReward.id,
    name: fallbackReward.name,
    rarity: fallbackReward.rarity,
  };
}

function pickReward(chest: Chest, ssrBoostLevel: SsrBoostLevel, pullsSinceSsr: number): Reward {
  const table = lootTables[chest.lootTableId];

  if (!table?.length) {
    return {
      id: `chest-${chest.id}-fallback`,
      name: chest.reward,
      rarity: chest.rarity as Reward['rarity'],
    };
  }

  if (pullsSinceSsr + 1 >= ssrPityTarget) {
    const guaranteedReward = pickGuaranteedSsrReward(table);

    if (guaranteedReward) {
      return guaranteedReward;
    }
  }

  const boostedTable = buildBoostedLootTable(table, getSsrRate(ssrBoostLevel));
  const totalWeight = boostedTable.reduce((total, reward) => total + reward.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const reward of boostedTable) {
    roll -= reward.weight;

    if (roll <= 0) {
      return {
        id: reward.id,
        name: reward.name,
        rarity: reward.rarity,
      };
    }
  }

  const fallbackReward = boostedTable[boostedTable.length - 1];

  return {
    id: fallbackReward.id,
    name: fallbackReward.name,
    rarity: fallbackReward.rarity,
  };
}

export const useLootBoxStore = create<LootBoxState>((set, get) => ({
  gems: initialGems,
  freeOpenCount: initialFreeOpenCount,
  discountOpenCount: 0,
  sleepingOpenCount: 0,
  openedCount: 0,
  openedChestIds: [],
  openingState: 'idle',
  selectedChestId: null,
  revealedReward: null,
  rewardHistory: [],
  ssrBoostLevel: 0,
  pendingSsrBoostLevel: 0,
  ssrRate: getSsrRate(0),
  pendingSsrRate: getSsrRate(0),
  pullsSinceSsr: 0,
  ssrPityTarget,
  canOpenChest: (chest) =>
    get().openingState === 'idle' &&
    (get().freeOpenCount > 0 ||
      get().sleepingOpenCount > 0 ||
      get().gems >= chest.cost * (get().discountOpenCount > 0 ? halfPriceDiscountRate : 1)),
  openChest: (chestId) => {
    const chest = chests.find((item) => item.id === chestId);

    if (!chest || get().openedChestIds.includes(chestId) || !get().canOpenChest(chest)) {
      return;
    }

    const hasFreeOpen = get().freeOpenCount > 0;
    const hasSleepingOpen = !hasFreeOpen && get().sleepingOpenCount > 0;
    const hasDiscountOpen = !hasFreeOpen && !hasSleepingOpen && get().discountOpenCount > 0;
    const gemCost =
      hasFreeOpen || hasSleepingOpen ? 0 : chest.cost * (hasDiscountOpen ? halfPriceDiscountRate : 1);
    const openedCount = get().openedCount + 1;
    const reward = pickReward(chest, get().ssrBoostLevel, get().pullsSinceSsr);
    const selectedChestId = chestId;
    const openedChestIds = [...get().openedChestIds, chestId];
    const spentSleepingOpenCount = hasSleepingOpen
      ? Math.max(get().sleepingOpenCount - 1, 0)
      : get().sleepingOpenCount;
    const spentFreeOpenCount = hasFreeOpen ? get().freeOpenCount - 1 : get().freeOpenCount;
    const discountOpenCount = hasDiscountOpen
      ? Math.max(get().discountOpenCount - 1, 0)
      : get().discountOpenCount;

    set({
      gems: get().gems - gemCost,
      freeOpenCount: spentFreeOpenCount,
      discountOpenCount,
      sleepingOpenCount: spentSleepingOpenCount,
      openedChestIds,
      openingState: hasSleepingOpen ? 'sleeping' : 'revealed',
      selectedChestId,
      revealedReward: hasSleepingOpen ? null : reward,
    });

    const revealReward = () => {
      const didPullSsr = reward.rarity === 'SSR';
      const pityBonus =
        !didPullSsr && reward.id === almostJackpotRewardId ? almostJackpotPityBonus : 0;
      const pityPenalty =
        !didPullSsr && reward.id === chieftainPrizeRewardId ? chieftainPityPenalty : 0;
      const mysteryComfortOptions =
        reward.id === mysteryComfortPrizeRewardId
          ? [
              get().freeOpenCount < maxFreeOpenCount ? 'free' : null,
              get().discountOpenCount < maxDiscountOpenCount ? 'discount' : null,
            ].filter(Boolean)
          : [];
      const mysteryComfortType = mysteryComfortOptions.length
        ? mysteryComfortOptions[Math.floor(Math.random() * mysteryComfortOptions.length)]
        : null;
      const freeOpenBonus =
        (reward.id === bossBlessingRewardId || mysteryComfortType === 'free') &&
        get().freeOpenCount < maxFreeOpenCount
          ? bossBlessingFreeOpenBonus
          : 0;
      const discountBonus =
        (reward.id === halfPriceRewardId || mysteryComfortType === 'discount') &&
        get().discountOpenCount < maxDiscountOpenCount
          ? halfPriceBonus
          : 0;
      const sleepingBonus =
        reward.id === sleepingChestRewardId && get().sleepingOpenCount < maxSleepingOpenCount
          ? sleepingOpenBonus
          : 0;
      const gemBonus = reward.id === dailyLuckyKingRewardId ? dailyLuckyKingGemBonus : 0;
      const pendingSsrBoostLevel = didPullSsr
        ? 0
        : reward.id === luckBoostRewardId
          ? getNextBoostLevel(get().pendingSsrBoostLevel)
          : get().pendingSsrBoostLevel;
      const ssrBoostLevel = didPullSsr ? 0 : get().ssrBoostLevel;
      const pullsSinceSsr = didPullSsr
        ? 0
        : Math.min(
            Math.max(get().pullsSinceSsr + 1 + pityBonus - pityPenalty, 0),
            ssrPityTarget,
          );

      set({
        openedCount,
        openingState: 'revealed',
        selectedChestId,
        revealedReward: reward,
        gems: get().gems + gemBonus,
        freeOpenCount: Math.min(get().freeOpenCount + freeOpenBonus, maxFreeOpenCount),
        discountOpenCount: Math.min(
          get().discountOpenCount + discountBonus,
          maxDiscountOpenCount,
        ),
        sleepingOpenCount: Math.min(
          get().sleepingOpenCount + sleepingBonus,
          maxSleepingOpenCount,
        ),
      ssrBoostLevel,
      ssrRate: getSsrRate(ssrBoostLevel),
      pendingSsrBoostLevel,
      pendingSsrRate: getSsrRate(pendingSsrBoostLevel),
      pullsSinceSsr,
      rewardHistory: [
        {
          id: `${openedCount}-${chestId}-${reward.id}`,
          chestId,
          openedNumber: openedCount,
          reward,
          pityBonus: pityBonus || undefined,
          pityPenalty: pityPenalty || undefined,
          freeOpenBonus: freeOpenBonus || undefined,
          discountBonus: discountBonus || undefined,
          discountUsed: hasDiscountOpen || undefined,
          sleepingBonus: sleepingBonus || undefined,
          sleepingUsed: hasSleepingOpen || undefined,
        },
        ...get().rewardHistory,
      ],
    });
    };

    if (hasSleepingOpen) {
      window.setTimeout(revealReward, sleepingOpenDelay);
      return;
    }

    revealReward();
  },
  claimReward: () =>
    set((state) => {
      const shouldResetBoard = state.openedChestIds.length >= chests.length;
      const ssrBoostLevel = shouldResetBoard
        ? state.pendingSsrBoostLevel
        : state.ssrBoostLevel;

      return {
        openingState: 'idle',
        selectedChestId: null,
        revealedReward: null,
        openedChestIds: shouldResetBoard ? [] : state.openedChestIds,
        gems: shouldResetBoard ? Math.max(state.gems, initialGems) : state.gems,
        freeOpenCount: shouldResetBoard
          ? Math.min(Math.max(state.freeOpenCount, initialFreeOpenCount), maxFreeOpenCount)
          : state.freeOpenCount,
        discountOpenCount: state.discountOpenCount,
        ssrBoostLevel,
        ssrRate: getSsrRate(ssrBoostLevel),
      };
    }),
}));
