# License inventory and usage contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-11-12
Core feature: [License inventory](../../../../core/specs/licensing/license-inventory/license-inventory.md)
Core solution: [Microsoft 365 inventory](../../../../core/specs/licensing/license-inventory/license-inventory-microsoft-365.md)

The additive activity history contracts below
define four independent daily streams without changing existing monthly history.

## Commercial evidence summary privacy

Optional aggregate `commercialReview` and renewal `sourceSubscriptionId`, `createdDateTime` and `observedAt` cross the strict summary boundary. Each commercial object has an exact key allowlist, including nested reference valuations, reassignment, immediate removal, future avoidance and renewal reduction. Existing semantic validators also constrain dates, primitive enums, counts, currencies and null-only unverified financial fields. Presence never verifies commercial rights or permits person/assignment metadata. Older artifacts may omit the new fields; publish and adopt the compatible summary guard before producer rollout.

## Main account review contracts

Current summary responses may contain root-level `accountReview`, typed as
`Microsoft365AccountReview`, and account rows may contain `mainReviewReason`, typed
as `Microsoft365AccountReviewReason`. Their exported guards and existing strict
summary/account guards accept omission for older artifacts and reject malformed
new values. Ready counts partition returned rows exactly; coverage records
observed/returned/omitted counts and complete/partial state. Unavailable counts
are null. This is independent of full-population monetary reviews and introduces
no new engine artifact. The published 1.1.75 baseline includes these review fields.
Adopt compatible reader validators before API rollout. See the
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

Supported related-spend categories are exported in
`MICROSOFT_365_RELATED_SPEND_CATEGORIES`: `github-copilot-seats`,
`github-copilot-consumption`, `github-other`, `copilot-studio`, `security-copilot`,
`fabric-ai`, `sharepoint-storage-payg`, `sharepoint-archive`, `onedrive-archive`,
`dataverse-database`, `dataverse-file` and `dataverse-log`.
Security Copilot represents its provisioned capacity and overage;
their meter evidence stays separate within that category. The existing amount,
currency, period and availability contracts apply unchanged, including explicit
zero, signed credits and independently unavailable amortized amounts. This adds
no new billing artifact and does not infer offboarding or license-removal safety.

## Storage rates and capacity comparisons

The optional `Microsoft365LicensingContent.storageCosts` property contains a
`Microsoft365StorageCostView`; omission preserves old artifacts and means not
collected, never zero. A supplied null or invalid view is rejected. Its
`generatedAt` must equal the content publication. Root exports include
`Microsoft365StorageProduct`, `Microsoft365StorageRate`,
`Microsoft365StorageCostEstimate`, `Microsoft365StorageCostView`,
`MICROSOFT_365_STORAGE_PRODUCTS` and the three corresponding `is...` guards.

The view carries available/partial/unavailable coverage and at most 32 distinct
ISO-currency groups. Each group contains at most 128 uniquely identified rates
and 512 uniquely identified estimates. No cross-currency rate references, FX
defaults, person identities, arbitrary nested properties or blended totals are
permitted. Unavailable views have no currency groups; partial views retain usable
evidence with explicit reasons. A fully available view cannot hide unavailable
rates or estimates. Component guards check shapes; the view guard additionally
checks rate references, unit/basis compatibility and estimate arithmetic.

Rates identify the storage product, `gb_month` or `gb_day`, nullable proven
`bytesPerGb`, nonnegative nullable amount, term, tax treatment and source. Source
includes a checked date, public HTTPS URL where applicable and one of
`microsoft_public`, `reseller`, `azure_retail` or `customer_agreement`. A private
agreement URL can be null. Preserve inclusive, exclusive or unspecified tax;
unknown tax never silently becomes tax-exclusive. Purchased SharePoint Extra File
Storage uses 1 GB = 1,073,741,824 bytes and a monthly rate. Daily rates use
pay-as-you-go terms. Other byte conventions remain nullable when unproven.

