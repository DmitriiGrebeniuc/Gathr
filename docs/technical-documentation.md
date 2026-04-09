# Gathr - Technical Documentation

## 1. Purpose

Gathr is a mobile-first event management application built as a React single-page application with Supabase as the backend platform and Capacitor as the Android delivery layer.

The product enables authenticated users to:
- browse public events
- create events
- edit their own events
- join and leave events
- view participants
- receive event-related notifications
- manage profile and language settings

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
  LanguageScreen.tsx
  LoadingLogo.tsx
  LocationAutocomplete.tsx
  LoginScreen.tsx
  NotificationSettingsScreen.tsx
  NotificationsScreen.tsx
  ParticipantsScreen.tsx
  ProfileScreen.tsx
  PullToRefresh.tsx
  ScreenTransition.tsx
  SecurityScreen.tsx
  SignUpScreen.tsx
  SupportScreen.tsx
  SwipeableScreen.tsx
  TouchButton.tsx
  WelcomeScreen.tsx

src/app/constants/
  activityTypes.ts
  languages.ts
  translations.ts

src/app/context/
  LanguageContext.tsx
```

---

## 4. Application Entry Point

The application entry point is `src/main.tsx`.

Responsibilities:
- initialize React root
- import global styles
- wrap the app in the global `LanguageProvider`
- render the main application shell

```tsx
createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
```

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

This design provides a native-app-like flow inside a single-page application.

### 5.1 Screen model

The root shell switches between screens based on `currentScreen`.

Supported screens:
- `welcome`
- `login`
- `signup`
- `home`
- `create-event`
- `edit-event`
- `event-details`
- `participants`
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

### 5.3 Bottom navigation

Bottom navigation is shown only on the primary sections:
- `home`
- `notifications`
- `profile`

This creates a three-tab main structure with detail and modal-like subflows.

### 5.4 Mobile shell container

The main shell renders inside a centered mobile-like viewport container with:
- `height: 100dvh`
- `maxWidth: 390px`
- `maxHeight: 844px`

On desktop, the shell is rendered as a rounded mobile device frame.
On smaller screens, border radius is removed for full-screen presentation.

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

### 6.2 Auth state synchronization

The root shell subscribes to:

- `supabase.auth.onAuthStateChange(...)`

Behavior:
- login transitions the application to `home`
- logout transitions the application to `welcome`

### 6.3 Logout flow

`ProfileScreen.tsx` performs logout with:

- `supabase.auth.signOut()`

After successful logout, the application navigates back to `welcome`.

---

## 7. Backend Integration

Supabase client initialization is defined in `src/lib/supabase.ts`.

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Required environment variables

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

## 8.1 Supported languages

Defined in `src/app/constants/languages.ts`:

- `ru`
- `en`
- `ro`
- `uk`
- `de`

Default language:
- `en`

## 8.2 Language persistence

Language preference is persisted in browser storage through `src/lib/language.ts`.

Storage key:
- `gathr-language`

The utility layer provides:
- `getStoredLanguage()`
- `setStoredLanguage(language)`

## 8.3 Context provider

`src/app/context/LanguageContext.tsx` provides:
- current language
- `setLanguage(language)`
- `translate(key)`

This provider persists changes to local storage and exposes translation lookup globally.

## 8.4 Translation catalog

`src/app/constants/translations.ts` contains:
- a typed union of translation keys
- a translation dictionary per language
- fallback-to-English logic

The translation layer already covers:
- common UI strings
- authentication
- profile and settings
- notifications
- home tabs and empty states
- create/edit event flow
- event details
- participants

This subsystem is structurally suitable for production growth, although the translation catalog should later be split into domain-based files for maintainability.

---

## 9. Domain Model

Based on the current application implementation, the following backend entities are actively used.

## 9.1 Profiles

Used for:
- retrieving the current user's display name
- resolving event creator names
- resolving participant names

Observed fields:
- `id`
- `name`

## 9.2 Events

Core entity of the application.

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

Join table between users and events.

Observed fields:
- `event_id`
- `user_id`
- `created_at`

Used for:
- event participation count
- detecting joined events
- participant lists
- creator auto-participation
- join notifications

## 9.4 Notification settings

Used in the notifications module.

Observed fields:
- `user_id`
- `notify_upcoming_events`
- `notify_new_participants`

---

## 10. Home Module

The home feed is implemented in `src/app/components/HomeScreen.tsx`.

## 10.1 Main responsibilities

- load and display events
- split feed into logical tabs
- apply activity filters
- support local pagination
- support server-side incremental loading
- react to realtime updates
- navigate to event details
- provide entry point to event creation

## 10.2 Tabs

The home screen supports three tabs:
- `discover`
- `joined`
- `my`

Behavior:
- `discover` shows future events from other users that the current user has not joined
- `joined` shows future events joined by the current user, excluding events created by the same user
- `my` shows events created by the current user

If no user is authenticated, only discover-style behavior is relevant.

## 10.3 Activity filtering

The home feed supports filtering by:
- `all`
- a specific `activity_type`

Filter metadata is resolved through:
- `ACTIVITY_TYPES`
- `getActivityTypeMeta(...)`

## 10.4 Event loading strategy

Home uses two-stage loading:

### Server batch
- `SERVER_BATCH_SIZE = 100`

### Local visible batch
- `LOCAL_BATCH_SIZE = 10`

This allows:
- loading a relatively large server-side block
- rendering a smaller local subset
- progressively showing more items on demand

## 10.5 Event enrichment

When events are loaded, the screen additionally resolves:
- creator names from `profiles`
- participant counts from `participants`
- current user joined event IDs

## 10.6 Refresh behavior

Home supports:
- pull-to-refresh through `PullToRefresh`
- manual "load more" behavior
- realtime refresh

## 10.7 Realtime subscriptions

Home subscribes to:
- changes in `events`
- changes in `participants`

Behavior:
- event table changes trigger event refetch
- participant table changes trigger participant count refresh

## 10.8 Empty states

The empty state is context-sensitive and depends on:
- active tab
- selected activity type

Examples:
- no personal events
- no joined events
- no discover events
- no events for selected category

## 10.9 Navigation from Home

Home supports navigation to:
- `profile`
- `event-details`
- `create-event`

When opening event details, the event payload is passed with:
- `backTarget: 'home'`

---

## 11. Event Creation Module

Event creation is implemented in `src/app/components/CreateEventScreen.tsx`.

## 11.1 Responsibilities

- collect event input
- validate required fields
- resolve location through autocomplete and map picker
- create a new event in the backend
- automatically add the creator to `participants`
- open the newly created event details view

## 11.2 Input fields

The screen captures:
- `title`
- `description`
- `date`
- `time`
- `location`
- `activityType`

Location is represented as:
- `address`
- `placeId`
- `lat`
- `lng`

## 11.3 Validation rules

Creation is blocked if:
- title is empty
- date is missing
- time is missing
- user is not authenticated
- date/time cannot be converted into a valid `Date`

## 11.4 Event creation flow

1. Validate fields
2. Resolve current authenticated user
3. Convert `date + time` to ISO datetime
4. Insert into `events`
5. Insert creator into `participants`
6. Navigate to `event-details`

## 11.5 Location support

The screen integrates:
- `LocationAutocomplete`
- `EventLocationMap`

Map selection can update the selected location through `onPick`.

## 11.6 Modal-like interaction

The create screen is implemented as a drag-dismissable modal-like screen.
A downward drag beyond a threshold returns the user to `home`.

---

## 12. Event Editing Module

Event editing is implemented in `src/app/components/EditEventScreen.tsx`.

## 12.1 Responsibilities

- preload current event data
- allow editing of title, description, time, location, and activity type
- update the event in the backend
- return to the updated event details screen

## 12.2 Preload behavior

When an event is passed into the screen, the component pre-populates:
- title
- description
- activity type
- address
- place ID
- latitude and longitude
- date and time parsed from `event.date_time`

## 12.3 Update rules

Editing is blocked if:
- no event ID is available
- title is empty
- date is missing
- time is missing
- date/time is invalid
- no authenticated user exists

## 12.4 Authorization rule

The update operation is constrained by:
- `id = event.id`
- `creator_id = user.id`

This ensures only the event creator can update the event through the current client flow.

## 12.5 Navigation behavior

After successful update, the screen opens:
- `event-details`

The edit screen also supports drag-down dismissal back to event details.

---

## 13. Event Details Module

Event details are implemented in `src/app/components/EventDetailsScreen.tsx`.

## 13.1 Responsibilities

- load the latest event snapshot
- load participant list
- determine current user relation to event
- support joining and leaving
- support creator actions
- render event location map
- expose participants view
- react to realtime changes

## 13.2 Event state resolution

The screen maintains:
- `eventData`
- `hasJoined`
- `isCreator`
- `participants`
- `currentUserId`

It uses:
- `loadEvent()`
- `loadParticipants()`
- `loadEventState()`

## 13.3 Join flow

If the current user is not the creator and is not already joined:
- insert a row into `participants`
- update local join state
- reload participants

## 13.4 Leave flow

If the current user is joined:
- delete the matching row from `participants`
- update local join state
- reload participants

## 13.5 Creator actions

If the current user is the event creator:
- `Edit Event`
- `Delete Event`

## 13.6 Event deletion flow

Deletion is a two-step backend operation:
1. delete all participants linked to the event
2. delete the event itself, constrained by creator ID

After successful deletion:
- navigate to `home`

## 13.7 Past event behavior

Past events are detected by comparing `eventData.date_time` with current time.

If the event is in the past:
- the event receives a "past event" visual marker
- join action is replaced with a non-interactive ended-state message

## 13.8 Participants preview

The details screen shows a participant preview with:
- initials avatar
- creator highlighting
- current-user highlighting
- overflow counter when participant count exceeds visible slots

Clicking the participants section opens:
- `participants`

## 13.9 Location behavior

If coordinates are available:
- `EventLocationMap` is shown

If running inside a native Capacitor environment and location is available:
- a Google Maps external link is offered

## 13.10 Realtime subscriptions

Event details subscribes to:
- changes in `participants`
- changes in the current `events` row

Behavior:
- participant changes reload both participant list and participation state
- event changes reload the current event record

## 13.11 Back navigation

The details screen supports a dynamic `backTarget`.
Examples:
- back to `home`
- back to `notifications`

It also supports swipe-back behavior via `SwipeableScreen`.

---

## 14. Notifications Module

Notifications are implemented in `src/app/components/NotificationsScreen.tsx`.

## 14.1 Responsibilities

- generate notification feed dynamically from backend data
- respect notification settings
- show upcoming joined events
- show new participants joining the user's own events
- refresh on realtime changes

## 14.2 Notification types

The current implementation supports two generated notification types:
- `upcoming`
- `join`

## 14.3 Upcoming event notifications

The module generates upcoming notifications for:
- events the current user has joined
- events starting within the next 24 hours

Source logic:
1. load current user's `participants`
2. derive joined event IDs
3. load future events within the next 24 hours
4. build human-readable messages and relative time labels

## 14.4 New participant notifications

The module also generates notifications when:
- another user joins an event created by the current user

Source logic:
1. load events created by the current user
2. load `participants` rows for those events
3. exclude current user
4. group joins by event
5. collapse multiple joins into a grouped message
6. sort based on latest join time

## 14.5 Notification settings

The module reads user-specific settings from:
- `notification_settings`

Supported switches:
- `notify_upcoming_events`
- `notify_new_participants`

If settings are missing, defaults are permissive:
- both notification categories default to enabled

## 14.6 Sorting strategy

Notifications are merged and sorted by:
- priority
- timestamp

Join notifications are prioritized above upcoming notifications.

## 14.7 Realtime subscriptions

Notifications subscribes to:
- changes in `participants`
- changes in `events`

Any change triggers a full notification refetch.

## 14.8 Navigation behavior

Clicking a notification opens:
- `event-details`

The passed payload includes:
- `backTarget: 'notifications'`

---

## 15. Profile Module

Profile is implemented in `src/app/components/ProfileScreen.tsx`.

## 15.1 Responsibilities

- load the current authenticated user
- load profile name from `profiles`
- render user identity block
- provide access to settings and account actions
- handle logout

## 15.2 Loaded user data

The profile screen combines:
- auth user data from Supabase Auth
- profile name from `profiles`

Displayed identity includes:
- initials
- display name
- email

## 15.3 Fallback behavior

If no profile name exists:
- display name falls back to the email prefix

If neither profile name nor email is available:
- display name falls back to a guest-style value

## 15.4 Navigation options

The profile screen links to:
- `edit-profile`
- `notification-settings`
- `language`
- `security`
- `support`

## 15.5 Logout

Logout is executed through Supabase Auth and transitions the shell to the welcome screen.

---

## 16. Mobile and Platform Integration

Capacitor configuration is defined in `capacitor.config.json`.

```json
{
  "appId": "com.gathr.app",
  "appName": "Gathr",
  "webDir": "dist"
}
```

### Platform implications
- web build output is expected in `dist`
- Android packaging is configured through Capacitor
- app identifier is `com.gathr.app`

The repository also contains an `android/` folder, which confirms Android project integration.

---

## 17. Realtime Architecture

Realtime behavior is implemented through Supabase channels.

Observed subscriptions:

### Home
- `events`
- `participants`

### Event Details
- `participants`
- current event row in `events`

### Notifications
- `participants`
- `events`

### Design implication

The UI is designed to remain responsive to backend changes without full manual reload.

This currently supports:
- newly created or updated events
- participant count changes
- participant join/leave updates
- notification feed freshness

---

## 18. UX and Interaction Patterns

The UI follows a mobile-first interaction model.

Observed interaction patterns:
- animated screen transitions
- drag-down dismissal for create/edit event screens
- swipe-back interaction in event details
- bottom tab navigation for primary sections
- pull-to-refresh on home
- full-screen mobile shell layout

This design aligns the web SPA closely with native application behavior.

---

## 19. Current Functional Scope

The current implementation already supports the following end-to-end flows:

### Authentication
- sign up
- log in
- persistent session
- log out

### Profile
- load profile data
- open profile settings sections
- change language
- open security and support placeholders

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
- view participants
- view map location

### Notifications
- view upcoming joined events
- view new participants on owned events
- honor notification settings

### Localization
- support for five languages
- persisted language selection

### Android delivery
- Capacitor configuration
- Android project present in repository

---

## 20. Operational Constraints and Technical Risks

## 20.1 Navigation scalability
The custom screen-state navigation model is effective for MVP speed, but it will become harder to maintain as the number of screens and flows grows.

Potential future challenges:
- deep linking
- browser history behavior
- Android back button consistency
- route-level testing
- external navigation integration

## 20.2 Mixed component responsibility
`src/app/components/` currently contains:
- screen-level components
- UI primitives
- interaction wrappers

This is acceptable for MVP, but should later be separated into:
- feature screens
- shared UI
- shared behavior utilities

## 20.3 Type safety
Several navigation payloads currently use broad `any`-style data passing.
This works for speed, but should later be replaced with typed screen payload contracts.

## 20.4 Translation catalog growth
The translation file is large and should later be split by domain to improve maintainability and reduce merge complexity.

## 20.5 Realtime refresh cost
Some screens refetch whole datasets after each relevant realtime event.
This is simple and robust for MVP, but may need optimization as data volume grows.

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

This is not required for the current MVP stage, but it is the natural direction for scaling.

---

## 22. Build and Run

## 22.1 Available scripts

Defined in `package.json`:
- `npm run dev`
- `npm run build`

## 22.2 Local development

```bash
npm install
npm run dev
```

## 22.3 Production build

```bash
npm run build
```

## 22.4 Android sync workflow

After generating the web build:

```bash
npm run build
npx cap sync android
```

Additional Android-specific build and release steps are handled inside the Android project.

---

## 23. Summary

Gathr is a mobile-first event platform implemented as a React SPA with Supabase as the backend and Capacitor for Android packaging.

The current codebase already contains a coherent MVP architecture with:
- centralized auth bootstrap
- custom mobile-style screen navigation
- typed localization layer
- event creation and editing
- participant management
- realtime updates
- dynamic notifications
- profile and settings flows
- Android delivery configuration

From a technical perspective, the project is beyond the prototype stage and can be presented as an operational MVP with a clear path toward further productization and platform hardening.
