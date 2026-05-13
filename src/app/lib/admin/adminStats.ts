import { supabase } from '../../../lib/supabase';
import type { AdminAttentionItem, AdminStats } from '../../types/admin';
import { getAdminEvents } from './adminEvents';
import { getAdminHealthSummary } from './adminHealth';
import { getAdminSupportRequests } from './adminSupport';
import { getAdminUsers } from './adminUsers';

const countOrNull = <T>(result: PromiseSettledResult<{ count: number | null; error: T }>) => {
  if (result.status !== 'fulfilled' || result.value.error) {
    return null;
  }

  return result.value.count ?? 0;
};

export async function getAdminStats(): Promise<AdminStats> {
  const nowIso = new Date().toISOString();

  const [
    totalUsers,
    totalEvents,
    upcomingEvents,
    supportRequests,
    bannedUsers,
    proUsers,
    pendingReports,
    reviewingReports,
    healthSummary,
  ] = await Promise.allSettled([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase
      .from('event_private_details')
      .select('event_id', { count: 'exact', head: true })
      .gte('date_time', nowIso),
    supabase.from('support_requests').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_banned', true),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('plan', 'pro'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'reviewing'),
    getAdminHealthSummary(),
  ]);
  const resolvedHealth = healthSummary.status === 'fulfilled' ? healthSummary.value : null;

  return {
    totalUsers: countOrNull(totalUsers),
    totalEvents: countOrNull(totalEvents),
    upcomingEvents: countOrNull(upcomingEvents),
    supportRequests: countOrNull(supportRequests),
    bannedUsers: countOrNull(bannedUsers),
    proUsers: countOrNull(proUsers),
    pendingReports: countOrNull(pendingReports),
    reviewingReports: countOrNull(reviewingReports),
    errorsLast24h: resolvedHealth?.errorsLast24h ?? null,
    warningsLast24h: resolvedHealth?.warningsLast24h ?? null,
    authIssuesLast24h: resolvedHealth?.authIssuesLast24h ?? null,
  };
}

export async function getAdminNeedsAttention(): Promise<AdminAttentionItem[]> {
  const [usersResult, eventsResult, supportResult, pendingJoinRequestsResult, pendingReportsResult] =
    await Promise.allSettled([
      getAdminUsers(),
      getAdminEvents(),
      getAdminSupportRequests(),
      supabase
        .from('event_join_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

  const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
  const events = eventsResult.status === 'fulfilled' ? eventsResult.value : [];
  const support = supportResult.status === 'fulfilled' ? supportResult.value : [];
  const upcomingEvents = events.filter((event) => !isPast(event.date_time));

  const pendingJoinRequests =
    pendingJoinRequestsResult.status === 'fulfilled' && !pendingJoinRequestsResult.value.error
      ? pendingJoinRequestsResult.value.count ?? 0
      : null;
  const pendingReports =
    pendingReportsResult.status === 'fulfilled' && !pendingReportsResult.value.error
      ? pendingReportsResult.value.count ?? 0
      : null;
  const reviewingReportsResult = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'reviewing');
  const reviewingReports = reviewingReportsResult.error ? null : reviewingReportsResult.count ?? 0;
  const moderatedEvents = events.filter((event) =>
    event.moderation_status === 'hidden' || event.moderation_status === 'removed'
  ).length;
  const bannedUsersWithReason = users.filter((user) => user.is_banned && user.ban_reason).length;
  const healthSummary = await getAdminHealthSummary().catch(() => null);

  return [
    {
      id: 'health-errors',
      label: 'App errors in the last 24h',
      description: 'Recent production diagnostics with error level.',
      count: healthSummary?.errorsLast24h ?? null,
      targetTab: 'health',
    },
    {
      id: 'pending-reports',
      label: 'Pending reports',
      description: 'User reports waiting for moderation review.',
      count: pendingReports,
      targetTab: 'moderation',
    },
    {
      id: 'reviewing-reports',
      label: 'Reports in review',
      description: 'Reports already picked up but not resolved yet.',
      count: reviewingReports,
      targetTab: 'moderation',
    },
    {
      id: 'moderated-events',
      label: 'Hidden or removed events',
      description: 'Events currently affected by moderation.',
      count: moderatedEvents,
      targetTab: 'events',
    },
    {
      id: 'banned-users-with-reason',
      label: 'Banned users with reason',
      description: 'Blocked users that have moderation context attached.',
      count: bannedUsersWithReason,
      targetTab: 'users',
    },
    {
      id: 'support-new',
      label: 'New support requests',
      description: 'Messages that have not been picked up yet.',
      count: support.filter((request) => request.status === 'new').length,
      targetTab: 'support',
    },
    {
      id: 'events-without-participants',
      label: 'Upcoming events without participants',
      description: 'Events that may need organizer attention or promotion.',
      count: upcomingEvents.filter((event) => event.participants_count === 0).length,
      targetTab: 'events',
    },
    {
      id: 'events-without-city',
      label: 'Upcoming events without city',
      description: 'Events harder to discover through city filters.',
      count: upcomingEvents.filter((event) => !event.city).length,
      targetTab: 'events',
    },
    {
      id: 'events-without-location',
      label: 'Upcoming events without location',
      description: 'Events missing a visible location value.',
      count: upcomingEvents.filter((event) => !event.location).length,
      targetTab: 'events',
    },
    {
      id: 'users-without-name',
      label: 'Users without name',
      description: 'Profiles that may look incomplete in participants lists.',
      count: users.filter((user) => !user.name).length,
      targetTab: 'users',
    },
    {
      id: 'banned-users',
      label: 'Banned users',
      description: 'Accounts currently blocked from using the app.',
      count: users.filter((user) => !!user.is_banned).length,
      targetTab: 'users',
    },
    {
      id: 'pending-join-requests',
      label: 'Pending join requests',
      description: 'Available only if event_join_requests is exposed by RLS.',
      count: pendingJoinRequests,
      targetTab: 'events',
    },
  ];
}

function isPast(value: string | null) {
  if (!value) {
    return false;
  }

  const time = new Date(value).getTime();
  return !Number.isNaN(time) && time < Date.now();
}
