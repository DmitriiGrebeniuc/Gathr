import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { LoadingLogo } from './LoadingLogo';
import { feedback } from '../lib/feedback';
import {
  fetchAccessibleEventPrivateDetailsMap,
  fetchPublicProfileNameMap,
} from '../lib/publicData';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  date_time?: string | null;
  location?: string | null;
  creator_id?: string | null;
};

type NotificationItem = {
  id: string;
  type: 'upcoming' | 'join' | 'invite';
  message: string;
  time: string;
  event: EventItem;
  sortDate?: string | null;
  sortPriority: number;
  invitationId?: string;
};

export function NotificationsScreen({
  onNavigate,
}: {
  onNavigate?: (screen: string, data?: any) => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingInvitationId, setProcessingInvitationId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'accept' | 'decline' | null>(null);

  const { translate } = useLanguage();

  const pluralize = (template: string, count: number) => {
    const parts = template.split('|');
    if (parts.length === 1) {
      return template.replaceAll('{count}', String(count));
    }

    const selected = count === 1 ? parts[0] : parts[1];
    return selected.replaceAll('{count}', String(count));
  };

  const formatRelativeTime = (dateString?: string | null) => {
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

  const formatPastTime = (dateString?: string | null) => {
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

  const buildUpcomingMessage = (event: EventItem) => {
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

  const fetchNotifications = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Ошибка получения пользователя:', userError);
        setNotifications([]);
        setLoading(false);
        return;
      }

      const { data: notificationSettings, error: notificationSettingsError } = await supabase
        .from('notification_settings')
        .select('notify_upcoming_events, notify_new_participants, notify_event_invitations')
        .eq('user_id', user.id)
        .maybeSingle();

      if (notificationSettingsError) {
        console.error('Ошибка загрузки notification settings:', notificationSettingsError);
      }

      const notifyUpcomingEvents = notificationSettings?.notify_upcoming_events ?? true;
      const notifyNewParticipants = notificationSettings?.notify_new_participants ?? true;
      const notifyEventInvitations = notificationSettings?.notify_event_invitations ?? true;

      const now = new Date();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { data: participantRows, error: participantRowsError } = await supabase
        .from('participants')
        .select('event_id')
        .eq('user_id', user.id);

      if (participantRowsError) {
        console.error('Ошибка загрузки participant rows:', participantRowsError);
        setNotifications([]);
        setLoading(false);
        return;
      }

      const eventIds = (participantRows || []).map((p: any) => p.event_id);

      let upcomingNotifications: NotificationItem[] = [];

      if (notifyUpcomingEvents && eventIds.length > 0) {
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .order('created_at', { ascending: true });

        if (eventsError) {
          console.error('Ошибка загрузки upcoming events:', eventsError);
        } else {
          const privateDetailsMap = await fetchAccessibleEventPrivateDetailsMap(
            ((events || []) as EventItem[]).map((event) => event.id)
          );

          upcomingNotifications = ((events || []) as EventItem[])
            .map((event) => {
              const mergedEvent: EventItem = {
                ...event,
                date_time: privateDetailsMap[event.id]?.date_time ?? event.date_time ?? null,
                location: privateDetailsMap[event.id]?.location ?? event.location ?? null,
              };

              const eventDate = mergedEvent.date_time
                ? new Date(mergedEvent.date_time)
                : null;

              const isUpcoming =
                eventDate !== null &&
                !Number.isNaN(eventDate.getTime()) &&
                eventDate.getTime() >= now.getTime() &&
                eventDate.getTime() <= next24h.getTime();

              if (!isUpcoming) {
                return null;
              }

              return {
                id: `upcoming-${event.id}`,
                type: 'upcoming',
                message: buildUpcomingMessage(mergedEvent),
                time: formatRelativeTime(mergedEvent.date_time),
                event: mergedEvent,
                sortDate: mergedEvent.date_time || null,
                sortPriority: 2,
              };
            })
            .filter(Boolean) as NotificationItem[];
        }
      }

      const { data: myEvents, error: myEventsError } = await supabase
        .from('events')
        .select('id, title, description, date_time, location, creator_id')
        .eq('creator_id', user.id);

      if (myEventsError) {
        console.error('Ошибка загрузки событий пользователя:', myEventsError);
      }

      const myEventIds = (myEvents || []).map((e: any) => e.id);
      const myEventPrivateDetailsMap = await fetchAccessibleEventPrivateDetailsMap(myEventIds);
      const mergedMyEvents: EventItem[] = ((myEvents || []) as EventItem[]).map((event) => ({
        ...event,
        date_time: myEventPrivateDetailsMap[event.id]?.date_time ?? event.date_time ?? null,
        location: myEventPrivateDetailsMap[event.id]?.location ?? event.location ?? null,
      }));

      let joinNotifications: NotificationItem[] = [];

      if (notifyNewParticipants && myEventIds.length > 0) {
        const { data: joins, error: joinsError } = await supabase
          .from('participants')
          .select('event_id, user_id, created_at')
          .in('event_id', myEventIds)
          .neq('user_id', user.id);

        if (joinsError) {
          console.error('Ошибка загрузки join notifications:', joinsError);
        } else {
          const groupedJoins = new Map<string, any[]>();
          const nameMap = await fetchPublicProfileNameMap(
            ((joins || []) as any[]).map((joinRow: any) => joinRow.user_id)
          );

          (joins || []).forEach((joinRow: any) => {
            const eventId = joinRow.event_id;

            if (!groupedJoins.has(eventId)) {
              groupedJoins.set(eventId, []);
            }

            groupedJoins.get(eventId)?.push(joinRow);
          });

          joinNotifications = Array.from(groupedJoins.entries())
            .map(([eventId, eventJoins]) => {
              const relatedEvent = mergedMyEvents.find((e: any) => e.id === eventId);

              const eventDate = relatedEvent?.date_time
                ? new Date(relatedEvent.date_time)
                : null;

              const isFutureEvent =
                eventDate !== null &&
                !Number.isNaN(eventDate.getTime()) &&
                eventDate.getTime() > now.getTime();

              if (!isFutureEvent) {
                return null;
              }

              const sortedJoins = [...eventJoins].sort((a, b) => {
                const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                return bTime - aTime;
              });

              const latestJoin = sortedJoins[0];

              const names = sortedJoins.map(
                (joinRow: any) => nameMap[joinRow.user_id] || translate('notifications.someone')
              );

              let message = '';

              if (names.length === 1) {
                message = translate('notifications.joinedYourEvent')
                  .split('|')[0]
                  .replaceAll('{names}', names[0])
                  .replaceAll('{title}', relatedEvent?.title || '');
              } else if (names.length === 2) {
                message = translate('notifications.joinedYourEvent')
                  .split('|')[1]
                  .replaceAll('{names}', `${names[0]} ${translate('notifications.and')} ${names[1]}`)
                  .replaceAll('{title}', relatedEvent?.title || '');
              } else {
                message = translate('notifications.joinedYourEvent')
                  .split('|')[1]
                  .replaceAll(
                    '{names}',
                    `${names[0]}, ${names[1]} ${translate('notifications.and')} ${names.length - 2} ${translate('notifications.others')}`
                  )
                  .replaceAll('{title}', relatedEvent?.title || '');
              }

              return {
                id: `join-${eventId}`,
                type: 'join',
                message,
                time: formatPastTime(latestJoin.created_at),
                event: relatedEvent || {
                  id: eventId,
                  title: translate('common.event'),
                  description: null,
                  date_time: null,
                  location: null,
                  creator_id: user.id,
                },
                sortDate: latestJoin.created_at || null,
                sortPriority: 1,
              };
            })
            .filter(Boolean) as NotificationItem[];
        }
      }

      let inviteNotifications: NotificationItem[] = [];

      if (notifyEventInvitations) {
        const { data: invitations, error: invitationsError } = await supabase
          .from('event_invitations')
          .select(`
      id,
      event_id,
      inviter_id,
      invitee_id,
      status,
      created_at,
      events (
        id,
        title,
        description,
        date_time,
        location,
        creator_id
      )
    `)
          .eq('invitee_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (invitationsError) {
          console.error('Ошибка загрузки invitations:', invitationsError);
        } else {
          const inviterNameMap = await fetchPublicProfileNameMap(
            ((invitations || []) as any[]).map((invitation: any) => invitation.inviter_id)
          );

          inviteNotifications = (invitations || [])
            .map((invitation: any) => {
              const eventData = Array.isArray(invitation.events)
                ? invitation.events[0]
                : invitation.events;

              if (!eventData?.id) {
                return null;
              }

              const inviterName =
                inviterNameMap[invitation.inviter_id] || translate('notifications.someone');

              return {
                id: `invite-${invitation.id}`,
                type: 'invite' as const,
                message: translate('notifications.invitedYouToEvent')
                  .replaceAll('{name}', inviterName)
                  .replaceAll('{title}', eventData.title || translate('common.event')),
                time: formatPastTime(invitation.created_at),
                event: {
                  id: eventData.id,
                  title: eventData.title,
                  description: eventData.description,
                  date_time: eventData.date_time,
                  location: eventData.location,
                  creator_id: eventData.creator_id,
                },
                sortDate: invitation.created_at || null,
                sortPriority: 0,
                invitationId: invitation.id,
              };
            })
            .filter(Boolean) as NotificationItem[];
        }
      }

      const mergedNotifications = [
        ...inviteNotifications,
        ...joinNotifications,
        ...upcomingNotifications,
      ];

      const uniqueNotifications = Array.from(
        new Map(mergedNotifications.map((notification) => [notification.id, notification])).values()
      );

      uniqueNotifications.sort((a, b) => {
        if (a.sortPriority !== b.sortPriority) {
          return a.sortPriority - b.sortPriority;
        }

        const aTime = a.sortDate ? new Date(a.sortDate).getTime() : 0;
        const bTime = b.sortDate ? new Date(b.sortDate).getTime() : 0;

        if (a.type === 'join' || a.type === 'invite') {
          return bTime - aTime;
        }

        return aTime - bTime;
      });

      setNotifications(uniqueNotifications);
    } catch (error) {
      console.error('Notifications error:', error);
      setNotifications([]);
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const handleAcceptInvitation = async (notification: NotificationItem) => {
    if (!notification.invitationId) return;

    setProcessingInvitationId(notification.invitationId);
    setProcessingAction('accept');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        feedback.error(translate('notifications.inviteActionFailed'));
        return;
      }

      const { error: updateError } = await supabase
        .from('event_invitations')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', notification.invitationId)
        .eq('invitee_id', user.id)
        .eq('status', 'pending');

      if (updateError) {
        console.error('Ошибка принятия invitation:', updateError);
        feedback.error(translate('notifications.inviteActionFailed'));
        return;
      }

      const { error: participantError } = await supabase.from('participants').insert([
        {
          event_id: notification.event.id,
          user_id: user.id,
        },
      ]);

      if (participantError) {
        console.error('Ошибка добавления participant после invitation accept:', participantError);
        feedback.error(translate('notifications.inviteActionFailed'));
        return;
      }

      feedback.success(translate('notifications.inviteAccepted'));
      await fetchNotifications(false);
    } catch (error) {
      console.error('Unexpected accept invitation error:', error);
      feedback.error(translate('notifications.inviteActionUnexpectedError'));
    } finally {
      setProcessingInvitationId(null);
      setProcessingAction(null);
    }
  };

  const handleDeclineInvitation = async (notification: NotificationItem) => {
    if (!notification.invitationId) return;

    setProcessingInvitationId(notification.invitationId);
    setProcessingAction('decline');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        feedback.error(translate('notifications.inviteActionFailed'));
        return;
      }

      const { error } = await supabase
        .from('event_invitations')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString(),
        })
        .eq('id', notification.invitationId)
        .eq('invitee_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Ошибка отклонения invitation:', error);
        feedback.error(translate('notifications.inviteActionFailed'));
        return;
      }

      feedback.success(translate('notifications.inviteDeclined'));
      await fetchNotifications(false);
    } catch (error) {
      console.error('Unexpected decline invitation error:', error);
      feedback.error(translate('notifications.inviteActionUnexpectedError'));
    } finally {
      setProcessingInvitationId(null);
      setProcessingAction(null);
    }
  };

  useEffect(() => {
    fetchNotifications(true);

    const participantsChannel = supabase
      .channel('notifications-participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
        },
        async () => {
          await fetchNotifications(false);
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('notifications-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        async () => {
          await fetchNotifications(false);
        }
      )
      .subscribe();

    const invitationsChannel = supabase
      .channel('notifications-invitations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_invitations',
        },
        async () => {
          await fetchNotifications(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(invitationsChannel);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border">
        <h1>{translate('notifications.title')}</h1>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {loading && (
          <div className="px-6 py-10 flex items-center justify-center">
            <LoadingLogo size={52} label={translate('common.loadingNotifications')} />
          </div>
        )}

        {!loading && refreshing && (
          <div className="px-6 pt-3">
            <p className="text-xs text-muted-foreground">{translate('common.loading')}</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="px-6 py-6">
            <div
              className="rounded-xl p-4 border border-border"
              style={{
                backgroundColor: 'var(--card)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 className="mb-2">{translate('notifications.emptyTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {translate('notifications.emptyDescription')}
              </p>
            </div>
          </div>
        )}

        {!loading &&
          notifications.map((notification) => {
            const isInvite = notification.type === 'invite';
            const isProcessingCurrent =
              processingInvitationId === notification.invitationId && !!processingAction;

            return (
              <div
                key={notification.id}
                onClick={() =>
                  onNavigate &&
                  onNavigate('event-details', {
                    ...notification.event,
                    backTarget: 'notifications',
                  })
                }
                className="px-6 py-4 border-b border-border flex items-start gap-3 hover:bg-card/50 transition-colors cursor-pointer active:opacity-70"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ backgroundColor: 'var(--primary)' }}
                  title={
                    notification.type === 'upcoming'
                      ? translate('notifications.upcomingIconLabel')
                      : notification.type === 'join'
                        ? translate('notifications.joinIconLabel')
                        : translate('notifications.inviteIconLabel')
                  }
                >
                  <span className="text-sm">
                    {notification.type === 'upcoming'
                      ? '⏰'
                      : notification.type === 'join'
                        ? '👋'
                        : '✉️'}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="mb-1">{notification.message}</p>
                  <p className="text-sm text-muted-foreground">{notification.time}</p>

                  {isInvite && (
                    <div
                      className="flex gap-2 mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        onClick={() => handleAcceptInvitation(notification)}
                        disabled={isProcessingCurrent}
                        className="px-3 py-2 rounded-lg text-sm transition-opacity"
                        style={{
                          backgroundColor: 'var(--accent-soft)',
                          border: '1px solid var(--accent-border)',
                          color: 'var(--accent)',
                          opacity: isProcessingCurrent ? 0.7 : 1,
                        }}
                      >
                        {isProcessingCurrent && processingAction === 'accept'
                          ? translate('notifications.acceptingInvite')
                          : translate('notifications.acceptInvite')}
                      </button>

                      <button
                        onClick={() => handleDeclineInvitation(notification)}
                        disabled={isProcessingCurrent}
                        className="px-3 py-2 rounded-lg text-sm transition-opacity"
                        style={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground-strong)',
                          opacity: isProcessingCurrent ? 0.7 : 1,
                        }}
                      >
                        {isProcessingCurrent && processingAction === 'decline'
                          ? translate('notifications.decliningInvite')
                          : translate('notifications.declineInvite')}
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-muted-foreground mt-1">→</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}



