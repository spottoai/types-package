/**
 * Utilization stories: shared contracts for per-resource utilization profiles, the compact
 * `utilizationSignal` carried on portal resource rows, the per-subscription story artifacts
 * (`azure-portal/subscriptions/{id}/stories/{storyKey}.json`), the bounded story samples embedded
 * in the subscription report evidence pack, and the cloud-engine config schemas that drive them.
 *
 * Provider-neutral (`provider` on every profile); depends only on other `common/` modules.
 * Spec: `Specs/reporting/utilization-stories-types-package.md` (parent: core `specs/reporting/utilization-stories.md`).
 *
 * Producer: cloud-engine (`UtilizationProfileBuilder`, `StoryAccumulator`). Consumers: api (story routes), ui
 * (story pages, report sections), report evidence pack (`reporting.stories`).
 *
 * All contracts are additive: consumers must tolerate unknown fields, and every optional field may be absent on
 * artifacts produced by older engine versions.
 */
import type { MetricStats } from './metricStats';
import type { ReportBoundedRows } from './boundedRows';

export type Provider = 'azure' | 'aws';
export type MetricRole = 'primary' | 'secondary' | 'context';
export type DimensionPolicy = 'average' | 'sum' | 'max' | 'split';
export type MetricVisual = 'sparkline' | 'trend' | 'capacity-bar' | 'mix-bar' | 'event-strip';
export type BilledOn = 'allocated' | 'used' | 'included';

/** One daily-bucketed metric series over the evidence window, ready for a sparkline or trend visual. */
export interface MetricSparkline {
  /** Generic profile key: "cpu", "memory", "dtu", "ru", "capacity", "usedCapacity", "transactions", ... */
  key: string;
  /** Provider metric name behind the key. */
  metricName: string;
  role: MetricRole;
  visual: MetricVisual;
  unit: string;
  /** Resolved at build time; null when no sensible axis maximum exists. */
  axisMax: number | null;
  axisMaxSource?: 'config' | 'capacity' | 'observed';
  /** Capacity metrics only. */
  billedOn?: BilledOn;
  dimensions?: { policy: DimensionPolicy; name?: string; value?: string; seriesCount: number };
  /** ISO date (UTC) of bucket 0. */
  start: string;
  bucket: 'P1D';
  /** `windowDays` entries; null = no samples that day. */
  avg: (number | null)[];
  p95: (number | null)[];
  max: (number | null)[];
  stats: MetricStats;
  sourcePoints: number;
}

export interface CapacityScalingDescriptor {
  /** Whether provider-managed autoscaling is currently enabled; null when the producer cannot determine it. */
  autoscaleEnabled: boolean | null;
  /** Configured lower bound in the same unit as `CapacityDescriptor.units`. */
  minimumUnits: number | null;
  /** Configured default or desired capacity in the same unit as `CapacityDescriptor.units`. */
  defaultUnits: number | null;
  /** Configured upper bound in the same unit as `CapacityDescriptor.units`. */
  maximumUnits: number | null;
  /** Provider-neutral display source, e.g. "Azure Monitor Autoscale", "AKS Cluster Autoscaler" or "Manual / Fixed Capacity". */
  source: string | null;
}

export interface CapacityDescriptor {
  sku: string | null;
  tier: string | null;
  /** Current observed or configured capacity. */
  units: number | null;
  /** "vCPU" | "vCore" | "DTU" | "instances" | "RU/s" | "units" | "nodes" | ... */
  unitName: string;
  memoryGB?: number | null;
  scaleMode: 'fixed' | 'autoscale' | 'serverless';
  /** Scaling evidence for resources with variable instance/unit counts; absent on artifacts from older producers. */
  scaling?: CapacityScalingDescriptor;
  /** Display label, e.g. "4 vCPU · 32 GB RAM". */
  label: string;
}

export type RunMode = 'stop-start' | 'auto-pause' | 'scale-to-zero' | 'always-on';
export type SizingVerdict = 'oversized' | 'undersized' | 'busy' | 'rebalance' | 'mostly-off' | 'idle' | 'no-telemetry' | 'fits' | 'unknown';
export type ScheduleFit = 'good' | 'fair' | 'low' | 'done' | 'insufficient-data' | 'not-applicable';
export type ScheduleAction = 'stop' | 'pause' | 'scale';
export type TelemetryStatus = 'collected' | 'partial' | 'no-series' | 'unavailable';

