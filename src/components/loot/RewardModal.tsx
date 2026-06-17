import { Component, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LazyChestModel } from '@/components/loot/lazyChestModel';
import { RewardEffects } from '@/components/loot/RewardEffects';
import { chests } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';
import type { ReactNode } from 'react';

type OpeningMode = 'webp' | 'three';

const rewardRayImagePath = `${import.meta.env.BASE_URL}images/chest_sparkle_ray/ray.webp`;
const rewardSparkleChestImagePath = `${import.meta.env.BASE_URL}images/chest_sparkle_ray/chest_sparkles.webp`;

const rewardDescriptions: Record<string, string> = {
  'air-gift-pack': '沒有任何效果，但你獲得了滿滿的空氣。',
  'almost-jackpot': 'SSR 保底進度 +1，離大獎又近了一點。',
  'sleeping-chest': '獲得 1 次睡醒抽：下一抽不扣寶石，但寶箱會睡 3 秒。',
  'mystery-comfort-prize': '隨機獲得免費抽 +1 或 5折券 +1。',
  'luck-plus-one': '下一輪 SSR 機率提升，最高可提升到 10%。',
  'one-more-pull': '獲得 1 張 5折券：下一次付費開箱只扣 150 寶石。',
  'boss-blessing': '獲得免費抽 +1，最多可以累積 3 次。',
  'chieftain-prize': '太衰了，SSR 保底延後 2 抽。',
  'daily-lucky-king': '抽中 SSR！獲得 2400 寶石，保底與 SSR 機率重置。',
};

class ChestModelErrorBoundary extends Component<
  { children: ReactNode; onModelError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onModelError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

function RewardWebpReveal() {
  return (
    <motion.div
      className="relative mx-auto mt-5 h-[clamp(15rem,38vw,18rem)] w-[clamp(15rem,38vw,18rem)]"
      initial={{ scale: 0.68, y: 12 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 210, damping: 17, delay: 0.05 }}
      aria-hidden="true"
    >
      <motion.div
        className="pointer-events-none absolute left-[-39%] top-[-32%] z-0 h-[178%] w-[178%] opacity-90"
        initial={{ opacity: 0, scale: 0.72, rotate: -12 }}
        animate={{ opacity: 0.92, scale: 1, rotate: 0 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={rewardRayImagePath}
          alt=""
          draggable={false}
          className="reward-rays-spin h-full w-full select-none object-contain"
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-[-2%] top-[4%] z-10 h-[104%] w-[104%] rounded-full bg-[#ffd06a]/22 blur-3xl"
        initial={{ opacity: 0, scale: 0.62 }}
        animate={{ opacity: [0.42, 0.72, 0.5], scale: [0.86, 1.04, 0.96] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={rewardSparkleChestImagePath}
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-[-1%] top-[1%] z-20 h-[94%] w-[94%] select-none object-contain drop-shadow-[0_26px_28px_rgba(0,0,0,0.46)]"
        initial={{ opacity: 0, y: 18, scale: 0.78 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          opacity: { duration: 0.3, delay: 0.14 },
          y: { type: 'spring', stiffness: 260, damping: 18, delay: 0.14 },
          scale: { type: 'spring', stiffness: 260, damping: 15, delay: 0.14 },
        }}
      />
      <div className="pointer-events-none absolute left-[18%] bottom-[8%] z-10 h-[13%] w-[58%] rounded-full bg-black/38 blur-xl" />
    </motion.div>
  );
}

type RewardModalProps = {
  openingMode: OpeningMode;
};

export function RewardModal({ openingMode }: RewardModalProps) {
  const selectedChestId = useLootBoxStore((state) => state.selectedChestId);
  const openingState = useLootBoxStore((state) => state.openingState);
  const revealedReward = useLootBoxStore((state) => state.revealedReward);
  const claimReward = useLootBoxStore((state) => state.claimReward);
  const selectedChest = chests.find((chest) => chest.id === selectedChestId);
  const [isChestModelReady, setIsChestModelReady] = useState(false);

  useEffect(() => {
    setIsChestModelReady(false);
  }, [revealedReward?.id]);

  return (
    <AnimatePresence>
      {selectedChest && openingState === 'sleeping' ? (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#050302]/72 px-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-[30px] border border-[rgba(111,74,47,0.62)] bg-[linear-gradient(180deg,rgba(42,25,21,0.96)_0%,rgba(15,11,11,0.98)_100%)] p-6 text-center text-[#f0e3cf] shadow-[0_28px_70px_rgba(0,0,0,0.58)]"
            initial={{ opacity: 0, y: 24, scale: 0.82 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="mx-auto h-24 w-24 rounded-full border border-[#d8a24f]/24 bg-[radial-gradient(circle,rgba(216,162,79,0.18),transparent_62%)]"
              animate={{ scale: [1, 1.06, 1], opacity: [0.72, 1, 0.72] }}
              transition={{ duration: 0.72, repeat: Infinity, ease: 'easeInOut' }}
            />
            <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[#c99b67]/86">
              寶箱睡著了
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-[#f1ddbd]">
              寶箱睡醒中
            </h2>
            <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-6 text-[#e8d6bd]/62">
              這抽不扣寶石，但要等它醒一下。
            </p>
          </motion.div>
        </motion.div>
      ) : selectedChest && revealedReward ? (
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
                獎項解鎖
              </p>

              {openingMode === 'webp' ? (
                <RewardWebpReveal />
              ) : (
                <motion.div
                  className="relative mx-auto mt-5 h-[clamp(15rem,38vw,18rem)] w-[clamp(15rem,38vw,18rem)] [&_canvas]:!h-full [&_canvas]:!w-full"
                  initial={{ rotate: -8, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 210, damping: 14, delay: 0.1 }}
                >
                  <RewardEffects />

                  <div className="relative z-10 h-full w-full">
                    <motion.div
                      className="absolute inset-0"
                      animate={{ opacity: isChestModelReady ? 1 : 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ChestModelErrorBoundary
                        key={revealedReward.id}
                        onModelError={() => {
                          setIsChestModelReady(false);
                        }}
                      >
                        <Suspense fallback={null}>
                          <LazyChestModel
                            onReady={() => {
                              setIsChestModelReady(true);
                            }}
                            rarity={revealedReward.rarity}
                          />
                        </Suspense>
                      </ChestModelErrorBoundary>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              <h2 className="mt-5 break-words font-display text-[clamp(2rem,9vw,2.5rem)] leading-tight text-[#f1ddbd] drop-shadow-[0_2px_18px_rgba(176,105,42,0.2)]">
                {revealedReward.name}
              </h2>

              <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-6 text-[#e8d6bd]/68">
                {rewardDescriptions[revealedReward.id] ??
                  `寶箱 ${selectedChest.id} 開出了獎項，領取後加入你的金庫。`}
              </p>

              <button
                type="button"
                onClick={claimReward}
                className="mt-6 h-12 w-full rounded-2xl border border-[rgba(111,74,47,0.7)] bg-[linear-gradient(180deg,#d8a24f_0%,#9b5727_100%)] text-sm font-black uppercase tracking-[0.16em] text-[#241309] shadow-[inset_0_1px_0_rgba(255,226,170,0.36),0_14px_26px_rgba(0,0,0,0.3),0_0_18px_rgba(176,105,42,0.12)] transition hover:bg-[linear-gradient(180deg,#e0ae61_0%,#aa6230_100%)] focus:outline-none focus:ring-2 focus:ring-[#c99b67]/70"
              >
                領取
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
