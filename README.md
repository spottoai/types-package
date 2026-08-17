# Types Package

A shared TypeScript interfaces package. This package contains common interfaces that can be reused across your API, frontend, and backend projects.

## Features

- **Shared Interfaces**: Common TypeScript interfaces for API requests/responses, database models, frontend components, and backend services
- **Git Dependencies**: Designed to work with Git dependencies
- **TypeScript Declaration Files**: Built with declaration files for better IDE support
- **Modular Structure**: Organized by domain (API, Database, Frontend, Backend)

## Installation

Add this to your consuming project's `package.json`:

```json
{
  "dependencies": {
    "@spotto/types-package": "git+https://github.com/spottoai/types-package.git#main"
  }
}
```

Or for a specific branch/tag:

```json
{
  "dependencies": {
    "@spotto/types-package": "git+https://github.com/spottoai/types-package.git#v1.0.0"
  }
}
```

## Usage

### Importing Interfaces

```typescript
// Import all interfaces
import * as Types from '@spottoai/types-package';

// Import specific interfaces
import { User } from '@spottoai/types-package';

// Import AWS-only public artifact contracts
import type { AwsPortalAccountSummaryArtifact, AwsPortalResourceCollectionArtifact } from '@spottoai/types-package/aws';

// Import AWS relationship or commitments validators without loading the
// compatibility-wide AWS barrel.
import { validateAwsPortalRelationshipArtifact } from '@spottoai/types-package/aws/relationships';
import { validateAwsCommitmentsPlanningViewIdentity } from '@spottoai/types-package/aws/commitments-planning';
```

The root entry point also exports the provider-neutral artifact generation,
manifest, descriptor, and completed-pointer contracts. Storage paths and
runtime persistence records deliberately remain owned by the producing engine.

The root entry point exports the provider-neutral artifact-evidence vocabulary,
revision comparison, immutable billing analyzer V2 documents, and enforced
Azure view-generation contracts. An absent `ownershipEpochRevision` is valid
only for observe-mode evidence: an observe request or an unpromoted manifest
without an epoch must never become authority. Enforce-mode requests and every
promoted billing or coordinated-view pointer require a positive, matching epoch
in both ownership and revision data. `npm run check:artifact-evidence-contracts`
executes the canonical cross-runtime corpus, billing validator matrix, ownership
checks, promotion preconditions, and every revision-comparison outcome.

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

This package follows semantic versioning with automated prereleases from `main`:

1. Do not manually bump `package.json` in a feature change.
2. Merge the validated change to `main`.
3. The `Prerelease and Publish` workflow runs lint/build checks, increments the prerelease version, publishes it to npm, and creates the matching Git tag.
4. Consumers must update their dependency and lockfile to the published version before removing any temporary compatibility declarations.

`prepublishOnly` performs a clean build and compiles a consumer against the packed artifact, preventing source-only exports from being published accidentally.

## Contributing

1. Create a feature branch
2. Add your new interfaces or modifications
3. Update the main index file if needed
4. Build and test the package
5. Submit a pull request

## License

MIT License - see LICENSE file for details
