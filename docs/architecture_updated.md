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

## 2. Architectural Style

The application follows a frontend-centric SPA architecture with a managed backend platform.

### Core characteristics
- React-based single-page application
- custom screen-state navigation instead of route-driven navigation
- Supabase as BaaS for authentication, database, and realtime
- mobile-like UI shell rendered inside a bounded viewport container
- Capacitor wrapper for Android delivery
- direct feature-to-Supabase access from screen components
- lightweight MVP-oriented architecture with minimal abstraction layers

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
Implemented primarily in:
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

Responsible for:
- backend client initialization
- language persistence
- translation lookup
- shared constants and metadata
- shared plan/limit resolution

#### Backend platform layer
Implemented through Supabase.

Responsible for:
- authentication
- storage of domain entities
- user-related and event-related queries
- notification preference storage
- invitation storage
- support request storage
- realtime subscriptions

#### Mobile delivery layer
Implemented through Capacitor.

Responsible for:
- packaging the web build into Android
- native container delivery
- native app identity and packaging configuration

## 4. Technology Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Supabase
  - authentication
  - PostgreSQL database access
  - realtime subscriptions

### UI and styling
- Tailwind CSS 4
- motion
- Radix UI primitives
- Material UI
- custom product components

### Maps and location
- Google Maps integration through `@react-google-maps/api`

### Mobile packaging
- Capacitor
- Android

### Supporting libraries
- Sonner
- date-fns
- lucide-react

## 5. Application Bootstrap Flow

1. The browser loads the Vite application.
2. `src/main.tsx` mounts the React tree.
3. Global styles are loaded from `src/styles/index.css`.
4. `LanguageProvider` wraps the app and restores language from local storage.
5. `App.tsx` checks auth and recovery state.
6. Depending on session state, the shell opens either:
   - `welcome`
   - `home`
   - `reset-password` in recovery flow
7. The shell subscribes to auth state changes.

## 6. Navigation Architecture

Navigation is state-driven and implemented in `App.tsx`.

The root shell stores:
- `currentScreen`
- `selectedEvent`
- `direction`
- `history`
- `authChecked`

Screen groups:
- main: `home`, `notifications`, `profile`
- detail: `edit-profile`, `notification-settings`, `security`, `support`, `language`, `event-details`, `participants`, `invite-users`
- modal-like: `create-event`, `edit-event`
- auth/entry: `welcome`, `login`, `signup`, `reset-password`

Navigation directions:
- `forward`
- `back`
- `up`
- `down`

## 7. Authentication Architecture

Supabase Auth is the single authentication provider.

Current responsibilities:
- registration
- login
- password reset initiation
- password recovery session restoration
- authenticated password change
- session persistence
- logout
- auth state synchronization with the root shell

## 8. Localization Architecture

Localization is implemented through:
- `languages.ts`
- `translations.ts`
- `language.ts`
- `LanguageContext.tsx`

Supported languages:
- English
- Russian
- Romanian
- Ukrainian
- German

## 9. Feature Architecture

Current product areas:
- home / discover / joined / my events
- event creation
- event editing
- event details
- participants
- invitations
- notifications
- notification settings
- support
- security
- profile
- language

## 10. Realtime Architecture

Realtime is implemented using Supabase channels.

Current subscriptions:
- Home: `events`, `participants`
- Event Details: `participants`, current `events` row
- Participants: `participants`
- Notifications: `participants`, `events`, `event_invitations`

## 11. Data Access Pattern

The frontend interacts directly with Supabase from feature screens.

Advantages:
- fast MVP development
- low abstraction overhead

Trade-offs:
- UI/data coupling
- repeated query patterns
- harder testing
- multi-step writes are harder to harden

## 12. Entitlement and Limit Architecture

Profile-level entitlement fields:
- `role`
- `plan`
- `has_unlimited_access`

Current enforced limits:
- active future events per creator
- invitations per event

## 13. Mobile Delivery Architecture

Capacitor is used to package the web build into an Android application.

Current configuration:
- `appId`: `com.gathr.app`
- `appName`: `Gathr`
- `webDir`: `dist`

## 14. Current Strengths

- coherent MVP architecture
- centralized auth bootstrap
- reusable localization subsystem
- realtime-enabled feature flows
- clear mobile-first shell design
- Android packaging integrated
- invitation flow implemented
- support flow persisted in DB
- entitlement groundwork added

## 15. Current Risks

- navigation growth risk
- UI/data coupling
- type safety risk in navigation payloads
- translation catalog growth
- realtime scaling risk
- client-side limit enforcement risk
- multi-step write consistency risk

## 16. Recommended Evolution Path

Near term:
- stronger TypeScript models
- service extraction
- split translations by domain
- replace alert-based UX
- move critical multi-step flows into RPC/server-side logic

Mid term:
- evaluate route-based or hybrid navigation
- optimize realtime refresh
- formalize server-side plan enforcement
- add admin-only surfaces guarded by `profiles.role`

Long term:
- feature-based folder structure
- testable service boundaries
- analytics and monitoring
- deeper native mobile integration if required
- dedicated subscription system
