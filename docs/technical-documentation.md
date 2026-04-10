# Gathr - Technical Documentation

## 1. Purpose

Gathr is a mobile-first event coordination application built as a React single-page application with Supabase as the backend platform and Capacitor as the Android delivery layer.

The product currently enables users to:
- browse public events
- create events
- edit their own events
- join and leave events
- view participants
- invite users into events
- receive event-related notifications
- manage profile, language, security, and notification settings
- submit support requests
- open shared events through `/event/:id`

The current implementation targets MVP delivery with a mobile-like user experience on web and Android.

---

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
- custom UI primitives

### Maps and location
- Google Maps integration through `@react-google-maps/api`

---

## 3. Repository Structure

## 3.1 Root structure

```text
android/
docs/
guidelines/
src/
.gitignore
ATTRIBUTIONS.md
README.md
capacitor.config.json
index.html
package-lock.json
package.json
pnpm-workspace.yaml
postcss.config.mjs
vite.config.ts
```

## 3.2 Source structure

```text
src/
  app/
    auth/
    components/
    constants/
    context/
    App.tsx
  lib/
    language.ts
    supabase.ts
  styles/
  main.tsx
  vite-env.d.ts
```

## 3.3 App layer structure

```text
src/app/components/
  BottomNav.tsx
  CreateEventScreen.tsx
  EditEventScreen.tsx
  EditProfileScreen.tsx
  EventDetailsScreen.tsx
  EventLocationMap.tsx
  HomeScreen.tsx
  InviteUsersScreen.tsx
  LanguageScreen.tsx
  LoadingLogo.tsx
  LocationAutocomplete.tsx
  LoginScreen.tsx
  NotificationSettingsScreen.tsx
  NotificationsScreen.tsx
  ParticipantsScreen.tsx
  ProfileScreen.tsx
  PullToRefresh.tsx
  ResetPasswordScreen.tsx
  ScreenTransition.tsx
  SecurityScreen.tsx
  SignUpScreen.tsx
  SupportScreen.tsx
  SwipeableScreen.tsx
  TouchButton.tsx
  WelcomeScreen.tsx
```

---

## 4. Application Entry Point

The application entry point is `src/main.tsx`.

Responsibilities:
- initialize React root
- import global styles
- wrap the app in the global `LanguageProvider`
- render the main application shell

This establishes language state as a top-level concern available throughout the application.

---

## 5. Application Shell Architecture

The root UI shell is implemented in `src/app/App.tsx`.

The application does not currently use route-based navigation as the primary navigation model. Instead, it uses a screen-state architecture driven by React state:

- `currentScreen`
- `selectedEvent`
- `direction`
- `history`
- `authChecked`
- pending auth-return state

This design provides a native-app-like flow inside a single-page application.

### 5.1 Screen model

The root shell switches between screens based on `currentScreen`.

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

### 5.2 Navigation model

Navigation is handled by a custom `handleNavigate(screen, data?, customDirection?)` function.

The transition direction model supports:
- `forward`
- `back`
- `up`
- `down`

The shell also maintains an internal screen history stack to determine reverse navigation behavior.

### 5.3 Shared event entry

The shell also contains a narrow deep-link entry path:
- `/event/:eventId`

If a shared event ID is present in the URL:
- `App.tsx` resolves the event through Supabase
- the shell opens `event-details`
- the selected event payload is initialized with `backTarget: 'home'`

### 5.4 Bottom navigation

Bottom navigation is shown only on the primary sections:
- `home`
- `notifications`
- `profile`

### 5.5 Mobile shell container

The main shell renders inside a centered mobile-like viewport container with:
- `height: 100dvh`
- `maxWidth: 390px`
- `maxHeight: 844px`

---

## 6. Authentication Architecture

Authentication is managed through Supabase Auth.

### 6.1 Session bootstrap

On application startup, `App.tsx` checks the current auth session using:
- `supabase.auth.getSession()`

Behavior:
- if a valid session exists, the shell opens `home`
- if no session exists, the shell opens `welcome`
- if session check fails, the shell falls back to `welcome`

