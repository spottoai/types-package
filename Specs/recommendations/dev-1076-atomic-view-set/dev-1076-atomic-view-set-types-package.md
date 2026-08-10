Status: implemented
Approved: Yes — Jay Ji, 2026-08-07, DEV-1076
Iterations: 1
Last updated: 2026-08-07
Owner: Platform
Repo: types-package
Domain: recommendations
Parent spec: core/specs/recommendations/dev-1076-atomic-view-set/dev-1076-atomic-view-set.md

# DEV-1076 Types Package Spec

## Summary

Define the storage-neutral contracts used by Cloud Engine to publish one completed Azure portal/plugin view set and by API to validate and read it. Move the resource recommendation evidence sidecar shape out of API-local declarations so producer and consumer compile against the same contract.

## Scope

In scope: versioned view-set references, completed pointer, runtime validator, resource evidence entries, and root exports.

Out of scope: physical blob paths, repository APIs, I/O, lifecycle-state persistence, and runtime publication logic.

## Success Criteria

- Validator rejects incomplete status, empty subscription/run identities, non-canonical timestamps, physical URLs, and invalid economics identity; storage-scoped consumers perform the expected-subscription comparison.
- Contract supports one recommendation payload per evidence entry and complete resource evidence without fabricating unavailable amortized spend.
- Packed root entry point exports every new contract.

## Approach

- Add the contracts beside existing `CompletedViewManifestV2` in `src/azure/views.ts` and recommendation resource types in `src/azure/recommendations.ts`.
- Keep schema version `1` specific to the cross-surface pointer; do not change completed-manifest schema version `2`.
- Expose a dependency-free type guard/validator; do not add storage dependencies.

## Tasks

1. Add failing contract compile/runtime cases.
   Files: `src/azure/azureViewSet.contracts.spec.ts`, `tsconfig.contracts.json`.
   Verify: `npm run typecheck:contracts` fails because contracts/validator do not exist.
   Done: tests name malformed pointer and valid pointer behavior.
2. Add view-set and evidence contracts plus validator.
   Files: `src/azure/views.ts`, `src/azure/recommendations.ts`, `src/index.ts` if required.
   Verify: `npm run typecheck:contracts && npm run build`.
   Done: valid fixtures compile and runtime validation returns expected literal results.
3. Validate packed exports and formatting.
   Files: package-generated output only.
   Verify: `npm test && npm run lint && npm run format:check`.
   Done: all package gates pass without a manual version bump.

## Test Strategy

- Contract compilation for producer/consumer shapes.
- Runtime validation for valid, wrong-schema, incomplete, cross-subscription, URL-bearing, and empty identity cases.
- Package build and packed export checks.

## Definition of Done

- [x] Unit/contract tests cover happy, malformed, and boundary cases.
- [x] Root packed output exports contracts and validator.
- [x] No runtime I/O or physical storage details are introduced.
- [x] Feature validation in consuming repos is recorded.
- [x] Security/performance/modularity review completed.
- [x] Docs/MCP/Swagger/demo updates: N/A — compile-time storage contract only.

## Risks and Mitigations

- Risk: contract becomes coupled to Azure Blob implementation.
- Mitigation: allow logical manifest paths only and reject URL-like values.
- Risk: consumer versions drift.
- Mitigation: consumers keep narrow tested compatibility declarations until the post-merge prerelease is published, then update lockfiles and remove those declarations mechanically.

## Runtime Environment

- Start: N/A.
- Env vars: none.
- Tests: `npm run typecheck:contracts`, `npm test`, `npm run build`.
