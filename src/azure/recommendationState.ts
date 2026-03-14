import type { ProviderName, ProviderScope } from '../common/provider';

export type CommentScope = 'resource' | 'providerScope';

export type ResourceRecommendationStatesQuery = {
  providerName: ProviderName;
  scope: 'resource';
  resourceId: string;
  recommendationId?: string;
  providerScopeId?: string;
};

export type ProviderScopeRecommendationStatesQuery = {
  providerName: ProviderName;
  scope: 'providerScope';
  providerScopeId: string;
  recommendationId?: string;
  resourceId?: string;
};

/** @deprecated Use ProviderScopeRecommendationStatesQuery */
export type SubscriptionRecommendationStatesQuery =
  ProviderScopeRecommendationStatesQuery;

export type LegacyGetRecommendationStatesQuery =
  | {
      providerName: ProviderName;
      resourceId: string;
      recommendationId?: string;
      providerScopeId?: string;
    }
  | {
      providerName: ProviderName;
      recommendationId?: string;
      resourceId?: string;
      providerScopeId: string;
    };

export type GetRecommendationStatesQuery =
  | ResourceRecommendationStatesQuery
  | ProviderScopeRecommendationStatesQuery
  | LegacyGetRecommendationStatesQuery;

/** Base state interface for recommendations */
export interface RecommendationState extends ProviderScope {
  /**
   * Scope discriminator for recommendation commentary identity.
   * Optional for backward compatibility with legacy payloads.
   */
  scope?: CommentScope;
  /** Partition Key: resourceId (Hash) */
  resourceId: string;
  /**
   * Deprecated alias retained for compatibility with older UI consumers.
   * Prefer `providerScopeId`.
   */
  subscriptionId?: string;
  /** Row Key */
  recommendationId: string;
  /** Company ID to which the resource belongs */
  companyId: string;
  category: 'Cost' | 'Performance' | 'Security' | 'Compliance' | 'Reliability' | 'Operational Excellence';
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  /** true if the user has read the recommendation */
  read: boolean;
  status: 'Active' | 'Prioritized' | 'Dismissed' | 'Archived';
  /** Date the recommendation was scheduled for */
  scheduledAt?: Date;
  /** Date the recommendation state was created */
  createdAt: Date;
  /** Date the recommendation state was last updated */
  updatedAt?: Date;
  /** true if the recommendation is flagged */
  flagged: boolean;
  comments: Comment[];
  /** ID of the pinned comment */
  pinnedCommentId?: string;
  history: RecommendationHistory[];
  custom: boolean;
  /** Date when the status started */
  statusStartAt?: string;
  /** Date when the status is expected to change */
  statusEndAt?: string;
}

export type ResourceRecommendationStateWriteRequest = RecommendationState & {
  scope: 'resource';
  resourceId: string;
  providerScopeId: string;
};

export type ProviderScopeRecommendationStateWriteRequest = Omit<
  RecommendationState,
  'resourceId'
> & {
  scope: 'providerScope';
  providerScopeId: string;
  resourceId?: string;
};

/** @deprecated Use ProviderScopeRecommendationStateWriteRequest */
export type SubscriptionRecommendationStateWriteRequest =
  ProviderScopeRecommendationStateWriteRequest;

export type SaveRecommendationStateRequest =
  | ResourceRecommendationStateWriteRequest
  | ProviderScopeRecommendationStateWriteRequest;

export interface RecommendationHistory {
  userId: string;
  createdAt: Date;
  /** restore means back from dismissed state */
  action: 'Dismiss' | 'Restore' | 'Prioritize' | 'Unprioritize' | 'Implement';
  reason?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}
