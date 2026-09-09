# DEV-863 Bastion Scheduled Availability - Types Package

## Metadata

Status: draft
Approved: No
Iterations: 2
Last updated: 2026-09-09
Repo: types-package
Domain: scheduler
Parent spec: core/specs/scheduler/dev-863-bastion-scheduled-availability/dev-863-bastion-scheduled-availability.md
Spec location: types-package/Specs/scheduler/dev-863-bastion-scheduled-availability/dev-863-bastion-scheduled-availability-types.md

## Summary

Add the smallest backward-compatible public contracts needed for a Bastion-specific weekly access-window schedule, its server-compiled restore/remove runs, permission readiness, bounded control/status, pause, and restore-now responses. Do not add generic strategy, catalog, maturity, registry, Blob, Table, snapshot-body, or ARM continuation contracts.

## Scope

In scope:

- A Bastion-specific weekly access-window shape without changing VM wire shapes.
- bastion-availability-weekly definition and write-request DTOs; the fixed restore lead is server-owned and not caller-configurable.
- Bastion remove/restore compiled-run metadata.
- Bastion-specific readiness, control, status, reason-code, pause, and restore-now DTOs.
- Dependency-free exact-field validators for externally received Bastion DTOs.

Out of scope:

- resource-strategy-weekly, capability catalogs, strategy maturity, or generic strategy configuration.
- Snapshot bodies, physical storage paths, lease/state rows, dependency manifests, ARM operation URLs, SDK clients, or runtime business logic.
- Removing or changing existing VM and atomic contracts.

## Deferred Ideas

- Migrating VM and Bastion definitions to a future generic resource-strategy contract.
- Generic execution status across on-off, dial, SKU-change, and recreate strategies.

## Success Criteria

- Existing VM and atomic fixtures remain source- and wire-compatible.
- Bastion requests require one resource, one to fourteen bounded accessWindows, acknowledgementVersion, and a supported definition discriminator.
- Bastion queue runs form an exact discriminated union: remove requires definitionRevision, controlGeneration, and scheduledForUtc; restore requires definitionRevision and scheduledForUtc and forbids action/storage authority.
- The shared control/status projections reveal only coordination and recovery state; they cannot contain snapshot content, physical storage paths, session identities, dependency bodies, or ARM continuation data.
- API, cloud-engine, and UI compile against the same exported wire DTOs without local duplicate request definitions.

## Assumptions and Constraints

- Validated: scheduleRunId already identifies a due occurrence and is reused when the same dispatch is retried.
- Constraint: definitionRevision is a positive, monotonically increasing JavaScript safe integer allocated through API repository compare-and-swap for each create/update attempt and becomes executable only when the matching control generation is active.
- Constraint: controlGeneration is a positive, monotonically increasing JavaScript safe integer advanced through compare-and-swap for every create, update, pause, or resume desired-state mutation. It is coordination evidence, not a storage ETag.
- Constraint: scheduledForUtc is an ISO UTC timestamp copied from the scheduler due occurrence.
- Constraint: the fixed version 1 restoreLeadMinutes value is 30 and is applied by API when compiling each access-window start; callers cannot send or override it.
- Constraint: the only accepted version 1 acknowledgementVersion is bastion-delete-recreate-v1.
- Constraint: all new union members are additive and optional on pre-existing schedule run shapes; Bastion validators make them mandatory only for Bastion runs.
- Constraint: types-package performs structural validation only and owns no vendor policy or storage behavior.

## Cross-Repo Touchpoints

- API creates Bastion definitions, increments definitionRevision, compiles child schedules, and emits the shared run DTO.
- API publishes BastionScheduleControlV1; cloud-engine validates it before remove.
- Cloud-engine validates the run DTO again and publishes BastionAvailabilityStatusV1.
- API returns the shared readiness/status/restore response DTOs.
- UI imports wire DTOs from types-package and maps them into local view models.

## Canonical Contract Shapes

