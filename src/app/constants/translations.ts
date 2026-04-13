import type { LanguageCode } from './languages';

type TranslationKey =
    | 'common.user'
    | 'common.unknown'
    | 'common.guestUser'
    | 'common.event'
    | 'common.dateNotSpecified'
    | 'common.invalidDate'
    | 'common.timeNotSpecified'
    | 'common.invalidTime'
    | 'common.justNow'
    | 'common.back'
    | 'common.loading'
    | 'common.loadingSettings'
    | 'common.loadingNotifications'
    | 'common.save'
    | 'common.saving'
    | 'common.cancel'
    | 'common.name'
    | 'common.email'
    | 'common.password'
    | 'bottomNav.home'
    | 'bottomNav.notifications'
    | 'bottomNav.profile'
    | 'activity.sports'
    | 'activity.networking'
    | 'activity.study'
    | 'activity.entertainment'
    | 'activity.foodDrinks'
    | 'activity.outdoors'
    | 'activity.tech'
    | 'activity.other'
    | 'welcome.tagline'
    | 'welcome.languageChoiceTitle'
    | 'welcome.languageChoiceDescription'
    | 'welcome.google'
    | 'welcome.login'
    | 'welcome.signup'
    | 'login.back'
    | 'login.title'
    | 'login.google'
    | 'login.emailDivider'
    | 'login.email'
    | 'login.emailPlaceholder'
    | 'login.password'
    | 'login.passwordPlaceholder'
    | 'login.submit'
    | 'login.submitting'
    | 'login.noAccount'
    | 'login.signupLink'
    | 'login.enterEmail'
    | 'login.enterPassword'
    | 'login.failed'
    | 'login.googleFailed'
    | 'login.unexpectedError'
    | 'signup.back'
    | 'signup.title'
    | 'signup.name'
    | 'signup.namePlaceholder'
    | 'signup.email'
    | 'signup.emailPlaceholder'
    | 'signup.password'
    | 'signup.passwordPlaceholder'
    | 'signup.submit'
    | 'signup.submitting'
    | 'signup.haveAccount'
    | 'signup.loginLink'
    | 'signup.enterName'
    | 'signup.enterEmail'
    | 'signup.enterPassword'
    | 'signup.failed'
    | 'signup.userIdMissing'
    | 'signup.profileNotSaved'
    | 'signup.success'
    | 'signup.unexpectedError'
    | 'editProfile.title'
    | 'editProfile.name'
    | 'editProfile.email'
    | 'editProfile.saveButton'
    | 'editProfile.loading'
    | 'editProfile.saving'
    | 'editProfile.userNotFound'
    | 'editProfile.enterName'
    | 'editProfile.saveFailed'
    | 'editProfile.unexpectedError'
    | 'notificationSettings.title'
    | 'notificationSettings.sectionTitle'
    | 'notificationSettings.upcomingEvents'
    | 'notificationSettings.upcomingEventsDescription'
    | 'notificationSettings.newParticipants'
    | 'notificationSettings.newParticipantsDescription'
    | 'notificationSettings.eventInvitations'
    | 'notificationSettings.eventInvitationsDescription'
    | 'security.title'
    | 'security.cardTitle'
    | 'security.cardDescription'
    | 'security.changePasswordTitle'
    | 'security.changePasswordDescription'
    | 'security.newPassword'
    | 'security.newPasswordPlaceholder'
    | 'security.confirmPassword'
    | 'security.confirmPasswordPlaceholder'
    | 'security.savePassword'
    | 'security.savingPassword'
    | 'security.enterPassword'
    | 'security.enterConfirmPassword'
    | 'security.passwordTooShort'
    | 'security.passwordsDoNotMatch'
    | 'security.passwordChanged'
    | 'security.passwordChangeFailed'
    | 'security.passwordChangeUnexpectedError'
    | 'security.comingSoonTitle'
    | 'security.comingSoonDescription'
    | 'support.title'
    | 'support.cardTitle'
    | 'support.cardDescription'
    | 'support.formTitle'
    | 'support.formDescription'
    | 'support.subject'
    | 'support.subjectPlaceholder'
    | 'support.message'
    | 'support.messagePlaceholder'
    | 'support.sendButton'
    | 'support.sending'
    | 'support.enterSubject'
    | 'support.enterMessage'
    | 'support.sendFailed'
    | 'support.sendUnexpectedError'
    | 'support.sentSuccess'
    | 'notifications.title'
    | 'notifications.emptyTitle'
    | 'notifications.emptyDescription'
    | 'notifications.upcomingIconLabel'
    | 'notifications.joinIconLabel'
    | 'notifications.startedAlready'
    | 'notifications.inMinutes'
    | 'notifications.inHours'
    | 'notifications.upcomingDefault'
    | 'notifications.startsInMinutes'
    | 'notifications.startsInHours'
    | 'notifications.justNow'
    | 'notifications.minutesAgo'
    | 'notifications.hoursAgo'
    | 'notifications.daysAgo'
    | 'notifications.someone'
    | 'notifications.joinedYourEvent'
    | 'notifications.and'
    | 'notifications.others'
    | 'notifications.inviteIconLabel'
    | 'notifications.invitedYouToEvent'
    | 'notifications.acceptInvite'
    | 'notifications.acceptingInvite'
    | 'notifications.declineInvite'
    | 'notifications.decliningInvite'
    | 'notifications.inviteAccepted'
    | 'notifications.inviteDeclined'
    | 'notifications.inviteActionFailed'
    | 'notifications.inviteActionUnexpectedError'
    | 'profile.title'
    | 'profile.editProfile'
    | 'profile.notificationSettings'
    | 'profile.language'
    | 'profile.appearance'
    | 'profile.privacySecurity'
    | 'profile.helpSupport'
    | 'profile.adminMode'
    | 'profile.logout'
    | 'profile.loggingOut'
    | 'profile.loading'
    | 'profile.loadingEmail'
    | 'profile.noEmail'
    | 'profile.logoutFailed'
    | 'profile.logoutUnexpectedError'
    | 'language.title'
    | 'language.selectedLanguage'
    | 'language.back'
    | 'appearance.title'
    | 'appearance.description'
    | 'appearance.system'
    | 'appearance.dark'
    | 'appearance.light'
    | 'appearance.currentSystemDark'
    | 'appearance.currentSystemLight'
    | 'admin.title'
    | 'admin.enabledTitle'
    | 'admin.enabledDescription'
    | 'admin.comingSoonTitle'
    | 'admin.comingSoonDescription'
    | 'admin.totalUsers'
    | 'admin.totalEvents'
    | 'admin.futureEvents'
    | 'admin.participantsCount'
    | 'admin.pendingInvitations'
    | 'admin.supportRequests'
    | 'admin.latestEvents'
    | 'admin.eventsModerationTitle'
    | 'admin.eventsModerationDescription'
    | 'admin.futureFilter'
    | 'admin.pastFilter'
    | 'admin.creatorFilterPlaceholder'
    | 'admin.allActivityTypes'
    | 'admin.noModerationEvents'
    | 'admin.creatorLabel'
    | 'admin.participantsLabel'
    | 'admin.viewEventDetails'
    | 'admin.viewParticipants'
    | 'admin.deletingEvent'
    | 'admin.deleteEventConfirm'
    | 'admin.deleteEventFailed'
    | 'admin.deleteEventUnexpectedError'
    | 'admin.pageOverview'
    | 'admin.pageEvents'
    | 'admin.pageUsers'
    | 'admin.pageSupport'
    | 'admin.usersTitle'
    | 'admin.userSearchPlaceholder'
    | 'admin.noUsers'
    | 'admin.noUsersMatch'
    | 'admin.userProfileTitle'
    | 'admin.selectUser'
    | 'admin.userStatusLabel'
    | 'admin.saveChanges'
    | 'admin.savingUser'
    | 'admin.updateUserSuccess'
    | 'admin.updateUserFailed'
    | 'admin.updateUserUnexpectedError'
    | 'admin.banUser'
    | 'admin.unbanUser'
    | 'admin.banningUser'
    | 'admin.unbanningUser'
    | 'admin.banUserConfirmDescription'
    | 'admin.unbanUserConfirmDescription'
    | 'admin.banUserHint'
    | 'admin.cannotBanSelf'
    | 'admin.userBannedSuccess'
    | 'admin.userUnbannedSuccess'
    | 'admin.banUserFailed'
    | 'admin.unbanUserFailed'
    | 'admin.banUserUnexpectedError'
    | 'admin.unbanUserUnexpectedError'
    | 'admin.activeStatus'
    | 'admin.bannedStatus'
    | 'admin.deleteUser'
    | 'admin.deletingUser'
    | 'admin.deleteUserConfirm'
    | 'admin.deleteUserHint'
    | 'admin.deleteUserSelfBlocked'
    | 'admin.deleteUserHasEventsBlocked'
    | 'admin.deleteUserSuccess'
    | 'admin.deleteUserFailed'
    | 'admin.deleteUserUnexpectedError'
    | 'admin.roleLabel'
    | 'admin.roleUser'
    | 'admin.roleAdmin'
    | 'admin.planLabel'
    | 'admin.planFree'
    | 'admin.planPro'
    | 'admin.unlimitedAccessLabel'
    | 'admin.enabled'
    | 'admin.disabled'
    | 'admin.readOnly'
    | 'admin.unavailable'
    | 'admin.noEvents'
    | 'admin.notAvailable'
    | 'admin.supportPageTitle'
    | 'admin.noSupportRequests'
    | 'admin.supportRequestsUnavailable'
    | 'admin.supportRequestFrom'
    | 'admin.submittedAt'
    | 'admin.subjectLabel'
    | 'admin.messageLabel'
    | 'admin.supportStatusLabel'
    | 'admin.supportStatusNew'
    | 'admin.supportStatusInProgress'
    | 'admin.supportStatusResolved'
    | 'admin.startTicket'
    | 'admin.resolveTicket'
    | 'admin.reopenTicket'
    | 'admin.backToNew'
    | 'admin.supportStatusUpdated'
    | 'admin.supportStatusUpdateFailed'
    | 'admin.supportStatusUpdateUnexpectedError'
    | 'admin.supportResolvedEmailSent'
    | 'admin.supportResolvedEmailFailed'

    | 'admin.noPendingInvitations'
    | 'admin.latestPendingInvitations'
    | 'admin.invitedBy'

    | 'home.discover'
    | 'home.joined'
    | 'home.myEvents'
    | 'home.all'
    | 'home.allCities'
    | 'home.cityFilterLabel'
    | 'home.citySearchPlaceholder'
    | 'home.noCitiesFound'
    | 'home.loadMore'
    | 'home.loading'
    | 'home.createdBy'
    | 'home.you'
    | 'home.participant'
    | 'home.participants'
    | 'home.past'
    | 'home.noMyEvents'
    | 'home.noJoinedEvents'
    | 'home.noDiscoverEvents'
    | 'home.noEventsForFilter'
    | 'home.noEventsForCity'
    | 'home.createFirstEvent'
    | 'home.joinedWillAppear'
    | 'home.noEventsFromOthers'
    | 'home.launchOverlayTitle'
    | 'home.launchOverlayText'
    | 'home.launchOverlayButton'
    | 'create.title'
    | 'create.cancel'
    | 'create.eventTitle'
    | 'create.eventTitlePlaceholder'
    | 'create.activityType'
    | 'create.description'
    | 'create.descriptionPlaceholder'
    | 'create.date'
    | 'create.time'
    | 'create.location'
    | 'create.locationPlaceholder'
    | 'create.locationApiKeyMissing'
    | 'create.createButton'
    | 'create.creating'
    | 'create.createButton'
    | 'create.creating'
    | 'create.activeEventsLimitReached'
    | 'create.activeEventsLimitReachedPro'
    | 'edit.title'
    | 'edit.cancel'
    | 'edit.eventTitle'
    | 'edit.eventTitlePlaceholder'
    | 'edit.activityType'
    | 'edit.description'
    | 'edit.descriptionPlaceholder'
    | 'edit.date'
    | 'edit.time'
    | 'edit.location'
    | 'edit.locationPlaceholder'
    | 'edit.saveButton'
    | 'edit.saving'
    | 'details.back'
    | 'details.pastEvent'
    | 'details.noDescription'
    | 'details.dateTime'
    | 'details.location'
    | 'details.locationNotSpecified'
    | 'details.participants'
    | 'details.noParticipants'
    | 'details.you'
    | 'details.creator'
    | 'details.leaveEvent'
    | 'details.leaving'
    | 'details.joinEvent'
    | 'details.joining'
    | 'details.eventEnded'
    | 'details.editEvent'
    | 'details.deleteEvent'
    | 'details.deleting'
    | 'details.fallbackTitle'
    | 'details.fallbackDescription'
    | 'details.fallbackLocation'
    | 'details.shareInviteLine'
    | 'details.shareLabelEvent'
    | 'details.shareLabelDate'
    | 'details.shareLabelLocation'
    | 'details.shareOpenLink'
    | 'details.linkCopied'
    | 'details.copyLinkPrompt'
    | 'details.shareEvent'
    | 'details.sharing'
    | 'details.eventNotResolved'
    | 'details.joinFailed'
    | 'details.joinUnexpectedError'
    | 'details.loginRequired'
    | 'details.leaveFailed'
    | 'details.leaveUnexpectedError'
    | 'details.deleteOnlyCreator'
    | 'details.deleteConfirm'
    | 'details.deleteParticipantsFailed'
    | 'details.deleteFailed'
    | 'details.deleteUnexpectedError'
    | 'participants.back'
    | 'participants.title'
    | 'participants.loading'
    | 'participants.noParticipants'
    | 'participants.eventFallback'
    | 'participants.participant'
    | 'participants.participants'
    | 'participants.you'
    | 'participants.creator'
    | 'create.enterTitle'
    | 'create.selectDate'
    | 'create.selectTime'
    | 'create.userNotAuthenticated'
    | 'create.invalidDateTime'
    | 'create.failed'
    | 'create.creatorParticipantFailed'
    | 'create.unexpectedError'
    | 'edit.eventNotFound'
    | 'edit.enterTitle'
    | 'edit.selectDate'
    | 'edit.selectTime'
    | 'edit.invalidDateTime'
    | 'edit.userNotAuthenticated'
    | 'edit.failed'
    | 'edit.unexpectedError'
    | 'signup.confirmEmailTitle'
    | 'signup.confirmEmailMessage'
    | 'edit.locationApiKeyMissing'
    | 'login.forgotPassword'
    | 'login.sendingReset'
    | 'login.resetEmailSent'
    | 'login.resetFailed'
    | 'login.resetUnexpectedError'
    | 'auth.accountBlocked'
    | 'resetPassword.back'
    | 'resetPassword.title'
    | 'resetPassword.description'
    | 'resetPassword.newPassword'
    | 'resetPassword.newPasswordPlaceholder'
    | 'resetPassword.confirmPassword'
    | 'resetPassword.confirmPasswordPlaceholder'
    | 'resetPassword.submit'
    | 'resetPassword.submitting'
    | 'resetPassword.enterPassword'
    | 'resetPassword.enterConfirmPassword'
    | 'resetPassword.passwordTooShort'
    | 'resetPassword.passwordsDoNotMatch'
    | 'resetPassword.failed'
    | 'resetPassword.unexpectedError'
    | 'resetPassword.success'
    | 'resetPassword.restoreSessionFailed'
    | 'resetPassword.recoverySessionMissing'
    | 'inviteUsers.title'
    | 'inviteUsers.back'
    | 'inviteUsers.inviteButton'
    | 'inviteUsers.inviting'
    | 'inviteUsers.invite'
    | 'inviteUsers.loading'
    | 'inviteUsers.empty'
    | 'inviteUsers.sent'
    | 'inviteUsers.failed'
    | 'inviteUsers.unexpectedError'
    | 'inviteUsers.invitesPerEventLimitReached'
    | 'inviteUsers.invitesPerEventLimitReachedPro'
    | 'create.pastDateTime';