An optional source quote preserves amount, year/month/day period and normalization
divisor. Annual-to-monthly normalization divides by 12; same-period normalization
divides by one. The guard rejects implicit day/month conversions and conflicting
quotes. A known zero rate requires evidence; an unavailable rate has null amount.
Missing regional rates remain unknown and never inherit another currency.

Estimates identify purpose: `purchased_capacity`, `usage_capacity` or
`unassigned_license_capacity_replacement`. Replacement comparisons identify the
license SKU, not a person. Each references a rate in the same currency/product,
quantity in that rate's GB convention, period and independent availability.
Monthly rates have `{kind: 'month'}` and null chargeable days. Daily rates use
`{kind: 'window', startDate, endDate}` plus known chargeable days no greater than
the inclusive window length. Missing quantity, rate or chargeable days withholds
the amount. Known amounts are unrounded quantity times rate, additionally times
chargeable days for daily rates; consumers round for display.

Public/reference rates produce `reference_price_estimate`; customer agreements
produce `agreed_price_estimate`. Neither is proof of billed or amortized spend,
invoice price, complete tenant quota, or savings. Different comparisons and tax
bases are not additive. Producers must keep unknown entitlement and quota visible
and must not derive chargeable overage or removal safety from a known capacity
subtotal. Billing-backed charges remain in `relatedSpend`, retaining existing
window, currency, subscription coverage, signed corrections and independent
billed/amortized values. Reference rates must not fill missing billing amounts.

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
The storage-cost suite additionally checks backward compatibility, rate/estimate
identity, monthly/daily units, quote normalization, tax, unknown/zero values,
privacy, bounds and all twelve simultaneous billing categories. The normal
license-contract command runs both content and storage suites.

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

The storage change is implemented in package source only. Release through the
normal build server, install the compatible registry version in API/UI readers
and update exhaustive category mappings and OpenAPI enums before cloud-engine
emits these fields/categories. Engine projection, API authorization/projection
and frontend presentation remain downstream implementation work. Existing strict
older readers reject the new field/category even though new readers accept old
artifacts. No manual version bump or publication is part of this change.


## Activity history

`src/accounts/microsoft365ActivityHistory.ts` exports guarded, dependency-free
daily envelopes for sign-in aggregates, workload reports, person observations
and license quantities. Existing license artifacts and monthly history retain
their contracts. Both CommonJS and ESM exports are tested against built output.

Sign-in rows contain immutable account/application IDs, count and UTC first/last
times only. Coverage records exclusive window end, source/observation times,
failure state, rejected-event count and provisional status. Empty complete
windows and unavailable windows retain distinct states. Exact field allowlists
reject raw events, IP addresses, profile fields and other security payloads.

Workload rows distinguish native dated daily counts from rolling D30/D28
snapshots and preserve report refresh date, period and source coverage. These
rows must not be summed across overlapping rolling windows. Person rows retain
observed workload/Office dates, platform evidence and optional Copilot D28
adoption. Person streams stay behind the existing person-detail boundary and
are excluded from anonymous monthly history and AI summary inputs. Repeated
last-activity observations do not establish intervening active dates.

License quantities retain independent retail reference-price context, explicit
currency, monthly annual-commitment basis and excluded tax. Engine comparison
is limited to consecutive compatible complete observations. Commercial totals
remain unknown when subscription coverage, trial classification or enabled
status is uncertain. Deterministic source/target snapshot IDs identify derived
changes; `confirmedSaving` is required and always null. Assignment removals,
enabled capacity and purchased quantities have separate change kinds.

Engine storage uses bounded immutable revisions before conditional day/month
manifests. Personal streams use raw tenant storage; anonymous workload and
quantity streams use Portal storage. Shared contracts do not implement I/O,
retention policy, Graph collection or financial confirmation. Initial durable
history is retained until tenant deletion. Publishing/adoption remain separate
from source verification.

