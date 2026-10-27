# License inventory and usage contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-10-27
Core feature: [License inventory](../../../../core/specs/licensing/license-inventory/license-inventory.md)
Core solution: [Microsoft 365 inventory](../../../../core/specs/licensing/license-inventory/license-inventory-microsoft-365.md)

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
