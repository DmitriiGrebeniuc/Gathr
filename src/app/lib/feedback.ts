import { toast, type ExternalToast } from 'sonner';

export type FeedbackConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
};

export type FeedbackConfirmRequest = FeedbackConfirmOptions & {
  id: number;
  resolve: (result: boolean) => void;
};

type ConfirmHandler = ((request: FeedbackConfirmRequest) => void) | null;

let confirmHandler: ConfirmHandler = null;
let confirmId = 0;

const withDefaultToastOptions = (options?: ExternalToast): ExternalToast => ({
  duration: 3500,
  ...options,
});

export const feedback = {
  success(message: string, options?: ExternalToast) {
    toast.success(message, withDefaultToastOptions({ duration: 2800, ...options }));
  },
  error(message: string, options?: ExternalToast) {
    toast.error(message, withDefaultToastOptions({ duration: 4500, ...options }));
  },
  info(message: string, options?: ExternalToast) {
    toast(message, withDefaultToastOptions({ duration: 3200, ...options }));
  },
  warning(message: string, options?: ExternalToast) {
    toast.warning(message, withDefaultToastOptions({ duration: 4200, ...options }));
  },
  confirm(options: FeedbackConfirmOptions) {
    return new Promise<boolean>((resolve) => {
      if (!confirmHandler) {
        resolve(false);
        return;
      }

      confirmHandler({
        id: ++confirmId,
        resolve,
        ...options,
      });
    });
  },
};

export const registerConfirmHandler = (handler: ConfirmHandler) => {
  confirmHandler = handler;
};
