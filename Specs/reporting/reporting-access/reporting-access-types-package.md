# Reporting access contracts in shared types

Type: repo
Status: draft
Owner: Shared Contracts
Last updated: 2026-10-29
Core feature: [Reporting access](../../../../core/specs/reporting/generation/reporting-access/reporting-access.md)

Types-package owns dependency-free capability, principal and refusal contracts. Existing generic role/feature and versioned job/schedule contracts remain their authorities. This is designed contract work; types alone do not establish deployed behavior.

## Contracts

Define only shared shapes required by policy: distinct catalogue/member, pack, SDM/Current State and schedule capabilities; requested action; bounded company/source/report/category context; human or API-key principal identity; and stable safe refusal codes. Executable evaluation and application role membership remain outside this package.

Reuse supported feature/reporting subpaths. Strict parsers reject unknown principal kinds, foreign scope, invalid category IDs and unbounded reason payloads. Never expose saga/checkpoint details, storage addresses, credentials or recipients in errors.

Job failures use bounded codes for unresolved requester, missing action, reporting/export denial, demo restrictions and invalid delivery policy. `REPORT_JOB_FAILURE_CODE_BY_FEATURE` binds specific source and recommendation-category identifiers to safe codes; historical generic codes remain valid. These additions are strict enum extensions: older readers reject them. Before enabling writers, delivery must address every reader, including retained older browser sessions, through compatible projection/negotiation or a verified version cutover. Package publication alone is insufficient compatibility evidence.

The internal lifecycle update context distinguishes verified-byte notification updates from settlement of a durable artifact-integrity block. Block settlement retains generation/artifact identity, CAS fences and actual delivery attempts, and must produce a terminal delivery outcome; it cannot claim verified bytes or invent a provider attempt. Oversized-attachment fallback cannot finalize as successful when aggregate destinations include failures. These rules reuse existing row/projection fields and notification statuses.

Saved schedules/jobs retain the original principal evidence. Reuse attribution where sufficient. Additive fields require a compatibility strategy that never treats a key as a human or grants service authority for missing historical evidence. No backfill or bulk record rewrite is required.

Report schedule projections carry optional `pauseReason: owner-access-unavailable` only while paused. This represents a proven original-owner access refusal; policy-store outages remain retryable. Validated resume and edits clear the reason. Optional `lastOccurrenceSettledAtUtc` records when an occurrence was actually settled, independently of its due time, and requires a valid occurrence timestamp. The engine stores both additions outside the strict serialized payload in generation-bound private Table columns. The API emits them only for readers negotiating `X-Spotto-Report-Lifecycle: 1`; existing readers retain their prior DTO shape. New validators accept the optional fields without requiring record migration.

## Implementation boundaries

Inspect src/features-and-permissions/access.ts, src/reporting/jobs/reportJobApi.ts, reportJobRow.ts, reportJobSaga.ts, reportPack.ts and scheduler report-generation/principal contracts before adding fields. Preserve deterministic queue/job identities, strict saga validation and the thirty-day retention constant. Keep catalogue copies, SDKs and storage I/O out of this package.

## Verification and delivery

Build CJS/ESM, strict contract tests and packed exports for valid/invalid capabilities, identities, source/category context and safe reasons. Compile API, worker and scheduler against the same intended published surface. Resolve unrelated existing contract adoption before release; a reporting-only local overlay does not prove registry installation. Lifecycle choices follow the recorded core decisions.

## Matrix and failure-state parity

Capability inputs distinguish report-specific prerequisites from generic source grants, including explicit Resource Insights for Resource Estate and At a Glance. Principal evidence is sufficient for current role capability as well as audience resolution. Refusal and lifecycle contracts distinguish access denied before admission, authority changed after acceptance, operational/transient failures, delivery outcomes and artifact expiry without exposing protected internals.

Run Now from a saved schedule requires report-schedule capability, including when delivery is unchecked. Do not use the reader-allowed ordinary pack-generation capability as a substitute or defer schedule authorization until after a job has been admitted. Test ordinary viewer pack success separately from saved-schedule Run Now refusal.

Principal purpose is explicit: queued execution/delivery use the original requester; authenticated downloads authorize the current caller and actual artifact coverage. Do not lend creator authority to a denied caller. Personal Downloads also checks requester identity. In-portal notifications require an eligible recipient and use their permitted result route; external Action Group delivery retains its separate owner/export authorization.

## Authorization visibility versus workflow readiness

Denied reports/navigation/actions are absent, never greyed-out permission placeholders or teaser/promo items. Preserve backend refusal for direct calls. Keep authorization separate from temporary workflow readiness: authorized actions may be disabled for missing selections/inputs, permitted-data loading or in-flight work. Hidden UI is not API authorization. Test denied matrix cells as absent controls and permitted workflow prerequisites as visible disabled controls; do not conflate these states.
