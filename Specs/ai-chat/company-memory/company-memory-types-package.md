# Company memory contracts

Type: repo
Status: draft
Owner: Platform
Last updated: 2026-10-25
Core feature: [Company memory](../../../../core/specs/ai-chat/context/company-memory/company-memory.md)

## Entry and identity contracts

`src/company/companyMemory.ts` exports separate proposals and reviewed entries,
content and responsibility relationships, company-local identity records, source
provenance, eligibility, history and mutation DTOs through the package root.

Every proposal/entry has a company, memory ID, immutable revision, content hash,
nonempty supporting sources and server-attributed creation metadata. Provenance
distinguishes company authorship, reported information, model interpretation and
Spotto-derived observations. Review does not turn a report into verified posture.
Source locators and versions follow [company context](../company-context/company-context-types-package.md).

Proposals have `review.state: proposed` and no eligibility decision. Reviewed
entries have an attributed reviewer and review time, a lifecycle state and separate
source/temporal eligibility. Entry projections are management/history data; not
every returned entry is eligible AI context. API enforces current scope, visibility,
validity and review state before exposing facts to retrieval.

Topics reuse context note categories. Areas, people and teams retain independent
identities and aliases, with explicit canonical associations. A responsibility
requires an area, relationship and a person/team assignee or an explicit unknown
reason. Identity edits and merges bind base revisions. Names and stored
responsibilities confer no Spotto permission.

## Mutation and sharing contracts

New manual statements, proposal edits, approval, rejection, correction, forgetting,
dispute and reviewed recreation use explicit commands. Existing-record commands
require `baseRevisionId` and all writes require an idempotency key. Approval and
recreation additionally bind the reviewed content hash and nonempty source vector.
Actors and authoritative provenance are server-resolved; callers cannot set them
through these mutation requests.

Private-chat promotion has an owner-authorized preview request and separate commit
request. The preview states the company audience and independent retention of the
selected shared wording. Commit binds the preview revision/content hash and an
idempotency key. Public result/source DTOs never include the private conversation
identity, title or unselected messages. A company-owned statement snapshot supplies
the promoted entry's provenance; deletion of the original chat does not remove it.

Mutation results distinguish committed, conflicted and failed outcomes. A batch
returns per-item results; a partial failure cannot look like complete approval.
Safe exclusion receipts identify displaced revisions without returning forgotten
statements or private suppression locators. API owns source-passage suppression,
idempotency, correction links, source sharing policy and privacy purge.

The shared authorization keys are `company_memory.view` and `company_memory.manage`.
These are permission identities, not feature enablement flags. The access system
must register/enforce them; exporting a string does not grant access or implement
permission checks. AI generation has its additional existing AI-access requirement.

## Meeting extraction

`src/company/companyMeetings.ts` exports pasted-transcript save requests, immutable
transcript references, source-linked bullet summaries, extraction proposals and
revision-aware summary saves. The transcript and reviewed summary are distinct
content under one meeting note. Source timestamps and resolved people are optional
and cannot be inferred from speaker labels.

Extraction names a saved source revision. Its response contains a draft summary,
proposed memory and explicit coverage; it is neither a save nor an approval receipt.
Every bullet has nonempty transcript-bound passage sources, excluding whole-document
and structured-question locators, and a reported/tentative/agreed/uncertain
qualification. API checks that each passage matches the bound company, note,
transcript and immutable revision. Summary save requires the note's base revision and reviewed transcript
revision. Summary changes, transcript saves and memory approvals have independent
outcomes. Over-limit input, cancellation and partial processing are API concerns
which must preserve the coverage and no-unrequested-write contract.

## Verification and adoption

The declaration and installed-package fixtures reject unreviewed entries, missing
source vectors, unversioned note sources, unguarded writes and private-source leaks.
Existing note and chat shapes remain accepted. Consumers still validate JSON,
ownership, hashes, source freshness and lifecycle at runtime. Publish the package
through its normal release automation before API/UI delivery dependencies adopt
these types; no runtime memory or transcript workflow is provided by this package.
