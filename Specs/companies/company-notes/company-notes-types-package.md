# Company note revision contracts

Type: repo
Status: draft
Owner: Platform
Last updated: 2026-10-25
Core feature: [Company Notes](../../../../core/specs/companies/company-notes/company-notes.md)

## Scope

`src/company/companyNoteRevisions.ts` exports immutable note revision summaries,
complete snapshots, history pages, comparison payloads and revision-aware mutation
requests. These contracts realize the core
[revision contract](../../../../core/specs/companies/company-notes/company-notes-revision-contract.md)
without exposing storage keys or physical concurrency tokens.

Revision summaries carry company/note identity, an opaque revision ID, sequence,
content hash, parent/restore references and server-resolved actor/operation metadata.
Snapshot bodies contain the complete original document and an explicit deletion
state. Meeting document snapshots also retain their transcript and reviewed summary
as separate content under one meeting identity. Summary edits preserve the original
transcript source revision.

## Compatibility and mutation behavior

Legacy `CompanyNoteDocument`, `SaveCompanyNoteRequest` and numeric
`expectedRevision` retain their existing shapes. New revision-aware create, update,
delete and restore requests are separate contracts. Existing-note mutations require
an immutable base revision and idempotency key. Numeric and immutable concurrency
tokens cannot be mixed. New create requests use idempotency without a base revision.

Committed and conflict results are explicit. Exact retries return the original
committed revision; API owns conditional persistence and rejects changed requests
under an existing idempotency key. Compare responses contain both immutable
snapshots; structured answers are compared by question ID, never array position.

Declaration fixtures preserve legacy examples and reject missing base revisions
and mixed concurrency schemes. Installed-package consumer checks verify exported
declarations in CommonJS and NodeNext modes. API/UI adoption and revision storage
are separate implementation work; these types do not make existing note writes
concurrency-safe by themselves.
