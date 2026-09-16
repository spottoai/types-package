## Metadata

Status: implemented and verified
Approved: Yes (user instruction on 2026-09-11: "can we move onto the types-package first?")
Iterations: 3
Last updated: 2026-09-11
Repo: types-package
Domain: reporting
Parent spec: `../../../core/specs/reporting/reporting-summary-pack.md`
Spec location: `types-package/specs/reporting/report-evidence-pack-types-package.md`

## Summary

Define the shared TypeScript contracts for the compact report artifacts already produced by cloud-engine: the current subscription evidence pack, rolling subscription comparison history, and aggregate tenant identity evidence. These contracts become the boundary used by the API and UI migrations.

## Scope

In scope:

- Export unversioned DTOs for the subscription pack, subscription history, and tenant pack.
- Define reusable bounded-row, recommendation, portfolio, savings, inventory, source-coverage, and identity summary types.
- Add dependency-free runtime guards for storage/API boundaries.
- Preserve additive section payloads that cloud-engine currently projects as open objects.
- Add compile-time and runtime contract verification and package exports.

Out of scope:

- Changing cloud-engine output.
- API storage readers or routes.
- UI report migration.
- AI report-analysis response DTOs.
- Publishing the prerelease or updating consumer lockfiles.

## Open Questions

- None blocking. Section payloads that cloud-engine currently declares as `unknown` remain open records; they can be narrowed when a consumer needs a stable field-level contract.

## Assumptions and Constraints

- [x] Cloud-engine producer structures and row limits are implemented and verified.
- [x] API and UI do not yet read these artifacts, so introducing the shared contract does not break a runtime consumer.
- [x] Storage paths remain producer-owned and are not exported from the shared package.
- Validators must have no runtime dependency and must accept additive fields.
- Existing unrelated worktree changes must remain untouched.

## Alternatives and Tradeoffs

- Copy every projected optional field into the shared contract: strongest autocomplete, but it would make currently open producer sections appear more stable than their cloud-engine types guarantee.
- Publish envelope-only DTOs: small, but leaves the recommendation, savings, history, and bounded-row fields needed by the reports untyped.
- Chosen: strongly type the stable report data and use open records for producer sections that are still declared as `unknown`.

## Decision

Add a focused `azure/reportEvidence` contract family without schema versions or version suffixes. Runtime guards identify each artifact from its required structure and validate scope, required statistics, bounded-row arithmetic and limits, history retention, recommendation fingerprints, tenant MFA reconciliation, and declared optional fields while allowing additive object fields.

## Approach

- Reuse existing Azure savings-basis and tenant MFA status vocabulary.
- Keep DTO and dependency-free validation code together so CommonJS and ESM builds expose the same boundary.
- Export through the existing root barrel; do not add a new package subpath until a consumer requires one.
- Add a built-artifact check to the normal package test command.

## Tasks

1. Define the DTOs and shared row-limit constants in `src/azure/reportEvidence.ts`.
2. Add runtime guards for all three stored artifacts and boundary invariants.
3. Add compile-time contract cases and built-artifact runtime checks.
4. Export the contract, update package documentation, and run the full package quality commands.

## Test Strategy

- Compile-time: valid producer-shaped DTOs compile; incorrect history metrics and tenant enforcement keys fail.
- Runtime: accept valid minimum and representative artifacts; reject invalid declared optional fields, inconsistent omission counts, row-limit overflow, malformed history retention, resolved-count metric corruption, and unreconciled MFA totals.
- Package: build both module formats, typecheck all contract fixtures, run the complete package checks, lint, and format validation.

## Definition of Done

- [x] All three artifact DTOs and shared limits are exported from the root package without version suffixes.
- [x] Runtime guards enforce documented field types, bounds, and aggregate invariants.
- [x] Compile-time and built-output contract checks pass.
- [x] `npm test` passes; all reporting files pass focused ESLint and Prettier checks.
- [x] Parent and repo specifications describe the implemented contract accurately.

## Risks and Mitigations

- Contract drift from cloud-engine → keep stable producer interfaces aligned and add representative producer-shaped checks.
- Validators reject additive fields → validate required invariants without exact-key allowlists.
- Weak open sections imply more certainty than exists → expose them explicitly as open projection records.
- A runtime guard accepts oversized content → validate every bounded-row object reachable from the reporting projection with the correct 50/90 limits.

## Runtime Environment

- Node and TypeScript versions are controlled by the repository lockfile and CI.
- Build: `npm run build`.
- Quality commands: `npm test`, `npm run lint`, and `npm run format:check`.

## Verification Evidence