- BastionAvailabilityWindow: windowId, non-empty unique daysOfWeek, accessStartTimeLocal, and accessEndTimeLocal. Equal times are invalid; an end earlier than start means the following local day, so every window is greater than zero and less than 24 hours. API owns restore/remove day-shift compilation.
- BastionAvailabilityWeeklyConfiguration: accessWindows only.
- BastionAvailabilityWeeklyScheduleWriteRequest: definitionType bastion-availability-weekly, name, providerName, providerScopeId, cloudAccountId, resourceId, optional targetResourceType, optional timezone and notes, acknowledgementVersion, and configuration.
- BastionAvailabilityWeeklyScheduleDefinition: the persisted composite definition plus required targetResourceType Microsoft.Network/bastionHosts and positive definitionRevision.
- BastionAvailabilityOperation: remove or restore.
- Bastion definition and compiled-child additions include definitionRevision. BastionRemoveScheduleRun requires definitionId, definitionRevision, controlGeneration, definitionType bastion-availability-weekly, compiledOperation remove, scheduleRunId, and scheduledForUtc. BastionRestoreScheduleRun requires the same fields except controlGeneration and fixes compiledOperation restore. The recurring child does not persist controlGeneration; API stamps the exact current generation only when expanding remove. No actionDefinitionId is accepted as Bastion authority.
- BastionScheduleControlV1: schemaVersion 1, companyId, resourceId, definitionId, definitionRevision, controlGeneration, desiredStatus active/paused, and updatedAtUtc. Physical ETags and remove-claim fields are not public contracts.
- BastionScheduleReadinessStatus: confirmed, missing, unknown, or unsupported.
- BastionScheduleReadinessV1: schemaVersion 1, status, companyId, cloudAccountId, subscriptionId, resourceId, requiredActions, missingActions, optional reasonCode, and checkedAtUtc.
- BastionAvailabilityPhase: available, removing, absent, or restoring.
- BastionAvailabilityResult: succeeded, skipped, blocked, or failed.
- BastionAvailabilityReasonCode: feature-disabled, resource-not-found, unsupported-profile, unsupported-region, missing-permission, permission-unknown, management-lock, active-sessions, session-state-unknown, snapshot-failed, active-snapshot-missing, source-drift, dependency-missing, dependency-drift, stale-run, continuation-overdue, azure-operation-failed, or restore-timeout.
- BastionAvailabilityStatusV1: schemaVersion 1, companyId, resourceId, definitionId, definitionRevision, phase, lastOperation, lastResult, optional reasonCode, optional snapshotCapturedAtUtc, restoreAvailable, and updatedAtUtc.
- BastionPauseResponse: status paused or pause-pending, resourceId, controlGeneration, and requestedAtUtc.
- BastionRestoreNowResponse: accepted, scheduleRunId, resourceId, and requestedAtUtc.

## Local Recon

- Entry points: src/scheduler/scheduler.ts, src/scheduler/index.ts, src/index.ts.
- Existing pattern: dependency-free interfaces plus scheduler.contracts.spec.ts and generated dist output.
- Existing issue to avoid: UI currently duplicates some VM wire DTOs; new Bastion wire DTOs must be imported rather than redefined.
- Remaining questions: none before implementation.

## Approach

- Extend existing discriminated unions with bastion-availability-weekly.
- Keep the Bastion access-window wire shape explicit. Reuse weekly interaction only in UI view models; do not alter or alias the existing VM wire contract in DEV-863.
- Keep Bastion lifecycle status explicit instead of expanding a universal resource-strategy status union.
- Validate exact external shapes and bounded strings, arrays, weekdays, times, integer revisions/generations, ISO timestamps, enum values, forbidden prototype keys, and forbidden storage/operation fields. Lock name to 1-120 characters, notes to at most 1,000 characters, resource identifiers to at most 2,048 characters, accessWindows to 1-14, queue/public DTO JSON to at most 16 KiB, and unique days/window IDs.

## Tasks

1. Add fail-first contract fixtures and canonical examples.
   Files: src/scheduler/scheduler.contracts.spec.ts and a focused Bastion validator test if needed.
   Action: add valid definition/write/remove-run/restore-run-without-control/readiness/control/status/pause/restore examples; add invalid cases for missing/over-limit/overlapping access windows, bad operation, remove missing generation, any run missing revision/time, caller restoreLeadMinutes, forbidden prototype keys, storage-path leakage, undeclared fields, invalid timestamps, and existing VM compatibility.
   Verify: npm run typecheck:contracts.
   Done: fixtures fail only because the new Bastion contracts and validators do not yet exist; existing contract fixtures remain unchanged.
