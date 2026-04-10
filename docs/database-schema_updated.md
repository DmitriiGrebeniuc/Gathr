# Gathr - Database Schema Documentation

## 1. Overview

Gathr uses Supabase PostgreSQL as its primary data storage layer.

This document reflects what is directly observable from the frontend code in this repository.
Exact database constraints and RLS rules are not treated as verified unless they are present in project files.

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

Application-level tables are functionally rooted in the profile layer, which is queried by client features through user IDs.

## 3. Profiles

### Table: `profiles`

Represents application-level user profile data and entitlement state.

### Fields
- `id`
- `name`
- `plan`
- `has_unlimited_access`

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

### Observed relationship
- `events.creator_id` identifies the creator profile used by the client

## 5. Participants

### Table: `participants`

### Fields
- `id`
- `event_id`
- `user_id`
- `created_at`

### Observed relationships
- `participants.event_id` links to an event
- `participants.user_id` links to the participant user/profile

## 6. Notification Settings

### Table: `notification_settings`

### Fields
- `user_id`
- `notify_upcoming_events`
- `notify_new_participants`
- `notify_event_invitations`
- `created_at`
- `updated_at`

### Observed relationship
- `notification_settings.user_id` identifies the current user

## 7. Support Requests

### Table: `support_requests`

### Fields
- `id`
- `user_id`
- `subject`
- `message`
- `status`
- `created_at`

### Observed relationship
- `support_requests.user_id` identifies the sender

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

### Status values observed in the client
- `pending`
- `accepted`
- `declined`

### Observed relationships
- `event_invitations.event_id` links to an event
- `event_invitations.inviter_id` identifies the inviter
- `event_invitations.invitee_id` identifies the invitee

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

## 11. Verification Boundaries

The current repository confirms:
- table usage
- observed fields
- client-side relationships
- which tables participate in realtime-driven UI

The current repository does not confirm:
- exact foreign keys
- exact `ON DELETE` behavior
- exact unique constraints
- exact RLS policy definitions

Those backend details should be documented from migrations or schema exports when available.

## 12. Entitlement and Limit Relevance

Schema fields relevant to plan enforcement:
- `profiles.plan`
- `profiles.has_unlimited_access`

Current client-side limits use these fields for:
- active events
- invitations per event
