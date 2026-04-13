import { motion } from 'motion/react';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export function TouchButton({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: TouchButtonProps) {
  const variants = {
    primary: {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'var(--primary)',
      color: 'var(--destructive-foreground)',
      border: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--destructive-foreground)',
      border: '1px solid var(--border)',
    },
    danger: {
      backgroundColor: 'transparent',
      color: 'var(--destructive)',
      border: '1px solid var(--destructive-border-strong)',
    },
  };

  const style = variants[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`py-4 px-6 rounded-xl transition-all active:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.button>
  );
}
