# Gathr - Plans and Limits Documentation

## 1. Purpose

This document describes the current entitlement model and the first product limits already introduced into the MVP.

The goal of this layer is:
- protect the product from abuse
- create a clear path to monetization
- support admin/test users
- allow selected unlimited accounts
- keep future expansion manageable

## 2. Entitlement Model

Current profile-level fields:

### `role`
Allowed values:
- `user`
- `admin`

Purpose:
- future admin and moderation access
- not the main driver of numeric product limits

### `plan`
Allowed values:
- `free`
- `pro`

Purpose:
- commercial tiering
- determines standard product limits

### `has_unlimited_access`
Boolean override.

Purpose:
- bypass all current plan-based limits
- useful for admins
- useful for internal testers
- useful for selected privileged users

## 3. Recommended Interpretation

Standard free user:
- `role = user`
- `plan = free`
- `has_unlimited_access = false`

Standard pro user:
- `role = user`
- `plan = pro`
- `has_unlimited_access = false`

Admin with unlimited access:
- `role = admin`
- `plan = free`
- `has_unlimited_access = true`

Special unlimited user:
- `role = user`
- `plan = free`
- `has_unlimited_access = true`

## 4. Resolution Order

All current limit checks should follow this order:
1. load profile entitlement fields
2. if `has_unlimited_access = true`, skip the limit
3. otherwise resolve product limits from `plan`
4. compare current usage with the plan limit
5. block the action with a product-level message if necessary

## 5. Shared Limit Layer

Plan-based limits should be centralized in:
- `src/app/constants/planLimits.ts`

This avoids:
- duplicated magic numbers
- inconsistent plan behavior across screens
- scattered limit changes

## 6. Current Implemented Limits

### Free
- active future events: 3
- invitations per event: 10

### Pro
- active future events: 20
- invitations per event: 100

### Unlimited users
- current plan-based limits are bypassed

## 7. Current Enforced Product Limits

### Active Future Events Limit
Used in event creation flow.

Interpretation:
- only future events count toward the limit
- past events do not count
- unlimited users bypass the limit

### Invitations Per Event Limit
Used in invitation sending flow.

Interpretation:
- all invitation rows for the event currently count toward the limit
- counted statuses:
  - `pending`
  - `accepted`
  - `declined`
- unlimited users bypass the limit

## 8. Why Role and Plan Are Separate

The project intentionally separates:
- access control
- monetization
- unlimited override behavior

Recommended usage:
- `role` for admin-only capabilities
- `plan` for commercial feature/limit tiers
- `has_unlimited_access` as a hard bypass

## 9. Future Limits That Can Be Added Later

Potential next limits:
- invitations per 24 hours
- pending invitations total
- events created per rolling period
- advanced organizer features
- promoted visibility controls

## 10. UX Rule for Limit Messaging

Limit messages should be product-facing, not technical.

Recommended pattern:
- explain the current free limitation
- explain that Pro unlocks more capacity

## 11. Summary

Gathr already contains:
- `profiles.role`
- `profiles.plan`
- `profiles.has_unlimited_access`

and the first active product limits:
- active future events
- invitations per event

This is enough to support MVP anti-abuse protection and the first monetization path while keeping the current architecture simple.
