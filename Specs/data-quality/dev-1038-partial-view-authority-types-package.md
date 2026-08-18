# DEV-1038 partial view authority — types-package plan

## Metadata

- Status: Local implementation complete; commit, push, and prerelease publication pending
- Approved by: Jay Ji, 2026-08-18
- Iteration: 2
- Last updated: 2026-08-18
- Repo: `types-package`
- Parent plan: `cloud-engine/Specs/data-quality/dev-1038-consistency-review-and-completion-plan.md`
- Baseline: `@spottoai/types-package@1.0.2-beta.361`

## Goal

Publish an additive contract that can make a coordinated Portal/Plugin generation authoritative when its overall coverage is partial, while proving that every customer-visible projected artifact belongs only to completed claims.

## Constraints

- Do not change the meaning or validator behavior of `CompletedViewManifestV3` or `CompletedAzureViewSetV2`.
- Do not make ownership enforceable without `ownershipEpochRevision`.
- Do not turn a partial/suppressed claim into completed evidence.
- Keep billing contracts and corpus behavior byte-compatible.

## Proposed contract

Add a next-version surface manifest and coordinated pointer under `src/azure/views.ts` (working names `PublishedViewManifestV4` and `PublishedAzureViewSetV3`). The discriminator and final exported names are frozen in the first RED contract test before implementation.

The new manifest must include:

- enforceable ownership and revision;
- `coverage: "complete" | "partial"`;
- the existing producer-owned `ArtifactPublicationDecision`;
- exact immutable artifact descriptors;
- a non-empty `claimBindings` collection for every projected descriptor, binding each completed claim to its exact projected section selectors;
- a canonical composite dependency digest shared by Portal and Plugin;
- no customer descriptor bound to a non-completed claim.

The coordinated pointer may be authoritative when both surface manifests are valid and mutually consistent, even if their publication decisions are `partial`. It must not claim that the suppressed claims themselves completed.

## Tasks

### 1. Freeze invariants with RED fixtures

Modify:

- `src/azure/artifactEvidenceViews.contracts.spec.ts`
- `scripts/check-azure-view-set-contracts.mjs`

Cover valid complete and partial generations plus invalid cases for visible suppressed claims, unclaimed descriptors, duplicate claim bindings, missing descriptors, cross-surface composite mismatch, wrong ownership/revision, unsafe paths, and unknown known-version fields.

### 2. Add additive types and validators

Modify:

- `src/azure/views.ts`
- `src/index.ts`
- `tsconfig.contracts.json` if the contract entry list requires it
- `scripts/check-packed-aws-exports.mjs`
- `README.md`

Keep validators dependency-free, bounded, prototype-safe, and consistent with the existing validation helpers. Enforce that `coverage=complete` has no non-completed claims and `coverage=partial` has at least one non-completed claim and at least one completed projected claim.

The Portal/Plugin view contract remains in the dedicated TypeScript checker. Do not modify `fixtures/artifact-evidence-contract-corpus.json`: that corpus is the byte-pinned TypeScript/Python billing authority, and `metrics-analyzer-azure` does not consume view contracts.

### 3. Add revision and compatibility tests

Verify:

- V2 accepts exactly its old valid corpus and rejects next-version objects.
- The next-version reader accepts its exact schema plus additive-next unknown fields where current policy permits.
- Epoch-free objects validate as shadow documents but cannot pass the enforceable-pointer validator.
- Canonical identity is independent of object key order and sensitive to every declared material dependency.

### 4. Publish only after consumer readiness

Run the package build, contract tests, export checks, and tarball smoke test. Publish a prerelease only after API and Cloud Engine reader branches are ready to consume it.

## Done

- One public runtime validator expresses authoritative partial coordinated views without weakening V2.
- Every visible descriptor is claim-bound and every bound claim is completed.
- N-1 and billing contracts remain unchanged.

## Implementation checkpoint — 2026-08-18

- Frozen names: `PublishedViewManifestV4`, `PublishedAzureViewSetV3`, `PublishedViewCoverage`, and `PUBLISHED_VIEW_OBJECT_LIMITS_V1`.
- `claimBindings` bind every projected descriptor to exact completed-claim section selectors.
- Cross-claim duplicate, parent/child, and wildcard-overlapping section ownership fails validation, including completed-versus-suppressed overlap.
- V4 surface manifests accept epoch-free observe documents; promoted V3 coordinated pointers require a positive matching ownership epoch.
- V2/V3 legacy validators retain their original discriminators and semantics.
- The root `src/index.ts` export-star already publishes the new symbols; no extra barrel or contract tsconfig entry was required.
- RED evidence: the new contract imports initially failed with missing exports, and the overlap fixture failed until overlap validation was added.
- GREEN evidence: `npm test`, `npm run lint`, targeted Prettier, and `git diff --check` pass under Node 24. The byte-pinned billing corpus remains v7 at SHA-256 `508cb1bfb27ec89e1b99fbada05e91bffe8d4c84174492760b647fd7311d5f5a`.
- Repository-wide `npm run format:check` remains a pre-existing gap because it reports 128 untouched generated/history files under `src/`; all files changed by this task pass targeted Prettier.
- No package version bump, commit, push, npm publication, consumer upgrade, deployment, or pointer movement has been performed.
