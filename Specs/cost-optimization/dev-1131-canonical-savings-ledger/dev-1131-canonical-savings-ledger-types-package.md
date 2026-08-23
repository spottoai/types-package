# DEV-1131 Canonical Savings Ledger — Types Package Plan

Status: approved
Approved: Yes
Approved by: Jay Ji, 2026-08-19
Iterations: 0
Last updated: 2026-08-19
Owner: Platform
Repo: types-package
Domain: cost-optimization
Parent spec: `core/specs/cost-optimization/dev-1131-canonical-savings-ledger/dev-1131-canonical-savings-ledger.md`
Spec location: `types-package/Specs/cost-optimization/dev-1131-canonical-savings-ledger/dev-1131-canonical-savings-ledger-types-package.md`

## Summary

Add stable, additive compile-time contracts that distinguish standalone recommendation scenarios from canonical portfolio contributions and scoped savings aggregates. Keep legacy `SavingsPotential` and current view fields compatible while cloud-engine, API, and UI migrate.

## Scope

### In scope

- V2 exact-money, scope, aggregate, scenario, contribution, and allocation DTOs.
- Additive V2 fields on recommendation, resource, dashboard, and portal view contracts.
- Contract examples covering valid V2 construction and invalid semantic mixing.
- Stable exports for all consuming repos.

### Out of scope

- Runtime aggregation, validation, or money conversion functions.
- Removing or redefining `SavingsPotential`.
- Publishing or deployment orchestration for consuming repos.

## Deferred Ideas

- Removing V1 fields after all consumers migrate.
- A generic cross-cloud economics contract beyond the Azure view types used by DEV-1131.

## Success Criteria

- Consumers can type scenario potential, portfolio contribution, allocation, and scoped aggregate without casting.
- `SavingsPotential` remains source compatible.
- Recommendation/resource/dashboard view contracts accept additive V2 projections.
- Contract tests reject missing semantics, unsupported scope kinds, and scenario values assigned as contributions; producer/API runtime tests own safe-integer validation.
- Package build, contract typecheck, lint, and test commands pass.

## Assumptions and Constraints

- [x] This package is compile-time only; runtime reducers belong in producer/API/UI repos.
- [x] Current published baseline already contains owner/component aggregation metadata.
- [x] All new response fields can be optional during dual-write migration.
- Exact monetary values use number-typed minor units plus an explicit scale and currency; TypeScript cannot prove integer/safe-range constraints, so cloud-engine and API must validate those at runtime.
- New contracts must not import runtime modules or depend on consumer repos.

## Cross-Repo Touchpoints

- Cloud-engine constructs every V2 contract and owns canonical validation.
- API reads and projects V2 aggregates without redefining the shapes.
- UI formats exact money and composes only distinct subscription aggregates.
- Parent contract and semantics: [core spec](../../../../core/specs/cost-optimization/dev-1131-canonical-savings-ledger/dev-1131-canonical-savings-ledger.md).

## Local Recon

- Entry points checked: `src/index.ts`, `src/azure/views.ts`, `src/azure/recommendations.ts`.
- Existing patterns found: domain contracts under `src/azure/*.ts`; compile-time examples under `src/azure/*.contracts.spec.ts`; `npm run build` includes `typecheck:contracts`.
- Relevant docs: `AGENTS.md`, `README.md`, `.agents/skills/types-package-architecture/SKILL.md`.
- Remaining questions: none blocking.

## Approach

- Add `src/azure/savings.ts` as the dependency-light source for V2 savings primitives and projection DTOs.
- Import those primitives into `views.ts` and `recommendations.ts`; do not duplicate structural definitions.
- Extend view and row contracts additively. V1 fields remain untouched and keep their existing documentation.
- Represent contract version, semantics, scope kind, and combination policy as string literal unions so scenario/contribution misuse is visible to TypeScript.
- Use compile-time fixture objects and `@ts-expect-error` cases in `savings.contracts.spec.ts`.

## Tasks

1. Define the V2 savings primitives and exports.
   - Files: `src/azure/savings.ts`, `src/index.ts`.
   - Action: add exact money range, scenario potential, portfolio contribution, allocation reference, savings scope, aggregate, and per-currency aggregate-set contracts; document invariants and additive/non-additive semantics; export them from the package root.
   - Verify: `npm run typecheck:contracts` and `npm run build`.
   - Done: every contract in the parent spec is importable from `@spottoai/types-package` with no runtime implementation added.

