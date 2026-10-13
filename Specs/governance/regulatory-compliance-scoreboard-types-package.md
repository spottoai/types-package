# Repo Spec - Regulatory Compliance Scoreboard Shared Contracts

## Metadata

Status: In progress
Approved: Yes
Approved by: User, 2026-10-03 — "proceed - implement the changes"; remaining live checks gate release.
Iterations: 3
Last updated: 2026-10-04
Owner: Shared Contracts
Repo: types-package
Domain: governance
Parent spec: [`core/specs/governance/regulatory-compliance-scoreboard.md`](../../../core/specs/governance/regulatory-compliance-scoreboard.md)
Spec location: `types-package/Specs/governance/regulatory-compliance-scoreboard-types-package.md`
Sibling specs: cloud-engine, api, ui and ui reporting children listed in the parent

## Summary

This spec adds the shared contracts for the company-wide regulatory compliance scoreboard. It also adds one shared, dependency-free implementation of the parent's merge rules, so cloud-engine, api and ui stop maintaining three copies of them.

Deliverables:

- a new types module, `src/azure/regulatoryComplianceScoreboard.ts`;
- a pure merge module, `src/azure/regulatoryComplianceScoreboardMerge.ts`;
- a runtime guard module, `src/azure/regulatoryComplianceScoreboardValidation.ts`;
- the optional scoreboard on the report evidence pack, plus failing-control identities and their comparison basis on reporting history.

Decisions, normative rules and endpoint behaviour are owned by the parent, including its "Resolved in iteration 2" section. This spec only fixes their exact TypeScript.

## Scope (Repo-Specific)

In scope:

- Every contract the parent lists under Cross-Repo Contracts. That covers the per-subscription file, history, company scoreboard, standard detail, coverage, management group nodes and expected-standard gaps.
- The iteration-3 additions: original `trendInputs` (requested with `trendControlKeys`), resource lower-bound flags, all assignment evidence links, source/control-universe basis, the company catalog and exemption-coverage gaps.
- A history path constant and builders.
- Pure merge functions plus shared test vectors.
- Runtime guards for the portal file and the history file.
- `ReportGovernanceProjection.regulatoryScoreboard` and `ReportHistoryComparisonIdentities.regulatoryFailingControlKeys` and `regulatoryComparisonBasis`, with the matching validator changes.

Out of scope:

- SDM figures and comparison signals. Per the parent, these stay in ui `libs/reporting`.
- The Azure Policy and Defender per-subscription outcome derivation. Only cloud-engine applies it, so it stays there.
- Control-key normalisation, which cloud-engine owns.
- API query parsing, authorisation and Swagger.

## Deferred Ideas

- Move the merge module to the planned shared utilities package once it exists. The exports would stay re-exported from here for one release.

## Success Criteria (Repo)

1. cloud-engine, api and ui compile against one exported definition of every scoreboard shape, with no local redeclarations.
2. api (company merge) and ui (hierarchy merge) call the same `mergeRegulatoryScoreboardStandards`, `mergeRegulatoryScoreboardTrend` and `deriveControlOutcomeCounts`. All of the shared vectors pass against the built `dist`.
3. Evidence packs and history without the new fields still validate. Present-but-malformed fields fail validation.
4. After the parent live collection gate passes, one published, non-prerelease version contains all of this. Consumers pin that exact version.

## Assumptions and Constraints (Post-Recon)

- [x] types-package already ships small pure runtime code. Examples: `applyNativeDiscountMinorUnits` and friends (`nativeDiscount.ts`), `buildBillingAnalyzerInputObservationPointerPath`, and the `*Validation.ts` guards. These are checked against `dist` by `scripts/check-*.mjs`. (validated)
- [x] Consumers import runtime values from the root entry:
  - api: `services/CloudResource/NativeDiscountProjection.ts`;
  - cloud-engine: `REGULATORY_COMPLIANCE_PORTAL_FILE` in `RegulatoryComplianceReportBuilder.ts`;
  - ui: governance `regulatoryComplianceForms.ts`.

  `sideEffects: false` keeps them tree-shakable. (validated)

- [x] The existing subscription history is a raw file in `azure-raw`. cloud-engine writes `history/subscriptions/month_{year}-{month}.json` through `updateRawSubscriptionFileWithRetry`, relative to `/subscriptions/{subscriptionId}/`. api reads `subscriptions/{id}/history/subscriptions/month_YYYY-MM.json` (`AzureResourceService.HISTORY_*`). Raw `.json.gz` files are already used (`saveRawTenantFile("billing/partner-customer/status.json.gz")`). (validated)
- [x] `ReportGovernanceProjection` is `reporting.governance`, and `ReportHistoryComparisonIdentities` is `SubscriptionReportHistoryPeriod.comparisonIdentities`, both in `src/azure/reportEvidence.ts`. Both are runtime-validated in `src/azure/reportEvidenceValidation.ts` (`isGovernance`, `isHistoryComparisonIdentities`). (validated)
- [x] ui's `ScopedSubscriptionCoverageList` states are `notScanned | unavailable | partial | noAccess | accessUnknown`. `accessUnknown` only arises from the ui's own per-owner access check during hierarchy fan-out, so it is not an API state. (validated)
- [x] Published version is `1.1.3`, following the existing `1.1.2` baseline. User publication and all three consumer registry locks/installed versions verified. `prerelease.yml` publishes to GitHub Packages and patch-bumps if the candidate version is already published.
- Constraint: `.agents/skills/types-package-architecture/SKILL.md` still says "compile-time only". That is already untrue (see above), and Task 5 corrects it.

## Cross-Repo Touchpoints

