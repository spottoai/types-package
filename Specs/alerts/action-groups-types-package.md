# Action Groups — Types Package Implementation Plan

## Metadata
Status: draft
Approved: No
Iterations: 0
Last updated: 2026-07-22
Repo: types-package
Domain: alerts
Parent spec: core/specs/action-groups/README.md
Spec location: types-package/Specs/alerts/action-groups-types-package.md

## Summary
Add the shared Action Group contracts and extend Alert Definitions with the mutually exclusive Action Group target fields used by API, UI, and cloud-engine.

## Scope (Repo-Specific)
In scope:
- Action Group action, record, summary, count, create, and update contracts.
- Optional `actionGroupId` and alert-owned `notifyOn` fields on Alert Definitions.
- Create/update input contracts that allow either target mode without changing existing destination shapes.

Out of scope:
- Runtime validation, persistence, permissions, notification dispatch, or UI state.
- Migration or removal of `destinations`.

## Deferred Ideas
- Delivery history, test-send contracts, nested Groups, inheritance, and multiple Groups per Alert.

## Success Criteria (Repo)
- All consumers can import Action Group contracts from the package root.
- Existing Custom Destination contracts remain source-compatible.
- Contract fixtures prove Action Group and Custom Destination payloads compile.

## Assumptions and Constraints (Post-Recon)
- [x] `BaseAlertDefinition` is the shared source for cost and quick Alert records (validated in `src/events/baseAlert.ts` and `src/events/quickAlerts.ts`).
- [x] Lifecycle values remain `open | acknowledged | resolved` (validated in `src/events/baseAlert.ts`).
- Consumers currently pin beta package versions; feature verification will use a local packed build, while merge rollout publishes types first and then bumps consumers.
- Runtime XOR validation belongs to API, not TypeScript structural typing, to avoid a breaking union rewrite.

## Cross-Repo Touchpoints
- API persists and returns these contracts.
- UI submits and renders these contracts.
- cloud-engine resolves Group records and reads Alert `actionGroupId`/`notifyOn`.

## Local Recon
- Entry points checked: `src/events/index.ts`, `src/events/baseAlert.ts`, `src/events/quickAlerts.ts`.
- Existing patterns found: event-domain modules exported from `src/events/index.ts`; compile-only contract tests under `tests/`.
- Relevant docs: `ARCHITECTURE.md`, `AGENTS.md`, parent Action Groups spec.
- Remaining questions: none.

## Approach
Create a focused `actionGroups.ts` event-domain module. Keep Group recipients free of lifecycle events. Add optional Alert target fields to the existing base definition and editable input pick without altering embedded destinations.

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

## Test Strategy
- Unit/contract: compile valid inputs and expected invalid server-authored fields.
- Integration: `npm pack --dry-run`/packed export check ensures downstream availability.
- E2E: N/A; this repository contains contracts only.

## Definition of Done (DoD)
### Feature Criteria
- Shared contracts exactly match the approved data model.
- No lifecycle event field exists on Group recipients.
- Existing Alert destination consumers continue to compile.

### Completion Checklist
- [ ] Contract tests cover happy, boundary, and invalid compile cases
- [ ] `build`, lint, formatting, and packed export checks pass
- [ ] Downstream repos verified against a local packed artifact
- [ ] Swagger/OpenAPI N/A (owned by API)
- [ ] Demo data N/A (no standalone demo package)

## Risks and Mitigations
- Risk: a stricter discriminated union would break legacy records.
- Mitigation: keep fields optional in contracts and enforce XOR at the API write boundary.
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
