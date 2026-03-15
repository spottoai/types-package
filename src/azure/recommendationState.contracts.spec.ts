import { ProviderName } from '../common/provider';
import type {
  Comment,
  GetRecommendationStatesQuery,
  LegacyGetRecommendationStatesQuery,
  ProviderScopeRecommendationStateWriteRequest,
  RecommendationHistory,
  SaveRecommendationStateRequest,
  SubscriptionRecommendationStateWriteRequest,
} from './recommendationState';

const sharedStateFields: Omit<ProviderScopeRecommendationStateWriteRequest, 'scope'> = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  companyId: 'comp-123',
  category: 'Cost',
  impact: 'High',
  effort: 'Low',
  read: false,
  status: 'Active',
  createdAt: new Date('2026-03-14T00:00:00.000Z'),
  flagged: false,
  integrationProviderName: 'jira',
  integrationTicketId: '33455',
  comments: [] as Comment[],
  history: [] as RecommendationHistory[],
  custom: false,
};

const resourceScopeQuery: GetRecommendationStatesQuery = {
  providerName: ProviderName.Azure,
  scope: 'resource',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
  recommendationId: 'rec-123',
};

const providerScopeQuery: GetRecommendationStatesQuery = {
  providerName: ProviderName.Azure,
  scope: 'providerScope',
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
};

const legacyQuery: LegacyGetRecommendationStatesQuery = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
};

const resourceScopeWrite: SaveRecommendationStateRequest = {
  ...sharedStateFields,
  scope: 'resource',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
};

const providerScopeWrite: SaveRecommendationStateRequest = {
  ...sharedStateFields,
  scope: 'providerScope',
};

const deprecatedSubscriptionWrite: SubscriptionRecommendationStateWriteRequest = {
  ...sharedStateFields,
  scope: 'providerScope',
};

void resourceScopeQuery;
void providerScopeQuery;
void legacyQuery;
void resourceScopeWrite;
void providerScopeWrite;
void deprecatedSubscriptionWrite;

// @ts-expect-error resource scope reads require recommendationId.
const invalidResourceRead: GetRecommendationStatesQuery = {
  providerName: ProviderName.Azure,
  scope: 'resource',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
};

// @ts-expect-error provider scope reads must not include resourceId.
const invalidProviderScopeRead: GetRecommendationStatesQuery = {
  providerName: ProviderName.Azure,
  scope: 'providerScope',
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
};

const invalidProviderScopeWrite: ProviderScopeRecommendationStateWriteRequest = {
  ...sharedStateFields,
  scope: 'providerScope',
  // @ts-expect-error providerScope scope forbids resource identity.
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/store1',
};

const invalidIntegrationTicketType: ProviderScopeRecommendationStateWriteRequest = {
  ...sharedStateFields,
  scope: 'providerScope',
  // @ts-expect-error integrationTicketId must be a string when provided.
  integrationTicketId: 33455,
};

void invalidResourceRead;
void invalidProviderScopeRead;
void invalidProviderScopeWrite;
void invalidIntegrationTicketType;
