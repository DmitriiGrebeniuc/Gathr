# Gathr - Architecture Documentation

## 1. Overview

Gathr is a mobile-first event coordination application built as a React single-page application with Supabase as the backend platform and Capacitor as the Android delivery layer.

The current architecture is optimized for MVP delivery speed while already supporting:
- authenticated user flows
- event lifecycle management
- invitations
- notification preferences
- support requests
- realtime updates
- localized UI
- Android packaging
- early plan/limit enforcement

---

## 2. Architectural Style

The application follows a frontend-centric SPA architecture with a managed backend platform.

### Core characteristics
- React-based single-page application
- custom screen-state navigation instead of route-driven navigation
- Supabase as BaaS for authentication, database, and realtime
- mobile-like UI shell rendered inside a bounded viewport container
- Capacitor wrapper for Android delivery
- direct feature-to-Supabase access from screen components

---

## 3. High-Level Architecture

```text
User Interface
  ->
Application Shell
  ->
Feature Screens and UI Components
  ->
Shared Infrastructure Layer
  ->
Supabase Platform
    - Auth
    - Database
    - Realtime
```

### Layers

#### Presentation layer
Implemented in:
- `src/app/components/`

Responsible for:
- screen rendering
- user interaction
- local UI state
- visual transitions
- gesture handling
- direct data loading and write actions

#### Application shell layer
Implemented in:
- `src/app/App.tsx`
- `src/main.tsx`

Responsible for:
- application bootstrap
- session gate
- recovery token handling
- screen navigation
- screen transition orchestration
- mobile viewport shell

#### Shared infrastructure layer
Implemented in:
- `src/lib/supabase.ts`
- `src/lib/language.ts`
- `src/app/context/LanguageContext.tsx`
- `src/app/constants/*`
- `src/app/auth/*`

Responsible for:
- backend client initialization
- language persistence
- translation lookup
- shared constants and metadata
- shared auth-navigation payload helpers
- shared-event path resolution

#### Backend platform layer
Implemented through Supabase.

Responsible for:
- authentication
- storage of domain entities
- user-related and event-related queries
- invitation and support data access
- realtime subscriptions

---

## 4. Application Bootstrap Flow

1. The browser loads the Vite application.
2. `src/main.tsx` mounts the React tree.
3. `LanguageProvider` restores language from local storage.
4. `App.tsx` checks recovery tokens and shared-event path state.
5. Depending on state, the shell opens:
   - `welcome`
   - `home`
   - `reset-password`
   - `event-details` for a shared event
6. The shell subscribes to auth state changes.

---

## 5. Navigation Architecture

## 5.1 Current navigation model

Navigation is state-driven and implemented in `App.tsx`.

The root shell stores:
- `currentScreen`
- `selectedEvent`
- `direction`
- `history`
- `authChecked`
- pending auth-return state

The application transitions between screens by updating `currentScreen` rather than relying on route-based navigation for regular in-app movement.

## 5.2 Screen groups

### Main screens
- `home`
- `notifications`
- `profile`

### Detail screens
- `edit-profile`
- `notification-settings`
- `security`
- `support`
- `language`
- `event-details`
- `participants`
- `invite-users`
- `reset-password`

### Modal-like screens
- `create-event`

### Auth screens
- `welcome`
- `login`
- `signup`

## 5.3 Navigation behavior

The shell computes navigation direction to support animated transitions:
- `forward`
- `back`
- `up`
- `down`

This approach mimics native navigation behavior and supports the mobile-first interaction model.

## 5.4 Architectural implications

Advantages:
- simple MVP navigation implementation
- strong control over transitions
- natural mobile-like UX

Trade-offs:
- browser-native route semantics are not the primary navigation model
- back button handling becomes application-managed
- navigation payloads are not yet strongly typed

Observed exception:
- the app supports a shared-event deep link at `/event/:eventId`

---

## 6. Authentication Architecture

Supabase Auth is the single authentication provider.

### Responsibilities
- user registration
- user login
- session persistence
- logout
- forgot-password email request
- password recovery flow
- auth state synchronization with the root shell
- return-to-screen behavior after login for some guarded actions

### Auth integration points
- root session and recovery check in `App.tsx`
- auth state subscription in `App.tsx`
- login and signup screens
- reset password screen
- logout in `ProfileScreen.tsx`
- post-login action payload helpers in `src/app/auth/postLoginIntent.ts`

---

## 7. Localization Architecture

Localization is a first-class subsystem.

### Components
- `languages.ts` defines supported languages and default language
- `translations.ts` defines translation keys and translation dictionaries
- `language.ts` persists selected language in local storage
- `LanguageContext.tsx` exposes the current language and translation function globally