- `npm test` passed on 2026-09-11, including TypeScript compilation, CommonJS
  and ESM builds, compile-time contract fixtures, the report runtime corpus, and
  packed Node 24 consumer checks.
- A current cloud-engine EROAD subscription artifact built from the sample
  storage tree passed `isSubscriptionReportEvidencePack`; an older stored
  sample lacking the required reporting projection was correctly rejected.
- Current cloud-engine history and tenant builder outputs passed their shared
  runtime guards.
- Focused ESLint and Prettier checks passed for every added reporting source,
  fixture, and script.
- Repository-wide `npm run lint` remains blocked by the pre-existing
  `no-control-regex` error in `src/environment/validation.ts:111`.
- Repository-wide `npm run format:check` remains blocked by 220 pre-existing
  formatting findings, including checked-in generated `.js` and `.d.ts` files;
  no reporting file appears in that finding set.

## Plan Iteration Notes

- Iteration 1 approved the exact shared producer boundary and kept API, UI, AI,
  storage, and publishing changes out of scope.
- Iteration 2 records the implemented DTOs and guards, producer compatibility
  probes, package tests, and the unrelated repository-wide quality-tool debt.
- Iteration 3 removes unreleased schema versions and version suffixes, and adds
  rejection coverage for invalid optional governance `generatedAt` and
  `coverage` values.

## Production parity correction — approved 2026-09-12

User approval: "proceed - make the proposed changes" covers additive shared reporting contracts, producer and consumer fixes. Add a bounded compact recommendation catalogue (up to 2,000 definitions, two resource examples each), complete aggregated compliance assessments (up to 2,000 controls), and daily activity population statistics (up to 400 days). Existing 90-row recommendations remain the small overview sample. Missing new fields identify old artifacts; readers must not treat truncated old samples as complete. No schema version is introduced. Validate counts, dates, caps and optional compatibility; build and exercise the packed package in downstream tests before release. Publishing remains a separate final action after reviewable validation.

Optional `reportingTextTruncated` identifies recommendation editorial inputs that exceed the producer's text bounds. Consumers use the source title for these rows rather than inferring a theme from clipped context. Optional security assessment summaries preserve complete status counts; Secure Score evidence retains availability, observation and denominator fields in current and historical projections.

Final correction validation: package build, full `npm test` (including packed consumer checks) and full `npm run lint` pass on 2026-09-12. This supersedes the earlier lint-blocker status above. Cross-repository evidence and outstanding release gates are recorded in [reporting parity verification](../../../core/specs/reporting/reporting-parity-verification-2026-09-12.md).

## Global Administrator sign-in contract completion — approved 2026-09-16

Approval: the user requested the types-package follow-up for typed Global Administrator sign-in coverage and verification of the emitted data. This iteration is additive and does not publish a package or alter stored schema versions.

Open questions: no blocking contract choice remains. Live Microsoft Graph permission/licensing availability varies by tenant and cannot be inferred from an absent date.

Assumptions and constraints: the cloud-engine producer already emits `coverage.userSignInActivity` and only `lastSuccessfulSignInDateTime` as a last login; the UI now displays only `lastSignInEvidence: last-successful-sign-in`. Existing artifacts without these optional fields remain valid. Historical comparison identities still require configured history storage and complete governance evidence for each period; this contract change does not backfill them.

Alternatives and tradeoffs: duplicating a UI-only sign-in type would preserve the shared contract gap; making the new fields required would reject older stored artifacts. Decision: add optional sign-in coverage and principal evidence to the shared governance contract, retain optional compact-pack fields, and verify the runtime guard's success/unavailable cases.

Deferred ideas: new Graph requests, historical sign-in backfill, history-storage configuration changes, and publishing/consumer lockfile updates.

Tasks and verification:

1. Add optional `userSignInActivity` and successful-sign-in evidence to shared governance DTOs; keep compact tenant coverage explicitly typed. Verify contract fixtures compile.
2. Extend built-artifact runtime tests for complete, unavailable, and invalid sign-in evidence. Verify older packs still pass.
3. Verify current cloud-engine collection and compact-pack projection tests, plus UI successful-login mapping, without adding storage or Graph requests. Run package build, focused contract test, lint and formatting checks; record blockers and downstream publish state.

Verification on 2026-09-16: `npm test` passed with the report-evidence contract check included in the standard suite; `npm run lint`, contract typechecking, and changed-file formatting passed. The cloud-engine Global Administrator collector suite passed (14 tests), and the UI report projection/demo-artifact suites passed (21 tests). A transient generated-output race and a concurrent scheduler assertion failed earlier attempts but did not reproduce in the final suite. Publishing and consumer installation remain separate; historical identity deltas still depend on configured history storage and complete per-period governance evidence.
