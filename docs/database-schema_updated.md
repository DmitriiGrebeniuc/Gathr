# Gathr - Database Schema Documentation

## 1. Overview

Gathr uses Supabase PostgreSQL as its primary data storage layer.

Current core entities:
- `auth.users`
- `profiles`
- `events`
- `participants`
- `notification_settings`
- `support_requests`
- `event_invitations`

## 2. Auth Layer

User authentication is managed by Supabase Auth.

### Table
- `auth.users`

Application-level tables are functionally rooted in the profile layer, which references `auth.users.id`.

## 3. Profiles

### Table: `profiles`

Represents application-level user profile data and entitlement state.

### Fields
- `id` uuid, primary key, references `auth.users.id`
- `name` text
- `role` text, default `user`
- `plan` text, default `free`
- `has_unlimited_access` boolean, default `false`

### Constraints
- `profiles.id -> auth.users.id` with `ON DELETE CASCADE`
- role check: `user`, `admin`
- plan check: `free`, `pro`

## 4. Events

### Table: `events`

### Fields
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

### Foreign key
- `events.creator_id -> profiles.id` with `ON DELETE CASCADE`

## 5. Participants

### Table: `participants`

### Fields
- `id`
- `event_id`
- `user_id`
- `created_at`

### Foreign keys
- `participants.event_id -> events.id` with `ON DELETE CASCADE`
- `participants.user_id -> profiles.id` with `ON DELETE CASCADE`

### Constraints
- unique `(event_id, user_id)`

## 6. Notification Settings

### Table: `notification_settings`

### Fields
- `user_id`
- `notify_upcoming_events`
- `notify_new_participants`
- `notify_event_invitations`
- `created_at`
- `updated_at`

### Foreign key
- `notification_settings.user_id -> profiles.id` with `ON DELETE CASCADE`

## 7. Support Requests

### Table: `support_requests`

### Fields
- `id`
- `user_id`
- `subject`
- `message`
- `status`
- `created_at`

### Foreign key
- `support_requests.user_id -> profiles.id` with `ON DELETE CASCADE`

## 8. Event Invitations

### Table: `event_invitations`

### Fields
- `id`
- `event_id`
- `inviter_id`
- `invitee_id`
- `status`
- `created_at`
- `responded_at`

### Status values
- `pending`
- `accepted`
- `declined`

### Foreign keys
- `event_invitations.event_id -> events.id` with `ON DELETE CASCADE`
- `event_invitations.inviter_id -> profiles.id` with `ON DELETE CASCADE`
- `event_invitations.invitee_id -> profiles.id` with `ON DELETE CASCADE`

### Constraints
- unique `(event_id, invitee_id)`
- inviter cannot invite self

## 9. Relationship Model

```text
auth.users
  -> profiles
    -> events
    -> participants
    -> notification_settings
    -> support_requests
    -> event_invitations

events
  -> participants
  -> event_invitations
```

## 10. Realtime-Relevant Tables

Realtime is currently used against:
- `events`
- `participants`
- `event_invitations`

## 11. Row Level Security

RLS is enabled on the main public tables.

Current intended behavior:
- profiles: authenticated users can read profiles, insert/update only own profile
- events: authenticated users can read events, insert only own events, update/delete only own events
- participants: authenticated users can read participants, insert only self, delete self, creators can remove participants from own events
- notification settings: users can read/insert/update only own settings
- support requests: users can insert own requests and read only own requests
- event invitations: inviter/invitee can read related invitations, only creator can create them, only invitee can respond

## 12. Entitlement and Limit Relevance

Schema fields relevant to plan enforcement:
- `profiles.role`
- `profiles.plan`
- `profiles.has_unlimited_access`

Current client-side limits use these fields for:
- active events
- invitations per event
