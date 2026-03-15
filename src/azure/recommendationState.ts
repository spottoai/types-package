import type { ProviderName, ProviderScope } from '../common/provider';

export type CommentScope = 'resource' | 'providerScope';

export type ResourceRecommendationStatesQuery = {
  providerName: ProviderName;
  scope: 'resource';
  resourceId: string;
  recommendationId: string;
  providerScopeId?: never;
};

export type ProviderScopeRecommendationStatesQuery = {
  providerName: ProviderName;
  scope: 'providerScope';
  providerScopeId: string;
  recommendationId: string;
  resourceId?: never;
};

/** @deprecated Use ProviderScopeRecommendationStatesQuery */
export type SubscriptionRecommendationStatesQuery = ProviderScopeRecommendationStatesQuery;

/** @deprecated Use GetRecommendationStatesQuery */
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
  | ProviderScopeRecommendationStatesQuery;

/** Shared recommendation-state properties across scope variants. */
export interface RecommendationStateBase extends ProviderScope {
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

export interface ResourceRecommendationState extends RecommendationStateBase {
  /**
   * Scope discriminator for recommendation commentary identity.
   * Resource scope identity is keyed by `resourceId + recommendationId`.
   */
  scope: 'resource';
  /** Partition Key: resourceId (Hash) */
  resourceId: string;
}

export interface ProviderScopeRecommendationState extends RecommendationStateBase {
  /**
   * Scope discriminator for recommendation commentary identity.
   * Provider scope identity is keyed by `providerScopeId + recommendationId`.
   */
  scope: 'providerScope';
  /** Provider-scope commentary must not rely on resource identity. */
  resourceId?: never;
}

export type RecommendationState = ResourceRecommendationState | ProviderScopeRecommendationState;

/** @deprecated Use RecommendationState */
export type LegacyRecommendationState = RecommendationStateBase & {
  scope?: CommentScope;
  resourceId: string;
};

/** @deprecated Use RecommendationState */
export type RecommendationStateRecord = RecommendationState | LegacyRecommendationState;

export type ResourceRecommendationStateWriteRequest = ResourceRecommendationState;
export type ProviderScopeRecommendationStateWriteRequest = ProviderScopeRecommendationState;

/** @deprecated Use ProviderScopeRecommendationStateWriteRequest */
export type SubscriptionRecommendationStateWriteRequest = ProviderScopeRecommendationStateWriteRequest;

export type SaveRecommendationStateRequest = ResourceRecommendationStateWriteRequest | ProviderScopeRecommendationStateWriteRequest;

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
