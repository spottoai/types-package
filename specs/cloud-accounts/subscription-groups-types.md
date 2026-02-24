# Repo Spec (Types)

## Metadata
Status: draft
Approved: No
Iterations: 0
Last updated: 2026-02-23
Repo: types-package
Domain: cloud-accounts
Parent spec: core/specs/cloud-accounts/subscription-groups/subscription-groups.md
Spec location: specs/cloud-accounts/subscription-groups-types.md

## Summary
Extend shared types to support subscription group metadata and emoji icon rendering.

## Scope (Repo-Specific)
In scope:
- Add `groupName?: string` to `SubscriptionInfoBase` for subscription-level grouping.
- Add `icon?: string` to `SubscriptionInfoBase` to carry the emoji shortcode used in UI.

Out of scope:
- Any runtime logic or validation.

## Approach
- Update `types-package/src/accounts/accounts.ts`:
  - `SubscriptionInfoBase`: add `groupName?: string` + `icon?: string`.
- Ensure downstream type exports remain compatible (no breaking required fields).

## Tasks (Sequential)
1. Add optional fields to `CloudAccount` and `SubscriptionInfoBase`.
   File: `types-package/src/accounts/accounts.ts`
2. Update any affected type exports or build artifacts if required by repo tooling.

## Test Strategy
- N/A (types only). Run type build if required by CI.

## Definition of Done (DoD)
- Types compile with new optional fields.
- No breaking changes to existing interfaces.

## References
- `core/specs/cloud-accounts/subscription-groups/subscription-groups.md`
- `types-package/src/accounts/accounts.ts`
