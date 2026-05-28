import { motion, useMotionValue, useSpring } from 'framer-motion';
import { PointerEvent, useEffect, useState } from 'react';
import type { Chest } from '@/data/chests';
import { useLootBoxStore } from '@/store/lootBoxStore';

type ChestCardProps = {
  chest: Chest;
  index: number;
};

export function ChestCard({ chest, index }: ChestCardProps) {
  const openChest = useLootBoxStore((state) => state.openChest);
  const canOpenChest = useLootBoxStore((state) => state.canOpenChest);
  const openedChestIds = useLootBoxStore((state) => state.openedChestIds);
  const [isHovered, setIsHovered] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [hasHoverImageError, setHasHoverImageError] = useState(false);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 260, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 260, damping: 22 });
  const isOpened = openedChestIds.includes(chest.id);
  const shouldUseHoverImage = Boolean(
    (isHovered || isOpened) && chest.hoverImagePath && !hasHoverImageError,
  );
  const activeImagePath = shouldUseHoverImage ? chest.hoverImagePath : chest.imagePath;
  const shouldUseImage = Boolean(activeImagePath && !hasImageError);
  const isOpenable = !isOpened && canOpenChest(chest);
  const isUnavailable = !isOpened && !isOpenable;

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
      disabled={!isOpenable}
      onClick={() => openChest(chest.id)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className={`group relative aspect-square overflow-visible rounded-2xl disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#070914] ${
        isUnavailable ? 'opacity-45' : ''
      }`}
      initial={{ opacity: 0, y: 18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, delay: 0.18 + index * 0.035 }}
      whileHover={
        isOpenable
          ? {
              y: -6,
              scale: 1.04,
              transition: { type: 'spring', stiffness: 340, damping: 18 },
            }
          : undefined
      }
      whileTap={{
        scale: 0.9,
        rotate: -1,
        zIndex: 20,
        transition: { type: 'spring', stiffness: 520, damping: 18 },
      }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
    >
      <motion.span
        className="absolute -inset-3 rounded-[26px] bg-[#b8792f]/30 blur-xl"
        animate={{
          opacity: isHovered ? 0.42 : 0.08,
          scale: isHovered ? 1.12 : 1,
        }}
        transition={{ duration: 0.22 }}
      />
      <motion.span
        className={`absolute -inset-px rounded-[21px] ${
          isHovered
            ? 'bg-[linear-gradient(145deg,rgba(184,119,55,0.5),rgba(94,57,33,0.38)_48%,rgba(29,18,17,0.64)_100%)]'
            : 'bg-[linear-gradient(145deg,rgba(90,49,25,0.34),rgba(54,31,24,0.2)_52%,rgba(16,10,10,0.34)_100%)]'
        }`}
        animate={{
          boxShadow: isHovered
            ? '0 14px 30px rgba(0,0,0,0.42), 0 0 18px rgba(188,121,44,0.24)'
            : '0 8px 18px rgba(0,0,0,0.22)',
        }}
        transition={{ duration: 0.22 }}
      />

      <motion.span
        className={`absolute inset-px overflow-hidden rounded-[18px] ${
          isHovered
            ? 'bg-[radial-gradient(ellipse_at_50%_76%,rgba(174,103,36,0.24),transparent_54%),linear-gradient(145deg,rgba(48,27,24,0.72)_0%,rgba(33,20,25,0.68)_45%,rgba(12,10,12,0.72)_100%)] shadow-[inset_0_1px_0_rgba(231,187,120,0.12),inset_0_-18px_24px_rgba(0,0,0,0.36),0_10px_22px_rgba(0,0,0,0.2)]'
            : 'bg-[radial-gradient(ellipse_at_50%_78%,rgba(139,80,32,0.15),transparent_58%),linear-gradient(145deg,rgba(38,22,21,0.46)_0%,rgba(27,18,23,0.42)_48%,rgba(10,9,11,0.46)_100%)] shadow-[inset_0_1px_0_rgba(214,168,96,0.055),inset_0_-16px_22px_rgba(0,0,0,0.26),0_8px_18px_rgba(0,0,0,0.16)]'
        }`}
        style={{ transform: 'translateZ(18px)' }}
      >
        <span className="absolute inset-[7px] rounded-[13px] bg-[linear-gradient(145deg,rgba(82,48,35,0.16),transparent_52%,rgba(0,0,0,0.14)_100%)]" />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(185,112,49,0.045),transparent_32%),linear-gradient(135deg,rgba(168,104,50,0.035)_0%,transparent_28%,rgba(0,0,0,0.26)_76%)]" />
        <span
          className={`absolute left-1/2 top-[36%] h-[44%] w-[58%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(208,134,57,0.18),rgba(208,134,57,0.055)_40%,transparent_72%)] blur-lg ${
            isHovered ? 'opacity-100' : 'opacity-55'
          }`}
        />
        <span
          className={`absolute left-1/2 top-[66%] h-[27%] w-[72%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(190,104,35,0.24),rgba(190,104,35,0.08)_38%,transparent_72%)] blur-md ${
            isHovered ? 'opacity-100' : 'opacity-62'
          }`}
        />

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

        <motion.span
          className="absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-[#b8792f]/18 to-transparent"
          animate={{ x: isHovered ? '420%' : '-60%' }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        />
        <span
          className={`absolute inset-0 rounded-[18px] border shadow-[inset_0_0_0_1px_rgba(25,14,11,0.34)] ${
            isHovered ? 'border-[rgba(173,116,61,0.54)]' : 'border-[rgba(79,45,29,0.58)]'
          }`}
        />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-transparent" />
      </motion.span>

    </motion.button>
  );
}
