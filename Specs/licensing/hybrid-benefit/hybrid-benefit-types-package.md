# Hybrid benefit evidence contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-11-23
Core feature: [Hybrid benefit](../../../../core/specs/licensing/hybrid-benefit/hybrid-benefit.md)

## Responsibility and state

This package defines optional Windows licence-charge explanations and running
context for Azure engine, API, portal and reporting consumers. Package `1.1.106`
publishes the charge-calculation contract; the running-profile addition is
source-only and requires a subsequent release. Consumer source adoption is described in the owning engine,
API and UI specifications; package declarations do not establish their runtime
validation, deployment or regenerated production artifacts.
The [Azure design](../../../../core/specs/licensing/hybrid-benefit/hybrid-benefit-azure.md)
owns the exposure policy and the
[engine reference](../../../../cloud-engine/Specs/licensing/hybrid-benefit/hybrid-benefit-azure-windows-license-meter-evidence.md)
owns billing classification and pricing.

## Contracts and semantics

The root exports `LicensingBilledVmHours`,
`LicensingWindowsLicenseChargeComponent` and
`LicensingWindowsLicenseChargeCalculation` through `src/azure/licensing.ts`.
`LicensingAzureLicenseCharge.calculation` is optional so existing resource and
recommendation artifacts remain valid without alteration. Version `1.0` applies
to this explanation and does not change `LicensingPlanningView.version`.

