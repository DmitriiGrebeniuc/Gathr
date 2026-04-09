# Gathr - Database Schema Documentation

## 1. Overview

Gathr uses Supabase (PostgreSQL) as its primary data storage layer.

The schema is designed around event coordination and user interaction.

Core entities:
- users (managed by Supabase Auth)
- profiles
- events
- participants
- notification_settings

---

## 2. Auth Layer

User authentication is managed by Supabase Auth.

### Table
- `auth.users`

This table is managed by Supabase and contains:
- user id
- email
- authentication metadata

Application-level tables reference `auth.users.id`.

---

## 3. Profiles

### Table: `profiles`

Represents user profile data.

### Fields

- `id` (uuid, primary key, references auth.users.id)
- `name` (text)

### Usage

- display user names
- resolve creator names for events
- resolve participant names

---

## 4. Events

### Table: `events`

Core entity representing an event.

### Fields

- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `date_time` (timestamp)
- `location` (text)
- `location_place_id` (text)
- `location_lat` (numeric)
- `location_lng` (numeric)
- `activity_type` (text)
- `creator_id` (uuid, references auth.users.id)

### Usage

- event discovery
- event detail view
- event editing
- event filtering

### Constraints (logical)

- only the creator can update the event
- only the creator can delete the event

---

## 5. Participants

### Table: `participants`

Represents the relationship between users and events.

### Fields

- `event_id` (uuid, references events.id)
- `user_id` (uuid, references auth.users.id)
- `created_at` (timestamp)

### Usage

- track event membership
- build joined events list
- calculate participant count
- generate notifications

### Constraints (logical)

- a user should not join the same event multiple times
- the creator is automatically a participant

---

## 6. Notification Settings

### Table: `notification_settings`

Stores user-specific notification preferences.

### Fields

- `user_id` (uuid, references auth.users.id)
- `notify_upcoming_events` (boolean)
- `notify_new_participants` (boolean)

### Default behavior

If no row exists:
- notifications are treated as enabled

---

## 7. Relationships

### User to Profile
- one-to-one

### User to Events
- one-to-many (creator)

### User to Participants
- one-to-many

### Event to Participants
- one-to-many

### Event to Creator
- many-to-one

---

## 8. Realtime Subscriptions

Supabase realtime is used on the following tables:

- `events`
- `participants`

### Effects

- UI updates when events change
- participant lists update in real time
- notification feed refreshes automatically

---

## 9. Suggested Constraints and Improvements

### Unique constraint

```sql
UNIQUE (event_id, user_id)
```

Prevents duplicate participation records.

### Foreign key constraints

- participants.event_id -> events.id
- participants.user_id -> auth.users.id
- events.creator_id -> auth.users.id

### Indexes

Recommended indexes:

- events(date_time)
- events(creator_id)
- participants(user_id)
- participants(event_id)

---

## 10. Row Level Security (Recommended)

For production usage, enable RLS policies.

### Profiles
- users can read all profiles
- users can update only their own profile

### Events
- anyone can read events
- only creator can update or delete event

### Participants
- users can join/leave events
- users can read participants

### Notification settings
- users can read and update only their own settings

---

## 11. Future Extensions

Potential schema improvements:

- add `max_participants` to events
- add `status` to events (active, cancelled, completed)
- add `is_private` flag
- add invitation system
- add event categories table instead of enum-like activity_type
- add notification history table for persistent notifications

---

## 12. Summary

The current schema is optimized for:
- fast MVP delivery
- simple relational model
- realtime-driven UI

It is sufficient for early-stage usage and can be extended incrementally as the product grows.
