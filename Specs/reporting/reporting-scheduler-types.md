# Background Report Jobs — Types Package

## Metadata

Status: Parts A and B implemented locally and verified; publication/adoption pending
Approval required: Yes. New shared contracts for two producers (API, cloud-engine) and one consumer (reportworker)
Approved: Yes (Parts A and B)
Approver/evidence: Jay, 2026-09-28 for Part A; 2026-10-04 for Part B ("now that hte specs are up to date, proceed and make the types package changes")
Iterations: 5
Last updated: 2026-10-13
Owner: Platform
Repo: types-package
Domain: reporting
Parent spec: `core/specs/reporting/reporting-scheduler.md` (iteration 9, phases 3–6)
Spec location: `types-package/specs/reporting/reporting-scheduler-types.md`
Sibling specs (phase 3): `ui/Specs/reporting/reportworker.md`, `iac/specs/reporting/reporting-scheduler-iac.md`

This spec is staged by parent phase. **Part A** (phase 3) is implemented. Current `package.json` is `1.1.5`; registry availability and the exact resolved consumer build must still be checked before rollout. Jay's subsequent instruction, "now that hte specs are up to date, proceed and make the types package changes", authorizes **Part B shared contracts**. It does not enable runtime writers or authorize publication. Consumers remain gated by their phase plans.

The current message and job row contain no region and no time zone. Unknown former fields are rejected. Private storage seed modules remain in `spotto/_reportworker-storage-draft/`, not in the worker app; moving them is worker task 3.

## Summary

Add the versioned, runtime-neutral contracts that every party in background report generation shares:

- the job request (`ReportJobSpecV1`), the queue message (`ReportJobRequestedV1`) and the `reportjobs` row;
- the identity functions (`reverseTime19`, `scopeHash`, `jobId`, `MessageId`, `requestSha256`) that the API and cloud-engine must compute identically;
- the job status, failure stage and failure code vocabularies, with the allowed transitions.

Phase 3 uses them in reportworker and in its dev job tool. The API adopts them in phase 4 and cloud-engine in phase 5.

**Not in this package (iteration 2).** The current release process publishes stable versions to private GitHub Packages (`DEPLOYMENT.md`). Storage locations still belong to runtime repos: no table names, queue names, Storage account names, containers or blob paths are exported here. reportworker keeps its storage locations, read views and generated-report store helpers in `apps/reportworker/src/storage/` (ui spec), guarded by the storage drift test; API and cloud-engine use their own factories.

## Scope

In scope (Part A, phase 3):

- New subpath export `@spottoai/types-package/reporting-jobs` (sources in `src/reporting/jobs/`, shared helpers in `src/reporting/shared/`).
- Dependency-free runtime validators and builders; a contract check script wired into `npm test`.
- A README section for the subpath.

Out of scope:

