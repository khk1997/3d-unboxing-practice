import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChestCard } from '@/components/loot/ChestCard';
import { preloadChestModel } from '@/components/loot/lazyChestModel';
import { RewardModal } from '@/components/loot/RewardModal';
import { chests } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';

export function App() {
  const selectedChestId = useLootBoxStore((state) => state.selectedChestId);
  const gems = useLootBoxStore((state) => state.gems);
  const freeOpenCount = useLootBoxStore((state) => state.freeOpenCount);
  const openedCount = useLootBoxStore((state) => state.openedCount);
  const nextMilestone = useLootBoxStore((state) => state.nextMilestone);
  const progressTarget = nextMilestone?.opensRequired ?? Math.max(openedCount, 1);
  const progressValue = Math.min((openedCount / progressTarget) * 100, 100);

  useEffect(() => {
    const warmChestModel = () => {
      void preloadChestModel();
    };
    const requestIdle = window.requestIdleCallback;

    if (requestIdle) {
      const idleId = requestIdle(warmChestModel, { timeout: 2500 });

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(warmChestModel, 1400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080706] text-[#f0e3cf]">
      <motion.section
        className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-5 sm:max-w-lg"
        animate={{
          filter: selectedChestId ? 'blur(12px)' : 'blur(0px)',
          scale: selectedChestId ? 0.96 : 1,
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
