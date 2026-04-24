import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';

interface ScreenTransitionProps {
  children: ReactNode;
  direction?: 'forward' | 'back' | 'up' | 'down';
}

export function ScreenTransition({ children, direction = 'forward' }: ScreenTransitionProps) {
  const variants = {
    forward: {
      initial: { x: '14%', opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-4%', opacity: 1 },
    },
    back: {
      initial: { x: '-4%', opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '14%', opacity: 1 },
    },
    up: {
      initial: { y: '14%', opacity: 1 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '10%', opacity: 1 },
    },
    down: {
      initial: { y: '-6%', opacity: 1 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '10%', opacity: 1 },
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
        stiffness: 360,
        damping: 38,
        mass: 0.82,
      }}
      className="absolute inset-0 bg-background overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
