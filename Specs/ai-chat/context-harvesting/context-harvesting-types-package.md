# Context harvesting contracts

Type: repo
Status: draft
Owner: Platform
Last updated: 2026-10-27
Core feature: [Context harvesting](../../../../core/specs/ai-chat/context/context-harvesting/context-harvesting.md)

## Implementation state and ownership

Additive contracts are root-exported from `src/company/companyContextHarvesting.ts`.
Existing memory, source, meeting and note-revision DTOs remain supported. These
exports have local build and packed-consumer verification; registry publication
remains a release prerequisite. API owns runtime validation, authorization, job
execution, budgets and persistence; UI owns progress and review presentation.
No SDK, queue client, scheduler or storage implementation belongs in this package.

## Work and progress contracts

An admission request identifies one company, source selection and bounded scope,
plus an idempotency key for explicit requests. Private-conversation selection is
an owner-only input contract, not a `CompanyContextSource` or shared citation.
Canonical actor, scope admission, source revisions and processing budgets are
server-attributed. A caller cannot grant access by setting a visibility field.

A run projection identifies its permitted run, input version, stage, coverage,
safe reason codes and available review-batch reference. Stages distinguish
queued, extracting, comparing, ready-for-review, no-output, superseded, cancelled,
failed and unavailable. A successful no-output run has no approval receipt.
Progress does not expose raw prompts, credentials or unrelated source identifiers.

## Restricted drafts and candidate contracts

A change batch has company, opaque batch identity, revision, visibility, expiry,
coverage and items. Owner-only private draft projections are distinct from
company-shareable projections; shared shapes forbid private conversation/message
IDs, titles and unselected text. Private job references are never inserted into
shared `CompanyContextSource` unions. Publication creates the existing permitted
company-owned statement snapshot through promotion.

Candidates identify a logical change, proposed content/hash, exact permitted
source passages, certainty, comparison outcome and proposed organization.
Comparison discriminates addition, existing match, update and conflict. A
suppressed result contains only a safe review reason, never positive retrieval
content or hidden exclusion locators. Existing targets include their base revision.
Unresolved area/person/team suggestions remain separate from canonical identity
IDs and final valid `CompanyMemoryContent` responsibility relationships.

Topic suggestions reuse the shared context categories, including `licenses`. One statement can
have multiple topics without multiple copies. Candidate content preserves the
existing fact/objective/constraint/decision/responsibility kinds; a tentative
idea is not implicitly an approved objective or an agreed decision.

## Note changes and exact review

A discriminated change item targets either memory or a Company Note. A note
target identifies category/note, structured question or document section, base
revision and current/proposed content. An unsaved-slot create is explicit and
does not pretend to have an existing note revision. Section locators are checked
against the current template by API, not interpreted as arbitrary document patches.

Review requests bind batch/item revisions, selected decisions, reviewed content
hashes, source vectors, target base revisions, confirmation/expiry and stable
idempotency keys. An edit invalidates prior confirmation. Server actors and
provenance are not writable request fields. Existing memory lifecycle, note saves
and private promotion remain the authoritative commit contracts.

Per-item outcomes distinguish committed (with owner revision receipt), rejected,
conflicted and failed with safe reason codes and retryability. A batch-level result cannot imply that
all targets were saved or that notes and memory share one transaction. Conflict
results expose only permitted current metadata and let UI retain the draft.

## Compatibility and acceptance

Publish these additive exports through the normal types-package release before
API/UI adopt them. Installed-package fixtures must distinguish draft/active data,
reject incomplete responsibility and unversioned existing-target writes, prevent
private identifiers in shared projections, and accept independent per-item results.
Existing note, meeting, memory and chat payloads remain compatible. Exported types
and fixtures do not establish implemented background execution or authorization.

## Export and local verification mapping

`CompanyContextHarvestRequest` admits only a company/source identity and an
idempotency key; callers cannot set source versions or execution policy.
`CompanyContextHarvestRun` supplies bounded progress stages and attributed input
version. `CompanyContextChangeBatchListResponse` lists currently authorized batches
and optionally authorized runs, including owner-scoped conversation filtering.

`CompanyContextChangeBatch` discriminates `owner-only` private-conversation drafts
from `source-authorized` note drafts. The shared branch constrains all item sources
to existing `CompanyContextSource`; it cannot contain private conversation source
references. Runtime authorization still excludes inaccessible titles, wording and
counts. `CompanyContextChangeItem` discriminates memory add/correct/forget from a
context-note question update/create. Note values retain the existing structured
answer union, including multi-select arrays and rich text. Unsaved slots have
neither note identity nor an invented base revision.

`CompanyContextChangeEditRequest` edits one draft content/value under batch/item
revision checks. Source, operation and target remain immutable. The returned batch
has fresh revisions and a fresh complete `changeHash`. `CompanyContextChangeReviewRequest`
binds these revisions and hashes independently per selected item; the hash covers
the operation, reviewed wording/value, source vector, target and observed base.
Private approvals additionally require explicit company-visibility confirmation.
`CompanyContextChangeReviewResponse` returns independent owning-service results.

`CompanyMeetingResponsibilityCandidate` is optional unresolved review material in
meeting extraction. Labels, supported topics, certainty and transcript passages do
not substitute for canonical area/person/team identities in memory content.

Run `npm run build`, then
`node scripts/check-context-harvesting-contracts.mjs <absolute-built-tarball>`.
The focused packed fixture checks declarations and CommonJS/ESM exports without a
source alias. Development overlays may preserve an installed registry baseline
when the local source package version is older; such overlays are test artifacts,
not deliverable dependencies. Delivery manifests and locks remain registry-based.
