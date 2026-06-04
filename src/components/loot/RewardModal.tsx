import { Component, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LazyChestModel } from '@/components/loot/lazyChestModel';
import { RewardEffects } from '@/components/loot/RewardEffects';
import { chests } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';
import type { ErrorInfo, ReactNode } from 'react';

class ChestModelErrorBoundary extends Component<
  { children: ReactNode; onModelError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    this.props.onModelError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export function RewardModal() {
  const selectedChestId = useLootBoxStore((state) => state.selectedChestId);
  const revealedReward = useLootBoxStore((state) => state.revealedReward);
  const claimReward = useLootBoxStore((state) => state.claimReward);
  const selectedChest = chests.find((chest) => chest.id === selectedChestId);
  const [isChestModelReady, setIsChestModelReady] = useState(false);
  const [hasChestModelError, setHasChestModelError] = useState(false);
  const fallbackChestImage =
    selectedChest?.openedImagePath ?? selectedChest?.hoverImagePath ?? selectedChest?.imagePath;

  useEffect(() => {
    setIsChestModelReady(false);
    setHasChestModelError(false);
  }, [revealedReward?.id]);

  return (
    <AnimatePresence>
      {selectedChest && revealedReward ? (
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

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c99b67]/86">
                Reward Unlocked
              </p>

              <motion.div
                className="relative mx-auto mt-5 h-[clamp(15rem,38vw,18rem)] w-[clamp(15rem,38vw,18rem)] [&_canvas]:!h-full [&_canvas]:!w-full"
                initial={{ rotate: -8, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 210, damping: 14, delay: 0.1 }}
              >
                <RewardEffects />

                <div className="relative z-10 h-full w-full">
                  {fallbackChestImage ? (
                    <motion.img
                      src={fallbackChestImage}
                      alt={`Chest ${selectedChest.id}`}
                      className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.42)]"
                      animate={{ opacity: isChestModelReady && !hasChestModelError ? 0 : 1 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ) : null}

                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: isChestModelReady && !hasChestModelError ? 1 : 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ChestModelErrorBoundary
                      key={revealedReward.id}
                      onModelError={() => {
                        setIsChestModelReady(false);
                        setHasChestModelError(true);
                      }}
                    >
                      <Suspense fallback={null}>
                        <LazyChestModel
                          onReady={() => {
                            setHasChestModelError(false);
                            setIsChestModelReady(true);
                          }}
                          rarity={revealedReward.rarity}
                        />
                      </Suspense>
                    </ChestModelErrorBoundary>
                  </motion.div>
                </div>
              </motion.div>

              <h2 className="mt-5 font-display text-4xl leading-none text-[#f1ddbd] drop-shadow-[0_2px_18px_rgba(176,105,42,0.2)]">
                {revealedReward.name}
              </h2>

              <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-6 text-[#e8d6bd]/68">
                Chest {selectedChest.id} revealed a limited drop. Claim it to add the item to your
                vault.
              </p>

              <button
                type="button"
                onClick={claimReward}
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
