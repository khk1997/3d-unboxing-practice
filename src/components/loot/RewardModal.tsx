import { AnimatePresence, motion } from 'framer-motion';
import { ChestModel } from '@/components/loot/ChestModel';
import { chests } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';

export function RewardModal() {
  const selectedChestId = useLootBoxStore((state) => state.selectedChestId);
  const clearSelectedChest = useLootBoxStore((state) => state.clearSelectedChest);
  const selectedChest = chests.find((chest) => chest.id === selectedChestId);

  return (
    <AnimatePresence>
      {selectedChest ? (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/62 px-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-[30px] border border-amber-200/35 bg-[#111428] p-5 text-center shadow-2xl shadow-amber-500/20"
            initial={{ opacity: 0, y: 36, scale: 0.76 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(251,191,36,0.34),transparent_38%)]" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">
                Reward Unlocked
              </p>
              <motion.div
                className="relative mx-auto mt-5 h-56 w-56 [&_canvas]:!h-full [&_canvas]:!w-full"
                initial={{ rotate: -8, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 210, damping: 14, delay: 0.1 }}
              >
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/20 blur-3xl" />
                <ChestModel rarity={selectedChest.rarity} />
              </motion.div>
              <h2 className="mt-5 font-display text-4xl leading-none text-white">
                {selectedChest.reward}
              </h2>
              <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-6 text-white/62">
                Chest {selectedChest.id} revealed a limited drop. Claim it to add the item to your
                vault.
              </p>
              <button
                type="button"
                onClick={clearSelectedChest}
                className="mt-6 h-12 w-full rounded-2xl bg-amber-300 text-sm font-black uppercase tracking-[0.16em] text-[#221509] shadow-lg shadow-amber-400/20 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Claim
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