| Consumer                                      | Uses                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cloud-engine                                  | Writes `RegulatoryComplianceScoreboardSubscription` to `REGULATORY_COMPLIANCE_SCOREBOARD_PORTAL_FILE` and the history file via `buildRegulatoryScoreboardHistoryRelativePath`. Uses `deriveControlOutcomeCounts` for `counts`/`policyCounts`, and `mergeRegulatoryControlOutcome` to merge several assignments of one set in a subscription. Sets `failingResourceCountIsMinimum`. Adds `reporting.governance.regulatoryScoreboard` and `regulatoryFailingControlKeys` (via `toRegulatoryFailingControlIdentity`). Can self-check with `isRegulatoryComplianceScoreboardSubscription` before writing. |
| api                                           | Reads and guards files. Merges with `toMergeableRegulatoryScoreboardStandard`, `mergeRegulatoryScoreboardStandards`, `toRegulatoryScoreboardTrendSeries` and `mergeRegulatoryScoreboardTrend`. Returns `CompanyRegulatoryComplianceScoreboard` (including `catalog`) and `CompanyRegulatoryStandardDetail` (including `exemptionsUnavailableSubscriptionIds`).                                                                                                                                                                                                                                        |
| ui                                            | Consumes both responses. Hierarchy merge reuses `mergeRegulatoryScoreboardStandards` and `mergeRegulatoryScoreboardTrend` on per-company standards. Maps `RegulatoryScoreboardSubscriptionCoverage` to `ScopedSubscriptionCoverageItem`; every state except `loaded` maps 1:1. Manage Standards reads `catalog`.                                                                                                                                                                                                                                                                                      |
| ui `libs/reporting` (portal and reportworker) | Reads `regulatoryScoreboard` from evidence packs and `regulatoryFailingControlKeys` from history. Existing pack guards cover both.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Approach

### History path

- **Path.** As fixed by the parent ("Resolved in iteration 2"): container `azure-raw`, `subscriptions/{subscriptionId}/history/regulatory-compliance/month_{YYYY}-{MM}.json.gz`, with the subscription ID in lower case.
- **Relative constant.** The constant is the relative part, `history/regulatory-compliance/month_{year}-{month}.json.gz`. It uses the same placeholder style as cloud-engine's `SUBSCRIPTION_HISTORY_PATTERN`, so cloud-engine passes it straight to its raw-subscription-file methods.
- **Absolute builder.** It follows the `buildBillingAnalyzerInputObservationPointerPath` precedent for api. It validates the subscription ID and the month, and lower-cases the subscription ID, so the writer (cloud-engine) and the reader (api) always resolve the same path.
- **Gzip.** The file is gzipped because a month of per-day control-key lists can reach several hundred KB uncompressed.

### Merge code ships here (option a)

I recommend shipping the merge rules as pure functions in this package, plus vectors. JSON vectors alone (option b) are the weaker choice, for three reasons:

1. **Precedent.** The package already ships pure runtime helpers that api imports (native discount), and its build and `check:*` scripts already test runtime code against `dist`. Nothing new is needed in the build or in consumers.
2. **One implementation.** The parent requires the merge to be "implemented identically" in api (subscriptions) and ui (hierarchy). With option b, each repo keeps a copy and the copies drift. The edge cases are easy to get wrong: tie-break order, carry-forward, failed-minus-passed.
3. **Small surface.** The helpers are dependency-free, tree-shakable and runtime-neutral; there is no line-count target.

The vectors still live in `fixtures/` and run in this repo's `npm test`. Consumers test their own wiring, not the rules.

### Clarifications the shared functions fix

These clarify parent rules where the parent is silent. They do not change any decision.

- **Ordering.** Standards are sorted by `standardKey`, controls by `controlKey`, and subscription rows by `subscriptionId`, all with code-unit comparison (not locale).
- **Labels.** `displayName`, `domain`, `standardFamilyKey` and `definitionId` come from the first non-empty value, taking inputs in order of their lowest `subscriptionId`.
- **Overlapping inputs.** Overlapping subscription inputs are rejected, never silently skipped. Callers partition owner/chunk scope into disjoint subscription sets.
- **Merged control `failingResourceCount`.** Sum defined inputs; all-unknown stays absent. Unknown contributors or an input lower bound make a defined aggregate count a lower bound. Apply this to standard resource/exemption counts as well.
- **Trend emission and carry-forward.** Require an actual subscription snapshot/reset marker; carry forward only original observations for three days. Unavailable/not-reported markers reset immediately.
- **Trend total.** Total comes from the union of passed, failed and not-assessed keys, with failed and assessed precedence; differing unassessed control sets remain represented.
- **Failing-control identity.** `standardKey:controlKey` is opaque. It may contain more than one `:` (for example `defender:azure-cspm:ns-1`), so consumers compare it whole and never split it.

### Coverage states

The shared evidence classifier owns loaded/partial/unavailable semantics; the API handles missing files, read failures and budgets. Reporting calls the same classifier. `noAccess` is produced only by the ui hierarchy merge (parent, "Resolved in iteration 2"); the api never emits it.

## Contracts

### New module `src/azure/regulatoryComplianceScoreboard.ts`

