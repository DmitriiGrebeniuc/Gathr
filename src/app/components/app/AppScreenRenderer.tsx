import type { User } from '@supabase/supabase-js';
import { AdminScreen } from '../AdminScreen';
import { AppearanceScreen } from '../AppearanceScreen';
import { CreateEventScreen } from '../CreateEventScreen';
import { EditEventScreen } from '../EditEventScreen';
import { EditProfileScreen } from '../EditProfileScreen';
import { EventDetailsScreen } from '../EventDetailsScreen';
import { EventJoinRequestsScreen } from '../EventJoinRequestsScreen';
import { HomeScreenNew } from '../HomeScreenNew';
import { InviteUsersScreen } from '../InviteUsersScreen';
import { LanguageScreen } from '../LanguageScreen';
import { LegalConsentScreen } from '../LegalConsentScreen';
import { LoginScreen } from '../LoginScreen';
import { NotificationSettingsScreen } from '../NotificationSettingsScreen';
import { NotificationsScreen } from '../NotificationsScreen';
import { ParticipantsScreen } from '../ParticipantsScreen';
import { PrivacyScreen } from '../PrivacyScreen';
import { ProfileScreen } from '../ProfileScreen';
import { ResetPasswordScreen } from '../ResetPasswordScreen';
import { SecurityScreen } from '../SecurityScreen';
import { SupportScreen } from '../SupportScreen';
import { TermsScreen } from '../TermsScreen';
import { WelcomeScreen } from '../WelcomeScreen';
import type { LoginContext, NavigationDirection } from '../../types/navigation';

type AppNavigate = (
  screen: string,
  data?: any,
  customDirection?: NavigationDirection
) => void;

type AppScreenRendererProps = {
  currentScreen: string;
  selectedEvent: any;
  loginContext: LoginContext;
  onNavigate: AppNavigate;
  onGoogleLogin: () => Promise<void>;
  onTelegramLogin: () => Promise<void>;
  onAuthenticated: (user: User) => Promise<void>;
  onLegalConsentAccepted: () => Promise<void>;
  onLegalConsentLogout: () => Promise<void>;
};

export function AppScreenRenderer({
  currentScreen,
  selectedEvent,
  loginContext,
  onNavigate,
  onGoogleLogin,
  onTelegramLogin,
  onAuthenticated,
  onLegalConsentAccepted,
  onLegalConsentLogout,
}: AppScreenRendererProps) {
  return (
    <>
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onNavigate={onNavigate}
          onGoogleLogin={onGoogleLogin}
          onTelegramLogin={onTelegramLogin}
        />
      )}
      {currentScreen === 'login' && (
        <LoginScreen
          onNavigate={onNavigate}
          onAuthenticated={onAuthenticated}
          backTarget={loginContext?.backScreen || 'welcome'}
          backData={loginContext?.backData}
          initialMode={selectedEvent?.mode === 'signup' ? 'signup' : 'login'}
        />
      )}
      {currentScreen === 'signup' && (
        <LoginScreen
          onNavigate={onNavigate}
          onAuthenticated={onAuthenticated}
          backTarget="welcome"
          initialMode="signup"
        />
      )}
      {currentScreen === 'terms' && (
        <TermsScreen
          onNavigate={onNavigate}
          backTarget={selectedEvent?.backTarget || 'signup'}
        />
      )}
      {currentScreen === 'privacy' && (
        <PrivacyScreen
          onNavigate={onNavigate}
          backTarget={selectedEvent?.backTarget || 'signup'}
        />
      )}
      {currentScreen === 'legal-consent' && (
        <LegalConsentScreen
          onNavigate={onNavigate}
          onAccepted={onLegalConsentAccepted}
          onLogout={onLegalConsentLogout}
        />
      )}
      {currentScreen === 'reset-password' && (
        <ResetPasswordScreen onNavigate={onNavigate} />
      )}
      {currentScreen === 'home' && <HomeScreenNew onNavigate={onNavigate} />}
      {currentScreen === 'create-event' && <CreateEventScreen onNavigate={onNavigate} />}
      {currentScreen === 'edit-event' && (
        <EditEventScreen onNavigate={onNavigate} event={selectedEvent} />
      )}
      {currentScreen === 'event-details' && (
        <EventDetailsScreen onNavigate={onNavigate} event={selectedEvent} />
      )}
      {currentScreen === 'participants' && (
        <ParticipantsScreen onNavigate={onNavigate} event={selectedEvent} />
      )}
      {currentScreen === 'event-join-requests' && (
        <EventJoinRequestsScreen onNavigate={onNavigate} event={selectedEvent} />
      )}
      {currentScreen === 'invite-users' && (
        <InviteUsersScreen onNavigate={onNavigate} event={selectedEvent} />
      )}
      {currentScreen === 'notifications' && (
        <NotificationsScreen onNavigate={onNavigate} />
      )}
      {currentScreen === 'profile' && <ProfileScreen onNavigate={onNavigate} />}
      {currentScreen === 'edit-profile' && (
        <EditProfileScreen onNavigate={onNavigate} />
      )}
      {currentScreen === 'notification-settings' && (
        <NotificationSettingsScreen onNavigate={onNavigate} />
      )}
      {currentScreen === 'security' && <SecurityScreen onNavigate={onNavigate} />}
      {currentScreen === 'support' && <SupportScreen onNavigate={onNavigate} />}
      {currentScreen === 'admin' && (
        <AdminScreen
          onNavigate={onNavigate}
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
        <LanguageScreen onNavigate={onNavigate} />
      )}
      {currentScreen === 'appearance' && (
        <AppearanceScreen onNavigate={onNavigate} />
      )}
    </>
  );
}
