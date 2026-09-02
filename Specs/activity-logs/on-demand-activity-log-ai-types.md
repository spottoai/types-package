# On-Demand Activity Log AI — Public Types Contract

## Metadata

Status: review
Approved: No — written Iteration 1 awaiting product-owner approval
Iterations: 1
Last updated: 2026-09-02
Repo: types-package
Domain: activity-logs
Ticket: DEV-1195
Spec location: `Specs/activity-logs/on-demand-activity-log-ai-types.md`
Parent spec: `core/specs/activity-logs/on-demand-activity-log-ai/on-demand-activity-log-ai.md`
Cloud Engine child spec: `cloud-engine/Specs/activity-logs/activity-log-analysis-cloud-engine.md`
Implementation plan: create only after this written spec is approved

## Summary

Define the dependency-free public contracts used to publish and later read deterministic Azure Activity Log analysis. The package owns an additive event-classification contract, one bounded monthly Portal analysis artifact, and the future bounded API aggregate-response DTO. It does not own Cloud Engine rules, API authorization, AI intent selection, or UI behavior.

The public contract is intentionally narrower than Cloud Engine's internal `activity-analysis` projection. It exposes safe evidence and honest coverage, not raw event keys, source-shard fingerprints, actor identities, request data, or internal rule provenance.

## Business Reason

Cloud Engine, API, and UI need one versioned vocabulary for Activity Log filtering and evidence citation. A shared exact contract prevents consumers from reinterpreting tags, origin, scope, recurrence, truncation, and confidence differently. A separate public projection also prevents internal storage metadata and identity-bearing fields from entering the on-demand AI evidence path accidentally.

## Scope

In scope:

- Public execution-origin, operation-effect, scope, tag, confidence, facet, summary, and evidence contracts.
- Optional classification on `PortalActivityLogEntry` and optional classification coverage on `PortalActivityLogSource`.
- A versioned bounded monthly `PortalActivityAnalysisArtifact`.
- A bounded `PortalActivityAnalysisResponse` DTO for the later API aggregation phase.
- Independently bounded operation, security, and power-pattern evidence collections so one category cannot crowd another out.
- Versioned opaque public evidence/group IDs.
- Exact-field, prototype-safe runtime validators and safe logical-name builders/parsers.
- Root CommonJS, ESM, declaration, packed-package, and direct-consumer compatibility.

Out of scope:

- Internal Cloud Engine rule IDs, rule definitions, regexes, source fingerprints, raw event keys, or paths.
- Hashing, storage I/O, API authorization/read/query implementation, AI handlers, prompts, or UI state.
- Client-selected intents or a new Activity-specific chat-output DTO.
- Actor/caller identity, IP, descriptions, claims, request/response payloads, credential material, or raw events.
- Deterministic `scheduler candidate`, `suspicious`, `malicious`, or security-priority verdicts.
- A breaking replacement for the existing `PortalActivityLog` schema.

## Repo Recon and Assumptions

- [x] `src/azure/activityLogs.ts` already owns `PortalActivityLogEntry`, `PortalActivityLogSource`, and the root Activity Log schema.
- [x] `src/index.ts` is the current root export surface; package builds CommonJS, ESM, and declarations.
- [x] Runtime contract code follows dependency-free exact-validator patterns and packed-export probes.
- [x] Existing monthly `activity_logs-YYYY-MM.json` content is an array of `PortalActivityLogEntry`, so adding a required monthly envelope would be breaking.
- [x] Cloud Engine's internal analysis contains provenance and raw identity fields that are not suitable for public reuse.
- [x] Cloud Engine, API, and UI currently consume `@spottoai/types-package`; one packed artifact can validate the direct dependency boundary before publication.
- Package version is assigned at release, not locked in this design spec.
- The API may apply stricter response/prompt limits later, but it cannot return more than this public contract permits.

## Alternatives and Tradeoffs

| Option | Benefit | Cost/risk | Decision |
| --- | --- | --- | --- |
| Export the internal Cloud model | least mapping code | leaks provenance/raw identities and couples public compatibility to internal storage | rejected |
| Let API reconstruct analysis types | avoids a producer DTO | creates taxonomy drift and duplicate grouping logic | rejected |
| Wrap the existing monthly event array in a new envelope | monthly coverage fits naturally | breaks current readers and stored-file shape | rejected |
| One mixed derived-group collection | simplest envelope | operations can crowd out security or power evidence under bounds | rejected |
| Optional event classification plus separate independently bounded analysis collections | backward compatible, safe, query-oriented | requires explicit mapping and more validators | selected |

