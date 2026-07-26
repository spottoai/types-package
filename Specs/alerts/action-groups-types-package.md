# Action Groups — Types Package Implementation Plan

## Metadata
Status: review
Approved: No
Iterations: 2
Last updated: 2026-07-27
Repo: types-package
Domain: alerts
Parent spec: core/specs/action-groups/README.md
Spec location: types-package/Specs/alerts/action-groups-types-package.md

## Summary
Add the shared Action Group contracts and extend Alert Definitions and Company Notification Subscriptions with additive Action Group target fields used by API, UI, and cloud-engine.

## Scope (Repo-Specific)
In scope:
- Action Group action, record, summary, count, create, and update contracts.
- Optional `actionGroupId` and alert-owned `notifyOn` fields on Alert Definitions.
- Create/update input contracts that allow either target mode without changing existing destination shapes.
- Optional `actionGroupId` on Company Notification Subscriptions while retaining the existing `channel` and event arrays.
- Additive Action Group usage counts for Alert and Company Notification references.

Out of scope:
- Runtime validation, persistence, permissions, notification dispatch, or UI state.
- Migration or removal of Alert `destinations` or Company Notification `channel`.

## Deferred Ideas
- Delivery history, test-send contracts, nested Groups, inheritance, multiple Groups per Alert/Notification, and Company Notification Jira semantics.

## Success Criteria (Repo)
- All consumers can import Action Group contracts from the package root.
- Existing Custom Destination contracts remain source-compatible.
- Existing single-Channel Company Notification contracts remain source-compatible.
- Contract fixtures prove Action Group and Custom Destination payloads compile.
- Contract fixtures prove legacy Channel and Action Group Company Notification shapes compile.

## Assumptions and Constraints (Post-Recon)
- [x] `BaseAlertDefinition` is the shared source for cost and quick Alert records (validated in `src/events/baseAlert.ts` and `src/events/quickAlerts.ts`).
- [x] Lifecycle values remain `open | acknowledged | resolved` (validated in `src/events/baseAlert.ts`).
- [x] `NotificationSubscription` currently owns one `channel` plus product-event arrays (validated in `src/company/notification.ts`).
- Consumers currently pin beta package versions; feature verification will use a local packed build, while merge rollout publishes types first and then bumps consumers.
- Runtime XOR validation belongs to API, not TypeScript structural typing, to avoid a breaking union rewrite.

## Cross-Repo Touchpoints
- API persists and returns these contracts and validates active target modes.
- UI submits and renders Alert and Company Notification target modes.
- cloud-engine resolves Group records for Alerts and Company Notifications.

## Local Recon
- Entry points checked: `src/events/index.ts`, `src/events/baseAlert.ts`, `src/events/quickAlerts.ts`, `src/company/notification.ts`.
- Existing patterns found: event-domain modules exported from `src/events/index.ts`; compile-only contract tests under `tests/`.
- Relevant docs: `ARCHITECTURE.md`, `AGENTS.md`, parent Action Groups spec.
- Remaining questions: none.

## Approach
Create a focused `actionGroups.ts` event-domain module. Keep Group recipients free of event selection. Add optional Alert and Company Notification target fields without altering embedded destination/channel shapes. Keep the TypeScript contract additive and leave persisted XOR enforcement to API boundaries.

## Tasks (Sequential)
1. Add failing contract fixtures
   Files: `tests/actionGroups.contract-test.ts`, `tests/quickAlerts.contract-test.ts`
   Action: Compile representative Group CRUD shapes, Group-mode Alert create/update shapes, and unchanged Custom Destination shapes; assert server-owned fields are excluded from inputs.
   Verify: `npm run typecheck:contracts` fails before implementation and passes after it.
   Done: Both target modes have compile-time coverage and invalid server-owned input examples remain rejected with `@ts-expect-error`.
2. Add Action Group contracts and exports
   Files: `src/events/actionGroups.ts`, `src/events/index.ts`
   Action: Define recipient/action shapes, aggregate actions, audit record, per-channel counts, summary, and create/update input types; export them from the event barrel.
   Verify: `npm run build`.
   Done: Package-root consumers can import all approved contracts.
3. Extend Alert Definition contracts
   Files: `src/events/baseAlert.ts`, `src/events/quickAlerts.ts`
   Action: Add optional `actionGroupId` and `notifyOn`; include both in editable update inputs while preserving existing destination types and discriminators.
   Verify: `npm run lint && npm run format:check && npm run build && npm run check:packed-exports`.
   Done: Existing Alert fixtures and new Group-mode fixtures compile without a destination migration.
4. Extend Company Notification and usage contracts
   Files: `src/company/notification.ts`, `src/events/actionGroups.ts`, `tests/actionGroups.contract-test.ts`, Company Notification contract tests
   Action: First add compile fixtures for unchanged legacy Channel records, Group-mode records with an empty inactive channel, mixed arrays, and additive usage counts; then add optional `actionGroupId`, `alertUsageCount`, and `notificationUsageCount` without a breaking union rewrite.
   Verify: `npm run typecheck:contracts && npm run build && npm run check:packed-exports`.
   Done: consumers can represent both Company Notification target modes and distinguish usage sources while all existing fixtures still compile.

## Test Strategy
- Unit/contract: compile valid Alert/Notification modes, mixed legacy/Group arrays, usage counts, and expected invalid server-authored fields.
- Integration: `npm pack --dry-run`/packed export check ensures downstream availability.
- E2E: N/A; this repository contains contracts only.

## Definition of Done (DoD)
### Feature Criteria
- Shared contracts exactly match the approved data model.
- No lifecycle event field exists on Group recipients.
- Existing Alert destination consumers continue to compile.
- Existing Company Notification Channel consumers continue to compile.
- Group-mode Company Notification records can carry `actionGroupId` without moving event selection into the Group.

### Completion Checklist
- [ ] Contract tests cover happy, boundary, and invalid compile cases
- [ ] `build`, lint, formatting, and packed export checks pass
- [ ] Downstream repos verified against a local packed artifact
- [ ] Swagger/OpenAPI N/A (owned by API)
- [ ] Demo data N/A (no standalone demo package)

## Risks and Mitigations
- Risk: a stricter discriminated union would break legacy Alert and Company Notification records.
- Mitigation: keep fields optional in contracts and enforce each XOR at the API write boundary.
- Risk: consumers test against different published beta versions.
- Mitigation: verify with one local tarball, then publish/bump types before consumer merges.

## Rollback / Feature Flag
- No flag is required for additive contracts. Roll back the package version and consumer bumps if needed.

## Security Considerations
- Secret-bearing target fields remain optional to support API redaction; this package does not expose or persist secrets.

## Runtime Environment
- Start: `npm run dev`
- Env vars: none
- Tests: `npm run typecheck:contracts`; full verification: `npm run lint && npm run format:check && npm run build && npm run check:packed-exports`

## References
- `core/specs/action-groups/README.md`
- `src/events/baseAlert.ts`
- `tests/quickAlerts.contract-test.ts`
