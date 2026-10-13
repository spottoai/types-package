# Report resource-type spend totals

Status: verified locally; release and downstream adoption pending
Last updated: 2026-10-13
Repo: types-package
Approval: Jay approved the generic resource-type spend contract in chat and requested types-package first.

## Outcome and scope

Extend each existing `ReportSpendPeriod` with optional `resourceTypes: ReportBoundedRows<ReportSpendResourceType>`.
Each row contains `resourceType` and existing `ReportSpendAmounts`. Period, subscription scope and currency come from the containing spend projection; basis, provenance and availability remain explicit in the amounts.

This is the first implementation slice for SDM snapshot totals. Engine aggregation, API/package adoption, UI/Word rendering, regeneration of evidence packs and per-snapshot line items are follow-up work.

## Contract decisions

- Resource types are open provider identifiers, not a snapshot enum or a service-specific DTO. Keys must be nonempty, trimmed and unique without regard to case.
- Each row covers the entire type's accepted billing/estimate population for the containing period, including resources no longer present in current inventory. Producers calculate totals before bounding the type catalogue.
- A maximum of 100 type rows is retained per period, with safe-integer total/omitted counts and exact reconciliation. Omitted types do not reduce the amount of any retained type or the period headline. An absent type or catalogue is unavailable evidence, not a proved zero.
- Reuse exact decimal-string money, independent billed/amortized bases, billing-backed/estimated components, explicit coverage, currency and observation validation. Type rows use the containing period's estimate lens.
- Type rows are an alternative breakdown of the same period spend. Never add them to service rows or the headline. Unclassified charges can remain outside this catalogue, so its sum need not equal the headline.
- Signed credits and proved zero amounts remain valid. Estimates need provenance; retail benchmarks remain separate.

Alternatives considered: a snapshot-specific total would force contract changes for each new resource type; summing current inventory would lose deleted-resource charges. The generic period breakdown follows the existing services catalogue.

## Tasks and verification

1. Add runtime contract cases to `scripts/check-report-spend-contracts.mjs` and verify the existing validator rejects the new valid payload before implementation.
2. Extend `src/azure/reportSpend.ts` and `reportSpendValidation.ts`; add compile-time usage/rejection examples in `reportSpend.contracts.spec.ts`. Verify old payloads and new CJS/ESM/enclosing-pack payloads.
3. Wire the spend checks into `npm test`, document the contract in README, and run build/type-contract checks, full package tests, and affected-file lint/format checks.

Definition of done: valid generic totals round-trip through built exports and enclosing evidence-pack validation; invalid keys, duplicates, money, currency, lenses, estimates, coverage and bounded counts are rejected; legacy omission remains valid; full package tests pass.

## Risks and rollout

Earlier exact validators reject newly emitted period fields. Release and adopt the updated package in readers (API, UI/reportworker) before the engine emits `resourceTypes`; then regenerate evidence packs. This slice does not publish a package or claim the UI displays totals. Rollback producer emission by omitting the optional catalogue. No new storage access, permissions, dependencies or monetary aggregation helpers belong in this package.

## Evidence

- Test-first: legacy projection accepted, new catalogue rejected before implementation; built runtime script failed at the new snapshot subtotal case.
- Review follow-up: unsafe catalogue counts reproduced and rejected by a failing regression before adding safe-integer guards.
- `node scripts/check-report-spend-contracts.mjs`: passed, including 60 monetary/projection rejection cases, legacy compatibility, CJS/ESM and enclosing-pack validation.
- Targeted ESLint and Prettier checks: passed. Relevant source/documentation `git diff --check`: passed.
- Independent read-only review: no Critical or Important findings; the minor count issue was fixed and re-reviewed, with no remaining findings.
- Input/security review: bounded rows/text, shared decimal validation and strict row fields; no new I/O, credentials, permissions or dependencies. No new security findings.
- `npm test`: passed (exit 0), including fresh CJS/ESM build, compile-time contract checks, the complete package contract suite, packed Node 24 ESM/CommonJS consumer fixtures and regulatory-scoreboard checks.
- The packed-consumer npm install completed successfully after an unusually slow local run. A redundant isolated diagnostic install was stopped once the canonical install succeeded.
- Package publication, engine/API/UI adoption and report regeneration remain follow-up work.
