import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { User } from '@supabase/supabase-js';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { HomeScreen } from './components/HomeScreen';
import { CreateEventScreen } from './components/CreateEventScreen';
import { EditEventScreen } from './components/EditEventScreen';
import { EventDetailsScreen } from './components/EventDetailsScreen';
import { ParticipantsScreen } from './components/ParticipantsScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { NotificationSettingsScreen } from './components/NotificationSettingsScreen';
import { SecurityScreen } from './components/SecurityScreen';
import { SupportScreen } from './components/SupportScreen';
import { AdminScreen } from './components/AdminScreen';
import { BottomNav } from './components/BottomNav';
import { ScreenTransition } from './components/ScreenTransition';
import { LoadingLogo } from './components/LoadingLogo';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { supabase } from '../lib/supabase';
import { LanguageScreen } from './components/LanguageScreen';
import { AppearanceScreen } from './components/AppearanceScreen';
import { TermsScreen } from './components/TermsScreen';
import { PrivacyScreen } from './components/PrivacyScreen';
import { LegalConsentScreen } from './components/LegalConsentScreen';
import { FeedbackHost } from './components/FeedbackHost';
import { useLanguage } from './context/LanguageContext';
import { InviteUsersScreen } from './components/InviteUsersScreen';
import { feedback } from './lib/feedback';
import { getSharedEventIdFromPath } from './auth/sharedEventPath';
import { loadSharedEventById } from './auth/loadSharedEvent';
import type { PostLoginIntent } from './auth/postLoginIntent';
import {
  isClearPostLoginIntentPayload,
  isLoginNavigationPayload,
} from './auth/postLoginIntent';
import { CURRENT_LEGAL_VERSION } from './constants/legalDocuments';

type NavigationDirection = 'forward' | 'back' | 'up' | 'down';

type LoginContext = {
  backScreen: string;
  backData?: any;
} | null;

const AUTH_REDIRECT_STATE_KEY = 'gathr-auth-redirect-state';

