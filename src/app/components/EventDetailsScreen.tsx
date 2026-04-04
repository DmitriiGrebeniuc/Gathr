import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { TouchButton } from './TouchButton';
import { supabase } from '../../lib/supabase';

export function EventDetailsScreen({
  onNavigate,
  event,
}: {
  onNavigate: (screen: string, data?: any) => void;
  event?: any;
}) {
  const defaultEvent = {
    id: '',
    title: 'Coffee & Cowork',
    description: "Let's grab coffee and get some work done together. Bring your laptop!",
    date_time: new Date().toISOString(),
    location: 'Blue Bottle, Downtown',
    creator_id: null,
  };

  const [eventData, setEventData] = useState(event || defaultEvent);
  const [resolvedBackTarget, setResolvedBackTarget] = useState(
    event?.backTarget || 'home'
  );

  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  const backTarget = event?.backTarget || 'home';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not specified';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString();
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

    const { data, error } = await supabase
      .from('participants')
      .select(`
        user_id,
        event_id,
        profiles(name)
      `)
      .eq('event_id', eventData.id);

    if (error) {
      console.error('Ошибка загрузки участников:', error);
      setParticipants([]);
      return;
    }

    setParticipants(data || []);
  };

  const loadEventState = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Ошибка получения пользователя:', userError);
        setCurrentUserId(null);
        setHasJoined(false);
        setIsCreator(false);
        return;
      }

      setCurrentUserId(user.id);
      setIsCreator(eventData.creator_id === user.id);

      if (!eventData.id) {
        setHasJoined(false);
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
      } else {
        setHasJoined(!!data);
      }
    } catch (error) {
      console.error('Unexpected event state error:', error);
      setHasJoined(false);
      setIsCreator(false);
    }
  };

  useEffect(() => {
    setEventData(event || defaultEvent);
    setResolvedBackTarget(event?.backTarget || 'home');
  }, [event]);

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
  }, [eventData.id, eventData.creator_id]);

  const handleJoin = async () => {
    if (!currentUserId) {
      alert('Сначала войди в аккаунт');
      return;
    }

    if (!eventData.id) {
      alert('Не удалось определить событие');
      return;
    }

    setLoadingAction(true);

    try {
      const { error } = await supabase.from('participants').insert([
        {
          user_id: currentUserId,
          event_id: eventData.id,
        },
      ]);

      if (error) {
        console.error('Ошибка присоединения:', error);
        alert('Не удалось присоединиться к событию');
        setLoadingAction(false);
        return;
      }

      setHasJoined(true);
      await loadParticipants();
    } catch (error) {
      console.error('Unexpected join error:', error);
      alert('Произошла ошибка при присоединении');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUserId) {
      alert('Сначала войди в аккаунт');
      return;
    }

    if (!eventData.id) {
      alert('Не удалось определить событие');
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
        alert('Не удалось выйти из события');
        setLoadingAction(false);
        return;
      }

      setHasJoined(false);
      await loadParticipants();
    } catch (error) {
      console.error('Unexpected leave error:', error);
      alert('Произошла ошибка при выходе из события');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!currentUserId) {
      alert('Сначала войди в аккаунт');
      return;
    }

    if (!eventData.id) {
      alert('Не удалось определить событие');
      return;
    }

    if (!isCreator) {
      alert('Удалять событие может только создатель');
      return;
    }

    const confirmed = window.confirm('Удалить это событие? Это действие нельзя отменить.');

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
        alert('Не удалось удалить участников события');
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
        alert('Не удалось удалить событие');
        setLoadingDelete(false);
        return;
      }

      onNavigate('home');
    } catch (error) {
      console.error('Unexpected delete event error:', error);
      alert('Произошла ошибка при удалении события');
    } finally {
      setLoadingDelete(false);
    }
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
            ← Back
          </motion.button>
          <div className="w-14"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-sm mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="mb-3">{eventData.title}</h1>
              <p className="text-muted-foreground leading-relaxed">
                {eventData.description || 'No description provided'}
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
                  style={{ backgroundColor: '#3A3A3A' }}
                >
                  <span className="text-sm">📅</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p>{formatDate(eventData.date_time)}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#3A3A3A' }}
                >
                  <span className="text-sm">📍</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{eventData.location || 'Location not specified'}</p>
                </div>
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
                  })
                }
                className="text-sm text-muted-foreground mb-3 hover:opacity-80 active:opacity-60 transition-opacity"
              >
                Participants ({participants.length})
              </button>

                             {participants.length > 0 ? (
                <button
                  onClick={() =>
                    onNavigate('participants', {
                      ...eventData,
                      backTarget,
                    })
                  }
                  className="flex items-center -space-x-2 hover:opacity-90 active:opacity-70 transition-opacity"
                >
                  {participants.slice(0, 4).map((participant: any, idx: number) => {
                    const profileData = Array.isArray(participant.profiles)
                      ? participant.profiles[0]
                      : participant.profiles;

                    const name = profileData?.name || 'User';

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs border-2 border-background"
                        style={{ backgroundColor: '#3A3A3A' }}
                        title={name}
                      >
                        {name.slice(0, 2).toUpperCase()}
                      </motion.div>
                    );
                  })}

                  {participants.length > 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs border-2 border-background"
                      style={{ backgroundColor: '#2A2A2A' }}
                    >
                      +{participants.length - 4}
                    </motion.div>
                  )}
                </button>
              ) : (
                <div
                  className="px-4 py-3 rounded-xl text-center text-sm text-muted-foreground"
                  style={{ backgroundColor: '#1A1A1A' }}
                >
                  No participants yet
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
              {hasJoined ? (
                <TouchButton
                  variant="danger"
                  fullWidth
                  onClick={handleLeave}
                >
                  {loadingAction ? 'Leaving...' : 'Leave Event'}
                </TouchButton>
              ) : (
                <TouchButton
                  variant="primary"
                  fullWidth
                  onClick={handleJoin}
                >
                  {loadingAction ? 'Joining...' : 'Join Event'}
                </TouchButton>
              )}
            </>
          )}

          {isCreator && (
            <>
              <TouchButton
                variant="ghost"
                fullWidth
                onClick={() => onNavigate('edit-event', eventData)}
                style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#D4AF37' }}
              >
                Edit Event
              </TouchButton>

              <TouchButton
                variant="danger"
                fullWidth
                onClick={handleDeleteEvent}
              >
                {loadingDelete ? 'Deleting...' : 'Delete Event'}
              </TouchButton>
            </>
          )}
        </motion.div>
      </div>
    </SwipeableScreen>
  );
}