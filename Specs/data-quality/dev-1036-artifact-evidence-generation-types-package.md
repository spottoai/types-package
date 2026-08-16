# DEV-1036 Shared Artifact Evidence Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task, `superpowers:test-driven-development` for each contract change, and `superpowers:verification-before-completion` before claiming readiness.

**Goal:** Publish one additive, storage-neutral contract family for evidence state, immutable billing input/output generations, revision-safe promotion, and API/UI read states.

**Architecture:** Extract provider-neutral evidence primitives from the shipped `CapabilityPassport` semantics into focused common modules, then define Azure billing V2 documents in a separate module. Preserve every schema-v1 export and make V2 runtime validation dependency-free so Cloud Engine, API, and UI consume the same implementation while Python mirrors the same fixture corpus.

**Tech Stack:** TypeScript, dependency-free runtime validators, JSON fixture corpus, package declaration build.

## Metadata

- Status: approved — implementation in progress
- Approved: Yes — Jay Ji, 2026-08-13 (subagent-driven execution)
- Iterations: 1
- Last updated: 2026-08-17
- Repo: `types-package`
- Domain: `data-quality`
- Parent spec: `cloud-engine/Specs/data-quality/data-quality-06-artifact-completeness-and-idempotency.md`
- Spec location: `Specs/data-quality/dev-1036-artifact-evidence-generation-types-package.md`

## Scope

In scope:

- Independent support, applicability, attempt, coverage, empty-proof, freshness, evidence, lifecycle, and publication states.
- Ownership binding with an optional observe-mode epoch and an explicit enforceable-ownership validator.
- Component-wise revision comparison with deterministic equal/incomparable outcomes.
- Billing analyzer V2 input manifest, queue envelope, output manifest, promoted pointer, and read-state contracts.
- Current, N-1, additive-next, malformed, and unknown-version fixtures.

Out of scope:

- Blob paths outside logical artifact references, storage clients, CAS I/O, feature flags, and product calculations.
- Breaking or removing `ArtifactGeneration`, `BillingGenerationState`, `BillingAnalyzerRequest`, `BillingGenerationOutput`, or `CapabilityPassport` schema v1.
- A generic policy execution engine.

Deferred ideas:

- Generating Python models directly from a schema compiler; DEV-1036 uses an explicit mirrored corpus and version/digest gate.
- Migrating non-billing recommendation families to the new evidence vocabulary.

## Success Criteria

- `complete-empty` is rejected unless attempt succeeded, coverage is complete, and an empty-proof reference is present.
- Enforce-mode pointer validation rejects missing ownership epoch, non-canonical timestamps, unsafe logical paths, digest mismatches, and unknown schema versions.
- Revision comparison returns `equal` only for equal ownership/source/policy revisions; digest equality remains a repository promotion precondition, not a revision shortcut.
- Existing V1 compile fixtures and package consumers remain valid.
- The root packed entry point exports all V2 types, constants, validators, and the comparator.

## Local Recon

- `src/common/artifactGeneration.ts` already owns provider-neutral generation, descriptor, and completed-pointer V1 contracts.
- `src/common/capabilityPassport.ts` already proves independent attempt, freshness, availability, and complete-empty semantics.
- `src/azure/billingGeneration.ts` is the DEV-1047 V1 queue/output contract and must remain unchanged.
- `fixtures/capability-passport-contract-corpus.json` plus `scripts/check-capability-passport-contracts.mjs` is the runtime-corpus pattern to reuse.
- Package publishing is automatic from `main`; feature work must not manually bump `package.json`.

## Interfaces

The implementation must publish these exact public names:

```ts
export interface ArtifactOwnershipBinding {
  provider: ArtifactProvider;
  tenantId: string;
  companyId: string;
  cloudAccountId: string;
  accountId: string;
  ownershipEpochRevision?: number;
}

export interface ArtifactRevisionVector {
  ownershipEpochRevision?: number;
  sourceRevision: number;
  policyRevision: number;
}

export type ArtifactRevisionComparison = 'newer' | 'equal' | 'older' | 'incomparable' | 'newer-ownership' | 'older-ownership' | 'unenforceable';

export type BillingArtifactReadState = 'current' | 'stale' | 'partial' | 'fallback' | 'suppressed' | 'unavailable' | 'complete-empty';
```

