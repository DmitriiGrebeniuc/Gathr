import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';
import type { NavigationDirection } from '../types/navigation';

interface ScreenTransitionProps {
  children: ReactNode;
  direction?: NavigationDirection;
}

export function ScreenTransition({ children, direction = 'forward' }: ScreenTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = {
    forward: {
      initial: { x: '14%', opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      exit: { x: '-8%', opacity: 0 },
    },
    back: {
      initial: { x: '-8%', opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      exit: { x: '14%', opacity: 0 },
    },
    up: {
      initial: { y: '18%', opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      exit: { y: '12%', opacity: 0 },
    },
    down: {
      initial: { y: '-6%', opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      exit: { y: '18%', opacity: 0 },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      exit: { opacity: 0 },
    },
  };

  const selectedVariant = variants[direction];
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: direction === 'fade' ? 0.16 : 0.24,
        ease: [0.22, 1, 0.36, 1] as const,
      };

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={transition}
      className="absolute inset-0 bg-background overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
