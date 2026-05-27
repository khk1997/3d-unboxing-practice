import { motion } from 'framer-motion';
import { ChestCard } from '@/components/loot/ChestCard';
import { RewardModal } from '@/components/loot/RewardModal';
import { chests } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';

export function App() {
  const selectedChestId = useLootBoxStore((state) => state.selectedChestId);

  return (
    <main className="min-h-screen overflow-hidden bg-[#070914] text-white">
      <motion.section
        className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-5 sm:max-w-lg"
        animate={{
          filter: selectedChestId ? 'blur(12px)' : 'blur(0px)',
          scale: selectedChestId ? 0.96 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(250,204,21,0.24),transparent_34%),radial-gradient(circle_at_15%_74%,rgba(14,165,233,0.2),transparent_30%),linear-gradient(180deg,#11142a_0%,#070914_64%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />

        <motion.div
          className="relative z-10 flex items-center justify-between"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-200/80">
              Mystic Drop
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold leading-none text-white">
              Loot Vault
            </h1>
          </div>
          <div className="rounded-full border border-amber-200/40 bg-black/30 px-3 py-2 text-right shadow-lg shadow-amber-500/10 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Gems</p>
            <p className="text-sm font-extrabold text-amber-200">2,480</p>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 mt-7 rounded-[28px] border border-white/12 bg-white/[0.06] p-4 shadow-2xl shadow-black/40 backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/70">
                Pick one
              </p>
              <p className="mt-1 text-sm text-white/58">Tap a chest to reveal your reward.</p>
            </div>
            <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-[#221509]">
              1 Free
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {chests.map((chest, index) => (
              <ChestCard key={chest.id} chest={chest} index={index} />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 mt-auto pt-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.58 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/38">
            Daily pull resets in 08:42
          </p>
        </motion.div>
      </motion.section>

      <RewardModal />
    </main>
  );
}