function readStoredAuthRedirectState(): {
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

function getAuthFlowType(href: string) {
  const match = href.match(/[?#&]type=([^&#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

type CurrentProfileAccess = {
  id: string;
  name: string | null;
  role?: string | null;
  plan?: string | null;
  has_unlimited_access?: boolean | null;
  is_banned?: boolean | null;
};

type CurrentLegalConsent = {
  accepted_terms_at?: string | null;
  accepted_privacy_at?: string | null;
  accepted_legal_version?: string | null;
};

export default function App() {
  const initialAuthRedirectState = readStoredAuthRedirectState();
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [direction, setDirection] = useState<NavigationDirection>('forward');
  const [history, setHistory] = useState<string[]>(['welcome']);
  const [authChecked, setAuthChecked] = useState(false);

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
  const currentScreenRef = useRef(currentScreen);

  const { translate } = useLanguage();
  const isMobileViewport = window.innerWidth < 768;

  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  const persistAuthRedirectState = (
    nextPendingAfterAuth: PostLoginIntent | null,
    nextLoginContext: LoginContext
  ) => {
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
    setSelectedEvent(null);
    setCurrentScreen('welcome');
    setHistory(['welcome']);
    setDirection('back');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Failed to sign out blocked user:', error);
    }

    feedback.error(translate('auth.accountBlocked'));
  };

  const getPreferredProfileName = (user: User) => {
    const metadata = user.user_metadata ?? {};
    const profileNameCandidates = [
      metadata.name,
      metadata.full_name,
      metadata.user_name,
      metadata.preferred_username,
      metadata.given_name,
      metadata.nickname,
    ];

    const metadataName = profileNameCandidates.find(
      (candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0
    );

    if (metadataName) {
      return metadataName.trim();
    }

    const emailName = user.email?.split('@')[0]?.trim();

    if (emailName) {
      return emailName;
    }

    return translate('common.user');
  };

  const syncProfileFromAuthUser = async (user: User) => {
    const fallbackName = getPreferredProfileName(user);
    const acceptedTermsAt =
      typeof user.user_metadata?.accepted_terms_at === 'string'
        ? user.user_metadata.accepted_terms_at
        : null;
    const acceptedPrivacyAt =
      typeof user.user_metadata?.accepted_privacy_at === 'string'
        ? user.user_metadata.accepted_privacy_at
        : null;
    const acceptedLegalVersion =
      typeof user.user_metadata?.accepted_legal_version === 'string'
        ? user.user_metadata.accepted_legal_version
        : null;

    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, accepted_terms_at, accepted_privacy_at, accepted_legal_version')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Failed to load profile after auth:', profileError);
        return;
      }

      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          name: fallbackName,
          accepted_terms_at: acceptedTermsAt,
          accepted_privacy_at: acceptedPrivacyAt,
          accepted_legal_version: acceptedLegalVersion,
        });

        if (
          insertError &&
          insertError.code !== '23505' &&
          !insertError.message.toLowerCase().includes('duplicate key')
        ) {
          console.error('Failed to create missing profile after auth:', insertError);
        }

        return;
      }

      if (!existingProfile.name?.trim() && fallbackName) {
        const updatePayload: Record<string, string | null> = {
          name: fallbackName,
        };

        if (!existingProfile.accepted_terms_at && acceptedTermsAt) {
          updatePayload.accepted_terms_at = acceptedTermsAt;
        }

        if (!existingProfile.accepted_privacy_at && acceptedPrivacyAt) {
          updatePayload.accepted_privacy_at = acceptedPrivacyAt;
        }

        if (!existingProfile.accepted_legal_version && acceptedLegalVersion) {
          updatePayload.accepted_legal_version = acceptedLegalVersion;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', user.id);

        if (updateError) {
          console.error('Failed to enrich profile name after auth:', updateError);
        }
        return;
      }

      if (
        (!existingProfile.accepted_terms_at && acceptedTermsAt) ||
        (!existingProfile.accepted_privacy_at && acceptedPrivacyAt) ||
        (!existingProfile.accepted_legal_version && acceptedLegalVersion)
      ) {
        const updatePayload: Record<string, string | null> = {};

        if (!existingProfile.accepted_terms_at && acceptedTermsAt) {
          updatePayload.accepted_terms_at = acceptedTermsAt;
        }

        if (!existingProfile.accepted_privacy_at && acceptedPrivacyAt) {
          updatePayload.accepted_privacy_at = acceptedPrivacyAt;
        }

        if (!existingProfile.accepted_legal_version && acceptedLegalVersion) {
          updatePayload.accepted_legal_version = acceptedLegalVersion;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', user.id);

        if (updateError) {
          console.error('Failed to enrich legal consent after auth:', updateError);
        }
      }
    } catch (error) {
      console.error('Unexpected profile sync error:', error);
    }
  };

  const getCurrentProfileAccess = async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_profile_access').maybeSingle();

      if (error) {
        console.error('Failed to load current profile access:', error);
        return null;
      }

      return (data as CurrentProfileAccess | null) ?? null;
    } catch (error) {
      console.error('Unexpected current profile access error:', error);
      return null;
    }
  };

  const getCurrentLegalConsent = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('accepted_terms_at, accepted_privacy_at, accepted_legal_version')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Failed to load current legal consent:', error);
        return null;
      }

      return (data as CurrentLegalConsent | null) ?? null;
    } catch (error) {
      console.error('Unexpected current legal consent error:', error);
      return null;
    }
  };

  const hasAcceptedCurrentLegal = (consent: CurrentLegalConsent | null) => {
    if (!consent) {
      return false;
    }

    return Boolean(
      consent.accepted_terms_at &&
        consent.accepted_privacy_at &&
        consent.accepted_legal_version === CURRENT_LEGAL_VERSION
    );
  };

  const applySignedInNavigation = async (user: User) => {
    await syncProfileFromAuthUser(user);

    const profileAccess = await getCurrentProfileAccess();

    if (profileAccess?.is_banned) {
      await redirectBlockedAccountToWelcome();
      return;
    }

    const legalConsent = await getCurrentLegalConsent(user.id);

    if (!hasAcceptedCurrentLegal(legalConsent)) {
      setDirection('forward');
      setCurrentScreen('legal-consent');
      setHistory(['legal-consent']);
      return;
    }

    if (pendingAfterAuthRef.current) {
      const pending = pendingAfterAuthRef.current;

      setDirection('forward');
      setCurrentScreen(pending.returnTo.screen);
      setHistory([pending.returnTo.screen]);

      if (pending.returnTo.data) {
        setSelectedEvent({
          ...pending.returnTo.data,
          authAction: pending.action || null,
        });
      }

      clearAuthRedirectState();
      return;
    }

    const sharedEventId = getSharedEventIdFromPath(window.location.pathname);

    if (sharedEventId && handledSharedEventRef.current) {
      return;
    }

    setCurrentScreen('home');
    setHistory(['home']);
    setDirection('forward');
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

  const handleLegalConsentAccepted = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Failed to get user after legal consent:', error);
        setCurrentScreen('welcome');
        setHistory(['welcome']);
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
    setSelectedEvent(null);
    setDirection('back');
    setCurrentScreen('welcome');
    setHistory(['welcome']);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Failed to sign out from legal consent screen:', error);
      feedback.error(translate('profile.logoutFailed'));
    }
  };

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
      setSelectedEvent({
        ...sharedEvent,
        backTarget: 'home',
      });
      setCurrentScreen('event-details');
      setHistory(['event-details']);
      setDirection('forward');

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
            console.error('Ошибка установки recovery session:', sessionError);
            setCurrentScreen('welcome');
            setHistory(['welcome']);
            setAuthChecked(true);
            return;
          }

          isRecoveryModeRef.current = true;
          setCurrentScreen('reset-password');
          setHistory(['reset-password']);
          setAuthChecked(true);
          return;
        }

        const openedSharedEvent = await openSharedEventIfNeeded();

        if (openedSharedEvent) {
          setAuthChecked(true);
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Ошибка получения сессии:', error);
          setCurrentScreen('welcome');
          setHistory(['welcome']);
        } else if (session?.user) {
          await applySignedInNavigation(session.user);
        } else {
          setCurrentScreen('welcome');
          setHistory(['welcome']);
        }
      } catch (error) {
        console.error('Unexpected session check error:', error);
        setCurrentScreen('welcome');
        setHistory(['welcome']);
      } finally {
        setAuthChecked(true);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        isRecoveryModeRef.current = true;
        setCurrentScreen('reset-password');
        setHistory(['reset-password']);
        setDirection('forward');
        return;
      }

      if (
        event === 'SIGNED_IN' &&
        getAuthFlowType(window.location.href) === 'recovery' &&
        window.location.href.includes('access_token=')
      ) {
        isRecoveryModeRef.current = true;
        setCurrentScreen('reset-password');
        setHistory(['reset-password']);
        setDirection('forward');
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
        setCurrentScreen('welcome');
        setHistory(['welcome']);
        setDirection('back');
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

    if (data && !isLoginNavigationPayload(data) && !isClearPostLoginIntentPayload(data)) {
      setSelectedEvent(data);
    }

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
      'reset-password',
      'invite-users',
    ];
    const modalScreens = ['create-event'];

    let navDirection: NavigationDirection = customDirection || 'forward';

    if (!customDirection) {
      if (history.includes(screen) && history.indexOf(screen) < history.length - 1) {
        navDirection = 'back';
      } else if (modalScreens.includes(screen)) {
        navDirection = 'up';
      } else if (detailScreens.includes(currentScreen) && mainScreens.includes(screen)) {
        navDirection = 'back';
      } else if (mainScreens.includes(currentScreen) && mainScreens.includes(screen)) {
        navDirection = 'forward';
      } else if (mainScreens.includes(currentScreen) && detailScreens.includes(screen)) {
        navDirection = 'forward';
      }
    }

    setDirection(navDirection);
    setCurrentScreen(screen);

    if (navDirection === 'back') {
      setHistory((prev) => {
        const lastIndex = prev.lastIndexOf(screen);

        if (lastIndex === -1) {
          return prev;
        }

        return prev.slice(0, lastIndex + 1);
      });
    } else {
      setHistory((prev) => [...prev, screen]);
    }
  };

  const showBottomNav = ['home', 'notifications', 'profile'].includes(currentScreen);

  if (!authChecked) {
    return (
      <div
        className="w-full flex items-start justify-start md:items-center md:justify-center bg-secondary overflow-hidden"
        style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)' }}
      >
        <div
          className="relative overflow-hidden flex flex-col items-center justify-center w-full h-full md:min-h-0 md:w-auto"
          style={{
            width: '100%',
            height: 'var(--app-height, 100dvh)',
            maxWidth: isMobileViewport ? '100%' : '390px',
            maxHeight: isMobileViewport ? 'none' : '844px',
            backgroundColor: 'var(--background)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            borderRadius: isMobileViewport ? '0' : '2.5rem',
          }}
        >
          <LoadingLogo label={translate('common.loading')} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full flex items-start justify-start md:items-center md:justify-center bg-secondary overflow-hidden"
      style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)' }}
    >
      <div
        className="relative overflow-hidden flex flex-col w-full h-full md:min-h-0 md:w-auto"
        style={{
          width: '100%',
          height: 'var(--app-height, 100dvh)',
          maxWidth: isMobileViewport ? '100%' : '390px',
          maxHeight: isMobileViewport ? 'none' : '844px',
          backgroundColor: 'var(--background)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          borderRadius: isMobileViewport ? '0' : '2.5rem',
        }}
      >
        <FeedbackHost />

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <ScreenTransition key={currentScreen} direction={direction}>
              {currentScreen === 'welcome' && (
                <WelcomeScreen onNavigate={handleNavigate} onGoogleLogin={handleGoogleLogin} />
              )}
              {currentScreen === 'login' && (
                <LoginScreen
                  onNavigate={handleNavigate}
                  onGoogleLogin={handleGoogleLogin}
                  onAuthenticated={applySignedInNavigation}
                  backTarget={loginContext?.backScreen || 'welcome'}
                  backData={loginContext?.backData}
                />
              )}
              {currentScreen === 'signup' && <SignUpScreen onNavigate={handleNavigate} />}
              {currentScreen === 'terms' && (
                <TermsScreen
                  onNavigate={handleNavigate}
                  backTarget={selectedEvent?.backTarget || 'signup'}
                />
              )}
              {currentScreen === 'privacy' && (
                <PrivacyScreen
                  onNavigate={handleNavigate}
                  backTarget={selectedEvent?.backTarget || 'signup'}
                />
              )}
              {currentScreen === 'legal-consent' && (
                <LegalConsentScreen
                  onNavigate={handleNavigate}
                  onAccepted={handleLegalConsentAccepted}
                  onLogout={handleLegalConsentLogout}
                />
              )}
              {currentScreen === 'reset-password' && (
                <ResetPasswordScreen onNavigate={handleNavigate} />
              )}
              {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
              {currentScreen === 'create-event' && <CreateEventScreen onNavigate={handleNavigate} />}
              {currentScreen === 'edit-event' && (
                <EditEventScreen onNavigate={handleNavigate} event={selectedEvent} />
              )}
              {currentScreen === 'event-details' && (
                <EventDetailsScreen onNavigate={handleNavigate} event={selectedEvent} />
              )}
              {currentScreen === 'participants' && (
                <ParticipantsScreen onNavigate={handleNavigate} event={selectedEvent} />
              )}
              {currentScreen === 'invite-users' && (
                <InviteUsersScreen onNavigate={handleNavigate} event={selectedEvent} />
              )}
              {currentScreen === 'notifications' && (
                <NotificationsScreen onNavigate={handleNavigate} />
              )}
              {currentScreen === 'profile' && <ProfileScreen onNavigate={handleNavigate} />}
              {currentScreen === 'edit-profile' && (
                <EditProfileScreen onNavigate={handleNavigate} />
              )}
              {currentScreen === 'notification-settings' && (
                <NotificationSettingsScreen onNavigate={handleNavigate} />
              )}
              {currentScreen === 'security' && <SecurityScreen onNavigate={handleNavigate} />}
              {currentScreen === 'support' && <SupportScreen onNavigate={handleNavigate} />}
              {currentScreen === 'admin' && (
                <AdminScreen
                  onNavigate={handleNavigate}
                  initialPage={
                    selectedEvent?.adminPage === 'support' ||
                    selectedEvent?.adminPage === 'events' ||
                    selectedEvent?.adminPage === 'users' ||
                    selectedEvent?.adminPage === 'overview'
                      ? selectedEvent.adminPage
                      : undefined
                  }
                  initialSupportStatus={
                    selectedEvent?.supportStatus === 'new' ||
                    selectedEvent?.supportStatus === 'in_progress' ||
                    selectedEvent?.supportStatus === 'resolved' ||
                    selectedEvent?.supportStatus === 'all'
                      ? selectedEvent.supportStatus
                      : undefined
                  }
                />
              )}
              {currentScreen === 'language' && (
                <LanguageScreen onNavigate={handleNavigate} />
              )}
              {currentScreen === 'appearance' && (
                <AppearanceScreen onNavigate={handleNavigate} />
              )}
            </ScreenTransition>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showBottomNav && (
            <BottomNav activeScreen={currentScreen} onNavigate={handleNavigate} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
