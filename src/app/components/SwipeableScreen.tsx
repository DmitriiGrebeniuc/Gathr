import { ReactNode, useRef, type PointerEvent as ReactPointerEvent } from 'react';

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
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    tracking: boolean;
  } | null>(null);

  if (!enableSwipeBack || !onSwipeBack) {
    return <>{children}</>;
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    if (event.clientX > 32) {
      gestureRef.current = null;
      return;
    }

    gestureRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      tracking: true,
    };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    gestureRef.current = null;

    if (!gesture?.tracking) {
      return;
    }

    const deltaX = event.clientX - gesture.startX;
    const deltaY = Math.abs(event.clientY - gesture.startY);
    const duration = Math.max(performance.now() - gesture.startTime, 1);
    const velocityX = deltaX / duration;
    const horizontalDominant = deltaX > deltaY * 1.25;

    if (deltaX > 72 && horizontalDominant) {
      onSwipeBack();
      return;
    }

    if (deltaX > 42 && horizontalDominant && velocityX > 0.45) {
      onSwipeBack();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        gestureRef.current = null;
      }}
      className="h-full w-full overflow-x-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
}
