import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { AdminTab } from '../../types/admin';

const tabs: Array<{ key: AdminTab; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'events', label: 'Events' },
  { key: 'support', label: 'Support' },
  { key: 'growth', label: 'Growth' },
  { key: 'moderation', label: 'Moderation' },
];

export function AdminLayout({
  activeTab,
  onTabChange,
  onBack,
  children,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-8 pt-5">
        <header className="space-y-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">Gathr operations</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Admin</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Product, users, events and support controls for the current admin account.
            </p>
          </div>

          <nav className="-mx-4 overflow-x-auto px-4 pb-1">
            <div className="flex min-w-max gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onTabChange(tab.key)}
                    className="rounded-full border px-4 py-2 text-sm transition-colors"
                    style={{
                      borderColor: isActive ? 'var(--accent-border)' : 'var(--border-subtle)',
                      backgroundColor: isActive ? 'var(--accent-soft)' : 'var(--surface-strong)',
                      color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </header>

        <main className="mt-5 flex-1">{children}</main>
      </div>
    </div>
  );
}
