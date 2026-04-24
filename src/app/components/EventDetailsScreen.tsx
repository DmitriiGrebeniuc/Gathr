import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { TouchButton } from './TouchButton';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { EventLocationMap } from './EventLocationMap';
import { buildJoinEventLoginPayload } from '../auth/postLoginIntent';
import { feedback } from '../lib/feedback';
import { LoadingAvatarStrip, LoadingCard, LoadingLine } from './LoadingState';
import {
  createEventJoinRequest,
  fetchCreatorEventJoinRequests,
  fetchEventPrivateDetails,
  fetchMyEventJoinRequest,
  fetchMyProfileAccessSummary,
  fetchParticipantCounts,
  fetchParticipantIdentityRows,
  fetchPublicProfileNameMap,
  type EventJoinRequest,
  type EventPrivateDetails,
} from '../lib/publicData';
import { INPUT_LIMITS, limitText, trimAndLimitText } from '../constants/inputLimits';

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
      join_mode: 'open' as const,
    }),
    [translate]
  );

  const [eventData, setEventData] = useState(() => event || defaultEvent);
  const [resolvedBackTarget, setResolvedBackTarget] = useState(
    event?.backTarget || 'home'
  );
  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantCount, setParticipantCount] = useState(event?.participantCount || 0);
  const [canViewParticipantIdentities, setCanViewParticipantIdentities] = useState(false);
  const [participantAccessResolved, setParticipantAccessResolved] = useState(false);
  const [participantListResolved, setParticipantListResolved] = useState(false);
  const [eventStateResolved, setEventStateResolved] = useState(false);
  const [privateDetails, setPrivateDetails] = useState<EventPrivateDetails | null>(null);
  const [myJoinRequest, setMyJoinRequest] = useState<EventJoinRequest | null>(null);
  const [showJoinRequestComposer, setShowJoinRequestComposer] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [submittingJoinRequest, setSubmittingJoinRequest] = useState(false);
  const [pendingJoinRequestsCount, setPendingJoinRequestsCount] = useState(0);

  const autoJoinAttemptedRef = useRef(false);
  const eventLoadRequestRef = useRef(0);
  const participantLoadRequestRef = useRef(0);
  const eventStateLoadRequestRef = useRef(0);

  const backTarget = event?.backTarget || 'home';
  const pendingAuthAction = event?.authAction || null;
  const joinMode = (eventData.join_mode || 'open') as 'open' | 'request';
  const canViewClosedDetails = joinMode !== 'request' || isCreator || hasJoined || isAdmin;
  const hasVisiblePrivatePreview =
    !!eventData.date_time ||
    !!eventData.location ||
    typeof eventData.location_lat === 'number' ||
    typeof eventData.location_lng === 'number' ||
    !!privateDetails?.date_time ||
    !!privateDetails?.location ||
    typeof privateDetails?.location_lat === 'number' ||
    typeof privateDetails?.location_lng === 'number';
  const isClosedAccessResolving = joinMode === 'request' && !eventStateResolved;
  const shouldShowClosedRestrictedState =
    joinMode === 'request' && eventStateResolved && !canViewClosedDetails;
  const shouldShowPrivateFieldsLoading =
    !eventStateResolved &&
    !hasVisiblePrivatePreview &&
    (!!eventData.id || joinMode === 'request') &&
    (joinMode === 'request' ||
      !eventData.date_time ||
      !eventData.location ||
      privateDetails !== null);

  const displayedDateTime = privateDetails?.date_time ?? eventData.date_time;
  const displayedLocation = privateDetails?.location ?? eventData.location;
  const displayedLocationLat =
    typeof privateDetails?.location_lat === 'number'
      ? privateDetails.location_lat
      : eventData.location_lat;
  const displayedLocationLng =
    typeof privateDetails?.location_lng === 'number'
      ? privateDetails.location_lng
      : eventData.location_lng;

  const eventDate = displayedDateTime ? new Date(displayedDateTime) : null;
  const isPastEvent =
    eventDate !== null &&
    !Number.isNaN(eventDate.getTime()) &&
    eventDate.getTime() < Date.now();

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return translate('common.dateNotSpecified');

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return translate('common.invalidDate');
    }

    return date.toLocaleString();
  };

  const hasLocationCoordinates =
    typeof displayedLocationLat === 'number' &&
    typeof displayedLocationLng === 'number';

  const isNativeApp =
    typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

  const googleMapsUrl = hasLocationCoordinates
    ? `https://www.google.com/maps?q=${displayedLocationLat},${displayedLocationLng}`
    : displayedLocation
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayedLocation)}`
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
      `${translate('details.shareLabelDate')} ${
        canViewClosedDetails
          ? formatDate(displayedDateTime)
          : translate('details.closedDateHidden')
      }`,
      `${translate('details.shareLabelLocation')} ${
        canViewClosedDetails
          ? displayedLocation || translate('details.locationNotSpecified')
          : translate('details.closedLocationHidden')
      }`,
    ];

    if (eventData.description) {
      lines.push('', eventData.description);
    }

    if (eventShareUrl) {
      lines.push('', translate('details.shareOpenLink'), eventShareUrl);
    }

    return lines.join('\n');
  };

  const loadEvent = async (eventIdOverride?: string | null) => {
    const requestedEventId = eventIdOverride ?? event?.id ?? null;

    if (!requestedEventId) {
      setEventData(event || defaultEvent);
      return null;
    }

    const requestId = ++eventLoadRequestRef.current;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', requestedEventId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load event details:', error);
      setEventData(event || defaultEvent);
      return null;
    }

    if (!data) {
      setEventData(event || defaultEvent);
      return null;
    }

    if (requestId !== eventLoadRequestRef.current) {
      return data;
    }

    setEventData((prev: any) => {
      const baseEvent = prev?.id === requestedEventId ? prev : event || defaultEvent;

      return {
        ...baseEvent,
        ...data,
        date_time: data.date_time ?? baseEvent?.date_time ?? null,
        location: data.location ?? baseEvent?.location ?? null,
        location_lat:
          typeof data.location_lat === 'number'
            ? data.location_lat
            : typeof baseEvent?.location_lat === 'number'
              ? baseEvent.location_lat
              : null,
        location_lng:
          typeof data.location_lng === 'number'
            ? data.location_lng
            : typeof baseEvent?.location_lng === 'number'
              ? baseEvent.location_lng
              : null,
        join_mode: data.join_mode ?? baseEvent?.join_mode ?? 'open',
      };
    });

    return data;
  };

  const loadParticipants = async (
    eventIdOverride = eventData.id,
    canViewIdentitiesOverride = canViewParticipantIdentities
  ) => {
    if (!eventIdOverride) {
      setParticipants([]);
      setParticipantCount(0);
      setParticipantListResolved(true);
      return;
    }

    try {
      const requestId = ++participantLoadRequestRef.current;
      setParticipantListResolved(false);
      const countsMap = await fetchParticipantCounts([eventIdOverride]);

      if (requestId !== participantLoadRequestRef.current) {
        return;
      }

      setParticipantCount(countsMap[eventIdOverride] || 0);

      if (!canViewIdentitiesOverride) {
        setParticipants([]);
        setParticipantListResolved(true);
        return;
      }

      const participantRows = await fetchParticipantIdentityRows(eventIdOverride);
      const nameMap = await fetchPublicProfileNameMap(participantRows.map((row) => row.user_id));

      if (requestId !== participantLoadRequestRef.current) {
        return;
      }

      setParticipants(
        participantRows.map((row) => ({
          ...row,
          publicName: nameMap[row.user_id] || translate('common.user'),
        }))
      );
      setParticipantListResolved(true);
    } catch (error) {
      console.error('Unexpected participant load error:', error);
      setParticipants([]);
      setParticipantListResolved(true);
    }
  };

  const loadEventState = async (
    eventIdOverride = eventData.id,
    joinModeOverride: 'open' | 'request' = (eventData.join_mode || 'open') as
      | 'open'
      | 'request',
    creatorIdOverride: string | null = eventData.creator_id ?? null
  ) => {
    setEventStateResolved(false);

    try {
      const requestId = ++eventStateLoadRequestRef.current;
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setCurrentUserId(null);
        setHasJoined(false);
        setIsCreator(false);
        setIsAdmin(false);
        setCanViewParticipantIdentities(false);
        setParticipantAccessResolved(true);
        const nextPrivateDetails =
          joinModeOverride === 'open' && eventIdOverride
            ? await fetchEventPrivateDetails(eventIdOverride)
            : null;

        if (requestId !== eventStateLoadRequestRef.current) {
          return;
        }

        await loadParticipants(eventIdOverride, false);
        if (requestId !== eventStateLoadRequestRef.current) {
          return;
        }

        setPrivateDetails(nextPrivateDetails);
        setMyJoinRequest(null);
        setPendingJoinRequestsCount(0);
        setEventStateResolved(true);
        return;
      }

      const myAccess = await fetchMyProfileAccessSummary();
      const nextIsAdmin = myAccess?.role === 'admin';

      setCurrentUserId(user.id);
      setIsAdmin(nextIsAdmin);

      const creator = creatorIdOverride === user.id;
      setIsCreator(creator);

      if (!eventIdOverride) {
        setHasJoined(false);
        setCanViewParticipantIdentities(creator || nextIsAdmin);
        setParticipantAccessResolved(true);
        setPrivateDetails(null);
        setMyJoinRequest(null);
        setPendingJoinRequestsCount(0);
        setEventStateResolved(true);
        return;
      }

      const { data, error } = await supabase
        .from('participants')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventIdOverride)
        .maybeSingle();

      if (error) {
        console.error('Failed to check participant membership:', error);
      }

      const joined = !!data;
      const canViewIdentities = creator || joined || nextIsAdmin;
      const canViewPrivateDetails =
        joinModeOverride === 'open' || creator || joined || nextIsAdmin;
      const nextPrivateDetails = canViewPrivateDetails
        ? await fetchEventPrivateDetails(eventIdOverride)
        : null;
      const nextMyJoinRequest =
        joinModeOverride === 'request' && !creator && !joined && !nextIsAdmin
          ? await fetchMyEventJoinRequest(eventIdOverride)
          : null;
      const nextPendingJoinRequestsCount =
        joinModeOverride === 'request' && (creator || nextIsAdmin)
          ? (
              await fetchCreatorEventJoinRequests(eventIdOverride)
            ).filter((request) => request.status === 'pending').length
          : 0;

      if (requestId !== eventStateLoadRequestRef.current) {
        return;
      }

      setHasJoined(joined);
      setCanViewParticipantIdentities(canViewIdentities);
      setPrivateDetails(nextPrivateDetails);
      setMyJoinRequest(nextMyJoinRequest);
      setPendingJoinRequestsCount(nextPendingJoinRequestsCount);
      setParticipantAccessResolved(true);
      await loadParticipants(eventIdOverride, canViewIdentities);
      if (requestId !== eventStateLoadRequestRef.current) {
        return;
      }
      setEventStateResolved(true);
    } catch (error) {
      console.error('Unexpected event state error:', error);
      setHasJoined(false);
      setIsCreator(false);
      setIsAdmin(false);
      setCanViewParticipantIdentities(false);
      setParticipantAccessResolved(true);
      setPrivateDetails(null);
      setMyJoinRequest(null);
      setPendingJoinRequestsCount(0);
      setEventStateResolved(true);
    }
  };

  useEffect(() => {
    setEventData(event || defaultEvent);
    setResolvedBackTarget(event?.backTarget || 'home');
    setParticipantCount(event?.participantCount || 0);
    setCanViewParticipantIdentities(!!event?.canViewParticipantIdentities);
    setParticipantAccessResolved(false);
    setParticipantListResolved(false);
    setEventStateResolved(false);
    setPrivateDetails(null);
    setMyJoinRequest(null);
    setShowJoinRequestComposer(false);
    setJoinRequestMessage('');
    autoJoinAttemptedRef.current = false;
  }, [event, defaultEvent]);

  useEffect(() => {
    const hydrateEvent = async () => {
      const loadedEvent = await loadEvent(event?.id);
      const resolvedEvent = loadedEvent || event;

      await loadEventState(
        resolvedEvent?.id ?? null,
        (resolvedEvent?.join_mode ?? 'open') as 'open' | 'request',
        resolvedEvent?.creator_id ?? null
      );
    };

    void hydrateEvent();
  }, [event?.id]);

  useEffect(() => {
    if (!eventData.id) return;

    const participantsChannel = supabase
      .channel(`participants-${eventData.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `event_id=eq.${eventData.id}`,
        },
        async () => {
          await loadEventState(
            eventData.id,
            (eventData.join_mode || 'open') as 'open' | 'request',
            eventData.creator_id ?? null
          );
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
          const loadedEvent = await loadEvent(eventData.id);
          const resolvedEvent = loadedEvent || eventData;

          await loadEventState(
            resolvedEvent.id,
            (resolvedEvent.join_mode || 'open') as 'open' | 'request',
            resolvedEvent.creator_id ?? null
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [eventData.id, eventData.creator_id, eventData.join_mode]);

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
      console.error('Join event failed:', error);
      feedback.error(translate('details.joinFailed'));
      return false;
    }

    setHasJoined(true);
    setCanViewParticipantIdentities(true);
    setParticipantAccessResolved(true);
    await loadEventState(
      eventData.id,
      (eventData.join_mode || 'open') as 'open' | 'request',
      eventData.creator_id ?? null
    );
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

      if (hasJoined || loadingAction || joinMode !== 'open') {
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

    void autoJoinAfterAuth();
  }, [pendingAuthAction, currentUserId, eventData.id, hasJoined, joinMode]);

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

  const handleOpenJoinRequestComposer = () => {
    if (!currentUserId) {
      const detailPayload = {
        ...eventData,
        backTarget: resolvedBackTarget,
      };

      onNavigate(
        'login',
        {
          returnToAfterAuth: {
            screen: 'event-details',
            data: detailPayload,
          },
          actionAfterAuth: null,
          backScreen: 'event-details',
          backData: detailPayload,
        },
        'forward'
      );
      return;
    }

    setShowJoinRequestComposer((prev) => !prev);
  };

  const handleSubmitJoinRequest = async () => {
    if (!eventData.id) {
      feedback.error(translate('details.eventNotResolved'));
      return;
    }

    setSubmittingJoinRequest(true);

    try {
      const nextMessage = trimAndLimitText(
        joinRequestMessage,
        INPUT_LIMITS.eventJoinRequestMessage
      );

      const { data, error } = await createEventJoinRequest(
        eventData.id,
        nextMessage || null
      );

      if (error) {
        console.error('Failed to create join request:', error);
        feedback.error(translate('details.joinRequestSubmitFailed'));
        return;
      }

      setMyJoinRequest(data);
      setJoinRequestMessage('');
      setShowJoinRequestComposer(false);
      feedback.success(translate('details.joinRequestSubmitted'));
    } catch (error) {
      console.error('Unexpected join request submit error:', error);
      feedback.error(translate('details.joinRequestSubmitUnexpectedError'));
    } finally {
      setSubmittingJoinRequest(false);
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
        console.error('Leave event failed:', error);
        feedback.error(translate('details.leaveFailed'));
        setLoadingAction(false);
        return;
      }

      setHasJoined(false);
      await loadEventState(
        eventData.id,
        (eventData.join_mode || 'open') as 'open' | 'request',
        eventData.creator_id ?? null
      );
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
        console.error('Failed to delete event participants:', participantsError);
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
        console.error('Failed to delete event:', eventError);
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

  const handleOpenJoinRequests = () => {
    if (!eventData.id) {
      feedback.error(translate('details.eventNotResolved'));
      return;
    }

    onNavigate(
      'event-join-requests',
      {
        ...eventData,
        backTarget: resolvedBackTarget,
      },
      'forward'
    );
  };

  const renderJoinRequestStatus = () => {
    if (!myJoinRequest) {
      return null;
    }

    const statusKey =
      myJoinRequest.status === 'approved'
        ? 'details.joinRequestStatusApproved'
        : myJoinRequest.status === 'rejected'
          ? 'details.joinRequestStatusRejected'
          : 'details.joinRequestStatusPending';

    const descriptionKey =
      myJoinRequest.status === 'approved'
        ? 'details.joinRequestApprovedDescription'
        : myJoinRequest.status === 'rejected'
          ? 'details.joinRequestRejectedDescription'
          : 'details.joinRequestPendingDescription';

    return (
      <div
        className="rounded-2xl border px-4 py-4"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--accent-border-muted)',
        }}
      >
        <p style={{ color: 'var(--accent)' }}>{translate(statusKey as any)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {translate(descriptionKey as any)}
        </p>
      </div>
    );
  };

  return (
    <SwipeableScreen onSwipeBack={() => onNavigate(resolvedBackTarget)}>
      <div className="relative h-full flex flex-col bg-background">
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
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1>{eventData.title}</h1>
                  {joinMode === 'request' && (
                    <span
                      className="mt-2 inline-flex text-[10px] px-2 py-1 rounded-full border"
                      style={{
                        borderColor: 'var(--accent-border-strong)',
                        color: 'var(--accent)',
                        backgroundColor: 'var(--accent-soft-muted)',
                      }}
                    >
                      {translate('details.closedBadge')}
                    </span>
                  )}
                </div>

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
            </div>

            {isClosedAccessResolving && !hasVisiblePrivatePreview && (
              <LoadingCard lines={['42%', '88%', '72%']} />
            )}

            {shouldShowClosedRestrictedState && (
              <div
                className="rounded-2xl border px-4 py-4"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--accent-border-muted)',
                }}
              >
                <p style={{ color: 'var(--accent)' }}>{translate('details.closedTitle')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {translate('details.closedDescription')}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <span className="text-sm">📅</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{translate('details.dateTime')}</p>
                  <p>
                    {shouldShowPrivateFieldsLoading
                      ? ''
                      : shouldShowClosedRestrictedState
                      ? translate('details.closedDateHidden')
                      : formatDate(displayedDateTime)}
                  </p>
                  {shouldShowPrivateFieldsLoading && (
                    <div className="mt-2 space-y-2">
                      <LoadingLine width="7rem" />
                      <LoadingLine width="5rem" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <span className="text-sm">📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{translate('details.location')}</p>
                    <p>
                      {shouldShowPrivateFieldsLoading
                        ? ''
                        : shouldShowClosedRestrictedState
                        ? translate('details.closedLocationHidden')
                        : displayedLocation || translate('details.locationNotSpecified')}
                    </p>
                    {shouldShowPrivateFieldsLoading && (
                      <div className="mt-2 space-y-2">
                        <LoadingLine width="9rem" />
                        <LoadingLine width="12rem" />
                      </div>
                    )}

                    {googleMapsUrl && isNativeApp && canViewClosedDetails && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-sm"
                        style={{ color: 'var(--accent)' }}
                      >
                        Open in Google Maps
                      </a>
                    )}
                  </div>
                </div>

                {shouldShowPrivateFieldsLoading ? (
                  <LoadingCard className="min-h-[10rem]" lines={['100%', '100%', '90%']} />
                ) : shouldShowClosedRestrictedState ? (
                  <div
                    className="rounded-2xl border px-4 py-4 text-sm text-muted-foreground"
                    style={{ backgroundColor: 'var(--card)' }}
                  >
                    {translate('details.closedMapHidden')}
                  </div>
                ) : hasLocationCoordinates ? (
                  <div className="mt-3 -mx-6 sm:mx-0">
                    <EventLocationMap
                      lat={displayedLocationLat}
                      lng={displayedLocationLng}
                      height={256}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div>
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

              {!participantAccessResolved ||
              (canViewParticipantIdentities && !participantListResolved) ? (
                <div
                  className="rounded-2xl border px-4 py-4 space-y-3"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <LoadingAvatarStrip />
                  <div className="space-y-2">
                    <LoadingLine width="66%" />
                    <LoadingLine width="48%" />
                  </div>
                </div>
              ) : canViewParticipantIdentities && participants.length > 0 ? (
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
                      <div
                        key={participant.user_id || idx}
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
                      </div>
                    );
                  })}

                  {participantCount > 4 && (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs border-2 border-background"
                      style={{ backgroundColor: 'var(--secondary)' }}
                    >
                      +{participantCount - 4}
                    </div>
                  )}
                </button>
              ) : canViewParticipantIdentities && participantCount > 0 ? (
                <div
                  className="rounded-2xl border px-4 py-4 space-y-3"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <LoadingAvatarStrip />
                </div>
              ) : !canViewParticipantIdentities && participantCount > 0 ? (
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
            </div>

            {renderJoinRequestStatus()}

          </div>
        </div>

        <div className="p-6 border-t border-border space-y-3">
          {!isCreator && !isClosedAccessResolving && (
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
              ) : joinMode === 'request' ? (
                <TouchButton
                  variant="primary"
                  onClick={handleOpenJoinRequestComposer}
                  disabled={
                    loadingAction ||
                    loadingDelete ||
                    submittingJoinRequest ||
                    !!myJoinRequest ||
                    isPastEvent
                  }
                >
                  {translate('details.joinRequestButton')}
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
          )}

          {isCreator && joinMode === 'request' && !isClosedAccessResolving && (
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
                onClick={handleOpenJoinRequests}
                disabled={loadingAction || loadingDelete || !eventData.id}
                style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
              >
                {`${translate('details.joinRequestsButton')} (${pendingJoinRequestsCount})`}
              </TouchButton>
            </div>
          )}

          {isCreator && joinMode !== 'request' && !isClosedAccessResolving && (
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
          )}

          {isCreator && (
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
          )}
        </div>

        {showJoinRequestComposer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 flex items-end bg-black/55 px-4 pb-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            onClick={() => {
              if (!submittingJoinRequest) {
                setShowJoinRequestComposer(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="mx-auto w-full max-w-sm rounded-[28px] border px-5 py-5 shadow-2xl"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--accent-border-muted)',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p style={{ color: 'var(--accent)' }}>
                    {translate('details.joinRequestButton')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {translate('details.joinRequestMessageLabel')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowJoinRequestComposer(false)}
                  disabled={submittingJoinRequest}
                  className="rounded-full px-2 py-1 text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {translate('common.cancel')}
                </button>
              </div>

              <textarea
                rows={4}
                value={joinRequestMessage}
                onChange={(event) =>
                  setJoinRequestMessage(
                    limitText(event.target.value, INPUT_LIMITS.eventJoinRequestMessage)
                  )
                }
                maxLength={INPUT_LIMITS.eventJoinRequestMessage}
                placeholder={translate('details.joinRequestMessagePlaceholder')}
                className="w-full rounded-2xl border px-3 py-3 text-sm outline-none resize-none transition-colors"
                style={{
                  backgroundColor: 'var(--surface-strong)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--foreground-strong)',
                }}
              />

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {joinRequestMessage.length}/{INPUT_LIMITS.eventJoinRequestMessage}
                </span>

                <div className="flex gap-3">
                  <TouchButton
                    variant="ghost"
                    onClick={() => setShowJoinRequestComposer(false)}
                    disabled={submittingJoinRequest}
                    style={{
                      borderColor: 'var(--accent-border-muted)',
                      color: 'var(--accent)',
                    }}
                  >
                    {translate('common.cancel')}
                  </TouchButton>

                  <TouchButton
                    variant="primary"
                    onClick={handleSubmitJoinRequest}
                    disabled={submittingJoinRequest}
                  >
                    {submittingJoinRequest
                      ? translate('details.joinRequestSubmitting')
                      : translate('details.joinRequestSubmit')}
                  </TouchButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </SwipeableScreen>
  );
}
