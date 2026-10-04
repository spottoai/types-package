# Types Package

A shared TypeScript interfaces package. This package contains common interfaces that can be reused across your API, frontend, and backend projects.

## Features

- **Shared Interfaces**: Common TypeScript interfaces for API requests/responses, database models, frontend components, and backend services
- **Private Registry**: Published to GitHub Packages (not public npm)
- **TypeScript Declaration Files**: Built with declaration files for better IDE support
- **Modular Structure**: Organized by domain (API, Database, Frontend, Backend)

## Installation

The package is published privately to GitHub Packages as `@spottoai/types-package`.

Each consuming repo has an `.npmrc` that routes the `@spottoai` scope to GitHub Packages
(everything else still comes from npmjs):

```ini
@spottoai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```json
{
  "dependencies": {
    "@spottoai/types-package": "^1.1.0"
  }
}
```

### Authentication

- **GitHub Actions**: set `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` and give the job
  `packages: read`. The consuming repo must also be listed under the package's
  *Manage Actions access* settings.
- **Docker builds**: pass the token as a BuildKit secret (`npm_token`), never as a build `ARG`.
- **Local development**: use a token with `read:packages`, for example
  `gh auth refresh -s read:packages` then `export NODE_AUTH_TOKEN=$(gh auth token)`.

## Usage

### Importing Interfaces

```typescript
// Import all interfaces
import * as Types from '@spottoai/types-package';

// Import specific interfaces
import { User } from '@spottoai/types-package';

// Import the provider-neutral resource scheduling contract and validators
import { isResourceStrategyWeeklyScheduleWriteRequest, type ResourceStrategyWeeklyScheduleWriteRequest } from '@spottoai/types-package/scheduler';

// Import AWS-only public artifact contracts
import type { AwsPortalAccountSummaryArtifact, AwsPortalResourceCollectionArtifact } from '@spottoai/types-package/aws';

// Import AWS relationship or commitments validators without loading the
// compatibility-wide AWS barrel.
import { validateAwsPortalRelationshipArtifact } from '@spottoai/types-package/aws/relationships';
import { validateAwsCommitmentsPlanningViewIdentity } from '@spottoai/types-package/aws/commitments-planning';

