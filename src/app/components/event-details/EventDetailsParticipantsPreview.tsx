import { LoadingAvatarStrip, LoadingLine } from '../LoadingState';

type EventDetailsParticipantsPreviewProps = {
  eventData: any;
  backTarget: string;
  currentUserId: string | null;
  participantCount: number;
  participantAccessResolved: boolean;
  participantListResolved: boolean;
  canViewParticipantIdentities: boolean;
  participants: any[];
  translate: (key: any) => string;
  onNavigate: (
    screen: string,
    data?: any,
    customDirection?: 'forward' | 'back' | 'up' | 'down'
  ) => void;
};

export function EventDetailsParticipantsPreview({
  eventData,
  backTarget,
  currentUserId,
  participantCount,
  participantAccessResolved,
  participantListResolved,
  canViewParticipantIdentities,
  participants,
  translate,
  onNavigate,
}: EventDetailsParticipantsPreviewProps) {
  const openParticipants = () =>
    onNavigate('participants', {
      ...eventData,
      backTarget,
      currentUserId,
      participantCount,
      canViewParticipantIdentities,
    });

  return (
    <div>
      <button
        onClick={openParticipants}
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
          onClick={openParticipants}
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
  );
}
