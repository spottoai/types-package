# Microsoft 365 usage, profile and storage evidence contracts

Status: initial usage contracts released as 1.1.36 and adopted; summary/accounts extension in progress locally, next publication pending
Approved: Yes for types-package implementation — Jay requested "update the types-package then" on 2026-10-13.
Last updated: 2026-10-13
Owner: Platform
Parent: [Microsoft 365 license improvements](../../../core/specs/licensing/microsoft-365-license-optimization/microsoft-365-improvements.md)

## Scope and compatibility

Extend the existing v1 license artifact/view/pricing/history contracts without changing required fields on older payloads. Append `mailboxUsage`, `oneDriveUsage` and `officeActiveUserCounts` to both source lists in that order, widen the report period with `D180`, and accept `performed` / `identities_concealed` correlation. Later sources stay optional. No Graph collection, joins, business calculations, rules version change, tenant writes or publication run in this package task.

`src/accounts/microsoft365Usage.ts` owns dependency-free usage/profile/breakdown contracts and guards, exported from the root. `microsoft365Licenses.ts` adds account profile, user type, creation date, sign-in status, joined usage, product usage, full-population summary, insight evidence/blocks, blocked account count, review pricing and currency breakdowns. `microsoft365LicenseHistory.ts` adds aggregate usage and lower-case product counts to stored and API months.

Missing evidence remains null or unknown; genuine zero and false remain valid. All additions on existing payloads are optional. Derived counts may exceed the 2,000 retained account rows. Money remains monthly list-price estimates in the containing currency, excluding tax; no Office activity is a review figure, never reclaim. Storage-blocked findings are informational and excluded from downgrade candidates and savings by the engine.

## Summary/accounts revision (2026-10-13)

The approved parent now replaces portal byte trimming with two documents. `Microsoft365LicenseSummaryView` (`microsoft-365-license-summary/v1`) contains full-population aggregates, aggregate insight patterns, capability catalogue/summary and all pricing currencies, excluding person rows, findings, notices, account pricing maps and raw report tables. `Microsoft365LicenseAccountsView` (`microsoft-365-license-accounts/v1`) contains up to 5,000 person rows and their findings/notices, with optional API-selected person pricing.

Both documents require the same `generatedAt` and `tenantSyncRunId`. Their `accountDetails` carries observed, returned and omitted row counts. Runtime guards independently validate the summary privacy boundary and person references. The old inline view remains readable with its existing 2,000-row guard. No new version number is assigned manually; this extension requires another package release before registry consumers can deploy it.

Ruling: retain the existing supported bounds of 2,000 distinct products and 32 renewals per product in the new summary validator. The engine must reject unsupported output rather than trim it. Cost if wrong: an unusually broad catalogue or subscription history could prevent publication until these contract bounds are expanded; no summary data may be silently dropped.

Concealed reports may expose `usage.anonymousWorkloads`, explicitly labelled `report_rows`, without claiming a join to enabled licensed people. Independent sign-in minima identify their observed licensed-account basis when exact assignment membership is unavailable. Person workload dates are preserved; the legacy omission note remains accepted only for compatibility.

API readers must match both scan stamps before serving accounts, refuse stale pairs without people, and adapt old inline views only when a split accounts file is absent. Overview, Licenses, Word report, AI summary and history use aggregates. Person screens and CSV load accounts separately. History keeps its existing aggregate-only shape.

## Initial 1.1.36 contract decisions (legacy view)

- `Microsoft365AccountUsage.workloads` is optional as well as nullable, allowing the engine byte guard to omit workload dates before account rows. `coverage.users.notes` can record `workload_dates_omitted_for_size`; the UI translates that code into explanatory copy.
- Summary/product usage counts are calculated by the engine over the complete population before detail trimming. Guards never compare these totals with the retained account list.
- Breakdown arrays accept at most 27 rows: 25 ranked groups plus the retained Not Set and synthetic Other rows. String keys/labels are bounded; keys are lower-case. Sorting, grouping and remainder sums remain engine-owned.
- Report dates must be real `yyyy-mm-dd` calendar dates. The optional daily series allows at most 180 unique dates in ascending order. Missing source blocks are nullable independently; sign-in counts need no Reports permission.
- New history aggregates use exact field allowlists, including their nested blocks and per-product values, to prevent profile/account data being stored there. History envelopes reject extra fields, pricing rejects breakdowns and per-account fields, and old months without usage still validate.
- New enum guards require primitive strings rather than coercing untrusted arrays or objects.

## Implementation and verification plan

