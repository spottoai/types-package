# Environment memory contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-10-28
Core feature: [Environment memory](../../../../core/specs/ai-chat/context/environment-memory/environment-memory.md)

## Scope

The `/environment` subpath defines bounded Azure subscription/tenant projections,
source bindings, immutable document descriptors, completion pointers and logical
evidence identities. Contracts validate source identity and content shape;
applications enforce company ownership, current source authority and feature
permissions.

## Optional licensing documents

The required subscription eight-file and tenant five-file document sets, core
tree digests and `fileCount` values remain unchanged. Completion pointers can
include `optionalDocuments`, a bounded list of generic capability documents.
Each declares a stable public document ID, safe single filename, title, exact
scope, owning capability, conjunctive feature requirements and content integrity.
Document and capability names are data rather than per-feature shared enums.
The capability ID identifies its owning registered Portal feature, which must
appear in the requirements. The API remains the authorization authority.

Evidence descriptors either name an immutable, integrity-bound typed-facts JSON
file or select an explicitly registered runtime projector. Generic facts carry
capability/document/evidence identities, scope/source binding, observation time,
coverage and bounded sections of text, boolean, qualified quantity, money or
unknown values. Money retains basis, period, provenance, currency, meaning,
valuation and additivity; immutable admission rejects current-company valuation.
Unknown permission keys and runtime projectors do not create capabilities.

Limits remain explicit: 16 documents, four evidence entries per document, 16 KiB
completion pointer, 8 KiB Markdown, 32 KiB immutable evidence, ten fact sections
and 50 facts. IDs and filenames cannot supply paths or shadow core documents.

The pointer's exact view-set or tenant-sync source binding also binds its optional
documents. Consumers validate each requested file's byte count and SHA-256
independently and compare descriptor identity during continuity checks. Missing or
corrupt optional bytes do not disable a valid core bundle. Legacy pointers without
the optional field remain valid. Strict older readers require deployment of the
new contract before producers emit optional metadata.

One logical artifact kind, `environment-capability-evidence`, identifies scope,
capability, document and evidence without a new kind per feature. A logical
identity does not authorize a read. API consumers authorize the owner and every
additional requirement; runtime registrations impose their own permission floor.
Current company pricing/policy stays behind secured runtime services, and M365
access alone never authorizes related Azure subscription spend.

Generic grounding matches require `sourceKey`, a lowercase SHA-256 identity of the
authorized scope, generation, document and evidence descriptor. It is public,
non-callable metadata that distinguishes sources sharing a Portal route without
exposing raw storage paths, tenant identifiers or execution handles. Legacy core
matches may omit the field and keep their existing grouping behavior.

## Verification

The environment contract checks exercise both module builds, unchanged legacy
pointer/digest behavior, future capability names, descriptor bounds/duplicates,
typed-facts financial semantics, cross-scope/source rejection, logical-reference
round trips and AI grounding matches. Ordinary future capabilities use the same
contract and do not require another shared enum release. Packed exports remain
the consumer compatibility boundary.
