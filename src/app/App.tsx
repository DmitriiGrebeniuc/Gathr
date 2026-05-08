import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { User } from '@supabase/supabase-js';
import { BottomNav } from './components/BottomNav';
import { ScreenTransition } from './components/ScreenTransition';
import { supabase } from '../lib/supabase';
import { FeedbackHost } from './components/FeedbackHost';
import { useLanguage } from './context/LanguageContext';
import { feedback } from './lib/feedback';
import { getSharedEventIdFromPath } from './auth/sharedEventPath';
import { loadSharedEventById } from './auth/loadSharedEvent';
import type { PostLoginIntent } from './auth/postLoginIntent';
import {
  getTelegramMiniAppBrowserFallbackCopy,
  initTelegramMiniApp,
  isTelegramAppContext,
  isTelegramMiniApp,
  openInExternalBrowser,
} from '../lib/telegramMiniApp';
import { signInWithTelegramMiniApp } from '../lib/telegramMiniAppAuth';
import {
  isClearPostLoginIntentPayload,
  isLoginNavigationPayload,
} from './auth/postLoginIntent';
import {
  readStoredAuthRedirectState,
  persistStoredAuthRedirectState,
} from './auth/authRedirectState';
import { getAuthFlowType } from './auth/authFlow';
import {
  getCurrentLegalConsent,
  getCurrentProfileAccess,
  hasAcceptedCurrentLegal,
  syncProfileFromAuthUser,
} from './auth/currentUserProfile';
import { AppErrorBoundary } from './components/app/AppErrorBoundary';
import { AppFrame, AppLoadingFrame } from './components/app/AppFrame';
import { AppScreenRenderer } from './components/app/AppScreenRenderer';
import type {
  LoginContext,
  NavigationDirection,
  NavigationEntry,
  ScreenName,
} from './types/navigation';