```ts
import type { RegulatoryComplianceCoverageSection, RegulatoryExemptionSummary, RegulatoryStandardCatalogEntry } from './regulatoryCompliance';

// ---------- Versions, files, limits ----------

export const REGULATORY_COMPLIANCE_SCOREBOARD_SCHEMA_VERSION = '2026-10-03.regulatory-compliance-scoreboard-v1' as const;
/** Portal file per subscription (written with savePortalResource, like REGULATORY_COMPLIANCE_PORTAL_FILE). */
export const REGULATORY_COMPLIANCE_SCOREBOARD_PORTAL_FILE = 'regulatory-compliance-scoreboard.json.gz' as const;

export const REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_SCHEMA_VERSION = '2026-10-03.regulatory-compliance-scoreboard-history-v1' as const;
/**
 * Monthly history file, relative to the subscription's raw prefix in `azure-raw`
 * (`subscriptions/{subscriptionId}/`), same placeholder style as cloud-engine SUBSCRIPTION_HISTORY_PATTERN.
 */
export const REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_PATTERN = 'history/regulatory-compliance/month_{year}-{month}.json.gz' as const;
export const REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_RETENTION_MONTHS = 13 as const;

export const REGULATORY_SCOREBOARD_LIMITS = Object.freeze({
  standards: 200,
  controlsPerStandard: 2000,
  /** Azure allows six management group levels below the root. */
  managementGroupPathEntries: 7,
  subscriptionIdsPerRequest: 500,
  defaultTrendDays: 30,
  trendCarryForwardDays: 3,
  /** Expired exemptions returned by the standard detail when they expired within this many days. */
  expiredExemptionLookbackDays: 90,
} as const);

// ---------- Enumerations ----------

export const REGULATORY_CONTROL_OUTCOMES = ['passed', 'failed', 'notAssessed'] as const;
export type RegulatoryControlOutcome = (typeof REGULATORY_CONTROL_OUTCOMES)[number];

/** Array order is the merge tie-break order. */
export const REGULATORY_NOT_ASSESSED_REASONS = [
  'noPolicies',
  'manual',
  'microsoftResponsibility',
  'notEvaluated',
  'evaluationError',
  'skipped',
  'unsupported',
] as const;
export type RegulatoryNotAssessedReason = (typeof REGULATORY_NOT_ASSESSED_REASONS)[number];

export const REGULATORY_SCORE_SOURCES = ['defenderForCloud', 'azurePolicy'] as const;
export type RegulatoryScoreSource = (typeof REGULATORY_SCORE_SOURCES)[number];

// ---------- Per-subscription file (also reporting.governance.regulatoryScoreboard) ----------

export interface RegulatoryControlOutcomeCounts {
  passed: number;
  failed: number;
  notAssessed: number;
  /** passed + failed (headline denominator). */
  assessed: number;
  /** passed + failed + notAssessed. */
  total: number;
}

export interface RegulatoryScoreboardControl {
  /** Normalised native control id, or `policy:<group>` / `defender:<name>` when not normalisable. */
  controlKey: string;
  displayName: string;
  domain?: string;
  outcome: RegulatoryControlOutcome;
  /** Present only when outcome is `notAssessed`. */
  notAssessedReason?: RegulatoryNotAssessedReason;
  /** Policy-derived; absent when unknown (e.g. Defender-only control). */
  failingResourceCount?: number;
  /** `true` when `failingResourceCount` is a lower bound; present only with `failingResourceCount`. */
  failingResourceCountIsMinimum?: true;
  /** Every original assignment/control link; [] when no Policy evidence exists. */
  policyEvidence: RegulatoryScoreboardPolicyEvidence[];
}

export interface RegulatoryScoreboardStandard {
  /** Lower-case policy set definition GUID, or `defender:<lower-case name>`. */
  standardKey: string;
  standardFamilyKey: string;
  displayName: string;
  definitionId?: string;
  source: RegulatoryScoreSource;
  /** Digest of source, sorted control universe and normalisation version; excludes outcomes. */
  assessmentBasisKey: string;
  assignments: RegulatoryScoreboardAssignmentRef[];
  /** Must equal deriveControlOutcomeCounts(controls). */
  counts: RegulatoryControlOutcomeCounts;
  /** Policy-derived counts when source is `defenderForCloud`. */
  policyCounts?: RegulatoryControlOutcomeCounts;
  failingResourceCount?: number;
  failingResourceCountIsMinimum?: true;
  exemptResourceCount?: number;
  exemptResourceCountIsMinimum?: true;
  activeExemptionCount?: number;
  activeExemptionCountIsMinimum?: true;
  controls: RegulatoryScoreboardControl[];
}

export interface RegulatoryScoreboardAssignmentRef {
  assignmentKey: string;
  assignmentId: string;
  assignmentScope: string;
  inherited: boolean;
}
export interface RegulatoryScoreboardPolicyEvidence {
  assignmentKey: string;
  policyControlKey: string;
  outcome: RegulatoryControlOutcome;
  failingResourceCount?: number;
  failingResourceCountIsMinimum?: true;
}

export interface RegulatoryScoreboardComparisonBasisRow {
  subscriptionId: string;
  standardKey: string;
  source: RegulatoryScoreSource;
  assessmentBasisKey: string;
}

export interface RegulatoryManagementGroupRef {
  /** Management group ARM resource id as stamped by cloud-engine. */
  id: string;
  displayName: string;
}

export interface RegulatoryComplianceScoreboardCoverage {
  policy: RegulatoryComplianceCoverageSection;
  defender: RegulatoryComplianceCoverageSection;
}

export interface RegulatoryComplianceScoreboardSubscription {
  schemaVersion: typeof REGULATORY_COMPLIANCE_SCOREBOARD_SCHEMA_VERSION;
  subscriptionId: string;
  tenantId?: string;
  generatedAt: string;
  observedAt: string;
  /** Root -> direct parent; [] when unknown. */
  managementGroupPath: RegulatoryManagementGroupRef[];
  coverage: RegulatoryComplianceScoreboardCoverage;
  omittedStandardKeys: string[];
  standards: RegulatoryScoreboardStandard[];
}

// ---------- Monthly history ----------

export interface RegulatoryScoreboardHistoryStandard {
  standardKey: string;
  source: RegulatoryScoreSource;
  assessmentBasisKey: string;
  passedControlKeys: string[];
  failedControlKeys: string[];
  notAssessedControlKeys: string[];
}

export interface RegulatoryScoreboardHistoryDay {
  /** UTC date `YYYY-MM-DD`; unique per file; last write of the day wins. */
  date: string;
  observedAt: string;
  evidenceState: 'complete' | 'partial' | 'unavailable';
  omittedStandardKeys: string[];
  standards: RegulatoryScoreboardHistoryStandard[];
}

export interface RegulatoryComplianceScoreboardHistory {
  schemaVersion: typeof REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_SCHEMA_VERSION;
  subscriptionId: string;
  /** `YYYY-MM`, matches the file name. */
  month: string;
  /** Ascending by date. */
  days: RegulatoryScoreboardHistoryDay[];
}

// ---------- Company responses ----------

export interface RegulatoryScoreboardTrendPoint {
  date: string;
  state: 'complete' | 'partial' | 'unavailable';
  /** Absent when no usable original observation contributes. */
  counts?: RegulatoryControlOutcomeCounts;
  evidenceSubscriptionIds: string[];
  sources: RegulatoryScoreSource[];
  comparisonState: 'comparable' | 'basisChanged' | 'coverageChanged' | 'unavailable';
}
export type RegulatoryScoreboardTrendUnavailableReason =
  | 'notEnoughHistory'
  | 'historyUnavailable'
  | 'resourceBudgetExceeded'
  | 'missingOriginalInputs';
export type RegulatoryScoreboardTrendObservation = { date: string; observedAt: string } & (
  | { kind: 'observed'; evidenceState: 'complete' | 'partial'; standard: RegulatoryScoreboardHistoryStandard }
  | { kind: 'unavailable' | 'notReported' }
);
/** Original observations only; never reconstructed from company trend points. */
export interface RegulatoryScoreboardTrendSeries {
  subscriptionId: string;
  snapshots: RegulatoryScoreboardTrendObservation[];
}

/** `noAccess` is produced only by the ui hierarchy merge; the api never emits it. */
export type RegulatoryScoreboardSubscriptionCoverageState = 'loaded' | 'partial' | 'notScanned' | 'unavailable' | 'noAccess';

export interface RegulatoryScoreboardSubscriptionCoverage {
  /** Lower case. */
  subscriptionId: string;
  displayName?: string;
  state: RegulatoryScoreboardSubscriptionCoverageState;
  /** `loaded` and `partial` only. */
  generatedAt?: string;
  observedAt?: string;
  /** `partial` only: the sources whose coverage is incomplete. */
  partialSources?: RegulatoryScoreSource[];
  reasonCode?: 'evidenceUnavailable' | 'readDeadline' | 'resourceBudgetExceeded' | 'invalidArtifact';
}

export interface RegulatoryScoreboardStandardSubscription {
  subscriptionId: string;
  counts: RegulatoryControlOutcomeCounts;
  source: RegulatoryScoreSource;
  assessmentBasisKey: string;
  assignments: RegulatoryScoreboardAssignmentRef[];
  failingResourceCount?: number;
  failingResourceCountIsMinimum?: true;
}

/** A control merged across subscriptions; no per-subscription detail. */
export type RegulatoryScoreboardMergedControl = Omit<RegulatoryScoreboardControl, 'policyEvidence'>;

export interface CompanyRegulatoryScoreboardStandard {
  standardKey: string;
  standardFamilyKey: string;
  displayName: string;
  definitionId?: string;
  /** Subscriptions where the standard is assigned or reported. */
  subscriptionCount: number;
  /** In REGULATORY_SCORE_SOURCES order. */
  sources: RegulatoryScoreSource[];
  counts: RegulatoryControlOutcomeCounts;
  failingResourceCount?: number;
  failingResourceCountIsMinimum?: true;
  exemptResourceCount?: number;
  exemptResourceCountIsMinimum?: true;
  activeExemptionCount?: number;
  activeExemptionCountIsMinimum?: true;
  controls: RegulatoryScoreboardMergedControl[];
  subscriptions: RegulatoryScoreboardStandardSubscription[];
  /** Ascending by date; [] until history exists. */
  trend: RegulatoryScoreboardTrendPoint[];
  trendUnavailableReason?: RegulatoryScoreboardTrendUnavailableReason;
  /** Original subscription series; only with trendControlKeys=true. */
  trendInputs?: RegulatoryScoreboardTrendSeries[];
}

export interface RegulatoryScoreboardManagementGroupNode {
  id: string;
  displayName: string;
  /** Absent for a root. */
  parentId?: string;
  /** Direct child subscriptions in scope; descendants are derived by walking parentId. */
  subscriptionIds: string[];
}

export interface RegulatoryScoreboardExpectedStandardGap {
  standardFamilyKey: string;
  preferredDefinitionId?: string;
  displayName?: string;
  /** Loaded in-scope subscriptions that expect the family but have no standard of that family. */
  missingSubscriptionIds: string[];
}

/** GET /companies/{companyId}/regulatory-compliance/scoreboard */
export interface CompanyRegulatoryComplianceScoreboard {
  companyId: string;
  generatedAt: string;
  trendDays: number;
  subscriptionCoverage: RegulatoryScoreboardSubscriptionCoverage[];
  standards: CompanyRegulatoryScoreboardStandard[];
  managementGroups: RegulatoryScoreboardManagementGroupNode[];
  expectedStandardGaps: RegulatoryScoreboardExpectedStandardGap[];
  /** The derived standards catalog (for Manage Standards); source defined in the api spec. [] when unavailable. */
  catalog: RegulatoryStandardCatalogEntry[];
}

export interface RegulatoryScoreboardControlSubscriptionOutcome {
  subscriptionId: string;
  outcome: RegulatoryControlOutcome;
  notAssessedReason?: RegulatoryNotAssessedReason;
  failingResourceCount?: number;
  failingResourceCountIsMinimum?: true;
  policyEvidence: RegulatoryScoreboardPolicyEvidence[];
}

export interface CompanyRegulatoryStandardDetailControl extends RegulatoryScoreboardMergedControl {
  subscriptions: RegulatoryScoreboardControlSubscriptionOutcome[];
}

export interface RegulatoryScoreboardStandardExemption extends RegulatoryExemptionSummary {
  subscriptionId: string;
}

/** GET /companies/{companyId}/regulatory-compliance/scoreboard/standards/{standardKey} */
export interface CompanyRegulatoryStandardDetail {
  companyId: string;
  generatedAt: string;
  subscriptionCoverage: RegulatoryScoreboardSubscriptionCoverage[];
  standard: Omit<CompanyRegulatoryScoreboardStandard, 'controls' | 'trend' | 'trendInputs' | 'trendUnavailableReason'>;
  controls: CompanyRegulatoryStandardDetailControl[];
  managementGroups: RegulatoryScoreboardManagementGroupNode[];
  /** Active and expiring rows, plus rows expired within `expiredExemptionLookbackDays`, each with `lifecycleState`. */
  exemptions: RegulatoryScoreboardStandardExemption[];
  /** Contributing subscriptions whose exemption rows could not be read; sorted, [] when none. */
  exemptionsUnavailableSubscriptionIds: string[];
}
```

