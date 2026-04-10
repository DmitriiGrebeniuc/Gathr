import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

type SummaryValue = number | null;

type EventPreview = {
  id: string;
  title: string;
  date_time: string | null;
  location: string | null;
};

type AdminUser = {
  id: string;
  name: string | null;
  role: string | null;
  plan: string | null;
  has_unlimited_access: boolean | null;
};

type AdminListProfilesRow = {
  id: string;
  name: string | null;
  role: string | null;
  plan: string | null;
  has_unlimited_access: boolean | null;
};



type InvitationPreview = {
  id: string;
  created_at: string | null;
  inviterName: string | null;
  eventTitle: string | null;
};


type AdminSummary = {
  totalUsers: SummaryValue;
  totalEvents: SummaryValue;
  futureEvents: SummaryValue;
  participants: SummaryValue;
  pendingInvitations: SummaryValue;
  supportRequests: SummaryValue;
};

const INITIAL_SUMMARY: AdminSummary = {
  totalUsers: null,
  totalEvents: null,
  futureEvents: null,
  participants: null,
  pendingInvitations: null,
  supportRequests: null,
};

export function AdminScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { translate } = useLanguage();
  const [summary, setSummary] = useState<AdminSummary>(INITIAL_SUMMARY);
  const [latestEvents, setLatestEvents] = useState<EventPreview[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [latestPendingInvitations, setLatestPendingInvitations] = useState<InvitationPreview[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [eventsUnavailable, setEventsUnavailable] = useState(false);
  const [invitationsUnavailable, setInvitationsUnavailable] = useState(false);
  const [usersUnavailable, setUsersUnavailable] = useState(false);


  useEffect(() => {
    const loadAdminOverview = async () => {
      setLoading(true);

      try {
        const nowIso = new Date().toISOString();

        const [
          usersResult,
          totalEventsResult,
          futureEventsResult,
          participantsResult,
          pendingInvitationsResult,
          supportRequestsResult,
          latestEventsResult,
          latestPendingInvitationsResult,
          usersListResult,
        ] = await Promise.allSettled([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),

          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .gte('date_time', nowIso),
          supabase.from('participants').select('*', { count: 'exact', head: true }),
          supabase
            .from('event_invitations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase.from('support_requests').select('*', { count: 'exact', head: true }),
          supabase
            .from('events')
            .select('id, title, date_time, location')
            .order('date_time', { ascending: false })
            .limit(5),
          supabase
            .from('event_invitations')
            .select(`
              id,
              created_at,
              inviter:profiles!event_invitations_inviter_id_fkey (
                name
              ),
              events (
                title
              )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.rpc('admin_list_profiles'),

        ]);



        setSummary({
          totalUsers:
            usersResult.status === 'fulfilled' && !usersResult.value.error
              ? usersResult.value.count ?? 0
              : null,
          totalEvents:
            totalEventsResult.status === 'fulfilled' && !totalEventsResult.value.error
              ? totalEventsResult.value.count ?? 0
              : null,
          futureEvents:
            futureEventsResult.status === 'fulfilled' && !futureEventsResult.value.error
              ? futureEventsResult.value.count ?? 0
              : null,
          participants:
            participantsResult.status === 'fulfilled' && !participantsResult.value.error
              ? participantsResult.value.count ?? 0
              : null,
          pendingInvitations:
            pendingInvitationsResult.status === 'fulfilled' &&
              !pendingInvitationsResult.value.error
              ? pendingInvitationsResult.value.count ?? 0
              : null,
          supportRequests:
            supportRequestsResult.status === 'fulfilled' && !supportRequestsResult.value.error
              ? supportRequestsResult.value.count ?? 0
              : null,
        });

        if (latestEventsResult.status === 'fulfilled' && !latestEventsResult.value.error) {
          setLatestEvents((latestEventsResult.value.data as EventPreview[] | null) || []);
          setEventsUnavailable(false);
        } else {
          setLatestEvents([]);
          setEventsUnavailable(true);
        }

        if (
          latestPendingInvitationsResult.status === 'fulfilled' &&
          !latestPendingInvitationsResult.value.error
        ) {
          const normalizedInvitations = (
            (latestPendingInvitationsResult.value.data as any[] | null) || []
          ).map((invitation: any) => {
            const inviterData = Array.isArray(invitation.inviter)
              ? invitation.inviter[0]
              : invitation.inviter;

            const eventData = Array.isArray(invitation.events)
              ? invitation.events[0]
              : invitation.events;

            return {
              id: invitation.id,
              created_at: invitation.created_at ?? null,
              inviterName: inviterData?.name ?? null,
              eventTitle: eventData?.title ?? null,
            };
          });

          setLatestPendingInvitations(normalizedInvitations);
          setInvitationsUnavailable(false);
        } else {
          setLatestPendingInvitations([]);
          setInvitationsUnavailable(true);
        }
        
        if (usersListResult.status === 'fulfilled' && !usersListResult.value.error) {
          const nextUsers = (usersListResult.value.data as AdminListProfilesRow[] | null) || [];


          setUsers(nextUsers);
          setUsersUnavailable(false);
          setSelectedUserId((prev) =>
            prev && nextUsers.some((user) => user.id === prev) ? prev : nextUsers[0]?.id ?? null
          );
        } else {
          setUsers([]);
          setUsersUnavailable(true);
          setSelectedUserId(null);
          setUserSearch('');
        }



      } catch (error) {
        console.error('Unexpected admin overview load error:', error);
        setSummary(INITIAL_SUMMARY);
        setLatestEvents([]);
        setUsers([]);
        setSelectedUserId(null);
        setUserSearch('');
        setLatestPendingInvitations([]);
        setEventsUnavailable(true);
        setInvitationsUnavailable(true);
        setUsersUnavailable(true);

      } finally {
        setLoading(false);
      }


    };

    loadAdminOverview();
  }, []);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) {
      return translate('admin.notAvailable');
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return translate('admin.notAvailable');
    }

    return date.toLocaleString();
  };

  const getSummaryValue = (value: SummaryValue) => {
    if (loading) {
      return translate('common.loading');
    }

    if (value === null) {
      return translate('admin.unavailable');
    }

    return String(value);
  };

  const summaryCards = [
    {
      key: 'users',
      title: translate('admin.totalUsers'),
      value: getSummaryValue(summary.totalUsers),
    },
    {
      key: 'events',
      title: translate('admin.totalEvents'),
      value: getSummaryValue(summary.totalEvents),
    },
    {
      key: 'future-events',
      title: translate('admin.futureEvents'),
      value: getSummaryValue(summary.futureEvents),
    },
    {
      key: 'participants',
      title: translate('admin.participantsCount'),
      value: getSummaryValue(summary.participants),
    },
    {
      key: 'pending-invitations',
      title: translate('admin.pendingInvitations'),
      value: getSummaryValue(summary.pendingInvitations),
    },
    {
      key: 'support-requests',
      title: translate('admin.supportRequests'),
      value: getSummaryValue(summary.supportRequests),
    },
  ];

  const normalizedUserSearch = userSearch.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!normalizedUserSearch) {
      return true;
    }

    const name = user.name?.toLowerCase() || '';
    return name.includes(normalizedUserSearch);
  });

  const selectedUser =
    filteredUsers.find((user) => user.id === selectedUserId) || filteredUsers[0] || null;



  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 -ml-2 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <h1>{translate('admin.title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.28)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <h3 className="mb-2">{translate('admin.enabledTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {translate('admin.enabledDescription')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((card) => (
              <div
                key={card.key}
                className="rounded-xl border p-4"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: '#1A1A1A',
                }}
              >
                <p className="text-xs text-muted-foreground mb-2">{card.title}</p>
                <p className="text-xl" style={{ color: '#D4AF37' }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3>{translate('admin.latestEvents')}</h3>
              <span className="text-xs text-muted-foreground">
                {translate('admin.readOnly')}
              </span>
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
            )}

            {!loading && eventsUnavailable && (
              <p className="text-sm text-muted-foreground">{translate('admin.unavailable')}</p>
            )}

            {!loading && !eventsUnavailable && latestEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">{translate('admin.noEvents')}</p>
            )}

            {!loading && !eventsUnavailable && latestEvents.length > 0 && (
              <div className="space-y-3">
                {latestEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#111111',
                    }}
                  >
                    <p className="mb-1">{event.title || translate('common.event')}</p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatDate(event.date_time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.location || translate('admin.notAvailable')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3>{translate('admin.latestPendingInvitations')}</h3>
              <span className="text-xs text-muted-foreground">
                {translate('admin.readOnly')}
              </span>
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
            )}

            {!loading && invitationsUnavailable && (
              <p className="text-sm text-muted-foreground">{translate('admin.unavailable')}</p>
            )}

            {!loading && !invitationsUnavailable && latestPendingInvitations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {translate('admin.noPendingInvitations')}
              </p>
            )}

            {!loading && !invitationsUnavailable && latestPendingInvitations.length > 0 && (
              <div className="space-y-3">
                {latestPendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#111111',
                    }}
                  >
                    <p className="mb-1">
                      {invitation.eventTitle || translate('common.event')}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {translate('admin.invitedBy')}: {invitation.inviterName || translate('common.unknown')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(invitation.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3>{translate('admin.usersTitle')}</h3>
              <span className="text-xs text-muted-foreground">
                {translate('admin.readOnly')}
              </span>
            </div>

            <input
              type="text"
              placeholder={translate('admin.userSearchPlaceholder')}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors mb-4"
              style={{
                backgroundColor: '#111111',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />

            {loading && (
              <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
            )}

            {!loading && usersUnavailable && (
              <p className="text-sm text-muted-foreground">{translate('admin.unavailable')}</p>
            )}

            {!loading && !usersUnavailable && users.length === 0 && (
              <p className="text-sm text-muted-foreground">{translate('admin.noUsers')}</p>
            )}

            {!loading && !usersUnavailable && users.length > 0 && filteredUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {translate('admin.noUsersMatch')}
              </p>
            )}

            {!loading && !usersUnavailable && filteredUsers.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {filteredUsers.map((user) => {
                    const isSelected = user.id === selectedUserId;

                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className="w-full rounded-lg border p-3 text-left transition-colors"
                        style={{
                          borderColor: isSelected
                            ? 'rgba(212, 175, 55, 0.35)'
                            : 'rgba(255, 255, 255, 0.08)',
                          backgroundColor: '#111111',
                        }}
                      >
                        <p className="mb-1">{user.name || translate('common.user')}</p>
                        <p className="text-xs text-muted-foreground">
                          {translate('admin.roleLabel')}: {user.role || translate('admin.notAvailable')}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="rounded-lg border p-4"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: '#111111',
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4>{translate('admin.userProfileTitle')}</h4>
                    <span className="text-xs text-muted-foreground">
                      {translate('admin.readOnly')}
                    </span>
                  </div>

                  {!selectedUser && (
                    <p className="text-sm text-muted-foreground">
                      {translate('admin.selectUser')}
                    </p>
                  )}

                  {selectedUser && (
                    <div className="space-y-2">
                      <p>
                        {translate('common.name')}: {selectedUser.name || translate('common.user')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {translate('admin.roleLabel')}: {selectedUser.role || translate('admin.notAvailable')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {translate('admin.planLabel')}: {selectedUser.plan || translate('admin.notAvailable')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {translate('admin.unlimitedAccessLabel')}:{' '}
                        {selectedUser.has_unlimited_access
                          ? translate('admin.enabled')
                          : translate('admin.disabled')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>



          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <h3 className="mb-2">{translate('admin.comingSoonTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {translate('admin.comingSoonDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
