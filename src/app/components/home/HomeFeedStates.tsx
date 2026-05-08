import { AnimatePresence, motion } from 'motion/react';
import { LoadingLogo } from '../LoadingLogo';
import { LoadingCard } from '../LoadingState';
import type { HomeTab } from './types';

type HomeInitialLoaderProps = {
  phase: 'hidden' | 'visible' | 'exiting';
  translate: (key: any) => string;
};

export function HomeInitialLoader({ phase, translate }: HomeInitialLoaderProps) {
  if (phase === 'hidden') {
    return null;
  }

  return (
    <motion.div layout transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}>
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key="home-initial-loader"
          layout
          className="overflow-hidden"
          initial={{ opacity: 0, y: 22, scale: 0.972 }}
          animate={
            phase === 'exiting'
              ? { opacity: 0, y: -18, scale: 0.988, height: 0, marginBottom: 0 }
              : { opacity: 1, y: 0, scale: 1, height: 'auto', marginBottom: 0 }
          }
          exit={{ opacity: 0, y: -18, scale: 0.988, height: 0, marginBottom: 0 }}
          transition={{
            opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
            height: { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
            marginBottom: { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <div className="space-y-3 py-1">
            <motion.div
              layout
              className="flex justify-center py-4"
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.94 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <LoadingLogo size={52} label={translate('common.loading')} />
              </motion.div>
            </motion.div>

            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`home-skeleton-${index}`}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{
                  duration: 0.38,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <LoadingCard className="rounded-xl" lines={['42%', '26%', '68%', '84%', '55%']} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

type HomeEmptyStateProps = {
  activeTab: HomeTab;
  selectedCity: string;
  selectedActivityType: string;
  translate: (key: any) => string;
};

export function HomeEmptyState({
  activeTab,
  selectedCity,
  selectedActivityType,
  translate,
}: HomeEmptyStateProps) {
  return (
    <div
      className="rounded-xl p-4 border border-border"
      style={{
        backgroundColor: 'var(--card)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <h3 className="mb-2">
        {activeTab === 'my'
          ? translate('home.noMyEvents')
          : activeTab === 'joined'
            ? translate('home.noJoinedEvents')
            : activeTab === 'visited'
              ? translate('home.noVisitedEvents')
              : translate('home.noDiscoverEvents')}
      </h3>

      <p className="text-sm text-muted-foreground">
        {selectedCity !== 'all'
          ? translate('home.noEventsForCity')
          : selectedActivityType !== 'all'
            ? translate('home.noEventsForFilter')
            : activeTab === 'my'
              ? translate('home.createFirstEvent')
              : activeTab === 'joined'
                ? translate('home.joinedWillAppear')
                : activeTab === 'visited'
                  ? translate('home.visitedWillAppear')
                  : translate('home.noEventsFromOthers')}
      </p>
    </div>
  );
}