// Import background report job contracts (request, queue message, reportjobs row, identity)
import { buildReportJobRowV1, isReportJobRequestedV1, type ReportJobSpecV1 } from '@spottoai/types-package/reporting-jobs';
```

The root entry point also exports the provider-neutral artifact generation,
manifest, descriptor, and completed-pointer contracts. Storage paths and
runtime persistence records deliberately remain owned by the producing engine.

The root and narrow `@spottoai/types-package/governance` entry points export
`CloudGovernanceReport` and `CloudGovernanceAccessReport` for provider-neutral
governance overview and privileged-access projections. They bind the company,
cloud account and native scope, preserve source coverage/freshness and bounded
rows, distinguish MFA registration from enforcement, and represent centralized
root credential removal. Access grants describe assigned permissions with
source evidence, access paths, restrictions and limitations; they do not prove
unrestricted effective access. Unknown observations never carry invented
zero/false values. Raw policies, credentials, storage paths and provider
permission catalogues remain outside these public contracts. Producers and API
readers must validate untrusted JSON and authorize every scope independently;
these TypeScript contracts are not runtime validators. Existing Azure
Governance/Global Administrator exports remain unchanged. See
`specs/governance/cloud-governance-types.md` for the staged consumer handoff.

Retirement Tracker keeps the shared `ServiceRetirementPortalEntry[]` payload for
Azure and AWS. Optional `deadlineKind` distinguishes retirement, deprecation,
end-of-support, expiry and rotation-due; `RetirementDate` carries that deadline.
The `credential-lifecycle` render kind provides public credential/key identity
and rotation metadata without secret values. Optional `providerScope`,
`sourceId` and `resourceCoverage` let actionable notices remain visible when
affected resources are unresolved. Existing render kinds and imports remain
supported. The root exports a separate `ServiceRetirementCoverageArtifact` using
the existing support/attempt/coverage/freshness verdicts. Missing coverage means
unknown, and a rotation deadline does not prove hard credential expiry. See
`specs/monitor/retirement-tracker-lifecycle-types.md` for consumer handoff and
source-count semantics.

The root entry point exports the shared `PublicIpAddressesReport` used by
Perimeter Insights for Azure subscriptions and AWS accounts. Its existing
schema version and Azure fields remain compatible. Native AWS exposure evidence
uses `security_group_rule` / `securityGroupRule` or `lb_listener`; Azure NSG
evidence retains `nsg_rule` / `nsgRule`. Database findings, provider-neutral
remediation options, and collection `coverage` are additive extensions. Missing
coverage does not establish complete collection, and complete collection does
not establish effective network reachability. See
`specs/monitor/aws-perimeter-insights-types.md`.

Background report jobs (`ReportJobSpecV1`, `ReportJobRequestedV1`, the
`reportjobs` row, statuses and failure codes, and the `jobId` identity
functions) live in `@spottoai/types-package/reporting-jobs`, which is not
exported from the root entry point. The API and cloud-engine both create
jobs, so they must derive identical job IDs and rows. The package holds no
table names, queue names, account names or blob paths for them: those stay
with the repos that use them. The identity and hash functions use Web Crypto
(`globalThis.crypto.subtle`) and are async. `npm run check:reporting-job-contracts`
runs the identity vectors in `fixtures/reporting-job-identity-vectors.json` and
the parser and row checks against the CommonJS and ESM builds. See
`specs/reporting/reporting-scheduler-types.md`.

The root entry point exports the provider-neutral artifact-evidence vocabulary,
revision comparison, immutable billing analyzer V2 documents, and enforced
Azure view-generation contracts. An absent `ownershipEpochRevision` is valid
only for observe-mode evidence: an observe request or an unpromoted manifest
without an epoch must never become authority. Enforce-mode requests and every
promoted billing or coordinated-view pointer require a positive, matching epoch
in both ownership and revision data. `npm run check:artifact-evidence-contracts`
executes the canonical cross-runtime corpus, billing validator matrix, ownership
checks, promotion preconditions, and every revision-comparison outcome.

`SubscriptionReportEvidencePack.cost.budget` is an optional selected-budget
projection. New packs can provide `timeGrain`, `category`, `currencyCode`, and
`filter` alongside the configured amount and applicability dates. Older packs
may omit these fields. `currentSpend` belongs to the source budget's current
period and must not be presented as spend for a historical report month.

Claim-projected Azure views use `PublishedViewManifestV4` for one Portal or
Plugin surface and `PublishedAzureViewSetV3` for the coordinated promoted pair.
A surface may have `complete` or `partial` coverage, but every projected
artifact must bind its exact section selectors only to completed claims. The
coordinated pointer remains enforceable-only and therefore requires a positive,
matching ownership epoch. Existing `CompletedViewManifestV3` and
`CompletedAzureViewSetV2` retain their fully-completed semantics for N-1
readers. Producers and readers share the bounded collection limits exported as
`PUBLISHED_VIEW_OBJECT_LIMITS_V1`.

Observe-mode discovery uses `BillingAnalyzerInputObservationPointerV1` and
`BillingAnalysisPromotionObservationV1`. Both are explicitly
`diagnostic-only`, may never substitute for a current authority pointer, and
may omit an ownership epoch only when ownership and revision omit it together.
The promotion observation has a stable exact-field canonicalizer that excludes
its own `observationDigest` and ignores additive-next fields. An epoch-free
promotion observation must report `unenforceable` / `not-enforceable`; a
matching present epoch must not report that pair. Current-pointer validators
explicitly reject these diagnostic discriminants while retaining unrelated
additive-next fields.

Portable billing contract corpus v7 pins the shared stored/decoded object
limits, safe `latest-enqueued.json` diagnostic discovery path, strict V1/V2/
legacy-fallback response authority, prototype-key rejection, bounded iterative
control-data traversal, and exact metadata/plot descriptor boundaries. The
corpus contains 351 cases and 436 mutations at SHA-256
`508cb1bfb27ec89e1b99fbada05e91bffe8d4c84174492760b647fd7311d5f5a`;
its three promotion-observation digest vectors remain byte-for-byte compatible
with v5.

For an epoch-bound promotion observation, `evaluation.outputDigestRelation` is
an optional V1 compatibility extension. Equal revisions may omit it only for
the legacy `would-be-idempotent` shape; `same` also requires
`would-be-idempotent`, while `different` requires `would-quarantine`. Every
non-equal comparison forbids the relation. When present, the relation is part
of the canonical observation preimage and therefore bound by
`observationDigest`; legacy observations retain their original preimage.

Billing output V2 uses an acyclic digest chain. Producers project the public
`BillingOutputBindingV1`, canonicalize it with
`canonicalizeBillingOutputBindingV1`, and SHA-256 that UTF-8 preimage to obtain
`outputBindingDigest` (B). Exact stored metadata bytes containing B are hashed
into the metadata descriptor; the canonical output manifest containing B and
all descriptors is then hashed, excluding only its own top-level
`manifestDigest`, to obtain D. `BillingAnalysisCurrentPointerV1` keeps D in
`outputManifestDigest`. The package also exports canonical preimage helpers for
both billing manifest versions; hashing remains a platform-boundary concern and
the package has no Node crypto dependency.

Canonical gzip artifacts require a fixed writer implementation/version,
`mtime=0`, and fixed header/options. Descriptors hash the exact compressed bytes,
not decompressed JSON. Readers must reject duplicate JSON keys before applying
the structural validators or canonical digest checks.

The root entry point exports one provider-aware `CommitmentsPlanningView` for
Azure and AWS. Existing Azure artifacts remain compatible through the legacy
branch, while the AWS branch requires a minimal account identity, `aws-native`
source evidence, linked-account scope metadata, and provider-specific inventory
shapes without introducing an AWS-only planning DTO.

The root and `/aws` entry points also own the immutable AWS Commitments Planning
Portal envelope, `commitments-planning.json.gz` logical name, artifact registry
relationship, and dependency-free allowlist validator. The validator binds the
envelope, provider scope, nested applied scopes, and account-bearing ARNs while
rejecting internal metadata, Azure-only fields, and undeclared public fields.

The same entry points expose a separate organization commitments contract
family: a secret-free `organization-commitments` refresh command, a safe scope
selector and progress response, a payer-aware planning view, and the immutable
`organization-commitments-planning.json.gz` artifact. Its validator binds the
company, estate, manifest revision, organization, management account, exact
member set, and account-bearing ARNs without weakening the exact-account
validator. Allocation and resource attribution remain explicitly unavailable
until a producer supplies proved persisted evidence.

The stable `/aws/relationships` and `/aws/commitments-planning` entry points
expose those runtime contracts independently for browser consumers. The root
and `/aws` barrels remain compatibility entry points and continue to export the
same symbols. Package `import` conditions use tree-shakable native ESM while
`require` conditions retain the CommonJS compatibility build.

The root and `/aws` entry points export the secret-free `AwsEstatesManifest`,
AWS estate/account/billing-source command union, and company trust-setup
contracts. The API-owned desired-state document is stored as
`companies/{companyId}/aws/aws-estates.json`; commands reference its opaque
revision instead of copying role, billing-export, External ID, or credential
configuration. Engine saga and persistence records remain engine-owned.

The root and `/aws` entry points also export the lossless AWS plugin
subscription/resource body contracts, deterministic logical-name builders, one
complete active-set manifest, and dependency-free runtime validators. These
validators are the bounded shared rejection boundary required for immutable
plugin publication; they perform no I/O.

The same entry points export the lossless AWS resource collection, account
summary, compact retained-history, retained body-reference, and audience-indexed
AI cost-summary contracts. Package-owned logical names and dependency-free
validators bind exact account/scope/generation/sibling identity while rejecting
undeclared, credential-bearing, physical-path, operational-marker, and lossy
bodies.

They also export the lossless relationship-schema-v2 AWS graph contract and
validator. The graph is scoped by AWS account and Region, supports account,
Region, resource, and synthetic nodes without Azure resource groups, and
retains closed topology, aggregate family freshness, cost provenance,
unresolved references, and honest truncation evidence.
`PublicRelationshipArtifact` is the provider-aware Azure-or-AWS consumer union;
the former reduced AWS declaration remains available under the explicit
`AwsPortalRelationshipArtifactV1` migration name.

## Development

Activity Analysis uses the same classification, conformed monthly artifact and
bounded public response contracts for Azure and AWS. New provider-aware evidence
supplies `providerName` and `providerScopeId` together, on the envelope and each
nested scope. Required `subscriptionId` remains the transport alias and must
equal `providerScopeId`; for AWS it carries the 12-digit account ID. Omission of
both provider fields retains the existing Azure interpretation.

AWS scopes use `account`, `region`, `resource` or `unknown` levels, with native
resource IDs and optional Region context (`global` for account-global resources).
Regional ARNs must match the declared Region, and every account-bearing ARN must
match the account. Opaque native IDs require Region and resource type. Accountless
ARNs and opaque IDs still require authoritative ownership checks by the producer
and API; structural validation is not authorization. `isPortalActivityLogAnalysisScope`
exports the shared scope boundary used by classification and analysis validators.

New producers can use neutral `platform` / `actor.platform` vocabulary. Existing
Azure `azurePlatform` / `actor.azure-platform` evidence remains valid; AWS
evidence rejects those Azure labels. Existing schema versions, collection shapes,
logical names, limits and root exports remain stable. This additive contract
extension requires updated engine, API and UI consumers before AWS emission.
See `specs/monitor/provider-aware-activity-analysis.md` for validation and rollout.

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Building

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean

# Code linting
npm run lint

# Code formatting
npm run format

# Build with checks
npm run build:check
```

