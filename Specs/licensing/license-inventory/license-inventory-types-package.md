# License inventory and usage contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-10-27
Core feature: [License inventory](../../../../core/specs/licensing/license-inventory/license-inventory.md)
Core solution: [Microsoft 365 inventory](../../../../core/specs/licensing/license-inventory/license-inventory-microsoft-365.md)

## Main account review contracts

Current summary responses may contain root-level `accountReview`, typed as
`Microsoft365AccountReview`, and account rows may contain `mainReviewReason`, typed
as `Microsoft365AccountReviewReason`. Their exported guards and existing strict
summary/account guards accept omission for older artifacts and reject malformed
new values. Ready counts partition returned rows exactly; coverage records
observed/returned/omitted counts and complete/partial state. Unavailable counts
are null. This is independent of full-population monetary reviews and introduces
no new engine artifact. Publish and adopt the new reader validators before API
rollout; the existing 1.1.74 release predates these fields. See the
[API contract](../../../../api/specs/licensing/license-inventory/license-inventory-api.md).

## Additional Microsoft 365 licensing content

The root exports `Microsoft365LicensingContent` and its component types and
`is...` runtime guards. The separate `microsoft-365-licensing-content/v1` portal
artifact carries tenant/run identity, publication time, source license stamps,
per-measure availability, SharePoint storage, OneDrive storage, account lifecycle
and related Azure billing. Existing summary, people and history contracts are
unchanged. Private raw collection evidence is not a public DTO.

Availability describes available, partial or unavailable evidence, independently
for each measure. Null is unknown, not zero or false. Storage used bytes,
calculated purchased capacity and authoritative quota are distinct; authoritative
quota is currently null. Unreviewed products preserve a known capacity subtotal
without establishing a complete entitlement. OneDrive aggregate and detail totals
remain independent with matched, mismatch or not-comparable reconciliation.
Alternative aggregate series and historical daily snapshots are not additive.

Account lifecycle contains directory user IDs, current account state, nullable
disable dates, reasons and minimal Entra audit provenance. A known date requires
a compatible disabled state, successful retained audit evidence and a complete
audit read. Initial disabled creation and absent/expired evidence do not establish
a disable date. The requested window is not a retention guarantee. Directory
collection slice limits are not population limits; lifecycle validates the whole
reconstructed observed directory. It is not an offboarding or license-removal
decision, nor evidence of mailbox type or legal hold.

Related spend retains the scan's subscription set, requested dates and source
coverage. Currencies are separate. Billed and amortized amounts have independent
null/state/reason fields; billing corrections can be negative. Meter quantities
need units. Estimates do not become billing-backed money. Related spend references
charges already present in Azure totals, not additional spend to add again.

Supported related-spend categories are `github-copilot-seats`,
`github-copilot-consumption`, `github-other`, `copilot-studio`, `security-copilot`
and `fabric-ai`. Security Copilot represents its provisioned capacity and overage;
their meter evidence stays separate within that category. The existing amount,
currency, period and availability contracts apply unchanged, including explicit
zero, signed credits and independently unavailable amortized amounts. This adds
no new artifact or fields and does not infer offboarding or license-removal safety.

Guards reject malformed nested fields, enum coercions, extra raw/person properties,
unsafe storage counts, inconsistent scope counts, case-equivalent duplicate
subscriptions/accounts and unsupported complete measurements. Bounds match the
producer's documented storage/detail and billing inputs. They do not authorize a
read: consumers must authorize account detail and every referenced subscription
before exposing the combined artifact. Person rows do not enter aggregate history.

## Verification and adoption

`npm run check:microsoft365-licensing-content-contracts` exercises CommonJS and
ESM guards using a fictional producer-derived fixture and malformed variants.
`npm test` includes that suite and the packed package's CJS/ESM runtime and
TypeScript consumer checks. No customer data belongs in committed fixtures.

The package release workflow builds and tests both module formats before registry
publication. Publish the prepared package before changing production consumer
dependency locks. Producer compatibility can be verified locally against built or
packed exports; local tarballs, source aliases and links are not delivery
dependencies. API/UI consumption and deployment remain separate changes.

Security Copilot extends a closed category union. Older published validators
reject the new value, including when nested in a complete licensing-content
artifact. Release the package through the normal build server and update the API
validator dependency before the engine emits this category. Engine classification
and the API OpenAPI category enum require separate adoption; changing this package
alone does not collect or expose Security Copilot billing. Existing artifacts
without the category remain valid.
