import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
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
import { FeedbackHost } from './components/FeedbackHost';
import { useLanguage } from './context/LanguageContext';
import { InviteUsersScreen } from './components/InviteUsersScreen';
import { getSharedEventIdFromPath } from './auth/sharedEventPath';
import { loadSharedEventById } from './auth/loadSharedEvent';
import type { PostLoginIntent } from './auth/postLoginIntent';
import {
  isClearPostLoginIntentPayload,
  isLoginNavigationPayload,
} from './auth/postLoginIntent';

type NavigationDirection = 'forward' | 'back' | 'up' | 'down';

type LoginContext = {
  backScreen: string;
  backData?: any;
} | null;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [direction, setDirection] = useState<NavigationDirection>('forward');
  const [history, setHistory] = useState<string[]>(['welcome']);
  const [authChecked, setAuthChecked] = useState(false);

  const [pendingAfterAuth, setPendingAfterAuth] = useState<PostLoginIntent | null>(null);
  const [loginContext, setLoginContext] = useState<LoginContext>(null);

  const pendingAfterAuthRef = useRef<PostLoginIntent | null>(null);
  const isRecoveryModeRef = useRef(false);
  const handledSharedEventRef = useRef(false);

  const { translate } = useLanguage();

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

    const accessToken = accessTokenMatch ? decodeURIComponent(accessTokenMatch[1]) : null;
    const refreshToken = refreshTokenMatch ? decodeURIComponent(refreshTokenMatch[1]) : null;

    const isRecovery = !!accessToken;

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
          setCurrentScreen('home');
          setHistory(['home']);
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

      if (event === 'SIGNED_IN' && window.location.href.includes('access_token=')) {
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

          pendingAfterAuthRef.current = null;
          setPendingAfterAuth(null);
          setLoginContext(null);
          return;
        }

        const sharedEventId = getSharedEventIdFromPath(window.location.pathname);

        if (sharedEventId && handledSharedEventRef.current) {
          return;
        }

        setCurrentScreen('home');
        setHistory(['home']);
        setDirection('forward');
      } else {
        if (pendingAfterAuthRef.current) {
          return;
        }

        const sharedEventId = getSharedEventIdFromPath(window.location.pathname);

        if (sharedEventId && handledSharedEventRef.current) {
          return;
        }

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
      pendingAfterAuthRef.current = null;
      setPendingAfterAuth(null);
      setLoginContext(null);
    }

    if (screen === 'login' && isClearPostLoginIntentPayload(data)) {
      pendingAfterAuthRef.current = null;
      setPendingAfterAuth(null);
      setLoginContext(null);
    }

    if (screen === 'login' && isLoginNavigationPayload(data)) {
      const pending: PostLoginIntent = {
        returnTo: data.returnToAfterAuth,
        action: data.actionAfterAuth ?? null,
      };

      pendingAfterAuthRef.current = pending;
      setPendingAfterAuth(pending);

      setLoginContext({
        backScreen: data.backScreen || 'welcome',
        backData: data.backData,
      });
    }

    if (screen === 'welcome' && pendingAfterAuth) {
      pendingAfterAuthRef.current = null;
      setPendingAfterAuth(null);
      setLoginContext(null);
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
  const isMobileViewport = window.innerWidth < 768;

  if (!authChecked) {
    return (
      <div
        className="w-full flex items-center justify-center bg-secondary overflow-hidden"
        style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)' }}
      >
        <div
          className="relative overflow-hidden flex flex-col items-center justify-center w-full min-h-screen md:min-h-0 md:w-auto"
          style={{
            width: '100%',
            height: 'var(--app-height, 100dvh)',
            maxWidth: isMobileViewport ? '100%' : '390px',
            maxHeight: isMobileViewport ? 'none' : '844px',
            backgroundColor: '#0F0F0F',
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
      className="w-full flex items-center justify-center bg-secondary overflow-hidden"
      style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)' }}
    >
      <div
        className="relative overflow-hidden flex flex-col w-full min-h-screen md:min-h-0 md:w-auto"
        style={{
          width: '100%',
          height: 'var(--app-height, 100dvh)',
          maxWidth: isMobileViewport ? '100%' : '390px',
          maxHeight: isMobileViewport ? 'none' : '844px',
          backgroundColor: '#0F0F0F',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          borderRadius: isMobileViewport ? '0' : '2.5rem',
        }}
      >
        <FeedbackHost />

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <ScreenTransition key={currentScreen} direction={direction}>
              {currentScreen === 'welcome' && <WelcomeScreen onNavigate={handleNavigate} />}
              {currentScreen === 'login' && (
                <LoginScreen
                  onNavigate={handleNavigate}
                  backTarget={loginContext?.backScreen || 'welcome'}
                  backData={loginContext?.backData}
                />
              )}
              {currentScreen === 'signup' && <SignUpScreen onNavigate={handleNavigate} />}
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
              {currentScreen === 'admin' && <AdminScreen onNavigate={handleNavigate} />}
              {currentScreen === 'language' && (
                <LanguageScreen onNavigate={handleNavigate} />
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
