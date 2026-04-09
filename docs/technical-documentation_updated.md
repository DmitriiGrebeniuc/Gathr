# Gathr - Technical Documentation

## 1. Purpose

Gathr is a mobile-first event coordination application built as a React single-page application with Supabase as the backend platform and Capacitor as the Android delivery layer.

The product currently enables users to:
- browse events
- create events
- edit their own events
- join and leave events
- view participants
- invite users into events
- receive event-related notifications
- manage profile, language, security, and notification settings
- submit support requests

## 2. Technology Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Supabase
  - authentication
  - PostgreSQL database access
  - realtime subscriptions

### Mobile packaging
- Capacitor
- Android

### UI and styling
- Tailwind CSS 4
- motion
- Radix UI
- Material UI
- custom product components

### Maps and location
- Google Maps integration through `@react-google-maps/api`

## 3. Repository Structure

```text
src/
  app/
    components/
    constants/
    context/
    App.tsx
  lib/
    language.ts
    supabase.ts
  styles/
  main.tsx
```

Important product screens:
- `WelcomeScreen`
- `LoginScreen`
- `SignUpScreen`
- `ResetPasswordScreen`
- `HomeScreen`
- `CreateEventScreen`
- `EditEventScreen`
- `EventDetailsScreen`
- `ParticipantsScreen`
- `InviteUsersScreen`
- `NotificationsScreen`
- `ProfileScreen`
- `EditProfileScreen`
- `NotificationSettingsScreen`
- `SecurityScreen`
- `SupportScreen`
- `LanguageScreen`

## 4. Application Entry Point

`src/main.tsx`:
- initializes React root
- imports global styles
- wraps the app in `LanguageProvider`
- renders `App`

## 5. Application Shell Architecture

`src/app/App.tsx` uses screen-state navigation instead of route-based navigation.

Key state:
- `currentScreen`
- `selectedEvent`
- `direction`
- `history`
- `authChecked`

Supported screens:
- `welcome`
- `login`
- `signup`
- `reset-password`
- `home`
- `create-event`
- `edit-event`
- `event-details`
- `participants`
- `invite-users`
- `notifications`
- `profile`
- `edit-profile`
- `notification-settings`
- `security`
- `support`
- `language`

## 6. Authentication Architecture

Implemented auth flows:
- sign up
- login
- logout
- forgot password email request
- password recovery reset flow
- authenticated password change

## 7. Localization Architecture

Implemented through:
- `languages.ts`
- `translations.ts`
- `language.ts`
- `LanguageContext.tsx`

Supported languages:
- `en`
- `ru`
- `ro`
- `uk`
- `de`

## 8. Domain Model

Active backend entities:
- `profiles`
- `events`
- `participants`
- `notification_settings`
- `support_requests`
- `event_invitations`

Profile entitlement fields:
- `role`
- `plan`
- `has_unlimited_access`

## 9. Home Module

`HomeScreen.tsx` responsibilities:
- load and display events
- discover/joined/my segmentation
- activity filtering
- pagination
- pull-to-refresh
- realtime refresh
- navigation to event details and create flow

## 10. Event Creation Module

`CreateEventScreen.tsx` responsibilities:
- collect event input
- validate required fields
- resolve location through autocomplete and map picker
- prevent creating events in the past
- enforce active-event limits by plan unless unlimited
- create event
- add creator to participants

## 11. Event Editing Module

`EditEventScreen.tsx`:
- preload existing event data
- allow editing
- update only if creator matches current user

## 12. Event Details Module

`EventDetailsScreen.tsx`:
- load current event snapshot
- load participants
- determine current user relationship to event
- support join/leave
- support creator edit/delete
- show map
- react to realtime changes

## 13. Participants Module

`ParticipantsScreen.tsx`:
- load participants
- mark current user
- mark creator
- open invitation flow for creators
- react to participant updates

## 14. Invitation Module

Implemented across:
- `InviteUsersScreen.tsx`
- `NotificationsScreen.tsx`

Invitation sending:
- excludes creator
- excludes current participants
- excludes already pending/accepted invitees
- enforces invitations-per-event limit unless unlimited
- inserts into `event_invitations`

Invitation response:
- accept: mark invitation accepted, insert into participants
- decline: mark invitation declined

Current note:
- accept flow is not transactional yet

## 15. Notifications Module

`NotificationsScreen.tsx` currently supports:
- upcoming notifications
- join notifications
- invite notifications

Notification settings respected:
- `notify_upcoming_events`
- `notify_new_participants`
- `notify_event_invitations`

Realtime subscriptions:
- `participants`
- `events`
- `event_invitations`

## 16. Support Module

`SupportScreen.tsx`:
- validates subject/message
- resolves current user
- inserts into `support_requests`
- clears form after success

## 17. Security Module

Implemented in:
- `SecurityScreen.tsx`
- `ResetPasswordScreen.tsx`

Current behavior:
- authenticated password change
- password recovery reset flow

## 18. Profile Module

`ProfileScreen.tsx` and `EditProfileScreen.tsx`:
- load current user
- load profile name
- render account identity
- provide access to settings and logout
- update profile name

## 19. Plan and Limit Layer

Relevant profile fields:
- `role`
- `plan`
- `has_unlimited_access`

Shared plan limits are expected in:
- `src/app/constants/planLimits.ts`

Currently enforced client-side limits:
- active future events
- invitations per event

## 20. Realtime Architecture

Observed subscriptions:
- Home: `events`, `participants`
- Event Details: `participants`, current event row
- Participants: `participants`
- Notifications: `participants`, `events`, `event_invitations`

## 21. Mobile and Platform Integration

Capacitor configuration:
- `appId`: `com.gathr.app`
- `appName`: `Gathr`
- `webDir`: `dist`

Android project is present in the repository.

## 22. Current Technical Risks

- custom navigation scalability
- UI/data coupling
- broad navigation payload typing
- translation catalog growth
- realtime refetch cost
- client-side limit enforcement
- invitation accept flow is not transactional

## 23. Recommended Future Direction

- stronger domain typing
- service extraction
- split translations by domain
- replace alert-based feedback
- move critical flows into RPC/server-side logic
- add admin-only surfaces
- formalize server-side plan enforcement
