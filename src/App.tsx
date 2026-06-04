import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChestCard } from '@/components/loot/ChestCard';
import { preloadChestModel } from '@/components/loot/lazyChestModel';
import { RewardModal } from '@/components/loot/RewardModal';
import { chests } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';

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

export function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const selectedChestId = useLootBoxStore((state) => state.selectedChestId);
  const gems = useLootBoxStore((state) => state.gems);
  const freeOpenCount = useLootBoxStore((state) => state.freeOpenCount);
  const openedCount = useLootBoxStore((state) => state.openedCount);
  const nextMilestone = useLootBoxStore((state) => state.nextMilestone);
  const progressTarget = nextMilestone?.opensRequired ?? Math.max(openedCount, 1);
  const progressValue = Math.min((openedCount / progressTarget) * 100, 100);
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
            className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d8a24f]/24"
            animate={{ scale: [0.82, 1.08, 0.82], opacity: [0.18, 0.42, 0.18] }}
            transition={{ duration: 1.55, repeat: Infinity, ease: 'easeInOut' }}
          />
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
              Loot Vault
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
              Mystic Drop
            </p>
            <h1 className="mt-2 text-2xl font-bold uppercase leading-none tracking-[0.16em] text-[#ead8bf] drop-shadow-[0_2px_16px_rgba(176,105,42,0.16)]">
              Loot Vault
            </h1>
          </div>
          <div className="rounded-full border border-[rgba(111,74,47,0.56)] bg-[#100b09]/58 px-3 py-2 text-right shadow-lg shadow-black/20 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#c0a17a]/58">Gems</p>
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
                Pick one
              </p>
              <p className="mt-1 text-sm text-[#e8d6bd]/68">Tap a chest to reveal your reward.</p>
            </div>
            <span className="rounded-full border border-[rgba(111,74,47,0.55)] bg-[linear-gradient(180deg,#d8a24f_0%,#a7652d_100%)] px-3 py-1 text-xs font-black text-[#241309] shadow-[inset_0_1px_0_rgba(255,226,170,0.36),0_8px_18px_rgba(0,0,0,0.22)]">
              {freeOpenCount > 0 ? `${freeOpenCount} Free` : '300 Gems'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {chests.map((chest, index) => (
              <ChestCard key={chest.id} chest={chest} index={index} />
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#c0a17a]/64">
              <span>Reward Stage</span>
              <span>
                {openedCount}/{progressTarget}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[rgba(111,74,47,0.5)] bg-[#100b09]/72">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#b8792f_0%,#e5bf7a_100%)]"
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-xs text-[#e8d6bd]/58">
              Next: {nextMilestone ? nextMilestone.reward.name : 'All stage rewards claimed'}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 mt-auto pt-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.58 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b99061]/48">
            Daily pull resets in 08:42
          </p>
        </motion.div>
      </motion.section>

      <RewardModal />
    </main>
  );
}
