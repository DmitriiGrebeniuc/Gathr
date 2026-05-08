import { TouchButton } from '../TouchButton';

type EventDetailsFooterActionsProps = {
  isCreator: boolean;
  joinMode: 'open' | 'request';
  isClosedAccessResolving: boolean;
  hasJoined: boolean;
  isPastEvent: boolean;
  loadingAction: boolean;
  loadingDelete: boolean;
  sharing: boolean;
  submittingJoinRequest: boolean;
  hasJoinRequest: boolean;
  eventData: any;
  pendingJoinRequestsCount: number;
  translate: (key: any) => string;
  onShare: () => void;
  onLeave: () => void;
  onJoin: () => void;
  onOpenJoinRequestComposer: () => void;
  onOpenJoinRequests: () => void;
  onOpenInvite: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function EventDetailsFooterActions({
  isCreator,
  joinMode,
  isClosedAccessResolving,
  hasJoined,
  isPastEvent,
  loadingAction,
  loadingDelete,
  sharing,
  submittingJoinRequest,
  hasJoinRequest,
  eventData,
  pendingJoinRequestsCount,
  translate,
  onShare,
  onLeave,
  onJoin,
  onOpenJoinRequestComposer,
  onOpenJoinRequests,
  onOpenInvite,
  onEdit,
  onDelete,
}: EventDetailsFooterActionsProps) {
  return (
    <div className="p-6 border-t border-border space-y-3">
      {!isCreator && !isClosedAccessResolving && (
        <div className="grid grid-cols-2 gap-3">
          <TouchButton
            variant="ghost"
            onClick={onShare}
            disabled={sharing || loadingAction || loadingDelete || !eventData.id}
            style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
          >
            {sharing ? translate('details.sharing') : translate('details.shareEvent')}
          </TouchButton>

          {hasJoined ? (
            <TouchButton
              variant="danger"
              onClick={onLeave}
              disabled={loadingAction || loadingDelete}
            >
              {loadingAction ? translate('details.leaving') : translate('details.leaveEvent')}
            </TouchButton>
          ) : joinMode === 'request' ? (
            <TouchButton
              variant="primary"
              onClick={onOpenJoinRequestComposer}
              disabled={
                loadingAction ||
                loadingDelete ||
                submittingJoinRequest ||
                hasJoinRequest ||
                isPastEvent
              }
            >
              {translate('details.joinRequestButton')}
            </TouchButton>
          ) : !isPastEvent ? (
            <TouchButton
              variant="primary"
              onClick={onJoin}
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
            onClick={onShare}
            disabled={sharing || loadingAction || loadingDelete || !eventData.id}
            style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
          >
            {sharing ? translate('details.sharing') : translate('details.shareEvent')}
          </TouchButton>

          <TouchButton
            variant="ghost"
            onClick={onOpenJoinRequests}
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
            onClick={onShare}
            disabled={sharing || loadingAction || loadingDelete || !eventData.id}
            style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
          >
            {sharing ? translate('details.sharing') : translate('details.shareEvent')}
          </TouchButton>

          <TouchButton
            variant="ghost"
            onClick={onOpenInvite}
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
            onClick={onEdit}
            disabled={loadingDelete || loadingAction}
            style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
          >
            {translate('details.editEvent')}
          </TouchButton>

          <TouchButton
            variant="danger"
            onClick={onDelete}
            disabled={loadingDelete || loadingAction}
          >
            {loadingDelete ? translate('details.deleting') : translate('details.deleteEvent')}
          </TouchButton>
        </div>
      )}
    </div>
  );
}