export default function App() {
  const initialAuthRedirectState = readStoredAuthRedirectState();
  const [navigationStack, setNavigationStack] = useState<NavigationEntry[]>([
    { screen: 'welcome' },
  ]);
  const [direction, setDirection] = useState<NavigationDirection>('forward');
  const [authChecked, setAuthChecked] = useState(false);
  const [telegramMiniAppAuthFailed, setTelegramMiniAppAuthFailed] = useState(false);

  const [pendingAfterAuth, setPendingAfterAuth] = useState<PostLoginIntent | null>(
    initialAuthRedirectState.pendingAfterAuth
  );
  const [loginContext, setLoginContext] = useState<LoginContext>(
    initialAuthRedirectState.loginContext
  );

  const pendingAfterAuthRef = useRef<PostLoginIntent | null>(
    initialAuthRedirectState.pendingAfterAuth
  );
  const isRecoveryModeRef = useRef(false);
  const handledSharedEventRef = useRef(false);
  const currentScreenRef = useRef('welcome');
  const navigationStackRef = useRef<NavigationEntry[]>([{ screen: 'welcome' }]);
  const skipNextPopStateRef = useRef(false);
  const telegramMiniAppAuthAttemptedRef = useRef(false);
  const skipNextSignedInNavigationRef = useRef(false);

  const { language, translate } = useLanguage();
  const isMobileViewport = window.innerWidth < 768;

  const currentEntry = navigationStack[navigationStack.length - 1] ?? { screen: 'welcome' };
  const currentScreen = currentEntry.screen;
  const selectedEvent = currentEntry.data ?? null;

  useEffect(() => {
    currentScreenRef.current = currentScreen;
    navigationStackRef.current = navigationStack;
  }, [currentScreen, navigationStack]);

  const getSafeNavigationStack = (entries: NavigationEntry[]) =>
    entries.length > 0 ? entries : [{ screen: 'welcome' }];

  const syncBrowserState = (
    mode: 'push' | 'replace',
    entries: NavigationEntry[] = navigationStackRef.current
  ) => {
    if (typeof window === 'undefined') {
      return;
    }

    const safeEntries = getSafeNavigationStack(entries);
    const currentEntry = safeEntries[safeEntries.length - 1];
    const state = {
      gathrNavigation: true,
      depth: safeEntries.length,
      screen: currentEntry?.screen || 'welcome',
    };

    if (mode === 'push') {
      window.history.pushState(state, '');
      return;
    }

    window.history.replaceState(state, '');
  };

  const applyNavigationStack = (
    entries: NavigationEntry[],
    nextDirection: NavigationDirection,
    browserMode: 'push' | 'replace'
  ) => {
    const nextStack = getSafeNavigationStack(entries);

    setDirection(nextDirection);
    navigationStackRef.current = nextStack;
    currentScreenRef.current = nextStack[nextStack.length - 1]?.screen || 'welcome';
    setNavigationStack(nextStack);
    syncBrowserState(browserMode, nextStack);
  };

  const replaceNavigation = (
    entries: NavigationEntry[],
    nextDirection: NavigationDirection = 'forward',
    browserMode: 'push' | 'replace' = 'replace'
  ) => {
    applyNavigationStack(entries, nextDirection, browserMode);
  };

  const resetNavigation = (
    screen: ScreenName,
    data?: any,
    nextDirection: NavigationDirection = 'forward'
  ) => {
    replaceNavigation([{ screen, data }], nextDirection, 'replace');
  };

  const goBack = (fallbackScreen = 'home', fallbackData?: any) => {
    const stack = navigationStackRef.current;

    if (stack.length > 1) {
      const nextStack = stack.slice(0, -1);
      applyNavigationStack(nextStack, 'back', 'replace');

      if (typeof window !== 'undefined' && window.history.state?.gathrNavigation) {
        skipNextPopStateRef.current = true;
        window.history.back();
      }

      return;
    }

    resetNavigation(fallbackScreen, fallbackData, 'back');
  };

  const goBackToScreen = (targetScreen: ScreenName, data?: any) => {
    const stack = navigationStackRef.current;
    const targetIndex = stack.map((entry) => entry.screen).lastIndexOf(targetScreen);

    if (targetIndex === -1) {
      resetNavigation(targetScreen, data, 'back');
      return;
    }

    const nextStack = stack.slice(0, targetIndex + 1);
    if (data !== undefined) {
      nextStack[targetIndex] = {
        ...nextStack[targetIndex],
        data,
      };
    }

    applyNavigationStack(nextStack, 'back', 'replace');

    const stepsBack = stack.length - nextStack.length;
    if (typeof window !== 'undefined' && stepsBack > 0 && window.history.state?.gathrNavigation) {
      skipNextPopStateRef.current = true;
      window.history.go(-stepsBack);
      return;
    }
  };

  const persistAuthRedirectState = (
    nextPendingAfterAuth: PostLoginIntent | null,
    nextLoginContext: LoginContext
  ) => {
    persistStoredAuthRedirectState(nextPendingAfterAuth, nextLoginContext);
  };

  const updateAuthRedirectState = (
    nextPendingAfterAuth: PostLoginIntent | null,
    nextLoginContext: LoginContext
  ) => {
    pendingAfterAuthRef.current = nextPendingAfterAuth;
    setPendingAfterAuth(nextPendingAfterAuth);
    setLoginContext(nextLoginContext);
    persistAuthRedirectState(nextPendingAfterAuth, nextLoginContext);
  };

  const clearAuthRedirectState = () => {
    updateAuthRedirectState(null, null);
  };

  const redirectBlockedAccountToWelcome = async () => {
    clearAuthRedirectState();
    resetNavigation('welcome', null, 'back');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Failed to sign out blocked user:', error);
    }

    feedback.error(translate('auth.accountBlocked'));
  };

  const applySignedInNavigation = async (user: User) => {
    await syncProfileFromAuthUser(user, translate('common.user'));

    const profileAccess = await getCurrentProfileAccess();

    if (profileAccess?.is_banned) {
      await redirectBlockedAccountToWelcome();
      return;
    }

    const legalConsent = await getCurrentLegalConsent(user.id);

    if (!hasAcceptedCurrentLegal(legalConsent)) {
      resetNavigation('legal-consent', null, 'forward');
      return;
    }

    if (pendingAfterAuthRef.current) {
      const pending = pendingAfterAuthRef.current;

      resetNavigation(
        pending.returnTo.screen,
        pending.returnTo.data
          ? {
              ...pending.returnTo.data,
              authAction: pending.action || null,
            }
          : null,
        'forward'
      );

      clearAuthRedirectState();
      return;
    }

    const sharedEventId = getSharedEventIdFromPath(window.location.pathname);

    if (sharedEventId && handledSharedEventRef.current) {
      return;
    }

    resetNavigation('home', null, 'forward');
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Google OAuth sign-in failed:', error);
        feedback.error(error.message || translate('login.googleFailed'));
      }
    } catch (error) {
      console.error('Unexpected Google OAuth sign-in error:', error);
      feedback.error(translate('login.googleFailed'));
    }
  };

  const handleTelegramLogin = async () => {
    if (isTelegramMiniApp()) {
      try {
        skipNextSignedInNavigationRef.current = true;
        setTelegramMiniAppAuthFailed(false);
        await signInWithTelegramMiniApp();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          throw error ?? new Error('telegram_miniapp_user_missing_after_signin');
        }

        telegramMiniAppAuthAttemptedRef.current = false;
        setTelegramMiniAppAuthFailed(false);
        await applySignedInNavigation(user);
        return;
      } catch (error) {
        skipNextSignedInNavigationRef.current = false;
        setTelegramMiniAppAuthFailed(true);
        console.error('Telegram Mini App manual auth retry failed:', error);
        feedback.error(translate('login.telegramFailed'));
        return;
      }
    }

    if (isTelegramAppContext()) {
      const browserFallbackCopy = getTelegramMiniAppBrowserFallbackCopy(language);
      openInExternalBrowser(window.location.origin);
      feedback.info(browserFallbackCopy.description);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'custom:telegram',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Telegram OAuth sign-in failed:', error);
        feedback.error(error.message || translate('login.telegramFailed'));
      }
    } catch (error) {
      console.error('Unexpected Telegram OAuth sign-in error:', error);
      feedback.error(translate('login.telegramFailed'));
    }
  };

  const handleLegalConsentAccepted = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Failed to get user after legal consent:', error);
        resetNavigation('welcome', null, 'back');
        return;
      }

      await applySignedInNavigation(user);
    } catch (error) {
      console.error('Unexpected legal consent completion error:', error);
      feedback.error(translate('legal.consentSaveFailed'));
    }
  };

  const handleLegalConsentLogout = async () => {
    clearAuthRedirectState();
    telegramMiniAppAuthAttemptedRef.current = false;
    skipNextSignedInNavigationRef.current = false;
    setTelegramMiniAppAuthFailed(false);
    resetNavigation('welcome', null, 'back');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Failed to sign out from legal consent screen:', error);
      feedback.error(translate('profile.logoutFailed'));
    }
  };

  useEffect(() => {
    return initTelegramMiniApp();
  }, []);

  useEffect(() => {
    const getViewportHeight = () => {
      const visualHeight = window.visualViewport?.height;

      if (visualHeight && Number.isFinite(visualHeight)) {
        return Math.round(visualHeight);
      }

      return window.innerHeight;
    };

    const updateAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${getViewportHeight()}px`);
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', updateAppHeight);
    window.addEventListener('pageshow', updateAppHeight);
    window.visualViewport?.addEventListener('resize', updateAppHeight);
    window.visualViewport?.addEventListener('scroll', updateAppHeight);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestAnimationFrame(() => {
          updateAppHeight();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.removeEventListener('orientationchange', updateAppHeight);
      window.removeEventListener('pageshow', updateAppHeight);
      window.visualViewport?.removeEventListener('resize', updateAppHeight);
      window.visualViewport?.removeEventListener('scroll', updateAppHeight);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    syncBrowserState('replace');

    const handlePopState = () => {
      if (skipNextPopStateRef.current) {
        skipNextPopStateRef.current = false;
        return;
      }

      const stack = navigationStackRef.current;

      if (stack.length > 1) {
        const nextStack = stack.slice(0, -1);
        applyNavigationStack(nextStack, 'back', 'replace');
        return;
      }

      if (currentScreenRef.current !== 'home' && currentScreenRef.current !== 'welcome') {
        resetNavigation('home', null, 'back');
        syncBrowserState('push');
        return;
      }

      syncBrowserState('push');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const href = window.location.href;
    const pathname = window.location.pathname;

    const accessTokenMatch = href.match(/[?#&]access_token=([^&#]+)/);
    const refreshTokenMatch = href.match(/[?#&]refresh_token=([^&#]+)/);
    const authFlowType = getAuthFlowType(href);

    const accessToken = accessTokenMatch ? decodeURIComponent(accessTokenMatch[1]) : null;
    const refreshToken = refreshTokenMatch ? decodeURIComponent(refreshTokenMatch[1]) : null;

    const isRecovery = authFlowType === 'recovery' && !!accessToken;

    const openSharedEventIfNeeded = async () => {
      if (handledSharedEventRef.current) {
        return false;
      }

      const sharedEventId = getSharedEventIdFromPath(pathname);

      if (!sharedEventId) {
        return false;
      }

      const sharedEvent = await loadSharedEventById(sharedEventId);

      if (!sharedEvent) {
        return false;
      }

      handledSharedEventRef.current = true;
      resetNavigation(
        'event-details',
        {
          ...sharedEvent,
          backTarget: 'home',
        },
        'forward'
      );

      return true;
    };

    const checkSession = async () => {
      try {
        if (isRecovery && accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('РћС€РёР±РєР° СѓСЃС‚Р°РЅРѕРІРєРё recovery session:', sessionError);
            resetNavigation('welcome', null, 'back');
            setAuthChecked(true);
            return;
          }

          isRecoveryModeRef.current = true;
          resetNavigation('reset-password', null, 'forward');
          setAuthChecked(true);
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        const activeSession = session;
        const activeError = error;

        const openedSharedEvent = await openSharedEventIfNeeded();

        if (openedSharedEvent) {
          setAuthChecked(true);
          return;
        }

        if (activeError) {
          console.error('РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЃСЃРёРё:', activeError);
          resetNavigation('welcome', null, 'back');
        } else if (activeSession?.user) {
          telegramMiniAppAuthAttemptedRef.current = false;
          setTelegramMiniAppAuthFailed(false);
          await applySignedInNavigation(activeSession.user);
        } else {
          resetNavigation('welcome', null, 'back');
        }
      } catch (error) {
        console.error('Unexpected session check error:', error);
        resetNavigation('welcome', null, 'back');
      } finally {
        setAuthChecked(true);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && skipNextSignedInNavigationRef.current) {
        skipNextSignedInNavigationRef.current = false;
        return;
      }

      if (event === 'PASSWORD_RECOVERY') {
        isRecoveryModeRef.current = true;
        resetNavigation('reset-password', null, 'forward');
        return;
      }

      if (
        event === 'SIGNED_IN' &&
        getAuthFlowType(window.location.href) === 'recovery' &&
        window.location.href.includes('access_token=')
      ) {
        isRecoveryModeRef.current = true;
        resetNavigation('reset-password', null, 'forward');
        return;
      }

      if (isRecoveryModeRef.current) {
        return;
      }

      if (session?.user) {
        const shouldApplySignedInNavigation =
          event === 'SIGNED_IN' &&
          (pendingAfterAuthRef.current ||
            ['welcome', 'login', 'signup', 'legal-consent'].includes(currentScreenRef.current));

        if (!shouldApplySignedInNavigation) {
          return;
        }

        void applySignedInNavigation(session.user);
      } else {
        if (pendingAfterAuthRef.current) {
          return;
        }

        const sharedEventId = getSharedEventIdFromPath(window.location.pathname);

        if (sharedEventId && handledSharedEventRef.current) {
          return;
        }

        clearAuthRedirectState();
        telegramMiniAppAuthAttemptedRef.current = false;
        skipNextSignedInNavigationRef.current = false;
        setTelegramMiniAppAuthFailed(false);
        resetNavigation('welcome', null, 'back');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (
    screen: string,
    data?: any,
    customDirection?: NavigationDirection
  ) => {
    if (currentScreen === 'login' && loginContext && screen === loginContext.backScreen && screen !== 'signup') {
      clearAuthRedirectState();
    }

    if (screen === 'login' && isClearPostLoginIntentPayload(data)) {
      clearAuthRedirectState();
    }

    if (screen === 'login' && isLoginNavigationPayload(data)) {
      const pending: PostLoginIntent = {
        returnTo: data.returnToAfterAuth,
        action: data.actionAfterAuth ?? null,
      };

      updateAuthRedirectState(pending, {
        backScreen: data.backScreen || 'welcome',
        backData: data.backData,
      });
    }

    if (screen === 'welcome' && pendingAfterAuth) {
      clearAuthRedirectState();
    }

    const nextData =
      data && !isLoginNavigationPayload(data) && !isClearPostLoginIntentPayload(data)
        ? data
        : undefined;

    const mainScreens = ['home', 'notifications', 'profile'];
    const detailScreens = [
      'edit-profile',
      'notification-settings',
      'security',
      'support',
      'admin',
      'language',
      'appearance',
      'terms',
      'privacy',
      'legal-consent',
      'event-details',
      'participants',
      'event-join-requests',
      'reset-password',
      'invite-users',
    ];
    const modalScreens = ['create-event'];

    let navDirection: NavigationDirection = customDirection || 'forward';
    const stack = navigationStackRef.current;
    const targetIndex = stack.map((entry) => entry.screen).lastIndexOf(screen);

    if (!customDirection) {
      if (targetIndex !== -1 && targetIndex < stack.length - 1) {
        navDirection = 'back';
      } else if (modalScreens.includes(screen)) {
        navDirection = 'up';
      } else if (modalScreens.includes(currentScreen) && mainScreens.includes(screen)) {
        navDirection = 'down';
      } else if (detailScreens.includes(currentScreen) && mainScreens.includes(screen)) {
        navDirection = 'back';
      } else if (mainScreens.includes(currentScreen) && mainScreens.includes(screen)) {
        navDirection = 'fade';
      } else if (mainScreens.includes(currentScreen) && detailScreens.includes(screen)) {
        navDirection = 'forward';
      }
    }

    if (navDirection === 'back') {
      goBackToScreen(screen, nextData);
      return;
    }

    if (mainScreens.includes(screen)) {
      resetNavigation(screen, nextData, navDirection);
      return;
    }

    if (screen === currentScreen) {
      replaceNavigation(
        [...stack.slice(0, -1), { screen, data: nextData ?? selectedEvent }],
        navDirection,
        'replace'
      );
      return;
    }

    replaceNavigation([...stack, { screen, data: nextData }], navDirection, 'push');
  };

  const showBottomNav = ['home', 'notifications', 'profile'].includes(currentScreen);
  const screenErrorFallback = (
    <div
      className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        className="w-full rounded-xl border p-5"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h2 className="text-lg" style={{ color: 'var(--foreground-strong)' }}>
          {translate('appError.title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate('appError.description')}
        </p>
        <button
          type="button"
          onClick={() => resetNavigation('home', null, 'back')}
          className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
          }}
        >
          {translate('appError.backHome')}
        </button>
      </div>
    </div>
  );

  if (!authChecked) {
    return (
      <AppLoadingFrame
        isMobileViewport={isMobileViewport}
        loadingLabel={translate('common.loading')}
      />
    );
  }

  return (
    <AppFrame isMobileViewport={isMobileViewport}>
      <FeedbackHost />

      <div className="flex-1 overflow-hidden relative">
        <AppErrorBoundary fallback={screenErrorFallback} resetKey={currentScreen}>
          <AnimatePresence mode="wait" initial={false}>
            <ScreenTransition key={currentScreen} direction={direction}>
              <AppScreenRenderer
                currentScreen={currentScreen}
                selectedEvent={selectedEvent}
                loginContext={loginContext}
                onNavigate={handleNavigate}
                onGoogleLogin={handleGoogleLogin}
                onTelegramLogin={handleTelegramLogin}
                onAuthenticated={applySignedInNavigation}
                onLegalConsentAccepted={handleLegalConsentAccepted}
                onLegalConsentLogout={handleLegalConsentLogout}
              />
            </ScreenTransition>
          </AnimatePresence>
        </AppErrorBoundary>
      </div>

      <AnimatePresence>
        {showBottomNav && (
          <BottomNav activeScreen={currentScreen} onNavigate={handleNavigate} />
        )}
      </AnimatePresence>
    </AppFrame>
  );
}


