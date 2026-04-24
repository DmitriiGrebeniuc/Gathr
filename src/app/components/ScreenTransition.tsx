import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';

interface ScreenTransitionProps {
  children: ReactNode;
  direction?: 'forward' | 'back' | 'up' | 'down';
}

export function ScreenTransition({ children, direction = 'forward' }: ScreenTransitionProps) {
  const variants = {
    forward: {
      initial: { x: '7%', opacity: 0.84, scale: 0.992, filter: 'blur(3px)' },
      animate: { x: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { x: '-3.5%', opacity: 0.94, scale: 0.996, filter: 'blur(1.5px)' },
    },
    back: {
      initial: { x: '-5%', opacity: 0.84, scale: 0.992, filter: 'blur(3px)' },
      animate: { x: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { x: '6%', opacity: 0.94, scale: 0.996, filter: 'blur(1.5px)' },
    },
    up: {
      initial: { y: '5%', opacity: 0.84, scale: 0.992, filter: 'blur(3px)' },
      animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { y: '3%', opacity: 0.94, scale: 0.996, filter: 'blur(1.5px)' },
    },
    down: {
      initial: { y: '-4%', opacity: 0.84, scale: 0.992, filter: 'blur(3px)' },
      animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { y: '4%', opacity: 0.94, scale: 0.996, filter: 'blur(1.5px)' },
    },
  };

  const selectedVariant = variants[direction];

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={{
        duration: 0.34,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="absolute inset-0 bg-background overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
