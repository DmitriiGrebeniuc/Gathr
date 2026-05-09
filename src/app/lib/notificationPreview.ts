import { supabase } from '../../lib/supabase';
import {
  fetchAccessibleEventPrivateDetailsMap,
  fetchPublicProfileNameMap,
} from './publicData';
import {
  buildInviteNotificationKey,
  buildJoinNotificationKey,
  buildRequestNotificationKey,
  buildUpcomingNotificationKey,
} from './notificationReads';

type Translate = (key: any) => string;

export type NotificationPreviewItem = {
  id: string;
  type: 'upcoming' | 'join' | 'invite' | 'request';
  message: string;
  time: string;
  isUnread: boolean;
  event: {
    id: string;
    title: string;
    description?: string | null;
    date_time?: string | null;
    location?: string | null;
    creator_id?: string | null;
  };
  sortDate?: string | null;
  sortPriority: number;
};

const pluralize = (template: string, count: number) => {
  const parts = template.split('|');
  const selected = parts.length > 1 && count !== 1 ? parts[1] : parts[0];

  return selected.replaceAll('{count}', String(count));
};

const formatPastTime = (dateString: string | null | undefined, translate: Translate) => {
  if (!dateString) return translate('notifications.justNow');

  const now = new Date();
  const createdDate = new Date(dateString);

  if (Number.isNaN(createdDate.getTime())) {
    return translate('notifications.justNow');
  }

  const diffMs = now.getTime() - createdDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return translate('notifications.justNow');
  if (diffMinutes < 60) {
    return translate('notifications.minutesAgo').replaceAll('{count}', String(diffMinutes));
  }
  if (diffHours < 24) {
    return pluralize(translate('notifications.hoursAgo'), diffHours);
  }
  if (diffDays < 7) {
    return pluralize(translate('notifications.daysAgo'), diffDays);
  }

  return createdDate.toLocaleString();
};

const formatRelativeTime = (dateString: string | null | undefined, translate: Translate) => {
  if (!dateString) return translate('common.timeNotSpecified');

  const now = new Date();
  const eventDate = new Date(dateString);

  if (Number.isNaN(eventDate.getTime())) {
    return translate('common.invalidTime');
  }

  const diffMs = eventDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 0) return translate('notifications.startedAlready');
  if (diffMinutes < 60) {
    return translate('notifications.inMinutes').replaceAll('{count}', String(diffMinutes));
  }
  if (diffHours < 24) {
    return pluralize(translate('notifications.inHours'), diffHours);
  }

  return eventDate.toLocaleString();
};

const buildUpcomingMessage = (
  event: NotificationPreviewItem['event'],
  translate: Translate
) => {
  const now = new Date();
  const eventDate = new Date(event.date_time || '');

  if (Number.isNaN(eventDate.getTime())) {
    return translate('notifications.upcomingDefault').replaceAll('{title}', event.title);
  }

  const diffMs = eventDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 60) {
    return translate('notifications.startsInMinutes')
      .replaceAll('{title}', event.title)
      .replaceAll('{count}', String(diffMinutes));
  }

  if (diffHours < 24) {
    return pluralize(
      translate('notifications.startsInHours').replaceAll('{title}', event.title),
      diffHours
    );
  }

  return translate('notifications.upcomingDefault').replaceAll('{title}', event.title);
};

