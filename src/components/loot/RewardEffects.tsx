import { motion, useReducedMotion } from 'framer-motion';

const burstDelay = 0.74;

// Confetti burst: short paper-piece pop around the reward reveal.
const confettiPieces = [
  {
    x: -78,
    y: -78,
    driftX: -12,
    driftY: 28,
    rotate: -42,
    spin: 156,
    color: '#f7d36a',
    width: 5,
    height: 10,
    duration: 1.18,
  },
  {
    x: -34,
    y: -108,
    driftX: -8,
    driftY: 34,
    rotate: 28,
    spin: -132,
    color: '#fff0b3',
    width: 4,
    height: 9,
    duration: 1.26,
  },
  {
    x: -96,
    y: -22,
    driftX: -18,
    driftY: 26,
    rotate: -18,
    spin: 122,
    color: '#d8893a',
    width: 5,
    height: 8,
    duration: 1.12,
  },
  {
    x: 82,
    y: -76,
    driftX: 16,
    driftY: 30,
    rotate: -28,
    spin: 136,
    color: '#fff4ca',
    width: 4,
    height: 9,
    duration: 1.16,
  },
  {
    x: -72,
    y: 42,
    driftX: -14,
    driftY: 18,
    rotate: 24,
    spin: 118,
    color: '#fff1a8',
    width: 5,
    height: 8,
    duration: 1.06,
  },
  {
    x: 30,
    y: 64,
    driftX: 8,
    driftY: 20,
    rotate: 58,
    spin: 146,
    color: '#f8cb58',
    width: 5,
    height: 8,
    duration: 1.12,
  },
  {
    x: -52,
    y: -38,
    driftX: -18,
    driftY: 38,
    rotate: 72,
    spin: -172,
    color: '#f3a43d',
    width: 4,
    height: 9,
    duration: 1.24,
  },
];

const rewardSparkles = [
  { x: -74, y: -88, driftX: -10, driftY: -28, size: 5, delay: 0.02, duration: 1.1 },
  { x: -108, y: -28, driftX: -18, driftY: -10, size: 4, delay: 0.16, duration: 1.02 },
  { x: 108, y: -22, driftX: 18, driftY: -12, size: 5, delay: 0.22, duration: 1.12 },
  { x: 30, y: -122, driftX: 6, driftY: -20, size: 4, delay: 0.26, duration: 1.2 },
];

const rewardGlints = [
  { x: -54, y: -76, rotate: -18, delay: 0.2 },
  { x: 74, y: 18, rotate: -24, delay: 0.52 },
];

// Radiance: warm radial glow and slow rotating rays behind the reward.
function RewardRadiance() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-full w-full rounded-full blur-[2px] brightness-125 saturate-150"
          style={{
            background:
              'radial-gradient(circle, rgba(255,249,210,0.95) 0%, rgba(255,218,122,0.58) 24%, rgba(244,174,68,0.28) 46%, rgba(244,174,68,0.12) 58%, transparent 72%)',
            filter: 'drop-shadow(0 0 18px rgba(255, 189, 74, 0.32))',
            WebkitMaskImage:
              'radial-gradient(circle, black 0%, black 44%, rgba(0,0,0,0.62) 58%, transparent 76%)',
            maskImage:
              'radial-gradient(circle, black 0%, black 44%, rgba(0,0,0,0.62) 58%, transparent 76%)',
          }}
          initial={{ opacity: 0, scale: 0.62 }}
          animate={{ opacity: shouldReduceMotion ? 0.42 : 0.88, scale: 1 }}
          transition={{
            delay: burstDelay,
            duration: shouldReduceMotion ? 0.35 : 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>

      <motion.div
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: shouldReduceMotion ? 0 : 0.76 }}
        transition={{
          delay: burstDelay + 0.02,
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div
          className="reward-rays-spin h-full w-full rounded-full blur-[0.5px] brightness-125 saturate-150"
          style={{
            background:
              'conic-gradient(from 8deg, transparent 0deg, rgba(255,250,220,0.72) 12deg, transparent 30deg, transparent 54deg, rgba(255,204,91,0.58) 68deg, transparent 90deg, transparent 118deg, rgba(255,250,220,0.68) 132deg, transparent 154deg, transparent 194deg, rgba(255,204,91,0.54) 214deg, transparent 238deg, transparent 290deg, rgba(255,250,220,0.64) 306deg, transparent 330deg, transparent 360deg)',
            filter: 'drop-shadow(0 0 14px rgba(255, 206, 92, 0.26))',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 0%, black 16%, black 34%, rgba(0,0,0,0.46) 50%, transparent 68%)',
            maskImage:
              'radial-gradient(circle, transparent 0%, black 16%, black 34%, rgba(0,0,0,0.46) 50%, transparent 68%)',
          }}
        />
      </motion.div>
    </div>
  );
}