Note: the parent shows `schemaVersion: string`. Here it is narrowed to the literal, following the existing `RegulatoryComplianceReport.schemaVersion` pattern. This is additive and not a decision change.

### New module `src/azure/regulatoryComplianceScoreboardMerge.ts`

Implement these dependency-free exports using the normative algorithms below. The former executable example is removed: it carried aggregate observations forward and skipped overlapping aggregates, changing scores. The declarations specify signatures, not implementations.

```ts
export type RegulatoryScoreboardMergeableStandard = Omit<
  CompanyRegulatoryScoreboardStandard,
  'trend' | 'trendInputs' | 'trendUnavailableReason' | 'counts' | 'subscriptionCount'
>;
export type MergedRegulatoryScoreboardStandard = RegulatoryScoreboardMergeableStandard & {
  counts: RegulatoryControlOutcomeCounts;
  subscriptionCount: number;
};
export interface RegulatoryControlOutcomeInput {
  outcome: RegulatoryControlOutcome;
  notAssessedReason?: RegulatoryNotAssessedReason;
}
export interface RegulatoryScoreboardEvidenceClassification {
  state: 'loaded' | 'partial' | 'unavailable';
  absenceEstablished: boolean;
  partialSources: RegulatoryScoreSource[];
}
export declare function deriveControlOutcomeCounts(controls: readonly { outcome: RegulatoryControlOutcome }[]): RegulatoryControlOutcomeCounts;
export declare function mergeRegulatoryControlOutcome(inputs: readonly RegulatoryControlOutcomeInput[]): RegulatoryControlOutcomeInput;
export declare function mergeRegulatoryScoreboardControls(
  inputs: readonly (readonly RegulatoryScoreboardMergedControl[])[]
): RegulatoryScoreboardMergedControl[];
export declare function toMergeableRegulatoryScoreboardStandard(
  subscriptionId: string,
  standard: RegulatoryScoreboardStandard
): RegulatoryScoreboardMergeableStandard;
export declare function mergeRegulatoryScoreboardStandards(
  inputs: readonly RegulatoryScoreboardMergeableStandard[]
): MergedRegulatoryScoreboardStandard[];
export declare function classifyRegulatoryScoreboardEvidence(
  scoreboard: RegulatoryComplianceScoreboardSubscription
): RegulatoryScoreboardEvidenceClassification;
export declare function toRegulatoryScoreboardTrendSeries(
  histories: readonly RegulatoryComplianceScoreboardHistory[],
  standardKey: string
): RegulatoryScoreboardTrendSeries;
export declare function mergeRegulatoryScoreboardTrend(
  series: readonly RegulatoryScoreboardTrendSeries[],
  dates: readonly string[]
): RegulatoryScoreboardTrendPoint[];
export declare function listRegulatoryScoreboardTrendDates(endDate: string, days: number): string[];
export declare function buildRegulatoryScoreboardHistoryRelativePath(month: string): string;
export declare function buildRegulatoryScoreboardHistoryPath(subscriptionId: string, month: string): string;
export declare function toRegulatoryFailingControlIdentity(standardKey: string, controlKey: string): string;
```

