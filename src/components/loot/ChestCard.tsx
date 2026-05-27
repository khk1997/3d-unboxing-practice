import { motion, useMotionValue, useSpring } from 'framer-motion';
import { PointerEvent, useEffect, useState } from 'react';
import type { Chest } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';

type ChestCardProps = {
  chest: Chest;
  index: number;
};

export function ChestCard({ chest, index }: ChestCardProps) {
  const selectChest = useLootBoxStore((state) => state.selectChest);
  const [isHovered, setIsHovered] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [hasHoverImageError, setHasHoverImageError] = useState(false);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 260, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 260, damping: 22 });
  const shouldUseHoverImage = Boolean(isHovered && chest.hoverImagePath && !hasHoverImageError);
  const activeImagePath = shouldUseHoverImage ? chest.hoverImagePath : chest.imagePath;
  const shouldUseImage = Boolean(activeImagePath && !hasImageError);

  useEffect(() => {
    setHasImageError(false);
    setHasHoverImageError(false);
  }, [chest.imagePath, chest.hoverImagePath]);

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const maxTilt = 13;

    rotateX.set(y * -maxTilt);
    rotateY.set(x * maxTilt);
  };

  return (
    <motion.button
      type="button"
      onClick={() => selectChest(chest.id)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className="group relative aspect-square overflow-visible rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#070914]"
      initial={{ opacity: 0, y: 18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, delay: 0.18 + index * 0.035 }}
      whileHover={{
        y: -6,
        scale: 1.04,
        transition: { type: 'spring', stiffness: 340, damping: 18 },
      }}
      whileTap={{
        scale: 0.9,
        rotate: -1,
        zIndex: 20,
        transition: { type: 'spring', stiffness: 520, damping: 18 },
      }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
    >
      <motion.span
        className={`absolute -inset-3 rounded-[26px] bg-gradient-to-br ${chest.tone} blur-xl`}
        animate={{
          opacity: isHovered ? 0.72 : 0.28,
          scale: isHovered ? 1.12 : 1,
        }}
        transition={{ duration: 0.22 }}
      />
      <motion.span
        className="absolute -inset-px rounded-[21px] bg-gradient-to-br from-amber-100 via-yellow-500 to-stone-950"
        animate={{
          boxShadow: isHovered
            ? '0 20px 42px rgba(0,0,0,0.55), 0 0 42px rgba(251,191,36,0.42)'
            : '0 16px 34px rgba(0,0,0,0.48), 0 0 28px rgba(251,191,36,0.16)',
        }}
        transition={{ duration: 0.22 }}
      />

      <motion.span
        className="absolute inset-[3px] overflow-hidden rounded-[18px] bg-[linear-gradient(145deg,#33200f_0%,#171223_38%,#090b18_100%)]"
        style={{ transform: 'translateZ(18px)' }}
      >
        <span
          className={`absolute inset-2 rounded-[14px] bg-gradient-to-br ${chest.tone} opacity-80`}
        />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.38),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.22)_0%,transparent_28%,rgba(0,0,0,0.34)_72%)]" />

        {shouldUseImage ? (
          <img
            src={activeImagePath}
            alt={`Chest ${chest.id}`}
            draggable={false}
            onError={() => {
              if (shouldUseHoverImage) {
                setHasHoverImageError(true);
                return;
              }

              setHasImageError(true);
            }}
            className="absolute inset-0 m-auto h-[82%] w-[82%] select-none object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.42)]"
          />
        ) : (
          <>
            <span className="absolute left-[12%] right-[12%] top-[18%] h-[30%] rounded-t-[18px] border-x border-t border-amber-100/55 bg-gradient-to-b from-amber-200 via-amber-500 to-yellow-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.55),inset_0_-8px_12px_rgba(92,45,8,0.58)]" />
            <span className="absolute left-[8%] right-[8%] top-[39%] h-[38%] rounded-b-[16px] border border-amber-100/45 bg-gradient-to-br from-yellow-700 via-orange-700 to-[#2b1020] shadow-[inset_0_3px_6px_rgba(255,255,255,0.28),inset_0_-10px_18px_rgba(0,0,0,0.42)]" />

            <span className="absolute left-1/2 top-[20%] h-[57%] w-[15%] -translate-x-1/2 rounded-sm bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-800 shadow-[0_0_18px_rgba(254,240,138,0.62),inset_0_1px_2px_rgba(255,255,255,0.8)]" />
            <span className="absolute left-[9%] top-[43%] h-[13%] w-[82%] rounded-sm bg-gradient-to-r from-yellow-900 via-yellow-200 to-yellow-900 shadow-[0_0_16px_rgba(254,240,138,0.44)]" />
            <span className="absolute left-1/2 top-[52%] h-5 w-5 -translate-x-1/2 rounded-full border border-yellow-100/70 bg-gradient-to-b from-amber-100 to-yellow-700 shadow-[0_0_18px_rgba(251,191,36,0.75)]" />
          </>
        )}

        <span className="absolute inset-x-3 top-3 h-4 rounded-full bg-white/30 blur-md" />
        <motion.span
          className="absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/28 to-transparent"
          animate={{ x: isHovered ? '420%' : '-60%' }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        />
        <span className="absolute inset-0 rounded-[18px] border border-white/14" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
      </motion.span>

      <span className="absolute bottom-2 left-1/2 rounded-full border border-amber-200/40 bg-black/42 px-2 py-0.5 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.16em] text-amber-100 shadow-lg backdrop-blur-sm">
        Chest {chest.id}
      </span>
    </motion.button>
  );
}
