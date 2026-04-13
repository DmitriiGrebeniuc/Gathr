import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { registerConfirmHandler, type FeedbackConfirmRequest } from '../lib/feedback';

export function FeedbackHost() {
  const { translate } = useLanguage();
  const [request, setRequest] = useState<FeedbackConfirmRequest | null>(null);

  useEffect(() => {
    registerConfirmHandler((nextRequest) => {
      setRequest(nextRequest);
    });

    return () => {
      registerConfirmHandler(null);
    };
  }, []);

  const closeConfirm = (result: boolean) => {
    if (!request) {
      return;
    }

    const activeRequest = request;
    setRequest(null);
    activeRequest.resolve(result);
  };

  return (
    <>
      <Toaster
        position="top-center"
        offset="calc(env(safe-area-inset-top, 0px) + 12px)"
        richColors
        closeButton
        visibleToasts={4}
        expand={false}
        toastOptions={{
          style: {
            background: 'var(--surface-interactive)',
            color: 'var(--foreground-strong)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
            borderRadius: '16px',
          },
        }}
      />

      <AlertDialog
        open={!!request}
        onOpenChange={(open) => {
          if (!open) {
            closeConfirm(false);
          }
        }}
      >
        <AlertDialogContent
          className="max-w-[calc(100%-2rem)] rounded-2xl border"
          style={{
            backgroundColor: 'var(--surface-interactive)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--foreground-strong)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{request?.title}</AlertDialogTitle>
            {request?.description && (
              <AlertDialogDescription>{request.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => closeConfirm(false)}
              className="rounded-xl border"
              style={{
                backgroundColor: 'var(--surface-strong)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--foreground-strong)',
              }}
            >
              {request?.cancelLabel || translate('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => closeConfirm(true)}
              className="rounded-xl border-0"
              style={{
                backgroundColor:
                  request?.variant === 'destructive'
                    ? 'var(--destructive-strong)'
                    : 'var(--accent)',
                color:
                  request?.variant === 'destructive'
                    ? 'var(--destructive-foreground)'
                    : 'var(--surface-strong)',
              }}
            >
              {request?.confirmLabel || translate('common.save')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
