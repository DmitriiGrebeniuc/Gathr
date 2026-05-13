import { supabase } from '../../../lib/supabase';
import { logSupabaseError } from '../diagnostics';
import { fetchAccessibleEventPrivateDetailsMap, fetchParticipantCounts } from '../publicData';
import type {
  AdminEventParticipantRow,
  AdminEventRow,
  AdminGrowthSnapshot,
} from '../../types/admin';
import { tryLogAdminAction } from './adminAudit';
import { getAdminUsers } from './adminUsers';

type AdminEventRaw = {
  id?: string;
  title?: string | null;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  date_time?: string | null;
  created_at?: string | null;
  creator_id?: string | null;
  activity_type?: string | null;
  join_mode?: string | null;
  visibility?: string | null;
  status?: string | null;
  moderation_status?: string | null;
  moderation_reason?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
};

export async function getAdminEvents(): Promise<AdminEventRow[]> {
  const fullResult = await supabase
    .from('events')
    .select(
      'id, title, description, city, location, location_lat, location_lng, date_time, created_at, creator_id, activity_type, join_mode, visibility, status, moderation_status, moderation_reason, moderated_at, moderated_by'
    )
    .order('created_at', { ascending: false });

  const fallbackResult = fullResult.error
    ? await supabase
        .from('events')
        .select('id, title, description, city, date_time, created_at, creator_id, activity_type, join_mode, status')
        .order('created_at', { ascending: false })
    : fullResult;

  if (fallbackResult.error) {
    void logSupabaseError(fallbackResult.error, { area: 'admin', operation: 'get_admin_events' });
    throw fallbackResult.error;
  }

  const baseEvents = ((fallbackResult.data as AdminEventRaw[] | null) ?? []).filter((event) => event.id);
  const eventIds = baseEvents.map((event) => event.id as string);
  const [privateDetailsMap, participantCountsMap] = await Promise.all([
    fetchAccessibleEventPrivateDetailsMap(eventIds).catch(() => ({})),
    fetchParticipantCounts(eventIds).catch(() => ({})),
  ]);

  return baseEvents.map((event) => {
    const eventId = event.id as string;
    const privateDetails = privateDetailsMap[eventId];

    return {
      id: eventId,
      title: event.title || 'Untitled event',
      description: event.description ?? null,
      city: event.city ?? null,
      location: privateDetails?.location ?? event.location ?? null,
      location_lat:
        typeof privateDetails?.location_lat === 'number'
          ? privateDetails.location_lat
          : event.location_lat ?? null,
      location_lng:
        typeof privateDetails?.location_lng === 'number'
          ? privateDetails.location_lng
          : event.location_lng ?? null,
      date_time: privateDetails?.date_time ?? event.date_time ?? null,
      created_at: event.created_at ?? null,
      creator_id: event.creator_id ?? null,
      activity_type: event.activity_type ?? null,
      join_mode: event.join_mode ?? null,
      visibility: event.visibility ?? null,
      status: event.status ?? null,
      moderation_status: event.moderation_status ?? 'active',
      moderation_reason: event.moderation_reason ?? null,
      moderated_at: event.moderated_at ?? null,
      moderated_by: event.moderated_by ?? null,
      participants_count: participantCountsMap[eventId] ?? null,
    };
  });
}

export async function updateAdminEventVisibilityOrStatus(
  eventId: string,
  updates: { visibility?: 'public' | 'private'; status?: string | null }
) {
  const { error } = await supabase.from('events').update(updates).eq('id', eventId);

  if (error) {
    void logSupabaseError(error, { area: 'admin', operation: 'update_event_visibility_or_status' });
    throw error;
  }

  await tryLogAdminAction({
    action: 'event.visibility_update',
    targetType: 'event',
    targetId: eventId,
    newValue: updates,
  });
}

export async function deleteAdminEvent(eventId: string) {
  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) {
    void logSupabaseError(error, { area: 'admin', operation: 'delete_event' });
    throw error;
  }

  await tryLogAdminAction({
    action: 'event.delete',
    targetType: 'event',
    targetId: eventId,
  });
}

export async function hideAdminEvent(eventId: string, reason?: string) {
  return updateAdminEventModeration(eventId, 'hidden', reason);
}

