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
        paddingTop: isHeaderCompact ? 12 : 16,
        paddingBottom: isHeaderCompact ? 12 : 16,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="sticky top-0 z-20 flex items-center justify-between px-6 border-b border-border"
      style={{
        backgroundColor: 'rgba(15, 15, 15, 0.94)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <motion.h1
        animate={{
          scale: isHeaderCompact ? 0.92 : 1,
          transformOrigin: 'left center',
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="text-2xl"
        style={{ color: 'var(--accent)' }}
      >
        Gathr
      </motion.h1>

      <div ref={themePickerRef} className="relative flex items-center gap-2 shrink-0">
        <motion.button
          whileTap={{ scale: 0.92 }}
          animate={{
            width: isHeaderCompact ? 36 : 40,
            height: isHeaderCompact ? 36 : 40,
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={() => setIsThemePickerOpen((prev) => !prev)}
          className="rounded-full flex items-center justify-center border shrink-0"
          style={{
            backgroundColor: isThemePickerOpen ? 'var(--accent-soft)' : 'var(--primary)',
            borderColor: isThemePickerOpen ? 'var(--accent-border-strong)' : 'var(--border)',
            boxShadow: isThemePickerOpen ? 'var(--accent-outline-soft)' : 'none',
            color: isThemePickerOpen ? 'var(--accent)' : 'var(--foreground-strong)',
          }}
          title={translate('profile.appearance')}
        >
          <Palette size={isHeaderCompact ? 16 : 18} strokeWidth={2} />
        </motion.button>

        {isAdmin && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            animate={{
              width: isHeaderCompact ? 36 : 40,
              height: isHeaderCompact ? 36 : 40,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={() =>
              onNavigate('admin', {
                adminPage: 'support',
                supportStatus: 'new',
              })
            }
            className="relative rounded-full flex items-center justify-center border shrink-0"
            style={{
              backgroundColor:
                openSupportTicketCount > 0 ? 'var(--accent-soft)' : 'var(--primary)',
              borderColor:
                openSupportTicketCount > 0 ? 'var(--accent-border-strong)' : 'var(--border)',
              color:
                openSupportTicketCount > 0 ? 'var(--accent)' : 'var(--foreground-strong)',
            }}
            title={translate('admin.supportRequests')}
            aria-label={translate('admin.supportRequests')}
          >
            <LifeBuoy size={isHeaderCompact ? 16 : 18} strokeWidth={2} />
            {openSupportTicketCount > 0 && (
              <span
                className="absolute -right-1 -top-1 min-w-5 h-5 rounded-full px-1 flex items-center justify-center text-[10px] border"
                style={{
                  backgroundColor: 'var(--accent)',
                  borderColor: 'var(--background)',
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
              width: isHeaderCompact ? 36 : 40,
              height: isHeaderCompact ? 36 : 40,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={() => onNavigate('profile')}
            className="rounded-full flex items-center justify-center border shrink-0"
            style={{
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--accent-border)',
              boxShadow: 'var(--accent-outline-soft)',
              color: 'var(--foreground-strong)',
            }}
            title={currentUserName}
          >
            <span className={isHeaderCompact ? 'text-xs' : 'text-sm'}>
              {getInitials(currentUserName)}
            </span>
          </motion.button>

          {hasProPlan && (
            <motion.span
              initial={{ opacity: 0, scale: 0.92, y: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--accent) 92%, white 8%), color-mix(in srgb, var(--accent) 72%, black 28%))',
                borderColor: 'color-mix(in srgb, var(--accent) 72%, white 28%)',
                color: 'var(--accent-foreground)',
                boxShadow: '0 6px 18px color-mix(in srgb, var(--accent) 28%, transparent)',
              }}
            >
              {translate('home.proBadge')}
            </motion.span>
          )}
        </div>

        {isThemePickerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl border p-2"
            style={{
              backgroundColor: 'var(--surface-overlay)',
              borderColor: 'var(--border-subtle)',
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.18)',
            }}
          >
            <div className="space-y-1">
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
                    className="w-full rounded-xl px-3 py-2 text-left transition-all"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-soft-muted)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm">{option.label}</p>
                        {option.hint && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{option.hint}</p>
                        )}
                      </div>

                      <span
                        className="shrink-0"
                        style={{
                          color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                        }}
                      >
                        {isActive ? <Check size={16} strokeWidth={2.25} /> : null}
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