The shell also checks:
- password recovery tokens in the URL
- shared event path state

If recovery tokens are present:
- Supabase session is restored
- the shell opens `reset-password`

### 6.2 Auth state synchronization

The root shell subscribes to:
- `supabase.auth.onAuthStateChange(...)`

Behavior:
- login transitions the application to `home`
- logout transitions the application to `welcome`

If a guarded action stored post-login intent:
- login transitions the application to the intended screen
- the screen receives optional `authAction` payload

### 6.3 Guarded join flow

When an unauthenticated user tries to join an event from `EventDetailsScreen.tsx`:
- the app navigates to `login`
- a return payload is stored
- after login, the shell returns to `event-details`
- the details screen may auto-run the pending join action

### 6.4 Logout flow

`ProfileScreen.tsx` performs logout with:
- `supabase.auth.signOut()`

After successful logout, the application navigates back to `welcome`.

---

## 7. Backend Integration

Supabase client initialization is defined in `src/lib/supabase.ts`.

Required environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

These variables are required for:
- authentication
- event loading
- participants loading
- profile loading
- notifications
- realtime subscriptions

---

## 8. Localization Architecture

Localization is implemented as a dedicated application-level subsystem.

Supported languages:
- `ru`
- `en`
- `ro`
- `uk`
- `de`

Default language:
- `en`

Language preference is persisted in browser storage through `src/lib/language.ts`.

Storage key:
- `gathr-language`

---

## 9. Domain Model

Based on the current application implementation, the following backend entities are actively used.

## 9.1 Profiles

Observed fields:
- `id`
- `name`
- `plan`
- `has_unlimited_access`

## 9.2 Events

Observed fields:
- `id`
- `title`
- `description`
- `date_time`
- `location`
- `location_place_id`
- `location_lat`
- `location_lng`
- `activity_type`
- `creator_id`

## 9.3 Participants

Observed fields:
- `id`
- `event_id`
- `user_id`
- `created_at`

## 9.4 Notification settings

Observed fields:
- `user_id`
- `notify_upcoming_events`
- `notify_new_participants`
- `notify_event_invitations`

## 9.5 Support requests

Observed fields:
- `user_id`
- `subject`
- `message`

## 9.6 Event invitations

Observed fields:
- `id`
- `event_id`
- `inviter_id`
- `invitee_id`
- `status`
- `created_at`
- `responded_at`

---

## 10. Home Module

The home feed is implemented in `src/app/components/HomeScreen.tsx`.

Main responsibilities:
- load and display events
- split feed into logical tabs
- apply activity filters
- support local pagination
- support server-side incremental loading
- react to realtime updates
- navigate to event details
- provide entry point to event creation

Realtime subscriptions:
- changes in `events`
- changes in `participants`

---

## 11. Event Creation Module

Event creation is implemented in `src/app/components/CreateEventScreen.tsx`.

Responsibilities:
- collect event input
- validate required fields
- resolve location through autocomplete and map picker
- prevent creating events in the past
- enforce active future event limits by plan unless unlimited
- create a new event in the backend
- automatically add the creator to `participants`
- open the newly created event details view

---

## 12. Event Editing Module

Event editing is implemented in `src/app/components/EditEventScreen.tsx`.

Responsibilities:
- preload current event data
- allow editing of title, description, time, location, and activity type
- update the event in the backend
- return to the updated event details screen

---

## 13. Event Details Module

Event details are implemented in `src/app/components/EventDetailsScreen.tsx`.

Responsibilities:
- load the latest event snapshot
- load participant list
- determine current user relation to event
- support joining and leaving
- support creator actions
- render event location map
- expose participants view
- support sharing through `/event/:id`
- react to realtime changes

Realtime subscriptions:
- changes in `participants`
- changes in the current event row

Shared event and auth-return behavior:
- the screen can open from the shared event path
- unauthenticated join attempts redirect to login
- after login, the screen may auto-run the pending join action

---

## 14. Participants and Invitation Modules

Participants are implemented in `src/app/components/ParticipantsScreen.tsx`.