Billing V2 documents must use these public names:

- `BillingAnalyzerInputManifestV2`
- `BillingAnalyzerInputCurrentPointerV1`
- `BillingAnalyzerRequestV2`
- `BillingAnalyzerOutputManifestV2`
- `BillingAnalysisCurrentPointerV1`
- `BillingCostAnalysisMetadataV2`
- `BillingOutputBindingV1`
- `projectBillingOutputBindingV1FromManifest`
- `projectBillingOutputBindingV1FromMetadata`
- `canonicalizeBillingOutputBindingV1`
- `canonicalizeBillingAnalyzerInputManifestV2ForDigest`
- `canonicalizeBillingAnalyzerOutputManifestV2ForDigest`
- `CompletedViewManifestV3`
- `CompletedAzureViewSetV2`
- `isBillingAnalyzerInputManifestV2`
- `isBillingAnalyzerInputCurrentPointerV1`
- `isBillingAnalyzerRequestV2`
- `isBillingAnalyzerOutputManifestV2`
- `isBillingAnalysisCurrentPointerV1`
- `isBillingCostAnalysisMetadataV2`
- `isCompletedViewManifestV3`
- `isCompletedAzureViewSetV2`
- `compareArtifactRevisionVector`

`BillingCostAnalysisMetadataV2` extends the existing metadata fields and requires `artifactState` plus `artifactEvidence`; its successful document branches are `current`, `stale`, `partial`, `fallback`, and proven `complete-empty`. `unavailable` and `suppressed` are shared presentation/read states carried by the standard typed error/decision path, not fabricated metadata documents. Legacy metadata stays valid only through the V1 branch of consumer compatibility code.

Digest-cycle correction (accepted 2026-08-14): metadata V2 and output manifest
V2 carry `outputBindingDigest` B, derived from the versioned stable
identity/evidence projection. The exact metadata stored-byte digest is an output
descriptor; output `manifestDigest` D is computed from the canonical manifest
excluding only its own top-level digest; the current pointer retains D as
`outputManifestDigest`. The old metadata V2 `outputManifestDigest` name is
rejected rather than retained as an alias. Public canonicalization helpers
return dependency-free UTF-8 preimages and never hash internally.

Diagnostic observation amendment (accepted 2026-08-17): observe mode uses two
explicitly non-authoritative documents instead of either current-pointer type.
`BillingAnalyzerInputObservationPointerV1` binds the newest successfully
enqueued queue message to its exact immutable input manifest and is discovered
at
`subscriptions/{subscriptionId}/history/billing/analyzer-inputs/latest-enqueued.json`.
Cloud may replace that diagnostic pointer only by a bounded ETag CAS whose
candidate has a greater Cloud-owned `sourceRevision`; ownership or policy
revision never orders observation candidates. The pointer may omit the
ownership epoch, but a present epoch must match the revision vector.

`BillingAnalysisPromotionObservationV1` is immutable at
`subscriptions/{subscriptionId}/billing/generations/{generationId}/promotion-observation.json`.
It binds the input manifest, queue message, output manifest, revision and the
projected promotion outcome. Its `observationDigest` is SHA-256 over
`canonicalizeBillingAnalysisPromotionObservationV1ForDigest`, which selects
only the declared version-1 fields and excludes `observationDigest` itself.
Additive fields do not change the preimage. Both observation documents require
`authority: 'diagnostic-only'` and `publicationMode: 'observe'`; neither can be
returned as customer data, used for fallback, or validated/promoted as
`BillingAnalyzerInputCurrentPointerV1` or `BillingAnalysisCurrentPointerV1`.

## Tasks

### Task 1: Lock the shared state and revision behavior with RED fixtures

**Files:**

- Create: `fixtures/artifact-evidence-contract-corpus.json`
- Create: `src/common/artifactEvidence.contracts.spec.ts`
- Modify: `tsconfig.contracts.json`

**Consumes:** Current `ArtifactProvider`, `ArtifactDescriptor`, and Capability Passport state semantics.

**Produces:** Named valid/invalid cases used by Tasks 2–4 and mirrored by the analyzer.

Steps:

1. Add valid cases for current populated evidence, proven complete-empty, stale last-known-good, partial optional dependency, V1 compatibility, and additive unknown fields.
2. Add invalid cases for complete-empty without proof, failed attempt published completed, missing epoch in enforceable pointer, zero/negative revision, unsafe path, malformed SHA-256, cross-subscription ownership, unknown version, and equal revisions with conflicting fixture digests.
3. Add compile assertions for the Task 2 common public surface (`ArtifactOwnershipBinding`, `ArtifactRevisionVector`, `ArtifactRevisionComparison`, `BillingArtifactReadState`, publication decisions, validators, and comparator) plus `@ts-expect-error` assertions for impossible discriminated-union combinations. Add billing document assertions in Task 3 and view-generation assertions in Task 4 so each task can complete its own RED-to-GREEN cycle.
4. Run `npm run typecheck:contracts`; expected result before Task 2: failure because `artifactEvidence.ts` and validators do not exist.

Done when the failing output names missing DEV-1036 contracts rather than unrelated package errors.

### Task 2: Implement provider-neutral evidence primitives and revision comparison

**Files:**

- Create: `src/common/artifactEvidence.ts`
- Modify: `src/common/capabilityPassport.ts`
- Modify: `src/common/artifactGeneration.ts`
- Modify: `src/index.ts`

Steps:

1. Define discriminated unions for support, applicability, attempt, coverage, empty proof, freshness, evidence, lifecycle, publication, dependency evidence, claim decision, and overall publication decision.
2. Move only semantically identical primitives out of `CapabilityPassport`; retain its public names as aliases or composed types so its schema-v1 JSON and validator behavior do not change.
3. Implement `isArtifactPublicationDecision`, `isArtifactOwnershipBinding`, `isEnforceableArtifactOwnershipBinding`, and `compareArtifactRevisionVector` as pure dependency-free functions.
4. Make the comparator check ownership epoch first, then compare source and policy revisions component-wise. Return `incomparable` when one component rises and the other falls, and `unenforceable` whenever either epoch is absent.
5. Run `npm run typecheck:contracts && npm run check:capability-passport-contracts`; expected result: all common and Capability Passport cases pass.

Done when common primitives have one implementation and existing Capability Passport JSON remains byte-shape compatible.

### Task 3: Add immutable billing V2 contracts and runtime validation

**Files:**

- Create: `src/azure/billingArtifactGeneration.ts`
- Create: `src/azure/billingArtifactGeneration.contracts.spec.ts`
- Modify: `src/azure/billingPlots.ts`
- Modify: `src/index.ts`
- Modify: `tsconfig.contracts.json`

Steps:

1. Define input object descriptors with logical path, ETag, SHA-256, byte/row counts, basis, currency, and coverage; forbid physical URLs and credentials.
2. Define `BillingAnalyzerInputManifestV2` with ownership, revision vector, coverage-plan digest, exact requested periods, object descriptors, and canonical `manifestDigest`.
3. Define `BillingAnalyzerInputCurrentPointerV1` so a published input pointer binds subscription/generation, ownership, revisions, manifest path, and manifest digest; allocation-only state is producer-private and is not part of this shared pointer.
4. Define `BillingAnalyzerRequestV2` with schema version, event/message/correlation/occurred-at/idempotency identity, `publicationMode: 'observe' | 'enforce'`, and only the input manifest reference/digest plus non-authoritative display metadata.
5. Define output manifest and current pointer so both bind the exact input/output digests, ownership, revisions, publication decision, and immutable manifest paths.
6. Define `BillingCostAnalysisMetadataV2` with required `artifactState` and evidence details while leaving `BillingCostAnalysisMetadata` V1 source-compatible.
7. Add strict validators for known fields and versions while allowing additive-next unknown object fields.
8. Add compile assertions for every Task 3 billing public type and validator listed under Interfaces.
9. Run `npm run typecheck:contracts && npm run build`; expected result: both V1 and V2 declarations compile.

Done when a V2 pointer cannot validate without enforceable ownership, completed publication, matching subscription/generation identities, canonical paths, revisions, and two valid digests.

### Task 4: Add enforced portal/plugin view-generation contracts

**Files:**

- Create: `src/azure/artifactEvidenceViews.contracts.spec.ts`
- Modify: `src/azure/views.ts`
- Modify: `src/index.ts`
- Modify: `tsconfig.contracts.json`
- Modify: `scripts/check-azure-view-set-contracts.mjs`

