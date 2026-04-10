import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';

interface ScreenTransitionProps {
  children: ReactNode;
  direction?: 'forward' | 'back' | 'up' | 'down';
}

export function ScreenTransition({ children, direction = 'forward' }: ScreenTransitionProps) {
  const variants = {
    forward: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-2%', opacity: 0 },
    },
    back: {
      initial: { x: '-2%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 },
    },
    up: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 },
    },
    down: {
      initial: { y: '-100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 },
    },
  };

  const selectedVariant = variants[direction];

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 36,
        mass: 0.9,
      }}
      className="absolute inset-0 bg-background overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