export async function fetchNotificationPreviewItems(
  translate: Translate,
  limit = 7
): Promise<NotificationPreviewItem[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data: notificationSettings, error: notificationSettingsError } = await supabase
    .from('notification_settings')
    .select(
      'notify_upcoming_events, notify_new_participants, notify_event_invitations, notify_event_join_requests'
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (notificationSettingsError) {
    console.error('Failed to load notification preview settings:', notificationSettingsError);
  }

  const notifyUpcomingEvents = notificationSettings?.notify_upcoming_events ?? true;
  const notifyNewParticipants = notificationSettings?.notify_new_participants ?? true;
  const notifyEventInvitations = notificationSettings?.notify_event_invitations ?? true;
  const notifyEventJoinRequests = notificationSettings?.notify_event_join_requests ?? true;
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: participantRows, error: participantRowsError } = await supabase
    .from('participants')
    .select('event_id')
    .eq('user_id', user.id);

  if (participantRowsError) {
    console.error('Failed to load notification preview participant rows:', participantRowsError);
    return [];
  }

  const joinedEventIds = ((participantRows || []) as Array<{ event_id: string | null }>)
    .map((row) => row.event_id)
    .filter((eventId): eventId is string => typeof eventId === 'string' && eventId.length > 0);

  let upcomingNotifications: NotificationPreviewItem[] = [];

  if (notifyUpcomingEvents && joinedEventIds.length > 0) {
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, description, date_time, location, creator_id')
      .in('id', joinedEventIds);

    if (eventsError) {
      console.error('Failed to load notification preview upcoming events:', eventsError);
    } else {
      const privateDetailsMap = await fetchAccessibleEventPrivateDetailsMap(
        (events || []).map((event) => event.id)
      );

      upcomingNotifications = ((events || []) as NotificationPreviewItem['event'][])
        .map((event) => {
          const mergedEvent = {
            ...event,
            date_time: privateDetailsMap[event.id]?.date_time ?? event.date_time ?? null,
            location: privateDetailsMap[event.id]?.location ?? event.location ?? null,
          };
          const eventDate = mergedEvent.date_time ? new Date(mergedEvent.date_time) : null;
          const isUpcoming =
            eventDate !== null &&
            !Number.isNaN(eventDate.getTime()) &&
            eventDate.getTime() >= now.getTime() &&
            eventDate.getTime() <= next24h.getTime();

          if (!isUpcoming) {
            return null;
          }

          return {
            id: buildUpcomingNotificationKey(event.id),
            type: 'upcoming' as const,
            message: buildUpcomingMessage(mergedEvent, translate),
            time: formatRelativeTime(mergedEvent.date_time, translate),
            event: mergedEvent,
            sortDate: mergedEvent.date_time || null,
            sortPriority: 2,
            isUnread: true,
          };
        })
        .filter(Boolean) as NotificationPreviewItem[];
    }
  }

  const { data: myEvents, error: myEventsError } = await supabase
    .from('events')
    .select('id, title, description, date_time, location, creator_id')
    .eq('creator_id', user.id);

  if (myEventsError) {
    console.error('Failed to load notification preview creator events:', myEventsError);
  }

  const myEventIds = ((myEvents || []) as NotificationPreviewItem['event'][]).map(
    (event) => event.id
  );
  const myEventPrivateDetailsMap = await fetchAccessibleEventPrivateDetailsMap(myEventIds);
  const mergedMyEvents = ((myEvents || []) as NotificationPreviewItem['event'][]).map((event) => ({
    ...event,
    date_time: myEventPrivateDetailsMap[event.id]?.date_time ?? event.date_time ?? null,
    location: myEventPrivateDetailsMap[event.id]?.location ?? event.location ?? null,
  }));

  let joinNotifications: NotificationPreviewItem[] = [];

  if (notifyNewParticipants && myEventIds.length > 0) {
    const { data: joins, error: joinsError } = await supabase
      .from('participants')
      .select('event_id, user_id, created_at')
      .in('event_id', myEventIds)
      .neq('user_id', user.id);

    if (joinsError) {
      console.error('Failed to load notification preview joins:', joinsError);
    } else {
      const groupedJoins = new Map<string, any[]>();
      const nameMap = await fetchPublicProfileNameMap(
        ((joins || []) as any[]).map((joinRow) => joinRow.user_id)
      );

      (joins || []).forEach((joinRow: any) => {
        const eventId = joinRow.event_id;
        groupedJoins.set(eventId, [...(groupedJoins.get(eventId) || []), joinRow]);
      });

      joinNotifications = Array.from(groupedJoins.entries())
        .map(([eventId, eventJoins]) => {
          const relatedEvent = mergedMyEvents.find((event) => event.id === eventId);
          const eventDate = relatedEvent?.date_time ? new Date(relatedEvent.date_time) : null;

          if (!relatedEvent || !eventDate || Number.isNaN(eventDate.getTime()) || eventDate.getTime() <= now.getTime()) {
            return null;
          }

          const sortedJoins = [...eventJoins].sort((a, b) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bTime - aTime;
          });
          const latestJoin = sortedJoins[0];
          const names = sortedJoins.map(
            (joinRow) => nameMap[joinRow.user_id] || translate('notifications.someone')
          );
          const template = translate('notifications.joinedYourEvent').split('|')[
            names.length === 1 ? 0 : 1
          ];
          const namesText =
            names.length <= 2
              ? names.join(` ${translate('notifications.and')} `)
              : `${names[0]}, ${names[1]} ${translate('notifications.and')} ${
                  names.length - 2
                } ${translate('notifications.others')}`;

          return {
            id: buildJoinNotificationKey(eventId, latestJoin.created_at),
            type: 'join' as const,
            message: template
              .replaceAll('{names}', namesText)
              .replaceAll('{title}', relatedEvent.title || translate('common.event')),
            time: formatPastTime(latestJoin.created_at, translate),
            event: relatedEvent,
            sortDate: latestJoin.created_at || null,
            sortPriority: 1,
            isUnread: true,
          };
        })
        .filter(Boolean) as NotificationPreviewItem[];
    }
  }

  let requestNotifications: NotificationPreviewItem[] = [];

  if (notifyEventJoinRequests && myEventIds.length > 0) {
    const { data: joinRequests, error: joinRequestsError } = await supabase
      .from('event_join_requests')
      .select('id, event_id, requester_id, status, created_at')
      .in('event_id', myEventIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (joinRequestsError) {
      console.error('Failed to load notification preview join requests:', joinRequestsError);
    } else {
      const requesterNameMap = await fetchPublicProfileNameMap(
        ((joinRequests || []) as any[]).map((requestRow) => requestRow.requester_id)
      );

      requestNotifications = ((joinRequests || []) as any[])
        .map((requestRow) => {
          const relatedEvent = mergedMyEvents.find((event) => event.id === requestRow.event_id);

          if (!relatedEvent) {
            return null;
          }

          return {
            id: buildRequestNotificationKey(requestRow.id),
            type: 'request' as const,
            message: translate('notifications.requestedToJoinYourEvent')
              .replaceAll(
                '{name}',
                requesterNameMap[requestRow.requester_id] || translate('notifications.someone')
              )
              .replaceAll('{title}', relatedEvent.title || translate('common.event')),
            time: formatPastTime(requestRow.created_at, translate),
            event: relatedEvent,
            sortDate: requestRow.created_at || null,
            sortPriority: 0,
            isUnread: true,
          };
        })
        .filter(Boolean) as NotificationPreviewItem[];
    }
  }

  let inviteNotifications: NotificationPreviewItem[] = [];

  if (notifyEventInvitations) {
    const { data: invitations, error: invitationsError } = await supabase
      .from('event_invitations')
      .select('id, event_id, inviter_id, invitee_id, status, created_at, events (id, title, description, date_time, location, creator_id)')
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (invitationsError) {
      console.error('Failed to load notification preview invitations:', invitationsError);
    } else {
      const invitationEventIds = ((invitations || []) as any[])
        .map((invitation) => {
          const eventData = Array.isArray(invitation.events)
            ? invitation.events[0]
            : invitation.events;
          return eventData?.id || null;
        })
        .filter((eventId): eventId is string => !!eventId);
      const invitationPrivateDetailsMap =
        await fetchAccessibleEventPrivateDetailsMap(invitationEventIds);
      const inviterNameMap = await fetchPublicProfileNameMap(
        ((invitations || []) as any[]).map((invitation) => invitation.inviter_id)
      );

      inviteNotifications = ((invitations || []) as any[])
        .map((invitation) => {
          const eventData = Array.isArray(invitation.events)
            ? invitation.events[0]
            : invitation.events;

          if (!eventData?.id) {
            return null;
          }

          const event = {
            id: eventData.id,
            title: eventData.title,
            description: eventData.description,
            date_time:
              invitationPrivateDetailsMap[eventData.id]?.date_time ?? eventData.date_time,
            location:
              invitationPrivateDetailsMap[eventData.id]?.location ?? eventData.location,
            creator_id: eventData.creator_id,
          };

          return {
            id: buildInviteNotificationKey(invitation.id),
            type: 'invite' as const,
            message: translate('notifications.invitedYouToEvent')
              .replaceAll(
                '{name}',
                inviterNameMap[invitation.inviter_id] || translate('notifications.someone')
              )
              .replaceAll('{title}', event.title || translate('common.event')),
            time: formatPastTime(invitation.created_at, translate),
            event,
            sortDate: invitation.created_at || null,
            sortPriority: 0,
            isUnread: true,
          };
        })
        .filter(Boolean) as NotificationPreviewItem[];
    }
  }

  const mergedNotifications = [
    ...requestNotifications,
    ...inviteNotifications,
    ...joinNotifications,
    ...upcomingNotifications,
  ];
  const uniqueNotifications = Array.from(
    new Map(mergedNotifications.map((notification) => [notification.id, notification])).values()
  );
  const notificationKeys = uniqueNotifications.map((notification) => notification.id);
  const { data: seenRows, error: seenRowsError } =
    notificationKeys.length > 0
      ? await supabase
          .from('notification_reads')
          .select('notification_key')
          .eq('user_id', user.id)
          .in('notification_key', notificationKeys)
      : { data: [], error: null };

  if (seenRowsError) {
    console.error('Failed to load notification preview reads:', seenRowsError);
  }

  const seenKeys = new Set(
    ((seenRows || []) as Array<{ notification_key: string | null }>)
      .map((row) => row.notification_key)
      .filter((key): key is string => typeof key === 'string' && key.length > 0)
  );

  return uniqueNotifications
    .map((notification) => ({
      ...notification,
      isUnread: !seenKeys.has(notification.id),
    }))
    .sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) {
        return a.sortPriority - b.sortPriority;
      }

      const aTime = a.sortDate ? new Date(a.sortDate).getTime() : 0;
      const bTime = b.sortDate ? new Date(b.sortDate).getTime() : 0;

      if (a.type === 'upcoming' && b.type === 'upcoming') {
        return aTime - bTime;
      }

      return bTime - aTime;
    })
    .slice(0, limit);
}
