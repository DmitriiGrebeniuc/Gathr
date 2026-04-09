# Gathr - Architecture Documentation

## 1. Overview

Gathr is a mobile-first event management application built as a React single-page application with Supabase as the backend platform and Capacitor as the Android delivery layer.

The current architecture is optimized for MVP delivery speed while already supporting:
- authenticated user flows
- event lifecycle management
- realtime updates
- localized UI
- Android packaging

---

## 2. Architectural Style

The application follows a frontend-centric SPA architecture with a managed backend platform.

### Core characteristics
- React-based single-page application
- custom screen-state navigation instead of route-driven navigation
- Supabase as BaaS for authentication, database, and realtime
- mobile-like UI shell rendered inside a bounded viewport container
- Capacitor wrapper for Android delivery

---

## 3. High-Level Architecture

```text
User Interface
  ↓
Application Shell
  ↓
Feature Screens and UI Components
  ↓
Shared Infrastructure Layer
  ↓
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

#### Application shell layer
Implemented in:
- `src/app/App.tsx`
- `src/main.tsx`

Responsible for:
- application bootstrap
- session gate
- screen navigation
- screen transition orchestration
- main layout shell

#### Shared infrastructure layer
Implemented in:
- `src/lib/supabase.ts`
- `src/lib/language.ts`
- `src/app/context/LanguageContext.tsx`
- `src/app/constants/*`

Responsible for:
- backend client initialization
- language persistence
- translation lookup
- shared constants and metadata

#### Backend platform layer
Implemented through Supabase.

Responsible for:
- authentication
- storage of domain entities
- user-related and event-related queries
- realtime subscriptions

---

## 4. Application Bootstrap Flow

1. The browser loads the Vite application.
2. `src/main.tsx` mounts the React tree.
3. `LanguageProvider` restores language from local storage.
4. `App.tsx` checks current Supabase session.
5. Depending on session state, the shell opens either:
   - `welcome`
   - `home`
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

The application transitions between screens by updating `currentScreen` rather than relying on URL-based routing.

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

### Modal-like screens
- `create-event`
- `edit-event`

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
- no deep linking
- no browser-native route semantics
- back button handling becomes application-managed
- navigation payloads are not yet strongly typed

---

## 6. Authentication Architecture

Supabase Auth is the single authentication provider.

### Responsibilities
- user registration
- user login
- session persistence
- logout
- auth state synchronization with the root shell

### Auth integration points
- root session check in `App.tsx`
- auth state subscription in `App.tsx`
- login and signup screens
- logout in `ProfileScreen.tsx`

### Observed auth-dependent modules
- Home
- Profile
- Create Event
- Edit Event
- Event Details
- Notifications

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

### Persistence
The selected language is stored in browser local storage under a dedicated key.

### Architectural strengths
- centralized provider model
- typed translation keys
- persistent language setting across sessions

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
- insert a new event
- insert creator participation row

Backend dependencies:
- `events`
- `participants`

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
- creator-only edit and delete actions
- map rendering
- realtime synchronization

Backend dependencies:
- `events`
- `participants`
- `profiles`

## 8.5 Notifications feature

Responsibilities:
- build notification feed dynamically
- show upcoming joined events
- show participant joins on owned events
- respect user notification settings
- refresh through realtime channels

Backend dependencies:
- `events`
- `participants`
- `notification_settings`
- `profiles`

## 8.6 Profile feature

Responsibilities:
- load user identity
- load profile name
- provide access to settings and account actions
- log out the user

Backend dependencies:
- `profiles`
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

### Notifications
Subscriptions:
- all changes in `participants`
- all changes in `events`

### Architectural pattern
The current realtime pattern favors correctness and simplicity over minimal data transfer.
In most cases, a realtime event triggers a targeted refetch or a complete feature-level refresh.

### Benefits
- robust MVP behavior
- low conceptual complexity
- easier debugging

### Future optimization opportunities
- narrower channel filters
- optimistic local patching
- denormalized notification records if feed volume increases

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

### Recommended future direction
Introduce feature services or repositories, for example:
- `events.service.ts`
- `participants.service.ts`
- `notifications.service.ts`
- `profiles.service.ts`

---

## 11. Mobile Delivery Architecture

Capacitor is used to package the web build into an Android application.

### Current configuration
- `appId`: `com.gathr.app`
- `appName`: `Gathr`
- `webDir`: `dist`

### Implications
- the web app remains the primary codebase
- Android delivery depends on the build output generated by Vite
- platform-specific behavior must be handled in the shell and native wrapper integration

### Known mobile-related architecture areas
- viewport shell sizing
- system back navigation behavior
- swipe-back interactions
- integration with native Google Maps opening flow

---

## 12. Current Strengths

- coherent MVP architecture
- centralized auth bootstrap
- reusable localization subsystem
- realtime-enabled feature flows
- clear mobile-first shell design
- Android packaging already integrated

---

## 13. Current Risks

### Navigation growth risk
The custom screen-state navigation model will become harder to maintain as the number of flows grows.

### UI/data coupling
Direct Supabase queries inside screen components increase coupling between UI and backend access.

### Type safety risk
Navigation payloads and feature data contracts are not yet fully typed.

### Translation catalog growth
A single large translation file will become harder to maintain over time.

### Realtime scaling risk
Feature-wide refetches are correct for MVP, but may become costly at higher volumes.

---

## 14. Recommended Evolution Path

### Near term
- introduce stronger TypeScript models for domain entities
- extract data access into feature services
- split translation catalog by feature domain
- document database schema and RLS policies explicitly

### Mid term
- evaluate migration to route-based navigation or hybrid navigation
- introduce shared hooks for event and participant loading
- optimize realtime refresh strategy
- formalize error handling and toast-based feedback

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
