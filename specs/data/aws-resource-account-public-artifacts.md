# AWS Resource, Account, History, And AI Public Artifacts

Status: implemented
Last updated: 2026-07-24
Owner: Platform

## Scope

This contract family adds lossless immutable AWS Portal DTOs without changing
the older reduced beta.310 DTOs or any producer storage boundary.

The package owns:

- `AwsPortalResourceCollectionDetailArtifact`
- `AwsPortalAccountSummaryDetailArtifact`
- `AwsPortalResourceCollectionHistoryArtifact`
- `AwsPortalAccountSummaryHistoryArtifact`
- `AwsPortalRetainedHistoryBodyReference`
- `AwsPortalAccountSummaryAiCostSummaryArtifact`

The matching validators reject undeclared fields, non-JSON values, non-finite
numbers, malformed account/time/hash identity, cross-account or cross-Region
evidence, duplicate rows/scopes/audiences, physical paths, credentials, prompt
inputs, storage mechanics, refresh markers, and incomplete AI sibling binding.

## Logical Names

- resource collection: `resources.json.gz`
- account summary: `account-summary.json.gz`
- account-summary AI collection:
  `account-summary-ai-cost-summary.json.gz`
- resource history:
  `resources-history--{identity-sha256}.json.gz`
- account history:
  `account-summary-history--{identity-sha256}.json.gz`

Low-level history builders accept only a lowercase hexadecimal SHA-256.
Scope-aware builders reproduce the AWS resource history scope-plus-generation
identity and account history scope identity, hash that canonical key, and emit
the logical name. Runtime validators recompute the name and reject a digest
that is merely well formed but does not bind the body. Logical names are body
identities, not storage paths.

## Public And Operational Boundary

Current resource and account bodies retain structured provider/account/billing/
Region/metric scope, generated identity, completeness, freshness, explicit
missing/partial evidence, customer-safe account/resource identity, billing,
metrics, recommendation provenance, actionability, savings verification, and
virtual-tag trust evidence.

Compact resource/account history remains a separate outcome and cannot qualify
or reconstruct a current body. A retained-history reference binds the declared
history artifact type, logical body name, generation, and exact descriptor.
Repository target keys and record timestamps remain operational for resource
and account current/history records.

AI is the intentional exception: each available audience row preserves its
current target key plus created/updated/generated times for consumer
equivalence. The AI artifact binds the exact account-summary scope, derived
target key, fixed logical name/type, same run and generation time, and sibling
body SHA-256. Only available `executive`, `finops`, and `engineering` rows may
be persisted, in deterministic audience order.

Credentials, storage paths, chunks, leases, retries, ETags, raw prompts/source
bytes, Bedrock Region and guardrail configuration, provider failure text, and
refresh marker request metadata are not public artifact fields.

Known nested evidence is qualified rather than opaque: resource billing cost
views, commitment and benefit coverage, action execution, post-action savings
verification, template provenance sources, history savings rows, recommendation
source/action health, and AI recommendation posture each have exact DTOs and
exact-key runtime validation.

## Consumption

Both root and `/aws` package entry points export the DTOs, logical-name and
relationship constants/builders, target-key builder, standalone validators,
and sibling/reference binding validators. The packed-consumer gate compiles a
strict NodeNext consumer and executes Node 24 ESM/CommonJS imports from the
packed artifact.
