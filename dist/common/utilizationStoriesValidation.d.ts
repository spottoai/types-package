import type { ReportBoundedRows } from './boundedRows';
import { type CapacityDescriptor, type CapacityScalingDescriptor, type CommitmentBenefit, type CommitmentBlock, type CommitmentCoverage, type CommitmentRow, type EvidenceWindow, type HybridBenefitRow, type MetricSparkline, type OversizedResourceRow, type Provider, type ProtectionCapability, type ProtectionProfile, type ReportingStories, type ResilienceProfileConfig, type ResilienceRow, type RightSizeRejection, type RightSkuRow, type RunningProfile, type ScheduleCandidateRow, type SkuOption, type SkuOptionSummary, type SkuProjectedUsage, type StoryArtifact, type StoryCell, type StoryColumn, type StoryFingerprint, type StoryKey, type StoryRowBase, type StorySample, type StorySection, type StorySummary, type UtilizationMetricEntry, type UtilizationProfile, type UtilizationProfileConfig, type UtilizationProfileEntry, type UtilizationSignal } from './utilizationStories';
export declare const isMetricSparkline: (value: unknown, days?: number) => value is MetricSparkline;
export declare const isCapacityScalingDescriptor: (value: unknown) => value is CapacityScalingDescriptor;
export declare const isCapacityDescriptor: (value: unknown) => value is CapacityDescriptor;
export declare const isRunningProfile: (value: unknown, days?: number) => value is RunningProfile;
/** A running signal derived from metric presence alone is not evidence of stopped time; it needs an independent source. */
export declare const isCorroboratedRunningProfile: (value: RunningProfile) => boolean;
export declare const isCommitmentBenefit: (value: unknown) => value is CommitmentBenefit;
export declare const isCommitmentCoverage: (value: unknown) => value is CommitmentCoverage;
export declare const isEvidenceWindow: (value: unknown) => value is EvidenceWindow;
/** Optional basis and billed figure: a billed-basis summary's `billedSavingsPercent` must equal its `savingsPercent`. */
export declare const isSkuOptionSummary: (value: unknown) => value is SkuOptionSummary;
/** An estimate marker plus at least one non-negative projected p95 percentage (may exceed 100). */
export declare const isSkuProjectedUsage: (value: unknown) => value is SkuProjectedUsage;
export declare const isCommitmentBlock: (value: unknown) => value is CommitmentBlock;
export declare const isRightSizeRejection: (value: unknown) => value is RightSizeRejection;
export declare const isSkuOption: (value: unknown) => value is SkuOption;
export declare const isUtilizationProfile: (value: unknown, days?: number) => value is UtilizationProfile;
export declare const isUtilizationSignal: (value: unknown) => value is UtilizationSignal;
export declare const isProtectionCapability: (value: unknown) => value is ProtectionCapability;
export declare const isProtectionProfile: (value: unknown) => value is ProtectionProfile;
export declare const isStoryCell: (value: unknown) => value is StoryCell;
export declare const isStoryColumn: (value: unknown) => value is StoryColumn;
/** Every column has a cell on the row, and the cell's kind matches the column's renderer. */
export declare const hasCellsForColumns: (row: StoryRowBase, columns: StoryColumn[]) => boolean;
export declare const isOversizedResourceRow: (value: unknown, days?: number, provider?: Provider) => value is OversizedResourceRow;
export declare const isRightSkuRow: (value: unknown, days?: number, provider?: Provider) => value is RightSkuRow;
/** Schedule candidates always carry a corroborated weekly running profile. */
export declare const isScheduleCandidateRow: (value: unknown, days?: number, provider?: Provider) => value is ScheduleCandidateRow;
export declare const isResilienceRow: (value: unknown) => value is ResilienceRow;
export declare const isHybridBenefitRow: (value: unknown) => value is HybridBenefitRow;
export declare const isCommitmentRow: (value: unknown) => value is CommitmentRow;
/** Row guard for a story key; unknown keys reject every row. `provider: 'aws'` admits rows with an empty `tenantId`. */
export declare const storyRowGuard: (storyKey: string, days?: number, provider?: Provider) => ((row: unknown) => row is StoryRowBase);
export declare const isStorySummary: (value: unknown) => value is StorySummary;
export declare const isStorySection: (value: unknown, storyKey: string, limit: number, days?: number, provider?: Provider) => value is StorySection<StoryRowBase>;
/**
 * A section of a summary-view projection (`view: 'summary'`): the produced columns and counts with the rows removed,
 * so `rows` must be empty while `totalCount` / `omittedCount` keep the values the engine wrote.
 */
export declare const isStorySummarySection: (value: unknown) => value is StorySection<StoryRowBase>;
/** Every row of an artifact belongs to the artifact's scope; a row from another company, tenant or subscription is rejected. */
export declare const isRowInScope: (row: StoryRowBase, scope: {
    companyId: string;
    tenantId: string;
    subscriptionId: string;
}) => boolean;
export declare const isStoryArtifact: (value: unknown, storyKey?: StoryKey) => value is StoryArtifact<StoryRowBase>;
/** Bounded sample embedded in the evidence pack; rows are validated for `storyKey`, window days are not known here. */
export declare const isStorySample: (value: unknown, storyKey: StoryKey) => value is StorySample<StoryRowBase>;
export declare const isStoryFingerprint: (value: unknown) => value is StoryFingerprint;
/** Bounded, de-duplicated (storyKey + fingerprint) fingerprint rows for one history period. */
export declare const isStoryFingerprintRows: (value: unknown) => value is ReportBoundedRows<StoryFingerprint>;
export declare const isReportingStories: (value: unknown) => value is ReportingStories;
export declare const isUtilizationMetricEntry: (value: unknown) => value is UtilizationMetricEntry;
export declare const isUtilizationProfileEntry: (value: unknown) => value is UtilizationProfileEntry;
export declare const isUtilizationProfileConfig: (value: unknown) => value is UtilizationProfileConfig;
export declare const isResilienceProfileConfig: (value: unknown) => value is ResilienceProfileConfig;
//# sourceMappingURL=utilizationStoriesValidation.d.ts.map