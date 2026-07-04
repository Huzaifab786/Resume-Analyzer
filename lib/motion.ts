export const easeOut = [0.22, 1, 0.36, 1] as const;

export const duration = {
  fast: 0.2,
  normal: 0.5,
  slow: 0.8,
} as const;

export const hoverLift = { y: -4 } as const;
export const hoverScale = { scale: 1.02 } as const;

export const floatAnimation = {
  y: [0, -10, 0] as number[],
};

export const floatTransition = {
  duration: duration.slow * 6,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easeOut },
  },
} as const;