Responsibilities:
- load participants
- mark current user
- mark creator
- open invitation flow for creators
- react to participant updates

Invitations are implemented in `src/app/components/InviteUsersScreen.tsx`.

Responsibilities:
- load invite candidates from `profiles`
- exclude creator, participants, and already pending or accepted invitees
- enforce invitations-per-event limit unless unlimited
- insert rows into `event_invitations`

---

## 15. Notifications Module

Notifications are implemented in `src/app/components/NotificationsScreen.tsx`.

The current implementation supports three generated notification types:
- `upcoming`
- `join`
- `invite`

Notification settings respected:
- `notify_upcoming_events`
- `notify_new_participants`
- `notify_event_invitations`

Realtime subscriptions:
- `participants`
- `events`
- `event_invitations`

---

## 16. Profile and Settings Modules

Profile is implemented in `src/app/components/ProfileScreen.tsx`.

The profile area provides access to:
- `edit-profile`
- `notification-settings`
- `language`
- `security`
- `support`

`EditProfileScreen.tsx` updates the profile name through `profiles`.

`NotificationSettingsScreen.tsx` updates notification preferences through `notification_settings`.

`SecurityScreen.tsx` supports authenticated password change.

`SupportScreen.tsx` validates input and inserts support messages into `support_requests`.

---

## 17. Realtime Architecture

Observed subscriptions:

### Home
- `events`
- `participants`

### Event Details
- `participants`
- current event row in `events`

### Participants
- `participants`

### Notifications
- `participants`
- `events`
- `event_invitations`

The UI is designed to remain responsive to backend changes without full manual reload.

---

## 18. UX and Interaction Patterns

Observed interaction patterns:
- animated screen transitions
- drag-down dismissal for create event
- swipe-back interaction in detail-style screens
- bottom tab navigation for primary sections
- pull-to-refresh on home
- full-screen mobile shell layout

---

## 19. Current Functional Scope

### Authentication
- sign up
- log in
- password reset email request
- password recovery reset flow
- persistent session
- log out

### Profile
- load profile data
- edit profile name
- change language
- manage notification preferences
- change password
- send support requests

### Events
- browse events
- filter by activity type
- switch between discover/joined/my feeds
- open event details
- create new event
- edit own event
- delete own event
- join event
- leave event
- share event through `/event/:id`
- view participants
- invite users
- view map location

### Notifications
- view upcoming joined events
- view new participants on owned events
- view pending invitations
- accept or decline invitations
- honor notification settings

### Localization
- support for five languages
- persisted language selection

### Android delivery
- Capacitor configuration
- Android project present in repository

---

## 20. Operational Constraints and Technical Risks

### Navigation scalability
The custom screen-state navigation model is effective for MVP speed, but it will become harder to maintain as the number of screens and flows grows.

Potential future challenges:
- broader deep linking beyond the current shared-event entry path
- browser history behavior
- Android back button consistency
- route-level testing
- external navigation integration

### Mixed component responsibility
`src/app/components/` currently contains both screen-level components and shared UI pieces.

### Type safety
Several navigation payloads currently use broad `any`-style data passing.

### Translation catalog growth
The translation file is large and should later be split by domain.

### Realtime refresh cost
Some screens refetch whole datasets after each relevant realtime event.

---

## 21. Recommended Future Structure

For long-term maintainability, the project can later evolve toward a feature-based structure such as:

```text
src/
  app/
  features/
    auth/
    events/
    notifications/
    profile/
    localization/
  shared/
    ui/
    lib/
    types/
    hooks/
```

---

## 22. Build and Run

Available scripts defined in `package.json`:
- `npm run dev`
- `npm run build`

Local development:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

---

## 23. Summary

Gathr is a mobile-first event platform implemented as a React SPA with Supabase as the backend and Capacitor for Android packaging.

The current codebase already contains a coherent MVP architecture with:
- centralized auth bootstrap
- custom mobile-style screen navigation
- typed localization layer
- event creation and editing
- participant management
- invitations
- support requests
- realtime updates
- dynamic notifications
- profile and settings flows
- Android delivery configuration
