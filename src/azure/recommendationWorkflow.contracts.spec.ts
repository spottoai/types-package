import { ProviderName } from '../common/provider';
import type {
  BatchUpdateRecommendationWorkflowLanesRequest,
  DeleteRecommendationWorkflowItemRequest,
  GetRecommendationWorkflowItemsQuery,
  GetRecommendationWorkflowItemsResponse,
  PatchRecommendationWorkflowItemLaneRequest,
  RecommendationWorkflowItem,
  UpsertRecommendationWorkflowItemRequest,
  UpdateRecommendationWorkflowLaneResponse,
} from './recommendationWorkflow';

const boardQuery: GetRecommendationWorkflowItemsQuery = {
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  providerScopeIds: ['sub-123', 'sub-456'],
  lanes: ['prioritized', 'todo'],
  categories: ['Cost', 'Reliability'],
  search: 'right-size',
  limit: 100,
};

const allAffectedItem: RecommendationWorkflowItem = {
  flowItemId: 'flow-sub-123-rec-123',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  subscriptionId: 'sub-123',
  recommendationId: 'rec-123',
  companyId: 'comp-123',
  lane: 'prioritized',
  laneOrder: 1000,
  selectionMode: 'all-affected',
  affectedResourceCount: 120,
  trackedResourceCount: 120,
  snapshot: {
    title: 'Right-size underutilized VMs',
    category: 'Cost',
    impact: 'High',
    effort: 'Medium',
    subscriptionName: 'Production',
    savings: {
      minAmount: 1200,
      maxAmount: 2500,
      currencyCode: 'USD',
      currencySymbol: '$',
    },
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const selectedSubsetItem: RecommendationWorkflowItem = {
  flowItemId: 'flow-sub-123-rec-456',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-456',
  companyId: 'comp-123',
  lane: 'todo',
  laneOrder: 2000,
  selectionMode: 'selected-subset',
  selectedResourceIds: ['/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1'],
  affectedResourceCount: 40,
  trackedResourceCount: 1,
  snapshot: {
    title: 'Enable backup retention policy',
    category: 'Reliability',
    impact: 'Medium',
    effort: 'Low',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const subscriptionWideItem: RecommendationWorkflowItem = {
  flowItemId: 'flow-sub-123-rec-789',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-789',
  companyId: 'comp-123',
  lane: 'in-progress',
  laneOrder: 3000,
  selectionMode: 'subscription-wide',
  affectedResourceCount: 1,
  trackedResourceCount: 1,
  snapshot: {
    title: 'Enable subscription-wide diagnostic settings',
    category: 'Security',
    impact: 'High',
    effort: 'Medium',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const boardResponse: GetRecommendationWorkflowItemsResponse = [allAffectedItem, selectedSubsetItem, subscriptionWideItem];

const patchLaneRequest: PatchRecommendationWorkflowItemLaneRequest = {
  lane: 'completed',
  laneOrder: 9999,
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const upsertWorkflowItemRequest: UpsertRecommendationWorkflowItemRequest = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  companyId: 'comp-123',
  lane: 'prioritized',
  laneOrder: 1000,
  selectionMode: 'all-affected',
  affectedResourceCount: 120,
  snapshot: {
    title: 'Right-size underutilized VMs',
    category: 'Cost',
    impact: 'High',
    effort: 'Medium',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
};

const batchLaneUpdateRequest: BatchUpdateRecommendationWorkflowLanesRequest = {
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  updates: [
    {
      flowItemId: 'flow-sub-123-rec-123',
      providerName: ProviderName.Azure,
      providerScopeId: 'sub-123',
      recommendationId: 'rec-123',
      companyId: 'comp-123',
      lane: 'todo',
      laneOrder: 1200,
    },
    {
      providerName: ProviderName.Azure,
      providerScopeId: 'sub-123',
      recommendationId: 'rec-456',
      companyId: 'comp-123',
      lane: 'in-progress',
      laneOrder: 2200,
      updatedAt: '2026-04-01T00:00:00.000Z',
    },
  ],
};

const laneResponse: UpdateRecommendationWorkflowLaneResponse = {
  success: true,
  item: allAffectedItem,
};

const deleteWorkflowItemRequest: DeleteRecommendationWorkflowItemRequest = {
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  flowItemId: 'flow-sub-123-rec-123',
};

void boardQuery;
void boardResponse;
void patchLaneRequest;
void upsertWorkflowItemRequest;
void batchLaneUpdateRequest;
void laneResponse;
void deleteWorkflowItemRequest;

const invalidQueryMissingCompanyId: GetRecommendationWorkflowItemsQuery = {
  providerName: ProviderName.Azure,
  // @ts-expect-error companyId is required.
  providerScopeIds: ['sub-123'],
};

const invalidSelectedSubsetWithoutIds: RecommendationWorkflowItem = {
  ...selectedSubsetItem,
  selectionMode: 'selected-subset',
  // @ts-expect-error selected-subset requires at least one selected resource id.
  selectedResourceIds: [],
};

const invalidAllAffectedWithSelectedResources: RecommendationWorkflowItem = {
  ...allAffectedItem,
  selectionMode: 'all-affected',
  // @ts-expect-error all-affected must not carry explicit selectedResourceIds.
  selectedResourceIds: ['/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1'],
};

const invalidSubscriptionWideWithSelectedResources: RecommendationWorkflowItem = {
  ...subscriptionWideItem,
  selectionMode: 'subscription-wide',
  // @ts-expect-error subscription-wide must not carry explicit selectedResourceIds.
  selectedResourceIds: ['/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-2'],
};

const invalidLanePatchType: PatchRecommendationWorkflowItemLaneRequest = {
  // @ts-expect-error lane must be one of the workflow lane literals.
  lane: 'backlog',
  laneOrder: 100,
};

const invalidBatchMissingUpdates: BatchUpdateRecommendationWorkflowLanesRequest = {
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  // @ts-expect-error updates is required.
  lane: 'todo',
};

const invalidUpsertMissingSnapshot: UpsertRecommendationWorkflowItemRequest = {
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  companyId: 'comp-123',
  lane: 'prioritized',
  laneOrder: 1000,
  selectionMode: 'subscription-wide',
  affectedResourceCount: 1,
  // @ts-expect-error snapshot is required.
  trackedResourceCount: 1,
};

void invalidQueryMissingCompanyId;
void invalidSelectedSubsetWithoutIds;
void invalidAllAffectedWithSelectedResources;
void invalidSubscriptionWideWithSelectedResources;
void invalidLanePatchType;
void invalidBatchMissingUpdates;
void invalidUpsertMissingSnapshot;
