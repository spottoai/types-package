import type { ProviderName, ProviderScope } from '../common/provider';
export declare const RecommendationWorkflowLanes: {
    readonly prioritized: "prioritized";
    readonly todo: "todo";
    readonly inProgress: "in-progress";
    readonly completed: "completed";
};
export type RecommendationWorkflowLane = (typeof RecommendationWorkflowLanes)[keyof typeof RecommendationWorkflowLanes];
export declare const RecommendationWorkflowSelectionModes: {
    readonly allAffected: "all-affected";
    readonly selectedSubset: "selected-subset";
    readonly subscriptionWide: "subscription-wide";
};
export type RecommendationWorkflowSelectionMode = (typeof RecommendationWorkflowSelectionModes)[keyof typeof RecommendationWorkflowSelectionModes];
export type RecommendationWorkflowCategory = 'Cost' | 'Performance' | 'Security' | 'Compliance' | 'Reliability' | 'Operational Excellence';
export type RecommendationWorkflowImpact = 'High' | 'Medium' | 'Low';
export type RecommendationWorkflowEffort = 'High' | 'Medium' | 'Low';
export interface RecommendationWorkflowSavingsSnapshot {
    minAmount?: number;
    maxAmount?: number;
    currencyCode?: string;
    currencySymbol?: string;
}
/**
 * Lightweight card-level snapshot persisted with a workflow item so board cards
 * can still render when the source recommendation is no longer in the active feed.
 */
export interface RecommendationWorkflowSnapshot {
    title: string;
    category: RecommendationWorkflowCategory;
    impact: RecommendationWorkflowImpact;
    effort: RecommendationWorkflowEffort;
    subscriptionName?: string;
    savings?: RecommendationWorkflowSavingsSnapshot | null;
    updatedAt: string;
}
/**
 * Canonical board-item identity:
 * company + provider + providerScopeId + recommendationId.
 */
export interface RecommendationWorkflowIdentity extends ProviderScope {
    companyId: string;
    recommendationId: string;
}
interface RecommendationWorkflowItemBase extends RecommendationWorkflowIdentity {
    /** Stable workflow row identifier used by route params in update endpoints. */
    flowItemId: string;
    /**
     * Deprecated alias retained for compatibility with consumers that still map
     * provider scope to subscription vocabulary.
     */
    subscriptionId?: string;
    lane: RecommendationWorkflowLane;
    /** Numeric order value within a lane. */
    laneOrder: number;
    /** Number of resources currently affected by the recommendation. */
    affectedResourceCount: number;
    /** Number of resources explicitly tracked for workflow execution. */
    trackedResourceCount: number;
    snapshot: RecommendationWorkflowSnapshot;
    createdAt: string;
    updatedAt: string;
}
export interface RecommendationWorkflowAllAffectedItem extends RecommendationWorkflowItemBase {
    selectionMode: 'all-affected';
    selectedResourceIds?: never;
}
export interface RecommendationWorkflowSelectedSubsetItem extends RecommendationWorkflowItemBase {
    selectionMode: 'selected-subset';
    selectedResourceIds: [string, ...string[]];
}
export interface RecommendationWorkflowSubscriptionWideItem extends RecommendationWorkflowItemBase {
    selectionMode: 'subscription-wide';
    selectedResourceIds?: never;
}
export type RecommendationWorkflowItem = RecommendationWorkflowAllAffectedItem | RecommendationWorkflowSelectedSubsetItem | RecommendationWorkflowSubscriptionWideItem;
export interface GetRecommendationWorkflowItemsQuery {
    providerName: ProviderName;
    companyId: string;
    providerScopeIds?: string[];
    lanes?: RecommendationWorkflowLane[];
    categories?: RecommendationWorkflowCategory[];
    search?: string;
    limit?: number;
}
export type GetRecommendationWorkflowItemsResponse = RecommendationWorkflowItem[];
export interface UpdateRecommendationWorkflowLaneRequest {
    lane: RecommendationWorkflowLane;
    laneOrder: number;
}
export interface PatchRecommendationWorkflowItemLaneRequest extends UpdateRecommendationWorkflowLaneRequest {
    updatedAt?: string;
}
export interface RecommendationWorkflowLaneBatchUpdateItem extends RecommendationWorkflowIdentity, UpdateRecommendationWorkflowLaneRequest {
    flowItemId?: string;
    updatedAt?: string;
}
export interface UpsertRecommendationWorkflowItemRequest extends RecommendationWorkflowIdentity {
    lane: RecommendationWorkflowLane;
    laneOrder: number;
    selectionMode: RecommendationWorkflowSelectionMode;
    selectedResourceIds?: string[];
    affectedResourceCount: number;
    trackedResourceCount?: number;
    snapshot: RecommendationWorkflowSnapshot;
    createdAt?: string;
    updatedAt?: string;
}
export interface BatchUpdateRecommendationWorkflowLanesRequest {
    providerName: ProviderName;
    companyId: string;
    updates: RecommendationWorkflowLaneBatchUpdateItem[];
}
export interface UpdateRecommendationWorkflowLaneResponse {
    success: boolean;
    item: RecommendationWorkflowItem;
}
export interface DeleteRecommendationWorkflowItemRequest {
    providerName: ProviderName;
    companyId: string;
    flowItemId: string;
}
export {};
//# sourceMappingURL=recommendationWorkflow.d.ts.map