## Locked Decisions

1. The public schema is a projection, never a type alias of the internal Cloud Engine model.
2. Event/source classification additions are optional; old archives remain valid.
3. Public tag assignments include tag ID, dimension, and confidence but not internal rule ID.
4. Security tags describe sensitive capabilities, not malicious intent or review priority.
5. Power-pattern data sufficiency is evidence, not scheduler suitability.
6. Every variable collection reports total, returned, and truncated counts; loss is never silent.
7. Public evidence/group IDs are opaque citations, not authorization tokens or reversible encodings.
8. The package validates/builds names but performs no filesystem, Blob, network, hashing, or normalization I/O.
9. The future API response reuses evidence DTOs but has its own request/coverage envelope.
10. The shared version constants and primitive unions are the cross-repo source of truth. Cloud Engine may reuse these primitives in its internal model, but internal rule definitions and provenance-bearing objects remain Cloud-owned.

## Public Vocabulary

Add `src/azure/activityLogAnalysis.ts` with:

```ts
export const ACTIVITY_LOG_TAXONOMY_VERSION = "v1" as const;
export const ACTIVITY_LOG_ANALYSIS_VERSION = "v1" as const;
export const PORTAL_ACTIVITY_ANALYSIS_SCHEMA_VERSION = 1 as const;
export const PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION = 1 as const;

export type ActivityLogExecutionOrigin =
  | "manual"
  | "workloadAutomation"
  | "azurePlatform"
  | "unknown";

export type ActivityLogOperationEffect =
  | "write"
  | "delete"
  | "action"
  | "read"
  | "other";

export type ActivityLogClassificationConfidence = "high" | "medium" | "low";
export type ActivityLogTagDimension = "actor" | "change" | "intent" | "security" | "scheduler";
export type ActivityLogScopeLevel = "subscription" | "resourceGroup" | "resource" | "unknown";
```

Initial public tag IDs exactly match the approved Cloud taxonomy:

- actor: `actor.manual`, `actor.workload-automation`, `actor.azure-platform`, `actor.unknown`
- change: `change.material`
- intent: `intent.credential-access`, `intent.remote-execution`, `intent.power-control`
- security: `security.sensitive-operation`, `security.credential-access`, `security.remote-execution`, `security.privileged-access-change`, `security.security-boundary-change`, `security.protection-control-change`, `security.destructive-action`
- scheduler: `scheduler.power-operation`

Changing a released tag's meaning or membership requires an explicit taxonomy compatibility/version decision across producer and consumers.

Code-defined evidence reasons are limited to:

```ts
export type PortalActivityAnalysisReasonCode =
  | "derived.operation-summary"
  | "derived.security-sensitive-activity"
  | "derived.power-pattern-evidence"
  | `tag.${ActivityLogTagId}`;
```

Monthly limitation codes are exactly `source-coverage-partial`, `unclassified-events`, `facet-values-truncated`, `resource-summaries-truncated`, `operation-summaries-truncated`, `security-sensitive-truncated`, `power-patterns-truncated`, and `artifact-size-budget`. Aggregate-response limitation codes add `month-missing`, `month-partial`, `month-stale`, `mixed-analysis-versions`, `mixed-taxonomy-versions`, and `response-truncated`. These are unions, not arbitrary prose.

## Additive Event Classification

```ts
export interface PortalActivityLogAnalysisScope {
  subscriptionId: string;
  level: ActivityLogScopeLevel;
  resourceId?: string;
  resourceGroup?: string;
  provider?: string;
  resourceType?: string;
  resourceName?: string;
}

export interface PortalActivityLogTagAssignment {
  tagId: ActivityLogTagId;
  dimension: ActivityLogTagDimension;
  confidence: ActivityLogClassificationConfidence;
}

export interface PortalActivityLogClassification {
  taxonomyVersion: typeof ACTIVITY_LOG_TAXONOMY_VERSION;
  executionOrigin: ActivityLogExecutionOrigin;
  operationEffect: ActivityLogOperationEffect;
  scope: PortalActivityLogAnalysisScope;
  tags: PortalActivityLogTagAssignment[];
}
```

`PortalActivityLogEntry` gains `classification?: PortalActivityLogClassification`.

`PortalActivityLogSource` gains:

```ts
classification?: {
  taxonomyVersion: typeof ACTIVITY_LOG_TAXONOMY_VERSION;
  classifiedRetainedEventCount: number;
  unclassifiedRetainedEventCount: number;
  state: "complete" | "partial" | "unavailable";
};
```