| Evidence                        | Meaning                                                                                                                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observationWindow`             | Inclusive UTC calendar-day labels (date-only or ISO UTC midnight) and required `stableDays = UTC date(end) - UTC date(start) + 1`, the positive denominator including off-days. These are day labels, not an elapsed timestamp interval. The window need not be the most recent 30 days. |
| `billedVmHours`                 | Available finite nonnegative licence-bearing VM-hours, or unavailable with a typed reason and no numeric value. VMSS counts aggregate instance-hours. These are billing quantities, not exact uptime or an inferred schedule.                                                            |
| `components`                    | Nonempty, disjoint exposure components in the same observation window and parent charge currency. Components with different retail rates remain distinct.                                                                                                                                |
| `provenance`                    | Explicit `billed`, `retail-estimate` or `mixed` provenance for the complete window total. Only `billed` permits parent basis `observed-billing`; any retail portion requires `azure-retail` and `indicative: true`.                                                                      |
| `separate-license-charges`      | Billed, not amortized, licence cost; its hours may be unknown while the billed amount remains available. Signed adjustments and measured zero are values.                                                                                                                                |
| `license-included-compute`      | Measured billed hours multiplied by the qualified Windows-minus-base retail hourly licence rate; this licence component is estimated, not separately billed.                                                                                                                             |
| `compute-hours-retail-fallback` | Measured compute hours multiplied by an exactly qualified separate licence-meter retail rate when licence quantities cannot support the ordinary calculation. This is estimated, not a billed-charge substitute.                                                                         |
| `windowLicenseCharge`           | Engine-produced window total of directly billed and retail-estimated components. Any estimated component makes the total an estimate, never a wholly billed licence amount.                                                                                                              |
| `normalizationDays`             | Literal `30`: the existing parent monthly amount is the window exposure divided by `stableDays` and multiplied by 30; annualized remains the monthly amount multiplied by 12.                                                                                                            |
| `projectionAssumption`          | Literal `observed-usage-repeats`: the projection assumes the observed runtime pattern repeats, including off-days. It is not a forecast.                                                                                                                                                 |
| `nonAdditive`                   | Literal `true`: these explanation values overlap the current charge and are never additional portfolio savings.                                                                                                                                                                          |

Every component retains nonempty evidence source IDs. Meter IDs are optional
because identifiable billing may lack an opaque meter ID. Retail rates are money
per VM-hour in the parent charge currency; their source IDs include retail and
FX evidence when conversion is applied. Currency is never defaulted. Each
component's hours cover distinct usage; if any contributing component has
unknown hours, the aggregate hours are unavailable rather than a partial total.
Single-VM measurable hours must fit the window's calendar capacity; aggregate
VMSS instance-hours cannot use a single-VM ceiling.

The producer retains rate, component and window calculation precision, then
rounds the parent monthly amount after normalization. The money type itself
does not impose a two-decimal limit on these source amounts or the hourly rate.
API/UI format the numbers for display and use the published totals rather than
recomputing from rounded display amounts. A parent observation window, if present,
must match the calculation dates and any declared day count; the calculation
window is authoritative for its explanation. Producers omit the explanation
rather than publish a partial breakdown when a contributing portion cannot be
priced. The consumer labels the window sum, normalized projection, billed
provenance and estimated provenance separately.

Licence acquisition investment, packs, commitment, monthly equivalent and
payback remain in `purchaseScenario`. Off-hours reduce projected avoided Azure
charges, not the full committed licence purchase cost. There is no entitlement
assertion, new power-state inference, daily runtime series or acquisition price
duplicated in the charge-calculation block.

## Existing utilization-profile context

`LicensingResourceItem.utilizationProfile` optionally references the existing
`UtilizationProfile` DTO, exactly as resource details and At a Glance story rows
do. There is no licensing-specific profile type, wrapper, schema or validator.
The existing `isUtilizationProfile`, `isRunningProfile` and `isEvidenceWindow`
guards remain the shared validation owners.

The canonical profile already carries its running evidence, collection window,
telemetry quality, confidence, owner resource, capacity and optional weekly
pattern/timezone. Producers attach existing scoped evidence; they do not rebuild
it from licence billing quantities. The profile's dates can differ from the
charge-calculation stable billing window. Unknown, zero and intermittent shares
retain their existing meanings, and aggregate scale-set observations cannot
establish individual instance states or billed instance-hours.

Hybrid Benefit presentation uses `utilizationProfile.running` and the existing
running grid, with CPU colouring disabled. The shared DTO still contains its
ordinary metrics and weekly usage values; choosing a running-only display is a
UI concern, not a reason to introduce a second wire model. Missing profile or
running evidence remains unavailable rather than being presented as off.

Consumer adoption reuses existing bounded profile validation, ownership/linkage
checks and authorized projections, including financial redaction for any shared
coverage-cost fields. Profile values do not reprice licence exposure, replace
billed VM-hours, reduce a committed purchase cost or establish entitlement.

The optional licensing attachment is source-only and requires a subsequent
package release and engine/API/UI adoption. The profile DTO itself already
exists; this addition does not implement new data retrieval or inference.

## Validation, compatibility and adoption

TypeScript discriminated unions reject unknown hours with a numeric placeholder,
retail components without measured hours, billed/estimated provenance mixing,
missing stable-day denominators, empty components/source IDs and additive
classification. Existing `LicensingAzureLicenseCharge` values need not include
the new property. No runtime validator or financial calculator is introduced.
Producers and read-time validation still verify dates, finite quantities,
currency alignment, source binding, physical capacity and monetary consistency;
TypeScript declarations cannot validate untrusted JSON or arithmetic.

Engine consumption/emission and API/UI/report validation and presentation use the
published contract independently of release deployment. Use published
package versions rather than source imports or local declaration augmentation.
The engine owns calculations; consumers show hours, billed and estimated cost,
window length and the projection assumption without parsing explanatory notes.
Absence of this optional block supplies no calculation evidence and must not
be presented as zero hours, zero charges or full-time runtime.

## Verification

`npm run build` builds CommonJS/ESM and typechecks the existing licensing
fixtures plus `src/azure/licensingChargeCalculation.contracts.spec.ts` and
`src/azure/licensingRunningProfile.contracts.spec.ts`.
The charge-calculation fixture covers mixed and intermittent usage, unknown hours, zero, qualified
retail fallback and backward compatibility with negative assertions for invalid
states. `npm run check:packed-exports` compiles the same fixtures against packed
root declarations in NodeNext and CommonJS modes, rather than source imports.
The profile-attachment fixture assigns existing At a Glance and resource-detail
profile fields directly into the licensing item, verifies assignment back to the
canonical DTO and existing guard, and preserves older items without a profile.
It rejects a reduced wrapper and the superseded licensing-specific field.