/**
 * How the running/stopped signal was derived. `metric-presence` alone cannot distinguish a stopped resource from a
 * collection gap, so it must be corroborated (see `RunningProfile.corroboration`) before it may drive a schedule fit
 * or a `mostly-off` verdict.
 */
export type RunningBasis = 'power-state' | 'billing-hours' | 'metric-presence';

export interface RunningProfile {
  signalMetric: string;
  basis: RunningBasis;
  /**
   * Independent sources (never the basis itself) whose daily running hours agree with `daily` within the engine's
   * tolerance. Empty when none. Guard rule: `scheduleFit` in good|fair|low and `verdict` = mostly-off require
   * `basis !== 'metric-presence'` or a corroboration entry other than `metric-presence`, plus
   * `evidenceWindow.telemetry === 'collected'`; otherwise the engine emits `insufficient-data` / `unknown`.
   */
  corroboration: RunningBasis[];
  /** Share of each day's expected samples that carried a value (or, for power-state/billing bases, the running share). */
  daily: (number | null)[];
  share: number | null;
  weekly?: {
    timezone: string;
    /** 7 x 24 */
    running: (number | null)[][];
    /** 7 x 24, mean of the primary metric while running. */
    usage: (number | null)[][];
    businessHours: { runningShare: number | null; usageMean: number | null };
    offHours: { runningShare: number | null; usageMean: number | null };
  };
}

export type CommitmentBenefitType = 'reservation' | 'savings-plan';

/** Inventory metadata for one benefit that contributed to the resource's historical coverage window. */
export interface CommitmentBenefit {
  benefitId: string | null;
  benefitName: string | null;
  benefitType: CommitmentBenefitType;
  /** Current inventory status at story generation time; null when no inventory match was available. */
  status: string | null;
  /** ISO expiry instant/date from the commitment inventory; null when unavailable. */
  expiryDate: string | null;
  /** Whole days from story generation to expiry; negative when already expired, null when expiry is unavailable. */
  daysToExpiry: number | null;
}

export interface CommitmentCoverage {
  coveragePercent: number | null;
  benefitTypes: CommitmentBenefitType[];
  benefitNames: string[];
  /** Per-benefit inventory detail; optional so artifacts from older producers remain valid. */
  benefits?: CommitmentBenefit[];
  coveredCost: number | null;
  uncoveredCost: number | null;
  windowStart: string;
  windowEnd: string;
}

export interface EvidenceWindow {
  windowStart: string;
  windowEnd: string;
  days: number;
  sampleCount: number;
  telemetry: TelemetryStatus;
  confidence: 'high' | 'medium' | 'low';
}

export interface VerdictReason {
  rule: string;
  values: Record<string, number | null>;
}

export interface UtilizationProfile {
  provider: Provider;
  /** "compute" | "database" | "storage" | "networking" | "integration" | "analytics" | ... */
  family: string;
  capacity: CapacityDescriptor;
  runMode: RunMode;
  metrics: MetricSparkline[];
  running?: RunningProfile;
  verdict: SizingVerdict;
  verdictReasons: VerdictReason[];
  /** Corroborating stable keys, e.g. "cpu-low", "advisor-rightsize". */
  evidence: string[];
  scheduleFit: ScheduleFit;
  scheduleAction?: ScheduleAction;
  coverage?: CommitmentCoverage;
  /** Derived from billing config (pool, plan, scale set, cluster). */
  ownerResourceId?: string;
  evidenceWindow: EvidenceWindow;
  /** `${resourceId}|${verdict}` */
  fingerprint: string;
}

/** Compact form carried on portal `resources.json` rows and used by list views. */
export interface UtilizationSignal {
  verdict: SizingVerdict;
  scheduleFit: ScheduleFit;
  primary: { key: string; p95: number | null; sparkline: (number | null)[] };
  secondary?: { key: string; p95: number | null; sparkline: (number | null)[] };
  coverage?: Pick<CommitmentCoverage, 'coveragePercent' | 'benefitTypes'>;
  betterSku?: SkuOptionSummary;
  telemetry: TelemetryStatus;
}

