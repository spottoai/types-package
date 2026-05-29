import type { ProviderName, ProviderScope } from '../common/provider';
export declare const RecommendationAuditRowKinds: {
    readonly resourceTarget: "resource-view:target";
    readonly subscriptionTarget: "scope-view:target";
    readonly resourceProviderScopeFeed: "resource-view:providerScope-feed";
    readonly subscriptionProviderScopeFeed: "scope-view:providerScope-feed";
};
export type RecommendationAuditRowKind = (typeof RecommendationAuditRowKinds)[keyof typeof RecommendationAuditRowKinds];
export type RecommendationAuditScope = 'resource' | 'subscription';
export type RecommendationAuditView = 'target' | 'providerScope-feed';
export interface RecommendationAuditQueryBase extends ProviderScope {
    /**
     * ISO timestamp lower bound (inclusive).
     * Omit to let consumers default to the contract-defined lookback window.
     */
    from?: string;
    /**
     * ISO timestamp upper bound (exclusive).
     * Omit to let consumers default to "now".
     */
    to?: string;
    /** Optional max rows to return (service-level cap still applies). */
    limit?: number;
    /**
     * Read-time request hint to append a `Viewed` audit event.
     * Services must suppress `Viewed` persistence for global `reader` and `admin`
     * actors, even when `trackView` is `true`.
     */
    trackView?: boolean;
}
export type ResourceTargetRecommendationAuditQuery = RecommendationAuditQueryBase & {
    scope: 'resource';
    view: 'target';
    recommendationId: string;
    resourceId: string;
};
export type SubscriptionTargetRecommendationAuditQuery = RecommendationAuditQueryBase & {
    scope: 'subscription';
    view: 'target';
    recommendationId: string;
    resourceId?: never;
};
export type ResourceProviderScopeFeedRecommendationAuditQuery = RecommendationAuditQueryBase & {
    scope: 'resource';
    view: 'providerScope-feed';
    recommendationId: string;
    resourceId?: never;
};
export type SubscriptionProviderScopeFeedRecommendationAuditQuery = RecommendationAuditQueryBase & {
    scope: 'subscription';
    view: 'providerScope-feed';
    recommendationId: string;
    resourceId?: never;
};
export type GetRecommendationAuditQueryCanonical = ResourceTargetRecommendationAuditQuery | SubscriptionTargetRecommendationAuditQuery | ResourceProviderScopeFeedRecommendationAuditQuery | SubscriptionProviderScopeFeedRecommendationAuditQuery;
export type GetRecommendationAuditQuery = GetRecommendationAuditQueryCanonical;
export type RecommendationAuditEventType = 'Viewed' | 'Added' | 'Archived' | 'CommentAdded' | 'CommentUpdated' | 'CommentDeleted' | 'CommentPinned' | 'CommentUnpinned' | 'Shared' | 'Dismissed' | 'Restored' | 'Prioritized' | 'Unprioritized' | 'Implementing' | 'Implemented' | 'ImplementationFailed';
/** Flat recommendation audit row columns as persisted in `recommendationsevents`. */
export interface RecommendationAuditEventRowColumns {
    CompanyId: string;
    ProviderName: ProviderName;
    ProviderScopeId: string;
    /** For Azure providers, mirrors `ProviderScopeId` (subscription id). */
    SubscriptionId: string;
    /** Storage row discriminator derived from query scope + view contract. */
    RowKind: RecommendationAuditRowKind;
    ResourceId?: string | null;
    RecommendationId: string;
    EventType: RecommendationAuditEventType;
    /** Stringified compact action metadata payload. */
    EventDetails?: string;
    UserId: string;
    /**
     * Optional actor display name.
     * May be missing/null for legacy rows or when identity enrichment is unavailable.
     */
    UserDisplayName?: string | null;
    Source: string;
    /** ISO timestamp for event creation. */
    Date: string;
    EventId: string;
}
export interface RecommendationAuditEventRow extends RecommendationAuditEventRowColumns {
    PartitionKey: string;
    RowKey: string;
}
/** Timeline-friendly response event DTO. */
export interface RecommendationAuditTimelineEvent {
    eventId: string;
    eventType: RecommendationAuditEventType;
    date: string;
    companyId: string;
    providerName: ProviderName;
    providerScopeId: string;
    subscriptionId: string;
    resourceId?: string | null;
    recommendationId: string;
    eventDetails?: string;
    userId: string;
    /**
     * Optional actor display name.
     * API may omit this when upstream rows do not contain `UserDisplayName`.
     */
    userDisplayName?: string | null;
    source: string;
    rowKind: RecommendationAuditRowKind;
}
/**
 * Canonical API response contract for recommendation audit reads.
 * The service returns a raw event array.
 */
export type RecommendationAuditQueryResponse = RecommendationAuditTimelineEvent[];
//# sourceMappingURL=recommendationAudit.d.ts.map