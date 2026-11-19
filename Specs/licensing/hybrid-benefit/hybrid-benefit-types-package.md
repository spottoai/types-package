# Hybrid benefit calculation evidence contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-11-18
Core feature: [Hybrid benefit](../../../../core/specs/licensing/hybrid-benefit/hybrid-benefit.md)

## Responsibility and state

This package defines the additive Windows licence-charge explanation consumed by
Azure engine, API, portal and reporting code. The source contract is implemented;
registry publication, engine emission and consumer presentation require separate
adoption. Package declarations do not establish runtime validation or deployment.
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

| Evidence | Meaning |
| --- | --- |
| `observationWindow` | Inclusive UTC calendar-day labels (date-only or ISO UTC midnight) and required `stableDays = UTC date(end) - UTC date(start) + 1`, the positive denominator including off-days. These are day labels, not an elapsed timestamp interval. The window need not be the most recent 30 days. |
| `billedVmHours` | Available finite nonnegative licence-bearing VM-hours, or unavailable with a typed reason and no numeric value. VMSS counts aggregate instance-hours. These are billing quantities, not exact uptime or an inferred schedule. |
| `components` | Nonempty, disjoint exposure components in the same observation window and parent charge currency. Components with different retail rates remain distinct. |
| `provenance` | Explicit `billed`, `retail-estimate` or `mixed` provenance for the complete window total. Only `billed` permits parent basis `observed-billing`; any retail portion requires `azure-retail` and `indicative: true`. |
| `separate-license-charges` | Billed, not amortized, licence cost; its hours may be unknown while the billed amount remains available. Signed adjustments and measured zero are values. |
| `license-included-compute` | Measured billed hours multiplied by the qualified Windows-minus-base retail hourly licence rate; this licence component is estimated, not separately billed. |
| `compute-hours-retail-fallback` | Measured compute hours multiplied by an exactly qualified separate licence-meter retail rate when licence quantities cannot support the ordinary calculation. This is estimated, not a billed-charge substitute. |
| `windowLicenseCharge` | Engine-produced window total of directly billed and retail-estimated components. Any estimated component makes the total an estimate, never a wholly billed licence amount. |
| `normalizationDays` | Literal `30`: the existing parent monthly amount is the window exposure divided by `stableDays` and multiplied by 30; annualized remains the monthly amount multiplied by 12. |
| `projectionAssumption` | Literal `observed-usage-repeats`: the projection assumes the observed runtime pattern repeats, including off-days. It is not a forecast. |
| `nonAdditive` | Literal `true`: these explanation values overlap the current charge and are never additional portfolio savings. |

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
duplicated in this contract.

## Validation, compatibility and adoption

TypeScript discriminated unions reject unknown hours with a numeric placeholder,
retail components without measured hours, billed/estimated provenance mixing,
missing stable-day denominators, empty components/source IDs and additive
classification. Existing `LicensingAzureLicenseCharge` values need not include
the new property. No runtime validator or financial calculator is introduced.
Producers and read-time validation still verify dates, finite quantities,
currency alignment, source binding, physical capacity and monetary consistency;
TypeScript declarations cannot validate untrusted JSON or arithmetic.

Delivery order is registry package publication, engine consumption/emission,
then API/UI/report validation and presentation as appropriate. Use published
package versions rather than source imports or local declaration augmentation.
The engine owns calculations; consumers show hours, billed and estimated cost,
window length and the projection assumption without parsing explanatory notes.
Absence of this optional block supplies no calculation evidence and must not
be presented as zero hours, zero charges or full-time runtime.

## Verification

`npm run build` builds CommonJS/ESM and typechecks the existing licensing
fixtures plus `src/azure/licensingChargeCalculation.contracts.spec.ts`.
The latter covers mixed and intermittent usage, unknown hours, zero, qualified
retail fallback and backward compatibility with negative assertions for invalid
states. `npm run check:packed-exports` compiles the same fixtures against packed
root declarations in NodeNext and CommonJS modes, rather than source imports.