Rules:

- Validators reject empty/overlong scope values but never mutate or normalize input.
- Tag assignments are unique by tag ID, deterministically sorted, and bounded.
- Tag dimension must agree with the tag ID's catalog dimension.
- A collapsed row gets classification only when all represented source items have one taxonomy version, execution origin, operation effect, and exact normalized scope.
- Collapsed tags are a sorted union; duplicate tags use the lowest observed confidence so aggregation cannot overstate certainty.
- Missing/mixed classification omits classification for that row. The rolling root source reports partial coverage; the separately enveloped monthly analysis artifact reports monthly partial coverage. The existing monthly `activity_logs-YYYY-MM.json` remains an unwrapped entry array and is not changed incompatibly.
- Legacy actor fields already present on `PortalActivityLogEntry` are not copied into the new analysis artifact and are not approved model evidence.

## Bounded Collections and V1 Limits

```ts
export interface PortalActivityAnalysisCollection<T> {
  totalCount: number;
  returnedCount: number;
  truncated: boolean;
  items: T[];
}
```

Invariants:

- counts are safe non-negative integers;
- `returnedCount === items.length`;
- `totalCount >= returnedCount`;
- `truncated === (totalCount > returnedCount)`;
- item length does not exceed its V1 maximum.

`PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1` is a frozen public constant:

| Collection/value | V1 maximum |
| --- | ---: |
| tag assignments on one event | 32 |
| facet tag/operation/provider/resource-type/result/effect/origin rows | 64 / 4,096 / 512 / 4,096 / 256 / 8 / 8 |
| resource summaries per month | 10,000 |
| operation summaries per month | 4,096 |
| security-sensitive groups per month | 4,096 |
| power-pattern groups per month | 4,096 |
| operation/result/tag/origin count rows on one item | 256 / 256 / 64 / 8 |
| public evidence IDs / reason codes on one item | 20 / 32 |
| ARM/resource ID | 2,048 UTF-16 code units |
| operation/provider/type/name/reason | 512 / 256 / 512 / 512 / 128 code units |
| encoded monthly artifact | 32 MiB UTF-8 JSON |

Internal ranking is deterministic: descending evidence count, descending last timestamp, then stable public ID or normalized value ascending. Evidence IDs are newest-first with public ID as tie-breaker. Validators enforce order/invariants where specified but do not rerank input.

The 32 MiB limit applies to serialized UTF-8 JSON. After field/collection caps, the producer packs resources and the three evidence collections in deterministic round-robin priority order while preserving each collection's ranking. A non-empty category receives its first item before any category receives a second, subject to the fixed envelope fitting. Unused capacity is shared. Omitted items update that collection's metadata and limitation codes. If the fixed header plus the first bounded item from each non-empty category cannot fit, publication fails instead of emitting a misleading empty artifact. The package exposes a JSON/UTF-8-size validator; a plain object guard still enforces structural limits.

## Public Evidence Identities

```ts
export type PortalActivityEvidenceId = `aev1_${string}`;
export type PortalActivityAnalysisGroupId = `aag1_${string}`;
```

Runtime validators require the prefix plus exactly 64 lowercase hexadecimal characters. Cloud Engine hashes a versioned, length-delimited namespace containing normalized subscription ID, canonical month, identity kind, and complete internal identity. Raw preimages are neither public nor logged. Hashes provide stable citations, not secrecy, authorization, or proof of scope.

Evidence may deep-link by authorized resource/operation/time filters. Existing Portal archives collapse and cap rows, so consumers must also display an explicit public evidence/group ID when no matching row survives.

## Monthly Analysis Artifact

Relative logical name:

```text
activity-logs/activity_analysis-YYYY-MM.json
```

`buildPortalActivityAnalysisLogicalName(month)` accepts only canonical `YYYY-MM` with month `01` through `12`. The paired parser accepts only the exact relative form. Both reject traversal, slashes in the month, whitespace, suffixes, and non-canonical months.

```ts
export interface PortalActivityAnalysisArtifact {
  schemaVersion: typeof PORTAL_ACTIVITY_ANALYSIS_SCHEMA_VERSION;
  analysisVersion: typeof ACTIVITY_LOG_ANALYSIS_VERSION;
  taxonomyVersion: typeof ACTIVITY_LOG_TAXONOMY_VERSION;
  subscriptionId: string;
  month: string;
  generatedAt: string;
  source: PortalActivityAnalysisSource;
  facets: PortalActivityAnalysisFacets;
  resources: PortalActivityAnalysisCollection<PortalActivityResourceSummary>;
  operationSummaries: PortalActivityAnalysisCollection<PortalActivityOperationSummary>;
  securitySensitive: PortalActivityAnalysisCollection<PortalActivitySecuritySensitiveEvidence>;
  powerPatterns: PortalActivityAnalysisCollection<PortalActivityPowerPatternEvidence>;
}
```

