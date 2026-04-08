import { motion } from 'motion/react';

export function LoadingLogo({
  size = 56,
  label,
}: {
  size?: number;
  label?: string;
}) {
  const innerSize = Math.round(size * 0.64);
  const fontSize = Math.round(size * 0.34);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.88, 1, 0.88],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background:
            'radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.04) 55%, rgba(212, 175, 55, 0.02) 100%)',
          boxShadow:
            '0 0 0 1px rgba(212, 175, 55, 0.28), 0 8px 24px rgba(0, 0, 0, 0.35)',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 rounded-full"
          style={{
            border: '1px solid rgba(212, 175, 55, 0.22)',
            borderTopColor: 'rgba(212, 175, 55, 0.9)',
            borderRightColor: 'rgba(212, 175, 55, 0.45)',
          }}
        />

        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: `${innerSize}px`,
            height: `${innerSize}px`,
            backgroundColor: '#141414',
            color: '#D4AF37',
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            letterSpacing: '-0.04em',
            boxShadow: 'inset 0 0 0 1px rgba(212, 175, 55, 0.08)',
          }}
        >
          G
        </div>
      </motion.div>

      {label ? (
        <p className="text-sm text-muted-foreground text-center">{label}</p>
      ) : null}
    </div>
  );
}