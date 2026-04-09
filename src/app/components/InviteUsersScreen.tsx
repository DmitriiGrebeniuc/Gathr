import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

type InviteUserItem = {
    id: string;
    name: string | null;
};

export function InviteUsersScreen({
    onNavigate,
    event,
}: {
    onNavigate: (screen: string, data?: any, customDirection?: 'forward' | 'back' | 'up' | 'down') => void;
    event?: any;
}) {
    const [users, setUsers] = useState<InviteUserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const { translate } = useLanguage();

    const parentBackTarget = event?.backTarget || 'participants';

    const eventPayload = useMemo(
        () => ({
            ...event,
            backTarget: event?.backTarget || 'home',
        }),
        [event]
    );

    const loadInviteCandidates = async () => {
        if (!event?.id) {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('Ошибка получения текущего пользователя:', userError);
                setCurrentUserId(null);
                setUsers([]);
                setLoading(false);
                return;
            }

            setCurrentUserId(user.id);

            const { data: allProfiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, name')
                .order('name', { ascending: true });

            if (profilesError) {
                console.error('Ошибка загрузки profiles:', profilesError);
                setUsers([]);
                setLoading(false);
                return;
            }

            const { data: participantRows, error: participantError } = await supabase
                .from('participants')
                .select('user_id')
                .eq('event_id', event.id);

            if (participantError) {
                console.error('Ошибка загрузки participants:', participantError);
                setUsers([]);
                setLoading(false);
                return;
            }

            const { data: invitationRows, error: invitationError } = await supabase
                .from('event_invitations')
                .select('invitee_id, status')
                .eq('event_id', event.id)
                .in('status', ['pending', 'accepted']);

            if (invitationError) {
                console.error('Ошибка загрузки invitations:', invitationError);
                setUsers([]);
                setLoading(false);
                return;
            }

            const participantIds = new Set((participantRows || []).map((row: any) => row.user_id));
            const invitedIds = new Set((invitationRows || []).map((row: any) => row.invitee_id));

            const filteredUsers = (allProfiles || []).filter((profile: any) => {
                if (!profile?.id) return false;
                if (profile.id === user.id) return false;
                if (profile.id === event.creator_id) return false;
                if (participantIds.has(profile.id)) return false;
                if (invitedIds.has(profile.id)) return false;
                return true;
            });

            setUsers(filteredUsers);
        } catch (error) {
            console.error('Unexpected invite candidates load error:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInviteCandidates();
    }, [event?.id]);

    const handleInvite = async (inviteeId: string) => {
        if (!event?.id || !currentUserId) {
            alert(translate('inviteUsers.failed'));
            return;
        }

        setInvitingUserId(inviteeId);

        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('plan, has_unlimited_access')
                .eq('id', currentUserId)
                .maybeSingle();

            if (profileError) {
                console.error('Ошибка загрузки профиля для проверки лимитов приглашений:', profileError);
                alert(translate('inviteUsers.failed'));
                setInvitingUserId(null);
                return;
            }

            const hasUnlimitedAccess = profileData?.has_unlimited_access ?? false;
            const plan = profileData?.plan ?? 'free';

            if (!hasUnlimitedAccess) {
                const invitesPerEventLimit = plan === 'pro' ? 100 : 10;

                const { count: invitationsCount, error: invitationsCountError } = await supabase
                    .from('event_invitations')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', event.id);

                if (invitationsCountError) {
                    console.error('Ошибка проверки лимита приглашений на событие:', invitationsCountError);
                    alert(translate('inviteUsers.failed'));
                    setInvitingUserId(null);
                    return;
                }

                if ((invitationsCount ?? 0) >= invitesPerEventLimit) {
                    alert(
                        `${translate('inviteUsers.invitesPerEventLimitReached')} ${translate('inviteUsers.invitesPerEventLimitReachedPro')}`
                    );
                    setInvitingUserId(null);
                    return;
                }
            }

            const { error } = await supabase.from('event_invitations').insert([
                {
                    event_id: event.id,
                    inviter_id: currentUserId,
                    invitee_id: inviteeId,
                },
            ]);

            if (error) {
                console.error('Ошибка отправки приглашения:', error);
                alert(translate('inviteUsers.failed'));
                setInvitingUserId(null);
                return;
            }

            alert(translate('inviteUsers.sent'));
            await loadInviteCandidates();
        } catch (error) {
            console.error('Unexpected invitation send error:', error);
            alert(translate('inviteUsers.unexpectedError'));
        } finally {
            setInvitingUserId(null);
        }
    };

    return (
        <SwipeableScreen
            onSwipeBack={() =>
                onNavigate('participants', eventPayload, 'back')
            }
        >
            <div className="h-full flex flex-col bg-background">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigate('participants', eventPayload, 'back')}
                        className="text-muted-foreground"
                    >
                        ← {translate('inviteUsers.back')}
                    </motion.button>
                    <h2>{translate('inviteUsers.title')}</h2>
                    <div className="w-14"></div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="max-w-sm mx-auto space-y-4">
                        {loading && (
                            <div className="text-sm text-muted-foreground">
                                {translate('inviteUsers.loading')}
                            </div>
                        )}

                        {!loading && users.length === 0 && (
                            <div
                                className="px-4 py-3 rounded-xl text-center text-sm text-muted-foreground"
                                style={{ backgroundColor: '#1A1A1A' }}
                            >
                                {translate('inviteUsers.empty')}
                            </div>
                        )}

                        {!loading &&
                            users.map((user) => {
                                const displayName = user.name || 'User';
                                const isInviting = invitingUserId === user.id;

                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-4 py-4 rounded-xl flex items-center gap-3 border border-border"
                                        style={{ backgroundColor: '#1A1A1A' }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                                            style={{ backgroundColor: '#2A2A2A' }}
                                        >
                                            {displayName.slice(0, 2).toUpperCase()}
                                        </div>

                                        <div className="flex-1">
                                            <p>{displayName}</p>
                                        </div>

                                        <button
                                            onClick={() => handleInvite(user.id)}
                                            disabled={isInviting}
                                            className="px-3 py-2 rounded-lg text-sm transition-opacity"
                                            style={{
                                                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                                                border: '1px solid rgba(212, 175, 55, 0.35)',
                                                color: '#D4AF37',
                                                opacity: isInviting ? 0.7 : 1,
                                            }}
                                        >
                                            {isInviting
                                                ? translate('inviteUsers.inviting')
                                                : translate('inviteUsers.inviteButton')}
                                        </button>
                                    </motion.div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </SwipeableScreen>
    );
}