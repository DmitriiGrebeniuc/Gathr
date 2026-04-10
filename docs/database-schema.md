# Gathr - Database Schema Documentation

## 1. Overview

Gathr uses Supabase (PostgreSQL) as its primary data storage layer.

This document reflects the schema that can be observed from the frontend code in this repository.
It does not assert database constraints or RLS rules unless they are directly visible in the project files.

Current core entities used by the client:
- `auth.users`
- `profiles`
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

Represents user profile data and entitlement state used by the client.

### Observed fields

- `id`
- `name`
- `plan`
- `has_unlimited_access`

### Usage

- display user names
- resolve creator names for events
- resolve participant names
- edit current profile name
- resolve client-side event and invitation limits

---

## 4. Events

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

### Usage

- event discovery
- event detail view
- event editing
- event filtering
- invitation context
- notification generation
- shared-event entry path

---

## 5. Participants

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
- calculate participant count
- render participant lists
- generate join notifications

---

## 6. Notification Settings

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

## 7. Support Requests

### Table: `support_requests`

Stores user-submitted support messages.

### Observed fields

- `user_id`
- `subject`
- `message`

### Usage

- submit support form requests from `SupportScreen.tsx`

---

## 8. Event Invitations

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

## 9. Relationships

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

## 10. Realtime-Relevant Tables

Supabase realtime is used on the following tables:

- `events`
- `participants`
- `event_invitations`

### Effects

- UI updates when events change
- participant views refresh in real time
- notifications refresh when invitations change

---

## 11. Verification Boundaries

The repository frontend confirms table usage and observed fields.

The repository does not contain a verified SQL source of truth for:
- exact foreign keys
- exact `ON DELETE` behavior
- exact unique constraints
- exact RLS policy definitions

Those backend details should be documented from migrations, SQL dumps, or Supabase schema exports when available.

---

## 12. Summary

The current client-observed schema is centered on:
- profiles
- events
- participants
- notification settings
- support requests
- invitations

It is sufficient to explain the current frontend behavior without making unverified backend claims.