### Adding New Interfaces

1. Create new interface files in the appropriate `src/` subdirectory
2. Export them from the corresponding index file
3. Update the main `src/index.ts` if needed
4. Build the package: `npm run build`

### Directory Structure

```
src/
├── example/
│   └── common.ts        # Common types
└── index.ts             # Main export file
```

## Versioning

This package follows semantic versioning with automated releases from `main`:

1. Do not manually bump `package.json` in a feature change.
2. Merge the validated change to `main`.
3. The `Release and Publish` workflow runs lint/build/contract checks, bumps the patch version
   (1.1.0 → 1.1.1), publishes it to GitHub Packages, and creates the matching Git tag.
4. For a minor or major release, set the new version (e.g. `1.2.0`) in `package.json` and
   `package-lock.json` in the merged change. The workflow publishes a version that is not yet in
   the registry as-is, then resumes patch bumps from there.
5. Consumers must update their dependency and lockfile to the published version before removing
   any temporary compatibility declarations.

Prerelease (`-beta.N`) versions are no longer published; 1.1.0 is the first release on GitHub
Packages. Older `1.0.2-beta.N` versions remain on registry.npmjs.org only; use the
`Backfill Version from npmjs` workflow if a consumer still needs one from GitHub Packages
(cloud-engine-aws and spotto-mcp are still pinned to older betas).

`prepublishOnly` performs a clean build and compiles a consumer against the packed artifact, preventing source-only exports from being published accidentally.

## Contributing

1. Create a feature branch
2. Add your new interfaces or modifications
3. Update the main index file if needed
4. Build and test the package
5. Submit a pull request

## License

MIT License - see LICENSE file for details
