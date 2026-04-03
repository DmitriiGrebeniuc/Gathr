import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { ReactNode } from 'react';

interface SwipeableScreenProps {
  children: ReactNode;
  onSwipeBack?: () => void;
  enableSwipeBack?: boolean;
}

export function SwipeableScreen({
  children,
  onSwipeBack,
  enableSwipeBack = true
}: SwipeableScreenProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [1, 0.3]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100 && enableSwipeBack && onSwipeBack) {
      onSwipeBack();
    }
  };

  if (!enableSwipeBack || !onSwipeBack) {
    return <>{children}</>;
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={{ left: 0, right: 0.2 }}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