const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
    en: {
        'common.user': 'User',
        'common.unknown': 'Unknown',
        'common.guestUser': 'Guest User',
        'common.event': 'Event',
        'common.dateNotSpecified': 'Date not specified',
        'common.invalidDate': 'Invalid date',
        'common.timeNotSpecified': 'Time not specified',
        'common.invalidTime': 'Invalid time',
        'common.justNow': 'Just now',
        'common.back': 'Back',
        'common.loading': 'Loading...',
        'common.loadingSettings': 'Loading settings...',
        'common.loadingNotifications': 'Loading notifications...',
        'common.save': 'Save',
        'common.saving': 'Saving...',
        'common.cancel': 'Cancel',
        'common.name': 'Name',
        'common.email': 'Email',
        'common.password': 'Password',

        'bottomNav.home': 'Home',
        'bottomNav.notifications': 'Notifications',
        'bottomNav.profile': 'Profile',

        'activity.sports': 'Sports',
        'activity.networking': 'Networking',
        'activity.study': 'Study',
        'activity.entertainment': 'Entertainment',
        'activity.foodDrinks': 'Food & Drinks',
        'activity.outdoors': 'Outdoors',
        'activity.tech': 'Tech',
        'activity.other': 'Other',

        'welcome.tagline': 'Fast. Simple. Together.',
        'welcome.languageChoiceTitle': 'Choose your language',
        'welcome.languageChoiceDescription':
            'If this is your first time here, choose the language you want to use in Gathr.',
        'welcome.google': 'Continue with Google',
        'welcome.login': 'Continue with email',
        'welcome.signup': 'Create account with email',

        'login.back': 'Back',
        'login.title': 'Welcome back',
        'login.google': 'Continue with Google',
        'login.emailDivider': 'Or continue with email',
        'login.email': 'Email',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Password',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Log In',
        'login.submitting': 'Logging in...',
        'login.noAccount': "Don't have an account?",
        'login.signupLink': 'Sign up',
        'login.enterEmail': 'Enter email',
        'login.enterPassword': 'Enter password',
        'login.failed': 'Failed to log in',
        'login.googleFailed': 'Failed to continue with Google',
        'login.unexpectedError': 'An error occurred while logging in',

        'signup.back': 'Back',
        'signup.title': 'Create account',
        'signup.name': 'Name',
        'signup.namePlaceholder': 'Your name',
        'signup.email': 'Email',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Password',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Sign Up',
        'signup.submitting': 'Signing up...',
        'signup.haveAccount': 'Already have an account?',
        'signup.loginLink': 'Log in',
        'signup.enterName': 'Enter name',
        'signup.enterEmail': 'Enter email',
        'signup.enterPassword': 'Enter password',
        'signup.failed': 'Failed to sign up',
        'signup.userIdMissing': 'User was created, but the user ID could not be obtained',
        'signup.profileNotSaved': 'Account was created, but the profile was not saved',
        'signup.success': 'Registration successful',
        'signup.unexpectedError': 'An error occurred during registration',

        'editProfile.title': 'Edit Profile',
        'editProfile.name': 'Name',
        'editProfile.email': 'Email',
        'editProfile.saveButton': 'Save Changes',
        'editProfile.loading': 'Loading...',
        'editProfile.saving': 'Saving...',
        'editProfile.userNotFound': 'User not found',
        'editProfile.enterName': 'Enter name',
        'editProfile.saveFailed': 'Failed to save profile',
        'editProfile.unexpectedError': 'An error occurred while saving the profile',

        'notificationSettings.title': 'Notification Settings',
        'notificationSettings.sectionTitle': 'NOTIFICATIONS',
        'notificationSettings.upcomingEvents': 'Upcoming Events',
        'notificationSettings.upcomingEventsDescription': 'Get notified before events start',
        'notificationSettings.newParticipants': 'New Participants',
        'notificationSettings.newParticipantsDescription': 'When someone joins your event',
        'notificationSettings.eventInvitations': 'Event Invitations',
        'notificationSettings.eventInvitationsDescription': 'When someone invites you to an event',

        'security.title': 'Privacy & Security',
        'security.cardTitle': 'Security settings',
        'security.cardDescription': 'Advanced security features will be available soon.',
        'security.changePasswordTitle': 'Change password',
        'security.changePasswordDescription': 'Set a new password for your account.',
        'security.newPassword': 'New password',
        'security.newPasswordPlaceholder': '••••••••',
        'security.confirmPassword': 'Confirm password',
        'security.confirmPasswordPlaceholder': '••••••••',
        'security.savePassword': 'Save new password',
        'security.savingPassword': 'Saving...',
        'security.enterPassword': 'Enter a new password',
        'security.enterConfirmPassword': 'Confirm your new password',
        'security.passwordTooShort': 'Password must be at least 6 characters',
        'security.passwordsDoNotMatch': 'Passwords do not match',
        'security.passwordChanged': 'Password changed successfully',
        'security.passwordChangeFailed': 'Failed to change password',
        'security.passwordChangeUnexpectedError': 'An error occurred while changing the password',
        'security.comingSoonTitle': 'Account deletion',
        'security.comingSoonDescription': 'Account deletion will be available later.',

        'support.title': 'Help & Support',
        'support.cardTitle': 'Support center',
        'support.cardDescription': 'Help articles and support options will be available soon.',
        'support.formTitle': 'Contact support',
        'support.formDescription': 'Send us your question, issue, or feedback.',
        'support.subject': 'Subject',
        'support.subjectPlaceholder': 'Briefly describe the issue',
        'support.message': 'Message',
        'support.messagePlaceholder': 'Tell us what happened or what you need help with...',
        'support.sendButton': 'Send request',
        'support.sending': 'Sending...',
        'support.enterSubject': 'Enter a subject',
        'support.enterMessage': 'Enter your message',
        'support.sendFailed': 'Failed to send support request',
        'support.sendUnexpectedError': 'An error occurred while sending the support request',
        'support.sentSuccess': 'Your request has been sent',

        'notifications.title': 'Notifications',
        'notifications.emptyTitle': 'No notifications yet',
        'notifications.emptyDescription': 'Upcoming events and participant updates will appear here.',
        'notifications.upcomingIconLabel': 'Upcoming event',
        'notifications.joinIconLabel': 'New participant',
        'notifications.startedAlready': 'Started already',
        'notifications.inMinutes': 'In {count} min',
        'notifications.inHours': 'In {count} hour|In {count} hours',
        'notifications.upcomingDefault': '{title} is coming up',
        'notifications.startsInMinutes': '{title} starts in {count} min',
        'notifications.startsInHours': '{title} starts in {count} hour|{title} starts in {count} hours',
        'notifications.justNow': 'Just now',
        'notifications.minutesAgo': '{count} min ago',
        'notifications.hoursAgo': '{count} hour ago|{count} hours ago',
        'notifications.daysAgo': '{count} day ago|{count} days ago',
        'notifications.someone': 'Someone',
        'notifications.joinedYourEvent': '{names} joined your event {title}',
        'notifications.and': 'and',
        'notifications.others': 'others',
        'notifications.inviteIconLabel': 'Event invitation',
        'notifications.invitedYouToEvent': '{name} invited you to {title}',
        'notifications.acceptInvite': 'Accept',
        'notifications.acceptingInvite': 'Accepting...',
        'notifications.declineInvite': 'Decline',
        'notifications.decliningInvite': 'Declining...',
        'notifications.inviteAccepted': 'Invitation accepted',
        'notifications.inviteDeclined': 'Invitation declined',
        'notifications.inviteActionFailed': 'Failed to process invitation',
        'notifications.inviteActionUnexpectedError': 'An error occurred while processing the invitation',

        'profile.title': 'Profile',
        'profile.editProfile': 'Edit Profile',
        'profile.notificationSettings': 'Notification Settings',
        'profile.language': 'Language',
        'profile.appearance': 'Appearance',
        'profile.privacySecurity': 'Privacy & Security',
        'profile.helpSupport': 'Help & Support',
        'profile.adminMode': 'Admin Mode',
        'profile.logout': 'Log Out',
        'profile.loggingOut': 'Logging out...',
        'profile.loading': 'Loading...',
        'profile.loadingEmail': 'Loading email...',
        'profile.noEmail': 'No email',
        'profile.logoutFailed': 'Could not log out',
        'profile.logoutUnexpectedError': 'An error occurred while logging out',

        'language.title': 'Language',
        'language.selectedLanguage': 'Selected language',
        'language.back': 'Back',
        'appearance.title': 'Appearance',
        'appearance.description': 'Choose how Gathr looks on this device.',
        'appearance.system': 'System',
        'appearance.dark': 'Dark',
        'appearance.light': 'Light',
        'appearance.currentSystemDark': 'Current system theme: Dark',
        'appearance.currentSystemLight': 'Current system theme: Light',
        'admin.title': 'Admin',
        'admin.enabledTitle': 'Admin mode is enabled',
        'admin.enabledDescription': 'This account has access to the first-stage admin area.',
        'admin.comingSoonTitle': 'Coming soon',
        'admin.comingSoonDescription': 'Admin tools and moderation surfaces will be added in the next stages.',
        'admin.totalUsers': 'Total users',
        'admin.totalEvents': 'Total events',
        'admin.futureEvents': 'Future events',
        'admin.participantsCount': 'Participants',
        'admin.pendingInvitations': 'Pending invites',
        'admin.supportRequests': 'Support requests',
        'admin.latestEvents': 'Latest events',
        'admin.eventsModerationTitle': 'Events moderation',
        'admin.eventsModerationDescription': 'Review events, inspect details, and remove problematic items.',
        'admin.futureFilter': 'Future',
        'admin.pastFilter': 'Past',
        'admin.creatorFilterPlaceholder': 'Filter by creator',
        'admin.allActivityTypes': 'All activities',
        'admin.noModerationEvents': 'No events match the selected filters',
        'admin.creatorLabel': 'Creator',
        'admin.participantsLabel': 'Participants',
        'admin.viewEventDetails': 'Open event',
        'admin.viewParticipants': 'Participants',
        'admin.deletingEvent': 'Deleting...',
        'admin.deleteEventConfirm': 'Delete this event? This action cannot be undone.',
        'admin.deleteEventFailed': 'Failed to delete event',
        'admin.deleteEventUnexpectedError': 'An unexpected error occurred while deleting the event',
        'admin.pageOverview': 'Overview',
        'admin.pageEvents': 'Events',
        'admin.pageUsers': 'Users',
        'admin.pageSupport': 'Support',
        'admin.usersTitle': 'Users',
        'admin.userSearchPlaceholder': 'Search users by name',
        'admin.noUsers': 'No users to show',
        'admin.noUsersMatch': 'No users match this search',
        'admin.userProfileTitle': 'User profile',
        'admin.selectUser': 'Select a user to view details',
        'admin.userStatusLabel': 'Status',
        'admin.saveChanges': 'Save changes',
        'admin.savingUser': 'Saving...',
        'admin.updateUserSuccess': 'User access updated',
        'admin.updateUserFailed': 'Failed to update user access',
        'admin.updateUserUnexpectedError': 'An unexpected error occurred while updating the user',
        'admin.banUser': 'Ban user',
        'admin.unbanUser': 'Unban user',
        'admin.banningUser': 'Banning user...',
        'admin.unbanningUser': 'Unbanning user...',
        'admin.banUserConfirmDescription': 'Block this user from accessing the app?',
        'admin.unbanUserConfirmDescription': 'Restore access for this user?',
        'admin.banUserHint': 'Banned users are signed out and cannot enter the app until they are unbanned.',
        'admin.cannotBanSelf': 'You cannot ban your own admin account',
        'admin.userBannedSuccess': 'User has been banned',
        'admin.userUnbannedSuccess': 'User has been unbanned',
        'admin.banUserFailed': 'Failed to ban user',
        'admin.unbanUserFailed': 'Failed to unban user',
        'admin.banUserUnexpectedError': 'An unexpected error occurred while banning the user',
        'admin.unbanUserUnexpectedError': 'An unexpected error occurred while unbanning the user',
        'admin.activeStatus': 'Active',
        'admin.bannedStatus': 'Banned',
        'admin.deleteUser': 'Delete user',
        'admin.deletingUser': 'Deleting user...',
        'admin.deleteUserConfirm': 'Delete this user? This action cannot be undone.',
        'admin.deleteUserHint': 'Deleting the profile does not automatically remove auth.users without a separate admin backend flow.',
        'admin.deleteUserSelfBlocked': 'You cannot delete your own admin account',
        'admin.deleteUserHasEventsBlocked': 'Delete or reassign this user’s created events first',
        'admin.deleteUserSuccess': 'User deleted',
        'admin.deleteUserFailed': 'Failed to delete user',
        'admin.deleteUserUnexpectedError': 'An unexpected error occurred while deleting the user',
        'admin.roleLabel': 'Role',
        'admin.roleUser': 'User',
        'admin.roleAdmin': 'Admin',
        'admin.planLabel': 'Plan',
        'admin.planFree': 'Free',
        'admin.planPro': 'Pro',
        'admin.unlimitedAccessLabel': 'Unlimited access',
        'admin.enabled': 'Enabled',
        'admin.disabled': 'Disabled',
        'admin.readOnly': 'Read only',
        'admin.unavailable': 'Unavailable',
        'admin.noEvents': 'No events to show',
        'admin.notAvailable': 'Not available',
        'admin.supportPageTitle': 'Support requests',
        'admin.noSupportRequests': 'No support requests yet',
        'admin.supportRequestsUnavailable': 'Support requests are unavailable right now',
        'admin.supportRequestFrom': 'From',
        'admin.submittedAt': 'Submitted at',
        'admin.subjectLabel': 'Subject',
        'admin.messageLabel': 'Message',
        'admin.supportStatusLabel': 'Status',
        'admin.supportStatusNew': 'New',
        'admin.supportStatusInProgress': 'In progress',
        'admin.supportStatusResolved': 'Resolved',
        'admin.startTicket': 'Start',
        'admin.resolveTicket': 'Resolve',
        'admin.reopenTicket': 'Reopen',
        'admin.backToNew': 'Back to new',
        'admin.supportStatusUpdated': 'Support ticket status updated',
        'admin.supportStatusUpdateFailed': 'Failed to update support ticket status',
        'admin.supportStatusUpdateUnexpectedError':
            'An unexpected error occurred while updating the support ticket status',
        'admin.supportResolvedEmailSent': 'Ticket marked as resolved and the user has been notified by email',
        'admin.supportResolvedEmailFailed':
            'Ticket was marked as resolved, but the email notification could not be sent',
        'admin.latestPendingInvitations': 'Latest pending invitations',
        'admin.invitedBy': 'Invited by',
        'admin.noPendingInvitations': 'No pending invitations',



        'home.discover': 'Discover',
        'home.joined': 'Joined',
        'home.myEvents': 'My Events',
        'home.all': 'All',
        'home.allCities': 'All cities',
        'home.cityFilterLabel': 'City',
        'home.citySearchPlaceholder': 'Search city',
        'home.noCitiesFound': 'No cities found',
        'home.loadMore': 'Load more',
        'home.loading': 'Loading...',
        'home.createdBy': 'Created by',
        'home.you': 'You',
        'home.participant': 'participant',
        'home.participants': 'participants',
        'home.past': 'Past',
        'home.noMyEvents': 'No my events yet',
        'home.noJoinedEvents': 'No joined events yet',
        'home.noDiscoverEvents': 'No discover events yet',
        'home.noEventsForFilter': 'No events found for this activity type.',
        'home.noEventsForCity': 'No events found for this city.',
        'home.createFirstEvent': 'Create your first event by tapping the + button.',
        'home.joinedWillAppear': 'Events you join will appear here.',
        'home.noEventsFromOthers': 'There are no events from other users yet.',
        'home.launchOverlayTitle': 'You are among the first Gathr users',
        'home.launchOverlayText':
            'Gathr has just launched. Real events, activity, and honest feedback matter the most right now. Create meetups, join them, and help us make the app stronger.',
        'home.launchOverlayButton': 'Continue',

        'create.title': 'Create Event',
        'create.cancel': 'Cancel',
        'create.eventTitle': 'Event Title',
        'create.eventTitlePlaceholder': 'What are you planning?',
        'create.activityType': 'Activity Type',
        'create.description': 'Description',
        'create.descriptionPlaceholder': 'Add details about your event...',
        'create.date': 'Date',
        'create.time': 'Time',
        'create.location': 'Location',
        'create.locationPlaceholder': 'Where will it happen?',
        'create.locationApiKeyMissing': 'Google Maps API key is missing. Address suggestions are unavailable.',
        'create.createButton': 'Create Event',
        'create.creating': 'Creating...',
        'create.activeEventsLimitReached': 'Free plan includes up to 3 active events at the same time.',
        'create.activeEventsLimitReachedPro': 'Upgrade to Pro to create more active events.',
        'create.pastDateTime': 'You cannot create an event in the past',

        'edit.title': 'Edit Event',
        'edit.cancel': 'Cancel',
        'edit.eventTitle': 'Event Title',
        'edit.eventTitlePlaceholder': 'What are you planning?',
        'edit.activityType': 'Activity Type',
        'edit.description': 'Description',
        'edit.descriptionPlaceholder': 'Add details about your event...',
        'edit.date': 'Date',
        'edit.time': 'Time',
        'edit.location': 'Location',
        'edit.locationPlaceholder': 'Where will it happen?',
        'edit.saveButton': 'Save Changes',
        'edit.saving': 'Saving...',

        'details.back': 'Back',
        'details.pastEvent': 'Past event',
        'details.noDescription': 'No description provided',
        'details.dateTime': 'Date & Time',
        'details.location': 'Location',
        'details.locationNotSpecified': 'Location not specified',
        'details.participants': 'Participants',
        'details.noParticipants': 'No participants yet',
        'details.you': 'You',
        'details.creator': 'Creator',
        'details.leaveEvent': 'Leave Event',
        'details.leaving': 'Leaving...',
        'details.joinEvent': 'Join Event',
        'details.joining': 'Joining...',
        'details.eventEnded': 'This event has already ended',
        'details.editEvent': 'Edit Event',
        'details.deleteEvent': 'Delete Event',
        'details.deleting': 'Deleting...',
        'details.fallbackTitle': 'Coffee & Cowork',
        'details.fallbackDescription':
            "Let's grab coffee and get some work done together. Bring your laptop!",
        'details.fallbackLocation': 'Blue Bottle, Downtown',
        'details.shareInviteLine': 'Join me on Gathr',
        'details.shareLabelEvent': 'Event:',
        'details.shareLabelDate': 'Date:',
        'details.shareLabelLocation': 'Location:',
        'details.shareOpenLink': 'Open event:',
        'details.linkCopied': 'Event link copied',
        'details.copyLinkPrompt': 'Copy event link:',
        'details.shareEvent': 'Share Event',
        'details.sharing': 'Sharing...',
        'details.eventNotResolved': 'Could not identify the event',
        'details.joinFailed': 'Could not join the event',
        'details.joinUnexpectedError': 'Something went wrong while joining',
        'details.loginRequired': 'Please log in first',
        'details.leaveFailed': 'Could not leave the event',
        'details.leaveUnexpectedError': 'Something went wrong while leaving',
        'details.deleteOnlyCreator': 'Only the creator can delete this event',
        'details.deleteConfirm': 'Delete this event? This cannot be undone.',
        'details.deleteParticipantsFailed': 'Could not remove event participants',
        'details.deleteFailed': 'Could not delete the event',
        'details.deleteUnexpectedError': 'Something went wrong while deleting the event',

        'participants.back': 'Back',
        'participants.title': 'Participants',
        'participants.loading': 'Loading participants...',
        'participants.noParticipants': 'No participants yet',
        'participants.eventFallback': 'Event',
        'participants.participant': 'participant',
        'participants.participants': 'participants',
        'participants.you': 'You',
        'participants.creator': 'Creator',
        'create.enterTitle': 'Enter an event title',
        'create.selectDate': 'Select a date',
        'create.selectTime': 'Select a time',
        'create.userNotAuthenticated': 'User is not authenticated',
        'create.invalidDateTime': 'Invalid date or time',
        'create.failed': 'Failed to create event',
        'create.creatorParticipantFailed': 'Event was created, but the creator was not added as a participant',
        'create.unexpectedError': 'An error occurred while creating the event',
        'edit.eventNotFound': 'Could not determine the event',
        'edit.enterTitle': 'Enter an event title',
        'edit.selectDate': 'Select a date',
        'edit.selectTime': 'Select a time',
        'edit.invalidDateTime': 'Invalid date or time',
        'edit.userNotAuthenticated': 'User is not authenticated',
        'edit.failed': 'Failed to update event',
        'edit.unexpectedError': 'An error occurred while updating the event',
        'edit.locationApiKeyMissing': 'Google Maps API key is missing. Address suggestions are unavailable.',
        'signup.confirmEmailTitle': 'Check your email',
        'signup.confirmEmailMessage': 'We sent you a confirmation link. Please confirm your email before logging in.',

        'login.forgotPassword': 'Forgot password?',
        'login.sendingReset': 'Sending...',
        'login.resetEmailSent': 'We sent a password reset link to your email',
        'login.resetFailed': 'Failed to send password reset email',
        'login.resetUnexpectedError': 'An error occurred while sending the reset email',
        'auth.accountBlocked': 'Your account has been blocked',

        'resetPassword.back': 'Back',
        'resetPassword.title': 'Set new password',
        'resetPassword.description': 'Enter your new password below.',
        'resetPassword.newPassword': 'New password',
        'resetPassword.newPasswordPlaceholder': '••••••••',
        'resetPassword.confirmPassword': 'Confirm password',
        'resetPassword.confirmPasswordPlaceholder': '••••••••',
        'resetPassword.submit': 'Save new password',
        'resetPassword.submitting': 'Saving...',
        'resetPassword.enterPassword': 'Enter a new password',
        'resetPassword.enterConfirmPassword': 'Confirm your new password',
        'resetPassword.passwordTooShort': 'Password must be at least 6 characters',
        'resetPassword.passwordsDoNotMatch': 'Passwords do not match',
        'resetPassword.failed': 'Failed to reset password',
        'resetPassword.unexpectedError': 'An error occurred while resetting the password',
        'resetPassword.success': 'Password changed successfully. Please log in again.',
        'resetPassword.restoreSessionFailed': 'Failed to restore session',
        'resetPassword.recoverySessionMissing':
            'Recovery session is missing. Open the password reset link again.',
        'inviteUsers.title': 'Invite Users',
        'inviteUsers.back': 'Back',
        'inviteUsers.inviteButton': 'Invite',
        'inviteUsers.inviting': 'Inviting...',
        'inviteUsers.invite': 'Invite',
        'inviteUsers.loading': 'Loading users...',
        'inviteUsers.empty': 'No users available to invite',
        'inviteUsers.sent': 'Invitation sent',
        'inviteUsers.failed': 'Failed to send invitation',
        'inviteUsers.unexpectedError': 'An error occurred while sending the invitation',
        'inviteUsers.invitesPerEventLimitReached': 'Free plan includes up to 10 invitations per event.',
        'inviteUsers.invitesPerEventLimitReachedPro': 'Upgrade to Pro to invite more people.',
    },

    ru: {
        'profile.appearance': 'Оформление',
        'appearance.title': 'Оформление',
        'appearance.description': 'Выбери, как будет выглядеть Gathr на этом устройстве.',
        'appearance.system': 'Системная',
        'appearance.dark': 'Тёмная',
        'appearance.light': 'Светлая',
        'appearance.currentSystemDark': 'Текущая системная тема: тёмная',
        'appearance.currentSystemLight': 'Текущая системная тема: светлая',
        'common.user': 'Пользователь',
        'common.unknown': 'Неизвестно',
        'common.guestUser': 'Гость',
        'common.event': 'Событие',
        'common.dateNotSpecified': 'Дата не указана',
        'common.invalidDate': 'Некорректная дата',
        'common.timeNotSpecified': 'Время не указано',
        'common.invalidTime': 'Некорректное время',
        'common.justNow': 'Только что',
        'common.back': 'Назад',
        'common.loading': 'Загрузка...',
        'common.loadingSettings': 'Загрузка настроек...',
        'common.loadingNotifications': 'Загрузка уведомлений...',
        'common.save': 'Сохранить',
        'common.saving': 'Сохранение...',
        'common.cancel': 'Отмена',
        'common.name': 'Имя',
        'common.email': 'Email',
        'common.password': 'Пароль',

        'bottomNav.home': 'Главная',
        'bottomNav.notifications': 'Уведомления',
        'bottomNav.profile': 'Профиль',

        'activity.sports': 'Спорт',
        'activity.networking': 'Нетворкинг',
        'activity.study': 'Учёба',
        'activity.entertainment': 'Развлечения',
        'activity.foodDrinks': 'Еда и напитки',
        'activity.outdoors': 'На улице',
        'activity.tech': 'Технологии',
        'activity.other': 'Другое',

        'welcome.tagline': 'Быстро. Просто. Вместе.',
        'welcome.languageChoiceTitle': 'Выбери язык',
        'welcome.languageChoiceDescription':
            'Если ты здесь впервые, выбери язык, на котором хочешь пользоваться Gathr.',
        'welcome.google': 'Продолжить через Google',
        'welcome.login': 'Войти по email',
        'welcome.signup': 'Создать аккаунт по email',

        'login.back': 'Назад',
        'login.title': 'С возвращением',
        'login.google': 'Продолжить через Google',
        'login.emailDivider': 'Или войти по email',
        'login.email': 'Email',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Пароль',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Войти',
        'login.submitting': 'Вход...',
        'login.noAccount': 'Нет аккаунта?',
        'login.signupLink': 'Зарегистрироваться',
        'login.enterEmail': 'Введите email',
        'login.enterPassword': 'Введите пароль',
        'login.failed': 'Не удалось войти',
        'login.googleFailed': 'Не удалось продолжить через Google',
        'login.unexpectedError': 'Произошла ошибка при входе',

        'signup.back': 'Назад',
        'signup.title': 'Создать аккаунт',
        'signup.name': 'Имя',
        'signup.namePlaceholder': 'Ваше имя',
        'signup.email': 'Email',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Пароль',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Зарегистрироваться',
        'signup.submitting': 'Регистрация...',
        'signup.haveAccount': 'Уже есть аккаунт?',
        'signup.loginLink': 'Войти',
        'signup.enterName': 'Введите имя',
        'signup.enterEmail': 'Введите email',
        'signup.enterPassword': 'Введите пароль',
        'signup.failed': 'Не удалось зарегистрироваться',
        'signup.userIdMissing': 'Пользователь создан, но не удалось получить его ID',
        'signup.profileNotSaved': 'Аккаунт создан, но профиль не сохранился',
        'signup.success': 'Регистрация успешна',
        'signup.unexpectedError': 'Произошла ошибка при регистрации',

        'editProfile.title': 'Редактировать профиль',
        'editProfile.name': 'Имя',
        'editProfile.email': 'Email',
        'editProfile.saveButton': 'Сохранить изменения',
        'editProfile.loading': 'Загрузка...',
        'editProfile.saving': 'Сохранение...',
        'editProfile.userNotFound': 'Пользователь не найден',
        'editProfile.enterName': 'Введите имя',
        'editProfile.saveFailed': 'Не удалось сохранить профиль',
        'editProfile.unexpectedError': 'Произошла ошибка при сохранении профиля',

        'notificationSettings.title': 'Настройки уведомлений',
        'notificationSettings.sectionTitle': 'УВЕДОМЛЕНИЯ',
        'notificationSettings.upcomingEvents': 'Предстоящие события',
        'notificationSettings.upcomingEventsDescription': 'Получать уведомления перед началом событий',
        'notificationSettings.newParticipants': 'Новые участники',
        'notificationSettings.newParticipantsDescription': 'Когда кто-то присоединяется к вашему событию',
        'notificationSettings.eventInvitations': 'Приглашения на события',
        'notificationSettings.eventInvitationsDescription': 'Когда вас приглашают на событие',

        'security.title': 'Конфиденциальность и безопасность',
        'security.cardTitle': 'Настройки безопасности',
        'security.cardDescription': 'Расширенные функции безопасности скоро будут доступны.',
        'security.changePasswordTitle': 'Сменить пароль',
        'security.changePasswordDescription': 'Установите новый пароль для вашего аккаунта.',
        'security.newPassword': 'Новый пароль',
        'security.newPasswordPlaceholder': '••••••••',
        'security.confirmPassword': 'Подтвердите пароль',
        'security.confirmPasswordPlaceholder': '••••••••',
        'security.savePassword': 'Сохранить новый пароль',
        'security.savingPassword': 'Сохранение...',
        'security.enterPassword': 'Введите новый пароль',
        'security.enterConfirmPassword': 'Подтвердите новый пароль',
        'security.passwordTooShort': 'Пароль должен содержать минимум 6 символов',
        'security.passwordsDoNotMatch': 'Пароли не совпадают',
        'security.passwordChanged': 'Пароль успешно изменён',
        'security.passwordChangeFailed': 'Не удалось изменить пароль',
        'security.passwordChangeUnexpectedError': 'Произошла ошибка при смене пароля',
        'security.comingSoonTitle': 'Удаление аккаунта',
        'security.comingSoonDescription': 'Удаление аккаунта будет доступно позже.',

        'support.title': 'Помощь и поддержка',
        'support.cardTitle': 'Центр поддержки',
        'support.cardDescription': 'Статьи помощи и варианты поддержки скоро будут доступны.',
        'support.formTitle': 'Связаться с поддержкой',
        'support.formDescription': 'Отправьте нам вопрос, проблему или отзыв.',
        'support.subject': 'Тема',
        'support.subjectPlaceholder': 'Кратко опишите вопрос',
        'support.message': 'Сообщение',
        'support.messagePlaceholder': 'Опишите, что произошло или с чем нужна помощь...',
        'support.sendButton': 'Отправить обращение',
        'support.sending': 'Отправка...',
        'support.enterSubject': 'Введите тему',
        'support.enterMessage': 'Введите сообщение',
        'support.sendFailed': 'Не удалось отправить обращение',
        'support.sendUnexpectedError': 'Произошла ошибка при отправке обращения',
        'support.sentSuccess': 'Ваше обращение отправлено',

        'notifications.title': 'Уведомления',
        'notifications.emptyTitle': 'Пока нет уведомлений',
        'notifications.emptyDescription': 'Здесь появятся предстоящие события и обновления участников.',
        'notifications.upcomingIconLabel': 'Предстоящее событие',
        'notifications.joinIconLabel': 'Новый участник',
        'notifications.startedAlready': 'Уже началось',
        'notifications.inMinutes': 'Через {count} мин',
        'notifications.inHours': 'Через {count} час|Через {count} часов',
        'notifications.upcomingDefault': '{title} скоро начнётся',
        'notifications.startsInMinutes': '{title} начнётся через {count} мин',
        'notifications.startsInHours': '{title} начнётся через {count} час|{title} начнётся через {count} часов',
        'notifications.justNow': 'Только что',
        'notifications.minutesAgo': '{count} мин назад',
        'notifications.hoursAgo': '{count} час назад|{count} часов назад',
        'notifications.daysAgo': '{count} день назад|{count} дней назад',
        'notifications.someone': 'Кто-то',
        'notifications.joinedYourEvent': '{names} присоединился к вашему событию {title}|{names} присоединились к вашему событию {title}',
        'notifications.and': 'и',
        'notifications.others': 'других',
        'notifications.inviteIconLabel': 'Приглашение на событие',
        'notifications.invitedYouToEvent': '{name} пригласил вас на событие {title}',
        'notifications.acceptInvite': 'Принять',
        'notifications.acceptingInvite': 'Принятие...',
        'notifications.declineInvite': 'Отклонить',
        'notifications.decliningInvite': 'Отклонение...',
        'notifications.inviteAccepted': 'Приглашение принято',
        'notifications.inviteDeclined': 'Приглашение отклонено',
        'notifications.inviteActionFailed': 'Не удалось обработать приглашение',
        'notifications.inviteActionUnexpectedError': 'Произошла ошибка при обработке приглашения',

        'profile.title': 'Профиль',
        'profile.editProfile': 'Редактировать профиль',
        'profile.notificationSettings': 'Настройки уведомлений',
        'profile.language': 'Язык',
        'profile.privacySecurity': 'Конфиденциальность и безопасность',
        'profile.helpSupport': 'Помощь и поддержка',
        'profile.adminMode': 'Режим администратора',
        'profile.logout': 'Выйти',
        'profile.loggingOut': 'Выход...',
        'profile.loading': 'Загрузка...',
        'profile.loadingEmail': 'Загрузка email...',
        'profile.noEmail': 'Нет email',
        'profile.logoutFailed': 'Не удалось выйти из аккаунта',
        'profile.logoutUnexpectedError': 'Произошла ошибка при выходе',

        'language.title': 'Язык',
        'language.selectedLanguage': 'Выбранный язык',
        'language.back': 'Назад',
        'admin.title': 'Админ',
        'admin.enabledTitle': 'Режим администратора включен',
        'admin.enabledDescription': 'Для этого аккаунта доступна базовая зона admin mode.',
        'admin.comingSoonTitle': 'Скоро',
        'admin.comingSoonDescription': 'Инструменты администрирования и модерации будут добавлены на следующих этапах.',
        'admin.totalUsers': 'Всего пользователей',
        'admin.totalEvents': 'Всего событий',
        'admin.futureEvents': 'Будущие события',
        'admin.participantsCount': 'Участники',
        'admin.pendingInvitations': 'Ожидают приглашения',
        'admin.supportRequests': 'Запросы в поддержку',
        'admin.latestEvents': 'Последние события',
        'admin.eventsModerationTitle': 'Модерация событий',
        'admin.eventsModerationDescription': 'Проверяй события, открывай детали и удаляй проблемные записи.',
        'admin.futureFilter': 'Будущие',
        'admin.pastFilter': 'Прошедшие',
        'admin.creatorFilterPlaceholder': 'Фильтр по создателю',
        'admin.allActivityTypes': 'Все активности',
        'admin.noModerationEvents': 'Нет событий под выбранные фильтры',
        'admin.creatorLabel': 'Создатель',
        'admin.participantsLabel': 'Участники',
        'admin.viewEventDetails': 'Открыть событие',
        'admin.viewParticipants': 'Участники',
        'admin.deletingEvent': 'Удаление...',
        'admin.deleteEventConfirm': 'Удалить это событие? Действие нельзя отменить.',
        'admin.deleteEventFailed': 'Не удалось удалить событие',
        'admin.deleteEventUnexpectedError': 'Произошла непредвиденная ошибка при удалении события',
        'admin.pageOverview': 'Обзор',
        'admin.pageUsers': '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438',
        'admin.pageSupport': '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430',
        'admin.usersTitle': 'Пользователи',
        'admin.userSearchPlaceholder': 'Поиск пользователей по имени',
        'admin.noUsers': 'Нет пользователей для отображения',
        'admin.noUsersMatch': 'Ничего не найдено',
        'admin.userProfileTitle': 'Профиль пользователя',
        'admin.selectUser': 'Выбери пользователя, чтобы посмотреть детали',
        'admin.userStatusLabel': 'Статус',
        'admin.saveChanges': 'Сохранить изменения',
        'admin.savingUser': 'Сохранение...',
        'admin.updateUserSuccess': 'Доступ пользователя обновлен',
        'admin.updateUserFailed': 'Не удалось обновить доступ пользователя',
        'admin.updateUserUnexpectedError': 'Произошла непредвиденная ошибка при обновлении пользователя',
        'admin.banUser': 'Забанить пользователя',
        'admin.unbanUser': 'Разбанить пользователя',
        'admin.banningUser': 'Блокировка пользователя...',
        'admin.unbanningUser': 'Разблокировка пользователя...',
        'admin.banUserConfirmDescription': 'Заблокировать этому пользователю доступ к приложению?',
        'admin.unbanUserConfirmDescription': 'Восстановить этому пользователю доступ к приложению?',
        'admin.banUserHint': 'Забаненные пользователи выходят из сессии и не могут зайти в приложение, пока их не разбанят.',
        'admin.cannotBanSelf': 'Нельзя забанить собственный admin-аккаунт',
        'admin.userBannedSuccess': 'Пользователь заблокирован',
        'admin.userUnbannedSuccess': 'Пользователь разблокирован',
        'admin.banUserFailed': 'Не удалось заблокировать пользователя',
        'admin.unbanUserFailed': 'Не удалось разблокировать пользователя',
        'admin.banUserUnexpectedError': 'Произошла непредвиденная ошибка при блокировке пользователя',
        'admin.unbanUserUnexpectedError': 'Произошла непредвиденная ошибка при разблокировке пользователя',
        'admin.activeStatus': 'Активен',
        'admin.bannedStatus': 'Заблокирован',
        'admin.deleteUser': 'Удалить пользователя',
        'admin.deletingUser': 'Удаление пользователя...',
        'admin.deleteUserConfirm': 'Удалить этого пользователя? Действие нельзя отменить.',
        'admin.deleteUserHint': 'Удаление профиля не удаляет auth.users автоматически без отдельного server-side admin flow.',
        'admin.deleteUserSelfBlocked': 'Нельзя удалить собственный admin-аккаунт',
        'admin.deleteUserHasEventsBlocked': 'Сначала удалите или переназначьте события, созданные этим пользователем',
        'admin.deleteUserSuccess': 'Пользователь удален',
        'admin.deleteUserFailed': 'Не удалось удалить пользователя',
        'admin.deleteUserUnexpectedError': 'Произошла непредвиденная ошибка при удалении пользователя',
        'admin.roleLabel': 'Роль',
        'admin.roleUser': 'Пользователь',
        'admin.roleAdmin': 'Админ',
        'admin.planLabel': 'План',
        'admin.planFree': 'Free',
        'admin.planPro': 'Pro',
        'admin.unlimitedAccessLabel': 'Безлимитный доступ',
        'admin.enabled': 'Включен',
        'admin.disabled': 'Выключен',
        'admin.readOnly': 'Только чтение',
        'admin.unavailable': 'Недоступно',
        'admin.noEvents': 'Нет событий для отображения',
        'admin.notAvailable': 'Нет данных',
        'admin.latestPendingInvitations': 'Последние ожидающие приглашения',
        'admin.invitedBy': 'Пригласил',
        'admin.noPendingInvitations': 'Нет ожидающих приглашений',


        'admin.supportPageTitle': '\u0417\u0430\u043f\u0440\u043e\u0441\u044b \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443',
        'admin.noSupportRequests': '\u0417\u0430\u043f\u0440\u043e\u0441\u043e\u0432 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442',
        'admin.supportRequestsUnavailable': '\u0417\u0430\u043f\u0440\u043e\u0441\u044b \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443 \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b',
        'admin.supportRequestFrom': '\u041e\u0442',
        'admin.submittedAt': '\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e',
        'admin.subjectLabel': '\u0422\u0435\u043c\u0430',
        'admin.messageLabel': '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435',
        'admin.supportStatusLabel': '\u0421\u0442\u0430\u0442\u0443\u0441',
        'admin.supportStatusNew': '\u041d\u043e\u0432\u044b\u0439',
        'admin.supportStatusInProgress': '\u0412 \u0440\u0430\u0431\u043e\u0442\u0435',
        'admin.supportStatusResolved': '\u0420\u0435\u0448\u0435\u043d\u043e',
        'admin.startTicket': '\u0412\u0437\u044f\u0442\u044c \u0432 \u0440\u0430\u0431\u043e\u0442\u0443',
        'admin.resolveTicket': '\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u043a\u0430\u043a \u0440\u0435\u0448\u0451\u043d\u043d\u044b\u0439',
        'admin.reopenTicket': '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0441\u043d\u043e\u0432\u0430',
        'admin.backToNew': '\u0412\u0435\u0440\u043d\u0443\u0442\u044c \u0432 \u043d\u043e\u0432\u044b\u0435',
        'admin.supportStatusUpdated': '\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u044f\u0432\u043a\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d',
        'admin.supportStatusUpdateFailed': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u044f\u0432\u043a\u0438',
        'admin.supportStatusUpdateUnexpectedError': '\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043d\u0435\u043f\u0440\u0435\u0434\u0432\u0438\u0434\u0435\u043d\u043d\u0430\u044f \u043e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0437\u0430\u044f\u0432\u043a\u0438',
        'admin.supportResolvedEmailSent': '\u0417\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u0430 \u043a\u0430\u043a \u0440\u0435\u0448\u0451\u043d\u043d\u0430\u044f, \u0438 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044e \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d email',
        'admin.supportResolvedEmailFailed': '\u0417\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u0430 \u043a\u0430\u043a \u0440\u0435\u0448\u0451\u043d\u043d\u0430\u044f, \u043d\u043e email-\u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u043d\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u043b\u043e\u0441\u044c',

        'home.discover': 'События',
        'home.joined': 'Участвую',
        'home.myEvents': 'Мои события',
        'home.all': 'Все',
        'home.allCities': 'Все города',
        'home.cityFilterLabel': 'Город',
        'home.citySearchPlaceholder': 'Поиск города',
        'home.noCitiesFound': 'Города не найдены',
        'home.loadMore': 'Загрузить еще',
        'home.loading': 'Загрузка...',
        'home.createdBy': 'Создал',
        'home.you': 'Ты',
        'home.participant': 'участник',
        'home.participants': 'участников',
        'home.past': 'Прошло',
        'home.noMyEvents': 'У тебя пока нет событий',
        'home.noJoinedEvents': 'Ты пока никуда не присоединился',
        'home.noDiscoverEvents': 'Событий пока нет',
        'home.noEventsForFilter': 'По этому типу активности событий не найдено.',
        'home.noEventsForCity': 'Для этого города событий не найдено.',
        'home.createFirstEvent': 'Создай свое первое событие через кнопку +.',
        'home.joinedWillAppear': 'События, к которым ты присоединишься, появятся здесь.',
        'home.noEventsFromOthers': 'Пока нет событий от других пользователей.',
        'home.launchOverlayTitle': 'Ты среди первых пользователей Gathr',
        'home.launchOverlayText':
            'Gathr только открылся. Сейчас особенно важны реальные события, активность и честная обратная связь. Создавай встречи, вступай в них и помогай нам сделать приложение сильнее.',
        'home.launchOverlayButton': 'Продолжить',

        'create.title': 'Создать событие',
        'create.cancel': 'Отмена',
        'create.eventTitle': 'Название события',
        'create.eventTitlePlaceholder': 'Что ты планируешь?',
        'create.activityType': 'Тип активности',
        'create.description': 'Описание',
        'create.descriptionPlaceholder': 'Добавь детали о событии...',
        'create.date': 'Дата',
        'create.time': 'Время',
        'create.location': 'Локация',
        'create.locationPlaceholder': 'Где это произойдет?',
        'create.locationApiKeyMissing': 'Отсутствует Google Maps API key. Подсказки адресов недоступны.',
        'create.createButton': 'Создать событие',
        'create.creating': 'Создание...',
        'create.activeEventsLimitReached': 'В бесплатном плане можно иметь до 3 активных событий одновременно.',
        'create.activeEventsLimitReachedPro': 'Перейдите на Pro, чтобы создавать больше активных событий.',
        'create.pastDateTime': 'Нельзя создать событие в прошлом',

        'edit.title': 'Редактировать событие',
        'edit.cancel': 'Отмена',
        'edit.eventTitle': 'Название события',
        'edit.eventTitlePlaceholder': 'Что ты планируешь?',
        'edit.activityType': 'Тип активности',
        'edit.description': 'Описание',
        'edit.descriptionPlaceholder': 'Добавь детали о событии...',
        'edit.date': 'Дата',
        'edit.time': 'Время',
        'edit.location': 'Локация',
        'edit.locationPlaceholder': 'Где это произойдет?',
        'edit.saveButton': 'Сохранить изменения',
        'edit.saving': 'Сохранение...',

        'details.back': 'Назад',
        'details.pastEvent': 'Прошедшее событие',
        'details.noDescription': 'Описание отсутствует',
        'details.dateTime': 'Дата и время',
        'details.location': 'Локация',
        'details.locationNotSpecified': 'Локация не указана',
        'details.participants': 'Участники',
        'details.noParticipants': 'Пока нет участников',
        'details.you': 'Ты',
        'details.creator': 'Создатель',
        'details.leaveEvent': 'Покинуть событие',
        'details.leaving': 'Выход...',
        'details.joinEvent': 'Присоединиться',
        'details.joining': 'Подключение...',
        'details.eventEnded': 'Это событие уже завершилось',
        'details.editEvent': 'Редактировать событие',
        'details.deleteEvent': 'Удалить событие',
        'details.deleting': 'Удаление...',
        'details.fallbackTitle': 'Кофе и коворкинг',
        'details.fallbackDescription':
            'Давай выпьем кофе и поработаем вместе. Не забудь ноутбук!',
        'details.fallbackLocation': 'Blue Bottle, центр',
        'details.shareInviteLine': 'Присоединяйся ко мне в Gathr',
        'details.shareLabelEvent': 'Событие:',
        'details.shareLabelDate': 'Дата:',
        'details.shareLabelLocation': 'Место:',
        'details.shareOpenLink': 'Открыть событие:',
        'details.linkCopied': 'Ссылка на событие скопирована',
        'details.copyLinkPrompt': 'Скопируй ссылку на событие:',
        'details.shareEvent': 'Поделиться',
        'details.sharing': 'Отправка...',
        'details.eventNotResolved': 'Не удалось определить событие',
        'details.joinFailed': 'Не удалось присоединиться к событию',
        'details.joinUnexpectedError': 'Произошла ошибка при присоединении',
        'details.loginRequired': 'Сначала войди в аккаунт',
        'details.leaveFailed': 'Не удалось выйти из события',
        'details.leaveUnexpectedError': 'Произошла ошибка при выходе из события',
        'details.deleteOnlyCreator': 'Удалять событие может только создатель',
        'details.deleteConfirm': 'Удалить это событие? Это действие нельзя отменить.',
        'details.deleteParticipantsFailed': 'Не удалось удалить участников события',
        'details.deleteFailed': 'Не удалось удалить событие',
        'details.deleteUnexpectedError': 'Произошла ошибка при удалении события',

        'participants.back': 'Назад',
        'participants.title': 'Участники',
        'participants.loading': 'Загрузка участников...',
        'participants.noParticipants': 'Пока нет участников',
        'participants.eventFallback': 'Событие',
        'participants.participant': 'участник',
        'participants.participants': 'участников',
        'participants.you': 'Ты',
        'participants.creator': 'Создатель',
        'create.enterTitle': 'Введите название события',
        'create.selectDate': 'Выберите дату',
        'create.selectTime': 'Выберите время',
        'create.userNotAuthenticated': 'Пользователь не авторизован',
        'create.invalidDateTime': 'Некорректные дата или время',
        'create.failed': 'Не удалось создать событие',
        'create.creatorParticipantFailed': 'Событие создано, но автор не был добавлен в участники',
        'create.unexpectedError': 'Произошла ошибка при создании события',
        'edit.eventNotFound': 'Не удалось определить событие',
        'edit.enterTitle': 'Введите название события',
        'edit.selectDate': 'Выберите дату',
        'edit.selectTime': 'Выберите время',
        'edit.invalidDateTime': 'Некорректные дата или время',
        'edit.userNotAuthenticated': 'Пользователь не авторизован',
        'edit.failed': 'Не удалось обновить событие',
        'edit.unexpectedError': 'Произошла ошибка при обновлении события',
        'edit.locationApiKeyMissing': 'Отсутствует Google Maps API key. Подсказки адресов недоступны.',
        'signup.confirmEmailTitle': 'Проверь почту',
        'signup.confirmEmailMessage': 'Мы отправили ссылку для подтверждения. Подтверди email перед входом.',

        'login.forgotPassword': 'Забыли пароль?',
        'login.sendingReset': 'Отправка...',
        'login.resetEmailSent': 'Мы отправили ссылку для сброса пароля на ваш email',
        'login.resetFailed': 'Не удалось отправить письмо для сброса пароля',
        'login.resetUnexpectedError': 'Произошла ошибка при отправке письма для сброса пароля',
        'auth.accountBlocked': 'Ваш аккаунт заблокирован',

        'resetPassword.back': 'Назад',
        'resetPassword.title': 'Новый пароль',
        'resetPassword.description': 'Введите новый пароль ниже.',
        'resetPassword.newPassword': 'Новый пароль',
        'resetPassword.newPasswordPlaceholder': '••••••••',
        'resetPassword.confirmPassword': 'Подтвердите пароль',
        'resetPassword.confirmPasswordPlaceholder': '••••••••',
        'resetPassword.submit': 'Сохранить новый пароль',
        'resetPassword.submitting': 'Сохранение...',
        'resetPassword.enterPassword': 'Введите новый пароль',
        'resetPassword.enterConfirmPassword': 'Подтвердите новый пароль',
        'resetPassword.passwordTooShort': 'Пароль должен содержать минимум 6 символов',
        'resetPassword.passwordsDoNotMatch': 'Пароли не совпадают',
        'resetPassword.failed': 'Не удалось сбросить пароль',
        'resetPassword.unexpectedError': 'Произошла ошибка при сбросе пароля',
        'resetPassword.success': 'Пароль успешно изменён. Войдите снова.',
        'resetPassword.restoreSessionFailed': 'Не удалось восстановить сессию',
        'resetPassword.recoverySessionMissing':
            'Сессия восстановления отсутствует. Откройте ссылку сброса пароля ещё раз.',
        'inviteUsers.title': 'Пригласить пользователей',
        'inviteUsers.back': 'Назад',
        'inviteUsers.inviteButton': 'Пригласить',
        'inviteUsers.inviting': 'Отправка...',
        'inviteUsers.invite': 'Пригласить',
        'inviteUsers.loading': 'Загрузка пользователей...',
        'inviteUsers.empty': 'Нет пользователей для приглашения',
        'inviteUsers.sent': 'Приглашение отправлено',
        'inviteUsers.failed': 'Не удалось отправить приглашение',
        'inviteUsers.unexpectedError': 'Произошла ошибка при отправке приглашения',
        'inviteUsers.invitesPerEventLimitReached': 'В бесплатном плане можно отправить до 10 приглашений на одно событие.',
        'inviteUsers.invitesPerEventLimitReachedPro': 'Перейдите на Pro, чтобы приглашать больше людей.',
    },

    ro: {
        'profile.appearance': 'Aspect',
        'appearance.title': 'Aspect',
        'appearance.description': 'Alege cum arată Gathr pe acest dispozitiv.',
        'appearance.system': 'Sistem',
        'appearance.dark': 'Întunecată',
        'appearance.light': 'Luminoasă',
        'appearance.currentSystemDark': 'Tema de sistem curentă: întunecată',
        'appearance.currentSystemLight': 'Tema de sistem curentă: luminoasă',
        'common.user': 'Utilizator',
        'common.unknown': 'Necunoscut',
        'common.guestUser': 'Vizitator',
        'common.event': 'Eveniment',
        'common.dateNotSpecified': 'Data nu este specificată',
        'common.invalidDate': 'Dată invalidă',
        'common.timeNotSpecified': 'Ora nu este specificată',
        'common.invalidTime': 'Oră invalidă',
        'common.justNow': 'Chiar acum',
        'common.back': 'Înapoi',
        'common.loading': 'Se încarcă...',
        'common.loadingSettings': 'Se încarcă setările...',
        'common.loadingNotifications': 'Se încarcă notificările...',
        'common.save': 'Salvează',
        'common.saving': 'Se salvează...',
        'common.cancel': 'Anulează',
        'common.name': 'Nume',
        'common.email': 'Email',
        'common.password': 'Parolă',

        'bottomNav.home': 'Acasă',
        'bottomNav.notifications': 'Notificări',
        'bottomNav.profile': 'Profil',

        'activity.sports': 'Sport',
        'activity.networking': 'Networking',
        'activity.study': 'Studiu',
        'activity.entertainment': 'Distracție',
        'activity.foodDrinks': 'Mâncare și băuturi',
        'activity.outdoors': 'În aer liber',
        'activity.tech': 'Tehnologie',
        'activity.other': 'Altele',

        'welcome.tagline': 'Rapid. Simplu. Împreună.',
        'welcome.languageChoiceTitle': 'Alege limba',
        'welcome.languageChoiceDescription':
            'Dacă e prima ta vizită aici, alege limba în care vrei să folosești Gathr.',
        'welcome.google': 'Continuă cu Google',
        'welcome.login': 'Continuă cu email',
        'welcome.signup': 'Creează cont cu email',

        'login.back': 'Înapoi',
        'login.title': 'Bine ai revenit',
        'login.google': 'Continuă cu Google',
        'login.emailDivider': 'Sau continuă cu email',
        'login.email': 'Email',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Parolă',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Autentificare',
        'login.submitting': 'Se autentifică...',
        'login.noAccount': 'Nu ai cont?',
        'login.signupLink': 'Înregistrează-te',
        'login.enterEmail': 'Introdu emailul',
        'login.enterPassword': 'Introdu parola',
        'login.failed': 'Autentificarea a eșuat',
        'login.googleFailed': 'Nu s-a putut continua cu Google',
        'login.unexpectedError': 'A apărut o eroare la autentificare',

        'signup.back': 'Înapoi',
        'signup.title': 'Creează cont',
        'signup.name': 'Nume',
        'signup.namePlaceholder': 'Numele tău',
        'signup.email': 'Email',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Parolă',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Înregistrare',
        'signup.submitting': 'Se înregistrează...',
        'signup.haveAccount': 'Ai deja cont?',
        'signup.loginLink': 'Autentifică-te',
        'signup.enterName': 'Introdu numele',
        'signup.enterEmail': 'Introdu emailul',
        'signup.enterPassword': 'Introdu parola',
        'signup.failed': 'Înregistrarea a eșuat',
        'signup.userIdMissing': 'Utilizatorul a fost creat, dar ID-ul nu a putut fi obținut',
        'signup.profileNotSaved': 'Contul a fost creat, dar profilul nu a fost salvat',
        'signup.success': 'Înregistrare reușită',
        'signup.unexpectedError': 'A apărut o eroare la înregistrare',

        'editProfile.title': 'Editează profilul',
        'editProfile.name': 'Nume',
        'editProfile.email': 'Email',
        'editProfile.saveButton': 'Salvează modificările',
        'editProfile.loading': 'Se încarcă...',
        'editProfile.saving': 'Se salvează...',
        'editProfile.userNotFound': 'Utilizatorul nu a fost găsit',
        'editProfile.enterName': 'Introdu numele',
        'editProfile.saveFailed': 'Profilul nu a putut fi salvat',
        'editProfile.unexpectedError': 'A apărut o eroare la salvarea profilului',

        'notificationSettings.title': 'Setări notificări',
        'notificationSettings.sectionTitle': 'NOTIFICĂRI',
        'notificationSettings.upcomingEvents': 'Evenimente viitoare',
        'notificationSettings.upcomingEventsDescription': 'Primește notificări înainte de începerea evenimentelor',
        'notificationSettings.newParticipants': 'Participanți noi',
        'notificationSettings.newParticipantsDescription': 'Când cineva se alătură evenimentului tău',
        'notificationSettings.eventInvitations': 'Invitații la evenimente',
        'notificationSettings.eventInvitationsDescription': 'Când cineva te invită la un eveniment',

        'security.title': 'Confidențialitate și securitate',
        'security.cardTitle': 'Setări de securitate',
        'security.cardDescription': 'Funcțiile avansate de securitate vor fi disponibile în curând.',
        'security.changePasswordTitle': 'Schimbă parola',
        'security.changePasswordDescription': 'Setează o parolă nouă pentru contul tău.',
        'security.newPassword': 'Parolă nouă',
        'security.newPasswordPlaceholder': '••••••••',
        'security.confirmPassword': 'Confirmă parola',
        'security.confirmPasswordPlaceholder': '••••••••',
        'security.savePassword': 'Salvează parola nouă',
        'security.savingPassword': 'Se salvează...',
        'security.enterPassword': 'Introdu parola nouă',
        'security.enterConfirmPassword': 'Confirmă parola nouă',
        'security.passwordTooShort': 'Parola trebuie să aibă cel puțin 6 caractere',
        'security.passwordsDoNotMatch': 'Parolele nu coincid',
        'security.passwordChanged': 'Parola a fost schimbată cu succes',
        'security.passwordChangeFailed': 'Parola nu a putut fi schimbată',
        'security.passwordChangeUnexpectedError': 'A apărut o eroare la schimbarea parolei',
        'security.comingSoonTitle': 'Ștergerea contului',
        'security.comingSoonDescription': 'Ștergerea contului va fi disponibilă mai târziu.',

        'support.title': 'Ajutor și suport',
        'support.cardTitle': 'Centrul de suport',
        'support.cardDescription': 'Articolele de ajutor și opțiunile de suport vor fi disponibile în curând.',
        'support.formTitle': 'Contactează suportul',
        'support.formDescription': 'Trimite-ne întrebarea, problema sau feedbackul tău.',
        'support.subject': 'Subiect',
        'support.subjectPlaceholder': 'Descrie pe scurt problema',
        'support.message': 'Mesaj',
        'support.messagePlaceholder': 'Spune-ne ce s-a întâmplat sau cu ce ai nevoie de ajutor...',
        'support.sendButton': 'Trimite solicitarea',
        'support.sending': 'Se trimite...',
        'support.enterSubject': 'Introdu subiectul',
        'support.enterMessage': 'Introdu mesajul',
        'support.sendFailed': 'Solicitarea nu a putut fi trimisă',
        'support.sendUnexpectedError': 'A apărut o eroare la trimiterea solicitării',
        'support.sentSuccess': 'Solicitarea ta a fost trimisă',

        'notifications.title': 'Notificări',
        'notifications.emptyTitle': 'Încă nu există notificări',
        'notifications.emptyDescription': 'Evenimentele viitoare și actualizările participanților vor apărea aici.',
        'notifications.upcomingIconLabel': 'Eveniment viitor',
        'notifications.joinIconLabel': 'Participant nou',
        'notifications.startedAlready': 'A început deja',
        'notifications.inMinutes': 'În {count} min',
        'notifications.inHours': 'În {count} oră|În {count} ore',
        'notifications.upcomingDefault': '{title} urmează în curând',
        'notifications.startsInMinutes': '{title} începe în {count} min',
        'notifications.startsInHours': '{title} începe în {count} oră|{title} începe în {count} ore',
        'notifications.justNow': 'Chiar acum',
        'notifications.minutesAgo': 'Acum {count} min',
        'notifications.hoursAgo': 'Acum {count} oră|Acum {count} ore',
        'notifications.daysAgo': 'Acum {count} zi|Acum {count} zile',
        'notifications.someone': 'Cineva',
        'notifications.joinedYourEvent': '{names} s-a alăturat evenimentului tău {title}|{names} s-au alăturat evenimentului tău {title}',
        'notifications.and': 'și',
        'notifications.others': 'alții',
        'notifications.inviteIconLabel': 'Invitație la eveniment',
        'notifications.invitedYouToEvent': '{name} te-a invitat la {title}',
        'notifications.acceptInvite': 'Acceptă',
        'notifications.acceptingInvite': 'Se acceptă...',
        'notifications.declineInvite': 'Refuză',
        'notifications.decliningInvite': 'Se refuză...',
        'notifications.inviteAccepted': 'Invitația a fost acceptată',
        'notifications.inviteDeclined': 'Invitația a fost refuzată',
        'notifications.inviteActionFailed': 'Invitația nu a putut fi procesată',
        'notifications.inviteActionUnexpectedError': 'A apărut o eroare la procesarea invitației',

        'profile.title': 'Profil',
        'profile.editProfile': 'Editează profilul',
        'profile.notificationSettings': 'Setări notificări',
        'profile.language': 'Limbă',
        'profile.privacySecurity': 'Confidențialitate și securitate',
        'profile.helpSupport': 'Ajutor și suport',
        'profile.adminMode': 'Mod administrator',
        'profile.logout': 'Deconectare',
        'profile.loggingOut': 'Se închide sesiunea...',
        'profile.loading': 'Se încarcă...',
        'profile.loadingEmail': 'Se încarcă emailul...',
        'profile.noEmail': 'Fără email',
        'profile.logoutFailed': 'Nu te-ai putut deconecta',
        'profile.logoutUnexpectedError': 'A apărut o eroare la deconectare',

        'language.title': 'Limbă',
        'language.selectedLanguage': 'Limba selectată',
        'language.back': 'Înapoi',
        'admin.title': 'Admin',
        'admin.enabledTitle': 'Modul administrator este activ',
        'admin.enabledDescription': 'Acest cont are acces la zona inițială de admin mode.',
        'admin.comingSoonTitle': 'În curând',
        'admin.comingSoonDescription': 'Instrumentele de administrare și moderare vor fi adăugate în etapele următoare.',
        'admin.totalUsers': 'Total utilizatori',
        'admin.totalEvents': 'Total evenimente',
        'admin.futureEvents': 'Evenimente viitoare',
        'admin.participantsCount': 'Participanți',
        'admin.pendingInvitations': 'Invitații în așteptare',
        'admin.supportRequests': 'Cereri de suport',
        'admin.latestEvents': 'Ultimele evenimente',
        'admin.eventsModerationTitle': 'Moderare evenimente',
        'admin.eventsModerationDescription': 'Revizuiește evenimentele, deschide detaliile și elimină elementele problematice.',
        'admin.futureFilter': 'Viitoare',
        'admin.pastFilter': 'Trecute',
        'admin.creatorFilterPlaceholder': 'Filtrează după creator',
        'admin.allActivityTypes': 'Toate activitățile',
        'admin.noModerationEvents': 'Niciun eveniment nu corespunde filtrelor selectate',
        'admin.creatorLabel': 'Creator',
        'admin.participantsLabel': 'Participanți',
        'admin.viewEventDetails': 'Deschide evenimentul',
        'admin.viewParticipants': 'Participanți',
        'admin.deletingEvent': 'Se șterge...',
        'admin.deleteEventConfirm': 'Ștergi acest eveniment? Acțiunea nu poate fi anulată.',
        'admin.deleteEventFailed': 'Nu s-a putut șterge evenimentul',
        'admin.deleteEventUnexpectedError': 'A apărut o eroare neașteptată la ștergerea evenimentului',
        'admin.pageOverview': 'Prezentare',
        'admin.pageEvents': 'Evenimente',
        'admin.pageUsers': 'Utilizatori',
        'admin.pageSupport': 'Suport',
        'admin.usersTitle': 'Utilizatori',
        'admin.userSearchPlaceholder': 'Caută utilizatori după nume',
        'admin.noUsers': 'Nu există utilizatori de afișat',
        'admin.noUsersMatch': 'Niciun utilizator nu corespunde căutării',
        'admin.userProfileTitle': 'Profil utilizator',
        'admin.selectUser': 'Selectează un utilizator pentru a vedea detaliile',
        'admin.saveChanges': 'Salvează modificările',
        'admin.savingUser': 'Se salvează...',
        'admin.updateUserSuccess': 'Accesul utilizatorului a fost actualizat',
        'admin.updateUserFailed': 'Nu s-a putut actualiza accesul utilizatorului',
        'admin.updateUserUnexpectedError': 'A apărut o eroare neașteptată la actualizarea utilizatorului',
        'admin.userStatusLabel': 'Status',
        'admin.banUser': 'Blochează utilizatorul',
        'admin.unbanUser': 'Deblochează utilizatorul',
        'admin.banningUser': 'Se blochează utilizatorul...',
        'admin.unbanningUser': 'Se deblochează utilizatorul...',
        'admin.banUserConfirmDescription': 'Blochezi accesul acestui utilizator în aplicație?',
        'admin.unbanUserConfirmDescription': 'Restabilești accesul acestui utilizator?',
        'admin.banUserHint': 'Utilizatorii blocați sunt deconectați și nu mai pot intra în aplicație până la deblocare.',
        'admin.cannotBanSelf': 'Nu îți poți bloca propriul cont de admin',
        'admin.userBannedSuccess': 'Utilizatorul a fost blocat',
        'admin.userUnbannedSuccess': 'Utilizatorul a fost deblocat',
        'admin.banUserFailed': 'Nu s-a putut bloca utilizatorul',
        'admin.unbanUserFailed': 'Nu s-a putut debloca utilizatorul',
        'admin.banUserUnexpectedError': 'A apărut o eroare neașteptată la blocarea utilizatorului',
        'admin.unbanUserUnexpectedError': 'A apărut o eroare neașteptată la deblocarea utilizatorului',
        'admin.activeStatus': 'Activ',
        'admin.bannedStatus': 'Blocat',
        'admin.deleteUser': 'Șterge utilizatorul',
        'admin.deletingUser': 'Se șterge utilizatorul...',
        'admin.deleteUserConfirm': 'Ștergi acest utilizator? Acțiunea nu poate fi anulată.',
        'admin.deleteUserHint': 'Ștergerea profilului nu elimină automat auth.users fără un flow admin server-side separat.',
        'admin.deleteUserSelfBlocked': 'Nu îți poți șterge propriul cont de admin',
        'admin.deleteUserHasEventsBlocked': 'Șterge sau reasignează mai întâi evenimentele create de acest utilizator',
        'admin.deleteUserSuccess': 'Utilizatorul a fost șters',
        'admin.deleteUserFailed': 'Nu s-a putut șterge utilizatorul',
        'admin.deleteUserUnexpectedError': 'A apărut o eroare neașteptată la ștergerea utilizatorului',
        'admin.roleLabel': 'Rol',
        'admin.roleUser': 'Utilizator',
        'admin.roleAdmin': 'Admin',
        'admin.planLabel': 'Plan',
        'admin.planFree': 'Free',
        'admin.planPro': 'Pro',
        'admin.unlimitedAccessLabel': 'Acces nelimitat',
        'admin.enabled': 'Activ',
        'admin.disabled': 'Inactiv',
        'admin.readOnly': 'Doar citire',
        'admin.unavailable': 'Indisponibil',
        'admin.noEvents': 'Nu există evenimente de afișat',
        'admin.notAvailable': 'Nu este disponibil',
        'admin.latestPendingInvitations': 'Ultimele invitații în așteptare',
        'admin.invitedBy': 'Invitat de',
        'admin.noPendingInvitations': 'Nu există invitații în așteptare',



        'admin.supportPageTitle': 'Cereri de suport',
        'admin.noSupportRequests': 'Nu exist? cereri de suport momentan',
        'admin.supportRequestsUnavailable': 'Cererile de suport sunt indisponibile acum',
        'admin.supportRequestFrom': 'De la',
        'admin.submittedAt': 'Trimis la',
        'admin.subjectLabel': 'Subiect',
        'admin.messageLabel': 'Mesaj',
        'admin.supportStatusLabel': 'Status',
        'admin.supportStatusNew': 'Nou',
        'admin.supportStatusInProgress': 'In lucru',
        'admin.supportStatusResolved': 'Rezolvat',
        'admin.startTicket': 'Preia',
        'admin.resolveTicket': 'Rezolva',
        'admin.reopenTicket': 'Redeschide',
        'admin.backToNew': 'Inapoi la nou',
        'admin.supportStatusUpdated': 'Statusul cererii a fost actualizat',
        'admin.supportStatusUpdateFailed': 'Nu s-a putut actualiza statusul cererii',
        'admin.supportStatusUpdateUnexpectedError':
            'A aparut o eroare neasteptata la actualizarea statusului cererii',
        'admin.supportResolvedEmailSent':
            'Cererea a fost marcata ca rezolvata, iar utilizatorul a fost notificat prin email',
        'admin.supportResolvedEmailFailed':
            'Cererea a fost marcata ca rezolvata, dar emailul de notificare nu a putut fi trimis',

        'home.discover': 'Descoperă',
        'home.joined': 'Particip',
        'home.myEvents': 'Evenimentele mele',
        'home.all': 'Toate',
        'home.allCities': 'Toate orașele',
        'home.cityFilterLabel': 'Oraș',
        'home.citySearchPlaceholder': 'Caută oraș',
        'home.noCitiesFound': 'Nu au fost găsite orașe',
        'home.loadMore': 'Încarcă mai mult',
        'home.loading': 'Se încarcă...',
        'home.createdBy': 'Creat de',
        'home.you': 'Tu',
        'home.participant': 'participant',
        'home.participants': 'participanți',
        'home.past': 'Trecut',
        'home.noMyEvents': 'Nu ai încă evenimente',
        'home.noJoinedEvents': 'Nu ai participări încă',
        'home.noDiscoverEvents': 'Nu există evenimente momentan',
        'home.noEventsForFilter': 'Nu au fost găsite evenimente pentru acest tip de activitate.',
        'home.noEventsForCity': 'Nu au fost găsite evenimente pentru acest oraș.',
        'home.createFirstEvent': 'Creează primul tău eveniment folosind butonul +.',
        'home.joinedWillAppear': 'Evenimentele la care participi vor apărea aici.',
        'home.noEventsFromOthers': 'Încă nu există evenimente de la alți utilizatori.',
        'home.launchOverlayTitle': 'Ești printre primii utilizatori Gathr',
        'home.launchOverlayText':
            'Gathr tocmai s-a lansat. Acum contează cel mai mult evenimentele reale, activitatea și feedbackul sincer. Creează întâlniri, alătură-te lor și ajută-ne să facem aplicația mai puternică.',
        'home.launchOverlayButton': 'Continuă',

        'create.title': 'Creează eveniment',
        'create.cancel': 'Anulează',
        'create.eventTitle': 'Titlul evenimentului',
        'create.eventTitlePlaceholder': 'Ce planifici?',
        'create.activityType': 'Tipul activității',
        'create.description': 'Descriere',
        'create.descriptionPlaceholder': 'Adaugă detalii despre eveniment...',
        'create.date': 'Data',
        'create.time': 'Ora',
        'create.location': 'Locație',
        'create.locationPlaceholder': 'Unde va avea loc?',
        'create.locationApiKeyMissing': 'Lipsește cheia Google Maps API. Sugestiile de adresă nu sunt disponibile.',
        'create.createButton': 'Creează eveniment',
        'create.creating': 'Se creează...',
        'create.activeEventsLimitReached': 'Planul gratuit include până la 3 evenimente active în același timp.',
        'create.activeEventsLimitReachedPro': 'Treci la Pro pentru a crea mai multe evenimente active.',
        'create.pastDateTime': 'Nu poți crea un eveniment în trecut',

        'edit.title': 'Editează evenimentul',
        'edit.cancel': 'Anulează',
        'edit.eventTitle': 'Titlul evenimentului',
        'edit.eventTitlePlaceholder': 'Ce planifici?',
        'edit.activityType': 'Tipul activității',
        'edit.description': 'Descriere',
        'edit.descriptionPlaceholder': 'Adaugă detalii despre eveniment...',
        'edit.date': 'Data',
        'edit.time': 'Ora',
        'edit.location': 'Locație',
        'edit.locationPlaceholder': 'Unde va avea loc?',
        'edit.saveButton': 'Salvează modificările',
        'edit.saving': 'Se salvează...',

        'details.back': 'Înapoi',
        'details.pastEvent': 'Eveniment trecut',
        'details.noDescription': 'Nu există descriere',
        'details.dateTime': 'Data și ora',
        'details.location': 'Locație',
        'details.locationNotSpecified': 'Locația nu este specificată',
        'details.participants': 'Participanți',
        'details.noParticipants': 'Încă nu sunt participanți',
        'details.you': 'Tu',
        'details.creator': 'Creator',
        'details.leaveEvent': 'Părăsește evenimentul',
        'details.leaving': 'Se iese...',
        'details.joinEvent': 'Participă',
        'details.joining': 'Se alătură...',
        'details.eventEnded': 'Acest eveniment s-a încheiat deja',
        'details.editEvent': 'Editează evenimentul',
        'details.deleteEvent': 'Șterge evenimentul',
        'details.deleting': 'Se șterge...',
        'details.fallbackTitle': 'Cafea & coworking',
        'details.fallbackDescription':
            'Hai să bem o cafea și să lucrăm împreună. Nu uita laptopul!',
        'details.fallbackLocation': 'Blue Bottle, centru',
        'details.shareInviteLine': 'Alătură-te mie pe Gathr',
        'details.shareLabelEvent': 'Eveniment:',
        'details.shareLabelDate': 'Data:',
        'details.shareLabelLocation': 'Locația:',
        'details.shareOpenLink': 'Deschide evenimentul:',
        'details.linkCopied': 'Linkul evenimentului a fost copiat',
        'details.copyLinkPrompt': 'Copiază linkul evenimentului:',
        'details.shareEvent': 'Distribuie evenimentul',
        'details.sharing': 'Se distribuie...',
        'details.eventNotResolved': 'Evenimentul nu a putut fi identificat',
        'details.joinFailed': 'Nu te-ai putut alătura evenimentului',
        'details.joinUnexpectedError': 'A apărut o eroare la alăturare',
        'details.loginRequired': 'Autentifică-te mai întâi',
        'details.leaveFailed': 'Nu ai putut părăsi evenimentul',
        'details.leaveUnexpectedError': 'A apărut o eroare la părăsire',
        'details.deleteOnlyCreator': 'Doar creatorul poate șterge acest eveniment',
        'details.deleteConfirm': 'Stergi acest eveniment? Actiunea nu poate fi anulata.',
        'details.deleteParticipantsFailed': 'Nu s-au putut elimina participanții evenimentului',
        'details.deleteFailed': 'Evenimentul nu a putut fi șters',
        'details.deleteUnexpectedError': 'A apărut o eroare la ștergerea evenimentului',

        'participants.back': 'Înapoi',
        'participants.title': 'Participanți',
        'participants.loading': 'Se încarcă participanții...',
        'participants.noParticipants': 'Încă nu sunt participanți',
        'participants.eventFallback': 'Eveniment',
        'participants.participant': 'participant',
        'participants.participants': 'participanți',
        'participants.you': 'Tu',
        'participants.creator': 'Creator',
        'create.enterTitle': 'Introdu titlul evenimentului',
        'create.selectDate': 'Selectează data',
        'create.selectTime': 'Selectează ora',
        'create.userNotAuthenticated': 'Utilizatorul nu este autentificat',
        'create.invalidDateTime': 'Data sau ora este invalidă',
        'create.failed': 'Evenimentul nu a putut fi creat',
        'create.creatorParticipantFailed': 'Evenimentul a fost creat, dar autorul nu a fost adăugat ca participant',
        'create.unexpectedError': 'A apărut o eroare la crearea evenimentului',

        'edit.eventNotFound': 'Evenimentul nu a putut fi identificat',
        'edit.enterTitle': 'Introdu titlul evenimentului',
        'edit.selectDate': 'Selectează data',
        'edit.selectTime': 'Selectează ora',
        'edit.invalidDateTime': 'Data sau ora este invalidă',
        'edit.userNotAuthenticated': 'Utilizatorul nu este autentificat',
        'edit.failed': 'Evenimentul nu a putut fi actualizat',
        'edit.unexpectedError': 'A apărut o eroare la actualizarea evenimentului',
        'edit.locationApiKeyMissing': 'Lipsește cheia Google Maps API. Sugestiile de adresă nu sunt disponibile.',
        'signup.confirmEmailTitle': 'Verifică emailul',
        'signup.confirmEmailMessage': 'Ți-am trimis un link de confirmare. Confirmă emailul înainte de autentificare.',

        'login.forgotPassword': 'Ai uitat parola?',
        'login.sendingReset': 'Se trimite...',
        'login.resetEmailSent': 'Am trimis linkul pentru resetarea parolei pe email',
        'login.resetFailed': 'Nu s-a putut trimite emailul pentru resetarea parolei',
        'login.resetUnexpectedError': 'A apărut o eroare la trimiterea emailului pentru resetarea parolei',
        'auth.accountBlocked': 'Contul tău a fost blocat',

        'resetPassword.back': 'Înapoi',
        'resetPassword.title': 'Parolă nouă',
        'resetPassword.description': 'Introdu parola nouă mai jos.',
        'resetPassword.newPassword': 'Parolă nouă',
        'resetPassword.newPasswordPlaceholder': '••••••••',
        'resetPassword.confirmPassword': 'Confirmă parola',
        'resetPassword.confirmPasswordPlaceholder': '••••••••',
        'resetPassword.submit': 'Salvează parola nouă',
        'resetPassword.submitting': 'Se salvează...',
        'resetPassword.enterPassword': 'Introdu parola nouă',
        'resetPassword.enterConfirmPassword': 'Confirmă parola nouă',
        'resetPassword.passwordTooShort': 'Parola trebuie să aibă cel puțin 6 caractere',
        'resetPassword.passwordsDoNotMatch': 'Parolele nu coincid',
        'resetPassword.failed': 'Resetarea parolei a eșuat',
        'resetPassword.unexpectedError': 'A apărut o eroare la resetarea parolei',
        'resetPassword.success': 'Parola a fost schimbată cu succes. Autentifică-te din nou.',
        'resetPassword.restoreSessionFailed': 'Sesiunea nu a putut fi restabilită',
        'resetPassword.recoverySessionMissing':
            'Lipsește sesiunea de recuperare. Deschide din nou linkul de resetare a parolei.',
        'inviteUsers.title': 'Invită utilizatori',
        'inviteUsers.back': 'Înapoi',
        'inviteUsers.inviteButton': 'Invită',
        'inviteUsers.inviting': 'Se trimite...',
        'inviteUsers.invite': 'Invită',
        'inviteUsers.loading': 'Se încarcă utilizatorii...',
        'inviteUsers.empty': 'Nu există utilizatori disponibili pentru invitație',
        'inviteUsers.sent': 'Invitația a fost trimisă',
        'inviteUsers.failed': 'Invitația nu a putut fi trimisă',
        'inviteUsers.unexpectedError': 'A apărut o eroare la trimiterea invitației',
        'inviteUsers.invitesPerEventLimitReached': 'Planul gratuit include până la 10 invitații pentru un eveniment.',
        'inviteUsers.invitesPerEventLimitReachedPro': 'Treci la Pro pentru a invita mai multe persoane.',
    },

    uk: {
        'profile.appearance': 'Зовнішній вигляд',
        'appearance.title': 'Зовнішній вигляд',
        'appearance.description': 'Обери, як буде виглядати Gathr на цьому пристрої.',
        'appearance.system': 'Системна',
        'appearance.dark': 'Темна',
        'appearance.light': 'Світла',
        'appearance.currentSystemDark': 'Поточна системна тема: темна',
        'appearance.currentSystemLight': 'Поточна системна тема: світла',
        'common.user': 'Користувач',
        'common.unknown': 'Невідомо',
        'common.guestUser': 'Гість',
        'common.event': 'Подія',
        'common.dateNotSpecified': 'Дату не вказано',
        'common.invalidDate': 'Некоректна дата',
        'common.timeNotSpecified': 'Час не вказано',
        'common.invalidTime': 'Некоректний час',
        'common.justNow': 'Щойно',
        'common.back': 'Назад',
        'common.loading': 'Завантаження...',
        'common.loadingSettings': 'Завантаження налаштувань...',
        'common.loadingNotifications': 'Завантаження сповіщень...',
        'common.save': 'Зберегти',
        'common.saving': 'Збереження...',
        'common.cancel': 'Скасувати',
        'common.name': "Ім'я",
        'common.email': 'Email',
        'common.password': 'Пароль',

        'bottomNav.home': 'Головна',
        'bottomNav.notifications': 'Сповіщення',
        'bottomNav.profile': 'Профіль',

        'activity.sports': 'Спорт',
        'activity.networking': 'Нетворкінг',
        'activity.study': 'Навчання',
        'activity.entertainment': 'Розваги',
        'activity.foodDrinks': 'Їжа та напої',
        'activity.outdoors': 'Надворі',
        'activity.tech': 'Технології',
        'activity.other': 'Інше',

        'welcome.tagline': 'Швидко. Просто. Разом.',
        'welcome.languageChoiceTitle': 'Оберіть мову',
        'welcome.languageChoiceDescription':
            'Якщо ви тут уперше, оберіть мову, якою хочете користуватися Gathr.',
        'welcome.google': 'Продовжити через Google',
        'welcome.login': 'Увійти через email',
        'welcome.signup': 'Створити акаунт через email',

        'login.back': 'Назад',
        'login.title': 'З поверненням',
        'login.google': 'Продовжити через Google',
        'login.emailDivider': 'Або увійти через email',
        'login.email': 'Email',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Пароль',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Увійти',
        'login.submitting': 'Вхід...',
        'login.noAccount': 'Немає акаунта?',
        'login.signupLink': 'Зареєструватися',
        'login.enterEmail': 'Введіть email',
        'login.enterPassword': 'Введіть пароль',
        'login.failed': 'Не вдалося увійти',
        'login.googleFailed': 'Не вдалося продовжити через Google',
        'login.unexpectedError': 'Сталася помилка під час входу',

        'signup.back': 'Назад',
        'signup.title': 'Створити акаунт',
        'signup.name': "Ім'я",
        'signup.namePlaceholder': "Ваше ім'я",
        'signup.email': 'Email',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Пароль',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Зареєструватися',
        'signup.submitting': 'Реєстрація...',
        'signup.haveAccount': 'Вже маєте акаунт?',
        'signup.loginLink': 'Увійти',
        'signup.enterName': "Введіть ім'я",
        'signup.enterEmail': 'Введіть email',
        'signup.enterPassword': 'Введіть пароль',
        'signup.failed': 'Не вдалося зареєструватися',
        'signup.userIdMissing': 'Користувача створено, але не вдалося отримати його ID',
        'signup.profileNotSaved': 'Акаунт створено, але профіль не збережено',
        'signup.success': 'Реєстрація успішна',
        'signup.unexpectedError': 'Сталася помилка під час реєстрації',

        'editProfile.title': 'Редагувати профіль',
        'editProfile.name': "Ім'я",
        'editProfile.email': 'Email',
        'editProfile.saveButton': 'Зберегти зміни',
        'editProfile.loading': 'Завантаження...',
        'editProfile.saving': 'Збереження...',
        'editProfile.userNotFound': 'Користувача не знайдено',
        'editProfile.enterName': "Введіть ім'я",
        'editProfile.saveFailed': 'Не вдалося зберегти профіль',
        'editProfile.unexpectedError': 'Сталася помилка під час збереження профілю',

        'notificationSettings.title': 'Налаштування сповіщень',
        'notificationSettings.sectionTitle': 'СПОВІЩЕННЯ',
        'notificationSettings.upcomingEvents': 'Майбутні події',
        'notificationSettings.upcomingEventsDescription': 'Отримуйте сповіщення перед початком подій',
        'notificationSettings.newParticipants': 'Нові учасники',
        'notificationSettings.newParticipantsDescription': 'Коли хтось приєднується до вашої події',
        'notificationSettings.eventInvitations': 'Запрошення на події',
        'notificationSettings.eventInvitationsDescription': 'Коли вас запрошують на подію',

        'security.title': 'Конфіденційність і безпека',
        'security.cardTitle': 'Налаштування безпеки',
        'security.cardDescription': 'Розширені функції безпеки скоро будуть доступні.',
        'security.changePasswordTitle': 'Змінити пароль',
        'security.changePasswordDescription': 'Встановіть новий пароль для вашого акаунта.',
        'security.newPassword': 'Новий пароль',
        'security.newPasswordPlaceholder': '••••••••',
        'security.confirmPassword': 'Підтвердьте пароль',
        'security.confirmPasswordPlaceholder': '••••••••',
        'security.savePassword': 'Зберегти новий пароль',
        'security.savingPassword': 'Збереження...',
        'security.enterPassword': 'Введіть новий пароль',
        'security.enterConfirmPassword': 'Підтвердьте новий пароль',
        'security.passwordTooShort': 'Пароль має містити щонайменше 6 символів',
        'security.passwordsDoNotMatch': 'Паролі не збігаються',
        'security.passwordChanged': 'Пароль успішно змінено',
        'security.passwordChangeFailed': 'Не вдалося змінити пароль',
        'security.passwordChangeUnexpectedError': 'Сталася помилка під час зміни пароля',
        'security.comingSoonTitle': 'Видалення акаунта',
        'security.comingSoonDescription': 'Видалення акаунта буде доступне пізніше.',

        'support.title': 'Допомога та підтримка',
        'support.cardTitle': 'Центр підтримки',
        'support.cardDescription': 'Довідкові статті та варіанти підтримки скоро будуть доступні.',
        'support.formTitle': 'Зв’язатися з підтримкою',
        'support.formDescription': 'Надішліть нам ваше запитання, проблему або відгук.',
        'support.subject': 'Тема',
        'support.subjectPlaceholder': 'Коротко опишіть проблему',
        'support.message': 'Повідомлення',
        'support.messagePlaceholder': 'Опишіть, що сталося або з чим потрібна допомога...',
        'support.sendButton': 'Надіслати звернення',
        'support.sending': 'Надсилання...',
        'support.enterSubject': 'Введіть тему',
        'support.enterMessage': 'Введіть повідомлення',
        'support.sendFailed': 'Не вдалося надіслати звернення',
        'support.sendUnexpectedError': 'Сталася помилка під час надсилання звернення',
        'support.sentSuccess': 'Ваше звернення надіслано',

        'notifications.title': 'Сповіщення',
        'notifications.emptyTitle': 'Сповіщень поки немає',
        'notifications.emptyDescription': 'Тут з’являться майбутні події та оновлення учасників.',
        'notifications.upcomingIconLabel': 'Майбутня подія',
        'notifications.joinIconLabel': 'Новий учасник',
        'notifications.startedAlready': 'Уже почалося',
        'notifications.inMinutes': 'Через {count} хв',
        'notifications.inHours': 'Через {count} годину|Через {count} годин',
        'notifications.upcomingDefault': '{title} незабаром почнеться',
        'notifications.startsInMinutes': '{title} почнеться через {count} хв',
        'notifications.startsInHours': '{title} почнеться через {count} годину|{title} почнеться через {count} годин',
        'notifications.justNow': 'Щойно',
        'notifications.minutesAgo': '{count} хв тому',
        'notifications.hoursAgo': '{count} год тому|{count} год тому',
        'notifications.daysAgo': '{count} дн тому|{count} дн тому',
        'notifications.someone': 'Хтось',
        'notifications.joinedYourEvent': '{names} приєднався до вашої події {title}|{names} приєдналися до вашої події {title}',
        'notifications.and': 'і',
        'notifications.others': 'інші',
        'notifications.inviteIconLabel': 'Запрошення на подію',
        'notifications.invitedYouToEvent': '{name} запросив вас на подію {title}',
        'notifications.acceptInvite': 'Прийняти',
        'notifications.acceptingInvite': 'Прийняття...',
        'notifications.declineInvite': 'Відхилити',
        'notifications.decliningInvite': 'Відхилення...',
        'notifications.inviteAccepted': 'Запрошення прийнято',
        'notifications.inviteDeclined': 'Запрошення відхилено',
        'notifications.inviteActionFailed': 'Не вдалося обробити запрошення',
        'notifications.inviteActionUnexpectedError': 'Сталася помилка під час обробки запрошення',

        'profile.title': 'Профіль',
        'profile.editProfile': 'Редагувати профіль',
        'profile.notificationSettings': 'Налаштування сповіщень',
        'profile.language': 'Мова',
        'profile.privacySecurity': 'Конфіденційність і безпека',
        'profile.helpSupport': 'Допомога та підтримка',
        'profile.adminMode': 'Режим адміністратора',
        'profile.logout': 'Вийти',
        'profile.loggingOut': 'Вихід...',
        'profile.loading': 'Завантаження...',
        'profile.loadingEmail': 'Завантаження email...',
        'profile.noEmail': 'Немає email',
        'profile.logoutFailed': 'Не вдалося вийти з облікового запису',
        'profile.logoutUnexpectedError': 'Сталася помилка під час виходу',

        'language.title': 'Мова',
        'language.selectedLanguage': 'Обрана мова',
        'language.back': 'Назад',
        'admin.title': 'Адмін',
        'admin.enabledTitle': 'Режим адміністратора увімкнено',
        'admin.enabledDescription': 'Для цього акаунта доступна базова зона admin mode.',
        'admin.comingSoonTitle': 'Незабаром',
        'admin.comingSoonDescription': 'Інструменти адміністрування та модерації будуть додані на наступних етапах.',
        'admin.totalUsers': 'Усього користувачів',
        'admin.totalEvents': 'Усього подій',
        'admin.futureEvents': 'Майбутні події',
        'admin.participantsCount': 'Учасники',
        'admin.pendingInvitations': 'Запрошення в очікуванні',
        'admin.supportRequests': 'Запити в підтримку',
        'admin.latestEvents': 'Останні події',
        'admin.eventsModerationTitle': 'Модерація подій',
        'admin.eventsModerationDescription': 'Переглядай події, відкривай деталі та видаляй проблемні записи.',
        'admin.futureFilter': 'Майбутні',
        'admin.pastFilter': 'Минулі',
        'admin.creatorFilterPlaceholder': 'Фільтр за автором',
        'admin.allActivityTypes': 'Усі активності',
        'admin.noModerationEvents': 'Немає подій під вибрані фільтри',
        'admin.creatorLabel': 'Автор',
        'admin.participantsLabel': 'Учасники',
        'admin.viewEventDetails': 'Відкрити подію',
        'admin.viewParticipants': 'Учасники',
        'admin.deletingEvent': 'Видалення...',
        'admin.deleteEventConfirm': 'Видалити цю подію? Дію не можна скасувати.',
        'admin.deleteEventFailed': 'Не вдалося видалити подію',
        'admin.deleteEventUnexpectedError': 'Сталася неочікувана помилка під час видалення події',
        'admin.pageOverview': 'Огляд',
        'admin.pageEvents': 'Події',
        'admin.pageSupport': '\u041f\u0456\u0434\u0442\u0440\u0438\u043c\u043a\u0430',
        'admin.pageUsers': 'Користувачі',
        'admin.usersTitle': 'Користувачі',
        'admin.userSearchPlaceholder': 'Пошук користувачів за іменем',
        'admin.noUsers': 'Немає користувачів для відображення',
        'admin.noUsersMatch': 'Нічого не знайдено',
        'admin.userProfileTitle': 'Профіль користувача',
        'admin.selectUser': 'Оберіть користувача, щоб подивитися деталі',
        'admin.saveChanges': 'Зберегти зміни',
        'admin.savingUser': 'Збереження...',
        'admin.updateUserSuccess': 'Доступ користувача оновлено',
        'admin.updateUserFailed': 'Не вдалося оновити доступ користувача',
        'admin.updateUserUnexpectedError': 'Сталася неочікувана помилка під час оновлення користувача',
        'admin.userStatusLabel': 'Статус',
        'admin.banUser': 'Забанити користувача',
        'admin.unbanUser': 'Розбанити користувача',
        'admin.banningUser': 'Блокування користувача...',
        'admin.unbanningUser': 'Розблокування користувача...',
        'admin.banUserConfirmDescription': 'Заблокувати цьому користувачу доступ до застосунку?',
        'admin.unbanUserConfirmDescription': 'Відновити цьому користувачу доступ до застосунку?',
        'admin.banUserHint': 'Забанені користувачі виходять із сесії й не можуть зайти в застосунок, поки їх не розбанять.',
        'admin.cannotBanSelf': 'Не можна забанити власний admin-акаунт',
        'admin.userBannedSuccess': 'Користувача заблоковано',
        'admin.userUnbannedSuccess': 'Користувача розблоковано',
        'admin.banUserFailed': 'Не вдалося заблокувати користувача',
        'admin.unbanUserFailed': 'Не вдалося розблокувати користувача',
        'admin.banUserUnexpectedError': 'Сталася неочікувана помилка під час блокування користувача',
        'admin.unbanUserUnexpectedError': 'Сталася неочікувана помилка під час розблокування користувача',
        'admin.activeStatus': 'Активний',
        'admin.bannedStatus': 'Заблокований',
        'admin.deleteUser': 'Видалити користувача',
        'admin.deletingUser': 'Видалення користувача...',
        'admin.deleteUserConfirm': 'Видалити цього користувача? Дію не можна скасувати.',
        'admin.deleteUserHint': 'Видалення профілю не видаляє auth.users автоматично без окремого server-side admin flow.',
        'admin.deleteUserSelfBlocked': 'Не можна видалити власний admin-акаунт',
        'admin.deleteUserHasEventsBlocked': 'Спочатку видаліть або перепризначте події, створені цим користувачем',
        'admin.deleteUserSuccess': 'Користувача видалено',
        'admin.deleteUserFailed': 'Не вдалося видалити користувача',
        'admin.deleteUserUnexpectedError': 'Сталася неочікувана помилка під час видалення користувача',
        'admin.roleLabel': 'Роль',
        'admin.roleUser': 'Користувач',
        'admin.roleAdmin': 'Адмін',
        'admin.planLabel': 'План',
        'admin.planFree': 'Free',
        'admin.planPro': 'Pro',
        'admin.unlimitedAccessLabel': 'Безлімітний доступ',
        'admin.enabled': 'Увімкнено',
        'admin.disabled': 'Вимкнено',
        'admin.readOnly': 'Лише читання',
        'admin.unavailable': 'Недоступно',
        'admin.noEvents': 'Немає подій для відображення',
        'admin.notAvailable': 'Немає даних',

        'admin.latestPendingInvitations': 'Останні запрошення в очікуванні',
        'admin.invitedBy': 'Запросив',
        'admin.noPendingInvitations': 'Немає запрошень в очікуванні',




        'admin.supportPageTitle': '\u0417\u0430\u043f\u0438\u0442\u0438 \u0432 \u043f\u0456\u0434\u0442\u0440\u0438\u043c\u043a\u0443',
        'admin.noSupportRequests': '\u0417\u0430\u043f\u0438\u0442\u0456\u0432 \u0443 \u043f\u0456\u0434\u0442\u0440\u0438\u043c\u043a\u0443 \u043f\u043e\u043a\u0438 \u043d\u0435\u043c\u0430\u0454',
        'admin.supportRequestsUnavailable': '\u0417\u0430\u043f\u0438\u0442\u0438 \u0432 \u043f\u0456\u0434\u0442\u0440\u0438\u043c\u043a\u0443 \u0437\u0430\u0440\u0430\u0437 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0456',
        'admin.supportRequestFrom': '\u0412\u0456\u0434',
        'admin.submittedAt': '\u041d\u0430\u0434\u0456\u0441\u043b\u0430\u043d\u043e',
        'admin.subjectLabel': '\u0422\u0435\u043c\u0430',
        'admin.messageLabel': '\u041f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f',
        'admin.supportStatusLabel': '\u0421\u0442\u0430\u0442\u0443\u0441',
        'admin.supportStatusNew': '\u041d\u043e\u0432\u0438\u0439',
        'admin.supportStatusInProgress': '\u0412 \u0440\u043e\u0431\u043e\u0442\u0456',
        'admin.supportStatusResolved': '\u0412\u0438\u0440\u0456\u0448\u0435\u043d\u043e',
        'admin.startTicket': '\u0412\u0437\u044f\u0442\u0438 \u0432 \u0440\u043e\u0431\u043e\u0442\u0443',
        'admin.resolveTicket': '\u041f\u043e\u0437\u043d\u0430\u0447\u0438\u0442\u0438 \u044f\u043a \u0432\u0438\u0440\u0456\u0448\u0435\u043d\u043e',
        'admin.reopenTicket': '\u0412\u0456\u0434\u043a\u0440\u0438\u0442\u0438 \u0437\u043d\u043e\u0432\u0443',
        'admin.backToNew': '\u041f\u043e\u0432\u0435\u0440\u043d\u0443\u0442\u0438 \u0432 \u043d\u043e\u0432\u0456',
        'admin.supportStatusUpdated': '\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043f\u0438\u0442\u0443 \u043e\u043d\u043e\u0432\u043b\u0435\u043d\u043e',
        'admin.supportStatusUpdateFailed': '\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u043e\u043d\u043e\u0432\u0438\u0442\u0438 \u0441\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043f\u0438\u0442\u0443',
        'admin.supportStatusUpdateUnexpectedError':
            '\u0421\u0442\u0430\u043b\u0430\u0441\u044f \u043d\u0435\u043f\u0435\u0440\u0435\u0434\u0431\u0430\u0447\u0435\u043d\u0430 \u043f\u043e\u043c\u0438\u043b\u043a\u0430 \u043f\u0456\u0434 \u0447\u0430\u0441 \u043e\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u0441\u0442\u0430\u0442\u0443\u0441\u0443 \u0437\u0430\u043f\u0438\u0442\u0443',
        'admin.supportResolvedEmailSent':
            '\u0417\u0430\u043f\u0438\u0442 \u043f\u043e\u0437\u043d\u0430\u0447\u0435\u043d\u043e \u044f\u043a \u0432\u0438\u0440\u0456\u0448\u0435\u043d\u0438\u0439, \u0430 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430 \u0441\u043f\u043e\u0432\u0456\u0449\u0435\u043d\u043e \u0435\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u044e \u043f\u043e\u0448\u0442\u043e\u044e',
        'admin.supportResolvedEmailFailed':
            '\u0417\u0430\u043f\u0438\u0442 \u043f\u043e\u0437\u043d\u0430\u0447\u0435\u043d\u043e \u044f\u043a \u0432\u0438\u0440\u0456\u0448\u0435\u043d\u0438\u0439, \u0430\u043b\u0435 email-\u0441\u043f\u043e\u0432\u0456\u0449\u0435\u043d\u043d\u044f \u043d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u043d\u0430\u0434\u0456\u0441\u043b\u0430\u0442\u0438',

        'home.discover': 'Події',
        'home.joined': 'Беру участь',
        'home.myEvents': 'Мої події',
        'home.all': 'Усі',
        'home.allCities': 'Усі міста',
        'home.cityFilterLabel': 'Місто',
        'home.citySearchPlaceholder': 'Пошук міста',
        'home.noCitiesFound': 'Міста не знайдено',
        'home.loadMore': 'Завантажити ще',
        'home.loading': 'Завантаження...',
        'home.createdBy': 'Створив',
        'home.you': 'Ти',
        'home.participant': 'учасник',
        'home.participants': 'учасників',
        'home.past': 'Минуло',
        'home.noMyEvents': 'У тебе поки немає подій',
        'home.noJoinedEvents': 'Ти поки ні до чого не приєднався',
        'home.noDiscoverEvents': 'Подій поки немає',
        'home.noEventsForFilter': 'Для цього типу активності подій не знайдено.',
        'home.noEventsForCity': 'Для цього міста подій не знайдено.',
        'home.createFirstEvent': 'Створи свою першу подію через кнопку +.',
        'home.joinedWillAppear': 'Події, до яких ти приєднаєшся, зʼявляться тут.',
        'home.noEventsFromOthers': 'Поки немає подій від інших користувачів.',
        'home.launchOverlayTitle': 'Ти серед перших користувачів Gathr',
        'home.launchOverlayText':
            'Gathr щойно відкрився. Зараз особливо важливі реальні події, активність і чесний зворотний звʼязок. Створюй зустрічі, долучайся до них і допомагай нам зробити застосунок сильнішим.',
        'home.launchOverlayButton': 'Продовжити',

        'create.title': 'Створити подію',
        'create.cancel': 'Скасувати',
        'create.eventTitle': 'Назва події',
        'create.eventTitlePlaceholder': 'Що ти плануєш?',
        'create.activityType': 'Тип активності',
        'create.description': 'Опис',
        'create.descriptionPlaceholder': 'Додай деталі про подію...',
        'create.date': 'Дата',
        'create.time': 'Час',
        'create.location': 'Локація',
        'create.locationPlaceholder': 'Де це відбудеться?',
        'create.locationApiKeyMissing': 'Відсутній Google Maps API key. Підказки адрес недоступні.',
        'create.createButton': 'Створити подію',
        'create.creating': 'Створення...',
        'create.activeEventsLimitReached': 'Безкоштовний план дозволяє мати до 3 активних подій одночасно.',
        'create.activeEventsLimitReachedPro': 'Перейдіть на Pro, щоб створювати більше активних подій.',
        'create.pastDateTime': 'Не можна створити подію в минулому',

        'edit.title': 'Редагувати подію',
        'edit.cancel': 'Скасувати',
        'edit.eventTitle': 'Назва події',
        'edit.eventTitlePlaceholder': 'Що ти плануєш?',
        'edit.activityType': 'Тип активності',
        'edit.description': 'Опис',
        'edit.descriptionPlaceholder': 'Додай деталі про подію...',
        'edit.date': 'Дата',
        'edit.time': 'Час',
        'edit.location': 'Локація',
        'edit.locationPlaceholder': 'Де це відбудеться?',
        'edit.saveButton': 'Зберегти зміни',
        'edit.saving': 'Збереження...',

        'details.back': 'Назад',
        'details.pastEvent': 'Минула подія',
        'details.noDescription': 'Опис відсутній',
        'details.dateTime': 'Дата і час',
        'details.location': 'Локація',
        'details.locationNotSpecified': 'Локація не вказана',
        'details.participants': 'Учасники',
        'details.noParticipants': 'Поки немає учасників',
        'details.you': 'Ти',
        'details.creator': 'Створювач',
        'details.leaveEvent': 'Покинути подію',
        'details.leaving': 'Вихід...',
        'details.joinEvent': 'Приєднатися',
        'details.joining': 'Приєднання...',
        'details.eventEnded': 'Ця подія вже завершилася',
        'details.editEvent': 'Редагувати подію',
        'details.deleteEvent': 'Видалити подію',
        'details.deleting': 'Видалення...',
        'details.fallbackTitle': 'Кава та коворкінг',
        'details.fallbackDescription':
            'Зустріньмось на каві й попрацюємо разом. Не забудь ноутбук!',
        'details.fallbackLocation': 'Blue Bottle, центр',
        'details.shareInviteLine': 'Приєднуйся до мене в Gathr',
        'details.shareLabelEvent': 'Подія:',
        'details.shareLabelDate': 'Дата:',
        'details.shareLabelLocation': 'Локація:',
        'details.shareOpenLink': 'Відкрити подію:',
        'details.linkCopied': 'Посилання на подію скопійовано',
        'details.copyLinkPrompt': 'Скопіюй посилання на подію:',
        'details.shareEvent': 'Поділитися',
        'details.sharing': 'Надсилання...',
        'details.eventNotResolved': 'Не вдалося визначити подію',
        'details.joinFailed': 'Не вдалося приєднатися до події',
        'details.joinUnexpectedError': 'Сталася помилка під час приєднання',
        'details.loginRequired': 'Спочатку увійди в акаунт',
        'details.leaveFailed': 'Не вдалося вийти з події',
        'details.leaveUnexpectedError': 'Сталася помилка під час виходу з події',
        'details.deleteOnlyCreator': 'Видалити подію може лише автор',
        'details.deleteConfirm': 'Видалити цю подію? Цю дію не можна скасувати.',
        'details.deleteParticipantsFailed': 'Не вдалося видалити учасників події',
        'details.deleteFailed': 'Не вдалося видалити подію',
        'details.deleteUnexpectedError': 'Сталася помилка під час видалення події',

        'participants.back': 'Назад',
        'participants.title': 'Учасники',
        'participants.loading': 'Завантаження учасників...',
        'participants.noParticipants': 'Поки немає учасників',
        'participants.eventFallback': 'Подія',
        'participants.participant': 'учасник',
        'participants.participants': 'учасників',
        'participants.you': 'Ти',
        'participants.creator': 'Створювач',
        'create.enterTitle': 'Введіть назву події',
        'create.selectDate': 'Оберіть дату',
        'create.selectTime': 'Оберіть час',
        'create.userNotAuthenticated': 'Користувач не авторизований',
        'create.invalidDateTime': 'Некоректні дата або час',
        'create.failed': 'Не вдалося створити подію',
        'create.creatorParticipantFailed': 'Подію створено, але автора не було додано до учасників',
        'create.unexpectedError': 'Сталася помилка під час створення події',
        'edit.eventNotFound': 'Не вдалося визначити подію',
        'edit.enterTitle': 'Введіть назву події',
        'edit.selectDate': 'Оберіть дату',
        'edit.selectTime': 'Оберіть час',
        'edit.invalidDateTime': 'Некоректні дата або час',
        'edit.userNotAuthenticated': 'Користувач не авторизований',
        'edit.failed': 'Не вдалося оновити подію',
        'edit.unexpectedError': 'Сталася помилка під час оновлення події',
        'edit.locationApiKeyMissing': 'Відсутній Google Maps API key. Підказки адрес недоступні.',
        'signup.confirmEmailTitle': 'Перевір пошту',
        'signup.confirmEmailMessage': 'Ми надіслали посилання для підтвердження. Підтверди email перед входом.',

        'login.forgotPassword': 'Забули пароль?',
        'login.sendingReset': 'Надсилання...',
        'login.resetEmailSent': 'Ми надіслали посилання для скидання пароля на ваш email',
        'login.resetFailed': 'Не вдалося надіслати лист для скидання пароля',
        'login.resetUnexpectedError': 'Сталася помилка під час надсилання листа для скидання пароля',
        'auth.accountBlocked': 'Ваш акаунт заблоковано',

        'resetPassword.back': 'Назад',
        'resetPassword.title': 'Новий пароль',
        'resetPassword.description': 'Введіть новий пароль нижче.',
        'resetPassword.newPassword': 'Новий пароль',
        'resetPassword.newPasswordPlaceholder': '••••••••',
        'resetPassword.confirmPassword': 'Підтвердьте пароль',
        'resetPassword.confirmPasswordPlaceholder': '••••••••',
        'resetPassword.submit': 'Зберегти новий пароль',
        'resetPassword.submitting': 'Збереження...',
        'resetPassword.enterPassword': 'Введіть новий пароль',
        'resetPassword.enterConfirmPassword': 'Підтвердьте новий пароль',
        'resetPassword.passwordTooShort': 'Пароль має містити щонайменше 6 символів',
        'resetPassword.passwordsDoNotMatch': 'Паролі не збігаються',
        'resetPassword.failed': 'Не вдалося скинути пароль',
        'resetPassword.unexpectedError': 'Сталася помилка під час скидання пароля',
        'resetPassword.success': 'Пароль успішно змінено. Увійдіть ще раз.',
        'resetPassword.restoreSessionFailed': 'Не вдалося відновити сесію',
        'resetPassword.recoverySessionMissing':
            'Сесія відновлення відсутня. Відкрийте посилання скидання пароля ще раз.',
        'inviteUsers.title': 'Запросити користувачів',
        'inviteUsers.back': 'Назад',
        'inviteUsers.inviteButton': 'Запросити',
        'inviteUsers.inviting': 'Надсилання...',
        'inviteUsers.invite': 'Запросити',
        'inviteUsers.loading': 'Завантаження користувачів...',
        'inviteUsers.empty': 'Немає користувачів для запрошення',
        'inviteUsers.sent': 'Запрошення надіслано',
        'inviteUsers.failed': 'Не вдалося надіслати запрошення',
        'inviteUsers.unexpectedError': 'Сталася помилка під час надсилання запрошення',
        'inviteUsers.invitesPerEventLimitReached': 'Безкоштовний план дозволяє надіслати до 10 запрошень на одну подію.',
        'inviteUsers.invitesPerEventLimitReachedPro': 'Перейдіть на Pro, щоб запрошувати більше людей.',
    },

    de: {
        'profile.appearance': 'Darstellung',
        'appearance.title': 'Darstellung',
        'appearance.description': 'Wähle, wie Gathr auf diesem Gerät aussehen soll.',
        'appearance.system': 'System',
        'appearance.dark': 'Dunkel',
        'appearance.light': 'Hell',
        'appearance.currentSystemDark': 'Aktuelles Systemdesign: Dunkel',
        'appearance.currentSystemLight': 'Aktuelles Systemdesign: Hell',
        'common.user': 'Benutzer',
        'common.unknown': 'Unbekannt',
        'common.guestUser': 'Gast',
        'common.event': 'Event',
        'common.dateNotSpecified': 'Datum nicht angegeben',
        'common.invalidDate': 'Ungültiges Datum',
        'common.timeNotSpecified': 'Uhrzeit nicht angegeben',
        'common.invalidTime': 'Ungültige Uhrzeit',
        'common.justNow': 'Gerade eben',
        'common.back': 'Zurück',
        'common.loading': 'Wird geladen...',
        'common.loadingSettings': 'Einstellungen werden geladen...',
        'common.loadingNotifications': 'Benachrichtigungen werden geladen...',
        'common.save': 'Speichern',
        'common.saving': 'Wird gespeichert...',
        'common.cancel': 'Abbrechen',
        'common.name': 'Name',
        'common.email': 'E-Mail',
        'common.password': 'Passwort',

        'bottomNav.home': 'Start',
        'bottomNav.notifications': 'Benachrichtigungen',
        'bottomNav.profile': 'Profil',

        'activity.sports': 'Sport',
        'activity.networking': 'Networking',
        'activity.study': 'Lernen',
        'activity.entertainment': 'Unterhaltung',
        'activity.foodDrinks': 'Essen & Trinken',
        'activity.outdoors': 'Draußen',
        'activity.tech': 'Technik',
        'activity.other': 'Andere',

        'welcome.tagline': 'Schnell. Einfach. Gemeinsam.',
        'welcome.languageChoiceTitle': 'Sprache auswählen',
        'welcome.languageChoiceDescription':
            'Wenn du zum ersten Mal hier bist, wähle die Sprache, in der du Gathr nutzen möchtest.',
        'welcome.google': 'Mit Google fortfahren',
        'welcome.login': 'Mit E-Mail fortfahren',
        'welcome.signup': 'Konto mit E-Mail erstellen',

        'login.back': 'Zurück',
        'login.title': 'Willkommen zurück',
        'login.google': 'Mit Google fortfahren',
        'login.emailDivider': 'Oder mit E-Mail fortfahren',
        'login.email': 'E-Mail',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Passwort',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Anmelden',
        'login.submitting': 'Anmeldung...',
        'login.noAccount': 'Noch kein Konto?',
        'login.signupLink': 'Registrieren',
        'login.enterEmail': 'E-Mail eingeben',
        'login.enterPassword': 'Passwort eingeben',
        'login.failed': 'Anmeldung fehlgeschlagen',
        'login.googleFailed': 'Mit Google konnte nicht fortgefahren werden',
        'login.unexpectedError': 'Beim Anmelden ist ein Fehler aufgetreten',

        'signup.back': 'Zurück',
        'signup.title': 'Konto erstellen',
        'signup.name': 'Name',
        'signup.namePlaceholder': 'Dein Name',
        'signup.email': 'E-Mail',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Passwort',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Registrieren',
        'signup.submitting': 'Registrierung...',
        'signup.haveAccount': 'Hast du bereits ein Konto?',
        'signup.loginLink': 'Anmelden',
        'signup.enterName': 'Name eingeben',
        'signup.enterEmail': 'E-Mail eingeben',
        'signup.enterPassword': 'Passwort eingeben',
        'signup.failed': 'Registrierung fehlgeschlagen',
        'signup.userIdMissing': 'Benutzer wurde erstellt, aber die Benutzer-ID konnte nicht abgerufen werden',
        'signup.profileNotSaved': 'Konto wurde erstellt, aber das Profil wurde nicht gespeichert',
        'signup.success': 'Registrierung erfolgreich',
        'signup.unexpectedError': 'Bei der Registrierung ist ein Fehler aufgetreten',

        'editProfile.title': 'Profil bearbeiten',
        'editProfile.name': 'Name',
        'editProfile.email': 'E-Mail',
        'editProfile.saveButton': 'Änderungen speichern',
        'editProfile.loading': 'Wird geladen...',
        'editProfile.saving': 'Wird gespeichert...',
        'editProfile.userNotFound': 'Benutzer nicht gefunden',
        'editProfile.enterName': 'Name eingeben',
        'editProfile.saveFailed': 'Profil konnte nicht gespeichert werden',
        'editProfile.unexpectedError': 'Beim Speichern des Profils ist ein Fehler aufgetreten',

        'notificationSettings.title': 'Benachrichtigungseinstellungen',
        'notificationSettings.sectionTitle': 'BENACHRICHTIGUNGEN',
        'notificationSettings.upcomingEvents': 'Bevorstehende Events',
        'notificationSettings.upcomingEventsDescription': 'Erhalte Benachrichtigungen vor dem Start von Events',
        'notificationSettings.newParticipants': 'Neue Teilnehmer',
        'notificationSettings.newParticipantsDescription': 'Wenn jemand deinem Event beitritt',
        'notificationSettings.eventInvitations': 'Event-Einladungen',
        'notificationSettings.eventInvitationsDescription': 'Wenn dich jemand zu einem Event einlädt',

        'security.title': 'Datenschutz und Sicherheit',
        'security.cardTitle': 'Sicherheitseinstellungen',
        'security.cardDescription': 'Erweiterte Sicherheitsfunktionen werden bald verfügbar sein.',
        'security.changePasswordTitle': 'Passwort ändern',
        'security.changePasswordDescription': 'Lege ein neues Passwort für dein Konto fest.',
        'security.newPassword': 'Neues Passwort',
        'security.newPasswordPlaceholder': '••••••••',
        'security.confirmPassword': 'Passwort bestätigen',
        'security.confirmPasswordPlaceholder': '••••••••',
        'security.savePassword': 'Neues Passwort speichern',
        'security.savingPassword': 'Wird gespeichert...',
        'security.enterPassword': 'Gib ein neues Passwort ein',
        'security.enterConfirmPassword': 'Bestätige dein neues Passwort',
        'security.passwordTooShort': 'Das Passwort muss mindestens 6 Zeichen lang sein',
        'security.passwordsDoNotMatch': 'Die Passwörter stimmen nicht überein',
        'security.passwordChanged': 'Passwort erfolgreich geändert',
        'security.passwordChangeFailed': 'Passwort konnte nicht geändert werden',
        'security.passwordChangeUnexpectedError': 'Beim Ändern des Passworts ist ein Fehler aufgetreten',
        'security.comingSoonTitle': 'Konto löschen',
        'security.comingSoonDescription': 'Das Löschen des Kontos wird später verfügbar sein.',

        'support.title': 'Hilfe und Support',
        'support.cardTitle': 'Support-Center',
        'support.cardDescription': 'Hilfsartikel und Supportoptionen werden bald verfügbar sein.',
        'support.formTitle': 'Support kontaktieren',
        'support.formDescription': 'Sende uns deine Frage, dein Problem oder dein Feedback.',
        'support.subject': 'Betreff',
        'support.subjectPlaceholder': 'Beschreibe das Problem kurz',
        'support.message': 'Nachricht',
        'support.messagePlaceholder': 'Erzähle uns, was passiert ist oder wobei du Hilfe brauchst...',
        'support.sendButton': 'Anfrage senden',
        'support.sending': 'Wird gesendet...',
        'support.enterSubject': 'Gib einen Betreff ein',
        'support.enterMessage': 'Gib eine Nachricht ein',
        'support.sendFailed': 'Support-Anfrage konnte nicht gesendet werden',
        'support.sendUnexpectedError': 'Beim Senden der Support-Anfrage ist ein Fehler aufgetreten',
        'support.sentSuccess': 'Deine Anfrage wurde gesendet',

        'notifications.title': 'Benachrichtigungen',
        'notifications.emptyTitle': 'Noch keine Benachrichtigungen',
        'notifications.emptyDescription': 'Bevorstehende Events und Teilnehmer-Updates werden hier angezeigt.',
        'notifications.upcomingIconLabel': 'Bevorstehendes Event',
        'notifications.joinIconLabel': 'Neuer Teilnehmer',
        'notifications.startedAlready': 'Bereits gestartet',
        'notifications.inMinutes': 'In {count} Min',
        'notifications.inHours': 'In {count} Stunde|In {count} Stunden',
        'notifications.upcomingDefault': '{title} steht bevor',
        'notifications.startsInMinutes': '{title} startet in {count} Min',
        'notifications.startsInHours': '{title} startet in {count} Stunde|{title} startet in {count} Stunden',
        'notifications.justNow': 'Gerade eben',
        'notifications.minutesAgo': 'Vor {count} Min',
        'notifications.hoursAgo': 'Vor {count} Stunde|Vor {count} Stunden',
        'notifications.daysAgo': 'Vor {count} Tag|Vor {count} Tagen',
        'notifications.someone': 'Jemand',
        'notifications.joinedYourEvent': '{names} ist deinem Event {title} beigetreten|{names} sind deinem Event {title} beigetreten',
        'notifications.and': 'und',
        'notifications.others': 'andere',
        'notifications.inviteIconLabel': 'Event-Einladung',
        'notifications.invitedYouToEvent': '{name} hat dich zu {title} eingeladen',
        'notifications.acceptInvite': 'Annehmen',
        'notifications.acceptingInvite': 'Wird angenommen...',
        'notifications.declineInvite': 'Ablehnen',
        'notifications.decliningInvite': 'Wird abgelehnt...',
        'notifications.inviteAccepted': 'Einladung angenommen',
        'notifications.inviteDeclined': 'Einladung abgelehnt',
        'notifications.inviteActionFailed': 'Einladung konnte nicht verarbeitet werden',
        'notifications.inviteActionUnexpectedError': 'Beim Verarbeiten der Einladung ist ein Fehler aufgetreten',

        'profile.title': 'Profil',
        'profile.editProfile': 'Profil bearbeiten',
        'profile.notificationSettings': 'Benachrichtigungseinstellungen',
        'profile.language': 'Sprache',
        'profile.privacySecurity': 'Datenschutz und Sicherheit',
        'profile.helpSupport': 'Hilfe und Support',
        'profile.adminMode': 'Admin-Modus',
        'profile.logout': 'Abmelden',
        'profile.loggingOut': 'Abmeldung...',
        'profile.loading': 'Wird geladen...',
        'profile.loadingEmail': 'E-Mail wird geladen...',
        'profile.noEmail': 'Keine E-Mail',
        'profile.logoutFailed': 'Abmeldung fehlgeschlagen',
        'profile.logoutUnexpectedError': 'Beim Abmelden ist ein Fehler aufgetreten',

        'language.title': 'Sprache',
        'language.selectedLanguage': 'Ausgewählte Sprache',
        'language.back': 'Zurück',
        'admin.title': 'Admin',
        'admin.enabledTitle': 'Admin-Modus ist aktiviert',
        'admin.enabledDescription': 'Dieses Konto hat Zugriff auf den ersten Admin-Bereich.',
        'admin.comingSoonTitle': 'Kommt bald',
        'admin.comingSoonDescription': 'Admin- und Moderationswerkzeuge werden in den nächsten Phasen hinzugefügt.',
        'admin.totalUsers': 'Benutzer gesamt',
        'admin.totalEvents': 'Events gesamt',
        'admin.futureEvents': 'Zukünftige Events',
        'admin.participantsCount': 'Teilnehmer',
        'admin.pendingInvitations': 'Offene Einladungen',
        'admin.supportRequests': 'Supportanfragen',
        'admin.latestEvents': 'Neueste Events',
        'admin.eventsModerationTitle': 'Event-Moderation',
        'admin.eventsModerationDescription': 'Prüfe Events, öffne Details und entferne problematische Einträge.',
        'admin.futureFilter': 'Zukünftig',
        'admin.pastFilter': 'Vergangen',
        'admin.creatorFilterPlaceholder': 'Nach Ersteller filtern',
        'admin.allActivityTypes': 'Alle Aktivitäten',
        'admin.noModerationEvents': 'Keine Events entsprechen den ausgewählten Filtern',
        'admin.creatorLabel': 'Ersteller',
        'admin.participantsLabel': 'Teilnehmer',
        'admin.viewEventDetails': 'Event öffnen',
        'admin.viewParticipants': 'Teilnehmer',
        'admin.deletingEvent': 'Wird gelöscht...',
        'admin.deleteEventConfirm': 'Dieses Event löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        'admin.deleteEventFailed': 'Event konnte nicht gelöscht werden',
        'admin.deleteEventUnexpectedError': 'Beim Löschen des Events ist ein unerwarteter Fehler aufgetreten',
        'admin.pageOverview': 'Übersicht',
        'admin.pageSupport': 'Support',
        'admin.pageEvents': 'Events',
        'admin.pageUsers': 'Benutzer',
        'admin.usersTitle': 'Benutzer',
        'admin.userSearchPlaceholder': 'Benutzer nach Namen suchen',
        'admin.noUsers': 'Keine Benutzer zum Anzeigen',
        'admin.noUsersMatch': 'Keine Benutzer gefunden',
        'admin.userProfileTitle': 'Benutzerprofil',
        'admin.selectUser': 'Wähle einen Benutzer aus, um Details zu sehen',
        'admin.saveChanges': 'Änderungen speichern',
        'admin.savingUser': 'Wird gespeichert...',
        'admin.updateUserSuccess': 'Benutzerzugriff aktualisiert',
        'admin.updateUserFailed': 'Benutzerzugriff konnte nicht aktualisiert werden',
        'admin.updateUserUnexpectedError': 'Beim Aktualisieren des Benutzers ist ein unerwarteter Fehler aufgetreten',
        'admin.userStatusLabel': 'Status',
        'admin.banUser': 'Benutzer sperren',
        'admin.unbanUser': 'Benutzer entsperren',
        'admin.banningUser': 'Benutzer wird gesperrt...',
        'admin.unbanningUser': 'Benutzer wird entsperrt...',
        'admin.banUserConfirmDescription': 'Diesen Benutzer vom Zugriff auf die App ausschließen?',
        'admin.unbanUserConfirmDescription': 'Den Zugriff für diesen Benutzer wieder freigeben?',
        'admin.banUserHint': 'Gesperrte Benutzer werden abgemeldet und können die App erst nach dem Entsperren wieder nutzen.',
        'admin.cannotBanSelf': 'Du kannst dein eigenes Admin-Konto nicht sperren',
        'admin.userBannedSuccess': 'Benutzer wurde gesperrt',
        'admin.userUnbannedSuccess': 'Benutzer wurde entsperrt',
        'admin.banUserFailed': 'Benutzer konnte nicht gesperrt werden',
        'admin.unbanUserFailed': 'Benutzer konnte nicht entsperrt werden',
        'admin.banUserUnexpectedError': 'Beim Sperren des Benutzers ist ein unerwarteter Fehler aufgetreten',
        'admin.unbanUserUnexpectedError': 'Beim Entsperren des Benutzers ist ein unerwarteter Fehler aufgetreten',
        'admin.activeStatus': 'Aktiv',
        'admin.bannedStatus': 'Gesperrt',
        'admin.deleteUser': 'Benutzer löschen',
        'admin.deletingUser': 'Benutzer wird gelöscht...',
        'admin.deleteUserConfirm': 'Diesen Benutzer löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        'admin.deleteUserHint': 'Das Löschen des Profils entfernt auth.users nicht automatisch ohne einen separaten serverseitigen Admin-Flow.',
        'admin.deleteUserSelfBlocked': 'Du kannst dein eigenes Admin-Konto nicht löschen',
        'admin.deleteUserHasEventsBlocked': 'Lösche oder übertrage zuerst die von diesem Benutzer erstellten Events',
        'admin.deleteUserSuccess': 'Benutzer gelöscht',
        'admin.deleteUserFailed': 'Benutzer konnte nicht gelöscht werden',
        'admin.deleteUserUnexpectedError': 'Beim Löschen des Benutzers ist ein unerwarteter Fehler aufgetreten',
        'admin.roleLabel': 'Rolle',
        'admin.roleUser': 'Benutzer',
        'admin.roleAdmin': 'Admin',
        'admin.planLabel': 'Plan',
        'admin.planFree': 'Free',
        'admin.planPro': 'Pro',
        'admin.unlimitedAccessLabel': 'Unbegrenzter Zugriff',
        'admin.enabled': 'Aktiv',
        'admin.disabled': 'Inaktiv',
        'admin.readOnly': 'Nur lesen',
        'admin.unavailable': 'Nicht verfügbar',
        'admin.noEvents': 'Keine Events zum Anzeigen',
        'admin.notAvailable': 'Nicht verfügbar',

        'admin.latestPendingInvitations': 'Neueste offene Einladungen',
        'admin.invitedBy': 'Eingeladen von',
        'admin.noPendingInvitations': 'Keine offenen Einladungen',




        'admin.supportPageTitle': 'Supportanfragen',
        'admin.noSupportRequests': 'Noch keine Supportanfragen',
        'admin.supportRequestsUnavailable': 'Supportanfragen sind aktuell nicht verf?gbar',
        'admin.supportRequestFrom': 'Von',
        'admin.submittedAt': 'Gesendet am',
        'admin.subjectLabel': 'Betreff',
        'admin.messageLabel': 'Nachricht',
        'admin.supportStatusLabel': 'Status',
        'admin.supportStatusNew': 'Neu',
        'admin.supportStatusInProgress': 'In Bearbeitung',
        'admin.supportStatusResolved': 'Geloest',
        'admin.startTicket': 'Starten',
        'admin.resolveTicket': 'Loesen',
        'admin.reopenTicket': 'Erneut oeffnen',
        'admin.backToNew': 'Zurueck zu neu',
        'admin.supportStatusUpdated': 'Der Status der Anfrage wurde aktualisiert',
        'admin.supportStatusUpdateFailed': 'Der Status der Anfrage konnte nicht aktualisiert werden',
        'admin.supportStatusUpdateUnexpectedError':
            'Beim Aktualisieren des Status der Anfrage ist ein unerwarteter Fehler aufgetreten',
        'admin.supportResolvedEmailSent':
            'Das Ticket wurde als geloest markiert und der Nutzer wurde per E-Mail benachrichtigt',
        'admin.supportResolvedEmailFailed':
            'Das Ticket wurde als geloest markiert, aber die E-Mail-Benachrichtigung konnte nicht gesendet werden',

        'home.discover': 'Entdecken',
        'home.joined': 'Beigetreten',
        'home.myEvents': 'Meine Events',
        'home.all': 'Alle',
        'home.allCities': 'Alle Städte',
        'home.cityFilterLabel': 'Stadt',
        'home.citySearchPlaceholder': 'Stadt suchen',
        'home.noCitiesFound': 'Keine Städte gefunden',
        'home.loadMore': 'Mehr laden',
        'home.loading': 'Wird geladen...',
        'home.createdBy': 'Erstellt von',
        'home.you': 'Du',
        'home.participant': 'Teilnehmer',
        'home.participants': 'Teilnehmer',
        'home.past': 'Vergangen',
        'home.noMyEvents': 'Du hast noch keine Events',
        'home.noJoinedEvents': 'Du bist noch keinem Event beigetreten',
        'home.noDiscoverEvents': 'Noch keine Events vorhanden',
        'home.noEventsForFilter': 'Für diesen Aktivitätstyp wurden keine Events gefunden.',
        'home.noEventsForCity': 'Für diese Stadt wurden keine Events gefunden.',
        'home.createFirstEvent': 'Erstelle dein erstes Event mit der + Taste.',
        'home.joinedWillAppear': 'Events, denen du beitrittst, erscheinen hier.',
        'home.noEventsFromOthers': 'Es gibt noch keine Events von anderen Nutzern.',
        'home.launchOverlayTitle': 'Du gehörst zu den ersten Gathr-Nutzern',
        'home.launchOverlayText':
            'Gathr ist gerade gestartet. Echte Events, Aktivität und ehrliches Feedback sind jetzt besonders wichtig. Erstelle Treffen, nimm daran teil und hilf uns, die App stärker zu machen.',
        'home.launchOverlayButton': 'Weiter',

        'create.title': 'Event erstellen',
        'create.cancel': 'Abbrechen',
        'create.eventTitle': 'Eventtitel',
        'create.eventTitlePlaceholder': 'Was planst du?',
        'create.activityType': 'Aktivitätstyp',
        'create.description': 'Beschreibung',
        'create.descriptionPlaceholder': 'Füge Details zu deinem Event hinzu...',
        'create.date': 'Datum',
        'create.time': 'Uhrzeit',
        'create.location': 'Ort',
        'create.locationPlaceholder': 'Wo findet es statt?',
        'create.locationApiKeyMissing': 'Der Google Maps API key fehlt. Adressvorschläge sind nicht verfügbar.',
        'create.createButton': 'Event erstellen',
        'create.creating': 'Wird erstellt...',
        'create.enterTitle': 'Gib einen Eventtitel ein',
        'create.selectDate': 'Wähle ein Datum',
        'create.selectTime': 'Wähle eine Uhrzeit',
        'create.userNotAuthenticated': 'Benutzer ist nicht angemeldet',
        'create.invalidDateTime': 'Ungültiges Datum oder ungültige Uhrzeit',
        'create.failed': 'Event konnte nicht erstellt werden',
        'create.creatorParticipantFailed': 'Das Event wurde erstellt, aber der Ersteller wurde nicht als Teilnehmer hinzugefügt',
        'create.unexpectedError': 'Beim Erstellen des Events ist ein Fehler aufgetreten',
        'create.activeEventsLimitReached': 'Im kostenlosen Tarif sind bis zu 3 aktive Events gleichzeitig möglich.',
        'create.activeEventsLimitReachedPro': 'Wechsle zu Pro, um mehr aktive Events zu erstellen.',
        'create.pastDateTime': 'Du kannst kein Event in der Vergangenheit erstellen',

        'edit.title': 'Event bearbeiten',
        'edit.cancel': 'Abbrechen',
        'edit.eventTitle': 'Eventtitel',
        'edit.eventTitlePlaceholder': 'Was planst du?',
        'edit.activityType': 'Aktivitätstyp',
        'edit.description': 'Beschreibung',
        'edit.descriptionPlaceholder': 'Füge Details zu deinem Event hinzu...',
        'edit.date': 'Datum',
        'edit.time': 'Uhrzeit',
        'edit.location': 'Ort',
        'edit.locationPlaceholder': 'Wo findet es statt?',
        'edit.saveButton': 'Änderungen speichern',
        'edit.saving': 'Wird gespeichert...',

        'details.back': 'Zurück',
        'details.pastEvent': 'Vergangenes Event',
        'details.noDescription': 'Keine Beschreibung vorhanden',
        'details.dateTime': 'Datum & Uhrzeit',
        'details.location': 'Ort',
        'details.locationNotSpecified': 'Ort nicht angegeben',
        'details.participants': 'Teilnehmer',
        'details.noParticipants': 'Noch keine Teilnehmer',
        'details.you': 'Du',
        'details.creator': 'Ersteller',
        'details.leaveEvent': 'Event verlassen',
        'details.leaving': 'Wird verlassen...',
        'details.joinEvent': 'Event beitreten',
        'details.joining': 'Wird beigetreten...',
        'details.eventEnded': 'Dieses Event ist bereits beendet',
        'details.editEvent': 'Event bearbeiten',
        'details.deleteEvent': 'Event löschen',
        'details.deleting': 'Wird gelöscht...',
        'details.fallbackTitle': 'Kaffee & Coworking',
        'details.fallbackDescription':
            'Lass uns Kaffee trinken und zusammen arbeiten. Nimm deinen Laptop mit!',
        'details.fallbackLocation': 'Blue Bottle, Innenstadt',
        'details.shareInviteLine': 'Mach mit bei Gathr',
        'details.shareLabelEvent': 'Event:',
        'details.shareLabelDate': 'Datum:',
        'details.shareLabelLocation': 'Ort:',
        'details.shareOpenLink': 'Event öffnen:',
        'details.linkCopied': 'Event-Link kopiert',
        'details.copyLinkPrompt': 'Event-Link kopieren:',
        'details.shareEvent': 'Event teilen',
        'details.sharing': 'Wird geteilt...',
        'details.eventNotResolved': 'Event konnte nicht ermittelt werden',
        'details.joinFailed': 'Beitritt zum Event fehlgeschlagen',
        'details.joinUnexpectedError': 'Beim Beitreten ist ein Fehler aufgetreten',
        'details.loginRequired': 'Bitte zuerst anmelden',
        'details.leaveFailed': 'Event konnte nicht verlassen werden',
        'details.leaveUnexpectedError': 'Beim Verlassen ist ein Fehler aufgetreten',
        'details.deleteOnlyCreator': 'Nur der Ersteller kann dieses Event löschen',
        'details.deleteConfirm': 'Dieses Event löschen? Das kann nicht rückgängig gemacht werden.',
        'details.deleteParticipantsFailed': 'Teilnehmer des Events konnten nicht entfernt werden',
        'details.deleteFailed': 'Event konnte nicht gelöscht werden',
        'details.deleteUnexpectedError': 'Beim Löschen ist ein Fehler aufgetreten',

        'participants.back': 'Zurück',
        'participants.title': 'Teilnehmer',
        'participants.loading': 'Teilnehmer werden geladen...',
        'participants.noParticipants': 'Noch keine Teilnehmer',
        'participants.eventFallback': 'Event',
        'participants.participant': 'Teilnehmer',
        'participants.participants': 'Teilnehmer',
        'participants.you': 'Du',
        'participants.creator': 'Ersteller',

        'edit.eventNotFound': 'Event konnte nicht bestimmt werden',
        'edit.enterTitle': 'Gib einen Eventtitel ein',
        'edit.selectDate': 'Wähle ein Datum',
        'edit.selectTime': 'Wähle eine Uhrzeit',
        'edit.invalidDateTime': 'Ungültiges Datum oder ungültige Uhrzeit',
        'edit.userNotAuthenticated': 'Benutzer ist nicht angemeldet',
        'edit.failed': 'Event konnte nicht aktualisiert werden',
        'edit.unexpectedError': 'Beim Aktualisieren des Events ist ein Fehler aufgetreten',
        'edit.locationApiKeyMissing': 'Der Google Maps API key fehlt. Adressvorschläge sind nicht verfügbar.',
        'signup.confirmEmailTitle': 'Prüfe deine E-Mails',
        'signup.confirmEmailMessage': 'Wir haben dir einen Bestätigungslink gesendet. Bitte bestätige deine E-Mail vor dem Anmelden.',

        'login.forgotPassword': 'Passwort vergessen?',
        'login.sendingReset': 'Wird gesendet...',
        'login.resetEmailSent': 'Wir haben dir einen Link zum Zurücksetzen des Passworts per E-Mail gesendet',
        'login.resetFailed': 'E-Mail zum Zurücksetzen des Passworts konnte nicht gesendet werden',
        'login.resetUnexpectedError': 'Beim Senden der E-Mail zum Zurücksetzen des Passworts ist ein Fehler aufgetreten',
        'auth.accountBlocked': 'Dein Konto wurde gesperrt',

        'resetPassword.back': 'Zurück',
        'resetPassword.title': 'Neues Passwort',
        'resetPassword.description': 'Gib unten dein neues Passwort ein.',
        'resetPassword.newPassword': 'Neues Passwort',
        'resetPassword.newPasswordPlaceholder': '••••••••',
        'resetPassword.confirmPassword': 'Passwort bestätigen',
        'resetPassword.confirmPasswordPlaceholder': '••••••••',
        'resetPassword.submit': 'Neues Passwort speichern',
        'resetPassword.submitting': 'Wird gespeichert...',
        'resetPassword.enterPassword': 'Gib ein neues Passwort ein',
        'resetPassword.enterConfirmPassword': 'Bestätige dein neues Passwort',
        'resetPassword.passwordTooShort': 'Das Passwort muss mindestens 6 Zeichen lang sein',
        'resetPassword.passwordsDoNotMatch': 'Die Passwörter stimmen nicht überein',
        'resetPassword.failed': 'Passwort konnte nicht zurückgesetzt werden',
        'resetPassword.unexpectedError': 'Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten',
        'resetPassword.success': 'Passwort erfolgreich geändert. Bitte melde dich erneut an.',
        'resetPassword.restoreSessionFailed': 'Sitzung konnte nicht wiederhergestellt werden',
        'resetPassword.recoverySessionMissing':
            'Wiederherstellungssitzung fehlt. Öffne den Passwort-Zurücksetzen-Link erneut.',

        'inviteUsers.title': 'Benutzer einladen',
        'inviteUsers.back': 'Zurück',
        'inviteUsers.inviteButton': 'Einladen',
        'inviteUsers.inviting': 'Wird gesendet...',
        'inviteUsers.invite': 'Einladen',
        'inviteUsers.loading': 'Benutzer werden geladen...',
        'inviteUsers.empty': 'Keine Benutzer zum Einladen verfügbar',
        'inviteUsers.sent': 'Einladung gesendet',
        'inviteUsers.failed': 'Einladung konnte nicht gesendet werden',
        'inviteUsers.unexpectedError': 'Beim Senden der Einladung ist ein Fehler aufgetreten',
        'inviteUsers.invitesPerEventLimitReached': 'Im kostenlosen Tarif sind bis zu 10 Einladungen pro Event möglich.',
        'inviteUsers.invitesPerEventLimitReachedPro': 'Wechsle zu Pro, um mehr Personen einzuladen.',
    },
};

export const t = (language: LanguageCode, key: TranslationKey) => {
    return translations[language][key] || translations.en[key] || key;
};
