import { ChevronLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { ACTIVITY_TYPES, getActivityTypeMeta, type ActivityType } from '../constants/activityTypes';
import { feedback } from '../lib/feedback';
import { fetchPublicProfileNameMap } from '../lib/publicData';

type SummaryValue = number | null;
type AdminPage = 'overview' | 'events' | 'users' | 'support';
type SupportRequestStatus = 'new' | 'in_progress' | 'resolved';

type EventPreview = {
  id: string;
  title: string;
  date_time: string | null;
  location: string | null;
};

type AdminModerationEvent = {
  id: string;
  title: string;
  description: string | null;
  date_time: string | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  creator_id: string | null;
  creatorName: string | null;
  activity_type: ActivityType | null;
  participantCount: number;
};

type AdminUser = {
  id: string;
  name: string | null;
  role: string | null;
  plan: string | null;
  has_unlimited_access: boolean | null;
  is_banned: boolean | null;
};

type AdminListProfilesRow = {
  id: string;
  name: string | null;
  role: string | null;
  plan: string | null;
  has_unlimited_access: boolean | null;
  is_banned: boolean | null;
};



type InvitationPreview = {
  id: string;
  created_at: string | null;
  inviterName: string | null;
  eventTitle: string | null;
};

type SupportRequestPreview = {
  id: string;
  user_id: string | null;
  subject: string | null;
  message: string | null;
  status: SupportRequestStatus;
  created_at: string | null;
  userName: string | null;
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

const adminCardStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--card)',
} as const;

const adminNestedCardStyle = {
  borderColor: 'var(--border-subtle)',
  backgroundColor: 'var(--surface-strong)',
} as const;

const adminSegmentedStyle = {
  borderColor: 'var(--border-subtle)',
  backgroundColor: 'var(--surface-overlay)',
} as const;

