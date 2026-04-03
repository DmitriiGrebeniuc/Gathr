import { motion } from 'motion/react';
import { TouchButton } from './TouchButton';

export function WelcomeScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-background">
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl mb-2 tracking-tight"
            style={{ color: '#D4AF37' }}
          >
            Gathr
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground"
          >
            Fast. Simple. Together.
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-sm space-y-3 pb-12"
      >
        <TouchButton
          onClick={() => onNavigate('login')}
          variant="primary"
          fullWidth
        >
          Log In
        </TouchButton>
        <TouchButton
          onClick={() => onNavigate('signup')}
          variant="ghost"
          fullWidth
          style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#D4AF37' }}
        >
          Sign Up
        </TouchButton>
      </motion.div>
    </div>
  );
}
