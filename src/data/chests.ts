export type Chest = {
  id: number;
  tone: string;
  reward: string;
  rarity: string;
  imagePath?: string;
};

export const chests: Chest[] = [
  {
    id: 1,
    tone: 'from-amber-300 to-orange-600',
    reward: 'Solar Blade',
    rarity: 'SSR',
    imagePath: '/images/chests/epic-chest.png',
  },
  {
    id: 2,
    tone: 'from-cyan-300 to-blue-700',
    reward: 'Tide Core',
    rarity: 'SR',
    imagePath: '/images/chests/rare-chest.png',
  },
  {
    id: 3,
    tone: 'from-fuchsia-300 to-purple-700',
    reward: 'Moon Charm',
    rarity: 'SSR',
    imagePath: '/images/chests/epic-chest.png',
  },
  {
    id: 4,
    tone: 'from-lime-300 to-emerald-700',
    reward: 'Verdant Key',
    rarity: 'R',
    imagePath: '/images/chests/common-chest.png',
  },
  {
    id: 5,
    tone: 'from-rose-300 to-red-700',
    reward: 'Crimson Sigil',
    rarity: 'SR',
    imagePath: '/images/chests/rare-chest.png',
  },
  {
    id: 6,
    tone: 'from-sky-200 to-indigo-700',
    reward: 'Starlit Orb',
    rarity: 'SSR',
    imagePath: '/images/chests/epic-chest.png',
  },
  {
    id: 7,
    tone: 'from-yellow-200 to-amber-700',
    reward: 'Gold Ticket',
    rarity: 'R',
    imagePath: '/images/chests/common-chest.png',
  },
  {
    id: 8,
    tone: 'from-teal-200 to-cyan-700',
    reward: 'Aqua Rune',
    rarity: 'SR',
    imagePath: '/images/chests/rare-chest.png',
  },
  {
    id: 9,
    tone: 'from-violet-200 to-pink-700',
    reward: 'Nova Crown',
    rarity: 'SSR',
    imagePath: '/images/chests/epic-chest.png',
  },
];
