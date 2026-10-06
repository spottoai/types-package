# Azure native discount eligibility contract and calculation

Status: original contracts published; reviewer follow-up contracts implemented locally, publication/adoption pending.
Last updated: 2026-10-06
Owner: Billing
Parent: [implementation plan](../../../core/specs/billing/azure-native-discount-eligibility.md).
Authorization: the user requested continuing development after the initial optional-contract stage. No publication or deployment is included.

## Reviewer follow-up: merged rows and display breakdowns

Authorization: user requested "add the types-package change then" after review
identified lost mixed-row pricing models and missing type/location eligibility.
This stage changes shared contracts/validators only. Engine population, API
projection fixes, recommendation policy and Commitment ledger recalculation are
subsequent work; publication, dependency pins and package version are untouched.

Decision: retain current rows/grouping and add optional eligibility attributes.
Merged `ResourceSpend` rows reuse the existing major-unit cost subset names and
gross membership enum. `ResourcesByType`, `ResourceByLocation` and the native
dashboard stats accept an optional `azureNativeDiscountEligible` map keyed by the
existing spend field names. A map key inherits the exact basis, provenance, period
and currency of the same key on its enclosing object. It is never an additional
charge, a forecast rate or evidence for an unmapped field. Missing is unavailable,
zero is produced evidence, and signed subsets can exceed a signed total. Gross
membership includes cancelling/zero-cost excluded rows and does not reclassify
missing PricingModel as OnDemand. Do not invent a provider PricingModel marker.

1. Files: new data-only eligibility contract/validators, `prices.ts`, `resources.ts`,
   `subscriptions.ts`, `common.ts`, root export. Add optional extensions and bind
   every eligible value to its finite base field. Exact nested maps reject unknown
   keys, nulls and empty evidence. Existing summary validation reuses the same cost
   eligibility guard; legacy omissions remain accepted.
2. Files: existing compile-time financial fixtures and future runtime contract
   vectors. Cover legacy omission, signed/zero/refunds, independent periods/bases,
   malformed supplied evidence and gross membership. Execute compilation and syntax
   checks only; do not execute unit/runtime contract suites per user instruction.
3. Files: this spec and README. Record build/format/lint results. Build CJS/ESM into
   isolated scratch output to preserve concurrent generated-package work. Readers
   adopt the next published package before producers emit these new attributes.

Risks: shape validity cannot establish membership, source proof or money lineage;
producer/consumer code must supply those. A mixed native/publisher display total
must not be constrained by `eligible <= total`, nor assumed wholly eligible from
an enum alone. Legacy stats group arrays retain their existing validation behavior;
supplied extensions are validated without imposing a new whole-row schema.

Acceptance: contracts exported, isolated builds and contract compilation pass,
new optional evidence rejects malformed data in reviewed regression vectors,
existing financial fields unchanged, no producer/API/version/publishing edits.

Verification (2026-10-06): isolated CJS and ESM compilation/declaration builds passed
using `tsc --outDir ../.codex-tmp/eligibility-refinement-types/cjs` and
`tsc -p tsconfig.esm.json --outDir ../.codex-tmp/eligibility-refinement-types/esm`.
`tsc --noEmit -p tsconfig.contracts.json`, scoped source ESLint, Prettier and
`node --check scripts/check-financial-charge-policy-contracts.mjs` passed. API and
Azure engine production type-checks also passed against the isolated declarations;
installed registry packages/manifests were untouched. The added compile fixtures
and future runtime vectors are fictional. Runtime vectors/unit suites were not
executed, per the user's instruction. Shared generated outputs and unrelated
Microsoft 365 edits were preserved. No publication or deployment performed.

Consumer follow-up still required: populate the subsets during existing merging
and group aggregation, consume each amount's own evidence, and recalculate the
Commitments ledger consistently. This contract-only stage does not resolve those
runtime findings or restore overall feature readiness.

## Original implementation

Expose optional unadjusted Azure-native discount-eligible subtotals in existing rolling spend, Cost Tree, report and daily/monthly summary evidence. The shared calculation now accepts those subtotals. Billed and amortized remain independent; rolling totals retain billing-backed/estimated provenance. These are subsets, never additional charges or amounts to add to an all-charge total.