**Standard/control merge:** preserve code-unit ordering and failed-over-passed precedence; recompute counts from the complete control-key union. Inputs must be disjoint by subscription ID. Reject overlap with `RegulatoryScoreboardOverlappingSubscriptionsError`; A+B merged with B+C must never silently lose C. Preserve each subscription's source, basis key and all assignments. Strip `policyEvidence` from aggregate controls, retaining it in detail subscription outcomes. Sum defined resource/exemption counts; an unknown contributor or input lower bound makes a defined aggregate count a lower bound. All-unknown stays absent. The majority/tie-break not-assessed reason can differ after aggregate merging; outcomes, counts, scope and sums cannot.

**Evidence classification:** `absenceEstablished` requires both source sections `complete`, no omitted standards, and zero standards. Non-empty fully scored standards are usable; any incomplete source/discovery or omitted standard makes coverage partial. An empty result without established absence is unavailable. `notCollected`, `stale`, partial and failed states never establish absence. API and reporting call this same helper; file absence/read failures are handled by callers.

**Original trend projection:** histories must belong to one matching subscription. Keep original observations from the displayed window plus three lookback days and sort by UTC date. An actual day with a standard => `observed`; unavailable day or omitted standard => `unavailable`; absent standard on a complete day => `notReported`; absent standard on a partial day => `unavailable`. Keep original observation time, source and basis. Repeated dates resolve by latest valid observation time. Missing days are distinct from actual reset markers.

