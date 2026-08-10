# Resource Metrics Diagnostics Contract - Types Package

## Metadata

Status: implementation complete; publication pending
Approval required: Yes - parent contract changes shared consumers
Approved: Yes
Approver/evidence: User request to pick up implementation, 2026-08-10
Iterations: 2
Last updated: 2026-08-10
Repo: types-package
Domain: metrics
Parent spec: `core/specs/metrics/resource-metrics-diagnostics-contract/resource-metrics-diagnostics-contract.md`
Spec location: `types-package/Specs/metrics/resource-metrics-diagnostics-contract.md`

## Summary

Add an optional, additive coverage v2 contract to each rolling Azure resource metrics document. The contract distinguishes retained datapoints from the latest collection attempt and carries only bounded, sanitized provider-failure evidence.

## Scope (Repo-Specific)

In scope:

- Shared coverage status, per-collection status, and sanitized failure types.
- Optional `coverage` on `AzureResourceMetrics`.
- Compile-time fixtures for legacy, v2, invalid status, and unsafe failure fields.

Out of scope:

- Runtime validation or failure classification.
- Storage paths, aggregation logic, or API behavior.

## Deferred Ideas

- A subscription metrics manifest.
- Raw Azure error detail.

## Success Criteria (Repo)

- Existing metrics documents without coverage still compile.
- V2 coverage requires schema version 2, timestamps, bounded structured collection outcomes, and an allowlisted failure shape.
- Raw message, URL, request, tenant, subscription, and resource identifiers are not part of the public failure type.

## Assumptions and Constraints (Post-Recon)

- [x] `AzureResourceMetrics` is the shared rolling-document seam.
- [x] The root package already exports `src/azure/metrics.ts`.
- Coverage is optional for mixed-version rollout.
- Runtime bounds are producer responsibilities; TypeScript documents the maximums but cannot enforce array length.

## Cross-Repo Touchpoints

- Cloud Engine writes coverage v2 after this package is published.
- API imports the shared exact document type and passes additive fields through.
- Existing UI and recommendation readers continue to accept documents without coverage.

## Local Recon

- Entry points checked: `src/azure/metrics.ts`, `src/index.ts`, `tsconfig.contracts.json`, package scripts.
- Existing patterns found: compile-only `*.contracts.spec.ts` fixtures and root barrel exports.
- Relevant docs: `AGENTS.md`, `README.md`, types-package architecture skill.
- Remaining questions: release version is selected by the publishing workflow.

## Approach

- Define literal unions and interfaces beside `AzureResourceMetrics`.
- Keep all additions optional at the document boundary.
- Use compile fixtures to prove exact public names and backward compatibility.

## Tasks

1. Lock the compile-time contract
   Files: `src/azure/metrics.contracts.spec.ts`, `tsconfig.contracts.json`
   Action: add positive legacy/v2 fixtures and negative unsafe/invalid fixtures.
   Verify: `npm run typecheck:contracts`
   Done: fixtures fail before the types exist and pass only for the intended public shape.
2. Add and export coverage v2
   Files: `src/azure/metrics.ts`
   Action: add optional coverage, collection outcomes, and sanitized failures without changing existing required fields.
   Verify: `npm run build`
   Done: root imports compile for legacy and v2 documents.
3. Prepare consumer rollout
   Files: package release artifacts produced by the existing workflow
   Action: publish the additive package before enabling the Cloud Engine writer.
   Verify: downstream Cloud Engine and API builds use the released version.
   Done: consumers resolve one published contract version.

## Test Strategy

- Compile-time contract fixtures for happy, legacy, invalid-status, and unsafe-field cases.
- Package build, lint, and format checks.
- Coverage target: N/A for interface-only code; compile-time fixtures replace runtime coverage.

## Definition of Done

- [x] Contract fixtures pass.
- [x] Package build, lint, and changed-file format checks pass.
- [x] Generated declarations contain the intended additive surface.
- [ ] Consumer release version is recorded or marked outstanding.
- Security/performance runtime review: N/A; this repository adds declarations only.

## Verification Evidence

- `npm test`: passed, including compile-time contracts and packed consumer export checks.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed and generated the additive `dist/azure/metrics` declarations.
- Targeted Prettier checks for changed source and contract files: passed.
- Repository-wide `npm run format:check` remains outside this change because the baseline reports unrelated existing files.

## Risks and Mitigations

- Risk: a producer persists unbounded or sensitive failure detail.
  Mitigation: expose only structured allowlisted fields; verify runtime sanitation in Cloud Engine.
- Risk: consumers install different versions.
  Mitigation: publish before the writer and verify dependency/lockfile alignment.

## Rollback

- Revert the optional declarations and publish a follow-up prerelease. Legacy documents remain valid.

## Runtime Environment

- Start: N/A
- Env vars: none
- Tests: `npm run typecheck:contracts`, `npm run build`, `npm run lint`, `npm run format:check`

## References

- Parent spec
- `src/azure/metrics.ts`
- `src/index.ts`