// ---- Right SKU
export type SkuOptionKind = 'same-shape' | 'fits-usage' | 'trade-off' | 'cross-platform';
export type SkuCapabilityValue = string | number | boolean | null | (string | number | boolean | null)[];
export interface SkuCapabilityImpact {
  key: string;
  label?: string;
  severity: 'info' | 'warning' | 'unknown';
  basis: 'sku-capability' | 'current-setting' | 'active-vcpu-capability' | 'unknown';
  materiality: 'used' | 'not-used' | 'unknown';
  currentValue?: SkuCapabilityValue;
  alternativeValue?: SkuCapabilityValue;
  message?: string;
}
export interface SkuOption {
  kind: SkuOptionKind;
  /** e.g. "Standard_E8as_v4" */
  sku: string;
  /** e.g. "E8as v4" */
  label: string;
  capacity?: { units: number | null; memoryGB?: number | null };
  monthlyCost: number | null;
  currency: string;
  savingsPercent: number | null;
  savingsMonthly: number | null;
  /** Provider capability keys, e.g. "maxDataDiskCount". */
  lostCapabilities: string[];
  /** Structured form of `lostCapabilities`, including the current and proposed values when known. */
  capabilityImpacts?: SkuCapabilityImpact[];
  confidence?: 'high' | 'medium' | 'low';
}
export interface SkuOptionSummary {
  kind: SkuOptionKind;
  label: string;
  savingsPercent: number | null;
}
export type RightSizeAssessmentStatus = 'recommended' | 'no-change' | 'insufficient-data' | 'not-supported';

// ---- Resilience
export type CapabilityState = 'enabled' | 'disabled' | 'partial' | 'unknown' | 'not-applicable';
export interface ProtectionCapability {
  /**
   * "backup" | "replication" | "placement" | "disk-redundancy" | "patching" | "snapshots" | "geo-replication" |
   * "pitr-retention" | "long-term-retention" | "zone-redundancy" | "backup-storage-redundancy" | "redundancy" |
   * "soft-delete" | "versioning" | "point-in-time-restore" | "immutability" | "multi-region" | "continuous-backup" |
   * "purge-protection" | ...
   */
  key: string;
  state: CapabilityState;
  required: boolean;
  label: string;
  details?: Record<string, string | number | boolean | null>;
  costIfEnabled?: number | null;
  evidence: { source: string; observedAt?: string | null };
}
export interface ProtectionProfile {
  provider: Provider;
  capabilities: ProtectionCapability[];
  missingRequired: string[];
  slaPercent?: number | null;
}

// ---- Story artifacts
export type StoryKey = 'oversized-resources' | 'right-sku' | 'schedule-candidates' | 'resilience-recovery' | 'hybrid-benefit' | 'commitments';
export const STORY_KEYS: readonly StoryKey[] = [
  'oversized-resources',
  'right-sku',
  'schedule-candidates',
  'resilience-recovery',
  'hybrid-benefit',
  'commitments',
];

// ---- Rendering contract: typed cells
//
// Every story row carries `cells`, keyed by the owning section's column keys. The UI renders
// `row.cells[column.key]` with the renderer for `column.cell` and never branches on the story or
// resource type; the typed domain objects on the row (`profile`, `protection`, ...) serve hover
// detail and the report. A cell whose `kind` differs from its column's `cell` is a contract violation.
export type StoryCellKind =
  'text' | 'number' | 'money' | 'percent' | 'mark' | 'dot' | 'sparkline' | 'dual' | 'capacity-bar' | 'mix-bar' | 'event-strip' | 'weekly-grid';
export type SeriesRole = 'primary' | 'secondary';
export type StatusTone = 'good' | 'warn' | 'bad' | 'neutral' | 'muted';