**Trend merge:** reject duplicate subscription series. For dates with an actual original snapshot/marker, select each subscription's latest original snapshot within three UTC days. A latest unavailable/not-reported marker contributes no counts and blocks older observations. Union failed, then passed minus failed, then not-assessed minus assessed; derive all counts from those sets. No contributors => unavailable point without counts. Incomplete requested scope/partial observations => partial point. Compared with the previous usable point, changed contributing subscription IDs => `coverageChanged`; changed source/basis => `basisChanged`; otherwise `comparable`. No synthetic points from carry-forward alone. Lookback inputs establish comparison at the window boundary. An unavailable point always breaks the rendered segment.

**Hierarchy/chunks:** concatenate disjoint original `trendInputs` once and call the same merge; never convert aggregate `trend[]` points to input series. Flat, chunked and hierarchy results for identical original scope/date windows must match, including resets and comparison states.

**Dates/paths/identities:** validate GUIDs, month bounds and real calendar dates (February 30 is invalid); UTC arithmetic; lower-case subscription IDs; opaque identities are never split. The history guard enforces unique, mutually disjoint passed/failed/not-assessed key arrays.

### New module `src/azure/regulatoryComplianceScoreboardValidation.ts`

The guards are dependency-free and use `../common/validationHelpers`, following the `commitmentsPlanningValidation.ts` style.

- `isRegulatoryComplianceScoreboardSubscription(value: unknown): value is RegulatoryComplianceScoreboardSubscription`. It checks:
  - `schemaVersion` equals the constant;
  - `subscriptionId` is a GUID string;
  - `generatedAt` and `observedAt` are date-times;
  - `managementGroupPath` has at most `managementGroupPathEntries` entries, each `{id, displayName}` with non-empty strings;
  - `coverage.policy` and `coverage.defender` are records whose `state` is a `RegulatoryEvidenceState`;
  - there are at most `standards` standards, with unique non-empty `standardKey` values.

  For each standard:
  - `source` is in the enum;
  - present resource counts are non-negative integers; all minimum flags accompany counts, and unknown is absent;
  - there are at most `controlsPerStandard` controls, with unique `controlKey` values;
  - source/basis are valid, assignment keys are unique, and each policy-evidence link references an assignment in this standard;
  - omitted standard keys are unique, disjoint from scored standards and accompanied by incomplete-source diagnostics;
  - `outcome` is in the enum, and `notAssessedReason` is present only for `notAssessed` and is in the enum;
  - `failingResourceCountIsMinimum`, when present, is `true` and accompanies `failingResourceCount`;
  - `counts` deep-equals `deriveControlOutcomeCounts(controls)`;
  - `policyCounts`, when present, is internally consistent (`assessed = passed + failed`, `total = assessed + notAssessed`).

- `isRegulatoryComplianceScoreboardHistory(value: unknown): value is RegulatoryComplianceScoreboardHistory`. It checks:
  - the schema version;
  - `month` matches `YYYY-MM`;
  - `days` are ascending with unique `YYYY-MM-DD` dates inside `month`;
  - subscription/time/file month match; dates are real calendar dates; day/standard/omitted keys are unique;
  - each standard has a source/basis and mutually disjoint unique passed/failed/not-assessed arrays, whose union defines total;
  - unavailable days contain no scored standards; omitted standards cannot also be scored; limits apply before accepting arrays.

### Changes to `src/azure/reportEvidence.ts` and `src/azure/reportEvidenceValidation.ts`

```ts
import type { RegulatoryComplianceScoreboardSubscription } from './regulatoryComplianceScoreboard';

export interface ReportGovernanceProjection extends ReportProjectionRecord {
  // ...existing fields unchanged
  /** Optional; absent on packs generated before the scoreboard shipped. */
  regulatoryScoreboard?: RegulatoryComplianceScoreboardSubscription;
}

export interface ReportHistoryComparisonIdentities {
  // ...existing fields unchanged
  /**
   * Opaque `standardKey:controlKey` (toRegulatoryFailingControlIdentity) of failed controls.
   * Absent (older history, or the identities gate did not pass) means no comparison is possible, never "no failing controls".
   */
  regulatoryFailingControlKeys?: ReportBoundedRows<string>;
  /** Emitted alongside complete identities; absent on old/incomplete history. */
  regulatoryComparisonBasis?: {
    evidenceComplete: true;
    standards: Array<{ standardKey: string; source: RegulatoryScoreSource; assessmentBasisKey: string }>;
  };
}
```

Validation changes:

- `isGovernance` accepts an absent `regulatoryScoreboard`, or one that satisfies `isRegulatoryComplianceScoreboardSubscription`.
- `isHistoryComparisonIdentities` accepts both new history fields absent (old/incomplete history), or both present with complete identities and basis. Identity rows are unique, non-empty, at most 512 characters and match `/^\S+:\S+$/u`; the 2,000-row bound applies and omittedCount must be zero for the new regulatory category. Overflow omits both fields. Basis entries have unique standard keys, valid source/digest and at most the standard limit; the enclosing history supplies subscription ID. Other pre-existing categories keep their bounded-row behaviour. Consumers require pairs for every current contributing subscription, not a subset of available pairs.

## Tasks (Sequential)

1. **Add the scoreboard types module**
   - Files: `src/azure/regulatoryComplianceScoreboard.ts`, `src/index.ts`
   - Action: Add the module exactly as above and export it from the root, after `./azure/regulatoryCompliance`.
   - Verify: `npm run typecheck:contracts`
   - Done: Every parent contract type and constant is importable from `@spottoai/types-package`.
