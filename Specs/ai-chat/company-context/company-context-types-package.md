# Company context contracts

Type: repo
Status: draft
Owner: Platform
Last updated: 2026-10-27
Core feature: [Company context](../../../../core/specs/ai-chat/context/company-context/company-context.md)

## Scope and ownership

The package exports provider-independent company source references, facets,
excerpts, overview, content-search/read and coverage DTOs from the root entry point.
`src/company/companyContext.ts` owns these contracts. API owns runtime validation,
authorization, bounded retrieval, continuity and suppression. UI consumes safe
sources and coverage to inspect the context used for an answer. Types alone do not
validate untrusted JSON or establish access to a source.

## Source and coverage contracts

Every source has a company, kind, opaque source identity, exact version and a
document, question or passage locator. Company Notes, memory and company statement
snapshots require immutable revisions; environment sources require generations.
Other source owners can supply immutable revisions, generations or content hashes.
Passage offsets use UTF-16 code units with an exclusive end, and address the exact
versioned text. Consumers never construct storage paths from these fields or use a
supplied version in place of fresh authorization and source-authority checks.

Public source kinds exclude private conversations. Explicit sharing uses the
separate [company-memory promotion contracts](../company-memory/company-memory-types-package.md).
Only the promoted company-owned snapshot can appear in a shared source reference.
Source links are API-issued safe navigation; consumers validate the company and
allowlisted destination before navigating. They are not arbitrary fetch URLs.

Unavailable/denied/unsupported coverage cannot carry a source, title, text or count.
Complete coverage represents all relevant discovery and source reads; partial and
unavailable coverage require reason codes. Empty results differ from denied,
unread, stale and omitted content. Source eligibility, array/count/byte bounds,
complete-coverage reconciliation and locator ranges are enforced by API readers.

The `CompanyNoteContextCategory` values, including `licenses`, are the starting topics. Areas,
people and teams use company-local identities. Context versions are opaque API
continuity tokens; changing source content, permission or memory eligibility
invalidates affected cached context regardless of the token a caller supplies.

## Chat compatibility

`AIChatCitation.companyContextSource` and `AIChatEvidenceCoverage.companyContext`
are optional additive fields. The latter contains only excerpts used for that
answer and their coverage. Availability is represented separately by the company
overview. Existing `AIChatMemoryMatch`, `AIChatMemorySourceSummary` and
`AIChatRetrievalSourceType` retain their contracts; conversation memory continues
to identify the requesting user's conversation rather than shared company facts.

## Verification and consumers

Declaration fixtures exercise positive and negative source, eligibility, review,
privacy and compatibility examples. The installed-package consumer compiles against
the root export in NodeNext and CommonJS modes, alongside existing packed consumers.
API and UI must adopt the published contract version before producing or consuming
these new fields. Package publication and API/UI implementation are separate actions.

Core acceptance is proved by API/UI integration and browser tests, not by a DTO
compiling. This package introduces no storage, model calls, search engine, graph or
vector database, feature flag, authorization implementation or package dependency.
