import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function AdminActionDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  reasonLabel = 'Reason',
  placeholder = 'Add a short reason',
  defaultReason = '',
  destructive = false,
  required = false,
  loading = false,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  reasonLabel?: string;
  placeholder?: string;
  defaultReason?: string;
  destructive?: boolean;
  required?: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState(defaultReason);

  useEffect(() => {
    if (open) {
      setReason(defaultReason);
    }
  }, [defaultReason, open]);

  const trimmedReason = reason.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <label className="block space-y-2 text-sm">
          <span className="text-muted-foreground">{reasonLabel}</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 800))}
            placeholder={placeholder}
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none"
          />
          <span className="block text-right text-xs text-muted-foreground">
            {reason.length}/800
          </span>
        </label>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl border border-border px-4 py-2 text-sm disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(trimmedReason)}
            disabled={loading || (required && !trimmedReason)}
            className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-60"
            style={{
              borderColor: destructive ? 'rgb(244 63 94 / 0.45)' : 'var(--accent-border)',
              backgroundColor: destructive ? 'rgb(244 63 94 / 0.08)' : 'var(--accent-soft)',
              color: destructive ? 'rgb(244 63 94)' : 'var(--accent)',
            }}
          >
            {loading ? 'Saving...' : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
