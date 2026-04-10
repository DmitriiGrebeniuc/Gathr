import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { ReactNode, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, 80], [0, 180]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      }
    }
  };

  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{
          height: 60,
          y: useTransform(y, [0, 80], [-60, 0]),
          opacity: useTransform(y, [0, 80], [0, 1]),
        }}
      >
        <motion.div style={{ rotate }}>
          <RefreshCw size={20} style={{ color: '#D4AF37' }} />
        </motion.div>
      </motion.div>

      <motion.div
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.22, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
        animate={isRefreshing ? { y: 60 } : { y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full overflow-x-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}
