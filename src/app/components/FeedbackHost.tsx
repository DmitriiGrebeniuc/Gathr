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
        richColors
        closeButton
        visibleToasts={4}
        expand={false}
        toastOptions={{
          style: {
            background: '#171717',
            color: '#F5F5F5',
            border: '1px solid rgba(255, 255, 255, 0.08)',
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
            backgroundColor: '#171717',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#F5F5F5',
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
                backgroundColor: '#111111',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: '#F5F5F5',
              }}
            >
              {request?.cancelLabel || translate('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => closeConfirm(true)}
              className="rounded-xl border-0"
              style={{
                backgroundColor:
                  request?.variant === 'destructive' ? '#FF4D6D' : '#D4AF37',
                color: request?.variant === 'destructive' ? '#FFFFFF' : '#111111',
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
