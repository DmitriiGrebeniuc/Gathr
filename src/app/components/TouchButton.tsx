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
      backgroundColor: '#D4AF37',
      color: '#0F0F0F',
      border: 'none',
    },
    secondary: {
      backgroundColor: '#3A3A3A',
      color: '#FFFFFF',
      border: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    danger: {
      backgroundColor: 'transparent',
      color: '#d4183d',
      border: '1px solid rgba(212, 47, 61, 0.5)',
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
