# Financial Dataflow Alignment — Types Package

## Metadata

Status: successor contracts implemented; `.3` is published, `.4` content passed the full local package gate, and the identical `.5` candidate is prepared for publication/consumer repin
Approved: Yes
Approved by: User, conversation instruction to freeze contracts and self-review, 2026-08-26
Iterations: 2
Last updated: 2026-08-28
Repo: types-package
Domain: cost-savings / unified-financial-baseline
Parent spec: `core/specs/cost-savings/unified-financial-baseline/financial-dataflow-alignment-implementation-plan.md`
Spec location: `Specs/cost-savings/unified-financial-baseline/financial-dataflow-alignment-types-package.md`

## Summary

Freeze the dependency-free portable contracts that join an exact company-authorized financial scope to current-spend composition, immutable daily analytics input, promoted forecast/trend/anomaly output, immutable Policy Definition revision, and deterministic Financial Policy Evaluation. The contracts reuse Financial Scope Baseline V2 IDs, periods, evidence identities, exact-decimal utilities, and digest conventions. They do not create another owner-baseline model. Cloud Engine, Metrics Analyzer, API, and UI now consume the successor surface in DEV-1138; final package publication/pinning and runtime verification remain pending.

## Scope

In scope:

- canonical estimate-lens vocabulary plus an explicit legacy transport bridge;
- an exact company/scope/period/basis/lens/currency coordinate for derived financial data;
- a composition envelope over existing V2 baseline IDs, including available, partial, and unavailable states;
- daily analytics input with available/partial points bound to composition IDs and explicit unavailable gap intervals;
- discriminated forecast, trend, and anomaly projection results;
- identity-only analytics job requests, shared immutable output manifests, and CAS-friendly promoted-current pointers bound to verified artifact digests and generations;
- immutable budget or cost-anomaly Policy Definition revisions;
- deterministic Policy Evaluation with one signal kind, a shared immutable read manifest, a portal-safe read projection, and server-only action attempts sharing one action-audit identity;
- strict validators, canonical preimages, SHA-256 identity helpers, limits, logical artifact names, Core corpus execution, root exports, and compile-time contract tests.
- optional dependency roles for commercial arrangement, provider-access observation, configuration timeline, provider price schedule, pricing function, charge-inclusion policy, and settlement revision. These roles identify consumed evidence only; they are not Financial Coordinate axes and do not infer PAYG, access, or zero cost.

Out of scope for this repository:

- runtime deployment and environment configuration in consumer repositories;
- Cloud Engine, Metrics Analyzer, API, UI, queue, storage, or authorization implementation details;
- analytics formulas and anomaly model internals;
- physical blob paths, retention durations, retry cadence defaults, or scheduler behavior;
- modifying the existing Financial Scope Baseline V2 wire tokens;
- FX conversion or a scalar mixed-currency result.

## Deferred Ideas

- Provider-neutral scope variants follow a proven AWS producer boundary; V1 is Azure-specific.
- A future contract generation may remove legacy `actual-only` and `actual-plus-estimated` tokens from Financial Scope Baseline itself. This freeze adds an explicit bridge without silently changing V2 bytes or IDs.
- `1.0.2-dev1138.1` is an intermediate prerelease. Changes made after that publication, including request-time identity binding and embedded immutable analytics evidence, require the next exact DEV-1138 prerelease and exact consumer repins.

## Success Criteria

- New contracts reference existing baseline IDs and periods rather than reproducing owner components or baseline reconciliation.
- One coordinate binds company, Azure account membership, scope fingerprint, period role and interval, billed/amortized basis, canonical estimate lens, and explicit resolved or unresolved accounting-currency state. Analytics requires the resolved branch.
- Unknown or mixed currency is typed unavailable; no validator inserts a currency or amount.
- Analytics history and current-period composition have separate identities; a forecast cannot pretend its training window is the current billing period.
- Forecast, trend, and anomaly are closed result variants with kind-specific fields; no generic optional `amount` changes meaning by caller.
- One budget definition may carry current-spend and forecast threshold sets simultaneously, matching existing product behavior.
- Every Policy Evaluation binds the exact definition revision, current period, availability, and input IDs; read and action outputs derive from the same evaluation ID but remain separate artifacts.
- Core corpus vectors and mutation cases pass through the package gate with bounded validation.

## Assumptions and Constraints

