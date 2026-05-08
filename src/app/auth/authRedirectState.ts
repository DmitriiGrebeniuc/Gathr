import type { LoginContext } from '../types/navigation';
import type { PostLoginIntent } from './postLoginIntent';

const AUTH_REDIRECT_STATE_KEY = 'gathr-auth-redirect-state';

export function readStoredAuthRedirectState(): {
  pendingAfterAuth: PostLoginIntent | null;
  loginContext: LoginContext;
} {
  if (typeof window === 'undefined') {
    return {
      pendingAfterAuth: null,
      loginContext: null,
    };
  }

  try {
    const raw = window.sessionStorage.getItem(AUTH_REDIRECT_STATE_KEY);

    if (!raw) {
      return {
        pendingAfterAuth: null,
        loginContext: null,
      };
    }

    const parsed = JSON.parse(raw) as {
      pendingAfterAuth?: PostLoginIntent | null;
      loginContext?: LoginContext;
    };

    return {
      pendingAfterAuth: parsed.pendingAfterAuth ?? null,
      loginContext: parsed.loginContext ?? null,
    };
  } catch (error) {
    console.error('Failed to read stored auth redirect state:', error);
    return {
      pendingAfterAuth: null,
      loginContext: null,
    };
  }
}

export function persistStoredAuthRedirectState(
  nextPendingAfterAuth: PostLoginIntent | null,
  nextLoginContext: LoginContext
) {
  try {
    if (!nextPendingAfterAuth && !nextLoginContext) {
      window.sessionStorage.removeItem(AUTH_REDIRECT_STATE_KEY);
      return;
    }

    window.sessionStorage.setItem(
      AUTH_REDIRECT_STATE_KEY,
      JSON.stringify({
        pendingAfterAuth: nextPendingAfterAuth,
        loginContext: nextLoginContext,
      })
    );
  } catch (error) {
    console.error('Failed to persist auth redirect state:', error);
  }
}
