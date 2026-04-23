import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { TouchButton } from './TouchButton';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchCreatorEventJoinRequests,
  reviewEventJoinRequest,
  type CreatorEventJoinRequest,
} from '../lib/publicData';
import { feedback } from '../lib/feedback';

export function EventJoinRequestsScreen({
  onNavigate,
  event,
}: {
  onNavigate: (screen: string, data?: any, customDirection?: 'forward' | 'back' | 'up' | 'down') => void;
  event?: any;
}) {
  const { translate } = useLanguage();
  const [requests, setRequests] = useState<CreatorEventJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  const parentBackTarget = event?.backTarget || 'event-details';

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === 'pending').length,
    [requests]
  );

  const loadRequests = async () => {
    if (!event?.id) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextRequests = await fetchCreatorEventJoinRequests(event.id);
      setRequests(nextRequests);
    } catch (error) {
      console.error('Unexpected join requests load error:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [event?.id]);

  const handleReview = async (
    requestId: string,
    nextStatus: 'approved' | 'rejected'
  ) => {
    setUpdatingRequestId(requestId);

    try {
      const { error } = await reviewEventJoinRequest(requestId, nextStatus);

      if (error) {
        console.error('Failed to review event join request:', error);
        feedback.error(translate('details.joinRequestReviewFailed'));
        return;
      }

      feedback.success(
        nextStatus === 'approved'
          ? translate('details.joinRequestApproved')
          : translate('details.joinRequestRejected')
      );

      await loadRequests();
    } catch (error) {
      console.error('Unexpected join request review error:', error);
      feedback.error(translate('details.joinRequestReviewUnexpectedError'));
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const getStatusLabel = (status: CreatorEventJoinRequest['status']) => {
    if (status === 'approved') {
      return translate('details.joinRequestStatusApproved');
    }

    if (status === 'rejected') {
      return translate('details.joinRequestStatusRejected');
    }

    return translate('details.joinRequestStatusPending');
  };

  const getStatusStyle = (status: CreatorEventJoinRequest['status']) => {
    if (status === 'approved') {
      return {
        color: 'var(--success)',
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
        borderColor: 'rgba(34, 197, 94, 0.22)',
      };
    }

    if (status === 'rejected') {
      return {
        color: 'var(--destructive)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.22)',
      };
    }

    return {
      color: 'var(--accent)',
      backgroundColor: 'var(--accent-soft-muted)',
      borderColor: 'var(--accent-border-muted)',
    };
  };

  return (
    <SwipeableScreen
      onSwipeBack={() =>
        onNavigate(
          'event-details',
          {
            ...event,
            backTarget: parentBackTarget,
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
                },
                'back'
              )
            }
            className="text-muted-foreground"
          >
            ← {translate('details.back')}
          </motion.button>
          <h2>{translate('details.joinRequestsTitle')}</h2>
          <div className="w-14" />
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-6"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-sm mx-auto space-y-4">
            <div
              className="rounded-2xl border px-4 py-4"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--accent-border-muted)',
              }}
            >
              <p className="text-sm text-muted-foreground">
                {event?.title || translate('common.event')}
              </p>
              <p className="mt-1">
                {pendingCount} {translate('details.joinRequestStatusPending')}
              </p>
            </div>

            {loading && (
              <div className="text-sm text-muted-foreground">
                {translate('common.loading')}
              </div>
            )}

            {!loading && requests.length === 0 && (
              <div
                className="rounded-2xl border px-4 py-4 text-sm text-muted-foreground"
                style={{ backgroundColor: 'var(--card)' }}
              >
                {translate('details.joinRequestsEmpty')}
              </div>
            )}

            {!loading &&
              requests.map((request) => {
                const isUpdating = updatingRequestId === request.id;
                const statusStyle = getStatusStyle(request.status);

                return (
                  <div
                    key={request.id}
                    className="rounded-2xl border px-4 py-4 space-y-4"
                    style={{ backgroundColor: 'var(--card)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p>{request.requester_name || translate('common.user')}</p>
                        {request.created_at && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <span
                        className="shrink-0 rounded-full border px-2.5 py-1 text-[11px]"
                        style={statusStyle}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    <div
                      className="rounded-xl border px-3 py-3 text-sm text-muted-foreground"
                      style={{ backgroundColor: 'var(--surface-strong)' }}
                    >
                      {request.message || translate('details.joinRequestNoMessage')}
                    </div>

                    {request.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-3">
                        <TouchButton
                          variant="primary"
                          onClick={() => handleReview(request.id, 'approved')}
                          disabled={isUpdating}
                        >
                          {isUpdating
                            ? translate('common.loading')
                            : translate('details.joinRequestApprove')}
                        </TouchButton>

                        <TouchButton
                          variant="danger"
                          onClick={() => handleReview(request.id, 'rejected')}
                          disabled={isUpdating}
                        >
                          {isUpdating
                            ? translate('common.loading')
                            : translate('details.joinRequestReject')}
                        </TouchButton>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </SwipeableScreen>
  );
}
