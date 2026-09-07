# On-Demand Activity Log AI — Public Types Contract

## Metadata

Status: approved — Iteration 3 implementation in progress
Approved: Yes — Iteration 3 presentation-neutral public contract boundary and revised execution details approved by product owner in chat on 2026-09-03
Iterations: 3
Last updated: 2026-09-03
Owner: Platform
Repo: types-package
Domain: activity-logs
Ticket: DEV-1195
Spec location: `Specs/activity-logs/on-demand-activity-log-ai-types.md`
Parent spec: `core/specs/activity-logs/on-demand-activity-log-ai/on-demand-activity-log-ai.md`
Cloud Engine child spec: `cloud-engine/Specs/activity-logs/activity-log-analysis-cloud-engine.md`
Implementation plan: create from this approved spec before production-code changes

## Summary

Define dependency-free shared contracts for deterministic Azure Activity Log analysis. The package owns additive event classification, the versioned canonical monthly conformed analysis contract, and the bounded API aggregate-response DTO. It does not own Cloud Engine rules, API authorization, AI intent selection, storage I/O, or UI behavior.

The conformed contract carries complete deterministic aggregates and internal evidence references required for rebuilding and authorized API mapping. The public response is intentionally narrower and presentation-neutral: it exposes safe generic evidence and honest coverage for Portal-side view-model aggregation, not raw event keys, source-shard fingerprints, actor identities, request data, storage paths, internal rule provenance, or DTOs named after UI tabs.

## Business Reason

Cloud Engine and API need one versioned canonical storage contract, while API and UI need one bounded response vocabulary. Exact validators and an explicit conformed-to-public mapper prevent consumers from reinterpreting tags, origin, scope, recurrence, truncation, and confidence or returning the stored object directly.

## Scope

In scope:

- Public execution-origin, operation-effect, scope, tag, confidence, facet, summary, and evidence contracts.
- Optional classification on `PortalActivityLogEntry` and optional classification coverage on `PortalActivityLogSource`.
- A versioned monthly `ConformedActivityAnalysisArtifact` containing complete facets, Activity Series, resource summaries, and evidence groups.
- A bounded `PortalActivityAnalysisResponse` DTO for the later API aggregation phase.
- Independently bounded operation, security, and power-pattern evidence collections so one category cannot crowd another out.
- Versioned opaque public evidence/group IDs.
- Exact-field, prototype-safe runtime validators and safe conformed logical-name builders/parsers.
- Root CommonJS, ESM, declaration, packed-package, and direct-consumer compatibility.

Out of scope:

- Internal Cloud Engine rule definitions or regexes; source fingerprints and internal event keys are allowed only in the conformed storage branch and prohibited from public responses.
- Hashing, storage I/O, API authorization/read/query implementation, runtime public mapping, AI handlers, prompts, or UI state.
- Client-selected intents or a new Activity-specific chat-output DTO.
- Actor/caller identity, IP, descriptions, claims, request/response payloads, credential material, or raw events.
- Deterministic `scheduler candidate`, `suspicious`, `malicious`, or security-priority verdicts.
- A breaking replacement for the existing `PortalActivityLog` schema.
- Overview, frequency, user-initiated, security-tab, automation-tab, chart, or Top-N presentation DTOs.

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
| Persist both internal analysis and a mapped Portal analysis artifact | precomputes the exact public response | duplicates aggregate storage, freshness, retention, and failure behavior | rejected |
| Store one shared canonical conformed artifact and map the bounded public response in API | one canonical aggregate with explicit consumer boundary | requires strict API mapper and response-budget tests | selected |
| Wrap the existing monthly event array in a new envelope | monthly coverage fits naturally | breaks current readers and stored-file shape | rejected |
| One mixed derived-group collection | simplest envelope | operations can crowd out security or power evidence under bounds | rejected |
| Optional event classification plus complete conformed collections and independently bounded public response collections | backward compatible, loss-aware, query-oriented | requires explicit mapping and more validators | selected |

## Locked Decisions