`source` contains only coverage state (`complete`/`partial`), optional source high watermark, retained/classified event counts, and bounded code-defined limitation codes. It excludes source paths, raw names, shard lists/fingerprints, callers, and payload excerpts.

Facets are bounded sorted count collections for public tag ID, normalized operation, provider, resource type, result, effect, and origin. Counts derive from all classified retained events before public resource/evidence truncation; each facet collection discloses its own key truncation.

## Public Summaries and Evidence

Common derived-evidence fields are stable group ID, exact normalized scope, first/last timestamp, event count, confidence, sorted tags, bounded code-defined reason codes, bounded public evidence IDs, and `evidenceTruncated`.

- `PortalActivityOperationSummary` (`derivedType: "operationSummary"`): operation, provider/type, effect, origin, event/distinct-resource counts, result counts, confidence, reasons, evidence IDs.
- `PortalActivityResourceSummary`: exact resource scope, event count, operation/result/tag/origin counts, related group IDs, confidence, timestamps. It never fabricates a resource for subscription-level activity.
- `PortalActivitySecuritySensitiveEvidence` (`derivedType: "securitySensitiveActivity"`): capability tag, operation, exact scope, origin, result/frequency/time evidence, confidence, reasons, evidence IDs. It has no suspicious/malicious/priority verdict.
- `PortalActivityPowerPatternEvidence` (`derivedType: "powerPatternEvidence"`): pattern ID, exact resource scope, start/resume and stop/deallocate/pause counts, opposing count, UTC active days, bounded 24-bucket UTC hour distribution, result/origin counts, timestamps, confidence, reasons, evidence IDs, and data sufficiency.

Power data sufficiency is exactly `oneSided`, `oneOff`, `sameDayRepeat`, or `repeated`. Restart-only activity is not a power group. Workload/Azure platform counts identify the recorded executor, not an existing schedule or upstream initiator.

`PortalActivityAnalysisGroup` remains a discriminated union for shared filtering, but stored/aggregate envelopes use three independently bounded collections. Exact-field validators reject unknown/prototype fields, invalid timestamps/counts, duplicates, incompatible scope, and inconsistent totals.

## Future Aggregated API Response

`PortalActivityAnalysisResponse` is defined now to prevent API/UI drift; runtime production is deferred. It contains:

- response schema and generation time;
- server-resolved subscription ID, requested `from`/`to`, and optional exact resource ID;
- sorted unique requested, available, missing, partial, and stale months;
- observed analysis/taxonomy versions so mixed versions are visible;
- bounded aggregate facets, resources, operation summaries, security evidence, and power patterns;
- response limitation codes and collection truncation metadata.

It has no company override, storage path, actor identity, prompt, client intent, or model verdict. API authorization/filter contracts belong to the API child spec.

## Runtime Validation and Compatibility

Validators/builders are dependency-free and provide:

- exact allowlists and safe own-property reads;
- rejection of `__proto__`, `prototype`, and `constructor` keys;
- finite safe-integer counts, strict ISO timestamps, canonical months/IDs/enums, array bounds, uniqueness, and cross-field checks;
- no mutation, coercion, normalization, hashing, network calls, or I/O;
- root CommonJS/ESM/declaration exports and packed-artifact probes.

The monthly validator accepts only schema 1 and currently compatible analysis/taxonomy versions. Incompatible released shapes increment schema version; meaning changes increment taxonomy version. Released versions are immutable.

## Cross-Repo Release Order

1. Implement and verify types-package first.
2. Build one exact local `npm pack` tarball and install it temporarily in Cloud Engine, API, and UI without committing tarballs, `file:` dependencies, or install drift.
3. Implement Cloud Engine's public producer against that exact contract.
4. API/UI runtime behavior remains deferred, but both compile against the additive package.
5. Registry publication and exact downstream version/lock updates are a separate explicit gate. Local pack success is not publication, merge, deployment, or runtime proof.

## Tasks (Sequential)