export async function removeAdminEvent(eventId: string, reason?: string) {
  return updateAdminEventModeration(eventId, 'removed', reason);
}

export async function restoreAdminEvent(eventId: string) {
  return updateAdminEventModeration(eventId, 'active', null);
}

async function updateAdminEventModeration(
  eventId: string,
  moderationStatus: 'active' | 'hidden' | 'removed',
  reason?: string | null
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const payload = {
    moderation_status: moderationStatus,
    moderation_reason: moderationStatus === 'active' ? null : reason?.trim() || null,
    moderated_at: moderationStatus === 'active' ? null : new Date().toISOString(),
    moderated_by: moderationStatus === 'active' ? null : user?.id ?? null,
    ...(moderationStatus === 'hidden' ? { visibility: 'private' } : {}),
    ...(moderationStatus === 'removed' ? { status: 'removed', visibility: 'private' } : {}),
  };

  const { error } = await supabase.from('events').update(payload).eq('id', eventId);

  if (error) {
    void logSupabaseError(error, { area: 'admin', operation: 'update_event_moderation' });
    throw error;
  }

  await tryLogAdminAction({
    action:
      moderationStatus === 'active'
        ? 'event.restore'
        : moderationStatus === 'hidden'
          ? 'event.hide'
          : 'event.remove',
    targetType: 'event',
    targetId: eventId,
    newValue: payload,
  });
}

export async function getAdminEventParticipants(
  eventId: string
): Promise<AdminEventParticipantRow[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, user_id, joined_at, status')
    .eq('event_id', eventId)
    .order('joined_at', { ascending: false });

  if (error) {
    void logSupabaseError(error, { area: 'admin', operation: 'get_event_participants' });
    throw error;
  }

  const rows = ((data as Array<{
    id?: string;
    user_id?: string | null;
    joined_at?: string | null;
    status?: string | null;
  }> | null) ?? []);
  const userIds = rows.map((row) => row.user_id).filter(Boolean) as string[];
  const nameMap = await getProfileNameMap(userIds);

  return rows.map((row) => ({
    id: row.id ?? `${row.user_id ?? 'participant'}-${row.joined_at ?? ''}`,
    user_id: row.user_id ?? null,
    name: row.user_id ? nameMap[row.user_id] ?? null : null,
    status: row.status ?? null,
    joined_at: row.joined_at ?? null,
  }));
}

export async function getAdminGrowthSnapshot(): Promise<AdminGrowthSnapshot> {
  const [events, users] = await Promise.all([getAdminEvents(), getAdminUsers().catch(() => [])]);
  const warnings: string[] = [];

  if (events.some((event) => event.participants_count === null)) {
    warnings.push('Participant counts are partially unavailable because of current access rules.');
  }

  return {
    eventsByCity: toCountList(events.map((event) => event.city || 'Unknown city')),
    eventsByActivityType: toCountList(events.map((event) => event.activity_type || 'other')),
    eventsByJoinMode: toCountList(events.map((event) => event.join_mode || 'open')),
    usersByPlan: toCountList(users.map((user) => user.plan || 'free')),
    usersByRole: toCountList(users.map((user) => user.role || 'user')),
    usersByBannedStatus: toCountList(users.map((user) => (user.is_banned ? 'banned' : 'active'))),
    eventsWithoutParticipants: events
      .filter((event) => event.participants_count === 0)
      .slice(0, 8),
    latestUsers: [...users]
      .sort((a, b) => getTime(b.created_at) - getTime(a.created_at))
      .slice(0, 8),
    latestEvents: [...events]
      .sort((a, b) => getTime(b.created_at) - getTime(a.created_at))
      .slice(0, 8),
    warnings,
  };
}

async function getProfileNameMap(userIds: string[]) {
  if (userIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase.from('profiles').select('id, name').in('id', userIds);

  if (error) {
    return {};
  }

  return ((data as Array<{ id: string; name: string | null }> | null) ?? []).reduce<
    Record<string, string>
  >((acc, row) => {
    if (row.name) {
      acc[row.id] = row.name;
    }

    return acc;
  }, {});
}

function toCountList(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function getTime(value: string | null) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
