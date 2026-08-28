# Marketplace Charge Inclusion — Types Package

Status: Approved for linear implementation
Approved: Yes
Approved by: User conversation instruction "好的，开始调整吧", 2026-08-27
Last updated: 2026-08-27
Owner: Platform
Parent: `core/specs/cost-savings/unified-financial-baseline/marketplace-charge-inclusion.md`

Types owns dependency-free contracts, exact canonicalization, allowlisted policy definitions, validators, and the portable selection Kernel. It does not own provider acquisition, storage, UI state, or network I/O.

Required contracts are `FinancialChargeSourceV1`, `FinancialChargeRecurrenceV1`, `FinancialChargeCompositionV1`, and registered all-charge/excluding-Marketplace policies. Every dataflow coordinate carries an exact policy ref. Charge composition partitions each available owner/residual baseline component exactly once and reconciles its signed bucket sum to the baseline total.

The shared Kernel accepts owner/residual baselines plus matching charge compositions. It rejects aggregate-only filtering, mixed policies, missing/multiple compositions, component drift, currency/basis/lens/period mismatch, and non-reconciliation. Unknown source is included by all-charge and withheld with a partial result by excluding-Marketplace. Analytics points distinguish total observed, forecast-eligible, one-time, and unknown recurrence.

The shared display Kernel binds an immutable daily analytics input to one exact current-spend composition and projects last 7 days, rolling 30 days, rolling 90 days, and trailing 12 calendar months. It owns exact-decimal totals, known-day averages, UTC calendar boundaries, partial current-month handling, missing-history reason codes, and available/partial/unavailable state. Consumers may convert the exact result for chart rendering but may not recalculate the money.

Acceptance is the parent golden corpus, focused contract tests, negative mutations, packed exports, and browser/Node byte parity.
