import { motion } from 'motion/react';
import { Check, LifeBuoy, Palette } from 'lucide-react';
import type { Dispatch, RefObject, SetStateAction } from 'react';

type ThemeOption = {
  value: 'system' | 'dark' | 'light';
  label: string;
  hint: string | null;
};

type HomeHeaderProps = {
  isHeaderCompact: boolean;
  themePickerRef: RefObject<HTMLDivElement | null>;
  isThemePickerOpen: boolean;
  setIsThemePickerOpen: Dispatch<SetStateAction<boolean>>;
  themeOptions: ThemeOption[];
  themeMode: 'system' | 'dark' | 'light';
  setThemeMode: (mode: 'system' | 'dark' | 'light') => void;
  isAdmin: boolean;
  openSupportTicketCount: number;
  currentUserName: string;
  hasProPlan: boolean;
  getInitials: (name?: string | null) => string;
  translate: (key: any) => string;
  onNavigate: (screen: string, data?: any) => void;
};

export function HomeHeader({
  isHeaderCompact,
  themePickerRef,
  isThemePickerOpen,
  setIsThemePickerOpen,
  themeOptions,
  themeMode,
  setThemeMode,
  isAdmin,
  openSupportTicketCount,
  currentUserName,
  hasProPlan,
  getInitials,
  translate,
  onNavigate,
}: HomeHeaderProps) {
  return (
    <motion.div
      animate={{
        paddingTop: isHeaderCompact ? 10 : 12,
        paddingBottom: isHeaderCompact ? 10 : 12,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="sticky top-0 z-20 flex items-center justify-between px-4"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <motion.h1
        animate={{
          scale: isHeaderCompact ? 0.94 : 1,
          transformOrigin: 'left center',
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="text-xl font-medium"
        style={{ color: 'var(--accent)' }}
      >
        Gathr
      </motion.h1>

      <div ref={themePickerRef} className="relative flex items-center gap-1.5 shrink-0">
        <motion.button
          whileTap={{ scale: 0.92 }}
          animate={{
            width: isHeaderCompact ? 32 : 34,
            height: isHeaderCompact ? 32 : 34,
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={() => setIsThemePickerOpen((prev) => !prev)}
          className="rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isThemePickerOpen ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            color: isThemePickerOpen ? 'var(--accent)' : 'var(--muted-foreground)',
          }}
          title={translate('profile.appearance')}
        >
          <Palette size={isHeaderCompact ? 14 : 16} strokeWidth={1.75} />
        </motion.button>

        {isAdmin && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            animate={{
              width: isHeaderCompact ? 32 : 34,
              height: isHeaderCompact ? 32 : 34,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={() =>
              onNavigate('admin', {
                adminPage: 'support',
                supportStatus: 'new',
              })
            }
            className="relative rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor:
                openSupportTicketCount > 0 ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              color:
                openSupportTicketCount > 0 ? 'var(--accent)' : 'var(--muted-foreground)',
            }}
            title={translate('admin.supportRequests')}
            aria-label={translate('admin.supportRequests')}
          >
            <LifeBuoy size={isHeaderCompact ? 14 : 16} strokeWidth={1.75} />
            {openSupportTicketCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 min-w-4 h-4 rounded-full px-0.5 flex items-center justify-center text-[9px] font-medium"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                {openSupportTicketCount > 99 ? '99+' : openSupportTicketCount}
              </span>
            )}
          </motion.button>
        )}

        <div className="relative shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            animate={{
              width: isHeaderCompact ? 32 : 34,
              height: isHeaderCompact ? 32 : 34,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={() => onNavigate('profile')}
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              color: 'var(--accent)',
            }}
            title={currentUserName}
          >
            <span className="text-[11px] font-medium">
              {getInitials(currentUserName)}
            </span>
          </motion.button>

          {hasProPlan && (
            <motion.span
              initial={{ opacity: 0, scale: 0.92, y: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
              }}
            >
              {translate('home.proBadge')}
            </motion.span>
          )}
        </div>

        {isThemePickerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full mt-1.5 w-48 rounded-lg p-1.5"
            style={{
              backgroundColor: 'rgba(18, 18, 18, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.24)',
            }}
          >
            <div className="space-y-0.5">
              {themeOptions.map((option) => {
                const isActive = themeMode === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setThemeMode(option.value);
                      setIsThemePickerOpen(false);
                    }}
                    className="w-full rounded-md px-2.5 py-1.5 text-left transition-all"
                    style={{
                      backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs">{option.label}</p>
                        {option.hint && (
                          <p className="text-[10px] text-muted-foreground">{option.hint}</p>
                        )}
                      </div>

                      <span
                        className="shrink-0"
                        style={{
                          color: isActive ? 'var(--accent)' : 'transparent',
                        }}
                      >
                        {isActive ? <Check size={12} strokeWidth={2.5} /> : null}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
