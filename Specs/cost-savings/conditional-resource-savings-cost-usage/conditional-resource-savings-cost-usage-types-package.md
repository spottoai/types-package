# Conditional Resource Savings in Cost & Usage — Types Package

## Metadata

Status: implemented
Approved: Yes — user approved implementation on 2026-08-10
Iterations: 2
Last updated: 2026-08-10
Repo: types-package
Domain: cost-savings
Parent spec: `core/specs/cost-savings/conditional-resource-savings-cost-usage/conditional-resource-savings-cost-usage.md`

## Summary

Extend the existing savings-details DTO so detailed plugin resources can carry canonical resource savings and a resource-scoped recommendation scenario without weakening legacy assignments.

## Scope

In scope:

- Add `projected-monthly` to `RecommendationSavingsCalculationBasis`.
- Add `ResourceScopedRecommendation extends Recommendation` with optional `savingsDetails`.
- Add optional canonical `savings` to plugin resource and detailed plugin resource contracts.
- Type detailed resource recommendations as `ResourceScopedRecommendation[]`.

Out of scope:

- Runtime validation or calculation logic.
- API routes or persistence migrations.

## Deferred Ideas

- Making the additive fields required after all stored artifacts have rolled forward.

## Success Criteria

- A projected monthly snapshot scenario compiles through the root package export.
- Legacy plugin resources without savings or scoped details still compile.
- Invalid calculation-basis strings remain compile errors.

## Assumptions and Constraints

- [x] `ResourceRecommendationSavingsDetails` is already exported from `src/azure/recommendations.ts`.
- Contract changes remain additive and backward compatible.

## Cross-Repo Touchpoints

- Cloud Engine produces the new optional fields.
- UI consumes them after updating its types-package dependency.

## Local Recon

- Entry points checked: `src/index.ts`, `src/azure/recommendations.ts`, `src/azure/views.ts`.
- Existing patterns: compile-only contract specs under `src/azure/*.contracts.spec.ts`.
- Relevant docs: `AGENTS.md`, `README.md`, `.agents/skills/types-package-architecture/SKILL.md`.
- Remaining questions: none.

## Approach

Reuse the existing financial DTO and introduce only one scoped recommendation subtype. Keep both plugin resource interfaces structurally independent, matching the current file rather than refactoring inheritance.

## Tasks

1. Contract RED/GREEN
   Files: `src/azure/recommendationSavingsDetails.contracts.spec.ts`, `src/azure/resourceOptimization.contracts.spec.ts`, `src/azure/recommendations.ts`, `src/azure/views.ts`
   Action: add compile fixtures for `projected-monthly`, canonical resource savings, and scoped recommendation details; run them red; add the minimal types; run green.
   Verify: `npm run typecheck:contracts`
   Done: new fixtures compile and existing `@ts-expect-error` cases still fail as intended.
2. Package verification
   Files: generated declarations through the normal TypeScript build
   Action: build the package and validate root exports.
   Verify: `npm run build`; `npm run typecheck:contracts`; `npm run lint`; `npm test`
   Done: the build and contract/test gates pass. `npm run build:check` is intentionally main-only and exits on the `dev-1085` branch before building.

## Test Strategy

- Contract: compile-positive and compile-negative assignments.
- Build: canonical package build/check.
- Coverage: N/A; this repository is compile-time only.

## Definition of Done

- [x] Contract tests cover new, legacy, and invalid-basis assignments.
- [x] `npm run build`, `npm run typecheck:contracts`, `npm run lint`, and `npm test` pass; the main-only `build:check` branch guard is documented.
- [x] Security/performance review records no runtime impact.
- [x] API, MCP, Swagger, and demo-data work are N/A because this is an additive internal artifact contract.

## Risks and Mitigations

- Risk: changing `Recommendation[]` globally could affect unrelated payloads.
- Mitigation: use `ResourceScopedRecommendation[]` only on the detailed plugin resource.

## Rollback

- Revert the additive fields and calculation-basis union member before Cloud Engine/UI consumers merge.

## Runtime Environment

- Start: N/A.
- Env vars: none.
- Tests: `npm run typecheck:contracts`; `npm run build:check`.

## References

- Parent spec.
- `src/azure/recommendationSavingsDetails.contracts.spec.ts`.
- `src/azure/resourceOptimization.contracts.spec.ts`.
