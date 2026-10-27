# License pricing, policy and context contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-10-27
Core feature: [License pricing and policy](../../../../core/specs/licensing/license-pricing/license-pricing.md)

## Responsibility and state

Local package source implements dependency-free licensing context DTOs, constants
and guards. The [core specification](../../../../core/specs/licensing/license-pricing/license-pricing-microsoft-365-context.md)
owns product behavior; the [API contract](../../../../api/specs/licensing/license-pricing/license-pricing-api-context.md)
owns persistence and authorization; the [portal specification](../../../../ui/Specs/licensing/license-pricing/license-pricing-ui-context.md)
owns interaction and review presentation. Publication, adoption and API/UI delivery
remain separate.

## Shared boundaries

Root exports from `src/accounts/microsoft365LicenseContext.ts` and
`microsoft365LicenseContextValidation.ts` provide:

| Contract | Fields and purpose |
| --- | --- |
| `Microsoft365ProductContextInput` | Complete replacement: strategy, notes, reviewOn |
| `Microsoft365AccountContextInput` | Complete replacement: notes |
| `Microsoft365ProductContext` / `Microsoft365AccountContext` | Normalized subject GUID plus input and server-owned updatedAt/updatedBy |
| Product/account document | Schema version, company/tenant, subject entries; account envelope also binds accountId |
| Product/account detail response | tenantId and full context or null |
| `Microsoft365ProductContextSummary` | SKU, strategy, review date, hasNotes and shared attribution |
| `Microsoft365ProductContextCollectionResponse` | tenantId and compact product metadata |

Strategy is `encourage | contain | exit`, nullable in product input. Review dates
are nullable YYYY-MM-DD calendar values. Owner, timing, replacement and account
review date are outside the preview contract.

There is no context-summary extension, version-query constant, public revision,
or ready/absent/unavailable projection type. The existing summary and its strict
validator are unchanged; consumers fetch context separately. A successful empty
collection differs from a failed read through normal transport state.

## Validation and ownership

Each concrete boundary has an `isMicrosoft365...` guard. Exact fields, required
nullable values, normalized GUIDs, real calendar dates and UTC update timestamps
are validated. Stored documents reject duplicate/sparse SKU arrays and account
envelope/entry mismatches. Optional expected scope arguments check company/tenant/
account binding. Nonempty attribution is available to all authorized viewers.

Limits are 4,000 note characters, 256 attribution characters, 1,000 product entries,
1 MiB product documents and 64 KiB account documents/requests. Character limits use
UTF-16 units; byte guards count compact UTF-8 JSON including escapes. API also
bounds actual bytes and rejects a proposed over-capacity save with 413.
Compact collection guards allow six metadata bytes per product above the storage
budget so a valid maximum-size document remains readable after note removal.

Inputs permit outer whitespace for server normalization. Stored/read notes preserve
internal paragraphs and require trimmed boundaries. Guards perform structural
checks only. API owns authorization, subject membership, normalization, actual
payload limits and last-write-wins writes with internal product-blob ETag retries.
Schema versions identify stored formats rather than client negotiation.

## Verification and handoff

`npm run check:microsoft365-license-context-contracts` checks CJS/ESM parity,
minimal payloads, attribution, GUID/scope binding, dates, size/count limits,
Unicode/escaped JSON, sparse arrays, compact note exclusion and revision-free
responses. The regular M365 contract command includes it.

`npm run check:packed-exports` compiles the context consumer fixture against a
tarball in NodeNext and CommonJS modes and executes both root entry points.
Negative type assertions reject deferred fields and client revision metadata.
Build, lint and full package tests remain the release gates. Existing pricing and
API-local Keep/add-on contracts are unaffected.