1. The conformed monthly schema is the canonical cross-service storage contract; the public response is a separate exact projection and never a type alias or passthrough of the stored object.
2. Event/source classification additions are optional; old archives remain valid.
3. Public tag assignments include tag ID, dimension, and confidence but not internal rule ID.
4. Security tags describe sensitive capabilities, not malicious intent or review priority.
5. Power-pattern data sufficiency is evidence, not scheduler suitability.
6. Conformed collections are complete for reported source coverage. Every bounded public-response collection reports total, returned, and truncated counts; loss is never silent.
7. Public evidence/group IDs are opaque citations, not authorization tokens or reversible encodings.
8. The package validates/builds the conformed logical name but performs no filesystem, Blob, network, hashing, or normalization I/O.
9. The future API response reuses evidence DTOs but has its own request/coverage envelope.
10. The shared version constants and primitive unions are the cross-repo source of truth. Cloud Engine may reuse these primitives in its internal model, but internal rule definitions and provenance-bearing objects remain Cloud-owned.
11. The response contract stays additive and mergeable: Portal may sum complete count collections and Activity Series across authorized batch items, but the shared package does not prescribe Tab composition, chart types, ranking cutoffs, or copy.
12. Every bounded collection keeps exact `totalCount`, `returnedCount`, and `truncated` semantics. A consumer cannot relabel a ranking derived from a truncated collection as complete.
13. The V1 wire enum remains `manual` for compatibility. Portal may display `User-initiated`, which describes user-attributed execution without asserting Azure Portal click activity.

## Public Vocabulary

Add `src/azure/activityLogAnalysis.ts` with:

```ts
export const ACTIVITY_LOG_TAXONOMY_VERSION = "v1" as const;
export const ACTIVITY_LOG_ANALYSIS_VERSION = "v1" as const;
export const CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION = 1 as const;
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

Monthly limitation codes are exactly `source-coverage-partial`, `unclassified-events`, `facet-values-truncated`, `resource-summaries-truncated`, `operation-summaries-truncated`, `security-sensitive-truncated`, `power-patterns-truncated`, and `artifact-size-budget`. Aggregate-response limitation codes add `month-missing`, `month-partial`, `month-stale`, `month-freshness-unknown`, `nested-values-truncated`, `mixed-analysis-versions`, `mixed-taxonomy-versions`, and `response-truncated`. These are unions, not arbitrary prose. `month-freshness-unknown` is paired with `freshnessUnknownMonths`; those months are requested/available and cannot also appear in `staleMonths`.

Any outer or facet collection truncation requires `response-truncated`. `nested-values-truncated` also requires `response-truncated`, and `response-truncated` is valid if and only if at least one outer/facet collection is truncated or `nested-values-truncated` is present. Item-level `evidenceTruncated` is not itself API response truncation because it may truthfully preserve truncation already declared by the conformed source.

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

- Validators reject empty/overlong scope values but never mutate or normalize input. A resource-level ARM ID must contain a `/subscriptions/{subscriptionId}/` segment matching the declared subscription ID case-insensitively.
- Tag assignments are unique by tag ID, deterministically sorted, and bounded.
- Tag dimension must agree with the tag ID's catalog dimension.
- `isPortalActivityLogClassification` validates the exact additive classification fields, scope, enums, tag cap, tag order/uniqueness, and catalog dimension.
- A collapsed row gets classification only when all represented source items have one taxonomy version, execution origin, operation effect, and exact normalized scope.
- Collapsed tags are a sorted union; duplicate tags use the lowest observed confidence so aggregation cannot overstate certainty.
- Missing/mixed classification omits classification for that row. The rolling root source reports partial coverage; the separately enveloped monthly analysis artifact reports monthly partial coverage. The existing monthly `activity_logs-YYYY-MM.json` remains an unwrapped entry array and is not changed incompatibly.
- Legacy actor fields already present on `PortalActivityLogEntry` are not copied into the new analysis artifact and are not approved model evidence.

## Public Response Bounds and V1 Limits

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
- facet values are unique within each facet collection;
- public series/group IDs are unique across Activity Series, operation summaries, security-sensitive evidence, and power-pattern evidence; evidence IDs may repeat across groups as shared citations.

`PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1` is a frozen public-response constant. It does not truncate the canonical conformed artifact:

| Collection/value | V1 maximum |
| --- | ---: |
| tag assignments on one event | 32 |
| facet tag/operation/provider/resource-type/result/effect/origin rows | 64 / 4,096 / 512 / 4,096 / 256 / 8 / 8 |
| Activity Series per response | 10,000 |
| resource summaries per month | 10,000 |
| operation summaries per month | 4,096 |
| security-sensitive groups per month | 4,096 |
| power-pattern groups per month | 4,096 |
| operation/result/tag/origin count rows on one item | 256 / 256 / 64 / 8 |
| public evidence IDs / reason codes on one item | 20 / 32 |
| ARM/resource ID | 2,048 UTF-16 code units |
| operation/provider/type/name/reason | 512 / 256 / 512 / 512 / 128 code units |
| encoded aggregate API response | API child spec budget, never more than 32 MiB UTF-8 JSON |

Internal ranking is deterministic: descending evidence count, descending last timestamp, then stable public ID or normalized value ascending. Evidence IDs are newest-first with public ID as tie-breaker. Validators enforce order/invariants where specified but do not rerank input.

The API applies response limits only after authorization, conformed validation, requested-scope filtering, and cross-month aggregation. Omitted items update collection metadata and limitation codes. The package exposes structural and UTF-8 response-size validation; it does not pack or truncate values itself.

## Public Evidence Identities

```ts
export type PortalActivityEvidenceId = `aev1_${string}`;
export type PortalActivityAnalysisGroupId = `aag1_${string}`;
```

Runtime validators require the prefix plus exactly 64 lowercase hexadecimal characters. Cloud Engine hashes a versioned, length-delimited namespace containing normalized subscription ID, canonical month, identity kind, and complete internal identity. Raw preimages are neither public nor logged. Hashes provide stable citations, not secrecy, authorization, or proof of scope.

Evidence may deep-link by authorized resource/operation/time filters. Existing Portal archives collapse and cap rows, so consumers must also display an explicit public evidence/group ID when no matching row survives.

## Canonical Monthly Conformed Analysis Artifact

Relative logical name:

```text
activity-logs/activity_analysis-YYYY-MM.json
```

`buildConformedActivityAnalysisLogicalName(month)` accepts only canonical `YYYY-MM` with month `01` through `12`. The paired parser accepts only the exact relative form. Both reject traversal, slashes in the month, whitespace, suffixes, and non-canonical months. Cloud Engine stores this logical name under `azure-conformed/subscriptions/{subscriptionId}/`.

```ts
export interface ConformedActivityAnalysisArtifact {
  schemaVersion: typeof CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION;
  analysisVersion: typeof ACTIVITY_LOG_ANALYSIS_VERSION;
  taxonomyVersion: typeof ACTIVITY_LOG_TAXONOMY_VERSION;
  projection: "activity-analysis";
  subscriptionId: string;
  month: string;
  generatedAt: string;
  source: PortalActivityAnalysisSource;
  facets: PortalActivityAnalysisFacets;
  activitySeries: ConformedActivitySeries[];
  resources: ConformedActivityResourceSummary[];
  groups: ConformedActivityAnalysisGroup[];
}
```

`source` records coverage state, source projection version, optional high watermark/fingerprint, and retained/classified event counts. It never contains source paths, raw shard names, callers, claims, descriptions, or request payloads.

`CONFORMED_ACTIVITY_ANALYSIS_LIMITS_V1.sourceShardFingerprintCodeUnits` bounds the internal opaque source fingerprint at 512 Ki UTF-16 code units. This accommodates a complete calendar month of daily or hourly shard metadata while the API separately enforces its 32 MiB decoded-artifact budget. The fingerprint remains prohibited from every public response.

`ConformedActivitySeries` is grouped within one Azure subscription-month by exact normalized scope/resource ID, canonical operation, result, execution origin, operation effect, and sorted tag IDs. It records event count, first/last timestamp, daily counts, UTC weekday-hour distribution, distinct actor count without actor identities, and bounded internal evidence event keys with explicit truncation. Exact logical events remain in raw source projections.

Conformed facets are complete sorted count collections for tag ID, normalized operation, provider, resource type, result, effect, and origin. The API maps them to bounded public collections and discloses any response truncation.

Public aggregated Activity Series are independently bounded to 10,000 items. Each series reports canonical `monthCounts` so selected-month contributions remain explicit; both `monthCounts` and `dailyCounts` are limited to `availableMonths`, not merely requested months. It omits conformed `distinctActorCount`: month-local distinct counts cannot be summed into an exact cross-month distinct actor count without exposing actor identity.

## Conformed Summaries and Public Evidence Mapping

Conformed derived evidence contains stable internal group identity, exact normalized scope, first/last timestamp, event count, confidence, sorted tags, deterministic reasons, and bounded internal evidence keys. The API maps identities to stable public evidence IDs and removes every conformed-only field before returning `PortalActivityAnalysisResponse`.

- `PortalActivityOperationSummary` (`derivedType: "operationSummary"`): operation, provider/type, effect, origin, event/distinct-resource counts, result counts, confidence, reasons, evidence IDs.
- `PortalActivityResourceSummary`: exact resource scope, event count, operation/result/tag/origin counts, related group IDs, confidence, timestamps. It never fabricates a resource for subscription-level activity.
- `PortalActivitySecuritySensitiveEvidence` (`derivedType: "securitySensitiveActivity"`): capability tag, operation, exact scope, origin, result/frequency/time evidence, confidence, reasons, evidence IDs. It has no suspicious/malicious/priority verdict.
- `PortalActivityPowerPatternEvidence` (`derivedType: "powerPatternEvidence"`): pattern ID, exact resource scope, start/resume and stop/deallocate/pause counts, opposing count, UTC active days, bounded 24-bucket UTC hour distribution, result/origin counts, timestamps, confidence, reasons, evidence IDs, and data sufficiency.

Power data sufficiency is exactly `oneSided`, `oneOff`, `sameDayRepeat`, or `repeated`. Restart-only activity is not a power group. Workload/Azure platform counts identify the recorded executor, not an existing schedule or upstream initiator.

A conformed power-pattern group is always resource-scoped, its top-level `resourceId` exactly equals `scope.resourceId`, `startCount + stopCount === eventCount`, and each UTC-hour, execution-origin, and result distribution totals exactly to `eventCount`.

The conformed group union remains discriminated for shared filtering. The public response uses independently bounded collections so one evidence category cannot crowd out another. Exact-field validators reject unknown/prototype fields, invalid timestamps/counts, duplicates, incompatible scope, and inconsistent totals.

## Future Aggregated API Response

`PortalActivityAnalysisResponse` is defined now to prevent API/UI drift; runtime production is deferred. It contains:

- response schema and generation time;
- one server-resolved `subscriptionId`, requested `from`/`to`, and optional exact resource ID; the endpoint response does not use a multi-subscription array;
- sorted unique requested, available, missing, partial, stale, and freshness-unknown months;
- observed analysis/taxonomy versions so mixed versions are visible;
- bounded aggregate facets, resources, operation summaries, security evidence, and power patterns;
- response limitation codes and collection truncation metadata.

It has no company override, storage path, actor identity, prompt, client intent, or model verdict. API authorization/filter contracts belong to the API child spec.

It also has no five-lens or chart-specific envelope. The same response supports Overview, Patterns & Frequency, User-initiated Changes, Security & Access, and Automation Opportunities through consumer-owned pure view models. New server DTOs are required only if measured payload or correctness evidence proves the generic response insufficient; presentation preference alone is not a contract reason.

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
3. Implement Cloud Engine's canonical conformed producer against that exact contract.
4. Implement API validation, authorization, aggregation, and exact public mapping; UI compiles against the response contract.
5. Registry publication and exact downstream version/lock updates are a separate explicit gate. Local pack success is not publication, merge, deployment, or runtime proof.

## Tasks (Sequential)

1. Add failing conformed/public contract tests and mutation fixtures.
   Files: `src/azure/activityLogAnalysis.contracts.spec.ts`, focused validator/check script, packed-export probe fixtures.
   Action: cover valid classification/artifact/response/name/IDs plus exact-field, prototype, forbidden-field, duplicate, scope, timestamp, month, count, size, and every V1-bound failure.
   Verify: `npm run typecheck:contracts` and the focused check fail only because approved contracts are absent.
   Done: every locked boundary has positive and negative/mutation coverage.
2. Implement conformed storage types, public response types, validators, exports, and additive fields.
   Files: `src/azure/activityLogAnalysis.ts`, `src/azure/activityLogs.ts`, `src/index.ts`, focused check script, `README.md` if its export catalogue requires it.
   Action: implement the complete conformed DTO including Activity Series, bounded public DTOs, frozen response limits, conformed name builders, ID guards, validators, root exports, and optional classification without runtime dependencies.
   Verify: focused checks, `npm run typecheck:contracts`, `npm run build`, and `npm test`.
   Done: source, declarations, CJS, and ESM expose identical semantics; old fixtures compile.
3. Verify the packed contract across direct consumers.
   Files: package probes only if required; no committed sibling dependency changes.
   Action: create one exact tarball, probe packed CJS/ESM exports, and temporarily compile Cloud Engine/API/UI against it.
   Verify: `npm pack --dry-run`, packed checks, documented zero-exit consumer commands, and clean sibling diffs for tarballs/local dependencies.
   Done: one tarball compiles all direct consumers; registry publication remains a follow-up gate.

## Test Strategy

- Contract/unit: happy paths plus table-driven invalid enums, conformed completeness, public bounds, totals, IDs, months, timestamps, scopes, Activity Series identities/distributions, tag-dimension mismatches, duplicates, and response size validation.
- Security mutation corpus: inject every forbidden internal/sensitive field at relevant nesting levels and require rejection.
- Compatibility: old Portal entry/source fixtures without classification remain valid; new fixtures validate.
- Packaging: declarations, CommonJS, ESM, root exports, and packed consumer paths agree.
- Cross-repo compile: Cloud Engine producer and API/UI consumers use one exact local tarball.
- Coverage: every new validator/builder branch and truncation invariant is exercised.

## Definition of Done

- [x] Written Iteration 2 and the two-layer storage decision are approved before implementation planning.
- [x] Shared vocabulary, classification, conformed monthly artifact, Activity Series, facets/resources/evidence, IDs, and public response contracts match this spec.
- [x] Old event/source contracts remain compatible.
- [x] Conformed coverage is complete and every bounded public collection reports truthful totals and truncation.
- [x] Exact-field validators reject internal provenance and sensitive actor/payload fields.
- [x] Name/ID/size validators reject unsafe/non-canonical values.
- [x] Focused contracts, mutation corpus, build, full tests, and packed exports pass.
- [ ] Cloud Engine, API, and UI compile against one exact tarball with no committed local dependency.
- [ ] Security, performance, modularity, and compatibility reviews are complete.
- [ ] Publication/version locks are reported separately from local verification.

## Risks and Mitigations

- Internal additions leak publicly → separate exact-field DTO and recursive forbidden-field tests.
- One public evidence category crowds out another → independently bounded response collections and deterministic intent-specific selection.
- Caps hide loss → totals, returned counts, truncation, limitations, and deterministic ordering.
- Collapsed confidence is overstated → lowest confidence and omission on incompatible inputs.
- Hashes are treated as auth/anonymization → citation-only semantics and independent API scope authorization.
- Taxonomy drifts → immutable version constants and producer/consumer compatibility tests.
- Response/prompt size grows → API applies deterministic collection, decoded-byte, and prompt-evidence budgets after aggregation; conformed storage remains complete for its declared coverage.
- Resource IDs leak cross-scope → subscription-partitioned storage plus API authorization before return.
- Old consumers break → optional additions, old fixtures, and all direct-consumer compiles.

## Rollback

No runtime flag exists in this package. Rollback coordinates consumers to the prior version and stops Cloud Engine conformed analysis publication. Existing Portal event archives remain valid; raw Activity Logs are never deleted by contract rollback.

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

- Iteration 1 converted the earlier three-layer architecture into an exact public-artifact proposal.
- Iteration 2 supersedes that proposal: one complete canonical aggregate is stored in `azure-conformed`, no duplicate Portal analysis Blob is published, and API owns authorized runtime aggregation plus exact public mapping.
- Iteration 2 prerequisite correction adds the omitted 10,000-item public Activity Series cap, singular endpoint `subscriptionId`, explicit `freshnessUnknownMonths`/`month-freshness-unknown`, and cross-month `monthCounts`; public Activity Series deliberately omit non-additive `distinctActorCount`.
- Iteration 3 keeps the public response presentation-neutral after the five-lens Portal redesign. It adds no tab-specific types and makes complete-versus-truncated consumer aggregation an explicit invariant.
- Task 0 review correction binds public series contributions to available months, enforces facet/global public-ID uniqueness, tightens conformed power-pattern totals and ARM scope identity, and adds the exported additive-classification runtime guard.
- API review correction adds `nested-values-truncated` and binds `response-truncated` exactly to outer/facet or nested-value API truncation without reinterpreting conformed `evidenceTruncated`.