Verification: `node --test scripts/check-microsoft365-activity-history-contracts.mjs`
checks public guards, invalid dates/counts, privacy exclusions, empty windows
and the unavailable realised-saving amount in both module formats.

## Application directory

The root exports `MICROSOFT365_APPLICATIONS_SCHEMA_VERSION` with literal value
`microsoft-365-applications/v1`, `Microsoft365ApplicationDirectory`,
`Microsoft365ApplicationEntry`, `Microsoft365ApplicationWindow`, and
`isMicrosoft365ApplicationDirectory` from `src/accounts/microsoft365Applications.ts`.
This separate tenant artifact adds no fields to existing activity-history envelopes.
The dependency-free guard reuses the strict activity-history UTC date helper.

The engine owns collection, joining service principals to retained sign-ins,
first-party classification, name precedence, sorting and all distinct-account
calculations. API and UI readers validate the shared artifact. Package source
alone does not implement the engine builder, API route or UI adoption. The
directory contains application identity and metadata, inclusive coverage dates,
gap dates and aggregate counts; exact object allowlists exclude personal fields
at every level. Names and their source are both null when unknown; otherwise the
source is `servicePrincipal` or `signIn`. `publisher` and `ssoMode` are nullable
text; SSO modes remain an open provider vocabulary. Tenant, run, application and
metadata strings are nonblank and bounded to 512 characters. IDs follow the
existing activity-history text contract, without imposing GUID syntax.

Every count is a nonnegative safe integer. Coverage `from` and `through` are
inclusive, ordered real UTC dates. `unobservedDates` must be unique and inside
that range; observed days plus gap count equals the inclusive date span. Each
window ends at `coverage.through`, starts 29 or 89 days earlier, and is clamped
to `coverage.from`. Its observed count must equal the number of dates remaining
after excluding the applicable gaps. Positive active-account counts require
observed dates, and the 90-day count cannot be smaller than the 30-day count.
First/last seen dates are ordered and inside coverage. Activity dates before a
window cannot establish active accounts inside it: an app last
seen before a window starts must have zero active accounts in that window.
Retained monthly active dates may extend coverage beyond the daily 93-day retention; the guard bounds
the gap array by its date span without adding a retention policy limit.

Application IDs are unique after trimming and case folding. There are at most
5000 entries. Optional `omittedCount` is a nonnegative safe integer; the engine
owns top-5000 selection and ordering by 30-day active accounts descending, then
name. The guard does not impose a locale-dependent name sort. The required
`tenantSyncRunId` binds the projection to its producing scan. `generatedAt` is a
real UTC timestamp with optional one-to-three-digit fractional seconds.

`tests/fixtures/microsoft365-applications.json` is fictional Contoso data with
real SaaS names, an unknown name and an app outside the 30-day window. Its
August 4–November 3 coverage spans 92 dates; a September 12 gap gives 91 total
observed days, 30 observed days in the final 30-day window and 89 in the final
90-day window. This fixture is a contract example rather than engine demo output.

`npm run check:microsoft365-application-contracts` tests both built module
formats, invalid/missing/additional fields, date/window consistency, nulls,
privacy, identity collisions, sparse arrays, bounds and retained monthly history.
`npm run check:packed-exports` verifies installed-tarball CJS/ESM runtime imports
and TypeScript consumers using NodeNext (ESM and CJS) and legacy Node resolution.
Both commands run in `npm test`. Source changes remain unpublished until the
normal GitHub Actions release; consumer adoption is separate.

## Optional stock and commercial evidence

A license row may carry `Microsoft365SeatCommercialReview`: candidate stock, recent-stock owner review, reference list-price values by currency, and independent reassignment/avoidance/renewal facts. Current unverified removable quantities, cash reductions and effective dates are null. The guard accepts omission for existing artifacts and rejects unsupported commercial claims. Renewal rows may retain `sourceSubscriptionId`, `createdDateTime` and `sourceObservedAt` independently of `nextLifecycleDateTime`. These optional fields confer no commercial rights or provider execution permission.