export function AdminScreen({
  onNavigate,
}: {
  onNavigate: (
    screen: string,
    data?: any,
    customDirection?: 'forward' | 'back' | 'up' | 'down'
  ) => void;
}) {
  const { language, translate } = useLanguage();
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<AdminPage>('overview');
  const [summary, setSummary] = useState<AdminSummary>(INITIAL_SUMMARY);
  const [latestEvents, setLatestEvents] = useState<EventPreview[]>([]);
  const [moderationEvents, setModerationEvents] = useState<AdminModerationEvent[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creatorFilter, setCreatorFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'future' | 'past'>('future');
  const [latestPendingInvitations, setLatestPendingInvitations] = useState<InvitationPreview[]>(
    []
  );
  const [supportRequests, setSupportRequests] = useState<SupportRequestPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsUnavailable, setEventsUnavailable] = useState(false);
  const [moderationUnavailable, setModerationUnavailable] = useState(false);
  const [invitationsUnavailable, setInvitationsUnavailable] = useState(false);
  const [usersUnavailable, setUsersUnavailable] = useState(false);
  const [supportUnavailable, setSupportUnavailable] = useState(false);
  const [updatingSupportRequestId, setUpdatingSupportRequestId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [banMutatingUserId, setBanMutatingUserId] = useState<string | null>(null);
  const [editableRole, setEditableRole] = useState<'user' | 'admin'>('user');
  const [editablePlan, setEditablePlan] = useState<'free' | 'pro'>('free');
  const [editableUnlimitedAccess, setEditableUnlimitedAccess] = useState(false);

  const isPastEvent = (dateString?: string | null) => {
    if (!dateString) {
      return false;
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() < Date.now();
  };

  const normalizeSupportStatus = (value: unknown): SupportRequestStatus => {
    if (value === 'in_progress' || value === 'resolved') {
      return value;
    }

    return 'new';
  };

  const loadAdminOverview = async () => {
      setLoading(true);

      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        setCurrentAdminId(authUser?.id ?? null);

        const nowIso = new Date().toISOString();

        const [
          usersResult,
          totalEventsResult,
          futureEventsResult,
          participantsResult,
          pendingInvitationsResult,
          supportRequestsResult,
          latestEventsResult,
          moderationEventsResult,
          latestPendingInvitationsResult,
          usersListResult,
          supportRequestsListResult,
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
            .from('events')
            .select(
              'id, title, description, date_time, location, location_lat, location_lng, creator_id, activity_type'
            )
            .order('date_time', { ascending: false }),
          supabase
            .from('event_invitations')
            .select(`
              id,
              created_at,
              inviter_id,
              events (
                title
              )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.rpc('admin_list_profiles'),
          supabase.rpc('admin_list_support_requests'),

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

        if (moderationEventsResult.status === 'fulfilled' && !moderationEventsResult.value.error) {
          const baseEvents = (moderationEventsResult.value.data as any[] | null) || [];
          const creatorIds = Array.from(
            new Set(baseEvents.map((event) => event.creator_id).filter(Boolean))
          ) as string[];

          const participantCountsResult = await supabase.from('participants').select('event_id');

          const participantCountsMap: Record<string, number> = {};

          if (!participantCountsResult.error) {
            ((participantCountsResult.data as { event_id: string | null }[] | null) || []).forEach(
              (participant) => {
                if (!participant.event_id) {
                  return;
                }

                participantCountsMap[participant.event_id] =
                  (participantCountsMap[participant.event_id] || 0) + 1;
              }
            );
          }

          const creatorNameMapRaw =
            creatorIds.length > 0 ? await fetchPublicProfileNameMap(creatorIds) : {};
          const creatorNameMap = Object.fromEntries(
            Object.entries(creatorNameMapRaw).map(([id, name]) => [
              id,
              name || translate('common.unknown'),
            ])
          );

          const normalizedModerationEvents: AdminModerationEvent[] = baseEvents.map((event) => ({
            id: event.id,
            title: event.title || translate('common.event'),
            description: event.description ?? null,
            date_time: event.date_time ?? null,
            location: event.location ?? null,
            location_lat: typeof event.location_lat === 'number' ? event.location_lat : null,
            location_lng: typeof event.location_lng === 'number' ? event.location_lng : null,
            creator_id: event.creator_id ?? null,
            creatorName: event.creator_id
              ? creatorNameMap[event.creator_id] || translate('common.unknown')
              : translate('common.unknown'),
            activity_type: (event.activity_type || 'other') as ActivityType,
            participantCount: participantCountsMap[event.id] || 0,
          }));

          setModerationEvents(normalizedModerationEvents);
          setModerationUnavailable(
            !!participantCountsResult.error ||
              (creatorIds.length > 0 &&
                Object.keys(creatorNameMap).length === 0 &&
                baseEvents.some((event) => !!event.creator_id))
          );
        } else {
          setModerationEvents([]);
          setModerationUnavailable(true);
        }

        if (
          latestPendingInvitationsResult.status === 'fulfilled' &&
          !latestPendingInvitationsResult.value.error
        ) {
          const invitationRows =
            (latestPendingInvitationsResult.value.data as any[] | null) || [];
          const inviterNameMap = await fetchPublicProfileNameMap(
            invitationRows.map((invitation: any) => invitation.inviter_id)
          );

          const normalizedInvitations = invitationRows.map((invitation: any) => {
            const eventData = Array.isArray(invitation.events)
              ? invitation.events[0]
              : invitation.events;

            return {
              id: invitation.id,
              created_at: invitation.created_at ?? null,
              inviterName:
                inviterNameMap[invitation.inviter_id] || translate('common.unknown'),
              eventTitle: eventData?.title ?? null,
            };
          });

          setLatestPendingInvitations(normalizedInvitations);
          setInvitationsUnavailable(false);
        } else {
          setLatestPendingInvitations([]);
          setInvitationsUnavailable(true);
        }

        if (
          supportRequestsListResult.status === 'fulfilled' &&
          !supportRequestsListResult.value.error
        ) {
          const baseSupportRequests =
            (supportRequestsListResult.value.data as Record<string, unknown>[] | null) || [];

          const normalizedSupportRequests = baseSupportRequests
            .map((request, index) => ({
              id:
                typeof request.id === 'string' && request.id.trim()
                  ? request.id
                  : `${request.user_id ?? 'support'}-${request.subject ?? 'request'}-${index}`,
              user_id:
                typeof request.user_id === 'string' && request.user_id.trim()
                  ? request.user_id
                  : null,
              subject:
                typeof request.subject === 'string' && request.subject.trim()
                  ? request.subject
                  : null,
              message:
                typeof request.message === 'string' && request.message.trim()
                  ? request.message
                  : null,
              status: normalizeSupportStatus(request.status),
              created_at:
                typeof request.created_at === 'string' && request.created_at.trim()
                  ? request.created_at
                  : null,
              userName:
                typeof request.user_name === 'string' && request.user_name.trim()
                  ? request.user_name
                  : translate('common.user'),
              sortIndex: index,
            }))
            .sort((a, b) => {
              if (a.created_at && b.created_at) {
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();

                if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
                  return bTime - aTime;
                }
              }

              if (a.created_at && !b.created_at) {
                return -1;
              }

              if (!a.created_at && b.created_at) {
                return 1;
              }

              return a.sortIndex - b.sortIndex;
            })
            .map(({ sortIndex, ...request }) => request);

          setSupportRequests(normalizedSupportRequests);
          setSupportUnavailable(false);
        } else {
          setSupportRequests([]);
          setSupportUnavailable(true);
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
        setModerationEvents([]);
        setUsers([]);
        setSelectedUserId(null);
        setUserSearch('');
        setLatestPendingInvitations([]);
        setSupportRequests([]);
        setEventsUnavailable(true);
        setModerationUnavailable(true);
        setInvitationsUnavailable(true);
        setUsersUnavailable(true);
        setSupportUnavailable(true);

      } finally {
        setLoading(false);
      }


    };

  useEffect(() => {
    loadAdminOverview();
  }, [language]);

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

  const adminPages: Array<{ key: AdminPage; label: string }> = [
    { key: 'overview', label: translate('admin.pageOverview') },
    { key: 'events', label: translate('admin.pageEvents') },
    { key: 'users', label: translate('admin.pageUsers') },
    { key: 'support', label: translate('admin.pageSupport') },
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

  useEffect(() => {
    setEditableRole(selectedUser?.role === 'admin' ? 'admin' : 'user');
    setEditablePlan(selectedUser?.plan === 'pro' ? 'pro' : 'free');
    setEditableUnlimitedAccess(!!selectedUser?.has_unlimited_access);
  }, [selectedUser]);

  const isSelectedUserDirty = useMemo(() => {
    if (!selectedUser) {
      return false;
    }

    return (
      (selectedUser.role === 'admin' ? 'admin' : 'user') !== editableRole ||
      (selectedUser.plan === 'pro' ? 'pro' : 'free') !== editablePlan ||
      !!selectedUser.has_unlimited_access !== editableUnlimitedAccess
    );
  }, [editablePlan, editableRole, editableUnlimitedAccess, selectedUser]);

  const normalizedCreatorFilter = creatorFilter.trim().toLowerCase();

  const filteredModerationEvents = moderationEvents.filter((event) => {
    const matchesTime = timeFilter === 'future' ? !isPastEvent(event.date_time) : isPastEvent(event.date_time);
    const matchesCreator = !normalizedCreatorFilter
      ? true
      : (event.creatorName || '').toLowerCase().includes(normalizedCreatorFilter);
    const matchesActivity =
      activityFilter === 'all' ? true : (event.activity_type || 'other') === activityFilter;

    return matchesTime && matchesCreator && matchesActivity;
  });

  const handleViewEventDetails = (event: AdminModerationEvent) => {
    onNavigate(
      'event-details',
      {
        ...event,
        backTarget: 'admin',
      },
      'forward'
    );
  };

  const handleViewParticipants = (event: AdminModerationEvent) => {
    onNavigate(
      'participants',
      {
        ...event,
        backTarget: 'admin',
      },
      'forward'
    );
  };

  const handleDeleteEvent = async (event: AdminModerationEvent) => {
    const confirmed = await feedback.confirm({
      title: translate('details.deleteEvent'),
      description: translate('admin.deleteEventConfirm'),
      confirmLabel: translate('details.deleteEvent'),
      cancelLabel: translate('common.cancel'),
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }

    setDeletingEventId(event.id);

    try {
      const { error: invitationsError } = await supabase
        .from('event_invitations')
        .delete()
        .eq('event_id', event.id);

      if (invitationsError) {
        console.error('Admin delete event invitations error:', invitationsError);
        feedback.error(translate('admin.deleteEventFailed'));
        return;
      }

      const { error: participantsError } = await supabase
        .from('participants')
        .delete()
        .eq('event_id', event.id);

      if (participantsError) {
        console.error('Admin delete participants error:', participantsError);
        feedback.error(translate('admin.deleteEventFailed'));
        return;
      }

      const { error: eventError } = await supabase.from('events').delete().eq('id', event.id);

      if (eventError) {
        console.error('Admin delete event error:', eventError);
        feedback.error(translate('admin.deleteEventFailed'));
        return;
      }

      await loadAdminOverview();
    } catch (error) {
      console.error('Unexpected admin delete event error:', error);
      feedback.error(translate('admin.deleteEventUnexpectedError'));
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleSaveSelectedUser = async () => {
    if (!selectedUser) {
      return;
    }

    setSavingUserId(selectedUser.id);

    try {
      const { error } = await supabase.rpc('admin_update_profile_access', {
        target_profile_id: selectedUser.id,
        new_role: editableRole,
        new_plan: editablePlan,
        new_has_unlimited_access: editableUnlimitedAccess,
      });

      if (error) {
        console.error('Admin update profile access error:', error);
        feedback.error(translate('admin.updateUserFailed'));
        return;
      }

      feedback.success(translate('admin.updateUserSuccess'));
      await loadAdminOverview();
    } catch (error) {
      console.error('Unexpected admin update profile access error:', error);
      feedback.error(translate('admin.updateUserUnexpectedError'));
    } finally {
      setSavingUserId(null);
    }
  };

  const handleToggleSelectedUserBan = async () => {
    if (!selectedUser) {
      return;
    }

    if (selectedUser.id === currentAdminId) {
      feedback.warning(translate('admin.cannotBanSelf'));
      return;
    }

    const nextBanState = !selectedUser.is_banned;

    const confirmed = await feedback.confirm({
      title: nextBanState ? translate('admin.banUser') : translate('admin.unbanUser'),
      description: nextBanState
        ? translate('admin.banUserConfirmDescription')
        : translate('admin.unbanUserConfirmDescription'),
      confirmLabel: nextBanState ? translate('admin.banUser') : translate('admin.unbanUser'),
      cancelLabel: translate('common.cancel'),
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }

    setBanMutatingUserId(selectedUser.id);

    try {
      const { error } = await supabase.rpc('admin_set_user_ban_state', {
        target_profile_id: selectedUser.id,
        new_is_banned: nextBanState,
      });

      if (error) {
        console.error('Admin set user ban state error:', error);

        const message = String(error.message || '').toLowerCase();

        if (message.includes('self')) {
          feedback.warning(translate('admin.cannotBanSelf'));
          return;
        }

        feedback.error(
          nextBanState ? translate('admin.banUserFailed') : translate('admin.unbanUserFailed')
        );
        return;
      }

      feedback.success(
        nextBanState ? translate('admin.userBannedSuccess') : translate('admin.userUnbannedSuccess')
      );
      await loadAdminOverview();
    } catch (error) {
      console.error('Unexpected admin set user ban state error:', error);
      feedback.error(
        nextBanState
          ? translate('admin.banUserUnexpectedError')
          : translate('admin.unbanUserUnexpectedError')
      );
    } finally {
      setBanMutatingUserId(null);
    }
  };

  const getSupportStatusMeta = (status: SupportRequestStatus) => {
    switch (status) {
      case 'in_progress':
        return {
          label: translate('admin.supportStatusInProgress'),
          color: 'var(--accent)',
          backgroundColor: 'var(--accent-soft)',
          borderColor: 'var(--accent-border-muted)',
        };
      case 'resolved':
        return {
          label: translate('admin.supportStatusResolved'),
          color: 'var(--success)',
          backgroundColor: 'var(--success-soft)',
          borderColor: 'var(--success-border)',
        };
      case 'new':
      default:
        return {
          label: translate('admin.supportStatusNew'),
          color: 'var(--info)',
          backgroundColor: 'var(--info-soft)',
          borderColor: 'var(--info-border)',
        };
    }
  };

  const handleUpdateSupportRequestStatus = async (
    requestId: string,
    nextStatus: SupportRequestStatus
  ) => {
    setUpdatingSupportRequestId(requestId);

    try {
      const { error } = await supabase.rpc('admin_update_support_request_status', {
        target_request_id: requestId,
        new_status: nextStatus,
      });

      if (error) {
        console.error('Admin update support request status error:', error);
        feedback.error(translate('admin.supportStatusUpdateFailed'));
        return;
      }

      let resolvedEmailFailed = false;

      if (nextStatus === 'resolved') {
        const { data, error: emailError } = await supabase.functions.invoke(
          'send-support-resolved-email',
          {
            body: {
              support_request_id: requestId,
            },
          }
        );

        if (emailError || data?.success === false) {
          console.error('Support resolved email send error:', emailError || data);
          resolvedEmailFailed = true;
        }
      }

      await loadAdminOverview();

      if (nextStatus === 'resolved') {
        if (resolvedEmailFailed) {
          feedback.warning(translate('admin.supportResolvedEmailFailed'));
        } else {
          feedback.success(translate('admin.supportResolvedEmailSent'));
        }

        return;
      }

      feedback.success(translate('admin.supportStatusUpdated'));
    } catch (error) {
      console.error('Unexpected admin update support request status error:', error);
      feedback.error(translate('admin.supportStatusUpdateUnexpectedError'));
    } finally {
      setUpdatingSupportRequestId(null);
    }
  };



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

      <div
        className="flex-1 overflow-y-auto px-6 py-8"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-sm mx-auto space-y-6">
          <div
            className="rounded-xl border p-1 grid grid-cols-4 gap-1"
            style={adminSegmentedStyle}
          >
            {adminPages.map((page) => {
              const isActive = activePage === page.key;

              return (
                <button
                  key={page.key}
                  type="button"
                  onClick={() => setActivePage(page.key)}
                  className="rounded-lg px-3 py-2 text-xs transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                    border: isActive
                      ? '1px solid var(--accent-border)'
                      : '1px solid transparent',
                    color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                  }}
                >
                  {page.label}
                </button>
              );
            })}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'var(--accent-border-muted)',
              backgroundColor: 'var(--card)',
            }}
          >
            <h3 className="mb-2">{translate('admin.enabledTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {translate('admin.enabledDescription')}
            </p>
          </div>

          {activePage === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {summaryCards.map((card) => (
                  <div
                    key={card.key}
                    className="rounded-xl border p-4"
                    style={adminCardStyle}
                  >
                    <p className="text-xs text-muted-foreground mb-2">{card.title}</p>
                    <p className="text-xl" style={{ color: 'var(--accent)' }}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl border p-5"
                style={adminCardStyle}
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
                    style={adminNestedCardStyle}
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
            </>
          )}

          {activePage === 'events' && (
            <div
              className="rounded-xl border p-5"
              style={adminCardStyle}
            >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3>{translate('admin.eventsModerationTitle')}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {translate('admin.eventsModerationDescription')}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTimeFilter('future')}
                className="px-3 py-2 rounded-lg text-sm transition-opacity"
                style={{
                  backgroundColor:
                    timeFilter === 'future' ? 'var(--accent-soft)' : 'var(--surface-strong)',
                  border:
                    timeFilter === 'future'
                      ? '1px solid var(--accent-border)'
                      : '1px solid var(--border-subtle)',
                  color: timeFilter === 'future' ? 'var(--accent)' : 'inherit',
                }}
              >
                {translate('admin.futureFilter')}
              </button>
              <button
                onClick={() => setTimeFilter('past')}
                className="px-3 py-2 rounded-lg text-sm transition-opacity"
                style={{
                  backgroundColor:
                    timeFilter === 'past' ? 'var(--accent-soft)' : 'var(--surface-strong)',
                  border:
                    timeFilter === 'past'
                      ? '1px solid var(--accent-border)'
                      : '1px solid var(--border-subtle)',
                  color: timeFilter === 'past' ? 'var(--accent)' : 'inherit',
                }}
              >
                {translate('admin.pastFilter')}
              </button>
            </div>

            <input
              type="text"
              placeholder={translate('admin.creatorFilterPlaceholder')}
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors mb-4"
              style={{
                backgroundColor: 'var(--surface-strong)',
                borderColor: 'var(--border)',
              }}
            />

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActivityFilter('all')}
                className="px-3 py-2 rounded-full text-xs transition-opacity"
                style={{
                  backgroundColor:
                    activityFilter === 'all' ? 'var(--accent-soft)' : 'var(--surface-strong)',
                  border:
                    activityFilter === 'all'
                      ? '1px solid var(--accent-border)'
                      : '1px solid var(--border-subtle)',
                  color: activityFilter === 'all' ? 'var(--accent)' : 'inherit',
                }}
              >
                {translate('admin.allActivityTypes')}
              </button>

              {ACTIVITY_TYPES.map((activityType) => {
                const meta = getActivityTypeMeta(activityType.value, language);
                const isSelected = activityFilter === activityType.value;

                return (
                  <button
                    key={activityType.value}
                    onClick={() => setActivityFilter(activityType.value)}
                    className="px-3 py-2 rounded-full text-xs transition-opacity"
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--surface-strong)',
                      border: isSelected
                        ? '1px solid var(--accent-border)'
                        : '1px solid var(--border-subtle)',
                      color: isSelected ? 'var(--accent)' : 'inherit',
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
            )}

            {!loading && moderationUnavailable && (
              <p className="text-sm text-muted-foreground">{translate('admin.unavailable')}</p>
            )}

            {!loading && !moderationUnavailable && filteredModerationEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">{translate('admin.noModerationEvents')}</p>
            )}

            {!loading && !moderationUnavailable && filteredModerationEvents.length > 0 && (
              <div className="space-y-3">
                {filteredModerationEvents.map((event) => {
                  const activityMeta = getActivityTypeMeta(event.activity_type || 'other', language);

                  return (
                    <div
                      key={event.id}
                      className="rounded-lg border p-4"
                      style={adminNestedCardStyle}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="mb-1">{event.title || translate('common.event')}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(event.date_time)}
                          </p>
                        </div>
                        <span
                          className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
                          style={{
                            borderColor: 'var(--accent-border-muted)',
                            color: 'var(--accent)',
                            backgroundColor: 'var(--accent-soft-muted)',
                          }}
                        >
                          {activityMeta.label}
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        <p className="text-xs text-muted-foreground">
                          {translate('admin.creatorLabel')}: {event.creatorName || translate('common.unknown')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {translate('admin.participantsLabel')}: {event.participantCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.location || translate('admin.notAvailable')}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewEventDetails(event)}
                          className="px-3 py-2 rounded-lg text-xs transition-opacity"
                          style={{
                            backgroundColor: 'var(--accent-soft)',
                            border: '1px solid var(--accent-border)',
                            color: 'var(--accent)',
                          }}
                        >
                          {translate('admin.viewEventDetails')}
                        </button>
                        <button
                          onClick={() => handleViewParticipants(event)}
                          className="px-3 py-2 rounded-lg text-xs transition-opacity"
                          style={{
                            backgroundColor: 'var(--surface-interactive)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {translate('admin.viewParticipants')}
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event)}
                          disabled={deletingEventId === event.id}
                          className="px-3 py-2 rounded-lg text-xs transition-opacity disabled:opacity-60"
                          style={{
                            backgroundColor: 'var(--destructive-soft)',
                            border: '1px solid var(--destructive-border)',
                            color: 'var(--destructive-strong)',
                            marginLeft: 'auto',
                          }}
                        >
                          {deletingEventId === event.id
                            ? translate('admin.deletingEvent')
                            : translate('details.deleteEvent')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          )}

          {activePage === 'overview' && (
            <div
              className="rounded-xl border p-5"
              style={adminCardStyle}
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
                    style={adminNestedCardStyle}
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
          )}

          {activePage === 'users' && (
            <div
              className="rounded-xl border p-5"
              style={adminCardStyle}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3>{translate('admin.usersTitle')}</h3>
              </div>

              <input
                type="text"
                placeholder={translate('admin.userSearchPlaceholder')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors mb-4"
                style={{
                  backgroundColor: 'var(--surface-strong)',
                  borderColor: 'var(--border)',
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
                <p className="text-sm text-muted-foreground">{translate('admin.noUsersMatch')}</p>
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
                              ? 'var(--accent-border)'
                              : 'var(--border-subtle)',
                            backgroundColor: 'var(--surface-strong)',
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
                    style={adminNestedCardStyle}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h4>{translate('admin.userProfileTitle')}</h4>
                    </div>

                    {!selectedUser && (
                      <p className="text-sm text-muted-foreground">
                        {translate('admin.selectUser')}
                      </p>
                    )}

                    {selectedUser && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p>
                            {translate('common.name')}: {selectedUser.name || translate('common.user')}
                          </p>
                          <p className="text-xs text-muted-foreground break-all">{selectedUser.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {translate('admin.userStatusLabel')}:{' '}
                            <span
                              style={{
                                color: selectedUser.is_banned
                                  ? 'var(--destructive-strong)'
                                  : 'var(--accent)',
                              }}
                            >
                              {selectedUser.is_banned
                                ? translate('admin.bannedStatus')
                                : translate('admin.activeStatus')}
                            </span>
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs text-muted-foreground">
                            {translate('admin.roleLabel')}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['user', 'admin'] as const).map((roleOption) => {
                              const isActive = editableRole === roleOption;

                              return (
                                <button
                                  key={roleOption}
                                  type="button"
                                  onClick={() => setEditableRole(roleOption)}
                                  className="rounded-lg px-3 py-2 text-sm transition-colors"
                                  style={{
                                    backgroundColor: isActive
                                      ? 'var(--accent-soft)'
                                      : 'var(--surface-interactive)',
                                    border: isActive
                                      ? '1px solid var(--accent-border)'
                                      : '1px solid var(--border-subtle)',
                                    color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                                  }}
                                >
                                  {translate(roleOption === 'admin' ? 'admin.roleAdmin' : 'admin.roleUser')}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs text-muted-foreground">
                            {translate('admin.planLabel')}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['free', 'pro'] as const).map((planOption) => {
                              const isActive = editablePlan === planOption;

                              return (
                                <button
                                  key={planOption}
                                  type="button"
                                  onClick={() => setEditablePlan(planOption)}
                                  className="rounded-lg px-3 py-2 text-sm transition-colors"
                                  style={{
                                    backgroundColor: isActive
                                      ? 'var(--accent-soft)'
                                      : 'var(--surface-interactive)',
                                    border: isActive
                                      ? '1px solid var(--accent-border)'
                                      : '1px solid var(--border-subtle)',
                                    color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                                  }}
                                >
                                  {translate(planOption === 'pro' ? 'admin.planPro' : 'admin.planFree')}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditableUnlimitedAccess((prev) => !prev)}
                          className="w-full rounded-xl border px-4 py-3 text-left transition-colors"
                          style={{
                            backgroundColor: editableUnlimitedAccess
                              ? 'var(--accent-soft-muted)'
                              : 'var(--surface-interactive)',
                            borderColor: editableUnlimitedAccess
                              ? 'var(--accent-border-muted)'
                              : 'var(--border-subtle)',
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p>{translate('admin.unlimitedAccessLabel')}</p>
                              <p className="text-xs text-muted-foreground">
                                {editableUnlimitedAccess
                                  ? translate('admin.enabled')
                                  : translate('admin.disabled')}
                              </p>
                            </div>
                            <div
                              className="h-6 w-11 rounded-full p-1 transition-colors"
                              style={{
                                backgroundColor: editableUnlimitedAccess
                                  ? 'var(--toggle-track-active)'
                                  : 'var(--toggle-track-inactive)',
                              }}
                            >
                              <div
                                className="h-4 w-4 rounded-full transition-transform"
                                style={{
                                  backgroundColor: editableUnlimitedAccess
                                    ? 'var(--accent)'
                                    : 'var(--foreground-strong)',
                                  transform: editableUnlimitedAccess
                                    ? 'translateX(20px)'
                                    : 'translateX(0)',
                                }}
                              />
                            </div>
                          </div>
                        </button>

                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={handleSaveSelectedUser}
                            disabled={
                              !isSelectedUserDirty ||
                              savingUserId === selectedUser.id ||
                              banMutatingUserId === selectedUser.id
                            }
                            className="w-full rounded-lg px-4 py-3 text-sm transition-opacity disabled:opacity-50"
                            style={{
                              backgroundColor: 'var(--accent-soft)',
                              border: '1px solid var(--accent-border)',
                              color: 'var(--accent)',
                            }}
                          >
                            {savingUserId === selectedUser.id
                              ? translate('admin.savingUser')
                              : translate('admin.saveChanges')}
                          </button>

                          <button
                            type="button"
                            onClick={handleToggleSelectedUserBan}
                            disabled={
                              banMutatingUserId === selectedUser.id ||
                              savingUserId === selectedUser.id
                            }
                            className="w-full rounded-lg px-4 py-3 text-sm transition-opacity disabled:opacity-50"
                            style={{
                              backgroundColor: 'var(--destructive-soft)',
                              border: '1px solid var(--destructive-border)',
                              color: 'var(--destructive-strong)',
                            }}
                          >
                            {banMutatingUserId === selectedUser.id
                              ? selectedUser.is_banned
                                ? translate('admin.unbanningUser')
                                : translate('admin.banningUser')
                              : selectedUser.is_banned
                                ? translate('admin.unbanUser')
                                : translate('admin.banUser')}
                          </button>

                          <p className="text-[11px] text-muted-foreground">
                            {translate('admin.banUserHint')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activePage === 'support' && (
            <div
              className="rounded-xl border p-5"
              style={adminCardStyle}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3>{translate('admin.supportPageTitle')}</h3>
              </div>

              {loading && (
                <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
              )}

              {!loading && supportUnavailable && (
                <p className="text-sm text-muted-foreground">
                  {translate('admin.supportRequestsUnavailable')}
                </p>
              )}

              {!loading && !supportUnavailable && supportRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {translate('admin.noSupportRequests')}
                </p>
              )}

              {!loading && !supportUnavailable && supportRequests.length > 0 && (
                <div className="space-y-3">
                  {supportRequests.map((request) => (
                    (() => {
                      const statusMeta = getSupportStatusMeta(request.status);
                      const isUpdating = updatingSupportRequestId === request.id;

                      return (
                        <div
                          key={request.id}
                          className="rounded-lg border p-4"
                          style={adminNestedCardStyle}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                {translate('admin.supportRequestFrom')}:{' '}
                                {request.userName || translate('common.user')}
                              </p>
                              {request.created_at && (
                                <p className="text-xs text-muted-foreground">
                                  {translate('admin.submittedAt')}: {formatDate(request.created_at)}
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                                {translate('admin.supportStatusLabel')}
                              </p>
                              <span
                                className="inline-flex rounded-full border px-2 py-1 text-[10px]"
                                style={{
                                  color: statusMeta.color,
                                  backgroundColor: statusMeta.backgroundColor,
                                  borderColor: statusMeta.borderColor,
                                }}
                              >
                                {statusMeta.label}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                                {translate('admin.subjectLabel')}
                              </p>
                              <p>{request.subject || translate('admin.notAvailable')}</p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                                {translate('admin.messageLabel')}
                              </p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                {request.message || translate('admin.notAvailable')}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              {request.status === 'new' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSupportRequestStatus(request.id, 'in_progress')}
                                  disabled={isUpdating}
                                  className="px-3 py-2 rounded-lg text-xs transition-opacity disabled:opacity-60"
                                  style={{
                                    backgroundColor: 'var(--accent-soft)',
                                    border: '1px solid var(--accent-border)',
                                    color: 'var(--accent)',
                                  }}
                                >
                                  {translate('admin.startTicket')}
                                </button>
                              )}

                              {request.status === 'in_progress' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSupportRequestStatus(request.id, 'resolved')}
                                    disabled={isUpdating}
                                    className="px-3 py-2 rounded-lg text-xs transition-opacity disabled:opacity-60"
                                    style={{
                                      backgroundColor: 'var(--success-soft)',
                                      border: '1px solid var(--success-border)',
                                      color: 'var(--success)',
                                    }}
                                  >
                                    {translate('admin.resolveTicket')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSupportRequestStatus(request.id, 'new')}
                                    disabled={isUpdating}
                                    className="px-3 py-2 rounded-lg text-xs transition-opacity disabled:opacity-60"
                                    style={{
                                      backgroundColor: 'var(--surface-interactive)',
                                      border: '1px solid var(--border-subtle)',
                                    }}
                                  >
                                    {translate('admin.backToNew')}
                                  </button>
                                </>
                              )}

                              {request.status === 'resolved' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSupportRequestStatus(request.id, 'new')}
                                  disabled={isUpdating}
                                  className="px-3 py-2 rounded-lg text-xs transition-opacity disabled:opacity-60"
                                  style={{
                                    backgroundColor: 'var(--surface-interactive)',
                                    border: '1px solid var(--border-subtle)',
                                  }}
                                >
                                  {translate('admin.reopenTicket')}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

