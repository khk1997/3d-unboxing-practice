import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChestCard } from '@/components/loot/ChestCard';
import { preloadChestModel } from '@/components/loot/lazyChestModel';
import { RewardModal } from '@/components/loot/RewardModal';
import { chests } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';
import type { Reward } from '@/data/chests';

const loadingMinDuration = 700;
const loadingMaxDuration = 2800;

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    image.src = src;
  });
}

const rarityStyles: Record<Reward['rarity'], { label: string; text: string; badge: string }> = {
  R: {
    label: 'R',
    text: 'text-[#d7b98a]',
    badge: 'border-[#8a6038]/70 bg-[#21130d] text-[#d7b98a]',
  },
  SR: {
    label: 'SR',
    text: 'text-[#f3c96b]',
    badge: 'border-[#c28a35]/70 bg-[#2a1a0c] text-[#f3c96b]',
  },
  SSR: {
    label: 'SSR',
    text: 'text-[#ffe7a6]',
    badge: 'border-[#f0c276]/80 bg-[#38210a] text-[#ffe7a6]',
  },
};

export function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const selectedChestId = useLootBoxStore((state) => state.selectedChestId);
  const gems = useLootBoxStore((state) => state.gems);
  const freeOpenCount = useLootBoxStore((state) => state.freeOpenCount);
  const discountOpenCount = useLootBoxStore((state) => state.discountOpenCount);
  const sleepingOpenCount = useLootBoxStore((state) => state.sleepingOpenCount);
  const openedCount = useLootBoxStore((state) => state.openedCount);
  const rewardHistory = useLootBoxStore((state) => state.rewardHistory);
  const ssrRate = useLootBoxStore((state) => state.ssrRate);
  const pendingSsrRate = useLootBoxStore((state) => state.pendingSsrRate);
  const pullsSinceSsr = useLootBoxStore((state) => state.pullsSinceSsr);
  const ssrPityTarget = useLootBoxStore((state) => state.ssrPityTarget);
  const latestReward = rewardHistory[0];
  const previousRewards = rewardHistory.slice(1, 7);
  const pullsUntilSsrPity = Math.max(ssrPityTarget - 1 - pullsSinceSsr, 0);
  const accumulatedPityChange = useMemo(() => {
    let bonus = 0;
    let penalty = 0;

    for (const item of rewardHistory) {
      if (item.reward.rarity === 'SSR') {
        break;
      }

      bonus += item.pityBonus ?? 0;
      penalty += item.pityPenalty ?? 0;
    }

    return { bonus, penalty };
  }, [rewardHistory]);
  const preloadImagePaths = useMemo(
    () =>
      Array.from(
        new Set(
          chests.flatMap((chest) =>
            [chest.imagePath, chest.hoverImagePath, chest.openedImagePath].filter(Boolean),
          ),
        ),
      ) as string[],
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const minimumLoading = new Promise<void>((resolve) => {
      window.setTimeout(resolve, loadingMinDuration);
    });
    const maximumLoading = new Promise<'timeout'>((resolve) => {
      window.setTimeout(() => resolve('timeout'), loadingMaxDuration);
    });
    const preloadResources = Promise.allSettled([
      preloadChestModel(),
      ...preloadImagePaths.map((src) => preloadImage(src)),
    ]);

    Promise.all([minimumLoading, Promise.race([preloadResources, maximumLoading])]).then(() => {
      if (isMounted) {
        setIsAppReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [preloadImagePaths]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080706] text-[#f0e3cf]">
      {!isAppReady ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#080706]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(217,146,55,0.22),transparent_34%),radial-gradient(circle_at_50%_78%,rgba(114,55,26,0.22),transparent_42%),linear-gradient(180deg,#130d0b_0%,#080706_68%,#030202_100%)]" />
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src={chests[0]?.imagePath}
              alt=""
              className="h-32 w-32 object-contain drop-shadow-[0_22px_30px_rgba(0,0,0,0.48)]"
              animate={{ y: [-4, 5, -4], rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="mt-4 h-1.5 w-40 overflow-hidden rounded-full border border-[#9b5727]/48 bg-[#1a100c]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              <motion.div
                className="h-full w-2/5 rounded-full bg-[linear-gradient(90deg,#9b5727,#f0c276,#9b5727)] shadow-[0_0_16px_rgba(240,194,118,0.52)]"
                animate={{ x: ['-120%', '260%'] }}
                transition={{ duration: 1.05, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
              />
            </motion.div>
            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.28em] text-[#d8a24f]/78">
              金庫載入中
            </p>
          </motion.div>
        </motion.div>
      ) : null}

      <motion.section
        className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-5 sm:max-w-lg"
        initial={{ opacity: 0 }}
        animate={{
          filter: selectedChestId ? 'blur(12px)' : 'blur(0px)',
          scale: selectedChestId ? 0.96 : 1,
          opacity: isAppReady ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(176,105,42,0.16),transparent_34%),radial-gradient(circle_at_22%_78%,rgba(82,40,30,0.22),transparent_32%),radial-gradient(circle_at_82%_42%,rgba(47,30,31,0.2),transparent_38%),linear-gradient(180deg,#17110f_0%,#0c0a0d_54%,#060504_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#b8792f]/10 to-transparent" />

        <motion.div
          className="relative z-10 flex items-center justify-between"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#b99061]/78">
              神秘開箱
            </p>
            <h1 className="mt-2 text-2xl font-bold uppercase leading-none tracking-[0.16em] text-[#ead8bf] drop-shadow-[0_2px_16px_rgba(176,105,42,0.16)]">
              開箱金庫
            </h1>
          </div>
          <div className="rounded-full border border-[rgba(111,74,47,0.56)] bg-[#100b09]/58 px-3 py-2 text-right shadow-lg shadow-black/20 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#c0a17a]/58">寶石</p>
            <p className="text-sm font-extrabold text-[#e5bf7a]">{gems.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 mt-7 rounded-[28px] border border-[rgba(111,74,47,0.58)] bg-[radial-gradient(circle_at_50%_8%,rgba(176,105,42,0.11),transparent_34%),linear-gradient(180deg,rgba(37,25,22,0.7)_0%,rgba(15,12,13,0.74)_100%)] p-4 shadow-[inset_0_1px_0_rgba(170,112,56,0.12),inset_0_0_0_1px_rgba(37,24,20,0.38),0_24px_60px_rgba(0,0,0,0.42),0_0_36px_rgba(176,105,42,0.06)] backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c99b67]/76">
                選一個
              </p>
              <p className="mt-1 text-sm text-[#e8d6bd]/68">點擊寶箱揭曉獎項。</p>
            </div>
            <span className="flex min-h-8 items-center rounded-full border border-[rgba(111,74,47,0.55)] bg-[linear-gradient(180deg,#d8a24f_0%,#a7652d_100%)] px-3 py-1 text-xs font-black text-[#241309] shadow-[inset_0_1px_0_rgba(255,226,170,0.36),0_8px_18px_rgba(0,0,0,0.22)]">
              {freeOpenCount > 0 ? (
                `免費抽 ${freeOpenCount}`
              ) : sleepingOpenCount > 0 ? (
                `睡醒抽 ${sleepingOpenCount}`
              ) : discountOpenCount > 0 ? (
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-[#5a2b13]/70 line-through">300</span>
                  <span>150 寶石</span>
                </span>
              ) : (
                '300 寶石'
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {chests.map((chest, index) => (
              <ChestCard key={chest.id} chest={chest} index={index} />
            ))}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c99b67]/72">
              掉落狀態
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[rgba(111,74,47,0.48)] bg-[#100b09]/52 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#c0a17a]/52">
                  本輪 SSR
                </p>
                <p className="mt-1 text-sm font-black text-[#ffe7a6]">{ssrRate}%</p>
              </div>
              <div className="rounded-xl border border-[rgba(111,74,47,0.48)] bg-[#100b09]/52 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#c0a17a]/52">
                  下一輪
                </p>
                <p className="mt-1 text-sm font-black text-[#ffe7a6]">{pendingSsrRate}%</p>
              </div>
              <div className="rounded-xl border border-[rgba(111,74,47,0.48)] bg-[#100b09]/52 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#c0a17a]/52">
                  保底倒數
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <p
                    className={`text-sm font-black ${
                      accumulatedPityChange.bonus || accumulatedPityChange.penalty
                        ? 'text-[#fff0b8]'
                        : 'text-[#ffe7a6]'
                    }`}
                  >
                    {pullsUntilSsrPity === 0 ? '下抽保底' : `還差 ${pullsUntilSsrPity} 抽`}
                  </p>
                  {accumulatedPityChange.bonus ? (
                    <motion.span
                      className="rounded-full border border-[#f0c276]/70 bg-[#38210a] px-1.5 py-0.5 text-[9px] font-black text-[#ffe7a6] shadow-[0_0_14px_rgba(240,194,118,0.26)]"
                      initial={{ opacity: 0, scale: 0.72, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      進度 +{accumulatedPityChange.bonus}
                    </motion.span>
                  ) : null}
                  {accumulatedPityChange.penalty ? (
                    <motion.span
                      className="rounded-full border border-[#9f4e38]/70 bg-[#2a100c] px-1.5 py-0.5 text-[9px] font-black text-[#ffb199] shadow-[0_0_14px_rgba(159,78,56,0.22)]"
                      initial={{ opacity: 0, scale: 0.72, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      延後 {accumulatedPityChange.penalty} 抽
                    </motion.span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-[rgba(111,74,47,0.38)] pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c99b67]/72">
                開獎紀錄
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e8d6bd]/42">
                {rewardHistory.length} 抽
              </p>
            </div>

            <div className="min-h-[4.4rem] rounded-[18px] border border-[rgba(111,74,47,0.52)] bg-[linear-gradient(180deg,rgba(24,15,12,0.74),rgba(12,9,9,0.78))] px-3 py-3 shadow-[inset_0_1px_0_rgba(224,174,97,0.08)]">
              {latestReward ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c99b67]/62">
                      最新開出
                    </p>
                    <p
                      className={`mt-1 truncate text-xl font-black leading-tight ${rarityStyles[latestReward.reward.rarity].text}`}
                    >
                      {latestReward.reward.name}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-[#e8d6bd]/42">
                      寶箱 {latestReward.chestId} / 第 {latestReward.openedNumber} 抽
                      {latestReward.pityBonus ? ` / 保底進度 +${latestReward.pityBonus}` : ''}
                      {latestReward.pityPenalty ? ` / 保底延後 ${latestReward.pityPenalty} 抽` : ''}
                      {latestReward.freeOpenBonus ? ` / 免費抽 +${latestReward.freeOpenBonus}` : ''}
                      {latestReward.discountBonus ? ` / 5折券 +${latestReward.discountBonus}` : ''}
                      {latestReward.discountUsed ? ' / 已用5折' : ''}
                      {latestReward.sleepingBonus ? ` / 睡醒抽 +${latestReward.sleepingBonus}` : ''}
                      {latestReward.sleepingUsed ? ' / 已用睡醒抽' : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${rarityStyles[latestReward.reward.rarity].badge}`}
                  >
                    {rarityStyles[latestReward.reward.rarity].label}
                  </span>
                </div>
              ) : (
                <div className="flex h-full min-h-[3.4rem] items-center justify-center text-xs font-bold text-[#e8d6bd]/42">
                  尚未開出任何獎項
                </div>
              )}
            </div>

            <div className="mt-3 flex min-h-9 gap-2 overflow-x-auto pb-1">
              {previousRewards.length > 0 ? (
                previousRewards.map((item) => (
                  <div
                    key={item.id}
                    className="shrink-0 rounded-full border border-[rgba(111,74,47,0.48)] bg-[#120c0a]/72 px-3 py-2 text-left"
                  >
                    <p
                      className={`max-w-[8.5rem] truncate text-xs font-black ${rarityStyles[item.reward.rarity].text}`}
                    >
                      {item.reward.name}
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#e8d6bd]/36">
                      {rarityStyles[item.reward.rarity].label} / #{item.openedNumber}
                      {item.pityBonus ? ` / 保底進度 +${item.pityBonus}` : ''}
                      {item.pityPenalty ? ` / 保底延後 ${item.pityPenalty} 抽` : ''}
                      {item.freeOpenBonus ? ` / 免費抽 +${item.freeOpenBonus}` : ''}
                      {item.discountBonus ? ` / 5折券 +${item.discountBonus}` : ''}
                      {item.discountUsed ? ' / 已用5折' : ''}
                      {item.sleepingBonus ? ` / 睡醒抽 +${item.sleepingBonus}` : ''}
                      {item.sleepingUsed ? ' / 已用睡醒抽' : ''}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex h-9 items-center text-xs font-bold text-[#e8d6bd]/36">
                  之前開過的獎項會顯示在這裡
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 mt-auto pt-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.58 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b99061]/48">
            每日免費抽 08:42 後重置
          </p>
        </motion.div>
      </motion.section>

      <RewardModal />
    </main>
  );
}
