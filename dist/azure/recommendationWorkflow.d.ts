import type { ProviderName, ProviderScope } from '../common/provider';
import type { SystemTrackCardGranularity, SystemTrackId } from './recommendationTracks';
export declare const RecommendationWorkflowLanes: {
    readonly prioritized: "prioritized";
    readonly todo: "todo";
    readonly inProgress: "in-progress";
    readonly blocked: "blocked";
    readonly completed: "completed";
};
export type RecommendationWorkflowLane = (typeof RecommendationWorkflowLanes)[keyof typeof RecommendationWorkflowLanes];
export type RecommendationWorkflowNonBlockedLane = Exclude<RecommendationWorkflowLane, 'blocked'>;
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
    /** Numeric order value within a lane. */
    laneOrder: number;
    /** Optional user-defined horizontal swimlane. Absence means Unassigned or the originating system track. */
    swimLaneId?: string;
    /** Number of resources currently affected by the recommendation. */
    affectedResourceCount: number;
    /** Number of resources explicitly tracked for workflow execution. */
    trackedResourceCount: number;
    snapshot: RecommendationWorkflowSnapshot;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    /** Opaque compare-and-set token supplied by the API for guarded mutations. */
    concurrencyToken?: string;
    /** Originating system track for touched Spotto suggestions. */
    systemTrackId?: SystemTrackId;
    origin?: 'manual' | 'system-track';
    sourceCardGranularity?: SystemTrackCardGranularity;
    sourceFingerprint?: string;
    sourceChangedAt?: string;
    sourceChangeKind?: 'changed' | 'detected-again';
}
interface RecommendationWorkflowAllAffectedSelection {
    selectionMode: 'all-affected';
    selectedResourceIds?: never;
}
interface RecommendationWorkflowSelectedSubsetSelection {
    selectionMode: 'selected-subset';
    selectedResourceIds: [string, ...string[]];
}
interface RecommendationWorkflowSubscriptionWideSelection {
    selectionMode: 'subscription-wide';
    selectedResourceIds?: never;
}
export interface RecommendationWorkflowNonBlockedLaneState {
    lane: RecommendationWorkflowNonBlockedLane;
    blockedAt?: never;
    blockedBy?: never;
    blockedReason?: never;
    reviewAt?: never;
}
export interface RecommendationWorkflowBlockedLaneState {
    lane: 'blocked';
    blockedAt: string;
    blockedBy: string;
    blockedReason: string;
    reviewAt?: string;
}
export type RecommendationWorkflowLaneState = RecommendationWorkflowNonBlockedLaneState | RecommendationWorkflowBlockedLaneState;
export type RecommendationWorkflowAllAffectedItem = RecommendationWorkflowItemBase & RecommendationWorkflowAllAffectedSelection & RecommendationWorkflowLaneState;
export type RecommendationWorkflowSelectedSubsetItem = RecommendationWorkflowItemBase & RecommendationWorkflowSelectedSubsetSelection & RecommendationWorkflowLaneState;
export type RecommendationWorkflowSubscriptionWideItem = RecommendationWorkflowItemBase & RecommendationWorkflowSubscriptionWideSelection & RecommendationWorkflowLaneState;
export type RecommendationWorkflowItem = RecommendationWorkflowAllAffectedItem | RecommendationWorkflowSelectedSubsetItem | RecommendationWorkflowSubscriptionWideItem;
export interface GetRecommendationWorkflowItemsQuery {
    providerName: ProviderName;
    companyId: string;
    providerScopeIds?: string[];
    lanes?: RecommendationWorkflowLane[];
    swimLaneIds?: string[];
    categories?: RecommendationWorkflowCategory[];
    search?: string;
    limit?: number;
}
export type GetRecommendationWorkflowItemsResponse = RecommendationWorkflowItem[];
interface RecommendationWorkflowLaneMutationBase {
    laneOrder: number;
}
export interface RecommendationWorkflowNonBlockedLaneMutation extends RecommendationWorkflowLaneMutationBase {
    lane: RecommendationWorkflowNonBlockedLane;
    blockedReason?: never;
    reviewAt?: never;
}
export interface RecommendationWorkflowBlockedLaneMutation extends RecommendationWorkflowLaneMutationBase {
    lane: 'blocked';
    blockedReason: string;
    reviewAt?: string;
}
export type UpdateRecommendationWorkflowLaneRequest = RecommendationWorkflowNonBlockedLaneMutation | RecommendationWorkflowBlockedLaneMutation;
export type PatchRecommendationWorkflowItemLaneRequest = UpdateRecommendationWorkflowLaneRequest & {
    updatedAt?: string;
    swimLaneId?: string | null;
    concurrencyToken?: string;
};
export type RecommendationWorkflowLaneBatchUpdateItem = RecommendationWorkflowIdentity & PatchRecommendationWorkflowItemLaneRequest & {
    flowItemId?: string;
};
interface RecommendationWorkflowUpsertBase extends RecommendationWorkflowIdentity {
    laneOrder: number;
    swimLaneId?: string | null;
    affectedResourceCount: number;
    trackedResourceCount?: number;
    snapshot: RecommendationWorkflowSnapshot;
    systemTrackId?: SystemTrackId;
    origin?: 'manual' | 'system-track';
    sourceCardGranularity?: SystemTrackCardGranularity;
    sourceFingerprint?: string;
    createdAt?: string;
    updatedAt?: string;
    concurrencyToken?: string;
}
type RecommendationWorkflowSelectionMutation = RecommendationWorkflowAllAffectedSelection | RecommendationWorkflowSelectedSubsetSelection | RecommendationWorkflowSubscriptionWideSelection;
export type UpsertRecommendationWorkflowItemRequest = RecommendationWorkflowUpsertBase & RecommendationWorkflowSelectionMutation & UpdateRecommendationWorkflowLaneRequest;
export interface BatchUpdateRecommendationWorkflowLanesRequest {
    providerName: ProviderName;
    companyId: string;
    updates: RecommendationWorkflowLaneBatchUpdateItem[];
}
export interface UpdateRecommendationWorkflowLaneResponse {
    success: true;
    item: RecommendationWorkflowItem;
}
export interface RecommendationWorkflowConcurrencyConflictResponse {
    success: false;
    status: 409 | 412;
    errorCode: 'recommendation-workflow-conflict';
    message: string;
    currentItem: RecommendationWorkflowItem;
}
export interface DeleteRecommendationWorkflowItemRequest {
    providerName: ProviderName;
    companyId: string;
    flowItemId: string;
    concurrencyToken?: string;
}
export {};
//# sourceMappingURL=recommendationWorkflow.d.ts.map