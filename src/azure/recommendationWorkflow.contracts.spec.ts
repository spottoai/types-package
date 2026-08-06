import { ProviderName } from '../common/provider';
import type {
  BatchUpdateRecommendationWorkflowLanesRequest,
  DeleteRecommendationWorkflowItemRequest,
  GetRecommendationWorkflowItemsQuery,
  GetRecommendationWorkflowItemsResponse,
  ManualCreateRecommendationWorkflowItemRequest,
  ManualUpdateRecommendationWorkflowItemRequest,
  PatchRecommendationWorkflowItemLaneRequest,
  RecommendationWorkflowConcurrencyConflictResponse,
  RecommendationWorkflowConcurrencyToken,
  RecommendationWorkflowItem,
  RecommendationWorkflowRepairContinuationToken,
  RecommendationWorkflowRepairRequest,
  RecommendationWorkflowRepairResponse,
  SystemTrackCandidateCreateRecommendationWorkflowItemRequest,
  SystemTrackCandidateUpdateRecommendationWorkflowItemRequest,
  UpsertRecommendationWorkflowItemRequest,
  UpdateRecommendationWorkflowLaneResponse,
} from './recommendationWorkflow';

const workflowToken = 'opaque:workflow-1' as RecommendationWorkflowConcurrencyToken;
const nextWorkflowToken = 'opaque:workflow-2' as RecommendationWorkflowConcurrencyToken;
const repairContinuation = 'opaque:repair-page-2' as RecommendationWorkflowRepairContinuationToken;

const boardQuery: GetRecommendationWorkflowItemsQuery = {
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  providerScopeIds: ['sub-123', 'sub-456'],
  lanes: ['prioritized', 'todo'],
  categories: ['Cost', 'Reliability'],
  search: 'right-size',
  limit: 100,
};

const manualItem: RecommendationWorkflowItem = {
  flowItemId: 'flow-sub-123-rec-manual',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  subscriptionId: 'sub-123',
  recommendationId: 'rec-manual',
  companyId: 'comp-123',
  origin: 'manual',
  lane: 'todo',
  laneOrder: 1000,
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
  concurrencyToken: workflowToken,
};

const systemRecommendationItem: RecommendationWorkflowItem = {
  flowItemId: 'flow-sub-123-rec-123',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  companyId: 'comp-123',
  origin: 'system-track',
  systemTrackId: 'capacity-rightsizing',
  sourceCardGranularity: 'recommendation',
  sourceFingerprint: 'sha256:rightsizing',
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
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
  concurrencyToken: workflowToken,
};

const systemSubscriptionWideItem: RecommendationWorkflowItem = {
  ...systemRecommendationItem,
  flowItemId: 'flow-sub-123-rec-subscription',
  recommendationId: 'rec-subscription',
  selectionMode: 'subscription-wide',
};

const systemResourceItem: RecommendationWorkflowItem = {
  ...manualItem,
  flowItemId: 'flow-sub-123-rec-resource',
  recommendationId: 'rec-resource',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1',
  selectedResourceIds: ['/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1'],
  origin: 'system-track',
  systemTrackId: 'backup-recovery',
  sourceCardGranularity: 'resource',
  sourceFingerprint: 'sha256:resource',
  sourceChangedAt: '2026-04-02T00:00:00.000Z',
  sourceChangeKind: 'changed',
};

// @ts-expect-error Resource-granular system-track items represent exactly one resource.
const invalidMultiResourceSystemItem: RecommendationWorkflowItem = {
  ...systemResourceItem,
  selectedResourceIds: [
    '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1',
    '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-2',
  ],
};

const blockedItem: RecommendationWorkflowItem = {
  ...systemResourceItem,
  lane: 'blocked',
  blockedAt: '2026-04-02T00:00:00.000Z',
  blockedBy: 'user-123',
  blockedReason: 'Waiting for the customer contract renewal.',
  reviewAt: '2026-05-01T00:00:00.000Z',
};

const boardResponse: GetRecommendationWorkflowItemsResponse = [
  manualItem,
  systemRecommendationItem,
  systemSubscriptionWideItem,
  systemResourceItem,
  blockedItem,
];

const patchLaneRequest: PatchRecommendationWorkflowItemLaneRequest = {
  lane: 'completed',
  laneOrder: 9999,
  concurrencyToken: workflowToken,
};

