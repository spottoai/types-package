# MSP Portfolio Operations Types

## Metadata

Status: implementation-in-progress
Approved: Yes — user explicitly requested iteration 4 implementation on 2026-07-23
Iterations: 4
Last updated: 2026-07-23
Repo: types-package
Domain: portfolio
Parent spec: `core/specs/portfolio/msp-portfolio-operations.md`
Spec location: `types-package/specs/portfolio/msp-portfolio-operations-types.md`

## Summary

Add stable shared contracts for hierarchy-scoped company rollups, aggregate coverage, budget health, persisted SOW approval, month-end completion, and normalized expiry rows. The package remains compile-time only; hierarchy resolution, authorization, persistence, and aggregation stay in API services.

## Scope (Repo-Specific)

In scope:

- Add additive request/response DTOs consumed by API and UI.
- Define discriminated unions for workflow states and expiry kinds.
- Define a common portfolio coverage/freshness envelope.
- Export contracts from the package's public entry points.
- Add compile-time and runtime-shape tests where this repo's existing patterns support them.

Out of scope:

- Business-logic functions.
- API route implementations or storage entities.
- UI presentation models.
- Changing existing Azure artifact types.

## Deferred Ideas

- Exchange-rate or portfolio base-currency contracts.
- CRM/e-sign provider metadata.
- Materialized portfolio-index artifact schemas unless scale testing requires them.

## Success Criteria (Repo)

- UI and API import the same portfolio contracts.
- Changes are additive and do not break existing consumers.
- Status and kind fields are closed unions, not arbitrary strings.
- Coverage metadata can distinguish complete, partial, stale, and unavailable source reads.
- Monetary values always include currency and are never modeled as a currency-free aggregate.

## Assumptions and Constraints (Post-Recon)

- [x] Existing package domains are organized under `src/` and exported through index files.
- [x] Budget, commitments, and service-retirement source contracts already exist and should not be duplicated.
- [x] This package has no runtime storage or authorization responsibility.
- [x] A page/page-size response was chosen because the existing common cursor primitive does not model the platform grid's numbered pagination contract.
- Breaking changes require coordinated consumer releases.

## Cross-Repo Touchpoints

- API returns these DTOs from `/companies/*/portfolio/*` and the existing generated-report routes.
- UI consumes the same DTOs in service clients, query hooks, models, and pages.
- Existing generated-report metadata is the persistence model extended by the API for SOW approval.

## Local Recon (Required Before Approach)

- Entry points checked: fetched `origin/main` `src/azure/reportingTemplates.ts` plus local `src/index.ts`, `src/azure/budgets.ts`, `src/azure/commitmentsPlanning.ts`, `src/azure/serviceRetirement.ts`, `src/common/pagination.ts`.
- Existing patterns found: domain folders with local `index.ts` exports and additive interface/union contracts.
- Relevant docs/README: `AGENTS.md`, `README.md`, `REPO_LAYOUT.md`, `.agents/skills/types-package-architecture/SKILL.md`.
- Remaining questions: confirm whether portfolio list responses should reuse or wrap the existing pagination contract. The fetched generated-report contract has persistence identity and `createdAt` but no approval fields.

## Approach

- Add `src/portfolio/portfolioOperations.ts` and `src/portfolio/index.ts`.
- Keep raw artifact types in their current Azure modules.
- Model API-facing normalized rows rather than exposing raw source payloads.
- Prefer ISO timestamps, explicit currencies, safe reason codes, and discriminated unions.
- Keep storage-only fields such as blob paths out of public contracts.

## Proposed Contracts

- `PortfolioCoverage`
  - requested/loaded/failed customer and subscription counts
  - safe failure entries
  - `isPartial`
  - oldest/newest observed timestamps
- `PortfolioBudgetStatus`
  - `onTrack | atRisk | overBudget | unbudgeted`
- `PortfolioBudgetRow`
  - customer/subscription/budget identity and scope
  - actual/forecast/budget money values
  - actual/forecast percentages and status
  - source period/freshness/provenance
- `SowApprovalStatus`
  - `approved | unapproved`
- `PortfolioSowRow` and `UpdateSowApprovalRequest`
  - generated report identity, `createdAt` issued/generated date, approval status, optional approval audit metadata
- `PortfolioMonthEndStatus`
  - `complete | incomplete | unavailable`
- `PortfolioMonthEndRow`
  - exact `YYYY-MM` period, draft/artifact state, issue audit, drill-through identity
- `PortfolioExpiryKind`
  - `servicePrincipalCredential | reservation | savingsPlan | serviceRetirement`
- `PortfolioExpiryState`
  - `expired | dueSoon | scheduled`
- `PortfolioExpiryRow`
  - stable source identity, customer/subscription/resource context, expiry date, days remaining, provenance/freshness
- `PortfolioCustomerSummary`
  - `availableCompanies`, `subscriptions`, `readySubscriptions`, `cloudAccounts`
- `PortfolioBudgetSummary`
  - `totalBudgets`, `overBudget`, `atRisk`, `forecastOverBudget`
- `PortfolioSowSummary`
  - `totalIssued`, `unapproved`, `approved`, `issuedThisMonth`
- `PortfolioMonthEndSummary`
  - `customersInScope`, `complete`, `incomplete`, `unavailable`
- `PortfolioExpirySummary`
  - `total`, `expired`, `expiringWithin30Days`, `expiringWithin90Days`
- Paged response types for budgets, SOWs, month-end reporting, and expiries that include the relevant summary, `PortfolioCoverage`, `totalRows`, and opaque page/cursor metadata.

Summary contracts are aggregates over the full resolved dataset before row pagination. Status/kind facets are calculated before the corresponding row filter; required period/window, customer scope, search, and date constraints remain part of the summary dataset.

