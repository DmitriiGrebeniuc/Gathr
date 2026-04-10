/**
 * After sign-in, the shell navigates to `returnTo` and optionally runs `action`
 * (e.g. auto-join a shared event).
 */
export type PostAuthAction =
  | {
      type: 'join-event';
      eventId: string;
    }
  | null;

export type PostLoginIntent = {
  returnTo: {
    screen: string;
    data?: any;
  };
  action: PostAuthAction;
};

/** Payload for `onNavigate('login', …)` from App `handleNavigate`. */
export type LoginNavigationPayload = {
  returnToAfterAuth: PostLoginIntent['returnTo'];
  actionAfterAuth?: PostAuthAction;
  backScreen: string;
  backData?: any;
};

export function isLoginNavigationPayload(data: any): data is LoginNavigationPayload {
  return !!data && typeof data === 'object' && 'returnToAfterAuth' in data;
}

/** Clears any post-login intent when opening login (e.g. after password reset). */
export type ClearPostLoginIntentPayload = {
  clearPostLoginIntent: true;
};

export function isClearPostLoginIntentPayload(data: any): data is ClearPostLoginIntentPayload {
  return !!data && typeof data === 'object' && data.clearPostLoginIntent === true;
}

/** Build navigate-to-login payload: shared event → auth → return to details (+ optional join). */
export function buildJoinEventLoginPayload(eventData: any): LoginNavigationPayload {
  const backTarget = 'home';
  const detailPayload = {
    ...eventData,
    backTarget,
  };

  return {
    returnToAfterAuth: {
      screen: 'event-details',
      data: detailPayload,
    },
    actionAfterAuth: eventData?.id
      ? { type: 'join-event' as const, eventId: eventData.id }
      : null,
    backScreen: 'event-details',
    backData: detailPayload,
  };
}
