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
  assignmentKey: string; assignmentId: string; assignmentScope: string; inherited: boolean;
}
export interface RegulatoryScoreboardPolicyEvidence {
  assignmentKey: string; policyControlKey: string; outcome: RegulatoryControlOutcome;
  failingResourceCount?: number; failingResourceCountIsMinimum?: true;
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
  | 'notEnoughHistory' | 'historyUnavailable' | 'resourceBudgetExceeded' | 'missingOriginalInputs';
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