1. Add fail-first runtime tests against built CJS/ESM guards for new sources, correlation, malformed profile/usage/insight/pricing fields and history privacy. Done: tests fail on the baseline for missing new validation.
2. Add/export the usage contracts and extend existing interfaces/guards. Verify legacy omission, nullable unknowns, genuine zero, full-population counts and new collection bounds. Done: focused contract checks pass.
3. Wire the runtime script into `npm test`; add a packed consumer fixture compiling new and legacy-compatible contracts in NodeNext and CommonJS, including negative compile-time assertions for excluded history fields. Verify real packed CJS/ESM imports. Done: full package tests and packed consumer compile/runtime checks pass.
4. Review bugs, security/privacy, quality, performance, tests and architecture; run package lint, full `npm test`, formatting checks and diff checks. Record commands and any gaps before handoff. Done: six review passes completed; the enum-coercion finding was fixed and its regression passes. Task lint/format/diff checks pass; unrelated repository lint failure remains outstanding.

## Consumer handoff and rollback

Publish through the established release workflow; do not manually bump the patch version. API and UI readers must adopt the released validators before the engine emits new correlation values or D180 coverage. Cloud-engine then adopts the same release and implements collection/joins/rollups, storage-gated rules, history projection and size trimming. Its checkpoint endpoint restart is an engine change.

API history explicitly selects month fields, so it must pass through `usage` and `productUsage`; AI summary/Word report exposure and demo generation are separate consumer tasks. API/UI/MCP endpoints and public product documentation are unchanged by this contract-only task. Consumer rollback may use old payloads with new validators; old validators cannot read newly emitted correlation values, so restore old artifacts before rolling readers back.

Widening `Microsoft365SourceName` also requires extending exhaustive source maps when adopting the release: cloud-engine's collector `SOURCES`, API's `services/AI/tools/internal/toolHandlers/microsoft365LicenseToolHandlers.ts` source labels, and UI's `libs/reporting/src/reports/microsoft365Licenses/microsoft365LicensesReportPresentation.ts` labels. Existing pinned consumer releases remain unchanged in this task.

## Initial contract verification evidence

Fresh verification on 2026-10-13:

- `npm run build`: CJS, ESM and contract typechecking pass.
- `check:microsoft365-license-contracts`: 20 runtime tests pass, covering both module formats. The baseline failed 12 tests; the additional enum-coercion regressions failed in both formats before the fix.
- `npx eslint src/accounts/microsoft365Licenses.ts src/accounts/microsoft365LicenseHistory.ts src/accounts/microsoft365Usage.ts`: passes.
- Targeted Prettier checks, the packed TypeScript fixture formatting check and task-source `git diff --check`: pass.
- Independent reviews of bugs, security/privacy, quality, performance, tests and architecture: completed; the one shared enum-coercion finding is resolved. No remaining task-scoped findings. Validation is bounded and linear with no I/O or dependency additions.
- `npm run lint`: fails outside this task at `src/common/resourceArtifactUsage.ts:398`, `no-control-regex`, in concurrently edited resource-artifact code. That work is left untouched.
- Full `npm test`, including packing/installing the package and consumer compile/runtime verification: passes. The M365 packed fixture compiles in NodeNext and CommonJS; both packed runtime import modes accept unknown usage, reject enum arrays and invalid calendar dates, and expose the appended report source. All remaining package contract checks pass.

| Close-down item | Status | Evidence or rationale |
| --- | --- | --- |
| AI review, security/privacy, performance, modularity | Done | Six review areas completed; enum finding fixed and verified; no remaining task findings. |
| Build, runtime contracts, packed integration | Done | Full `npm test` passes, including 20 M365 checks and packed consumer declarations/runtime imports. |
| Task lint, formatting, diff checks | Done | Changed M365 source lint and targeted formatting/diff checks pass. |
| Repository lint gate | Outstanding | Concurrent resource-artifact code fails `no-control-regex` at the recorded line; unchanged by this task. |
| Contract docs and consumer handoff | Done | README and this spec cover shapes, privacy, bounds, rollout and exhaustive source maps. |
| API/UI/engine/MCP behavior, Swagger, demo, live tenant checks | N/A | No consumer implementation, endpoints, permissions or product flows changed; these remain adoption work. |
| Registry publication, commit/push/PR | N/A | Not requested; no patch bump, publication or git delivery action performed. |

The evidence above belongs to the initial usage extension, subsequently released as 1.1.36. It does not certify the newer summary/accounts extension. Fresh split-contract and packed-consumer results are recorded during its implementation; publication and live consented-tenant validation remain separate rollout steps.

## Split-contract verification

- Full `npm test` passes on the split-contract tree, including 32 M365 CJS/ESM runtime checks and the packed NodeNext/CommonJS consumer fixture with summary privacy checks and 5,000-person declarations.
- Whole-package `npm run lint`, targeted changed-source ESLint and scoped whitespace checks pass. The historical lint blocker above no longer applies to this tree.
- Engine, API and UI were installed from the verified local tarball using no-save/no-lock installs. Registry manifests stay unchanged; this is local consumer verification, not evidence of a new published release.
- Independent consumer review and broad consumer gates are recorded in the engine implementation ledger. Publication of the extension remains outstanding.