// Sparkles: small light points and glints that accent the reward model.
function RewardSparkles() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden="true">
      {rewardSparkles.map((sparkle, index) => (
        <motion.span
          key={`reward-sparkle-${sparkle.x}-${sparkle.y}-${index}`}
          className="absolute left-1/2 top-1/2 rounded-full bg-[#fff8d4]"
          style={{
            width: sparkle.size,
            height: sparkle.size,
            boxShadow: '0 0 12px rgba(255, 238, 180, 0.86)',
          }}
          initial={{
            x: sparkle.x * 0.62,
            y: sparkle.y * 0.62,
            opacity: 0,
            scale: 0.45,
          }}
          animate={{
            x: [sparkle.x * 0.62, sparkle.x, sparkle.x + sparkle.driftX],
            y: [sparkle.y * 0.62, sparkle.y, sparkle.y + sparkle.driftY],
            opacity: [0, 0.95, 0],
            scale: [0.45, 1, 0.24],
          }}
          transition={{
            delay: burstDelay + sparkle.delay,
            duration: sparkle.duration,
            times: [0, 0.36, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}

      {rewardGlints.map((glint, index) => (
        <motion.span
          key={`reward-glint-${glint.x}-${glint.y}-${index}`}
          className="absolute left-1/2 top-1/2 h-6 w-6"
          style={{ transformOrigin: 'center' }}
          initial={{
            x: glint.x,
            y: glint.y,
            opacity: 0,
            rotate: glint.rotate,
            scale: 0.55,
          }}
          animate={{
            opacity: [0, 0.88, 0],
            scale: [0.55, 1, 0.62],
          }}
          transition={{
            delay: burstDelay + glint.delay,
            duration: 0.58,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle,rgba(255,250,186,0.74)_0%,rgba(255,222,70,0.28)_34%,transparent_66%)] blur-[1px]" />
          <span
            className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_50%_50%,#fffde6_0%,#fff27a_28%,#ffd927_56%,rgba(255,199,31,0.08)_72%,transparent_76%)] shadow-[0_0_6px_rgba(255,235,90,0.74),0_0_11px_rgba(255,201,32,0.34)]"
            style={{
              clipPath:
                'polygon(50% 0%, 58% 38%, 100% 50%, 58% 62%, 50% 100%, 42% 62%, 0% 50%, 42% 38%)',
            }}
          />
        </motion.span>
      ))}
    </div>
  );
}

// Confetti: lightweight paper pieces for the opening burst.
function RewardConfetti() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-visible" aria-hidden="true">
      {confettiPieces.map((piece, index) => (
        <motion.span
          key={`confetti-${piece.x}-${piece.y}-${index}`}
          className="absolute left-1/2 top-1/2 rounded-[1px]"
          style={{
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            boxShadow: '0 0 7px rgba(255, 225, 142, 0.55)',
          }}
          initial={{
            x: piece.x * 0.18,
            y: piece.y * 0.18,
            opacity: 0,
            rotate: 0,
            scale: 0.48,
          }}
          animate={{
            x: [piece.x * 0.18, piece.x, piece.x + piece.driftX],
            y: [piece.y * 0.18, piece.y, piece.y + piece.driftY * 0.18],
            opacity: [0, 1, 0],
            rotate: [0, piece.rotate + piece.spin * 0.55, piece.rotate + piece.spin],
            scale: [0.48, 0.95, 0.54],
          }}
          transition={{
            delay: burstDelay + 0.05 + (index % 4) * 0.018,
            duration: piece.duration,
            times: [0, 0.32, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  );
}

export function RewardEffects() {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8792f]/22 blur-2xl" />
      <RewardRadiance />
      <RewardSparkles />
      <RewardConfetti />
    </>
  );
}
