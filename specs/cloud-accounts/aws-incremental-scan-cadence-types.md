# AWS Incremental Scan Cadence — Shared Types

## Metadata

Status: hourly scheduling types verified locally; publication and consumer adoption outstanding
Approved: incremental collection on 2026-09-21; Azure-parity scheduledScanSlot direction on 2026-10-22
Iterations: 2
Last updated: 2026-10-23
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
- `scheduledScanSlot?: never` explicitly prevents caller-selected slot values
  on global ticks, including assignment from prebuilt objects. This is a type
  boundary; owning API/engine runtime boundaries still validate untyped input.
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
   platform scheduling capability. Verify: `npm test` (fresh CJS/ESM builds,
   contract tests and packed consumers) and `npm run lint`. The historical
   `build:check` wrapper requires a clean main checkout; run its build/lint checks
   directly during development. Done: exact published dependency adoption
   recorded when a new contract release is required; no gratuitous schema bump.

## Scheduling Revision Definition of Done

- [x] Existing slot type and unchanged valid tick wire shape verified against hourly fixtures.
- [x] Packed root and `/aws` declarations verified in ESM/CommonJS consumer fixtures.
- [ ] New package release and exact consumer adoption verified in the owning repos.

## Local Verification and Consumer Handoff — 2026-10-23

- Reused the existing `ScheduledScanSlot` union without moving it or adding an
  AWS-specific slot type, persisted-state DTO, parser or scheduling implementation.
- Added hourly full-tick documentation and type-level exclusion of caller-supplied
  slots. Valid schema-1 tick payloads and existing exports remain unchanged.
- Added a regression fixture that failed before the exclusion: contract compilation
  reported an unused expected-error directive because a prebuilt tick with slot 4
  was accepted. `npm run typecheck:contracts` passed after the change.
- Packed root/AWS consumers cover a 13:00 full tick, all twelve valid slots,
  negative/high/fractional/string rejection, and prebuilt-object slot exclusion.
- Fresh `npm test` passed, including CJS/ESM builds, all contract checks and
  packed-consumer verification. `npm run lint` passed; independent review found
  no actionable issues. Existing formatting differences elsewhere in
  `accounts.ts` and the packed fixture were left unchanged.
- The build refreshed stale tracked generated output unrelated to this slice.
  Keep the source/fixture change focused; publishing rebuilds `dist` from source.
  These checks do not establish live API/engine behaviour or a shared planner
  implementation. Those remain in their owning specs.

Release a new package version through the normal workflow before installing it
in API, AWS engine or platform scheduling. Do not republish changed contents as
the existing 1.1.59 version. Local package preparation and verification do not
constitute publication. No downstream manifest/lock changes are included here.

## Original Contract Definition of Done

- [x] Tick is in the root and `/aws` declarations.
- [x] Credentials/configuration cannot be serialized on the tick.
- [x] Existing AWS commands remain source-compatible.
- [x] Build and contract checks pass.

`npm test` and packed Node 24 ESM/CommonJS consumer verification passed on
2026-09-21. Package publication/versioning remains a separate release action.
These are historical checks for the original contract. Current local types
verification is recorded above; runtime hourly scheduling and shared planner
adoption remain outstanding in the owning repositories.

## Risks and Mitigations

- Contract drift: compile exact API and engine fixtures against the packed
  artifact before consumer cutover.