Steps:

1. Define `CompletedViewManifestV3` without changing `CompletedViewManifestV2`: V3 requires typed dependency evidence, claim decisions, an overall publication decision, ownership, revision vector, and artifact descriptors with hashes.
2. Define `CompletedAzureViewSetV2` with portal/plugin V3 references, composite dependency digest, revision vector, and promoted publication decision.
3. Make both validators reject a `completed` claim with blocking required dependencies, unverified billing/economics evidence, mismatched ownership, missing artifact descriptors, or invalid revision state.
4. Keep V2/V1 validators and exports unchanged for reader-first migration.
5. Add compile assertions for `CompletedViewManifestV3`, `CompletedAzureViewSetV2`, and their validators.
6. Wire the new V3/V2 runtime matrix into `check:azure-view-set-contracts`; the contract spec must not remain a no-emit-only assertion file.
7. Run `npm run typecheck:contracts && npm run check:azure-view-set-contracts`; expected result: legacy V1/V2 regression cases and new V3/V2 cases execute and pass.

Done when enforced views have a new schema contract and no runtime-added `unknown` dependency is needed for migrated writers.

### Task 5: Add the executable corpus gate and verify package compatibility

**Files:**

- Create: `scripts/check-artifact-evidence-contracts.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Modify only if needed for packed exports: `scripts/check-packed-aws-exports.mjs`

Steps:

1. Materialize every JSON corpus mutation and assert the matching validator result.
2. Add the new checker to `npm test` after `npm run build` and before packed-export validation.
3. Document that `ownershipEpochRevision` may be absent only for observe-mode evidence and is mandatory in any promoted pointer.
4. Run `npm test && npm run lint && npm run format:check && npm pack --dry-run`.
5. Inspect the tarball listing and generated `dist/index.d.ts`; expected result: all public DEV-1036 names are present and no source-only export is missing.

Done when the published artifact contains the V2 contracts/validators, all package gates pass, and no manual version bump exists.

## Test Strategy

- Compile contracts: discriminated-union and export compatibility.
- Runtime corpus: valid, malformed, N-1, current, additive-next, unknown version, ownership, path, digest, and revision comparison.
- Regression: entire Capability Passport corpus and existing artifact/billing contract specs.
- Coverage target: all comparator branches and all validators have observable fixture coverage; package does not track line coverage separately.

## Definition of Done

- [ ] Contract tests cover happy, error, and boundary cases.
- [ ] `npm test`, lint, formatting, and dry-run package checks pass.
- [ ] Existing V1 declarations and Capability Passport fixtures remain valid.
- [ ] Python mirror corpus digest is recorded in the analyzer plan/implementation.
- [ ] Security review confirms paths are logical, secrets are forbidden, and ownership mismatch is rejected.
- [ ] Runtime dev validation: N/A — this repo performs no I/O.
- [ ] Swagger, UI docs, MCP, and demo data: N/A — shared contract package only.

## Risks and Mitigations

- Risk: extracting primitives silently changes Capability Passport validation. Mitigation: run the full old corpus before and after, and keep public aliases.
- Risk: V2 grows into a product policy engine. Mitigation: keep only evidence documents and pure validation/comparison in this repo; product policy remains producer-owned.
- Risk: Python contract drift. Mitigation: version and hash the canonical corpus and require the cross-repo acceptance gate before enabling V2 authority.
- Risk: consumers install a source branch that differs from the published package. Mitigation: publish from `main`, then update each consumer dependency and lockfile before removing compatibility declarations.

## Rollout / Rollback

- Rollout: publish the package first; consumers add V2 readers before Cloud Engine emits V2 messages.
- Rollback: consumers continue accepting V1; no V1 export is removed in DEV-1036.

## Runtime Environment

- Start: N/A.
- Env vars: none.
- Tests: `npm run typecheck:contracts`, `npm test`, `npm run lint`, `npm run format:check`.

## References

- Parent spec: `cloud-engine/Specs/data-quality/data-quality-06-artifact-completeness-and-idempotency.md`
- Existing primitives: `src/common/artifactGeneration.ts`, `src/common/capabilityPassport.ts`
- Existing billing V1: `src/azure/billingGeneration.ts`, `src/azure/billingPlots.ts`
