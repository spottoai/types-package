# DEV-1138 Unified Financial Baseline B0 - Types Package

## Metadata

Status: historical contract record; V1 public surface removed
Last updated: 2026-08-24
Owner: Platform
Approved: Yes
Approved by: User
Approval source: Conversation approval to begin, 2026-08-21
Iterations: 2
Parent spec: ../../../../core/specs/cost-savings/unified-financial-baseline/unified-financial-baseline.md

> Historical record: `FinancialBaselineEnvelopeV1`, its validators, its contract test, and the `azure/financial-baseline` package subpath were removed on 2026-08-24. Current financial contracts are exported through `azure/financial-scope` and the package root. The details below preserve the retired probe design only.

## Summary

Add the portable, versioned FinancialBaselineEnvelopeV1 contract used by the offline B0 builder and audit harness. The contract represents one available or typed-unavailable resource baseline and makes comparability dimensions explicit: source generation, period, cost basis, estimate lens, provenance, currency, component coverage, resource owner, and allocation owner.

Types Package owns DTOs, closed code unions, canonical preimage helpers, a portable SHA-256 used to verify baseline identity, constants, exact reconciliation checks, and dependency-free structural validation. Producers still own ID creation. Types Package owns no file I/O, billing aggregation, runtime mode, storage artifact, or customer projection.

## Scope

### In scope

- ExactMoneyV1 with canonical decimal string and ISO currency evidence.
- FinancialBaselinePeriodV1.
- BaselineSourceGenerationV1.
- BaselineCoverageV1.
- BaselineComponentV1.
- AvailableFinancialBaselineV1.
- UnavailableFinancialBaselineV1.
- FinancialBaselineEnvelopeV1 discriminated union.
- FinancialBaselineUnavailableReasonV1 closed union.
- Component/resource/generation reconciliation result shapes.
- Versioned canonical identity preimage helpers.
- Strict dependency-free validators.
- Root and Azure barrel exports.
- Contract fixture and mutation tests.

### Out of scope

- Local audit-report presentation models unless Cloud Engine cannot keep them repo-local.
- OptimizationIntent, ScenarioProjection, savings, lifecycle allocation, or recommendation attribution.
- Portal/Plugin/API DTO changes.
- Runtime workflow or configuration.
- Blob paths, manifests, pointers, retention, publication state, or production telemetry.
- Node crypto and baseline hashing.
- Billing-row aggregation or exact-decimal arithmetic.
- Currency conversion or currency defaults.

## Contract Invariants

1. Available and unavailable are mutually exclusive.
2. Available envelopes require a valid currency, period, source generation, non-empty components, exact total, and successful reconciliation.
3. Unavailable envelopes forbid total and components and require one allowlisted reason.
4. Zero is a valid canonical decimal; absence is represented by unavailable.
5. Every amount states basis, estimate lens, provenance, period, and currency.
6. Every component has one stable billableComponentKey and one allocationOwnerResourceId.
7. Envelope resource identity and allocation owner identity are normalized Azure resource IDs.
8. Currency conflict is unavailable; the contract never supplies a default.
9. Canonical preimages include every comparability dimension and exclude labels, row order, and local report formatting.
10. Validators reject undeclared fields in version 1 so semantics cannot drift silently.
11. The contract carries source-generation identity but no current/latest authority or publication state.
12. The contract is additive and source compatible with existing Types Package exports.

## Proposed Shape

FinancialBaselineEnvelopeV1 is a discriminated union keyed by status:

- available:
  - schemaVersion and contractVersion;
  - baselineId;
  - provider and normalized resourceId;
  - sourceGeneration;
  - period;
  - costBasis;
  - estimateLens;
  - provenance;
  - currencyEvidence;
  - coverage;
  - components;
  - total;
  - reconciliation.
- unavailable:
  - the same identity and requested dimension fields where known;
  - unavailableReason;
  - evidenceSummary containing counts and non-monetary classification only;
  - no total and no components.

BaselineComponentV1 contains:

- componentId;
- billableComponentKey;
- allocationOwnerResourceId;
- service, meter, part number, tier, unit, and pricing dimensions when present;
- source-generation and coverage identity;
- cost basis, estimate lens, provenance, and currency;
- exact canonical decimal amount.

FinancialBaselineUnavailableReasonV1 includes closed reasons for:

- billing unavailable;
- resource not produced;
- period unresolved;
- basis unavailable;
- estimate-lens unavailable;
- currency unresolved or conflicting;
- component identity unavailable;
- ownership conflict;
- source coverage overlap;
- mixed generation;
- reconciliation failure.

