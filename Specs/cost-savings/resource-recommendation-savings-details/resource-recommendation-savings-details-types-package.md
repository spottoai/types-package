# Resource Recommendation Savings Details - Types Package

## Metadata

Status: implementation in progress
Approved: Yes
Approved by: User
Approval source: Conversation request to begin implementation, 2026-08-03
Iterations: 1
Last updated: 2026-08-03
Owner: Cost Optimization
Repo: types-package
Domain: cost-savings
Parent spec: `core/specs/cost-savings/resource-recommendation-savings-details/resource-recommendation-savings-details.md`
Spec location: `Specs/cost-savings/resource-recommendation-savings-details/resource-recommendation-savings-details-types-package.md`

## Summary

Add a small optional shared DTO that explains the standalone saving produced by one recommendation on one resource. The contract carries the backend-selected headline scenario, affected-cost denominator, optional total-resource denominator, and calculation basis. It does not replace `SavingsPotential` or introduce Cost Estimation terminology.

## Scope

In scope:

- Add `RecommendationSavingsCalculationBasis` and `ResourceRecommendationSavingsDetails`.
- Add optional `savingsDetails` to `RecommendationResource`.
- Export the types through the existing Azure recommendation exports.
- Preserve source and generated declaration compatibility.

Out of scope:

- Runtime calculations or validation.
- Changes to `SavingsPotential`, `SavingsRange`, aggregate recommendation types, or Cost Estimation contracts.
- Required fields that would break legacy portal artifacts.

## Deferred Ideas

- Alternative scenario arrays.
- Recommendation compatibility or combination DTOs.
- Related-resource savings breakdowns.

## Success Criteria

- Cloud-engine and UI can import the new DTO from `@spottoai/types-package`.
- Existing code that constructs `RecommendationResource` or `ResourceReference` without `savingsDetails` still compiles.
- New public identifiers do not use the word `estimate`.
- The package build and declaration validation pass.

## Assumptions and Constraints

- [x] `RecommendationResource` is the shared resource-level seam consumed by Resource Detail.
- [x] Both fields are optional and JSON-compatible.
- Existing `currency` and `currencySymbol` remain on the resource row; the details contract does not duplicate currency.
- Field names encode their time basis (`monthly`, `last30Days`) to prevent accidental denominator reuse.

## Cross-Repo Touchpoints

- Cloud-engine produces the contract in `recommendations.json`.
- UI consumes it on Resource Detail.
- API is expected to pass it through without a typed transformation.
- Cloud-engine and UI dependency manifests, lockfiles, and installed versions must agree on the released package version before delivery.

## Local Recon

- Entry points checked: `src/azure/recommendations.ts`, Azure barrel exports, `package.json`, `DEPLOYMENT.md`.
- Existing patterns found: optional backward-compatible fields on `RecommendationResource` and `ResourceReference`; tracked generated `dist` declarations.
- Relevant docs: `AGENTS.md`, `README.md`, `.agents/skills/types-package-architecture/SKILL.md`.
- Remaining questions: none blocking; the release tag is selected during delivery.

## Approach

- Define the DTO adjacent to `RecommendationResource` in `src/azure/recommendations.ts`.
- Keep values numeric and unformatted; presentation and rounding belong to consumers.
- Keep the contract optional and additive.

## Tasks

1. Add contract tests and type fixtures
   Files: a focused type-check fixture under the existing test/build-check pattern; `src/azure/recommendations.ts` as compile target.
   Action: add positive fixtures for complete and absent `savingsDetails`, plus negative fixtures for missing required headline fields and unsupported basis values where the repository's type-test pattern supports them.
   Verify: run the focused type fixture or `npm run build:check` before and after the contract change.
   Done: the intended shape is locked and legacy resource objects remain valid.
2. Add and export the shared DTO
   Files: `src/azure/recommendations.ts` and any existing Azure/index barrel required by the package.
   Action: add the exact parent-spec shape, attach it optionally to `RecommendationResource`, and avoid changes to existing savings contracts or compact resource references.
   Verify: `npm run build` and `npm run lint`.
   Done: downstream TypeScript projects can import the new type and compile both legacy and new payloads.
3. Build, release, and record consumer version
   Files: `package.json`, tracked `dist/**`, and release metadata required by the existing workflow.
   Action: build generated artifacts, publish a prerelease version on the DEV-989 branch, and record the exact version for cloud-engine/UI dependency updates.
   Verify: `npm run build:check`; inspect `package.json`, generated declarations, and the published package metadata.
   Done: one published package version contains the contract and is ready for both consumers.

## Goal-Backward Must-Haves

Truths:

- The contract is optional, resource scoped, and independent of Cost Estimation.
- One type describes the exact values rendered by Resource Detail.

Artifacts:

- `src/azure/recommendations.ts` - shared source contract.
- Generated `dist` declarations - published consumer contract.

Key links:

- `RecommendationResource.savingsDetails` -> `ResourceRecommendationSavingsDetails`.

## Test Strategy

- Compile-time: complete shape, optional absence, invalid basis, and missing headline operands.
- Package: lint, build, and build-check.
- Downstream: cloud-engine and UI compile against the exact published version.
- Coverage target: N/A for interface-only code; compile-time positive and negative cases replace runtime line coverage.

## Definition of Done

### Feature Criteria

- [x] The optional contract matches the approved parent spec.
- [x] Legacy recommendation resource payloads remain valid.
- [ ] Cloud-engine and UI consume the same published package version.

### Completion Checklist

- [x] Compile/type fixtures cover complete, absent, and invalid shapes.
- [ ] `npm run lint`, `npm run build`, and `npm run build:check` pass.
- [x] Generated declarations are reviewed for the intended public surface only.
- [x] Security review is N/A: interfaces introduce no execution or trust boundary.
- [x] Performance review is N/A: interfaces introduce no runtime work.
- [x] Docs repo update is N/A: this is an internal transport contract.
- [x] MCP and Swagger updates are N/A: no capability or endpoint changes.
- [x] Demo data update is handled in the UI/cloud-engine verification slice, not this package.

## Risks and Mitigations

- Risk: consumers install different package versions.
  - Mitigation: require manifest, lockfile, and installed package version agreement in both consumers.
- Risk: the new shape duplicates `SavingsPotential` and drifts.
  - Mitigation: document `savingsDetails` as authoritative for supported resource-detail records and require cloud-engine to derive compatibility values.
- Risk: unstructured text becomes a hidden UI contract.
  - Mitigation: keep action and labels explicit but keep all financial operands structured and numeric.

## Rollback

- Revert the optional type addition and release a follow-up prerelease if necessary. Existing consumers remain compatible because the field is optional.

## Runtime Environment

- Start: N/A; compile-time package only.
- Env vars: none.
- Tests: `npm run lint`, `npm run build`, `npm run build:check`.

## References

- Parent spec: `core/specs/cost-savings/resource-recommendation-savings-details/resource-recommendation-savings-details.md`
- `AGENTS.md`
- `.agents/skills/types-package-architecture/SKILL.md`
- `DEPLOYMENT.md`