export interface TextCell {
  kind: 'text';
  value: string | null;
  /** Optional second line, e.g. "4 vCPU · 32 GB RAM" under a SKU. */
  detail?: string | null;
}
export interface NumberCell {
  kind: 'number';
  value: number | null;
  unit?: string;
  decimals?: number;
}
export interface MoneyCell {
  kind: 'money';
  value: number | null;
  currency: string;
  /** Optional comparison amount shown below the primary amount, e.g. amortized spend below billed spend. */
  secondaryValue?: number | null;
  /** Short display label for `secondaryValue`. */
  secondaryLabel?: string;
}
export interface PercentCell {
  kind: 'percent';
  value: number | null;
}
/** One-word verdict / rating with an icon and tone; `state` is the stable enum value behind the label. */
export interface MarkCell {
  kind: 'mark';
  state: string;
  label: string;
  tone: StatusTone;
  icon?: string;
  hint?: string;
}
/** A single indicator dot, e.g. "better SKU available". */
export interface DotCell {
  kind: 'dot';
  present: boolean;
  tone: StatusTone;
  label?: string;
  hint?: string;
}
export interface SparklineCell {
  kind: 'sparkline';
  role: SeriesRole;
  /** Daily values for the window; null = no samples that day. */
  values: (number | null)[];
  axisMax: number | null;
  unit: string;
  p95: number | null;
  label: string;
}
/** Primary and secondary series merged into one column at narrow layouts. */
export interface DualCell {
  kind: 'dual';
  primary: SparklineCell;
  secondary: SparklineCell | null;
}
export interface CapacityBarCell {
  kind: 'capacity-bar';
  used: number | null;
  total: number | null;
  unit: string;
  label: string;
}
export interface MixBarCell {
  kind: 'mix-bar';
  parts: { key: string; label: string; value: number }[];
  unit: string;
  total: number;
}
export interface EventStripCell {
  kind: 'event-strip';
  events: ('ok' | 'failed' | null)[];
  /** ISO date (UTC) of event 0. */
  start: string;
  label?: string;
}
export interface WeeklyGridCell {
  kind: 'weekly-grid';
  timezone: string;
  /** 7 x 24 running share. */
  running: (number | null)[][];
  businessHoursShare: number | null;
  offHoursShare: number | null;
}
export type StoryCell =
  | TextCell
  | NumberCell
  | MoneyCell
  | PercentCell
  | MarkCell
  | DotCell
  | SparklineCell
  | DualCell
  | CapacityBarCell
  | MixBarCell
  | EventStripCell
  | WeeklyGridCell;

export interface StoryRowBase {
  resourceId: string;
  name: string;
  type: string;
  location: string;
  subscriptionId: string;
  tenantId: string;
  companyId: string;
  currency: string;
  spend30d: number | null;
  savingsMax: number | null;
  ownerResourceId?: string;
  fingerprint: string;
  /** One entry per column key of the owning section; kinds match `StoryColumn.cell`. */
  cells: Record<string, StoryCell>;
}
export interface OversizedResourceRow extends StoryRowBase {
  profile: UtilizationProfile;
  betterSku?: SkuOptionSummary;
  /** Full recommendation evidence for detail/report views; `betterSku` remains the compact list-view projection. */
  recommendedOption?: SkuOption;
  /** Distinguishes a real no-change decision from unavailable or unsupported assessment. */
  rightSizeStatus?: RightSizeAssessmentStatus;
}
export interface RightSkuRow extends StoryRowBase {
  current: SkuOption;
  options: SkuOption[];
  verdict: 'modernise' | 'downsize' | 'consider' | 'keep';
  usage: { primaryP95: number | null; secondaryP95: number | null; telemetry: TelemetryStatus };
  /** Reuses the profile already built for the resource; producers must not recollect it. */
  profile?: UtilizationProfile;
}
export interface ScheduleCandidateRow extends StoryRowBase {
  /** `profile.running.weekly` is always present on schedule candidates. */
  profile: UtilizationProfile;
  action: ScheduleAction;
}
export interface ResilienceRow extends StoryRowBase {
  protection: ProtectionProfile;
  backupRuns?: ('ok' | 'failed' | null)[];
  lastRecoveryPointAt?: string | null;
  uptimeDays?: number | null;
  activeHealthEvents?: number;
}
export interface HybridBenefitRow extends StoryRowBase {
  productFamily: string;
  serviceModel: string;
  edition: string | null;
  vCpuCount: number | null;
  configurationStatus: string;
  technicalEligibilityStatus: string;
  coverageStatus: string;
  entitlementStatus: string;
  decision: { status: string; headline: string; paybackMonths: number | null; confidence: string };
  reasonCodes: string[];
  licenceObservedStableDays: number | null;
}
export interface CommitmentRow extends StoryRowBase {
  coverage: CommitmentCoverage;
  utilization?: { primaryKey: string; p95: number | null };
}

export interface StoryRowByKey {
  'oversized-resources': OversizedResourceRow;
  'right-sku': RightSkuRow;
  'schedule-candidates': ScheduleCandidateRow;
  'resilience-recovery': ResilienceRow;
  'hybrid-benefit': HybridBenefitRow;
  commitments: CommitmentRow;
}

export const STORY_LIMITS = {
  sectionRows: 1000,
  sampleRows: 50,
  windowDays: 30,
  weeklyGridDays: 7,
  weeklyGridHours: 24,
  /** Story fingerprints retained per monthly history period (all stories together). */
  historyFingerprints: 2000,
} as const;

