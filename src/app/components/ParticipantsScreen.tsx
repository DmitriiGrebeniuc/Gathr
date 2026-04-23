import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { LoadingAvatarStrip, LoadingCard } from './LoadingState';
import {
  fetchMyProfileAccessSummary,
  fetchParticipantCounts,
  fetchParticipantIdentityRows,
  fetchPublicProfileNameMap,
} from '../lib/publicData';

type ParticipantItem = {
  user_id: string;
  event_id: string;
  publicName: string;
};

export function ParticipantsScreen({
  onNavigate,
  event,
}: {
  onNavigate: (screen: string, data?: any, customDirection?: 'forward' | 'back' | 'up' | 'down') => void;
  event?: any;
}) {
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(event?.participantCount || 0);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [accessRestricted, setAccessRestricted] = useState(false);
  const [rowsResolved, setRowsResolved] = useState(false);

  const { translate } = useLanguage();

  const parentBackTarget = event?.backTarget || 'home';

  const loadParticipants = async () => {
    if (!event?.id) {
      setParticipants([]);
      setParticipantCount(0);
      setAccessRestricted(false);
      setLoading(false);
      return;
    }

    try {
      setRowsResolved(false);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      const resolvedUserId = user?.id ?? null;
      const creator = resolvedUserId === event?.creator_id;
      setCurrentUserId(resolvedUserId);
      setIsCreator(creator);

      const countsMap = await fetchParticipantCounts([event.id]);
      setParticipantCount(countsMap[event.id] || 0);

      if (userError || !resolvedUserId) {
        setParticipants([]);
        setAccessRestricted(true);
        setRowsResolved(true);
        return;
      }

      const [myAccess, membership] = await Promise.all([
        fetchMyProfileAccessSummary(),
        supabase
          .from('participants')
          .select('id')
          .eq('event_id', event.id)
          .eq('user_id', resolvedUserId)
          .maybeSingle(),
      ]);

      if (membership.error) {
        console.error('Participant access membership check failed:', membership.error);
      }

      const isAdmin = myAccess?.role === 'admin';
      const hasJoined = !!membership.data;
      const canViewIdentities = creator || hasJoined || isAdmin || !!event?.canViewParticipantIdentities;

      if (!canViewIdentities) {
        setParticipants([]);
        setAccessRestricted(true);
        setRowsResolved(true);
        return;
      }

      const participantRows = await fetchParticipantIdentityRows(event.id);
      const nameMap = await fetchPublicProfileNameMap(participantRows.map((row) => row.user_id));

      setParticipants(
        participantRows.map((row) => ({
          ...row,
          publicName: nameMap[row.user_id] || translate('common.user'),
        }))
      );
      setAccessRestricted(false);
      setRowsResolved(true);
    } catch (error) {
      console.error('Unexpected participants load error:', error);
      setParticipants([]);
      setCurrentUserId(null);
      setAccessRestricted(true);
      setRowsResolved(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setParticipantCount(event?.participantCount || 0);
    loadParticipants();

    if (!event?.id) return;

    const channel = supabase
      .channel(`participants-screen-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `event_id=eq.${event.id}`,
        },
        async () => {
          await loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event?.id, event?.creator_id, event?.canViewParticipantIdentities]);

  return (
    <SwipeableScreen
      onSwipeBack={() =>
        onNavigate(
          'event-details',
          {
            ...event,
            backTarget: parentBackTarget,
            participantCount,
          },
          'back'
        )
      }
    >
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onNavigate(
                'event-details',
                {
                  ...event,
                  backTarget: parentBackTarget,
                  participantCount,
                },
                'back'
              )
            }
            className="text-muted-foreground"
          >
            ← {translate('participants.back')}
          </motion.button>
          <h2>{translate('participants.title')}</h2>
          <div className="w-14"></div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-6"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-sm mx-auto space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {event?.title || translate('participants.eventFallback')}
                </p>
                <h3 className="mt-1">
                  {participantCount}{' '}
                  {participantCount === 1
                    ? translate('participants.participant')
                    : translate('participants.participants')}
                </h3>
              </div>

              {isCreator && (
                <button
                  onClick={() =>
                    onNavigate(
                      'invite-users',
                      {
                        ...event,
                        backTarget: parentBackTarget,
                      },
                      'forward'
                    )
                  }
                  className="px-3 py-2 rounded-lg text-sm transition-opacity"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--accent)',
                  }}
                >
                  {translate('inviteUsers.invite')}
                </button>
              )}
            </div>

            {loading && (
              <div className="space-y-3">
                <LoadingCard lines={['36%', '54%']} />
                <div
                  className="rounded-2xl border px-4 py-4 space-y-3"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <LoadingAvatarStrip count={3} />
                  <LoadingCard className="border-0 p-0 shadow-none" lines={['72%', '58%']} />
                </div>
              </div>
            )}

            {!loading && accessRestricted && participantCount > 0 && (
              <div
                className="px-4 py-3 rounded-xl text-sm text-muted-foreground border border-border"
                style={{ backgroundColor: 'var(--card)' }}
              >
                {translate('participants.identitiesRestricted')}
              </div>
            )}

            {!loading && participantCount === 0 && (
              <div
                className="px-4 py-3 rounded-xl text-center text-sm text-muted-foreground"
                style={{ backgroundColor: 'var(--card)' }}
              >
                {translate('participants.noParticipants')}
              </div>
            )}

            {!loading &&
              !accessRestricted &&
              participantCount > 0 &&
              !rowsResolved && (
                <div
                  className="rounded-2xl border px-4 py-4 space-y-3"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <LoadingAvatarStrip count={3} />
                </div>
              )}

            {!loading &&
              !accessRestricted &&
              participants.length > 0 &&
              participants.map((participant, idx) => {
                const name = participant.publicName || translate('common.user');
                const isCurrentUser = currentUserId === participant.user_id;
                const isEventCreator = event?.creator_id === participant.user_id;

                return (
                  <motion.div
                    key={`${participant.user_id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="px-4 py-4 rounded-xl flex items-center gap-3 border border-border"
                    style={{ backgroundColor: 'var(--card)' }}
                  >
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm border-2"
                        style={{
                          backgroundColor: 'var(--secondary)',
                          borderColor: isEventCreator ? 'var(--accent)' : 'transparent',
                          boxShadow: isEventCreator ? '0 0 0 1px rgba(212, 175, 55, 0.18)' : 'none',
                        }}
                        title={
                          isEventCreator && isCurrentUser
                            ? `${name} • ${translate('participants.creator')} • ${translate('participants.you')}`
                            : isEventCreator
                              ? `${name} • ${translate('participants.creator')}`
                              : isCurrentUser
                                ? `${name} • ${translate('participants.you')}`
                                : name
                        }
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
                          {translate('participants.you')}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p>{name}</p>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </div>
    </SwipeableScreen>
  );
}