2. Add V2 fields to existing Azure view contracts without breaking V1.
   - Files: `src/azure/views.ts`, `src/azure/recommendations.ts`.
   - Action: add optional `savingsAggregate`, `scenarioSavings`, and `portfolioContribution` fields to the applicable dashboard/resources/recommendations and row DTOs; retain `savings` and `costSavingsSummary`; document which fields are additive.
   - Verify: `npm run build` and compile representative current V1 fixtures unchanged.
   - Done: current V1 assignments compile, and V2 consumers no longer need local casts or ad hoc extended interfaces.

3. Add contract boundary tests and run package gates.
   - Files: `src/azure/savings.contracts.spec.ts`, existing recommendation/view contract examples as needed.
   - Action: add valid full/query scope examples, mixed-currency aggregate-set examples, and negative cases for scenario/contribution substitution, missing generation/scope, and invalid scope kinds; document that fractional/unsafe minor units require runtime validation in producer and API tests.
   - Verify: `npm run typecheck:contracts`, `npm run lint`, `npm run format:check`, `npm test`.
   - Done: contract typecheck proves the intended distinctions, package artifacts build, and all package checks pass.

## Goal-Backward Must-Haves

### Truths

- Scenario and contribution have different discriminants.
- Aggregate always identifies contract version, producer generation, scope, currency, and exact totals.
- V1 consumers compile without changes.

### Artifacts

- `src/azure/savings.ts` — canonical shared DTO definitions.
- `src/azure/savings.contracts.spec.ts` — compile-time positive and negative examples.

### Key Links

- `src/azure/savings.ts` -> `src/azure/views.ts` and `src/azure/recommendations.ts` through type imports.
- Azure modules -> `src/index.ts` through stable package exports.

## Test Strategy

- Unit/runtime: N/A; the repo owns compile-time contracts only.
- Contract: positive/negative TypeScript fixtures in `savings.contracts.spec.ts`.
- Integration: local-source typechecks in cloud-engine, API, and UI are required by their child plans.
- Coverage target: N/A for runtime coverage; all new contract branches receive compile-time examples.

## Definition of Done

### Feature Criteria

- The V2 contract expresses every locked semantic in the parent spec.
- Legacy view and savings assignments remain valid.
- Consumers can adopt V2 using the local types-package source before publishing.

### Completion Checklist

- [ ] Unit tests added with happy/error/boundary coverage — N/A runtime; compile-time contract coverage required instead.
- [ ] Feature validated in dev environment — N/A for compile-time-only package; downstream local-source validation required.
- [ ] Code quality review completed for compatibility, naming, modularity, and documentation.
- [ ] Docs repo updated — N/A; no standalone user-facing feature in this repo.
- [ ] MCP server updated — N/A; additive transport fields require compatibility evaluation only.
- [ ] Swagger/OpenAPI updated — N/A in types-package; API plan owns it.
- [ ] Demo environment data updated — N/A in types-package.

## Risks and Mitigations

- **Risk:** A new type silently reuses V1 ambiguous names. **Mitigation:** require semantic discriminants and document V1 as legacy compatibility only.
- **Risk:** Contract cycles between views and recommendations. **Mitigation:** keep savings primitives in a dependency-light module imported by both.
- **Risk:** Generated `.d.ts/.js` source artifacts drift. **Mitigation:** rely on the existing build/finalize pipeline and commit only repository-required generated artifacts.
- **Risk:** Breaking required fields reach old producers. **Mitigation:** V2 additions remain optional on V1 view types during dual-write.

## Rollback

- Revert additive V2 exports and fields before any consumer release.
- After consumers adopt them, rollback must be consumer-first; do not publish a types version that removes still-imported contracts.

## Security Considerations

- Contracts expose no new credentials or authorization data.
- Filter fingerprints must be documented as opaque and must not contain raw tenant filter values.

## Runtime Environment

- Start: N/A; compile-time package.
- Env vars: none.
- Tests: `npm run typecheck:contracts`, `npm run build`, `npm run lint`, `npm run format:check`, `npm test`.

## References

- [Parent spec](../../../../core/specs/cost-optimization/dev-1131-canonical-savings-ledger/dev-1131-canonical-savings-ledger.md)
- `AGENTS.md`
- `.agents/skills/types-package-architecture/SKILL.md`
