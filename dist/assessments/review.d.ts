import type { AssessmentActionItem, AssessmentFinding, AssessmentNarrative, AssessmentRecommendation } from './artifact';
import type { AssessmentRun } from './run';
type AssessmentTraceabilityOverrideKeys = 'evidenceIds' | 'findingIds' | 'recommendationIds' | 'actionItemIds';
export type AssessmentFindingReviewOverride = Partial<Omit<AssessmentFinding, 'findingId' | AssessmentTraceabilityOverrideKeys>>;
export type AssessmentRecommendationReviewOverride = Partial<Omit<AssessmentRecommendation, 'recommendationId' | AssessmentTraceabilityOverrideKeys>>;
export type AssessmentActionItemReviewOverride = Partial<Omit<AssessmentActionItem, 'actionItemId' | AssessmentTraceabilityOverrideKeys>>;
export interface AssessmentReviewOverlay {
    assessmentRunId: string;
    revision: number;
    updatedAt: string;
    updatedByUserId?: string;
    narrativeOverrides?: Partial<AssessmentNarrative>;
    findingOverrides?: Record<string, AssessmentFindingReviewOverride>;
    recommendationOverrides?: Record<string, AssessmentRecommendationReviewOverride>;
    actionItemOverrides?: Record<string, AssessmentActionItemReviewOverride>;
    hiddenFindingIds?: string[];
    hiddenRecommendationIds?: string[];
    hiddenActionItemIds?: string[];
}
export interface UpdateAssessmentReviewRequest {
    review: AssessmentReviewOverlay;
}
export interface UpdateAssessmentReviewResponse {
    review: AssessmentReviewOverlay;
}
export interface ApproveAssessmentRunRequest {
    reviewNotes?: string;
}
export interface PublishAssessmentRunRequest {
    publishNotes?: string;
}
export interface AssessmentRunLifecycleResponse {
    assessmentRun: AssessmentRun;
}
export {};
//# sourceMappingURL=review.d.ts.map