const blockLaneRequest: PatchRecommendationWorkflowItemLaneRequest = {
  lane: 'blocked',
  laneOrder: 9999,
  blockedReason: 'Waiting for an approved maintenance window.',
  reviewAt: '2026-05-01T00:00:00.000Z',
  concurrencyToken: nextWorkflowToken,
};

const manualCreate: ManualCreateRecommendationWorkflowItemRequest = {
  operation: 'create',
  origin: 'manual',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-manual',
  companyId: 'comp-123',
  lane: 'prioritized',
  laneOrder: 1000,
  swimLaneId: null,
  selectionMode: 'all-affected',
  affectedResourceCount: 120,
  snapshot: systemRecommendationItem.snapshot,
};

const manualUpdate: ManualUpdateRecommendationWorkflowItemRequest = {
  ...manualCreate,
  operation: 'update',
  concurrencyToken: workflowToken,
};

const systemRecommendationCreate: SystemTrackCandidateCreateRecommendationWorkflowItemRequest = {
  operation: 'create',
  origin: 'system-track',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  companyId: 'comp-123',
  candidate: {
    systemTrackId: 'capacity-rightsizing',
    recommendationId: 'rec-123',
    sourceFingerprint: 'sha256:rightsizing',
    granularity: 'recommendation',
  },
  destination: {
    lane: 'prioritized',
    laneOrder: 1000,
  },
};

const systemResourceCreate: SystemTrackCandidateCreateRecommendationWorkflowItemRequest = {
  operation: 'create',
  origin: 'system-track',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  companyId: 'comp-123',
  candidate: {
    systemTrackId: 'resource-hygiene',
    recommendationId: 'rec-resource',
    sourceFingerprint: 'sha256:resource',
    granularity: 'resource',
    resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1',
  },
  destination: {
    lane: 'todo',
    laneOrder: 2000,
    swimLaneId: 'platform-team',
  },
};

const systemResourceBlockedCreate: SystemTrackCandidateCreateRecommendationWorkflowItemRequest = {
  ...systemResourceCreate,
  destination: {
    lane: 'blocked',
    laneOrder: 3000,
    blockedReason: 'Waiting for an approved maintenance window.',
    reviewAt: '2026-08-15T00:00:00.000Z',
  },
};

const systemRecommendationUpdate: SystemTrackCandidateUpdateRecommendationWorkflowItemRequest = {
  ...systemRecommendationCreate,
  operation: 'update',
  concurrencyToken: workflowToken,
};

const systemResourceUpdate: SystemTrackCandidateUpdateRecommendationWorkflowItemRequest = {
  ...systemResourceCreate,
  operation: 'update',
  concurrencyToken: nextWorkflowToken,
};

const allUpserts: UpsertRecommendationWorkflowItemRequest[] = [
  manualCreate,
  manualUpdate,
  systemRecommendationCreate,
  systemResourceCreate,
  systemResourceBlockedCreate,
  systemRecommendationUpdate,
  systemResourceUpdate,
];

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
      concurrencyToken: workflowToken,
    },
  ],
};

const laneResponse: UpdateRecommendationWorkflowLaneResponse = {
  success: true,
  item: systemRecommendationItem,
};

const concurrencyConflict: RecommendationWorkflowConcurrencyConflictResponse = {
  success: false,
  status: 409,
  errorCode: 'recommendation-workflow-conflict',
  message: 'The workflow item changed after it was loaded.',
  currentItem: systemRecommendationItem,
};

const deleteWorkflowItemRequest: DeleteRecommendationWorkflowItemRequest = {
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  flowItemId: 'flow-sub-123-rec-123',
  concurrencyToken: workflowToken,
};

const repairDryRunRequest: RecommendationWorkflowRepairRequest = {
  mode: 'dry-run',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  companyId: 'comp-123',
  idempotencyKey: 'repair-123',
};

const repairApplyRequest: RecommendationWorkflowRepairRequest = {
  ...repairDryRunRequest,
  mode: 'apply',
  continuationToken: repairContinuation,
};

const repairDryRunResult: RecommendationWorkflowRepairResponse = {
  mode: 'dry-run',
  processedCount: 20,
  eligibleCount: 3,
  wouldCreateCount: 2,
  skippedCount: 1,
  conflictedCount: 0,
  failedCount: 0,
  hasMore: false,
};