Reason names must follow existing Types Package conventions and remain distinct from UI copy.

## Canonical Identity

The baseline canonical preimage includes:

- contract version;
- normalized resource ID;
- source generation ID and billing fingerprint;
- inclusive/exclusive period boundaries;
- cost basis;
- estimate lens;
- provenance;
- resolved currency;
- sorted component identity and coverage summaries;
- allocation owner identity.

The helper returns canonical UTF-8 text only. Cloud Engine computes SHA-256 and prefixes it using the existing digest convention.

Component canonicalization sorts by stable component identity and never by input order or presentation label.

## Files and Modules

Expected implementation locations:

- src/azure/financialBaseline.ts
- src/azure/index.ts
- src/index.ts
- src/azure/financialBaseline.test.ts or the nearest established test location
- package scripts only if an existing contract-check pattern requires one

Reuse CostBasis, EstimateLens, CostComposition vocabulary, digest patterns, and Azure resource-ID normalization contracts rather than redefining them.

## Tasks

### Task 1: Define the value and identity contracts

- Add exact-money, generation, period, coverage, component, and envelope DTOs.
- Reuse existing basis/lens/provenance/currency vocabulary.
- Add JSDoc that states additivity, absence, and comparability semantics.
- Test valid zero and sub-cent decimal strings.

### Task 2: Define unavailable and reconciliation contracts

- Add the closed unavailable-reason union.
- Add component/resource/generation reconciliation shapes.
- Enforce available/unavailable mutual exclusion through the type model.
- Test every reason and forbidden money on unavailable envelopes.

### Task 3: Add canonical preimage helpers

- Canonicalize identity fields and sorted component summaries.
- Return deterministic text without importing Node crypto.
- Test input-order invariance and dimension sensitivity.

### Task 4: Add strict validators and exports

- Validate exact fields, canonical decimals, dates, digests, normalized resource IDs, currencies, counts, and reconciliation.
- Reject prototype keys, undeclared fields, non-finite values, malformed IDs, and inconsistent dimensions.
- Export through Azure and root entry points.
- Compile a packed consumer against the public exports.

### Task 5: Complete package verification

- Run focused contract tests.
- Run lint, build, build checks, and packed-consumer verification using Node 24.
- Confirm no existing public cost, savings, view, recommendation, or price contract changes.

## Test Strategy

- Valid available billed/include-estimates baseline.
- Valid available zero baseline.
- Valid unavailable baseline for every reason.
- Invalid available envelope missing currency, period, component, total, or reconciliation.
- Invalid unavailable envelope carrying money.
- Invalid component owner, resource ID, decimal, digest, date, or currency.
- Billed versus amortized and estimate-lens identity separation.
- Input-order invariance.
- Any identity dimension change changes the canonical preimage.
- Extra-field and prototype-key rejection.
- Existing package source compatibility and packed consumer.

Coverage target: at least 80 percent for new validator/helper logic and explicit branch coverage for every unavailable reason.

## Definition of Done

- [x] FinancialBaselineEnvelopeV1 and supporting contracts are exported.
- [x] Available/unavailable mutual exclusion is enforced by types and validators.
- [x] Every money value carries basis, provenance, period, and currency.
- [x] Zero and missing remain distinct.
- [x] Canonical preimages are deterministic and input-order independent.
- [x] Validators reject malformed and undeclared data.
- [x] No runtime mode, publication, manifest, pointer, or customer DTO is introduced.
- [x] Existing exports remain compatible.
- [x] Focused tests, lint, build, and packed-consumer checks pass under Node 24.

## Risks and Mitigations

- Contract duplicates CostComposition semantics. Mitigation: import and reuse existing vocabulary; the baseline aggregates it rather than replacing it.
- Strict validation blocks additive evolution. Mitigation: version the contract before semantics change.
- IDs drift across runtimes. Mitigation: package owns the canonical preimage corpus; runtimes only hash the exact returned bytes.
- Consumers mistake envelope total for savings authority. Mitigation: no savings fields or customer projection in B0; JSDoc states that the envelope is current-cost evidence only.

## Runtime Environment

- Node: /Users/jiatwork/.nvm/versions/node/v24.19.0/bin
- Install: npm install when dependencies are absent
- Focused tests: use the existing package test runner for financialBaseline
- Build: npm run build
- Full package checks: npm run build:check and other detected package quality scripts

## Open Questions

None blocks Types Package implementation.

## Deferred Ideas

- Public sanitized baseline projection.
- OptimizationIntent and ScenarioProjection.
- Baseline/projection provenance on customer DTOs.
- Currency minor-unit allocation contracts.
