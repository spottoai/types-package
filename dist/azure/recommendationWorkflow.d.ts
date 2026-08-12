import type { ProviderName, ProviderScope } from '../common/provider';
import type { SystemTrackCandidateReference, SystemTrackId, SystemTrackRecommendationCandidateReference, SystemTrackResourceCandidateReference } from './recommendationTracks';
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
declare const recommendationWorkflowConcurrencyTokenBrand: unique symbol;
/**
 * Opaque compare-and-set token returned by the API after it validates that the
 * underlying value is non-empty. Consumers must not parse or construct it.
 */
export type RecommendationWorkflowConcurrencyToken = string & {
    readonly [recommendationWorkflowConcurrencyTokenBrand]: 'RecommendationWorkflowConcurrencyToken';
};
declare const recommendationWorkflowRepairContinuationTokenBrand: unique symbol;
export type RecommendationWorkflowRepairContinuationToken = string & {
    readonly [recommendationWorkflowRepairContinuationTokenBrand]: 'RecommendationWorkflowRepairContinuationToken';
};
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
 * Canonical recommendation-granular board-item identity:
 * company + provider + providerScopeId + recommendationId.
 *
 * System-track resource items extend this identity with `resourceId`.
 */
export interface RecommendationWorkflowIdentity extends ProviderScope {
    companyId: string;
    recommendationId: string;
}
interface RecommendationWorkflowItemBase extends RecommendationWorkflowIdentity {
    /** Stable workflow row identifier used by route params in update endpoints. */
    flowItemId: string;
    /** Azure compatibility projection of providerScopeId. */
    subscriptionId?: string;
    /** Numeric order value within a lane. */
    laneOrder: number;
    /** Optional user-defined horizontal swimlane. */
    swimLaneId?: string;
    /** Number of resources currently affected by the recommendation. */
    affectedResourceCount: number;
    /** Number of resources explicitly tracked for workflow execution. */
    trackedResourceCount: number;
    snapshot: RecommendationWorkflowSnapshot;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    /** Current token required by every subsequent existing-row mutation. */
    concurrencyToken: RecommendationWorkflowConcurrencyToken;
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
type RecommendationWorkflowSelection = RecommendationWorkflowAllAffectedSelection | RecommendationWorkflowSelectedSubsetSelection | RecommendationWorkflowSubscriptionWideSelection;
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
interface RecommendationWorkflowManualOrigin {
    origin: 'manual';
    systemTrackId?: never;
    sourceCardGranularity?: never;
    sourceFingerprint?: never;
    sourceChangedAt?: never;
    sourceChangeKind?: never;
}
interface RecommendationWorkflowSystemTrackOriginBase {
    origin: 'system-track';
    systemTrackId: SystemTrackId;
    sourceFingerprint: string;
    sourceChangedAt?: string;
    sourceChangeKind?: 'changed' | 'detected-again';
}
interface RecommendationWorkflowSystemTrackRecommendationOrigin extends RecommendationWorkflowSystemTrackOriginBase {
    sourceCardGranularity: 'recommendation';
}
interface RecommendationWorkflowSystemTrackResourceOrigin extends RecommendationWorkflowSystemTrackOriginBase {
    sourceCardGranularity: 'resource';
    /** Canonical resource identity that makes this workflow item independently movable. */
    resourceId: string;
}
interface RecommendationWorkflowSingleResourceSelection {
    selectionMode: 'selected-subset';
    selectedResourceIds: [string];
}
export type RecommendationWorkflowManualItem = RecommendationWorkflowItemBase & RecommendationWorkflowManualOrigin & RecommendationWorkflowSelection & RecommendationWorkflowLaneState;
export type RecommendationWorkflowSystemTrackRecommendationItem = RecommendationWorkflowItemBase & RecommendationWorkflowSystemTrackRecommendationOrigin & (RecommendationWorkflowAllAffectedSelection | RecommendationWorkflowSubscriptionWideSelection) & RecommendationWorkflowLaneState;
export type RecommendationWorkflowSystemTrackResourceItem = RecommendationWorkflowItemBase & RecommendationWorkflowSystemTrackResourceOrigin & RecommendationWorkflowSingleResourceSelection & RecommendationWorkflowLaneState;
export type RecommendationWorkflowItem = RecommendationWorkflowManualItem | RecommendationWorkflowSystemTrackRecommendationItem | RecommendationWorkflowSystemTrackResourceItem;
export type RecommendationWorkflowAllAffectedItem = RecommendationWorkflowItem & RecommendationWorkflowAllAffectedSelection;
export type RecommendationWorkflowSelectedSubsetItem = RecommendationWorkflowItem & RecommendationWorkflowSelectedSubsetSelection;
export type RecommendationWorkflowSubscriptionWideItem = RecommendationWorkflowItem & RecommendationWorkflowSubscriptionWideSelection;
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
    blockedAt?: never;
    blockedBy?: never;
}
export interface RecommendationWorkflowBlockedLaneMutation extends RecommendationWorkflowLaneMutationBase {
    lane: 'blocked';
    blockedReason: string;
    reviewAt?: string;
    blockedAt?: never;
    blockedBy?: never;
}
type RecommendationWorkflowLaneMutation = RecommendationWorkflowNonBlockedLaneMutation | RecommendationWorkflowBlockedLaneMutation;
export type PatchRecommendationWorkflowItemLaneRequest = RecommendationWorkflowLaneMutation & {
    swimLaneId?: string | null;
    concurrencyToken: RecommendationWorkflowConcurrencyToken;
};
export type RecommendationWorkflowLaneBatchUpdateItem = RecommendationWorkflowIdentity & PatchRecommendationWorkflowItemLaneRequest & {
    flowItemId: string;
};
type RecommendationWorkflowManualMutationBase = RecommendationWorkflowIdentity & {
    origin: 'manual';
    swimLaneId?: string | null;
    affectedResourceCount: number;
    trackedResourceCount?: number;
    snapshot: RecommendationWorkflowSnapshot;
    systemTrackId?: never;
    sourceCardGranularity?: never;
    sourceFingerprint?: never;
    sourceChangedAt?: never;
    sourceChangeKind?: never;
};
type RecommendationWorkflowManualMutation = RecommendationWorkflowManualMutationBase & RecommendationWorkflowSelection & RecommendationWorkflowLaneMutation;
export type ManualCreateRecommendationWorkflowItemRequest = RecommendationWorkflowManualMutation & {
    operation: 'create';
    concurrencyToken?: never;
};
export type ManualUpdateRecommendationWorkflowItemRequest = RecommendationWorkflowManualMutation & {
    operation: 'update';
    concurrencyToken: RecommendationWorkflowConcurrencyToken;
};
export type RecommendationWorkflowSystemTrackDestination = RecommendationWorkflowLaneMutation & {
    swimLaneId?: string | null;
};
interface RecommendationWorkflowSystemTrackMutationBase extends ProviderScope {
    companyId: string;
    origin: 'system-track';
    candidate: SystemTrackCandidateReference;
    destination: RecommendationWorkflowSystemTrackDestination;
    snapshot?: never;
    affectedResourceCount?: never;
    trackedResourceCount?: never;
    selectionMode?: never;
    selectedResourceIds?: never;
    systemTrackId?: never;
    sourceCardGranularity?: never;
    sourceFingerprint?: never;
    sourceChangedAt?: never;
    sourceChangeKind?: never;
    blockedReason?: never;
    reviewAt?: never;
    blockedAt?: never;
    blockedBy?: never;
}
export interface SystemTrackRecommendationCreateRecommendationWorkflowItemRequest extends RecommendationWorkflowSystemTrackMutationBase {
    operation: 'create';
    candidate: SystemTrackRecommendationCandidateReference;
    concurrencyToken?: never;
}
export interface SystemTrackRecommendationUpdateRecommendationWorkflowItemRequest extends RecommendationWorkflowSystemTrackMutationBase {
    operation: 'update';
    candidate: SystemTrackRecommendationCandidateReference;
    concurrencyToken: RecommendationWorkflowConcurrencyToken;
}
export interface SystemTrackResourceCreateRecommendationWorkflowItemRequest extends RecommendationWorkflowSystemTrackMutationBase {
    operation: 'create';
    candidate: SystemTrackResourceCandidateReference;
    concurrencyToken?: never;
}
export interface SystemTrackResourceUpdateRecommendationWorkflowItemRequest extends RecommendationWorkflowSystemTrackMutationBase {
    operation: 'update';
    candidate: SystemTrackResourceCandidateReference;
    concurrencyToken: RecommendationWorkflowConcurrencyToken;
}
export type SystemTrackCandidateCreateRecommendationWorkflowItemRequest = SystemTrackRecommendationCreateRecommendationWorkflowItemRequest | SystemTrackResourceCreateRecommendationWorkflowItemRequest;
export type SystemTrackCandidateUpdateRecommendationWorkflowItemRequest = SystemTrackRecommendationUpdateRecommendationWorkflowItemRequest | SystemTrackResourceUpdateRecommendationWorkflowItemRequest;
export type UpsertRecommendationWorkflowItemRequest = ManualCreateRecommendationWorkflowItemRequest | ManualUpdateRecommendationWorkflowItemRequest | SystemTrackCandidateCreateRecommendationWorkflowItemRequest | SystemTrackCandidateUpdateRecommendationWorkflowItemRequest;
export interface BatchUpdateRecommendationWorkflowLanesRequest {
    providerName: ProviderName;
    companyId: string;
    updates: [RecommendationWorkflowLaneBatchUpdateItem, ...RecommendationWorkflowLaneBatchUpdateItem[]];
}
export interface UpdateRecommendationWorkflowLaneResponse {
    success: true;
    item: RecommendationWorkflowItem;
}
export interface RecommendationWorkflowConcurrencyConflictResponse {
    success: false;
    status: 409;
    errorCode: 'recommendation-workflow-conflict';
    message: string;
    /** Included only after the API authorizes the caller for the workflow item. */
    currentItem: RecommendationWorkflowItem;
}
export interface DeleteRecommendationWorkflowItemRequest {
    providerName: ProviderName;
    companyId: string;
    flowItemId: string;
    concurrencyToken: RecommendationWorkflowConcurrencyToken;
}
export declare const RECOMMENDATION_WORKFLOW_REPAIR_PAGE_LIMIT: 250;
export interface RecommendationWorkflowRepairRequest extends ProviderScope {
    mode: 'dry-run' | 'apply';
    companyId: string;
    idempotencyKey: string;
    continuationToken?: RecommendationWorkflowRepairContinuationToken;
}
interface RecommendationWorkflowRepairResultBase {
    processedCount: number;
    eligibleCount: number;
    skippedCount: number;
    conflictedCount: number;
    failedCount: number;
}
interface RecommendationWorkflowRepairDryRunResult extends RecommendationWorkflowRepairResultBase {
    mode: 'dry-run';
    wouldCreateCount: number;
    createdCount?: never;
}
interface RecommendationWorkflowRepairApplyResult extends RecommendationWorkflowRepairResultBase {
    mode: 'apply';
    createdCount: number;
    wouldCreateCount?: never;
}
interface RecommendationWorkflowRepairCompletePage {
    hasMore: false;
    continuationToken?: never;
}
interface RecommendationWorkflowRepairContinuedPage {
    hasMore: true;
    continuationToken: RecommendationWorkflowRepairContinuationToken;
}
export type RecommendationWorkflowRepairResponse = (RecommendationWorkflowRepairDryRunResult | RecommendationWorkflowRepairApplyResult) & (RecommendationWorkflowRepairCompletePage | RecommendationWorkflowRepairContinuedPage);
export {};
//# sourceMappingURL=recommendationWorkflow.d.ts.map