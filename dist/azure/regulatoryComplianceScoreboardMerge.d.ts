import { type CompanyRegulatoryScoreboardStandard, type RegulatoryComplianceScoreboardHistory, type RegulatoryComplianceScoreboardSubscription, type RegulatoryControlOutcome, type RegulatoryControlOutcomeCounts, type RegulatoryNotAssessedReason, type RegulatoryScoreSource, type RegulatoryScoreboardMergedControl, type RegulatoryScoreboardStandard, type RegulatoryScoreboardTrendSeries, type RegulatoryScoreboardTrendPoint } from './regulatoryComplianceScoreboard';
export type RegulatoryScoreboardMergeableStandard = Omit<CompanyRegulatoryScoreboardStandard, 'trend' | 'trendInputs' | 'trendUnavailableReason' | 'counts' | 'subscriptionCount'>;
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
export declare class RegulatoryScoreboardOverlappingSubscriptionsError extends Error {
    readonly subscriptionId: string;
    constructor(subscriptionId: string);
}
export declare function deriveControlOutcomeCounts(controls: readonly {
    outcome: RegulatoryControlOutcome;
}[]): RegulatoryControlOutcomeCounts;
export declare function mergeRegulatoryControlOutcome(inputs: readonly RegulatoryControlOutcomeInput[]): RegulatoryControlOutcomeInput;
export declare function mergeRegulatoryScoreboardControls(inputs: readonly (readonly RegulatoryScoreboardMergedControl[])[]): RegulatoryScoreboardMergedControl[];
export declare function toMergeableRegulatoryScoreboardStandard(subscriptionId: string, standard: RegulatoryScoreboardStandard): RegulatoryScoreboardMergeableStandard;
export declare function mergeRegulatoryScoreboardStandards(inputs: readonly RegulatoryScoreboardMergeableStandard[]): MergedRegulatoryScoreboardStandard[];
export declare function classifyRegulatoryScoreboardEvidence(scoreboard: RegulatoryComplianceScoreboardSubscription): RegulatoryScoreboardEvidenceClassification;
export declare function toRegulatoryScoreboardTrendSeries(histories: readonly RegulatoryComplianceScoreboardHistory[], standardKey: string): RegulatoryScoreboardTrendSeries;
export declare function isRegulatoryScoreboardDate(value: string): boolean;
export declare function listRegulatoryScoreboardTrendDates(endDate: string, days: number): string[];
export declare function mergeRegulatoryScoreboardTrend(series: readonly RegulatoryScoreboardTrendSeries[], dates: readonly string[]): RegulatoryScoreboardTrendPoint[];
export declare function buildRegulatoryScoreboardHistoryRelativePath(month: string): string;
export declare function buildRegulatoryScoreboardHistoryPath(subscriptionId: string, month: string): string;
export declare function toRegulatoryFailingControlIdentity(standardKey: string, controlKey: string): string;
//# sourceMappingURL=regulatoryComplianceScoreboardMerge.d.ts.map