### Supported languages
- English
- Russian
- Romanian
- Ukrainian
- German

---

## 8. Feature Architecture

## 8.1 Home feature

Responsibilities:
- event feed loading
- tab segmentation
- activity-based filtering
- pagination
- feed refresh
- realtime reaction to events and participants

Backend dependencies:
- `events`
- `participants`
- `profiles`

## 8.2 Event creation feature

Responsibilities:
- collect event input
- resolve activity type
- resolve location through autocomplete and map picker
- prevent creating past events
- enforce active future event limit on the client
- insert a new event
- insert creator participation row

Backend dependencies:
- `events`
- `participants`
- `profiles`

## 8.3 Event editing feature

Responsibilities:
- preload an existing event
- update editable fields
- enforce creator-based update constraint

Backend dependencies:
- `events`

## 8.4 Event details feature

Responsibilities:
- load current event snapshot
- load participants
- determine user relationship to event
- join / leave event
- support creator edit and delete actions
- support event sharing through `/event/:id`
- optionally auto-join after login when opened from guarded join flow
- map rendering
- realtime synchronization

Backend dependencies:
- `events`
- `participants`
- `profiles`

## 8.5 Participants and invitations feature

Responsibilities:
- load participants
- mark creator and current user
- open invite flow for creators
- resolve invite candidates
- create invitation rows
- enforce per-event invitation limit on the client

Backend dependencies:
- `participants`
- `profiles`
- `event_invitations`

## 8.6 Notifications feature

Responsibilities:
- build notification feed dynamically
- show upcoming joined events
- show participant joins on owned events
- show pending invitations
- respect user notification settings
- refresh through realtime channels

Backend dependencies:
- `events`
- `participants`
- `notification_settings`
- `event_invitations`
- `profiles`

## 8.7 Profile and settings feature

Responsibilities:
- load user identity
- edit profile name
- manage language
- manage notification settings
- change password for authenticated user
- submit support requests
- log out the user

Backend dependencies:
- `profiles`
- `notification_settings`
- `support_requests`
- Supabase Auth user object

---

## 9. Realtime Architecture

Realtime is implemented using Supabase channels.

### Home
Subscriptions:
- all changes in `events`
- all changes in `participants`

### Event Details
Subscriptions:
- all changes in `participants`
- changes in the current event row

### Participants
Subscriptions:
- all changes in `participants`

### Notifications
Subscriptions:
- all changes in `participants`
- all changes in `events`
- all changes in `event_invitations`

### Architectural pattern
The current realtime pattern favors correctness and simplicity over minimal data transfer.
In most cases, a realtime event triggers a targeted refetch or a complete feature-level refresh.

---

## 10. Data Access Pattern

The frontend interacts directly with Supabase from feature screens.

### Current pattern
- UI components call Supabase queries directly
- feature screens own their own loading logic
- data transformation happens close to the UI layer

### Advantages
- fast development for MVP
- feature logic stays easy to locate

### Trade-offs
- database access is coupled to UI components
- repeated query patterns may emerge
- testing is harder without service abstraction
- multi-step writes are harder to harden

---

## 11. Mobile Delivery Architecture

Capacitor is used to package the web build into an Android application.

### Current configuration
- `appId`: `com.gathr.app`
- `appName`: `Gathr`
- `webDir`: `dist`

### Known mobile-related architecture areas
- viewport shell sizing
- swipe-back interactions
- full-screen shell behavior on small screens
- integration with native Google Maps opening flow

---

## 12. Current Strengths

- coherent MVP architecture
- centralized auth bootstrap
- reusable localization subsystem
- realtime-enabled feature flows
- clear mobile-first shell design
- Android packaging integrated
- invitations, support flow, and plan limits already connected to product flows

---

## 13. Current Risks

- navigation growth risk
- UI/data coupling
- type safety risk in navigation payloads
- translation catalog growth
- realtime scaling risk
- client-side limit enforcement risk
- multi-step write consistency risk

---

## 14. Recommended Evolution Path

### Near term
- introduce stronger TypeScript models for domain entities
- extract data access into feature services
- split translation catalog by feature domain
- document verified backend schema and policies from SQL source of truth

### Mid term
- evaluate route-based or hybrid navigation without breaking current mobile-like flow
- introduce shared hooks for event and participant loading
- optimize realtime refresh strategy
- formalize error handling and feedback patterns

### Long term
- adopt feature-based folder structure
- introduce testable service boundaries
- add analytics and operational monitoring
- prepare deeper native mobile integration if required

---

## 15. Target Scalable Structure

A future scalable structure can evolve toward:

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
    hooks/
    types/
```

This is not required for the current MVP stage, but represents the natural next architectural step.
