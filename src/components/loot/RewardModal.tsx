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
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#050302]/72 px-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-[30px] border border-[rgba(111,74,47,0.62)] bg-[radial-gradient(circle_at_50%_6%,rgba(176,105,42,0.16),transparent_34%),linear-gradient(180deg,rgba(42,25,21,0.96)_0%,rgba(15,11,11,0.98)_100%)] p-5 text-center text-[#f0e3cf] shadow-[inset_0_1px_0_rgba(196,134,67,0.16),inset_0_0_0_1px_rgba(35,21,17,0.48),0_28px_70px_rgba(0,0,0,0.58),0_0_44px_rgba(176,105,42,0.12)]"
            initial={{ opacity: 0, y: 36, scale: 0.76 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(194,116,45,0.18),transparent_38%),radial-gradient(circle_at_50%_72%,rgba(98,45,25,0.18),transparent_52%)]" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c99b67]/86">
                Reward Unlocked
              </p>
              <motion.div
                className="relative mx-auto mt-5 h-56 w-56 [&_canvas]:!h-full [&_canvas]:!w-full"
                initial={{ rotate: -8, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 210, damping: 14, delay: 0.1 }}
              >
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8792f]/22 blur-3xl" />
                <ChestModel rarity={selectedChest.rarity} />
              </motion.div>
              <h2 className="mt-5 font-display text-4xl leading-none text-[#f1ddbd] drop-shadow-[0_2px_18px_rgba(176,105,42,0.2)]">
                {selectedChest.reward}
              </h2>
              <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-6 text-[#e8d6bd]/68">
                Chest {selectedChest.id}{' '}revealed a limited drop. Claim it to add the item to your
                vault.
              </p>
              <button
                type="button"
                onClick={clearSelectedChest}
                className="mt-6 h-12 w-full rounded-2xl border border-[rgba(111,74,47,0.7)] bg-[linear-gradient(180deg,#d8a24f_0%,#9b5727_100%)] text-sm font-black uppercase tracking-[0.16em] text-[#241309] shadow-[inset_0_1px_0_rgba(255,226,170,0.36),0_14px_26px_rgba(0,0,0,0.3),0_0_18px_rgba(176,105,42,0.12)] transition hover:bg-[linear-gradient(180deg,#e0ae61_0%,#aa6230_100%)] focus:outline-none focus:ring-2 focus:ring-[#c99b67]/70"
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