const repairApplyResult: RecommendationWorkflowRepairResponse = {
  mode: 'apply',
  processedCount: 20,
  eligibleCount: 3,
  createdCount: 2,
  skippedCount: 1,
  conflictedCount: 0,
  failedCount: 0,
  hasMore: true,
  continuationToken: repairContinuation,
};

void boardQuery;
void boardResponse;
void patchLaneRequest;
void blockLaneRequest;
void allUpserts;
void batchLaneUpdateRequest;
void laneResponse;
void concurrencyConflict;
void deleteWorkflowItemRequest;
void repairApplyRequest;
void repairDryRunResult;
void repairApplyResult;

// @ts-expect-error companyId is required.
const invalidQueryMissingCompanyId: GetRecommendationWorkflowItemsQuery = {
  providerName: ProviderName.Azure,
};

// @ts-expect-error PATCH requires the current opaque token.
const invalidTokenlessPatch: PatchRecommendationWorkflowItemLaneRequest = {
  lane: 'todo',
  laneOrder: 100,
};

const invalidPlainStringTokenPatch: PatchRecommendationWorkflowItemLaneRequest = {
  lane: 'todo',
  laneOrder: 100,
  // @ts-expect-error unvalidated strings are not opaque concurrency tokens.
  concurrencyToken: '',
};

const invalidTokenlessBatch: BatchUpdateRecommendationWorkflowLanesRequest = {
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  updates: [
    // @ts-expect-error every batch item requires a token.
    {
      flowItemId: 'flow-1',
      providerName: ProviderName.Azure,
      providerScopeId: 'sub-123',
      recommendationId: 'rec-123',
      companyId: 'comp-123',
      lane: 'todo',
      laneOrder: 100,
    },
  ],
};

// @ts-expect-error Return/delete requires the current opaque token.
const invalidTokenlessDelete: DeleteRecommendationWorkflowItemRequest = {
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  flowItemId: 'flow-1',
};

// @ts-expect-error manual update requires the current token.
const invalidTokenlessManualUpdate: ManualUpdateRecommendationWorkflowItemRequest = {
  ...manualCreate,
  operation: 'update',
};

const invalidTokenOnManualCreate: ManualCreateRecommendationWorkflowItemRequest = {
  ...manualCreate,
  // @ts-expect-error create form cannot carry an existing-row token.
  concurrencyToken: workflowToken,
};

// @ts-expect-error system update requires the current token.
const invalidTokenlessSystemUpdate: SystemTrackCandidateUpdateRecommendationWorkflowItemRequest = {
  ...systemRecommendationCreate,
  operation: 'update',
};

const invalidTokenOnSystemCreate: SystemTrackCandidateCreateRecommendationWorkflowItemRequest = {
  ...systemRecommendationCreate,
  // @ts-expect-error create form cannot carry an existing-row token.
  concurrencyToken: workflowToken,
};

// @ts-expect-error system acceptance cannot author the server-derived snapshot.
const invalidSystemSnapshot: UpsertRecommendationWorkflowItemRequest = {
  ...systemRecommendationCreate,
  snapshot: systemRecommendationItem.snapshot,
};

const invalidSystemRanking: UpsertRecommendationWorkflowItemRequest = {
  ...systemRecommendationCreate,
  // @ts-expect-error system acceptance cannot author ranking evidence.
  rank: 1,
};

const invalidManualProvenance: UpsertRecommendationWorkflowItemRequest = {
  ...manualCreate,
  // @ts-expect-error manual writes cannot claim system provenance.
  systemTrackId: 'capacity-rightsizing',
};

const invalidResourceCandidateWithoutResource: UpsertRecommendationWorkflowItemRequest = {
  ...systemResourceCreate,
  // @ts-expect-error resource-granular candidate identity requires one resource.
  candidate: {
    systemTrackId: 'resource-hygiene',
    recommendationId: 'rec-resource',
    sourceFingerprint: 'sha256:resource',
    granularity: 'resource',
  },
};

const invalidRecommendationCandidateWithResource: UpsertRecommendationWorkflowItemRequest = {
  ...systemRecommendationCreate,
  // @ts-expect-error recommendation-granular candidate identity cannot carry a resource.
  candidate: {
    systemTrackId: 'capacity-rightsizing',
    recommendationId: 'rec-123',
    sourceFingerprint: 'sha256:rightsizing',
    granularity: 'recommendation',
    resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1',
  },
};

// @ts-expect-error selection is derived from the verified recommendation candidate.
const invalidSystemSelection: UpsertRecommendationWorkflowItemRequest = {
  ...systemRecommendationCreate,
  selectionMode: 'selected-subset',
};

