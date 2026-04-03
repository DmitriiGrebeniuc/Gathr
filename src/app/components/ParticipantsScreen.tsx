import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { supabase } from '../../lib/supabase';

export function ParticipantsScreen({
    onNavigate,
    event,
}: {
    onNavigate: (screen: string, data?: any) => void;
    event?: any;
}) {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const parentBackTarget = event?.backTarget || 'home';

    const loadParticipants = async () => {
        if (!event?.id) {
            setParticipants([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('participants')
                .select(`
          user_id,
          event_id,
          profiles(name)
        `)
                .eq('event_id', event.id);

            if (error) {
                console.error('Ошибка загрузки участников:', error);
                setParticipants([]);
                setLoading(false);
                return;
            }

            setParticipants(data || []);
        } catch (error) {
            console.error('Unexpected participants load error:', error);
            setParticipants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
                },
                async () => {
                    await loadParticipants();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [event?.id]);

    return (
        <SwipeableScreen
            onSwipeBack={() =>
                onNavigate('event-details', {
                    ...event,
                    backTarget: parentBackTarget,
                })
            }
        >
            <div className="h-full flex flex-col bg-background">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                            onNavigate('event-details', {
                                ...event,
                                backTarget: parentBackTarget,
                            })
                        }
                        className="text-muted-foreground"
                    >
                        ← Back
                    </motion.button>
                    <h2>Participants</h2>
                    <div className="w-14"></div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="max-w-sm mx-auto space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {event?.title || 'Event'}
                            </p>
                            <h3 className="mt-1">
                                {participants.length} participant{participants.length === 1 ? '' : 's'}
                            </h3>
                        </div>

                        {loading && (
                            <div className="text-sm text-muted-foreground">
                                Loading participants...
                            </div>
                        )}

                        {!loading && participants.length === 0 && (
                            <div
                                className="px-4 py-3 rounded-xl text-center text-sm text-muted-foreground"
                                style={{ backgroundColor: '#1A1A1A' }}
                            >
                                No participants yet
                            </div>
                        )}

                        {!loading &&
                            participants.map((participant: any, idx: number) => {
                                const profileData = Array.isArray(participant.profiles)
                                    ? participant.profiles[0]
                                    : participant.profiles;

                                const name = profileData?.name || 'User';

                                return (
                                    <motion.div
                                        key={`${participant.user_id}-${idx}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="px-4 py-4 rounded-xl flex items-center gap-3 border border-border"
                                        style={{ backgroundColor: '#1A1A1A' }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                                            style={{ backgroundColor: '#2A2A2A' }}
                                        >
                                            {name.slice(0, 2).toUpperCase()}
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