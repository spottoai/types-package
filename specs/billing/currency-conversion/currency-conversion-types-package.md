# Currency conversion shared contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-11-05
Core feature: [Currency conversion](../../../../core/specs/billing/pricing/currency-conversion/currency-conversion.md)

## Implementation state

Contracts and dependency-free validators are implemented in source. Package
publication, API/platform/UI adoption and runtime feature availability remain
separate. This package does not implement currency conversion itself.

## Responsibilities and boundaries

Export version-one conversion evidence from the package root and the narrow
`@spottoai/types-package/currency-conversion` entry point in CJS and ESM, with
compatible declarations for NodeNext and classic TypeScript resolution.
Existing monetary fields and native-discount helpers retain their semantics.
Source evidence gains optional currency companions where it previously inherited
the enclosing display currency: `DataProtectionBillingMeterEvidence.currencyCode`
and `CommitmentUnusedValueEvidence.sourceCharge.currency`. Conversion readers
populate these from the original authoritative context before converting display
amounts. Source amounts, dates and provenance are preserved. The source-charge
validator accepts legacy omission and validates an uppercase ISO-shaped code when
present. Retail meter evidence already has an optional `currencyCode`; a converted
reader must resolve an omitted code from original estimate pricing evidence,
without borrowing billed-cost currency. Legacy source reads remain compatible.
`LicensingPurchaseScenario.displayUnitPrice` is an optional display companion.
It may use the selected target while the complete original `conversion` record
retains its source and quote currencies, rate, date and source identifier.

The portable platform package owns the ISO minor-unit table, exact arithmetic,
rounding and money/text projection. API owns rate fetching, calendar freshness,
snapshot hashing, access, header serialization and transport errors. UI owns the
personal browser cookie, active-mode state and verified aggregation.

## Contracts

- `CurrencyConversionContextV1`: numeric contractVersion 1, uppercase three-letter
  targetCurrency, real YYYY-MM-DD rateDate, lowercase 64-hex rateSnapshotId and
  the exact ECB rateSource literal. Batch envelopes/headers use this context.
- `CurrencyConversionRateV1`: sourceCurrency and exact positive sourceRate/targetRate
  decimal strings against EUR, plus the rounded source-to-target disclosure rate.
- `CurrencyConversionV1`: context plus converted/unchanged status and source-code
  ordered unique rates. Mixed-source documents retain separate source quotes.
  A money-free document is unchanged with an empty rates array. A document is
  converted if and only if some source currency differs from its target.
- `CurrencyConversionCurrencyV1` and `CurrencyConversionMinorUnitScaleV1`: discovery
  code and supported scale representation 0 through 4. These declare a supported
  precision range, not an ISO code/scale lookup table.
- `CurrencyConversionDiscoveryV1`: reference date, snapshot identity/source and
  sorted unique supported currencies including EUR. No personal target preference
  or company configuration is stored in this response.
- Constants: `CURRENCY_CONVERSION_CONTRACT_VERSION`, `CURRENCY_CONVERSION_HEADER`
  and `CURRENCY_CONVERSION_RATE_SOURCE` define the public wire identifiers.

Canonical decimal strings have no sign, exponent, whitespace, leading integer
zeros or trailing fractional zeros. Exact quotes must be positive. The disclosure
rate has at most 18 fractional digits and may round to zero for a sufficiently
small exact ratio; it must never be used for arithmetic. EUR source quotes are 1,
and an EUR target requires targetRate 1. Every source entry shares the same exact
target quote. Identity entries have equal quotes and disclosure rate 1.

## Validation guarantees

`isCurrencyConversionContextV1`, `isCurrencyConversionRateV1`,
`isCurrencyConversionV1` and `isCurrencyConversionDiscoveryV1` accept unknown JSON
and narrow it without mutation. Required fields must be own fields; unknown
properties, malformed/null/non-object values, impossible dates, invalid decimal
forms, duplicate/unsorted/sparse entries and contradictory statuses are rejected.

These guards check declared wire structure and cross-field consistency. They do
not authenticate the ECB snapshot, recompute its digest, determine freshness,
certify code/scale membership or recompute a nonidentity cross rate. Those checks
remain with API/platform. Accepted metadata alone neither grants access nor proves
that document amounts were converted. Consumers must bind target/snapshot evidence
to their requested view and preserve existing money additivity/coverage rules.

## Implementation

- [Contract and validators](../../../src/common/currencyConversion.ts)
- [Root exports](../../../src/index.ts) and [package entry points](../../../package.json)
- [Wire fixture](../../../fixtures/currency-conversion.json)

## Verification

After building, `npm run check:currency-conversion-contracts` exercises root/narrow
CJS/ESM exports and malformed evidence, identity/empty/multi-source documents,
decimal precision, dates, strict field boundaries and discovery representation.
The script is included in `npm test`.

The co-located [compile contract](../../../src/common/currencyConversion.contracts.spec.ts)
is included in `npm run typecheck:contracts`. `npm run check:packed-exports`
installs the real packed artifact in a temporary consumer and executes conversion
guards through both public entries/module formats, with NodeNext ESM/CJS and
classic-resolution compilation of the
[consumer fixture](../../../tests/fixtures/currency-conversion.consumer.ts.fixture).
