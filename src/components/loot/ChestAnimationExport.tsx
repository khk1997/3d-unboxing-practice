import { motion } from 'framer-motion';
import { ChestModel } from '@/components/loot/ChestModel';
import { RewardEffects } from '@/components/loot/RewardEffects';

/** A clean, transparent render surface used for exporting the opening animation. */
export function ChestAnimationExport() {
  const dualMatte = new URLSearchParams(window.location.search).get('matte') === 'dual';
  const animation = (
    <motion.div
      className="relative h-[512px] w-[512px] overflow-visible"
      initial={{ rotate: -8, scale: 0.5 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 210, damping: 14, delay: 0.1 }}
    >
      <RewardEffects />
      <div className="relative z-10 h-full w-full">
        <ChestModel rarity="SSR" />
      </div>
    </motion.div>
  );

  if (dualMatte) {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-0 overflow-hidden">
        <div className="flex h-[512px] w-[512px] items-center justify-center bg-white">{animation}</div>
        <div className="flex h-[512px] w-[512px] items-center justify-center bg-black">{animation}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-visible" aria-label="寶箱開啟動畫">
      {animation}
    </div>
  );
}
