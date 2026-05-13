import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { buildJoinEventLoginPayload } from '../auth/postLoginIntent';
import { feedback } from '../lib/feedback';
import {
  createEventJoinRequest,
  fetchCreatorEventJoinRequests,
  fetchEventContactMethods,
  fetchEventPrivateDetails,
  fetchMyEventJoinRequest,
  fetchMyProfileAccessSummary,
  fetchParticipantCounts,
  fetchParticipantIdentityRows,
  fetchPublicProfileNameMap,
  type EventContactMethods,
  type EventJoinRequest,
  type EventPrivateDetails,
} from '../lib/publicData';
import { INPUT_LIMITS, trimAndLimitText } from '../constants/inputLimits';
import { EventDetailsFooterActions } from './event-details/EventDetailsFooterActions';
import { EventDetailsOverview } from './event-details/EventDetailsOverview';
import { EventDetailsParticipantsPreview } from './event-details/EventDetailsParticipantsPreview';
import { JoinRequestComposer } from './event-details/JoinRequestComposer';
import { ReportDialog } from './reporting/ReportDialog';

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
  const { translate, language } = useLanguage();

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
  const [contactMethods, setContactMethods] = useState<EventContactMethods | null>(null);
  const [myJoinRequest, setMyJoinRequest] = useState<EventJoinRequest | null>(null);
  const [showJoinRequestComposer, setShowJoinRequestComposer] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
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
  const canViewEventContacts = isCreator || hasJoined || isAdmin;
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
        setContactMethods(null);
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
        setContactMethods(null);
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
      const canViewContacts = creator || joined || nextIsAdmin;
      const nextPrivateDetails = canViewPrivateDetails
        ? await fetchEventPrivateDetails(eventIdOverride)
        : null;
      const nextContactMethods = canViewContacts
        ? await fetchEventContactMethods(eventIdOverride)
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
      setContactMethods(nextContactMethods);
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
      setContactMethods(null);
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
    setContactMethods(null);
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

  const handleOpenReportDialog = () => {
    if (!currentUserId) {
      feedback.warning(translate('details.loginRequired'));
      return;
    }

    if (!eventData.id) {
      feedback.error(translate('details.eventNotResolved'));
      return;
    }

    if (isCreator) {
      return;
    }

    setShowReportDialog(true);
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
            <EventDetailsOverview
              eventData={eventData}
              joinMode={joinMode}
              isPastEvent={isPastEvent}
              isClosedAccessResolving={isClosedAccessResolving}
              hasVisiblePrivatePreview={hasVisiblePrivatePreview}
              shouldShowClosedRestrictedState={shouldShowClosedRestrictedState}
              shouldShowPrivateFieldsLoading={shouldShowPrivateFieldsLoading}
              displayedDateTime={displayedDateTime}
              displayedLocation={displayedLocation}
              displayedLocationLat={displayedLocationLat}
              displayedLocationLng={displayedLocationLng}
              googleMapsUrl={googleMapsUrl}
              isNativeApp={isNativeApp}
              canViewClosedDetails={canViewClosedDetails}
              hasLocationCoordinates={hasLocationCoordinates}
              eventStateResolved={eventStateResolved}
              canViewEventContacts={canViewEventContacts}
              contactMethods={contactMethods}
              translate={translate}
              formatDate={formatDate}
            />

            <EventDetailsParticipantsPreview
              eventData={eventData}
              backTarget={backTarget}
              currentUserId={currentUserId}
              participantCount={participantCount}
              participantAccessResolved={participantAccessResolved}
              participantListResolved={participantListResolved}
              canViewParticipantIdentities={canViewParticipantIdentities}
              participants={participants}
              translate={translate}
              onNavigate={onNavigate}
            />

            {renderJoinRequestStatus()}

            {!isCreator && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleOpenReportDialog}
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  {language === 'ru' ? 'Пожаловаться' : 'Report'}
                </button>
              </div>
            )}

          </div>
        </div>

        <EventDetailsFooterActions
          isCreator={isCreator}
          joinMode={joinMode}
          isClosedAccessResolving={isClosedAccessResolving}
          hasJoined={hasJoined}
          isPastEvent={isPastEvent}
          loadingAction={loadingAction}
          loadingDelete={loadingDelete}
          sharing={sharing}
          submittingJoinRequest={submittingJoinRequest}
          hasJoinRequest={!!myJoinRequest}
          eventData={eventData}
          pendingJoinRequestsCount={pendingJoinRequestsCount}
          translate={translate}
          onShare={handleShare}
          onLeave={handleLeave}
          onJoin={handleJoin}
          onOpenJoinRequestComposer={handleOpenJoinRequestComposer}
          onOpenJoinRequests={handleOpenJoinRequests}
          onOpenInvite={handleOpenInvite}
          onEdit={() => onNavigate('edit-event', eventData)}
          onDelete={handleDeleteEvent}
        />

        {showJoinRequestComposer && (
          <JoinRequestComposer
            message={joinRequestMessage}
            submitting={submittingJoinRequest}
            translate={translate}
            onMessageChange={setJoinRequestMessage}
            onSubmit={handleSubmitJoinRequest}
            onClose={() => setShowJoinRequestComposer(false)}
          />
        )}

        <ReportDialog
          targetType="event"
          targetId={eventData.id}
          targetTitle={eventData.title}
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
        />
      </div>
    </SwipeableScreen>
  );
}