2. Add the minimal DTOs and validators.
   Files: src/scheduler/scheduler.ts, src/scheduler/index.ts, src/index.ts, and focused validator source if the existing file would become unfocused.
   Action: add the Bastion-specific access-window definitions and DTOs, additive definition/compiled-child/queue fields, exact validators, and public-field allowlists. BastionScheduleControlV1 is a desired-state projection, not a physical Table record; do not add catalog, generic strategy, snapshot, remove-claim, lease, continuation, or other private persistence types.
   Verify: npm run typecheck:contracts and npm run lint.
   Done: every canonical example has a deterministic accept/reject result; remove without definitionRevision/controlGeneration/scheduledForUtc and restore without definitionRevision/scheduledForUtc are rejected; restore remains valid without controlGeneration; callers cannot set restore timing or operation authority; existing exported names retain their meaning.
3. Verify package and consumer compatibility.
   Files: generated dist/scheduler output and package metadata only when required by the repository workflow.
   Action: build the package, inspect exports, run the package dry-run, then compile API, cloud-engine, and UI against local types. Do not publish the package.
   Verify: npm run test, npm run build, and npm pack --dry-run, followed by each consumer local-types check.
   Done: package output contains the new ESM/CJS declarations, all four repos compile, and no dependency or version publication has occurred.

## Goal-Backward Must-Haves

Truths:

- Callers cannot express an arbitrary Azure action through the Bastion schedule contract.
- Public status is sufficient for UI recovery decisions without revealing recovery internals.
- Existing VM schedule payloads remain valid.

Artifacts:

- src/scheduler/scheduler.ts — canonical wire DTOs.
- src/scheduler/scheduler.contracts.spec.ts — compatibility and rejection corpus.

Key links:

- API compiler to cloud-engine handler through SchedulerBatchRunItem carrying a fixed operation and remove-only controlGeneration.
- API control projection to cloud-engine through BastionScheduleControlV1.
- Cloud-engine status projection to API and UI through BastionAvailabilityStatusV1.

## Test Strategy

- Contract: valid and invalid definition, access-window, queue, readiness, control, status, pause, and restore DTOs.
- Compatibility: unchanged VM and atomic fixtures.
- Consumer compile: API, cloud-engine, and UI against the local package.
- Coverage target: at least 80 percent of new validator branches.

## Definition of Done

- [ ] Unit/contract tests cover happy, error, and boundary shapes.
- [ ] Existing VM contract corpus passes unchanged.
- [ ] npm run test, build, lint, formatting, and package dry-run pass on Node 24.
- [ ] API, cloud-engine, and UI compile against local types.
- [ ] Review confirms no generic catalog/runtime policy or private recovery data entered public contracts.
- [ ] Package publication remains a separate explicit authorization.

## Risks and Mitigations

- Risk: Bastion-specific DTOs later require migration to the generic scheduler.
- Mitigation: keep the discriminator additive and the weekly rule shape reusable; defer migration until the generic architecture is approved.
- Risk: status union grows into an engine state dump.
- Mitigation: expose only phase, last operation/result, stable reason, timestamps, and restore availability.
- Risk: optional queue fields are accidentally omitted for Bastion.
- Mitigation: exact Bastion runtime validator and compile-time fixtures require them.
- Risk: a storage/coordination field leaks into the shared contract.
- Mitigation: public exact-field allowlists reject ETags, physical keys, claims, operation URLs, tokens, snapshot bodies, and dependency bodies.

## Runtime Environment

- Start: N/A; compile-time package.
- Env vars: none.
- Tests: npm run typecheck:contracts, npm run test, npm run lint, npm run build, npm pack --dry-run.

## Plan Iteration Notes

- Iteration 1 replaces the generic resource-strategy contract with a Bastion-specific additive contract and defines exact minimum wire shapes.
- Iteration 2 replaces caller-authored restore/remove rules with accessWindows and server-owned lead time; separates definitionRevision from controlGeneration; adds bounded pause/status reasons and exact security/input limits without exposing physical coordination state.
