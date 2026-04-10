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
  const opacity = useTransform(x, [0, 16], [1, 0.98]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const pointerX =
      'clientX' in event
        ? event.clientX
        : 'changedTouches' in event
          ? event.changedTouches[0]?.clientX ?? 0
          : 0;

    const startedNearEdge = pointerX - info.offset.x <= 32;
    const horizontalDistance = info.offset.x;
    const verticalDistance = Math.abs(info.offset.y);
    const horizontalVelocity = info.velocity.x;
    const horizontalDominant = horizontalDistance > verticalDistance * 1.25;

    if (
      startedNearEdge &&
      horizontalDominant &&
      enableSwipeBack &&
      onSwipeBack &&
      (horizontalDistance > 72 || horizontalVelocity > 500)
    ) {
      onSwipeBack();
    }
  };

  if (!enableSwipeBack || !onSwipeBack) {
    return <>{children}</>;
  }

  return (
    <motion.div
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.04 }}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      className="h-full w-full overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
