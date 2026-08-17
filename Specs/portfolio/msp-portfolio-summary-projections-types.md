# MSP Portfolio Summary Projection Types

## Metadata

Status: implementation-in-progress
Approved: Yes â€” user explicitly requested implementation on 2026-07-26
Iterations: 11
Last updated: 2026-08-13
Repo: types-package
Domain: portfolio
Parent spec: `core/specs/portfolio/msp-portfolio-summary-projections.md`

## Summary

Define the versioned manifest, cloud projection, delivery projection, atomic-company contribution, coverage, freshness, currency, and API overview contracts used by cloud-engine, API, and UI. Contracts are additive and contain no storage or authorization behavior.

## Recommendation Savings Account-Summary Invalidation - 2026-08-13

- Advance the internal cloud-account summary schema from `2026-07-27` to `2026-08-13` so reconciliation cannot continue merging summaries produced before recommendation savings, effort, and service-value evidence were projected.
- Keep the public Portfolio projection schema unchanged because its artifact shapes remain additive and compatible; only the private producer cache requires replacement.
- Compile the Portfolio contract fixture in the normal contract typecheck so future internal schema changes must update the representative manifest.
- Verification: the package build, contract typecheck, focused Prettier check, and focused ESLint check pass.

## Contract Ownership

- `PortfolioProjectionManifest` owns completion-pointer metadata and artifact descriptors.
- `PortfolioProjectionMetadata` owns schema version, selected scope, generation/source timestamps, coverage, failures, included counts, currency state, and staleness.
- `PortfolioCloudAccountSummaryManifest` and `PortfolioCloudAccountSummary` own the internal one-summary-per-canonical-cloud-account contract. The manifest records canonical account identity, tenant run identity, subscription input identities/digest, coverage, freshness, and the immutable summary descriptor.
- Cloud artifacts are grouped as `estate`, `insights`, and `operations`; delivery is independently refreshed.
- Delivery owns bounded generated-report history plus SOW and month-end rows; it is not split into one artifact per delivery page.
- Primary artifacts contain deterministic compact `companyContributions` keyed by atomic company ID. Byte-bounded packed `details` shards declare their company ownership so API authorization can load the exact relevant shard set before recomputing response totals. Oversized company sections are split into contract-sized row fragments and merged by stable row identity.
- Detailed lists are bounded and carry stable identities plus source company/account/subscription identifiers.
- `PortfolioOverviewResponse` is the glanceable, payload-budgeted dashboard response. Existing operations contracts remain the page/grid response contracts.

## Requirements

- One My Companies row represents one cloud account/tenant, not one company.
- One internal Portfolio cloud-account summary represents one canonical physical account/tenant. Existing per-subscription `summary.json` documents remain source inputs and are not Portfolio summaries.
- Monetary values retain source currency. Mixed and unavailable currencies are explicit; no FX conversion is represented.
- Expiry kinds cover service principals, reservations, Savings Plans, and service expiries.
- Health, risk, opportunity, next-action, reporting, budget, and freshness facts include evidence/source references.
- New versions remain readable alongside the immediately preceding schema version during rollout.
- Artifact descriptors carry decoded/compressed sizes, packed-shard count, and owned company IDs. Producers target 2 MiB decoded/1 MiB compressed detail shards beneath the hard 32 MiB/8 MiB artifact limits; the API enforces a 24 MiB aggregate decoded request budget.
- Account rows carry loaded-subscription counts and explicit source currency sets so parent coverage and mixed-currency state can be recomputed without treating unavailable subscriptions or mixed accounts as complete.
- Account summary metadata records the stable completed subscription-generation identities used to compose it. The mutable tenant run ID remains trace metadata; the stable saga `sourceRunStartedAt` watermark distinguishes separate tenant sync generations while preserving redelivery idempotency.

## Verification

- `npm run build` passes, including the contract typecheck.
- API, cloud-engine, and UI compile against the same local package junction.
- The exported current schema version is `2026-08-02`; `2026-07-26` remains in the explicit compatibility list for the additive rollout window.
- Contract tests cover additive descriptor sizing, completed-input identities, loaded subscription coverage, and mixed account currency sets.

## Audit Remediation Plan - 2026-08-02

1. Add additive contracts for operational-evidence coverage, explicit company health rows, leaf-customer scope metadata, and full-result truncation metadata.
2. Advance the projection schema while retaining the immediately preceding schema in the compatibility list.
3. Add contract assertions for the new bounded/full-total and evidence-state fields, then build the package for downstream local-type validation.

Approved: Yes - user requested implementation after the cross-repo audit on 2026-08-02.

## Release Gate

- The release candidate is `@spottoai/types-package@1.0.2-beta.331` with integrity `sha512-Zt4QKOPW6eStcRH04xfOgFkcCrtExtPr2Y3U8GpOcM5ZvMDkl94CuXOZcQrsyk3eh6emazl028osCZPosPeOAw==`. It must be published before clean consumer installs. `beta.329` cannot be reused because the registry already contains a different tarball, and unpublished `beta.330` was superseded by the authorization-safe detail-shard contract.

## Packed-Artifact Remediation - 2026-08-10

- Published prereleases through `1.0.2-beta.345` do not contain `dist/portfolio` and expose none of the Portfolio types or runtime constants from the package root; `beta.342` is the broken version currently declared by the consumers.
- The packed-consumer gate now compiles a Portfolio consumer against the actual tarball and asserts the schema, compatibility, shard-target, and hard-size constants from both ESM and CommonJS consumers.
- Projection manifests carry an optional canonical `sourceMembershipDigest`, allowing bounded reconciliation to detect deleted or moved account membership without loading every account summary. Older manifests remain readable and are republished once.
- A replacement prerelease must be produced by the normal workflow and verified by this gate before API, cloud-engine, or UI lockfiles move to it. The broken `beta.342` artifact is not a valid Portfolio dependency.
