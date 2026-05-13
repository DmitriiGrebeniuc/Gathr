import { supabase } from '../../lib/supabase';
import type { AdminDiagnosticLevel } from '../types/admin';

const SENSITIVE_KEYS = new Set([
  'access_token',
  'refresh_token',
  'token',
  'authorization',
  'password',
  'initData',
  'init_data',
]);

type DiagnosticInput = {
  level?: AdminDiagnosticLevel;
  source: string;
  eventName: string;
  message?: string | null;
  metadata?: unknown;
};

export async function logDiagnostic(input: DiagnosticInput) {
  try {
    await supabase.rpc('log_app_diagnostic', {
      p_level: input.level ?? 'info',
      p_source: input.source,
      p_event_name: input.eventName,
      p_message: input.message ?? null,
      p_metadata: sanitizeMetadata(input.metadata),
      p_url: typeof window === 'undefined' ? null : window.location.href,
      p_user_agent: typeof navigator === 'undefined' ? null : navigator.userAgent,
      p_app_version: import.meta.env.VITE_APP_VERSION ?? null,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to write diagnostic event:', error);
    }
  }
}

export function logClientError(error: unknown, context?: Record<string, unknown>) {
  return logDiagnostic({
    level: 'error',
    source: 'ui',
    eventName: 'client_error',
    message: getErrorMessage(error),
    metadata: { ...context, error: serializeError(error) },
  });
}

export function logSupabaseError(error: unknown, context?: Record<string, unknown>) {
  return logDiagnostic({
    level: 'error',
    source: context?.area === 'admin' ? 'admin' : 'supabase',
    eventName: 'supabase_operation_failed',
    message: getErrorMessage(error),
    metadata: { ...context, error: serializeError(error) },
  });
}

export function logAuthIssue(message: string, metadata?: Record<string, unknown>) {
  return logDiagnostic({
    level: 'warning',
    source: 'auth',
    eventName: 'auth_issue',
    message,
    metadata,
  });
}

export function logTelegramAuthIssue(message: string, metadata?: Record<string, unknown>) {
  return logDiagnostic({
    level: 'warning',
    source: 'telegram',
    eventName: 'telegram_auth_issue',
    message,
    metadata,
  });
}

export function sanitizeMetadata(value: unknown): unknown {
  return sanitizeValue(value, 0);
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (depth > 4) {
    return '[truncated]';
  }

  if (Array.isArray(value)) {
    return value.slice(0, 30).map((item) => sanitizeValue(item, depth + 1));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, item]) => {
        if (SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(key.toLowerCase())) {
          acc[key] = '[redacted]';
        } else {
          acc[key] = sanitizeValue(item, depth + 1);
        }

        return acc;
      },
      {}
    );
  }

  if (typeof value === 'string') {
    return value.length > 1000 ? `${value.slice(0, 1000)}...` : value;
  }

  return value ?? null;
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.slice(0, 1200),
    };
  }

  return sanitizeValue(error, 0);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? 'Unknown error');
  }

  return typeof error === 'string' ? error : 'Unknown error';
}