Query contracts include closed, endpoint-specific sort-field unions plus sort direction. This prevents the UI and API from silently accepting columns that can only be sorted within the currently loaded page.

## Tasks (Sequential)

1. Add portfolio domain contracts
   Files: `src/portfolio/portfolioOperations.ts`, tests/type assertions.
   Action: Define hierarchy-derived company coverage, money, budget, SOW approval, month-end, expiry, summary-facet, query, and paged-response contracts. Use closed unions and document derived versus persisted and pre-pagination fields.
   Verify: focused TypeScript compile/type tests and package lint.
   Done: Contracts represent every parent-spec endpoint without `unknown`, arbitrary status strings, or storage paths.

2. Wire public exports and compatibility checks
   Files: `src/portfolio/index.ts`, `src/index.ts`, generated declaration output if committed by repo convention.
   Action: Export the new domain additively and verify existing public exports remain unchanged.
   Verify: package build plus API/UI consumer typecheck against the local package version.
   Done: New imports resolve from `@spottoai/types-package` and existing imports still compile.

3. Validate contract invariants and documentation
   Files: type tests, `specs/portfolio/msp-portfolio-operations-types.md`, package docs only if required.
   Action: Add representative complete/partial responses, mixed-currency rows, approval states, optional approval dates, and all expiry discriminants to contract tests or fixtures.
   Verify: `npm run lint`, `npm run build`, and repo-standard tests.
   Done: Happy, boundary, and backward-compatibility evidence is captured.

## Goal-Backward Must-Haves

Truths:

- No portfolio monetary amount exists without a currency.
- Missing coverage is distinguishable from a genuine zero/empty result.
- Persisted SOWs expose approved/unapproved separately from their generated/issued date.
- Month-end completion is tied to an exact machine-readable period.
- Every expiry row identifies its normalized kind and original source.
- Every list response carries a typed, full-scope summary that cannot be confused with current-page counts.

Artifacts:

- `src/portfolio/portfolioOperations.ts` — public domain contracts.
- `src/portfolio/index.ts` — domain exports.
- `src/index.ts` — package export wiring.

Key Links:

- Shared DTOs -> API response schemas -> UI clients/models.
- Existing Azure source types -> API normalization -> portfolio DTOs.

## Test Strategy

- Compile-time: closed union exhaustiveness and request/response assignments.
- Compatibility: existing package consumers and root exports.
- Boundary fixtures: partial coverage, missing money, mixed currencies, expired dates, legacy unapproved SOWs, approved SOWs with and without optional dates, empty summaries, and summary counts that exceed the loaded page.
- Coverage target: 80% where runtime validation/helpers are added; otherwise compile/build evidence.

## Plan Iteration Notes

- Iteration 1 (2026-07-22): after inspecting fetched `origin/main` `98ba58e`, aligned the plan with the existing shared generated-report persistence contract and replaced accepted/pending lifecycle types with approved/unapproved metadata plus optional approval audit dates.
- Iteration 2 (2026-07-22): added explicit per-page summary contracts and full-result paging metadata so the UI's four top cards are typed API aggregates rather than current-page calculations.
- Iteration 3 (2026-07-22): added and exported the `portfolio` domain with preferences, coverage, customer, budget, SOW, month-end, expiry, summary, sorting, and paged response contracts. The local package build and downstream consumer typechecks pass; publication and dependency lock updates remain a coordinated release step.
- Iteration 4 (2026-07-23): removed personal preference and selected/managed fields. Customer rows now represent read-only authorized hierarchy descendants, and their summary reports companies, subscriptions, ready subscriptions, and cloud accounts.

## Definition of Done (DoD)

### Feature Criteria

- All approved portfolio operations have shared exported contracts.
- API and UI no longer need duplicate endpoint DTO definitions.

### Completion Checklist

- [x] Type/build validation covers the additive contract surface
- [x] Package validated through local API and UI consumer typecheck
- [x] Code quality review completed
- [x] Docs repo update N/A: compile-time internal contracts
- [x] MCP update N/A: no MCP surface
- [x] Swagger updated by API repo, not this repo
- [x] Demo data update N/A: no runtime behavior

### Implementation Evidence

- `src/portfolio/portfolioOperations.ts` and `src/portfolio/index.ts` are exported from the package root.
- `npm run build` passes.
- API and portal typechecks pass against the additive declarations.
- Release ordering is intentional: publish the shared package before updating API/UI dependency versions and lockfiles.

## Risks and Mitigations

- Risk: contracts mirror storage too closely and become hard to evolve.
  Mitigation: expose normalized public DTOs and keep storage entities API-internal.
- Risk: broad root exports create naming collisions.
  Mitigation: use `Portfolio*` prefixes and verify package build before downstream adoption.
- Risk: approval fields become optional in contradictory combinations.
  Mitigation: use discriminated unions where practical and document API validation invariants.

## Rollback / Feature Flag

- Contracts are additive. Rollback consumers first, then remove unused exports in a coordinated package release.

## Security Considerations

- Public contracts exclude blob paths, internal table keys, raw authorization records, and sensitive storage diagnostics.
- Failure entries expose safe reason codes rather than internal exception text.

## Runtime Environment

- Start: N/A; compile-time package.
- Env vars: none.
- Tests: repo-standard lint, build, test, and downstream typecheck commands.

## References

- `core/specs/portfolio/msp-portfolio-operations.md`
- `types-package/AGENTS.md`
- `types-package/src/azure/budgets.ts`
- `types-package/src/azure/commitmentsPlanning.ts`
- `types-package/src/azure/serviceRetirement.ts`
- `types-package/src/common/pagination.ts`