2. **Add the merge and validation modules with shared vectors**
   - Files:
     - `src/azure/regulatoryComplianceScoreboardMerge.ts`
     - `src/azure/regulatoryComplianceScoreboardValidation.ts`
     - `src/index.ts`
     - `fixtures/regulatory-compliance-scoreboard-vectors.json`
     - `scripts/check-regulatory-compliance-scoreboard-contracts.mjs`
     - `package.json` (`check:regulatory-compliance-scoreboard-contracts`, appended to `test`)
   - Action: Implement the normative algorithms above; declaration signatures are not an implementation. The vectors are named cases with `input` and `expected`, and the script asserts them against `../dist/index.js`. The vectors must cover:
     1. failed beats passed beats notAssessed, including two assignments of one set in one subscription merged with `mergeRegulatoryControlOutcome` (cloud-engine's use);
     2. notAssessed reason by majority, and the tie broken by enum order;
     3. a subscription missing a standard doesn't contribute, and `subscriptionCount` counts only contributors;
     4. counts recomputed from the union of differing control sets;
     5. resource figures summed, with a merged control's `failingResourceCount` absent when no input has it, and `failingResourceCountIsMinimum` ORed (present only with a count);
     6. `sources` in enum order;
     7. overlapping A+B and B+C inputs rejected without silently losing C;
     8. hierarchy re-merge, `merge(merge(A,B), C)`, equals `merge(A,B,C)` for outcomes, counts and sums;
     9. trend failed-minus-passed;
     10. trend carry-forward at exactly 3 days and not at 4;
     11. no trend point on a date that has only carried-forward data;
     12. trend total includes differing not-assessed key sets;
     13. original `trendInputs` preserve subscription IDs, observations and reset markers;
     14. `listRegulatoryScoreboardTrendDates` across a month boundary;
     15. history path builders, including rejected month and ID inputs, with a mixed-case subscription ID lower-cased;
     16. valid and invalid guard samples, including counts that don't match controls;
     17. A fails day 1, B passes day 4, C passes day 7: flat/chunked/hierarchy day 7 is passed;
     18. unavailable/not-reported markers immediately stop carry-forward;
     19. source/control-set or contributing-coverage changes mark segment boundaries;
     20. empty failed collection is unavailable; complete confirmed absence is loaded; Policy fallback after Defender failure is partial;
     21. assignment links preserved, mixed known/unknown counts labelled lower bounds;
     22. impossible dates, duplicate keys and mismatched subscription history rejected.
   - Verify: `npm test`
   - Done: All vectors pass against the built `dist` for both CJS and ESM. Run the script once with `require` and once with `import`, following `check-packed-aws-exports.mjs`.
3. **Add the evidence pack and history fields**
   - Files:
     - `src/azure/reportEvidence.ts`
     - `src/azure/reportEvidenceValidation.ts`
     - `src/azure/reportEvidence.contracts.spec.ts`
     - `scripts/check-report-evidence-contracts.mjs`
   - Action: Add the optional scoreboard and paired history identity/basis fields and the validator branches.
   - Verify: `npm test`
   - Done:
     - An existing pack or history without the fields still validates.
     - A pack with a valid scoreboard validates.
     - A pack with a malformed scoreboard, duplicate identities, or an identity without `:` is rejected.
4. **Add type-level contract tests**
   - Files: `src/azure/regulatoryComplianceScoreboard.contracts.spec.ts`, `tsconfig.contracts.json`
   - Action: Add positive samples for the file, history, both responses and every coverage state. Add `@ts-expect-error` cases for:
     - an unknown outcome, reason, source or coverage state (including `accessUnknown`);
     - `policyEvidence` on a merged control;
     - `failingResourceCountIsMinimum: false`;
     - a missing `subscriptionCount`, `catalog` or `exemptionsUnavailableSubscriptionIds`;
     - a wrong `schemaVersion` literal.
   - Verify: `npm run typecheck:contracts`
   - Done: Widening any union or dropping a required field fails compilation.
5. **Final build, lint, docs and release prep**
   - Files: `.agents/skills/types-package-architecture/SKILL.md`; package candidate version and lock (see Versioning).
   - Action: Replace "Excludes runtime behavior; this repo is compile-time only" with "Contracts plus small dependency-free pure helpers (validators, path builders, shared merge rules) tested against `dist`". Then run the full gates.
   - Verify: `npm run lint && npm test && npm run build && npm pack --dry-run`
   - Done: All gates pass, and the packed tarball contains `dist/azure/regulatoryComplianceScoreboard*.{js,d.ts}` and `dist/esm/azure/regulatoryComplianceScoreboard*.js`.

## Versioning and Release

- The additive published version is **1.1.3**, following the existing 1.1.2 baseline; all three consumer registry locks/installed versions are verified. For future candidates, the publish workflow uses the candidate as-is if unpublished, or advances to the next patch if already published.
- The change is additive: new exports plus optional fields; the new regulatory history identities/basis are paired and complete. No consumer breaks.
- After the live collection gate passes and implementation is approved, the user merges to `main`, and GitHub Actions publishes to GitHub Packages. cloud-engine, api and ui then update their dependency manifests and registry locks to the actual published version before release. Implementation uses a packed local candidate via `core/scripts/install-regulatory-scoreboard-local-types.mjs`; no consumer redeclares these types while waiting.

## Test Strategy

- **Type-level.** Positive and negative compile cases run through `typecheck:contracts` (Task 4).
- **Runtime.** The shared vectors and guard samples run against `dist`, in both CJS and ESM (Task 2). The evidence-pack check script is extended with old-shape, valid and malformed cases (Task 3).
- **Package.** `npm pack --dry-run` confirms the new files ship.
- **Consumers.** Each consumer's child spec covers its wiring. No consumer re-tests the merge rules.
- **Coverage target.** Every branch of the merge and trend functions is exercised by at least one named vector.

## Definition of Done (DoD)

### Feature Criteria

- All parent contract shapes, the history path and the evidence-pack/history fields are exported from the package root.
- The merge, trend, path and identity helpers are exported. They are pure and dependency-free, and pass every vector in both module formats.
- Old evidence packs and history remain valid.

### Completion Checklist

- [x] Contract tests with valid and invalid shapes
- [x] Vectors added and asserted in `npm test`
- [x] `npm run lint`, `npm test`, `npm run build` pass
- [x] Architecture skill corrected
- [x] Published version `1.1.3` recorded here and in the parent; user updated UI, API and cloud-engine
- [x] Swagger/OpenAPI N/A (api owns it)
- [x] Demo data N/A (ui owns it)

## Open Questions and release gate

The display-denominator decision and real Defender mappings await the parent's read-only live spike. `assessed = passed + failed` is locked. Not-assessed reason labels retain the documented majority/tie-break exception; trend staleness has no exception.

The user authorised iteration 3 spec revisions and validation on 2026-10-03 and has since published 1.1.3 and updated the consumers. Real query completeness beyond 1,000 rows and the no-paid-Defender case are recorded in engine Task 1. Eligible Defender plan two-standard Defender/dashboard parity remains a release gate. Synthetic fixtures cannot pass that gate. Any contract-shape change required by remaining live capture needs a subsequent package version and consumer update.

## Risks and Mitigations

| Risk                                                                                   | Mitigation                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime helpers bloat ui bundles                                                       | They are pure, dependency-free and tree-shakable (`sideEffects: false`), and imported only by scoreboard pages.                                                                              |
| Consumers fork the merge logic anyway                                                  | Consumer specs must import these helpers. Reviews reject local copies.                                                                                                                       |
| Validator strictness rejects a whole evidence pack because the scoreboard is malformed | cloud-engine self-checks with the same guard before writing and omits the field if the check fails. The vectors pin the guard's behaviour.                                                   |
| History file size                                                                      | The file is gzipped, holds one entry per UTC day, and keeps 13 months, with retention pruning owned by cloud-engine.                                                                         |
| Failing identities exceed 2,000 rows                                                   | Omit the paired complete regulatory identities/basis; report one failing-control register with a comparison-unavailable note. Other identity categories keep existing bounded-row semantics. |

## Rollback

All changes are additive: new modules, exports and optional fields. If a defect is found, publish a patch with the fix. Removing the exports would require consumers to unpin first. No data migration is needed.

## Runtime Environment

- Start: N/A (package)
- Env vars: none
- Tests: `npm test`, `npm run build`, `npm run lint`

## References

- Parent: `core/specs/governance/regulatory-compliance-scoreboard.md`
- Existing contracts: `src/azure/regulatoryCompliance.ts`, `src/azure/reportEvidence.ts`, `src/azure/reportEvidenceValidation.ts`
- Precedents: `src/azure/nativeDiscount.ts` with `scripts/check-native-discount-contracts.mjs`, and `buildBillingAnalyzerInputObservationPointerPath` in `src/azure/billingArtifactGeneration.ts`
- History convention: cloud-engine `apps/azure/src/Libraries/Services/Constants.ts` (`SUBSCRIPTION_HISTORY_PATTERN`) and `AzureSubscriptionHistoryService.ts`; api `services/CloudResource/AzureResourceService.ts` (`HISTORY_*`)
- ui coverage semantics: `apps/portal/src/features/companyScope/ScopedSubscriptionCoverageList.tsx`

## Implementation verification — 2026-10-04

The additive implementation is present across all five repositories. Existing Policy assignment details, notes, resources and exemption workflows remain the evidence drill-through. Initial verification used a locally packed candidate. The user has since published types-package 1.1.3 and updated UI, API and cloud-engine; their registry locks, installed versions and isolated cache-backed ESM/CommonJS contract checks pass. Published-package consumer verification is recorded in the parent. No application deployment was performed.

Verified locally: cloud-engine build and 121 integration tests; 90 focused collector, report, history, query and Resource Graph regressions; API typecheck, 486 integration tests, existing workerd suites, 33 scoreboard tests and Swagger drift; portal production build; original-history partition/tree regressions; legacy assignment/hook/guard regressions; Portal and headless SDM model and DOCX parity. Final browser and broad reporting results are recorded in the parent close-down table.

The Worker harness is `api/scripts/benchmark-regulatory-scoreboard.mjs`. It runs synthetic fixtures inside workerd, samples V8 heap through the inspector and records `api/output/regulatory-scoreboard/workerd-benchmark.json`. A measured 500-subscription, 2,000-control run completed in 18.7 seconds cold and 12.7 seconds warm with sampled heap below 59 MB. This is fixture evidence, not a production latency guarantee. Dense history reaches the retention/read budget and drops the trend while preserving the current score; storage failures name unavailable subscriptions. The request has an absolute deadline as well as an abort timer.

Release remains gated on eligible Defender plan evidence with a second standard, dashboard denominator/second-standard parity, live hierarchy acceptance and canonical quality checks. Shared 1.1.3 publication and consumer lock refresh are completed. The five ARG query families and ordered >1,000-row/partition reconciliation passed against the Development tenant. Unknown Defender standards remain visible by their Defender name.

A complete regulatory identity/basis pair may be emitted independently when legacy recommendation or Policy assessment identities are unavailable. The legacy trio remains mandatory when no regulatory pair is present; validators reject half-pairs and malformed legacy categories. This avoids blocking a valid control baseline on unrelated evidence.

Final close-down: the parent spec records the Done / Outstanding / N/A matrix, final browser/reporting/docs results and remaining live/quality gates. The published dependency is 1.1.3; development is implemented, release approval remains separate.
