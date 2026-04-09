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
import { BottomNav } from './components/BottomNav';
import { ScreenTransition } from './components/ScreenTransition';
import { LoadingLogo } from './components/LoadingLogo';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { supabase } from '../lib/supabase';
import { LanguageScreen } from './components/LanguageScreen';
import { useLanguage } from './context/LanguageContext';
import { InviteUsersScreen } from './components/InviteUsersScreen';

type NavigationDirection = 'forward' | 'back' | 'up' | 'down';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [direction, setDirection] = useState<NavigationDirection>('forward');
  const [history, setHistory] = useState<string[]>(['welcome']);
  const [authChecked, setAuthChecked] = useState(false);
  const isRecoveryModeRef = useRef(false);

  const { translate } = useLanguage();

  useEffect(() => {
    const href = window.location.href;

    const accessTokenMatch = href.match(/[?#&]access_token=([^&#]+)/);
    const refreshTokenMatch = href.match(/[?#&]refresh_token=([^&#]+)/);
    const typeMatch = href.match(/[?#&]type=([^&#]+)/);

    const accessToken = accessTokenMatch ? decodeURIComponent(accessTokenMatch[1]) : null;
    const refreshToken = refreshTokenMatch ? decodeURIComponent(refreshTokenMatch[1]) : null;
    const type = typeMatch ? decodeURIComponent(typeMatch[1]) : null;

    const isRecovery = !!accessToken;

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
        setCurrentScreen('home');
        setHistory(['home']);
        setDirection('forward');
      } else {
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
    if (data) {
      setSelectedEvent(data);
    }

    const mainScreens = ['home', 'notifications', 'profile'];
    const detailScreens = [
      'edit-profile',
      'notification-settings',
      'security',
      'support',
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

  if (!authChecked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
        <div
          className="relative overflow-hidden flex flex-col items-center justify-center w-full min-h-screen md:min-h-0 md:w-auto"
          style={{
            width: '100%',
            height: '100dvh',
            maxWidth: '390px',
            maxHeight: '844px',
            backgroundColor: '#0F0F0F',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            borderRadius: window.innerWidth < 768 ? '0' : '2.5rem',
          }}
        >
          <LoadingLogo label={translate('common.loading')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
      <div
        className="relative overflow-hidden flex flex-col w-full min-h-screen md:min-h-0 md:w-auto"
        style={{
          width: '100%',
          height: '100dvh',
          maxWidth: '390px',
          maxHeight: '844px',
          backgroundColor: '#0F0F0F',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          borderRadius: window.innerWidth < 768 ? '0' : '2.5rem',
        }}
      >
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <ScreenTransition key={currentScreen} direction={direction}>
              {currentScreen === 'welcome' && <WelcomeScreen onNavigate={handleNavigate} />}
              {currentScreen === 'login' && <LoginScreen onNavigate={handleNavigate} />}
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