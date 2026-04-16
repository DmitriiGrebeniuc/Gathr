import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { TouchButton } from './TouchButton';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { EventLocationMap } from './EventLocationMap';
import { buildJoinEventLoginPayload } from '../auth/postLoginIntent';
import { feedback } from '../lib/feedback';
import {
  fetchMyProfileAccessSummary,
  fetchParticipantCounts,
  fetchParticipantIdentityRows,
  fetchPublicProfileNameMap,
} from '../lib/publicData';

export function EventDetailsScreen({
  onNavigate,
  event,
}: {
  onNavigate: (
    screen: string,
    data?: any,
    customDirection?: 'forward' | 'back' | 'up' | 'down'
  ) => void;
  event?: any;
}) {
  const { translate } = useLanguage();

  const defaultEvent = useMemo(
    () => ({
      id: '',
      title: translate('details.fallbackTitle'),
      description: translate('details.fallbackDescription'),
      date_time: new Date().toISOString(),
      location: translate('details.fallbackLocation'),
      creator_id: null,
    }),
    [translate]
  );

  const [eventData, setEventData] = useState(() => event || defaultEvent);
  const [resolvedBackTarget, setResolvedBackTarget] = useState(
    event?.backTarget || 'home'
  );

  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantCount, setParticipantCount] = useState(event?.participantCount || 0);
  const [canViewParticipantIdentities, setCanViewParticipantIdentities] = useState(false);

  const autoJoinAttemptedRef = useRef(false);

  const backTarget = event?.backTarget || 'home';
  const pendingAuthAction = event?.authAction || null;

  const eventDate = eventData.date_time ? new Date(eventData.date_time) : null;
  const isPastEvent =
    eventDate !== null &&
    !Number.isNaN(eventDate.getTime()) &&
    eventDate.getTime() < Date.now();

  const formatDate = (dateString?: string) => {
    if (!dateString) return translate('common.dateNotSpecified');

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return translate('common.invalidDate');
    }

    return date.toLocaleString();
  };

  const hasLocationCoordinates =
    typeof eventData.location_lat === 'number' &&
    typeof eventData.location_lng === 'number';

  const isNativeApp =
    typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

  const googleMapsUrl = hasLocationCoordinates
    ? `https://www.google.com/maps?q=${eventData.location_lat},${eventData.location_lng}`
    : eventData.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.location)}`
      : null;

  const eventShareUrl =
    typeof window !== 'undefined' && eventData.id
      ? `${window.location.origin}/event/${eventData.id}`
      : '';

  const buildShareText = () => {
    const lines = [
      translate('details.shareInviteLine'),
      '',
      `${translate('details.shareLabelEvent')} ${eventData.title || translate('common.event')}`,
      `${translate('details.shareLabelDate')} ${formatDate(eventData.date_time)}`,
      `${translate('details.shareLabelLocation')} ${eventData.location || translate('details.locationNotSpecified')}`,
    ];

    if (eventData.description) {
      lines.push('', eventData.description);
    }

    if (eventShareUrl) {
      lines.push('', translate('details.shareOpenLink'), eventShareUrl);
    }

    return lines.join('\n');
  };

  const loadEvent = async () => {
    if (!event?.id) {
      setEventData(event || defaultEvent);
      return;
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', event.id)
      .maybeSingle();

    if (error) {
      console.error('Ошибка загрузки события:', error);
      setEventData(event || defaultEvent);
      return;
    }

    if (!data) {
      setEventData(event || defaultEvent);
      return;
    }

    setEventData(data);
  };

  const loadParticipants = async () => {
    if (!eventData.id) return;

    try {
      const countsMap = await fetchParticipantCounts([eventData.id]);
      setParticipantCount(countsMap[eventData.id] || 0);

      if (!canViewParticipantIdentities) {
        setParticipants([]);
        return;
      }

      const participantRows = await fetchParticipantIdentityRows(eventData.id);
      const nameMap = await fetchPublicProfileNameMap(participantRows.map((row) => row.user_id));

      setParticipants(
        participantRows.map((row) => ({
          ...row,
          publicName: nameMap[row.user_id] || translate('common.user'),
        }))
      );
    } catch (error) {
      console.error('Unexpected participant load error:', error);
      setParticipants([]);
    }
  };

  const loadEventState = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setCurrentUserId(null);
        setHasJoined(false);
        setIsCreator(false);
        setCanViewParticipantIdentities(false);
        return;
      }

      const myAccess = await fetchMyProfileAccessSummary();
      const isAdmin = myAccess?.role === 'admin';

      setCurrentUserId(user.id);
      const creator = eventData.creator_id === user.id;
      setIsCreator(creator);

      if (!eventData.id) {
        setHasJoined(false);
        setCanViewParticipantIdentities(creator || isAdmin);
        return;
      }

      const { data, error } = await supabase
        .from('participants')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventData.id)
        .maybeSingle();

      if (error) {
        console.error('Ошибка проверки участия:', error);
        setHasJoined(false);
        setCanViewParticipantIdentities(creator || isAdmin);
      } else {
        const joined = !!data;
        setHasJoined(joined);
        setCanViewParticipantIdentities(creator || joined || isAdmin);
      }
    } catch (error) {
      console.error('Unexpected event state error:', error);
      setHasJoined(false);
      setIsCreator(false);
      setCanViewParticipantIdentities(false);
    }
  };

  useEffect(() => {
    setEventData(event || defaultEvent);
    setResolvedBackTarget(event?.backTarget || 'home');
    setParticipantCount(event?.participantCount || 0);
    setCanViewParticipantIdentities(!!event?.canViewParticipantIdentities);
    autoJoinAttemptedRef.current = false;
  }, [event, defaultEvent]);

  useEffect(() => {
    loadEvent();
  }, [event?.id]);

  useEffect(() => {
    loadEventState();
    loadParticipants();

    if (!eventData.id) return;

    const participantsChannel = supabase
      .channel(`participants-${eventData.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
        },
        async () => {
          await loadParticipants();
          await loadEventState();
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel(`event-details-${eventData.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventData.id}`,
        },
        async () => {
          await loadEvent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [eventData.id, eventData.creator_id, canViewParticipantIdentities]);

  const handleShare = async () => {
    if (!eventData.id || !eventShareUrl) {
      return;
    }

    setSharing(true);

    try {
      const shareText = buildShareText();

      if (navigator.share) {
        await navigator.share({
          title: eventData.title || translate('common.event'),
          text: shareText,
          url: eventShareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        feedback.success(translate('details.linkCopied'));
        return;
      }

      const telegramShareUrl =
        `https://t.me/share/url?url=${encodeURIComponent(eventShareUrl)}&text=${encodeURIComponent(shareText)}`;

      window.open(telegramShareUrl, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return;
      }

      console.error('Unexpected share error:', error);

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(eventShareUrl);
          feedback.success(translate('details.linkCopied'));
        } else {
          feedback.info(translate('details.copyLinkPrompt'));
        }
      } catch (promptError) {
        console.error('Prompt fallback failed:', promptError);
        feedback.info(translate('details.copyLinkPrompt'));
      }
    } finally {
      setSharing(false);
    }
  };

  const performJoin = async () => {
    if (!currentUserId) {
      return false;
    }

    if (!eventData.id) {
      feedback.error(translate('details.eventNotResolved'));
      return false;
    }

    const { error } = await supabase.from('participants').insert([
      {
        user_id: currentUserId,
        event_id: eventData.id,
      },
    ]);

    if (error) {
      console.error('Ошибка присоединения:', error);
      feedback.error(translate('details.joinFailed'));
      return false;
    }

    setHasJoined(true);
    await loadParticipants();
    return true;
  };

  useEffect(() => {
    const autoJoinAfterAuth = async () => {
      if (!pendingAuthAction) {
        return;
      }

      if (pendingAuthAction.type !== 'join-event') {
        return;
      }

      if (!currentUserId) {
        return;
      }

      if (!eventData.id || pendingAuthAction.eventId !== eventData.id) {
        return;
      }

      if (hasJoined || loadingAction) {
        return;
      }

      if (autoJoinAttemptedRef.current) {
        return;
      }

      autoJoinAttemptedRef.current = true;
      setLoadingAction(true);

      try {
        await performJoin();
      } finally {
        setLoadingAction(false);
      }
    };

    autoJoinAfterAuth();
  }, [pendingAuthAction, currentUserId, eventData.id, hasJoined]);

  const handleJoin = async () => {
    if (!currentUserId) {
      onNavigate('login', buildJoinEventLoginPayload(eventData), 'forward');
      return;
    }

    if (!eventData.id) {
      feedback.error(translate('details.eventNotResolved'));
      return;
    }

    setLoadingAction(true);

    try {
      await performJoin();
    } catch (error) {
      console.error('Unexpected join error:', error);
      feedback.error(translate('details.joinUnexpectedError'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUserId) {
      feedback.warning(translate('details.loginRequired'));
      return;
    }

    if (!eventData.id) {
      feedback.error(translate('details.eventNotResolved'));
      return;
    }

    setLoadingAction(true);

    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('user_id', currentUserId)
        .eq('event_id', eventData.id);

      if (error) {
        console.error('Ошибка выхода из события:', error);
        feedback.error(translate('details.leaveFailed'));
        setLoadingAction(false);
        return;
      }

      setHasJoined(false);
      await loadParticipants();
    } catch (error) {
      console.error('Unexpected leave error:', error);
      feedback.error(translate('details.leaveUnexpectedError'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!currentUserId) {
      feedback.warning(translate('details.loginRequired'));
      return;
    }

    if (!eventData.id) {
      feedback.error(translate('details.eventNotResolved'));
      return;
    }

    if (!isCreator) {
      feedback.warning(translate('details.deleteOnlyCreator'));
      return;
    }

    const confirmed = await feedback.confirm({
      title: translate('details.deleteEvent'),
      description: translate('details.deleteConfirm'),
      confirmLabel: translate('details.deleteEvent'),
      cancelLabel: translate('common.cancel'),
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }

    setLoadingDelete(true);

    try {
      const { error: participantsError } = await supabase
        .from('participants')
        .delete()
        .eq('event_id', eventData.id);

      if (participantsError) {
        console.error('Ошибка удаления участников события:', participantsError);
        feedback.error(translate('details.deleteParticipantsFailed'));
        setLoadingDelete(false);
        return;
      }

      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventData.id)
        .eq('creator_id', currentUserId);

      if (eventError) {
        console.error('Ошибка удаления события:', eventError);
        feedback.error(translate('details.deleteFailed'));
        setLoadingDelete(false);
        return;
      }

      onNavigate('home');
    } catch (error) {
      console.error('Unexpected delete event error:', error);
      feedback.error(translate('details.deleteUnexpectedError'));
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleOpenInvite = () => {
    if (!eventData.id) {
      feedback.error(translate('details.eventNotResolved'));
      return;
    }

    onNavigate(
      'invite-users',
      {
        ...eventData,
        backTarget: resolvedBackTarget,
      },
      'forward'
    );
  };

  return (
    <SwipeableScreen onSwipeBack={() => onNavigate(resolvedBackTarget)}>
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(resolvedBackTarget)}
            className="text-muted-foreground"
          >
            ← {translate('details.back')}
          </motion.button>
          <div className="w-14"></div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-6"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-sm mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1>{eventData.title}</h1>

                {isPastEvent && (
                  <span
                    className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
                    style={{
                      borderColor: 'var(--accent-border-muted)',
                      color: 'var(--accent)',
                      backgroundColor: 'var(--accent-soft-muted)',
                    }}
                  >
                    {translate('details.pastEvent')}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {eventData.description || translate('details.noDescription')}
              </p>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-start gap-3"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <span className="text-sm">📅</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{translate('details.dateTime')}</p>
                  <p>{formatDate(eventData.date_time)}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <span className="text-sm">📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{translate('details.location')}</p>
                    <p>{eventData.location || translate('details.locationNotSpecified')}</p>

                    {googleMapsUrl && isNativeApp && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-sm"
                        style={{ color: 'var(--accent)' }}
                      >
                        Открыть в Google Maps
                      </a>
                    )}
                  </div>
                </div>

                {hasLocationCoordinates && (
                  <div className="mt-3 -mx-6 sm:mx-0">
                    <EventLocationMap
                      lat={eventData.location_lat}
                      lng={eventData.location_lng}
                      height={256}
                    />
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={() =>
                  onNavigate('participants', {
                    ...eventData,
                    backTarget,
                    currentUserId,
                    participantCount,
                    canViewParticipantIdentities,
                  })
                }
                className="text-sm text-muted-foreground mb-3 hover:opacity-80 active:opacity-60 transition-opacity"
              >
                {translate('details.participants')} ({participantCount})
              </button>

              {canViewParticipantIdentities && participants.length > 0 ? (
                <button
                  onClick={() =>
                    onNavigate('participants', {
                      ...eventData,
                      backTarget,
                      currentUserId,
                      participantCount,
                      canViewParticipantIdentities,
                    })
                  }
                  className="flex items-center -space-x-2 hover:opacity-90 active:opacity-70 transition-opacity"
                >
                  {participants.slice(0, 4).map((participant: any, idx: number) => {
                    const name = participant.publicName || translate('common.user');
                    const isCurrentUser = currentUserId === participant.user_id;
                    const isEventCreator = eventData.creator_id === participant.user_id;

                    return (
                      <motion.div
                        key={participant.user_id || idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="relative"
                        title={
                          isEventCreator && isCurrentUser
                            ? `${name} • ${translate('details.creator')} • ${translate('details.you')}`
                            : isEventCreator
                              ? `${name} • ${translate('details.creator')}`
                              : isCurrentUser
                                ? `${name} • ${translate('details.you')}`
                                : name
                        }
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xs border-2"
                          style={{
                            backgroundColor: 'var(--primary)',
                            borderColor: isEventCreator ? 'var(--accent)' : 'var(--background)',
                            boxShadow: isEventCreator ? '0 0 0 1px rgba(212, 175, 55, 0.18)' : 'none',
                          }}
                        >
                          {name.slice(0, 2).toUpperCase()}
                        </div>

                        {isCurrentUser && (
                          <div
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] leading-none border"
                            style={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--accent-border-muted)',
                              color: 'var(--accent)',
                            }}
                          >
                            {translate('details.you')}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {participantCount > 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs border-2 border-background"
                      style={{ backgroundColor: 'var(--secondary)' }}
                    >
                      +{participantCount - 4}
                    </motion.div>
                  )}
                </button>
              ) : participantCount > 0 ? (
                <div
                  className="px-4 py-3 rounded-xl text-sm text-muted-foreground border border-border"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  {translate('details.participantsRestricted')}
                </div>
              ) : (
                <div
                  className="px-4 py-3 rounded-xl text-center text-sm text-muted-foreground"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  {translate('details.noParticipants')}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 border-t border-border space-y-3"
        >
          {!isCreator && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <TouchButton
                  variant="ghost"
                  onClick={handleShare}
                  disabled={sharing || loadingAction || loadingDelete || !eventData.id}
                  style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
                >
                  {sharing ? translate('details.sharing') : translate('details.shareEvent')}
                </TouchButton>

                {hasJoined ? (
                  <TouchButton
                    variant="danger"
                    onClick={handleLeave}
                    disabled={loadingAction || loadingDelete}
                  >
                    {loadingAction ? translate('details.leaving') : translate('details.leaveEvent')}
                  </TouchButton>
                ) : !isPastEvent ? (
                  <TouchButton
                    variant="primary"
                    onClick={handleJoin}
                    disabled={loadingAction || loadingDelete}
                  >
                    {loadingAction ? translate('details.joining') : translate('details.joinEvent')}
                  </TouchButton>
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-center text-sm text-muted-foreground border border-border flex items-center justify-center"
                    style={{ backgroundColor: 'var(--card)' }}
                  >
                    {translate('details.eventEnded')}
                  </div>
                )}
              </div>
            </>
          )}

          {isCreator && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <TouchButton
                  variant="ghost"
                  onClick={handleShare}
                  disabled={sharing || loadingAction || loadingDelete || !eventData.id}
                  style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
                >
                  {sharing ? translate('details.sharing') : translate('details.shareEvent')}
                </TouchButton>

                <TouchButton
                  variant="ghost"
                  onClick={handleOpenInvite}
                  disabled={loadingAction || loadingDelete || !eventData.id}
                  style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
                >
                  {translate('inviteUsers.invite')}
                </TouchButton>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TouchButton
                  variant="ghost"
                  onClick={() => onNavigate('edit-event', eventData)}
                  disabled={loadingDelete || loadingAction}
                  style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
                >
                  {translate('details.editEvent')}
                </TouchButton>

                <TouchButton
                  variant="danger"
                  onClick={handleDeleteEvent}
                  disabled={loadingDelete || loadingAction}
                >
                  {loadingDelete ? translate('details.deleting') : translate('details.deleteEvent')}
                </TouchButton>
              </div>
            </>
          )}

        </motion.div>
      </div>
    </SwipeableScreen>
  );
}