- Any runtime reader or writer (UI, API, cloud-engine own those).
- Storage layout: table, queue and account names, key builders and blob paths (reportworker's own `storage/` module).
- Runtime admission coordination, publication/recovery indexes, provider delivery and recurrence compilation.

## Part B contracts (authorized; consumers in later phases)

| Contract                                                                                                    | Phase | Consumer                                    |
| ----------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------- |
| Job projection (`ReportJobProjectionV1`), paginated list, create request/response DTOs                      | 4     | API, Portal                                 |
| Guarded producer/maintenance lifecycle operations, publication recovery and admission/idempotency semantics | 4     | API, cloud-engine maintenance, reportworker |
| `report-generation` members of `ScheduleWriteRequest` / `ScheduleProjection`                                | 5     | API, cloud-engine, Portal                   |
| `ReportJobNotificationRequestedV1` and the notification row fields' writer rules                            | 6     | reportworker, cloud-engine                  |
| Retention and deletion contracts for snapshots and job rows                                                 | later | all                                         |

## Success Criteria (Repo)

- The API (Cloudflare Worker), cloud-engine (Node 24) and reportworker (Node 24) can import the subpath with no Node-only or browser-only globals other than `globalThis.crypto.subtle` and `TextEncoder`.
- For a fixed corpus of inputs, `buildReportJobId` produces the same string in all three runtimes (fixture file `fixtures/reporting-job-identity-vectors.json`, next to the package's other contract corpora; checked by the contract script).
- `parseReportJobSpecV1` rejects unknown fields, unknown report types, more than 200 subscriptions, malformed IDs and a serialized size above 32 KiB, and accepts every valid fixture.
- `npm test` passes with the new check script; `npm run build` emits the subpath in CJS, ESM and declarations; `check:packed-exports` imports it from the packed tarball and proves no `reporting-storage` subpath exists.

## Assumptions and Constraints (Post-Recon)

- [x] The package already ships subpath exports with dual CJS/ESM builds (`./scheduler`, `./environment`); the new subpath follows the same pattern (validated).
- [x] Current publishing is stable GitHub Packages (`DEPLOYMENT.md`); packed contents remain shared with all package consumers.
- [x] Reverse time follows cloud-engine's `recommendationsevents` convention: `(9999999999999999999n - BigInt(ms)).toString().padStart(19, '0')` (`RecommendationAuditRepository.ts`, validated).
- [x] The API's generated-report store writes `blobPath = companies/{sanitize(companyId)}/reporting/reports/{id}/{fileName}`, requires `fileName === sanitize(fileName)`, `id` matching `^[A-Za-z0-9_-]+$` (≤ 80), and `schemaVersion` 1 for `sdm` and `architecture-assessment` (`ReportingTemplateService.ts`, validated).
- [x] The API's `GeneratedReportMetadata` (local to the API) is a superset of this package's `GeneratedReportMetadata` (`blobPath`, `createdBy`, `contentSha256`, approval and draft fields are API-only today) (validated).
- [ ] Web Crypto (`crypto.subtle.digest('SHA-256')`) is available in every consumer runtime: Cloudflare Workers and Node ≥ 20 yes; the Portal is not a consumer of the hashing functions (unvalidated for older Node tooling; the check script runs on Node 24).
- Constraint: no dependencies. Validators are hand-written like the existing report evidence guards.
- Constraint: identity and hash functions are async (Web Crypto is async). Callers `await` them.
- Constraint: contracts carry `schemaVersion`; consumers reject unknown major versions.

## Cross-Repo Touchpoints

- **ui (reportworker, phase 3):** consumes everything in Part A.
- **api (phase 4):** job create/get/list and the `reports` publisher adopt `buildReportJobRowV1`, `serializeReportJobSpecV1`, the identity functions and the message builders. The API names the `reportjobs` table and `reports` queue in its own factory and env settings.
- **cloud-engine (phase 5):** the `report-generation` adapter adopts the identity and row contracts.
- **iac:** creates the `reportjobs` table and `reports` queue; their names are not in this package.

## Local Recon (Required Before Approach)

- Entry points checked: `src/index.ts`, `src/scheduler/index.ts`, `src/azure/reportingTemplates.ts`, `src/azure/reportEvidence*.ts`, `package.json` exports and scripts, `README.md`, `specs/reporting/report-evidence-pack-types-package.md`, `specs/scheduler/azure-resource-strategy-scheduling/*`.
- Existing patterns found: subpath entry with its own ESM entry file (`./scheduler`); dependency-free guards returning typed results; `scripts/check-*-contracts.mjs` run by `npm test` against the built `dist`.
- Relevant docs: README (runtime persistence ownership), DEPLOYMENT.md (stable GitHub Packages publishing).
- Remaining runtime gates: API admission/storage proof, recovery index/budget, engine timing/compiler policy and delivery outbox/provider evidence. They do not block these pure shared contracts.

## Approach

### `reporting-jobs` (src/reporting/jobs/)

**Report job spec** (`reportJobSpec.ts`), stored as `requestJson`:

```ts
export const REPORT_JOB_REPORT_TYPES = ['sdm', 'architecture-assessment'] as const;
export type ReportJobReportType = (typeof REPORT_JOB_REPORT_TYPES)[number];

export interface ReportJobScopeV1 {
  cloudAccountIds: string[]; // 1..20, each ^[A-Za-z0-9_-]{1,80}$
  subscriptionIds: string[]; // 1..200 GUIDs, stored lower-cased and sorted
}

export type ReportPeriodRuleV1 = { kind: 'previous-calendar-month' } | { kind: 'previous-calendar-quarter' };
export interface ReportExplicitPeriodV1 {
  kind: 'explicit';
  startDate: string;
  endDate: string;
} // YYYY-MM-DD, start <= end, <= 366 days

export interface SdmBackgroundConfigV1 {
  layout: 'spotto-layout' | 'monthly-insights'; // 'company-template' is not supported in v1
  cloudIqServiceProfile: { selectedServiceIds: string[]; detailRowLimit?: 10 | 25 | 50 | 'all' };
}

export interface CurrentStateBackgroundConfigV1 {
  audience: 'customer' | 'internal';
  sections: { costOpportunities: boolean; securityPosture: boolean; reliabilityAvailability: boolean; quickWins: boolean; roadmap: boolean };
  scopeCurrencyCode: string; // ISO 4217, upper case
  preparedBy?: string; // 1..120 chars, plain text; required resolved value checked by the producer/worker
}

export type ReportJobSpecV1 =
  | {
      schemaVersion: 1;
      reportType: 'sdm';
      scope: ReportJobScopeV1;
      period: ReportPeriodRuleV1 | ReportExplicitPeriodV1;
      configuration: SdmBackgroundConfigV1;
    }
  | { schemaVersion: 1; reportType: 'architecture-assessment'; scope: ReportJobScopeV1; configuration: CurrentStateBackgroundConfigV1 };
```

- `selectedServiceIds` is validated against the library's service catalogue by reportworker, not here: the catalogue belongs to `libs/reporting`. Here it is a bounded list of `^[a-z_]{1,64}$` (≤ 20).
- Current State curation (hand-picked findings) is not part of v1 background runs. Configuration is audience, sections, currency and optional `preparedBy`. Producer/worker prerequisite checks must resolve a non-empty prepared-by value from approved settings or configuration; optional syntax is not permission to generate without it.
- `parseReportJobSpecV1(input: unknown): { ok: true; value } | { ok: false; errors: string[] }` is strict: unknown keys fail, strings are trimmed and length-bounded, subscription IDs are lower-cased, de-duplicated and sorted, no field may contain `/`, `\`, `?`, `#` or `://` except where the pattern allows.
- `serializeReportJobSpecV1(spec): string` writes the canonical JSON (fixed key order, normalized IDs). Producers store exactly this string; `requestSha256 = sha256Hex(utf8(requestJson))`. Size limit 32 KiB, checked by `serialize`.

**Identity** (`reportJobIdentity.ts`):

| Function                                                    | Rule                                                                                                                                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `buildReverseTime19(date)`                                  | `(9999999999999999999n − BigInt(date.getTime()))`, zero-padded to 19 digits                                                                                                 |
| `parseReverseTime19(value)`                                 | Inverse; rejects anything but 19 digits                                                                                                                                     |
| `buildReportJobScopeHash({ subscriptionIds, scheduleId? })` | First 16 hex chars of SHA-256 over the sorted, lower-cased IDs joined with `,`, then `                                                                                      | {scheduleId}` when present               |
| `buildReportJobId({ instant, reportType, scopeHash })`      | `{reverseTime19}-{reportType}-{scopeHash}` (≤ 60 chars; fits the API's report ID rule)                                                                                      |
| `parseReportJobId(jobId)`                                   | Returns `{ instant, reportType, scopeHash }` or `null`. `REPORT_JOB_ID_PATTERN = /^\d{19}-(sdm                                                                              | architecture-assessment)-[0-9a-f]{16}$/` |
| `buildReportJobMessageId(companyId, jobId)`                 | `report-job:{companyId}:{jobId}`. Company IDs on jobs are at most 56 characters (`REPORT_JOB_COMPANY_ID_MAX_LENGTH`) so this stays within Service Bus's 128-character limit |
| `sha256Hex(bytes                                            | string)`                                                                                                                                                                    | Lower-case hex via Web Crypto            |

The instant is `scheduledForUtc` for schedule jobs and the acceptance time for all other jobs.

**Queue message** (`reportJobMessages.ts`):

```ts
export interface ReportJobRequestedV1 {
  schemaVersion: 1;
  messageType: 'report-job.requested';
  companyId: string; // ^[A-Za-z0-9_-]{1,56}$ (MessageId bound)
  jobId: string; // REPORT_JOB_ID_PATTERN
  correlationId: string; // 1..128 chars
}
```

`isReportJobRequestedV1` is strict (no extra keys). Broker properties: `MessageId` from `buildReportJobMessageId`, `CorrelationId = jobId`, content type `application/json`, subject `report-job.requested`. The body is at most 1 KiB in practice; the guard enforces 4 KiB.

Messages carry identifiers only. Isolation comes from each stack's queue, table, storage endpoints and company ownership checks. Report time zone is chosen by reportworker from the company and frozen in its snapshot, not persisted on this message or row.

**Job row** (`reportJobRow.ts`): the entity as stored in `reportjobs` (Azure Table values only: string, number, boolean).

| Group                  | Fields                                                                                                                                                                                                                                                                                                                                      | Writer                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Keys                   | `PartitionKey` = `companyId`, `RowKey` = `jobId`                                                                                                                                                                                                                                                                                            | producer               |
| Identity (immutable)   | `schemaVersion` (1), `jobId`, `companyId`, `reportType`, `trigger` (`api` \| `schedule`), `scheduleId?`, `definitionRevision?`, `scheduledForUtc?`, `requestedAtUtc`, `requestedByUserId?`, `coalescedOccurrenceCount?`                                                                                                                     | producer               |
| Request (immutable)    | `requestJson`, `requestSha256`, `fileName`, `notificationPolicyId?`                                                                                                                                                                                                                                                                         | producer               |
| Generation (mutable)   | `status`, `attemptCount`, `leaseOwner?`, `leaseExpiresAtUtc?`, `startedAtUtc?`, `sourceObservedAtUtc?`, `sourceSnapshotSha256?`, `sourceCoverageSummary?` (JSON ≤ 8 KiB), `generatedAtUtc?`, `artifactContentSha256?`, `artifactBytes?`, `completedAtUtc?`, `failureStage?`, `failureCode?`, `lastTransientErrorCode?`, `lastAttemptAtUtc?` | reportworker           |
| Notification (mutable) | `notificationStatus` (`none` initially), optional `notificationAttemptCount`, `notificationDestinationCounts`, `notificationCompletedAtUtc`                                                                                                                                                                                                 | cloud-engine (phase 6) |

- `REPORT_JOB_PRODUCER_FIELDS`, `REPORT_JOB_WORKER_FIELDS`, `REPORT_JOB_NOTIFICATION_FIELDS` are disjoint `readonly` field groups covering the row. Notification grouping is extended additively; all existing members remain. They describe default ownership. `validateReportJobUpdateV1` defines bounded lifecycle exceptions; all runtime mutations preserve unrelated fields and use ETag CAS.
- `parseReportJobRowV1(entity)` validates the row (including `RowKey === jobId`, `PartitionKey === companyId`, `parseReportJobId(jobId).reportType === reportType`, the job ID's instant against `scheduledForUtc`/`requestedAtUtc`, the scope hash against the request) and returns the typed row plus the parsed spec, after verifying `requestSha256`. Returns `{ ok: false, code }` with a `ReportJobFailureCode`.
- It accepts both Table key casings: REST with `odata=nometadata` (`PartitionKey`, the API's `TableStore`) and `@azure/data-tables` (`partitionKey`, reportworker), drops system properties (`etag`, `Timestamp`/`timestamp`, `odata.*`) and `null` values, and returns REST casing. `toReportTableSdkEntity(row)` converts back for SDK writes.
- Cross-field rules: `failed` needs a failure code and the code's stage (any stage for `retries-exhausted`); other statuses carry no failure fields; `source-ready` and later need `sourceSnapshotSha256` and `sourceObservedAtUtc`; `generated` and later need the artifact hash, size (≥ 1 byte) and `generatedAtUtc`; completed statuses need `completedAtUtc`; `accepted` means no attempt yet. `sourceCoverageSummary` must be a JSON object within 8 KiB of UTF-8. `requestedByUserId` may not contain `@`.
- Instants passed as strings must be exact UTC ISO timestamps (`toISOString` form), so a job ID never depends on the host time zone.
- The row never contains e-mail addresses, document content, source data, Blob paths or credentials. `fileName` is a file name only (`sanitizeReportingPathSegment(fileName) === fileName`, ends with `.docx`, ≤ 120 chars).

**Status vocabulary** (`reportJobStatus.ts`):

- `ReportJobStatus`: `accepted`, `running`, `source-ready`, `generated`, `completed`, `completed-with-notification-errors`, `failed`.
- Status is a **monotonic milestone**, not "what the current attempt is doing". Retries change `attemptCount` and the lease, never move status backwards.
- `REPORT_JOB_STATUS_TRANSITIONS`: `accepted → running`; `running → source-ready`; `source-ready → generated`; `generated → completed | completed-with-notification-errors`; every non-terminal status → `failed`. `canTransitionReportJobStatus(from, to)`.
- `ReportJobFailureStage`: `request`, `authorization-or-entitlement`, `scope-resolution`, `source-load`, `report-model`, `document-render`, `artifact-persist`, `notification`.
- `ReportJobFailureCode` (stage in brackets): `request-invalid`, `request-hash-mismatch`, `message-row-mismatch`, `region-mismatch`, `unsupported-schema-version`, `notifications-not-enabled`, `report-type-disabled` [request]; `company-not-found`, `entitlement-missing` [authorization-or-entitlement]; `scope-not-owned`, `scope-load-failed`, `no-ready-subscriptions` [scope-resolution]; `source-not-ready`, `source-invalid`, `snapshot-too-large`, `snapshot-invalid` [source-load]; `invalid-rate`, `invalid-currency`, `no-prepared-by`, `model-error` [report-model]; `render-error`, `docx-invalid`, `artifact-too-large` [document-render]; `artifact-conflict`, `artifact-integrity` [artifact-persist]; `publication-rejected` [request]; `retries-exhausted`, `recovery-exhausted` [the explicit stage supplied by the writer]. `REPORT_JOB_FAILURE_STAGE_BY_CODE` maps each code to its stage (`retries-exhausted` takes the stage from the writer).

### Part B implementation decisions

- API create body: `{ schemaVersion: 1, report: ReportJobSpecV1, notificationPolicyId? }`. The 202 response is `{ jobId, reportId, fileName, status, statusUrl }`, including the current status on reuse. Public projections whitelist identity, scope/period, milestone times, safe failure codes and notification aggregates; no row keys, lease, request JSON, internal errors, paths or recipient addresses. `downloadUrl` is an authenticated relative API path only on completed jobs. Lists use `{ results, continuation?: { cursor } }`, at most 100 results; query filters are bounded and company authorization remains API-owned.
- Admission fingerprint hashes the full canonical report plus the policy ID (including absence). It excludes caller/company, which the admission repository must bind independently. Shared constants identify the 10-minute duplicate window and five-job API generation cap. `generated` jobs awaiting notification do not consume generation slots. No helper claims to enforce concurrency or persist idempotency mappings; retention and the atomic storage mechanism remain API task 1 gates.
- Conditional lifecycle validation accepts current/next rows, actual/expected non-wildcard ETags, current UTC time and a discriminated writer context. It returns a validated replacement row plus `expectedEtag`; callers must perform an actual conditional replace. Worker lease acquisition/renewal is fenced by owner, expiry, ETag and monotonically increasing attempt count. Snapshot/artifact milestones are pinned. Producers can fail only untouched accepted jobs; proven publication rejection uses `publication-rejected`. Maintenance failure requires an expired/absent lease, configured age and exhausted recovery budget; `recovery-exhausted` takes the explicit stage. Notification-only jobs are excluded.
- Notification rows add optional attempt count, JSON destination counts and completion UTC, preserving Part A rows. Counts contain only email/Slack/Teams/webhook total/delivered/failed aggregates (maximum 32 destinations); provider checkpoints and addresses remain private and worker-owned. The notifier lifecycle role is performed by reportworker direct delivery. It supplies the independently verified artifact hash, finishes only a pending generated job and preserves worker fields. Terminal jobs cannot be revived. The worker alone initializes `none -> pending` after generation.
- Notification pointer has the parent's exact fields. Its broker ID is **`report-notify:{SHA256(JSON.stringify([companyId, jobId]))}`** (78 characters), rather than the proposed plain concatenation which can reach 131 characters. The ID excludes artifact hash so retries of the same job deduplicate; the consumer independently verifies that hash. Correlation remains job ID.
- Report schedules extend generic write/projection/occurrence unions and validators without replacing the kernel. Timing covers once/daily/weekly/monthly/quarterly, local calendar validation, IANA timezone, and days 1..31/last. SDM scheduled periods are rules only. Report mutations reject resource permission consent. Projection outcome `accepted` means job dispatch accepted, with `lastJobId`, not document generation succeeded. Occurrences carry company, revision/generation, due time, IDs, report and optional policy; no fabricated resource/provider identity. Compilation, DST and missing-day policy remain engine implementation work.

### Lifecycle operations (Part B)

The field arrays stay disjoint. `validateReportJobUpdateV1` implements the parent's lifecycle rules: producer pre-dispatch failure on untouched `accepted`; worker lease acquisition/renewal and generation milestones, with `none → pending` initialization; notifier finalization of `generated` jobs; and maintenance terminal failure under age/budget/no-live-lease fences. Maintenance may clear an expired lease while failing the stranded row. Recovery re-publication/index writes remain runtime-owned and do not use this helper to fabricate row progress. These are bounded exceptions, not arbitrary merges. Contract checks reject stale ETags, status regression, unrelated-field changes and completion of failed generation. Publishers and storage adapters must adopt these helpers before enabling writers.

### Storage layout (not in this package)

Iteration 1 added a second storage subpath; iteration 2 removed it from this shared package. Its private seed and checks still wait in `spotto/_reportworker-storage-draft/`; worker task 3 will move them into the app. Only file-name validation and Table key-casing helpers remain shared because the job row needs them. Neither names a table, account or blob location.

Subscription IDs are lower case everywhere (Jay, 2026-09-28): requests, the scope hash and, in reportworker, every key and path.

## Part A tasks (implemented; retained as verification checklist)

1. Job contracts
   Files: `src/reporting/jobs/{reportJobSpec,reportJobIdentity,reportJobMessages,reportJobRow,reportJobStatus,index}.ts`, `src/reporting/jobs/__fixtures__/*.json`
   Action: add the types, strict parsers, canonical serializer, identity functions, status/transition tables and failure vocabularies above. Identity vectors cover epoch edges, mixed-case and duplicate subscription IDs, schedule and API jobs.
   Verify: `npx tsc --noEmit`; the check script in task 4.
   Done: every exported function has valid and invalid fixtures; field groups are disjoint and complete.
2. Storage contracts: **removed from this package in iteration 2; private seed awaits worker task 3** (see "Storage layout").
3. Package wiring
   Files: `package.json` (`exports` and `typesVersions` for `./reporting-jobs`), `README.md`
   Action: follow the `./scheduler` subpath pattern. README: document the subpath.
   Verify: `npm run build`; `npm run check:packed-exports`.
   Done: the subpath resolves under `require` and `import` from the packed tarball.
4. Contract checks
   Files: `scripts/check-reporting-job-contracts.mjs`, `package.json` (`test`)
   Action: load the built CJS and ESM entries; run all fixtures; assert identity vectors, parser rejections, field-group coverage, transition table, and that CJS and ESM give identical results.
   Verify: `npm test`.
   Done: the script fails on any fixture mismatch; wired into `npm test`.
5. Release
   Action: Parts A and B are present in the current `1.1.5` tree. Before rollout verify the resolved consumer package contains these contracts. Release before deploying new consumers.
   Verify: package build/packed exports, resolved lockfile version and configured-registry availability; do not infer a published version from a manifest alone.
   Done: version recorded under "Implementation notes".

## Part B implementation tasks

1. API contracts and admission semantics
   Files: `src/reporting/jobs/reportJobApi.ts`, `reportJobSpec.ts`, contract checks and consumer fixture.
   Action: strict create/list DTOs, safe projections/builders, complete canonical fingerprint, bounded idempotency key and slot constants/predicate. Keep coordinator and retention storage private to API.
   Verify: reporting Part B check (independent hashes, changed policy/configuration, pagination, safe downloads/field exclusion); packed TypeScript consumer.
   Done: both module formats export validated DTOs with no runtime I/O or authorization claims.
2. Lifecycle and notification contracts
   Files: `reportJobLifecycle.ts`, `reportJobNotifications.ts`, `reportJobRow.ts`, `reportJobStatus.ts`, `index.ts`, checks.
   Action: guarded replacement-row validation, writer exceptions, lease/attempt/milestone pins, pointer message and bounded broker ID, safe notification aggregates. Preserve valid Part A rows.
   Verify: valid writer paths plus stale/wildcard ETags, live-owner takeover, expired retry, field tampering, ambiguous sends, recovery age/budget, failed-generation completion and delivery/count disagreement rejections.
   Done: every writer has explicit fences; runtime CAS, queue recovery and provider outboxes remain consumer gates.
3. Scheduler family and package integration
   Files: `src/scheduler/reportGeneration{Contracts,Validation}.ts`, scheduler unions/guards/index, `package.json`, README, packed check/consumer fixture.
   Action: add report definitions/projections/occurrences, reject resource consent and explicit schedule periods, wire built CJS/ESM and strict packed imports into `npm test`.
   Verify: timing/date/boundary cases, generic controls/lists/operation results, negative type fixtures, full package suite, lint and formatting.
   Done: shared types are available locally; release, resolved lockfiles and actual cross-repo runtime adoption remain outstanding.

## Test Strategy

Part B sources are delivered together; adoption remains staged by parent phase. API DTOs/lifecycle/admission belong to phase 4, schedule unions to phase 5, notification events/fields/finalization to phase 6. Release and verify the resolved version before each consumer adoption. Package tests prove pure contracts and imports; they do not prove storage coordination, recurrence compilation, dispatch or delivery.

- Unit/contract: the check script (task 4) over fixtures; CJS/ESM equivalence.
- Integration: the worker will exercise the resolved consumer package when job processing lands; API and cloud-engine re-run identity vectors in their real runtimes when adopting it (phases 4, 5). Current worker tests cover configuration/health only.
- Coverage: every exported function exercised by the fixtures.

## Definition of Done (DoD)

### Feature Criteria

- The subpath is available in the intended consumer build and registry; identity vectors pass on Node 24 in CJS and ESM. Availability is checked at rollout.
- No table, queue or account names or blob paths in the published package.

### Completion Checklist

- [x] Unit tests added with happy/error/boundary coverage (contract script)
- [ ] Feature validated in dev environment — N/A here; validated through reportworker (UI spec)
- [x] Part A historical quality review: 2026-09-28; Part B inspected against writer fences, bounded inputs, public field exclusions and packed consumers on 2026-10-04. Lease-acquisition/attempt/outcome findings fixed and tested; no independent Part B review is claimed.
- [ ] Docs repo updated — N/A, not user-facing
- [ ] MCP server updated — N/A
- [ ] Swagger/OpenAPI updated — N/A, no API change in phase 3
- [ ] Demo data updated — N/A

## Risks and Mitigations

- Risk: identity functions differ between producers. Mitigation: one implementation here, shared identity vectors re-run in each consumer.
- Risk: internal storage layout leaks into the shared package. Mitigation: removed in iteration 2; packed-export checks fail if `reporting-storage` reappears. Public projections whitelist safe fields.

## Rollback / Feature Flag

- New contracts are additive. Strict guards now reject array-shaped coverage summaries, explicit-period schedule rows and incoherent notification row milestones; these violate the approved contract. Existing valid Part A rows remain compatible. Cloud-account IDs retain their existing strict no-surrounding-whitespace validation; valid duplicates normalize before fingerprinting. Expanded scheduler unions require consumers with exhaustive switches to handle the new family before enabling it. Rollback: disable new producers first and pin a previous compatible stable release; drain accepted work with compatible consumers.

## Security Considerations

- The package is shared: it contains no storage layout, credentials or internal hostnames.
- Identifier rules accept only IDs that are safe in Table keys, blob paths and `:`-separated MessageIds.
- The message and row types exclude addresses, content, paths and credentials by construction; the parser rejects extra fields.

## Runtime Environment

- Build: `npm run build`
- Tests: `npm test`
- Env vars: none

## Decisions (Jay, 2026-09-28)

1. **No region on the message or the row** (replaces "region codes `aue | swc | eus`"). Each region has its own table, queue and worker, so a region field adds no protection. `homeRegion`, `REPORT_REGION_CODES`, `ReportRegionCode` and `isReportRegionCode` are removed.
2. **No time zone on the row.** reportworker uses the company's `preferredTimezone` (else UTC). `isIanaTimeZone` stays exported for that check.
3. **Job contracts as a subpath** (`@spottoai/types-package/reporting-jobs`). Storage contracts are not shared.
4. **`trigger` stays `api | schedule`.** The dev tool writes `api` with `requestedByUserId = operator:{name}`.

## Iteration 3 (2026-09-28)

- Removed `homeRegion` from `ReportJobRequestedV1`, `ReportJobProducerFieldsV1` and `BuildReportJobRowInput`, and `timezone` from the row and `BuildReportJobRowInput`. A row or message that still carries either field is rejected as an unknown field.
- Checks updated: the message and row tamper cases now assert that `homeRegion` and `timezone` are rejected; the consumer fixture drops both.
- Historical compatibility note: this broke the original beta.455 message/row shape. The no-region/no-time-zone sources are now committed; manifest at the documentation audit was `1.1.4`. Old extra fields remain invalid, so confirm producer/consumer versions before rollout.
- Verification (Linux copy of `main` at 6c11bb0): `npm run build` ✓, `npm test` ✓ (every check, including `check:reporting-job-contracts` and the packed-exports consumer fixture), Prettier clean. `dist/` was not rebuilt in the working tree (the committed `dist/` already trails `src/` after DEV-1322; the prerelease workflow builds before publishing). The reportworker storage draft compiles against the new build and its checks pass (its account-name builder, which needed the region codes, was removed: the VM scripts pass each account URL).

## Historical implementation notes (2026-09-28)

Iteration 1 introduced job and storage subpaths; iteration 2 removed the storage subpath from this shared package and placed its private seed/checks in `spotto/_reportworker-storage-draft/`. Iteration 3 removed message/row region and row time zone. Current public export is `@spottoai/types-package/reporting-jobs` only; `reporting-storage` must not resolve. The seed has not yet moved into the worker app.

Sources are `src/reporting/jobs/` and dependency-free shared ID/hash/file-name/Table-casing helpers. Contract checks exercise canonical identity vectors, parser rejections, row build/parse/tamper, field consistency, SDK key casing and message bounds in CJS/ESM. Packed-export checks compile the consumer fixture and reject the removed storage export.

Historical review fixes covered SDK casing, UTC instants, MessageId length, row consistency, requester/address exclusion, UTF-8 coverage limits and non-string input. Those historical checks do not imply that the worker runtime or later producer contracts are implemented.

## Verification log

- 2026-10-13, coordinated end-to-end implementation, Windows/Node 24, source candidate `1.1.33`: full `npm test` passes, including current reporting recovery/prerequisite contracts, scheduler assertions, fresh CJS/ESM build and packed Node consumer exports. API/engine use local candidate packs; Portal/worker use approved compiled-export links. Publication and real registry consumer adoption remain pending. Reportworker now performs the notification lifecycle role directly; a hub or separate engine report-notification consumer is not required. [Combined evidence](../../../core/specs/reporting/reporting-verification-2026-10-13.md).

- 2026-10-04, Part B implementation, Windows/Node 24, manifest `1.1.5`: full `npm test` passed on the final sources, including fresh CJS/ESM build, contract typecheck, all existing package checks, 5 identity vectors, 308 Part B assertions and packed consumers. Full `npm run lint` passed; final changed sources also passed focused ESLint and Prettier. A complete regenerated `dist` is retained: a scoped-output cleanup exposed pre-existing missing root-entry dependencies (`azure/reportEvidence.js`); the complete fresh build is needed to pack/import the package. Source changes remain scoped to reporting/scheduler. Publication, live consumer lockfiles, real CAS/admission, queue dispatch, compiler/DST and provider delivery remain unverified here.
- Deliberate rejection tests caught lease acquisition publishing snapshot fields; the guard now allows acquisition fields only. Worker attempt times change only on acquisition, pinned snapshot/artifact fields cannot be replaced, pending notification jobs cannot be failed by maintenance/worker, and link-only attachment warnings require a delivered email destination.
- The strict packed consumer fixture covers report unions and negative compile-time checks for explicit schedule periods and permission consent. Both module formats expose reporting helpers only through `/reporting-jobs` and report schedule members through `/scheduler`/root; removed `/reporting-storage` remains unresolved.

- 2026-10-04: `node scripts/check-reporting-job-contracts.mjs` passed on the current local build (5 identity vectors, CJS and ESM). Audit manifest was `1.1.4`; no registry query, fresh full build, full suite or deployed consumer check was run by this documentation reconciliation.

- 2026-09-28 (iteration 2): clean `dist`, `npm test` ✓ with the jobs-only check and the packed-exports check (which also asserts `reporting-storage` does not resolve); lint and prettier clean.
- 2026-09-28 (later): subscription IDs lower-cased in every builder, per Jay's decision; contract check updated and passing.
- 2026-09-28, Linux copy of the device tree at `1.0.2-beta.453`: `npm run build` ✓; `npm run lint` ✓; `npm test` ✓ (every existing check plus `check:reporting-job-contracts` and the extended packed-exports check); prettier clean on new files. Identity vectors cross-checked with `node:crypto`; mutation checks confirmed the script fails on a wrong vector and on a wrong row failure code.

## References

- Parent: `core/specs/reporting/reporting-scheduler.md`
- `api/services/ReportingTemplates/ReportingTemplateService.ts` (generated-report store, `sanitizePathSegment`, ownership check)
- `api/services/CloudResource/AzureResourceService.ts` (evidence, history, tenant evidence), `api/services/ReportingSettings/ReportingSettingsMerge.ts`
- `cloud-engine/apps/azure/src/Libraries/Repositories/RecommendationAuditRepository.ts` (reverse time)
- `types-package/src/scheduler/index.ts`, `package.json` (subpath pattern)