export interface StorySectionFinancials {
  /** Totals across the full section, including omitted rows. */
  spend30d: number;
  savingsMax: number;
  currency: string;
}

/** Reuses ReportBoundedRows<T> (totalCount / rows / omittedCount) from reportEvidence.ts. */
export interface StorySection<TRow> extends ReportBoundedRows<TRow> {
  resourceType: string;
  family: string;
  columns: StoryColumn[];
  financials?: StorySectionFinancials;
}
/**
 * Column definition for the generic story table. `cell` names the renderer; `priority` drives the responsive
 * tiers (1 always shown ... 5 first to drop); `roleClass` drives layout width and the primary/secondary merge:
 * a section that has a `sec` column also carries a `dual` column, shown instead of `prim` + `sec` at narrow tiers.
 */
export interface StoryColumn {
  key: string;
  label: string;
  cell: StoryCellKind;
  priority: 1 | 2 | 3 | 4 | 5;
  roleClass?: 'res' | 'prim' | 'sec' | 'nums' | 'cap' | 'read' | 'cost' | 'save' | 'dual';
  hint?: string;
}
export interface StorySummary {
  counts: Record<string, number>;
  spend: Record<string, number>;
  currency: string;
  note?: string;
}
export interface StoryArtifact<TRow = unknown> {
  storyKey: StoryKey;
  scope: { companyId: string; tenantId: string; subscriptionId: string; displayName: string; currency: string };
  generation: { sourceRunId: string; generatedAt: string };
  window: { start: string; end: string; days: number; timezone: string };
  summary: StorySummary;
  sections: StorySection<TRow>[];
  /**
   * Set only by a reader that projects the artifact to its summary view (API `view=summary`): every section keeps
   * `columns`, `totalCount` and `omittedCount` as produced, with `rows: []`. Absent on the artifact the engine writes.
   */
  view?: 'summary';
}

// ---- History extension (SubscriptionReportHistoryPeriod.stories)
/**
 * Compact identity of one published story row, retained per monthly history period so a later report can say
 * whether a row was previously reported (`previouslyReported`) and how its saving moved. Selected across all six
 * stories by `savingsMax` desc, `storyKey` asc, `resourceId` asc and bounded by `STORY_LIMITS.historyFingerprints`.
 */
export interface StoryFingerprint {
  storyKey: StoryKey;
  resourceId: string;
  /** The row's `fingerprint` (`${resourceId}|${verdict}` and story-specific variants). */
  fingerprint: string;
  savingsMax: number | null;
}

// ---- Evidence pack extension (SubscriptionReportEvidencePack.reporting.stories)
export interface StorySample<TRow = unknown> {
  summary: StorySummary;
  /** At most STORY_LIMITS.sampleRows rows per section. */
  sections: StorySection<TRow>[];
}
export type ReportingStories = Partial<Record<StoryKey, StorySample>>;

// ---- Engine config schemas
export interface UtilizationProfileConfig {
  version: 1;
  defaults: { windowDays: number; bucket: 'P1D'; weeklyProfile: boolean; verdictRules: Record<string, string> };
  /** Keyed by lowercase resource type. */
  profiles: Record<string, UtilizationProfileEntry>;
}
export interface UtilizationProfileEntry {
  family: string;
  producer?: 'parser' | 'strategy';
  /** jsonata over the resource */
  capacityLabel?: string;
  runMode: RunMode;
  /** metric key */
  runningSignal?: string | null;
  scheduleFit?: boolean | ScheduleAction;
  variants?: { when: string; metrics: UtilizationMetricEntry[]; verdictRules?: Record<string, string> }[];
  metrics?: UtilizationMetricEntry[];
  verdictRules?: Record<string, string>;
  skuAlternatives?: { source: string; capabilityKeys?: string[] };
}
export interface UtilizationMetricEntry {
  key: string;
  metricName: string;
  collection?: string;
  role: MetricRole;
  visual?: MetricVisual;
  unit?: string;
  axisMax?: number;
  axisMaxExpression?: string;
  billedOn?: BilledOn;
  transform?: string;
  requires?: string;
  when?: string;
  dimensions?: { policy: DimensionPolicy; name?: string };
  priority?: 1 | 2 | 3 | 4 | 5;
}
export interface ResilienceProfileConfig {
  version: 1;
  profiles: Record<string, { capabilities: { key: string; required: boolean; source: string; sla?: string }[] }>;
}
