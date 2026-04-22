# Gathr - Database Schema Documentation

## 1. Overview

Gathr uses Supabase (PostgreSQL) as its primary data storage layer.

This document reflects the frontend contract after the RLS/profile split migration.

Current core entities used by the client:
- `auth.users`
- `profiles`
- `public_profiles`
- `events`
- `participants`
- `notification_settings`
- `support_requests`
- `event_invitations`

---

## 2. Auth Layer

User authentication is managed by Supabase Auth.

### Table
- `auth.users`

Observed usage:
- current session lookup
- login
- signup
- logout
- password reset and recovery flow

---

## 3. Profiles

### Table: `profiles`

Private profile and entitlement state. The frontend must not use this table as
the source for other users' public display names.

### Observed fields

- `id`
- `name`
- `role`
- `plan`
- `has_unlimited_access`
- `is_banned`
- `accepted_terms_at`
- `accepted_privacy_at`
- `accepted_legal_version`

### Usage

- edit current profile name
- read current user's own access state
- read and update current user's legal consent
- resolve client-side event and invitation limits

---

## 4. Public Profiles

### Table: `public_profiles`

Public profile projection synchronized from `profiles`.

### Observed fields

- `id`
- `name`
- `created_at`
- `updated_at`

### Usage

- display user names
- resolve creator names for events
- resolve participant names
- resolve invite candidates

Client code should read foreign/public names from `public_profiles`, not
`profiles`.

---

## 5. Events

### Table: `events`

Core entity representing an event.

### Observed fields

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
- `visibility`

### Usage

- event discovery
- event detail view
- event editing
- event filtering
- invitation context
- notification generation
- shared-event entry path

---

## 6. Participants

### Table: `participants`

Represents the relationship between users and events.

### Observed fields

- `id`
- `event_id`
- `user_id`
- `created_at`

### Usage

- track event membership
- build joined events list
- calculate participant count through `get_visible_event_participant_counts`
- render participant lists
- generate join notifications

Participant identities are only loaded when the current user is the event
creator, a participant, or an admin. Public/anonymous screens should use counts
without direct participant identity reads.

---

## 7. Notification Settings

### Table: `notification_settings`

Stores user-specific notification preferences.

### Observed fields

- `user_id`
- `notify_upcoming_events`
- `notify_new_participants`
- `notify_event_invitations`
- `updated_at`

### Default behavior in the client

If no row exists:
- notifications are treated as enabled

---

## 8. Support Requests

### Table: `support_requests`

Stores user-submitted support messages.

### Observed fields

- `user_id`
- `subject`
- `message`

### Usage

- submit support form requests from `SupportScreen.tsx`

---

## 9. Event Invitations

### Table: `event_invitations`

Stores invitations sent by event creators to other users.

### Observed fields

- `id`
- `event_id`
- `inviter_id`
- `invitee_id`
- `status`
- `created_at`
- `responded_at`

### Observed statuses

- `pending`
- `accepted`
- `declined`

### Usage

- filter invite candidates
- create event invitations
- generate invite notifications
- accept or decline invitations

---

## 10. Relationships

Observed client-side relationship model:

### User to Profile
- one-to-one in application usage

### User to Events
- one-to-many creator relationship

### User to Participants
- one-to-many participation relationship

### Event to Participants
- one-to-many

### Event to Invitations
- one-to-many

---

## 11. Realtime-Relevant Tables

Supabase realtime is used on the following tables:

- `events`
- `participants`
- `event_invitations`

### Effects

- UI updates when events change
- participant views refresh in real time
- notifications refresh when invitations change

---

## 12. RPC Contract Used By The Frontend

- `get_my_profile_access()` returns the current user's profile/access summary.
- `get_visible_event_participant_counts(target_event_ids uuid[])` returns safe participant counts.
- `admin_list_profiles()` returns admin profile rows with names from `public_profiles`.
- `admin_set_user_ban_state(...)` returns the updated admin profile row.
- `admin_update_profile_access(...)` returns the updated admin profile row.
- `admin_list_support_requests()` returns support requests with `user_name` from `public_profiles`.

---

## 13. Verification Boundaries

The repository frontend confirms table usage and observed fields.

The repository does not contain a verified SQL source of truth for:
- exact foreign keys
- exact `ON DELETE` behavior
- exact unique constraints
- exact RLS policy definitions

Those backend details should be documented from migrations, SQL dumps, or Supabase schema exports when available.

---

## 14. Summary

The current client-observed schema is centered on:
- profiles
- public profiles
- events
- participants
- notification settings
- support requests
- invitations

It is sufficient to explain the current frontend behavior without making unverified backend claims.