- Validated: Financial Scope Baseline V2 and Financial Authority View V1 are the existing owner/aggregate authorities.
- Validated: current cost-alert definitions can configure current-spend and forecast thresholds together.
- Validated: the legacy `EstimateLens` tokens are already embedded in V2 identities and cannot be renamed in place.
- Constraint: every money amount is a canonical decimal string and every present amount has a three-letter upper-case currency.
- Constraint: zero is a valid amount; missing is represented by a typed status and reason.
- Constraint: validators are dependency-free, reject undeclared fields and prototype keys, and bound strings and collections before expensive work.
- Constraint: canonicalization is deterministic and excludes only the artifact's own ID/digest field.
- Constraint: authorization is not inferred from contract validity. Company and scope binding are integrity inputs for an already authorized caller.

## Cross-Repo Touchpoints

- Core owns the implementation-neutral corpus and architectural invariants.
- Cloud Engine will produce current-spend compositions and analytics inputs, and evaluate policy revisions.
- Metrics Analyzer will consume validated immutable input generations and produce promoted analytics projections.
- API will authorize Policy Definition commands and transport validated artifacts without financial calculation.
- UI will consume read projections and may run the same pure policy evaluator only for explicitly display-only unsaved previews.

## Local Recon

- Entry points checked: `src/index.ts`, `src/azure/financialScope.ts`, `src/azure/costComposition.ts`, `package.json`, and `tsconfig.contracts.json`.
- Existing patterns found: strict exact-field validators, canonical JSON preimages, portable SHA-256, exact-decimal helpers, script-backed corpus gates, and the `azure/financial-scope` subpath.
- Existing contracts reused: `FinancialScopeBaselineEnvelopeV2`, `FinancialBaselinePeriodV2`, `FinancialEvidenceIntervalV1`, `CostBasis`, and exact money validation.
- Remaining physical queue/path/retention choices are owned by later repo-local specs and do not block semantic contract freeze.

## Approach

Add focused contract families under the existing `azure/financial-scope` export family:

1. `financialDataflow.ts` owns canonical lens bridging, exact derived-data coordinate, and current-spend composition.
2. `financialAnalytics.ts` owns daily inputs and kind-specific analytics projections.
3. `financialAnalyticsDelivery.ts` owns identity-only queue requests, immutable output manifests, logical artifact names, and promoted-current pointers.
4. `financialPolicy.ts` owns immutable definition revisions and evaluations.
5. `financialPolicyDelivery.ts` owns the immutable read manifest, portal-safe read DTO, and server-only action-attempt audit DTO.

Keep validation and canonical identity helpers beside each contract family. Reuse existing exact-decimal and SHA-256 primitives. The Core corpus adapter supplies contract framing only; it cannot infer scope, period, money, currency, availability, or evidence.

## Tasks

### Task 1: Lock the desired public surface with failing tests

Files:

- Create: `src/azure/financialDataflow.contracts.spec.ts`
- Create: `src/azure/financialAnalytics.contracts.spec.ts`
- Create: `src/azure/financialAnalyticsDelivery.contracts.spec.ts`
- Create: `src/azure/financialPolicy.contracts.spec.ts`
- Create: `src/azure/financialPolicyDelivery.contracts.spec.ts`
- Modify: `tsconfig.contracts.json`

Action:

- Compile examples for available, partial, unavailable, explicit zero, signed refund/credit, and all three canonical estimate lenses.
- Compile separate analytics history and current-period composition IDs.
- Compile forecast, trend, and anomaly outputs through a discriminated result union.
- Compile one budget revision containing both current-spend and forecast thresholds.
- Assert the callable validator, canonicalizer, and identity-helper exports.

Verify:

```bash
npm run typecheck:contracts -- --pretty false
```

Done:

- The first run fails only because the proposed modules or exports do not exist.

### Task 2: Implement dataflow and analytics contracts

Files:

- Create: `src/azure/financialDataflow.ts`
- Create: `src/azure/financialDataflowValidation.ts`
- Create: `src/azure/financialAnalytics.ts`
- Create: `src/azure/financialAnalyticsValidation.ts`
- Create: `src/azure/financialAnalyticsDelivery.ts`
- Create: `src/azure/financialAnalyticsDeliveryValidation.ts`
- Modify: `src/azure/costComposition.ts`

Action:

- Add canonical estimate-lens types and total legacy↔canonical mapping functions without changing existing V2 wire values.
- Define one exact derived-data coordinate and composition member/result unions over existing baseline IDs.
- Define bounded daily points whose amounts carry availability and composition identity.
- Define kind-specific forecast/trend/anomaly result unions and available/partial/unavailable projection envelopes.
- Implement strict validators, shared manifest descriptors, compatibility checks, canonical preimages, and deterministic SHA-256 IDs.

Verify:

```bash
npm run typecheck:contracts -- --pretty false
```

Done:

- Contract tests compile and validators reject cross-coordinate, mixed-currency, missing-as-zero, unsafe-number, invalid-date, oversized, prototype-key, and undeclared-field inputs.

### Task 3: Implement policy contracts and cross-link invariants

Files:

- Create: `src/azure/financialPolicy.ts`
- Create: `src/azure/financialPolicyValidation.ts`
- Create: `src/azure/financialPolicyDelivery.ts`
- Create: `src/azure/financialPolicyDeliveryValidation.ts`

Action:

- Define immutable `budget` and `cost-anomaly` definition revisions with exact amounts and percentages.
- Permit current-spend and forecast threshold sets together on one budget revision while requiring at least one non-empty set.
- Define one evaluation signal per result, exact input IDs, immutable definition revision, stable reason codes, and separate read/action IDs.
- Reject a forecast signal without an analytics projection and reject definition, scope, currency, or coordinate drift.

Verify:

```bash
npm run typecheck:contracts -- --pretty false
```

Done:

- Policy contracts preserve existing budget behavior without carrying legacy float money into the successor contract.

### Task 4: Add the Core corpus gate and exports

Files:

- Create: `scripts/check-financial-dataflow-contracts.mjs`
- Create: `scripts/check-financial-dataflow-contract-negatives.mjs`
- Modify: `src/azure/financialScope.ts`
- Modify: `src/index.ts`
- Modify: `package.json`

Action:

- Execute the Core corpus, DTO positive vectors, and mutations against built validators.
- Compare expected canonical preimages and IDs.
- Export the family through the existing `azure/financial-scope` entry and root barrel.
- Add `check:financial-dataflow-contracts` to `npm test` without publishing or changing package version.

Verify:

```bash
npm run check:financial-dataflow-contracts
npm run build
npm run lint
npm test
```

Done:

- Local package contents expose the frozen draft, the corpus gate passes, and no existing public export is removed or reinterpreted.

## Goal-Backward Must-Haves

Truths:

- Changing company, scope membership, period, basis, lens, currency, generation, definition revision, or algorithm changes identity or fails validation.
- A training-history series cannot substitute for current spend.
- A forecast cannot be relabelled to another scope or summed from subscription forecasts.
- A browser read projection cannot execute an action.

Artifacts:

- `src/azure/financialDataflow.ts` — exact coordinate and composition contract.
- `src/azure/financialAnalytics.ts` — immutable daily input and analytics result contract.
- `src/azure/financialPolicy.ts` — immutable definition and evaluation contract.
- `scripts/check-financial-dataflow-contracts.mjs` — shared corpus gate.

Key links:

- Current-spend composition -> existing V2 baseline IDs.
- Analytics daily points -> composition IDs.
- Analytics projection -> exact immutable input-series ID.
- Job request -> exact input generation, verified artifact digest, requested outputs, and fixed `requestedAt`. Transport retries reuse the exact request unchanged; a later requested calculation receives a different request ID so it cannot collide with different `producedAt` bytes at one immutable output path.
- Current pointer -> exact projection ID, output generation, coordinate ID, and verified artifact digest.
- Policy Evaluation -> exact definition revision + current composition + optional analytics projection.
- Read and action artifacts -> one evaluation ID.

## Test Strategy

- Unit/contract: compile-time shapes, strict runtime validation, canonicalization, ID generation, availability, date/decimal/currency boundaries.
- Integration: Types gate executes the Core contract-neutral corpus and DTO mutation vectors.
- E2E: not applicable at this checkpoint; later Cloud/Python/API/UI repo specs own runtime proof.
- Coverage target: every identity-bearing field has a mutation; every closed union has a positive example and an invalid token.

## Definition of Done

### Feature Criteria

- [x] Core corpus and Types gate pass: 8 cases, 24 Core mutations, and 3 graph cases; every semantic case is adapted into and validated against the actual Types contracts, while Types-native negative vectors independently exercise compatibility failures.
- [x] No new contract duplicates V2 owner/component reconciliation.
- [x] Budget current and forecast thresholds coexist in one revision.
- [x] Forecast/trend/anomaly outputs are discriminated, exact-arithmetic checked where internally provable, generation-bound, and scope-bound.
- [ ] Publish the post-`dev1138.1` contract corrections under a new non-`latest` prerelease and exact-pin every runtime consumer.

### Completion Checklist

