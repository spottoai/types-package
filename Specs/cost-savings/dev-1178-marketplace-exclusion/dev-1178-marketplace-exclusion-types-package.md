Status: approved
Approved: Yes — user approved implementation on 2026-09-07
Iterations: 1
Last updated: 2026-09-07
Owner: Platform
Repo: types-package
Domain: cost-savings
Parent spec: `core/specs/cost-savings/dev-1178-marketplace-exclusion/dev-1178-marketplace-exclusion.md`
Spec location: `types-package/Specs/cost-savings/dev-1178-marketplace-exclusion/dev-1178-marketplace-exclusion-types-package.md`
Related contracts: `src/azure/prices.ts`, `src/azure/savings.ts`, `src/azure/billingPlots.ts`, `src/azure/reports.ts`, `src/azure/views.ts`

# DEV-1178 Types Package Plan

## Summary

Define dependency-free, versioned contracts for Marketplace-excluded formal-report financial projections, unknown charge objects and the billing-facing maximum monthly potential savings result. The package describes and validates contracts; it performs no I/O, hashing or financial classification.

## Scope

In scope:

- Preserve publisher/source fields needed at runtime.
- Define the fixed Marketplace-excluding policy identity.
- Define tri-state financial charge source and typed unknown reasons.
- Define report coverage and complete unknown-object entries.
- Bind savings and billing-chart outputs to policy, generation, scope, period, basis and currency.
- Define a non-partial chargeable-savings availability union.
- Add exact validators/canonicalization helpers and exports.

Out of scope:

- Classifying Azure rows.
- Computing savings or generating reports.
- Stripe-specific types or usage events.
- Realized-savings contracts.

## Deferred Ideas

- A general customer-configurable charge-inclusion policy framework.
- AWS/GCP equivalents before a producer exists.
- Stripe meter-event identities and invoice reconciliation.

## Success Criteria

- Consumers can distinguish all-charge evidence from `azure-cloud-services-excluding-marketplace/v1` projections.
- Unknown entries require name, type, cost coordinate and a stable object/component identity.
- Chargeable savings cannot represent a partial monetary value.
- Validators reject unknown policy refs, mixed coordinates, unsafe integers, missing required object fields and `available` results with partial coverage.
- Existing `SavingsAggregateV2` consumers remain source-compatible during staged rollout.

## Assumptions and Constraints

- [x] Maximum monthly potential savings remains represented in minor units and is portfolio-additive only after canonical allocation. Validated from current `savings/v2` contracts.
- [x] `publisherType` is optional at ingestion because Azure can reject or omit that dimension. Validated in Cloud Engine.
- The new public shapes must be runtime-validatable without Node-only dependencies.
- Generated JS and declaration artifacts follow the existing package build; they are not edited manually.

## Cross-Repo Touchpoints

- Cloud Engine produces the contracts and owns classification/calculation.
- Metrics Analyzer consumes policy-bound billing inputs and produces compatible coverage metadata.
- API validates and transports the outputs.
- UI consumes report coverage, unknown objects and chargeable savings availability.

## Local Recon

- Entry points checked: `src/index.ts`, Azure barrels, `src/azure/prices.ts`, `savings.ts`, `billingPlots.ts`, `reports.ts`, `views.ts`.
- Existing patterns found: exact dependency-free validators, versioned immutable artifacts, minor-unit savings contracts and public/internal projection separation.
- Relevant docs: `AGENTS.md`, `README.md`, `.agents/skills/types-package-architecture/SKILL.md`.
- Remaining questions: none.

## Approach

- Add `src/azure/financialChargePolicy.ts` as the focused shared vocabulary and validation boundary.
- Keep `SavingsAggregateV2` stable. Add a policy-bound envelope rather than changing the meaning of the existing aggregate.
- Extend billing row types only with optional source evidence needed for compatibility; require resolved policy coordinates in the new strict envelope.
- Reuse `CanonicalMoneyRangeV2`, `CostBasis` and existing generation/scope identities rather than adding floating-point money alternatives.

## Tasks

1. Add financial charge policy and unknown-object contracts
   Files: `src/azure/financialChargePolicy.ts`, `src/azure/prices.ts`, `src/azure/reports.ts`, `src/index.ts`
   Action: define the fixed policy ref, `azure-native | marketplace | unknown`, reason codes, source-evidence fields, signed money coordinate, coverage totals and required unknown-object identity/display fields. Add `publisherName` and resource/product classification evidence to `ResourceSpend` where needed.
   Verify: run the new contract spec plus `npm run typecheck:contracts`.
   Done: exact validators accept complete and partial canonical fixtures and reject heuristic-only promotion, missing name/type/cost, invalid periods/currencies and non-reconciling source totals.