The shared row predicate `isAzureNativeDiscountEligible` requires Azure-native source evidence and excludes trimmed, case-insensitive PricingModel `Reservation` and `SavingsPlan`, including purchases, usage and signed refunds. Marketplace and unknown-publisher charges remain outside eligibility. Missing pricing models retain legacy native eligibility; this does not classify missing evidence as OnDemand or prove historical commitment exclusion. ChargeType is retained as optional provider evidence but does not determine membership. Estimate eligibility follows the existing source-proof rules.

## Design and compatibility

- `AzureFinancialChargeSpendBreakdownV1.azureNativeDiscountEligible?` uses the existing billed/amortized source totals contract, with available/unavailable states and three provenance totals per available basis.
- `DecompositionTreeFinancialChargeSourceBasisCostsV1.azureNativeDiscountEligibleMinorUnits?` and `AzureFinancialChargeSourceTotalsV1.azureNativeDiscountEligibleMinorUnits?` carry the subset for their enclosing basis/coordinate.
- Existing `AzureNativeFinancialSummaryV1` and `ResourceCostType` rows expose optional `azureNativeDiscountEligibleCost` and `azureNativeDiscountEligibleCostAmortized` in the same major units as their existing cost fields. No companion rows or collections are introduced.
- Optional `azureNativeDiscountEligibility` is `all-eligible`, `none-eligible` or `mixed`. It records gross native row membership, including zero-cost rows and offsetting charges/refunds. Native net equality cannot prove full eligibility. Only all-eligible evidence can lend a uniform discount to an unsplit rate or derived value; a supplied subtotal without that classification cannot.
- Period, generation, currency, minor-unit scale and subject inherit the enclosing financial evidence. Producers must reconcile the eligible subset to those exact rows; no borrowing across windows or currencies.
- Absence means no eligibility evidence; zero means a produced zero. Explicitly unavailable eligibility preserves legacy projection for that basis. Eligible amortized evidence cannot revive an unavailable native basis or a null display amount. Billed evidence never substitutes for amortized evidence.
- Use signed safe-integer minor units. Credits/refunds can make eligible spend negative or larger than the signed native net; a `0 <= eligible <= native` test is invalid.
- Financial source classification and its policy/version stay unchanged: commitments remain Azure-native. This field's documented eligibility rule is distinct from financial-source/savings policy.
- Extend exact validators to recognize and validate optional fields, preserving every existing required field and partition check. Update readers to this package before producers emit new fields: older exact validators do not recognize the extension.
- Shared arithmetic now accepts the optional eligible subset. Exact validators reject malformed supplied extensions rather than broadening the discount. Shape validation cannot establish row membership or authorize a scope.

## Shared arithmetic

`projectNativeDiscountSourceMinorUnits` accepts optional `nativeDiscountEligibleMinorUnits`. Tree and rolling projection helpers pass their corresponding available subset to it:

`display = native - eligible + roundHalfAwayFromZero(eligible × (10000 - bps) / 10000) + Marketplace + unknown`

The calculation uses signed BigInt intermediates and returns only safe-integer results. Omitted eligibility falls back to the existing native amount. Supplied malformed evidence fails projection rather than widening the discount. `isAzureNativeSpendFullyDiscountEligible` supplies the separate gross-membership gate for uniform-rate consumers; entirely legacy payloads retain their prior behavior.

## Consumer handoff and verification

The engine populates evidence during existing artifact generation; the API and engine evaluation paths consume the shared calculation. Readers using exact validators must adopt the package containing all these fields and exports before producers emit them. Development compilation against local built declarations does not establish that the installed registry package contains this implementation. Preserve reviewed registry pins until the new release is available. Missing legacy pricing models leave historical exclusions incomplete by the agreed fallback.

Verify CommonJS/ESM builds and declaration/contract compilation, scoped formatting/lint and affected consumer compilation. Add regression examples for legacy omission, signed and zero subsets, independent bases/provenance, unavailable evidence, malformed extension data and cancelling/zero-cost excluded rows. Per user instruction, unit and runtime contract suites are not executed during this development task. Record fresh command results in delivery evidence; earlier contract-only build results do not prove the latest calculation changes. Publication, registry adoption, deployment and post-deployment live validation remain outstanding.