const invalidSystemBlockedWithoutReason: UpsertRecommendationWorkflowItemRequest = {
  ...systemResourceCreate,
  // @ts-expect-error Blocked candidate destinations require a reason.
  destination: {
    lane: 'blocked',
    laneOrder: 3000,
  },
};

const invalidSystemClientAuthoredBlocker: UpsertRecommendationWorkflowItemRequest = {
  ...systemResourceCreate,
  destination: {
    lane: 'blocked',
    laneOrder: 3000,
    blockedReason: 'Waiting',
    // @ts-expect-error Blocked actor/time are server-authored after candidate validation.
    blockedBy: 'user-123',
  },
};

// @ts-expect-error recommendation-origin read items cannot use selected-subset.
const invalidRecommendationReadSelection: RecommendationWorkflowItem = {
  ...systemRecommendationItem,
  selectionMode: 'selected-subset',
  selectedResourceIds: ['/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1'],
};

// @ts-expect-error resource-origin read items must use selected-subset.
const invalidResourceReadSelection: RecommendationWorkflowItem = {
  ...systemResourceItem,
  selectionMode: 'all-affected',
};

// @ts-expect-error blocked mutations require a reason.
const invalidBlockedWithoutReason: PatchRecommendationWorkflowItemLaneRequest = {
  lane: 'blocked',
  laneOrder: 100,
  concurrencyToken: workflowToken,
};

const invalidClientAuthoredBlocker: PatchRecommendationWorkflowItemLaneRequest = {
  lane: 'blocked',
  laneOrder: 100,
  blockedReason: 'Waiting',
  concurrencyToken: workflowToken,
  // @ts-expect-error blocker actor and time are server-authored.
  blockedAt: '2026-04-02T00:00:00.000Z',
};

// @ts-expect-error non-Blocked read items cannot retain blocker metadata.
const invalidActiveItemWithBlocker: RecommendationWorkflowItem = {
  ...systemRecommendationItem,
  lane: 'todo',
  blockedAt: '2026-04-02T00:00:00.000Z',
  blockedBy: 'user-123',
  blockedReason: 'Stale blocker',
};

const invalidConcurrencyConflictStatus: RecommendationWorkflowConcurrencyConflictResponse = {
  success: false,
  // @ts-expect-error workflow concurrency conflicts use exactly HTTP 409.
  status: 412,
  errorCode: 'recommendation-workflow-conflict',
  message: 'Invalid',
  currentItem: systemRecommendationItem,
};

// @ts-expect-error repair requests must be bounded to one provider scope.
const invalidUnboundedRepair: RecommendationWorkflowRepairRequest = {
  mode: 'dry-run',
  providerName: ProviderName.Azure,
  companyId: 'comp-123',
  idempotencyKey: 'repair-all-scopes',
};

const invalidRepairContinuation: RecommendationWorkflowRepairRequest = {
  ...repairDryRunRequest,
  // @ts-expect-error continuation tokens must come from the corresponding API result.
  continuationToken: 'page-2',
};

// @ts-expect-error complete repair results cannot expose a continuation token.
const invalidCompleteRepairResult: RecommendationWorkflowRepairResponse = {
  ...repairDryRunResult,
  hasMore: false,
  continuationToken: repairContinuation,
};

void invalidQueryMissingCompanyId;
void invalidTokenlessPatch;
void invalidPlainStringTokenPatch;
void invalidTokenlessBatch;
void invalidTokenlessDelete;
void invalidTokenlessManualUpdate;
void invalidTokenOnManualCreate;
void invalidTokenlessSystemUpdate;
void invalidTokenOnSystemCreate;
void invalidSystemSnapshot;
void invalidSystemRanking;
void invalidManualProvenance;
void invalidResourceCandidateWithoutResource;
void invalidRecommendationCandidateWithResource;
void invalidSystemSelection;
void invalidSystemBlockedWithoutReason;
void invalidSystemClientAuthoredBlocker;
void invalidRecommendationReadSelection;
void invalidResourceReadSelection;
void invalidBlockedWithoutReason;
void invalidClientAuthoredBlocker;
void invalidActiveItemWithBlocker;
void invalidConcurrencyConflictStatus;
void invalidUnboundedRepair;
void invalidRepairContinuation;
void invalidCompleteRepairResult;