2. Add policy-bound savings and chargeable result envelopes
   Files: `src/azure/savings.ts`, `src/azure/financialChargePolicy.ts`, `src/azure/savings.contracts.spec.ts`
   Action: define a policy-bound savings aggregate envelope and `available | unavailable` chargeable result. Require available results to carry complete coverage and the fixed policy; unavailable results carry typed reasons and the same financial coordinate without a numeric chargeable fallback.
   Verify: `npm run typecheck:contracts` and targeted TypeScript compilation.
   Done: the type system and validator prevent a partial/unknown scope from exposing chargeable `maxSavingsMinorUnits`.

3. Bind formal billing analytics and views to the policy
   Files: `src/azure/billingPlots.ts`, `src/azure/views.ts`, `src/azure/reports.ts`, `src/azure/financialChargePolicy.contracts.spec.ts`
   Action: add policy/coverage envelopes to formal-report billing metadata and Azure report-facing views while retaining legacy optional fields for staged readers. Define deterministic unknown-object ordering and reconciliation invariants.
   Verify: `npm run build` and the new contract tests.
   Done: a report consumer can verify policy, generation, scope, period, basis, currency, coverage and the complete unknown-object set before using money.

4. Publish and verify package compatibility
   Files: generated build outputs, `package.json` only if required by existing automation, consumer compile fixtures
   Action: build the package, inspect packed exports and compile API, Cloud Engine and UI against the local package before requesting publication. Do not manually bump or publish a version.
   Verify: `npm test && npm run lint && npm run format:check && npm run build:check` plus downstream local-types compiles.
   Done: package gates pass and every new public symbol is present in both ESM/CommonJS declarations and package entry points.

## Goal-Backward Must-Haves

Truths:

- Partial coverage is representable for reports but never as a chargeable number.
- Missing publisher evidence remains unknown.
- Every unknown object has name, type and selected-basis cost.

Artifacts:

- `src/azure/financialChargePolicy.ts` — shared financial policy vocabulary and validators.
- `src/azure/financialChargePolicy.contracts.spec.ts` — portable valid/invalid corpus.

Key links:

- `ResourceSpend` source evidence -> Cloud Engine classifier.
- policy-bound savings envelope -> API validation -> UI report authority.
- billing analytics coverage -> UI Cost Analysis and SDM cost sections.

## Test Strategy

- Unit/contract: known Azure, Marketplace, mixed, unknown, signed refund/credit, zero-only unknown, missing identity, mixed currency/basis/period and unsafe minor units.
- Integration: compile representative producer and consumer fixtures against packed output.
- E2E: N/A in this compile-time-only repo.
- Coverage target: 80% for new validator branches, with mutation-style invalid fixtures for every required field.

## Definition of Done

### Feature Criteria

- The published contract cannot serialize a partial value as billable.
- Unknown-object contracts require the user-approved identifying and cost fields.
- Policy identity and financial coordinates are explicit and validated.

### Completion Checklist

- [ ] Unit/contract tests added with happy, error and boundary coverage.
- [ ] Feature validated through packed consumer compilation.
- [ ] Code quality, security, performance and modularity reviews completed.
- [ ] Public docs updated if the contract is externally documented; otherwise N/A with rationale.
- [ ] MCP update N/A unless an existing MCP response consumes this financial contract.
- [ ] Swagger update N/A; API owns Swagger.
- [ ] Demo update N/A; UI owns demo data.

## Risks and Mitigations

- Risk: expanding `SavingsAggregateV2` changes its existing semantics. Mitigation: wrap it in a new strict policy-bound envelope.
- Risk: optional legacy fields are mistaken for authority. Mitigation: validators require the new envelope for formal/billing use.
- Risk: internal evidence leaks publicly. Mitigation: define separate public fields and forbid physical storage paths or credentials.

## Rollout and Rollback

- Publish Types before runtime producers/readers adopt it.
- Keep legacy exports during the migration window.
- Rollback consumers before removing producer fields; do not unpublish package versions.

## Security Considerations

- Data access: contracts may contain customer financial object identifiers but no credentials.
- Auth/authz: N/A; enforced by API.
- External integrations: none.

## Runtime Environment

- Start: N/A; compile-time package.
- Env vars: none.
- Tests: `npm test`, `npm run lint`, `npm run format:check`, `npm run build:check`.

## References

- Parent spec: `core/specs/cost-savings/dev-1178-marketplace-exclusion/dev-1178-marketplace-exclusion.md`
- `README.md`
- `.agents/skills/types-package-architecture/SKILL.md`
