# DEV-1135 Latest Contract Migration — Types Package

## Metadata

Status: implementation complete; package publication pending
Approved: Yes
Approved by: Jay Ji, 2026-08-19
Iterations: 0
Last updated: 2026-08-19
Repo: types-package
Domain: data-quality
Parent spec: `core/specs/data-quality/dev-1135/dev-1135-latest-contract-migration.md`
Spec location: `types-package/Specs/data-quality/dev-1135-latest-contract-migration-types-package.md`

## Summary

Define the epoch-free, latest-only Billing authority contracts and View coordinator required by DEV-1135 while preserving immutable Billing V2 documents, Published View Manifest V4, and DEV-1131 canonical savings payload semantics.

## Scope (Repo-Specific)

In scope:

- Add `BillingAnalyzerRequestV3`, `BillingAnalyzerInputCurrentPointerV2`, and `BillingAnalysisCurrentPointerV2` without `publicationMode` or ownership epoch.
- Make `PublishedAzureViewSetV3` epoch-free and enforce positive source/policy revisions through an authority-scoped validator/comparator.
- Add one collision-free run-reference helper using bounded UTF-8 plus unpadded base64url.
- Update exact-field validators, canonicalizers, contract tests, portable corpus, CJS/ESM exports, and generated `dist` output.
- Remove Billing/View Observe-only public contracts after all DEV-1135 consumers have migrated in the same coordinated delivery.

Out of scope:

- Billing calculation DTOs and immutable V2 manifest shapes.
- DEV-1131 savings allocation, attribution, money, or presentation contracts.
- Provider-neutral legacy comparator semantics used by contracts outside DEV-1135.

## Deferred Ideas

- General-purpose opaque identifier encoding beyond the run namespace.
- Legacy artifact garbage collection.

## Success Criteria (Repo)

- Latest queue and pointer validators reject epoch, Observe, undeclared fields, invalid identity, unsafe paths, and non-positive revisions.
- View Set V3 accepts the approved epoch-free identity and rejects an epoch-bearing or incomparable authority shape.
- Distinct bounded raw run IDs produce distinct deterministic storage references while semantic IDs remain unchanged.
- Package build, contract corpus, packed exports, and downstream local-package compilation pass.

## Assumptions and Constraints (Post-Recon)

- [x] Immutable Billing V2 input/output manifests already permit epoch-free identity and remain unchanged.
- [x] Current Request V2 and pointer V1 validators require epoch and mode; current View Set V3 requires epoch.
- Shared validators are dependency-free; hashing remains at producer/runtime boundaries.
- The package is compile-time/validation only and owns no storage or queue I/O.

## Cross-Repo Touchpoints

- Cloud Engine emits Request V3, pointers V2, View Manifest V4, and View Set V3.
- Metrics Analyzer accepts Request V3 and writes output pointer V2.
- API reads pointer V2 and View Set V3.
- All TypeScript consumers pin one exact DEV-1135 package release and corpus SHA.

## Local Recon

- Entry points checked: `src/azure/billingArtifactGeneration.ts`, `src/azure/views.ts`, `src/common/artifactEvidence.ts`, `src/index.ts`.
- Existing patterns found: dependency-free exact validators, canonical preimages, corpus-driven mutations, CJS/ESM packed-export verification.
- Relevant docs: `AGENTS.md`, `README.md`, `.agents/skills/types-package-architecture/SKILL.md`.
- Remaining questions: package version is assigned at release; local cross-repo verification uses a packed tarball before any registry publication.

## Approach

- Introduce the latest contract family beside current definitions so consumer migrations can compile incrementally, then remove Observe-only exports and fixtures before final verification.
- Reuse immutable Billing V2 identity/digest helpers and add narrowly scoped latest-authority identity validation.
- Keep raw generation IDs separate from encoded storage run references at the type/API boundary.

## Tasks (Sequential)

1. Add failing latest-contract and run-reference tests.
   Files: `src/azure/billingArtifactGeneration.contracts.spec.ts`, `src/azure/azureViewSet.contracts.spec.ts`, new focused run-reference test, portable corpus fixtures.
   Action: cover valid epoch-free authority, old-mode/epoch rejection, exact fields, Unicode/collision/length cases, and semantic/raw ID preservation.
   Verify: `npm run typecheck:contracts`.
   Done: tests fail only because the DEV-1135 contracts/helpers are absent.
2. Implement latest Billing/View contracts and helpers.
   Files: `src/azure/billingArtifactGeneration.ts`, `src/azure/views.ts`, `src/common/*` or one focused Azure helper, `src/index.ts`.
   Action: add types, validators, canonicalizers, scoped revision behavior, and bounded run-reference encoding without runtime I/O.
   Verify: targeted contract checks plus `npm run build`.
   Done: exact latest contracts accept/reject every planned boundary.
3. Remove Observe public surface and refresh portable evidence.
   Files: source validators/exports, fixtures, scripts, README, generated `dist/**`.
   Action: delete diagnostic-only Billing/View contract exports after consumers migrate; regenerate corpus SHA and build output.
   Verify: `npm test` and local packed-consumer check.
   Done: final package source contains no Billing/View authority Observe contract and every consumer compiles against the same tarball.

## Test Strategy

- Unit/contract: validators, canonicalizers, revision comparisons, run encoding, mutation rejection.
- Integration: package build plus packed CJS/ESM and local API/cloud-engine/UI compilation.
- E2E: covered by producer/analyzer/API regenerated fixture in sibling specs.
- Coverage target: all new validators/helpers exercise happy, error, collision, Unicode, and bound cases.

## Definition of Done (DoD)

### Feature Criteria

- Latest contracts and helpers exist with exact tested semantics.
- Observe-only public Billing/View authority contracts are absent from the final package.

### Completion Checklist

- [x] Unit/contract tests added with happy/error/boundary coverage
- [x] Local packed downstream consumers compile
- [x] Security, performance, and modularity review completed
- [x] Canonical package quality gate passes
- [x] Public docs N/A — internal authority migration
- [x] Swagger/MCP/demo data N/A — no endpoint or user-visible contract change

Target release: `@spottoai/types-package@1.0.2-beta.367`. Registry publication and exact downstream lockfile updates remain a cross-repo Gate 1 release step; local verification used the packed DEV-1135 source.

## Risks and Mitigations

- Risk: removing old exports breaks a consumer missed by recon.
- Mitigation: search every DEV-1135 repo and compile all consumers from the exact local tarball before removal is accepted.
- Risk: encoded path value replaces semantic generation ID.
- Mitigation: separate helper/type names and cross-repo fixtures asserting raw ID in manifests and headers.

## Rollback / Feature Flag

- No runtime flag exists in this package. Rollback redeploys the prior package consumers as a coordinated set.

## Security Considerations

- Reject control characters, prototype keys, unsafe lengths, epoch/mode fields, and undeclared authority fields.
- Encoding is injective and bounded; it is not authorization or secrecy.

## Runtime Environment

- Start: N/A, compile-time package.
- Env vars: none.
- Tests: `npm run typecheck:contracts`, `npm test`.

## References

- Parent DEV-1135 spec.
- `src/azure/billingArtifactGeneration.ts`.
- `src/azure/views.ts`.
- `Specs/cost-optimization/dev-1131-canonical-savings-ledger/dev-1131-canonical-savings-ledger-types-package.md`.
