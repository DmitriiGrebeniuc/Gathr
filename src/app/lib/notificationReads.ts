import { supabase } from '../../lib/supabase';
import { fetchAccessibleEventPrivateDetailsMap } from './publicData';

export function buildUpcomingNotificationKey(eventId: string) {
  return `upcoming-${eventId}`;
}

export function buildJoinNotificationKey(eventId: string, createdAt?: string | null) {
  return `join-${eventId}-${createdAt || 'unknown'}`;
}

export function buildInviteNotificationKey(invitationId: string) {
  return `invite-${invitationId}`;
}

export function buildRequestNotificationKey(requestId: string) {
  return `request-${requestId}`;
}

async function fetchVisibleNotificationKeysForUser(userId: string): Promise<string[]> {
  const { data: notificationSettings, error: notificationSettingsError } = await supabase
    .from('notification_settings')
    .select(
      'notify_upcoming_events, notify_new_participants, notify_event_invitations, notify_event_join_requests'
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (notificationSettingsError) {
    console.error('Failed to load notification settings for unread count:', notificationSettingsError);
  }

  const notifyUpcomingEvents = notificationSettings?.notify_upcoming_events ?? true;
  const notifyNewParticipants = notificationSettings?.notify_new_participants ?? true;
  const notifyEventInvitations = notificationSettings?.notify_event_invitations ?? true;
  const notifyEventJoinRequests = notificationSettings?.notify_event_join_requests ?? true;

  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const keys = new Set<string>();

  const { data: participantRows, error: participantRowsError } = await supabase
    .from('participants')
    .select('event_id')
    .eq('user_id', userId);

  if (participantRowsError) {
    console.error('Failed to load participant rows for unread count:', participantRowsError);
    return [];
  }

  const joinedEventIds = ((participantRows || []) as Array<{ event_id: string | null }>)
    .map((row) => row.event_id)
    .filter((eventId): eventId is string => typeof eventId === 'string' && eventId.length > 0);

  if (notifyUpcomingEvents && joinedEventIds.length > 0) {
    const { data: joinedEvents, error: joinedEventsError } = await supabase
      .from('events')
      .select('id, date_time')
      .in('id', joinedEventIds);

    if (joinedEventsError) {
      console.error('Failed to load upcoming events for unread count:', joinedEventsError);
    } else {
      const privateDetailsMap = await fetchAccessibleEventPrivateDetailsMap(
        (joinedEvents || []).map((event) => event.id)
      );

      (joinedEvents || []).forEach((event) => {
        const dateTime = privateDetailsMap[event.id]?.date_time ?? event.date_time ?? null;

        if (!dateTime) {
          return;
        }

        const eventDate = new Date(dateTime);
        if (Number.isNaN(eventDate.getTime())) {
          return;
        }

        if (eventDate.getTime() >= now.getTime() && eventDate.getTime() <= next24h.getTime()) {
          keys.add(buildUpcomingNotificationKey(event.id));
        }
      });
    }
  }

  const { data: myEvents, error: myEventsError } = await supabase
    .from('events')
    .select('id, date_time')
    .eq('creator_id', userId);

  if (myEventsError) {
    console.error('Failed to load creator events for unread count:', myEventsError);
  }

  const myEventIds = ((myEvents || []) as Array<{ id: string; date_time?: string | null }>).map(
    (event) => event.id
  );

  const myEventPrivateDetailsMap = await fetchAccessibleEventPrivateDetailsMap(myEventIds);
  const futureMyEventIds = new Set(
    ((myEvents || []) as Array<{ id: string; date_time?: string | null }>)
      .filter((event) => {
        const dateTime = myEventPrivateDetailsMap[event.id]?.date_time ?? event.date_time ?? null;
        if (!dateTime) {
          return false;
        }

        const eventDate = new Date(dateTime);
        return !Number.isNaN(eventDate.getTime()) && eventDate.getTime() > now.getTime();
      })
      .map((event) => event.id)
  );

  if (notifyNewParticipants && myEventIds.length > 0) {
    const { data: joins, error: joinsError } = await supabase
      .from('participants')
      .select('event_id, created_at')
      .in('event_id', myEventIds)
      .neq('user_id', userId);

    if (joinsError) {
      console.error('Failed to load join notifications for unread count:', joinsError);
    } else {
      const latestJoinPerEvent = new Map<string, string | null>();

      ((joins || []) as Array<{ event_id: string; created_at: string | null }>).forEach((joinRow) => {
        if (!futureMyEventIds.has(joinRow.event_id)) {
          return;
        }

        const existingCreatedAt = latestJoinPerEvent.get(joinRow.event_id);
        const existingTime = existingCreatedAt ? new Date(existingCreatedAt).getTime() : 0;
        const currentTime = joinRow.created_at ? new Date(joinRow.created_at).getTime() : 0;

        if (!existingCreatedAt || currentTime > existingTime) {
          latestJoinPerEvent.set(joinRow.event_id, joinRow.created_at ?? null);
        }
      });

      latestJoinPerEvent.forEach((createdAt, eventId) => {
        keys.add(buildJoinNotificationKey(eventId, createdAt));
      });
    }
  }

  if (notifyEventJoinRequests && myEventIds.length > 0) {
    const { data: joinRequests, error: joinRequestsError } = await supabase
      .from('event_join_requests')
      .select('id')
      .in('event_id', myEventIds)
      .eq('status', 'pending');

    if (joinRequestsError) {
      console.error('Failed to load join request notifications for unread count:', joinRequestsError);
    } else {
      ((joinRequests || []) as Array<{ id: string }>).forEach((request) => {
        keys.add(buildRequestNotificationKey(request.id));
      });
    }
  }

  if (notifyEventInvitations) {
    const { data: invitations, error: invitationsError } = await supabase
      .from('event_invitations')
      .select('id')
      .eq('invitee_id', userId)
      .eq('status', 'pending');

    if (invitationsError) {
      console.error('Failed to load invitation notifications for unread count:', invitationsError);
    } else {
      ((invitations || []) as Array<{ id: string }>).forEach((invitation) => {
        keys.add(buildInviteNotificationKey(invitation.id));
      });
    }
  }

  return Array.from(keys);
}

export async function fetchUnreadNotificationCountForUser(userId: string): Promise<number> {
  try {
    const notificationKeys = await fetchVisibleNotificationKeysForUser(userId);

    if (notificationKeys.length === 0) {
      return 0;
    }

    const { data: seenRows, error: seenRowsError } = await supabase
      .from('notification_reads')
      .select('notification_key')
      .eq('user_id', userId)
      .in('notification_key', notificationKeys);

    if (seenRowsError) {
      console.error('Failed to load seen notifications:', seenRowsError);
      return 0;
    }

    const seenKeys = new Set(
      ((seenRows || []) as Array<{ notification_key: string | null }>)
        .map((row) => row.notification_key)
        .filter((key): key is string => typeof key === 'string' && key.length > 0)
    );

    return notificationKeys.filter((key) => !seenKeys.has(key)).length;
  } catch (error) {
    console.error('Failed to compute unread notification count:', error);
    return 0;
  }
}

export async function markNotificationKeysSeen(userId: string, notificationKeys: string[]) {
  const uniqueKeys = Array.from(
    new Set(notificationKeys.filter((key): key is string => typeof key === 'string' && key.length > 0))
  );

  if (uniqueKeys.length === 0) {
    return;
  }

  try {
    const { data: existingRows, error: existingRowsError } = await supabase
      .from('notification_reads')
      .select('notification_key')
      .eq('user_id', userId)
      .in('notification_key', uniqueKeys);

    if (existingRowsError) {
      console.error('Failed to load existing notification reads:', existingRowsError);
      return;
    }

    const existingKeys = new Set(
      ((existingRows || []) as Array<{ notification_key: string | null }>)
        .map((row) => row.notification_key)
        .filter((key): key is string => typeof key === 'string' && key.length > 0)
    );

    const missingRows = uniqueKeys
      .filter((key) => !existingKeys.has(key))
      .map((notificationKey) => ({
        user_id: userId,
        notification_key: notificationKey,
      }));

    if (missingRows.length === 0) {
      return;
    }

    const { error: insertError } = await supabase.from('notification_reads').insert(missingRows);

    if (insertError) {
      console.error('Failed to mark notifications as seen:', insertError);
    }
  } catch (error) {
    console.error('Unexpected notification seen-state error:', error);
  }
}