1. Add failing contract tests and mutation fixtures.
   Files: `src/azure/activityLogAnalysis.contracts.spec.ts`, focused validator/check script, packed-export probe fixtures.
   Action: cover valid classification/artifact/response/name/IDs plus exact-field, prototype, forbidden-field, duplicate, scope, timestamp, month, count, size, and every V1-bound failure.
   Verify: `npm run typecheck:contracts` and the focused check fail only because approved contracts are absent.
   Done: every locked boundary has positive and negative/mutation coverage.
2. Implement public types, validators, exports, and additive fields.
   Files: `src/azure/activityLogAnalysis.ts`, `src/azure/activityLogs.ts`, `src/index.ts`, focused check script, `README.md` if its export catalogue requires it.
   Action: implement exact DTOs, frozen limits, name/ID builders and guards, validators, root exports, and optional classification without runtime dependencies.
   Verify: focused checks, `npm run typecheck:contracts`, `npm run build`, and `npm test`.
   Done: source, declarations, CJS, and ESM expose identical semantics; old fixtures compile.
3. Verify the packed contract across direct consumers.
   Files: package probes only if required; no committed sibling dependency changes.
   Action: create one exact tarball, probe packed CJS/ESM exports, and temporarily compile Cloud Engine/API/UI against it.
   Verify: `npm pack --dry-run`, packed checks, documented zero-exit consumer commands, and clean sibling diffs for tarballs/local dependencies.
   Done: one tarball compiles all direct consumers; registry publication remains a follow-up gate.

## Test Strategy

- Contract/unit: happy paths plus table-driven invalid enums, bounds, totals, IDs, months, timestamps, scopes, tag-dimension mismatches, duplicates, and size packing.
- Security mutation corpus: inject every forbidden internal/sensitive field at relevant nesting levels and require rejection.
- Compatibility: old Portal entry/source fixtures without classification remain valid; new fixtures validate.
- Packaging: declarations, CommonJS, ESM, root exports, and packed consumer paths agree.
- Cross-repo compile: Cloud Engine producer and API/UI consumers use one exact local tarball.
- Coverage: every new validator/builder branch and truncation invariant is exercised.

## Definition of Done

- [ ] Written Iteration 1 is approved before implementation planning.
- [ ] Public vocabulary, classification, monthly artifact, facets/resources/evidence, IDs, and response contracts match this spec.
- [ ] Old event/source contracts remain compatible.
- [ ] Every collection and nested count is bounded with truthful truncation.
- [ ] Exact-field validators reject internal provenance and sensitive actor/payload fields.
- [ ] Name/ID/size validators reject unsafe/non-canonical values.
- [ ] Focused contracts, mutation corpus, build, full tests, and packed exports pass.
- [ ] Cloud Engine, API, and UI compile against one exact tarball with no committed local dependency.
- [ ] Security, performance, modularity, and compatibility reviews are complete.
- [ ] Publication/version locks are reported separately from local verification.

## Risks and Mitigations

- Internal additions leak publicly → separate exact-field DTO and recursive forbidden-field tests.
- One evidence category crowds out another → separate bounded collections and deterministic round-robin byte packing.
- Caps hide loss → totals, returned counts, truncation, limitations, and deterministic ordering.
- Collapsed confidence is overstated → lowest confidence and omission on incompatible inputs.
- Hashes are treated as auth/anonymization → citation-only semantics and independent API scope authorization.
- Taxonomy drifts → immutable version constants and producer/consumer compatibility tests.
- Artifact/prompt size grows → 32 MiB producer cap; later API applies stricter query/prompt budgets.
- Resource IDs leak cross-scope → subscription-partitioned storage plus API authorization before return.
- Old consumers break → optional additions, old fixtures, and all direct-consumer compiles.

## Rollback

No runtime flag exists in this package. Rollback coordinates consumers to the prior version and stops Cloud Engine public publication/classification additions. Old monthly archives remain valid; raw/internal analysis data is never deleted by contract rollback.

## Runtime Environment

- Install: `npm ci`
- Contracts: `npm run typecheck:contracts`
- Build: `npm run build`
- Full gate: `npm test`
- Packed contents: `npm pack --dry-run`

## References

- `src/azure/activityLogs.ts`
- `src/index.ts`
- `Specs/data-quality/dev-1135-latest-contract-migration-types-package.md`
- Parent DEV-1195 on-demand Activity Log AI spec
- Cloud Engine Activity Log classification/analysis spec

## Iteration Notes

- Iteration 1 converts the parent-approved Phase 1 architecture into an exact public boundary. It separates consumer-safe evidence from the completed internal projection and defers API/UI/AI runtime behavior.
