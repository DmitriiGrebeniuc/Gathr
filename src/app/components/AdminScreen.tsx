import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminEvents } from './admin/AdminEvents';
import { AdminGrowth } from './admin/AdminGrowth';
import { AdminLayout } from './admin/AdminLayout';
import { AdminModeration } from './admin/AdminModeration';
import { AdminSupportRequests } from './admin/AdminSupportRequests';
import { AdminUsers } from './admin/AdminUsers';
import type {
  AdminAttentionTarget,
  AdminSupportStatusFilter,
  AdminTab,
  LegacyAdminPage,
} from '../types/admin';

type AdminScreenProps = {
  onNavigate: (
    screen: string,
    data?: unknown,
    customDirection?: 'forward' | 'back' | 'up' | 'down'
  ) => void;
  initialPage?: LegacyAdminPage | AdminTab;
  initialSupportStatus?: AdminSupportStatusFilter;
};

type AdminAccessState = 'loading' | 'allowed' | 'denied' | 'error';

export function AdminScreen({
  onNavigate,
  initialPage,
  initialSupportStatus,
}: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => mapInitialPage(initialPage));
  const [accessState, setAccessState] = useState<AdminAccessState>('loading');
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [attentionFilter, setAttentionFilter] = useState<AdminAttentionTarget | null>(null);

  useEffect(() => {
    if (initialPage) {
      setActiveTab(mapInitialPage(initialPage));
    }
  }, [initialPage]);

  useEffect(() => {
    let cancelled = false;

    const checkAdminAccess = async () => {
      setAccessState('loading');

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (!cancelled) {
            setCurrentAdminId(null);
            setAccessState('denied');
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_banned')
          .eq('id', user.id)
          .maybeSingle();

        if (!cancelled) {
          setCurrentAdminId(user.id);
          setAccessState(
            !profileError && profile?.role === 'admin' && !profile?.is_banned
              ? 'allowed'
              : 'denied'
          );
        }
      } catch (error) {
        console.error('Failed to verify admin access:', error);

        if (!cancelled) {
          setCurrentAdminId(null);
          setAccessState('error');
        }
      }
    };

    checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  if (accessState === 'loading') {
    return (
      <AdminShell onBack={() => onNavigate('home', undefined, 'back')}>
        <div className="rounded-2xl border p-5" style={panelStyle}>
          <p className="text-sm text-muted-foreground">Checking admin access...</p>
        </div>
      </AdminShell>
    );
  }

  if (accessState === 'denied' || accessState === 'error') {
    return (
      <AdminShell onBack={() => onNavigate('home', undefined, 'back')}>
        <div className="rounded-2xl border p-5" style={panelStyle}>
          <h1 className="text-xl font-semibold">Admin unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This account does not have access to admin data, or the current session could not
            verify admin permissions.
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => onNavigate('home', undefined, 'back')}
    >
      {activeTab === 'dashboard' && (
        <AdminDashboard
          onOpenAttention={(item) => {
            setAttentionFilter(item.id);
            setActiveTab(item.targetTab);
          }}
        />
      )}
      {activeTab === 'users' && (
        <AdminUsers currentAdminId={currentAdminId} attentionFilter={attentionFilter} />
      )}
      {activeTab === 'events' && (
        <AdminEvents
          onNavigate={onNavigate}
          onOpenUsers={(filter) => {
            setAttentionFilter(filter);
            setActiveTab('users');
          }}
          attentionFilter={attentionFilter}
        />
      )}
      {activeTab === 'support' && (
        <AdminSupportRequests
          initialStatus={
            attentionFilter === 'support-new' ? 'new' : initialSupportStatus ?? 'all'
          }
          onOpenUser={(filter) => {
            setAttentionFilter(filter);
            setActiveTab('users');
          }}
        />
      )}
      {activeTab === 'growth' && <AdminGrowth />}
      {activeTab === 'moderation' && <AdminModeration />}
    </AdminLayout>
  );
}

function AdminShell({
  onBack,
  children,
}: {
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-5 text-foreground">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        {children}
      </div>
    </div>
  );
}

function mapInitialPage(page?: LegacyAdminPage | AdminTab): AdminTab {
  if (
    page === 'events' ||
    page === 'users' ||
    page === 'support' ||
    page === 'growth' ||
    page === 'moderation'
  ) {
    return page;
  }

  if (page === 'participants') {
    return 'growth';
  }

  return 'dashboard';
}

const panelStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--card)',
} as const;