- [x] Contract tests cover happy, error, and boundary states.
- [x] Security review covers company/scope binding, prototype/duplicate keys, hostile size/depth, destination secrecy, and action authority.
- [x] Performance review covers bounded arrays/strings, interval scanning, canonicalization cost, and hard file-size limits.
- [x] Modularity review covers reuse of V2 baseline and shared exact-decimal/digest primitives.
- [ ] Re-run the full package gates after the final contract delta and verify the packed artifact consumed by Cloud Engine, Metrics Analyzer adapters, API, and UI.
- [x] Public docs: N/A; internal draft contract.
- [x] MCP: N/A; no tool contract change.
- [x] Swagger: N/A; no API endpoint change.
- [x] Demo data: N/A; synthetic corpus only.

## Contract-Freeze Self-Review Corrections

- The Types repository carries an exact vendored Core corpus so clean CI/publication is self-contained, and checks equality with a sibling Core source when both repositories are present. `financial-dataflow-core-types-adapter.mjs` constructs and validates the actual Types DTOs for every semantic case. Core mutation and graph gates remain implementation-neutral; Types runs its own exact negative compatibility vectors and does not claim those Core mutations were adapted.
- `CurrentSpendCompositionV1` compatibility now verifies exact V2 member IDs, requested financial-period coordinates, currencies, exact-decimal totals, availability, and source-derived reason codes. Different members are allowed to carry different evidence/coverage IDs for the same requested period.
- `daily` is a first-class V2 period window, and every analytics point reconciles to one exact daily composition.
- Forecast, trend, and anomaly projections bind their real inputs. Trend uses a distinct comparison-period composition and exact change/percentage arithmetic; anomaly observed amounts reconcile to daily input points; unsupported capability may be unavailable before an input exists.
- Policy compatibility recomputes current-spend, forecast, and anomaly thresholds using exact decimals. Claimed matches below a configured threshold are rejected, while partial/unavailable inputs remain non-monetary policy states.
- Public identity validators bound already-parsed values by aggregate bytes, nodes, and depth before hashing. JSON parsing accepts only RFC 8259 whitespace, maximum-scale arithmetic fails closed, and Core mutation paths reject prototype-sensitive traversal.
- Policy signals retain their result kind through partial/unavailable states; trend compares only matching window/calendar semantics and duration where the window kind requires it. `daily` and `rolling-30-days` have exact durations, `calendar-month` uses exact natural-month boundaries, and provider billing windows bind their provider period ID. Baseline coverage entries are evidence-role spans rather than additive day partitions, so distinct roles may overlap; analytics inputs separately reconcile daily points and unavailable gaps exactly.

## Risks and Mitigations

- Risk: duplicate financial baseline authority.
  Mitigation: composition members reference existing V2 baseline IDs and never copy owner components.
- Risk: legacy lens rename changes existing IDs.
  Mitigation: retain legacy V2 tokens and expose a total explicit adapter into canonical dataflow vocabulary.
- Risk: generic analytics fields drift by result kind.
  Mitigation: use a closed discriminated union with kind-specific validators.
- Risk: one budget definition loses current or forecast behavior.
  Mitigation: one budget criteria variant holds both independently optional threshold sets and requires at least one.
- Risk: validators become a denial-of-service surface.
  Mitigation: bounded fields, iterative/bounded traversal, prototype-key rejection, and no I/O or network behavior.

## Rollback

- Delete only the new draft modules, tests, script, and scoped exports/package script.
- Restore only the small canonical lens bridge additions if the successor contract is rejected.
- Do not reset or discard unrelated DEV-1138 worktree changes.
- Runtime consumers are now changed in DEV-1138. Rollback must pin all consumers back to one mutually compatible exact package version and disable the successor routes/workers together; it cannot mix contract generations.

## Security Considerations

- Contracts contain company and scope identity but no credentials, destination secrets, webhook URLs, or provider tokens.
- Destination references are opaque IDs; action execution remains server-only.
- Validation proves integrity, not authorization. API and worker callers must authorize company/scope access independently.
- Prototype keys, undeclared fields, unbounded collections, and unsafe numeric money are rejected.

## Runtime Environment

- Start: N/A; compile-time package plus dependency-free validators.
- Node: `/Users/jiatwork/.nvm/versions/node/v24.19.0/bin/node`.
- Env vars: none.
- Tests: `npm run check:financial-dataflow-contracts`, `npm run build`, `npm run lint`, `npm test`.

## References

- `core/specs/cost-savings/unified-financial-baseline/financial-dataflow-alignment-implementation-plan.md`
- `core/specs/cost-savings/unified-financial-baseline/financial-dataflow-alignment-core.md`
- `core/skills/domain-language/references/financial-baseline-glossary.md`
- `core/skills/domain-language/references/calculation-contracts.md`
- `src/azure/financialScope.ts`
- `src/azure/costComposition.ts`
