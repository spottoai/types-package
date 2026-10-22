# AWS Incremental Scan Cadence — Shared Types

## Metadata

Status: original contract implemented; hourly slot-semantics verification outstanding
Approved: incremental collection on 2026-09-21; Azure-parity scheduledScanSlot direction on 2026-10-22
Iterations: 2
Last updated: 2026-10-22
Owner: Platform
Repo: types-package
Domain: cloud-accounts
Parent spec: `core/specs/cloud-accounts/aws-incremental-scan-cadence.md`
Spec location: `types-package/specs/cloud-accounts/aws-incremental-scan-cadence-types.md`

## Summary

Retain the secret-free scheduled AWS tick in the existing command union and
reuse the existing `ScheduledScanSlot` contract for engine-owned account
scheduling. Full ticks now wake hourly due selection; the tick wire shape
does not change.

## Scope

In scope: `entity=scheduler`, `action=tick`, scheduled timestamp, and exact
`full` or `components` cadence kind. Out of scope: account lists, roles,
credentials, manifests, Regions, billing destinations, or provider windows.
No API-owned account scheduling field or public schedule endpoint is added.

## Decision

The tick carries only stable scheduler identity. Cloud-engine-aws owns all due
selection and provider-specific planning.

- Reuse `ScheduledScanSlot` from `src/accounts/accounts.ts` (0–11); do not add an
  AWS-specific numeric slot union or move slot assignments onto the tick.
- `scheduledAt` is the exact scheduled UTC hourly event for full ticks. Full
  describes selected account work, not a command to scan the fleet. Component
  ticks retain their current four daily events and existing timestamp semantics.
- The AWS Blob schedule record is engine-internal; a new public DTO is not
  needed. Retain current forbidden fields and broker/session identity contracts.
- Planner/hash/jitter implementation belongs in platform packages. Types-package
  gains neither a platform dependency nor scheduling I/O.

## Original Contract Tasks

1. Extend `src/aws/requests.ts` and barrels with the tick discriminant.
2. Extend compile-time contract fixtures for valid and forbidden payloads.
3. Run `npm run build:check` and package-consumer verification.

## Hourly Scheduling Revision Tasks

1. Files: `src/aws/requests.ts`, existing slot declaration and contract fixtures.
   Action: clarify full-tick hourly due-selection semantics and reuse the existing
   slot type. Verify: unchanged tick wire shape, slot-zero/eleven acceptance,
   invalid slot rejection and forbidden per-account/configuration fields. Done:
   no duplicate slot union or public account schedule schema introduced.
2. Files: packed API/engine consumer fixtures and release evidence. Action:
   verify the declarations consumed by both tick producers/consumers and the
   platform scheduling capability. Verify: `npm run build:check`, contract tests
   and packed ESM/CommonJS consumers. Done: exact published dependency adoption
   recorded when a new contract release is required; no gratuitous schema bump.

## Scheduling Revision Definition of Done

- [ ] Existing slot type and unchanged tick wire shape verified against hourly fixtures.
- [ ] Packed declarations consumed by API, engine and shared planner verified.

## Original Contract Definition of Done

- [x] Tick is in the root and `/aws` declarations.
- [x] Credentials/configuration cannot be serialized on the tick.
- [x] Existing AWS commands remain source-compatible.
- [x] Build and contract checks pass.

`npm test` and packed Node 24 ESM/CommonJS consumer verification passed on
2026-09-21. Package publication/versioning remains a separate release action.
These are historical checks. Hourly consumer/producer semantics and shared
planner adoption remain outstanding in the owning repositories.

## Risks and Mitigations

- Contract drift: compile exact API and engine fixtures against the packed
  artifact before consumer cutover.
