export type Chest = {
  id: number;
  tone: string;
  cost: number;
  currency: 'gems';
  lootTableId: string;
  reward: string;
  rarity: string;
  imagePath?: string;
  hoverImagePath?: string;
  openedImagePath?: string;
};

export type Reward = {
  id: string;
  name: string;
  rarity: 'R' | 'SR' | 'SSR';
};

export type LootTableEntry = Reward & {
  weight: number;
};

const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const commonChestImagePath = assetPath('/images/chests/common-chest.webp');
const hoverChestImagePath = assetPath('/images/chests/hover-chest.webp');
const openedChestImagePath = assetPath('/images/chests/hover-chest2.webp');

export const lootTables: Record<string, LootTableEntry[]> = {
  standard: [
    { id: 'air-gift-pack', name: '空氣禮包', rarity: 'R', weight: 24 },
    { id: 'almost-jackpot', name: '差一點中大獎', rarity: 'R', weight: 18 },
    { id: 'sleeping-chest', name: '寶箱睡著了', rarity: 'R', weight: 14 },
    { id: 'mystery-comfort-prize', name: '神秘安慰獎', rarity: 'R', weight: 12 },
    { id: 'luck-plus-one', name: '幸運 +1', rarity: 'SR', weight: 11 },
    { id: 'one-more-pull', name: '下一抽5折', rarity: 'SR', weight: 9 },
    { id: 'boss-blessing', name: '老闆的祝福', rarity: 'SR', weight: 6 },
    { id: 'chieftain-prize', name: '非洲酋長獎', rarity: 'SR', weight: 3 },
    { id: 'daily-lucky-king', name: '今日歐皇', rarity: 'SSR', weight: 3 },
  ],
};

export const chests: Chest[] = [
  {
    id: 1,
    tone: 'from-amber-300 to-orange-600',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '今日歐皇',
    rarity: 'SSR',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
  {
    id: 2,
    tone: 'from-cyan-300 to-blue-700',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '老闆的祝福',
    rarity: 'SR',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
  {
    id: 3,
    tone: 'from-fuchsia-300 to-purple-700',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '非洲酋長獎',
    rarity: 'SR',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
  {
    id: 4,
    tone: 'from-lime-300 to-emerald-700',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '空氣禮包',
    rarity: 'R',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
  {
    id: 5,
    tone: 'from-rose-300 to-red-700',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '幸運 +1',
    rarity: 'SR',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
  {
    id: 6,
    tone: 'from-sky-200 to-indigo-700',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '下一抽5折',
    rarity: 'SR',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
  {
    id: 7,
    tone: 'from-yellow-200 to-amber-700',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '差一點中大獎',
    rarity: 'R',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
  {
    id: 8,
    tone: 'from-teal-200 to-cyan-700',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '寶箱睡著了',
    rarity: 'R',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
  {
    id: 9,
    tone: 'from-violet-200 to-pink-700',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: '神秘安慰獎',
    rarity: 'R',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
];
