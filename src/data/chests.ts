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

export type RewardMilestone = {
  opensRequired: number;
  reward: Reward;
};

const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const commonChestImagePath = assetPath('/images/chests/common-chest.webp');
const hoverChestImagePath = assetPath('/images/chests/hover-chest.webp');
const openedChestImagePath = assetPath('/images/chests/hover-chest2.webp');

export const lootTables: Record<string, LootTableEntry[]> = {
  standard: [
    { id: 'verdant-key', name: 'Verdant Key', rarity: 'R', weight: 40 },
    { id: 'gold-ticket', name: 'Gold Ticket', rarity: 'R', weight: 30 },
    { id: 'tide-core', name: 'Tide Core', rarity: 'SR', weight: 16 },
    { id: 'crimson-sigil', name: 'Crimson Sigil', rarity: 'SR', weight: 10 },
    { id: 'solar-blade', name: 'Solar Blade', rarity: 'SSR', weight: 3 },
    { id: 'nova-crown', name: 'Nova Crown', rarity: 'SSR', weight: 1 },
  ],
};

export const rewardMilestones: RewardMilestone[] = [
  {
    opensRequired: 5,
    reward: { id: 'aqua-rune', name: 'Aqua Rune', rarity: 'SR' },
  },
  {
    opensRequired: 10,
    reward: { id: 'moon-charm', name: 'Moon Charm', rarity: 'SSR' },
  },
];

export const chests: Chest[] = [
  {
    id: 1,
    tone: 'from-amber-300 to-orange-600',
    cost: 300,
    currency: 'gems',
    lootTableId: 'standard',
    reward: 'Solar Blade',
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
    reward: 'Tide Core',
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
    reward: 'Moon Charm',
    rarity: 'SSR',
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
    reward: 'Verdant Key',
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
    reward: 'Crimson Sigil',
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
    reward: 'Starlit Orb',
    rarity: 'SSR',
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
    reward: 'Gold Ticket',
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
    reward: 'Aqua Rune',
    rarity: 'SR',
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
    reward: 'Nova Crown',
    rarity: 'SSR',
    imagePath: commonChestImagePath,
    hoverImagePath: hoverChestImagePath,
    openedImagePath: openedChestImagePath,
  },
];
