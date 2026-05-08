import { motion } from 'motion/react';

type HomeLaunchOverlayProps = {
  styles: {
    scrimBackground: string;
    cardBackground: string;
    cardBorder: string;
    cardShadow: string;
    badgeBackground: string;
    badgeBorder: string;
    buttonShadow: string;
  };
  translate: (key: any) => string;
  onDismiss: () => void;
};

export function HomeLaunchOverlay({
  styles,
  translate,
  onDismiss,
}: HomeLaunchOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center px-6"
      style={{
        backgroundColor: styles.scrimBackground,
        backdropFilter: 'blur(6px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-sm rounded-2xl border p-6"
        style={{
          backgroundColor: styles.cardBackground,
          borderColor: styles.cardBorder,
          boxShadow: styles.cardShadow,
        }}
      >
        <div className="space-y-3">
          <div
            className="inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
            style={{
              borderColor: styles.badgeBorder,
              color: 'var(--accent)',
              backgroundColor: styles.badgeBackground,
            }}
          >
            Gathr
          </div>

          <h2 className="text-xl leading-tight">{translate('home.launchOverlayTitle')}</h2>

          <p className="text-sm leading-6 text-muted-foreground">
            {translate('home.launchOverlayText')}
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onDismiss}
          className="mt-6 w-full rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
            boxShadow: styles.buttonShadow,
          }}
        >
          {translate('home.launchOverlayButton')}
        </motion.button>
      </motion.div>
    </div>
  );
}
