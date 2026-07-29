import {
  ProviderName,
  ProviderScopeType,
  type AwsProviderSyncProgress,
  type AzureProviderSyncProgress,
  type ProviderSyncProgress,
  type ProviderSyncStageProgress,
  type SubscriptionSyncProgressStepStatus,
  type SyncProgressStatus,
} from '../index';

const awsStage = {
  id: 'discovery',
  label: 'Discover resources',
  order: 1,
  status: 'inProgress',
  statusLabel: 'Discovering AWS resources',
  expectedWorkItemCount: 12,
  completedWorkItemCount: 7,
  startedAt: '2026-07-30T01:00:00.000Z',
  updatedAt: '2026-07-30T01:02:00.000Z',
} satisfies ProviderSyncStageProgress;

const awsSyncProgress = {
  providerName: ProviderName.Aws,
  providerScopeId: '123456789012',
  scopeType: ProviderScopeType.Account,
  cloudAccountId: 'aws-cloud-account-123',
  runId: 'run-123',
  overallStatus: 'processing',
  statusLabel: 'Scanning AWS account',
  currentStageId: 'discovery',
  requestedAt: '2026-07-30T00:59:00.000Z',
  startedAt: '2026-07-30T01:00:00.000Z',
  updatedAt: '2026-07-30T01:02:00.000Z',
  lastSuccessfulSyncAt: '2026-07-29T01:00:00.000Z',
  summary: {
    totalStages: 8,
    completedStages: 2,
    failedStages: 0,
    activeStages: 1,
  },
  stages: [awsStage],
} satisfies AwsProviderSyncProgress;

const idleAzureSyncProgress = {
  providerName: ProviderName.Azure,
  providerScopeId: '12345678-1234-1234-1234-123456789012',
  scopeType: ProviderScopeType.Subscription,
  cloudAccountId: 'azure-cloud-account-123',
  overallStatus: 'idle',
  statusLabel: 'Not currently syncing',
  summary: {
    totalStages: 0,
    completedStages: 0,
    failedStages: 0,
    activeStages: 0,
  },
  stages: [],
} satisfies AzureProviderSyncProgress;

const providerSyncProgress: ProviderSyncProgress[] = [awsSyncProgress, idleAzureSyncProgress];
const sharedProgressStatus: SyncProgressStatus = awsSyncProgress.overallStatus;
const subscriptionStepStatus: SubscriptionSyncProgressStepStatus = awsStage.status;

const invalidAwsScopeType: AwsProviderSyncProgress = {
  ...awsSyncProgress,
  // @ts-expect-error AWS progress must identify an account provider scope.
  scopeType: ProviderScopeType.Subscription,
};

const invalidOverallStatus: AwsProviderSyncProgress = {
  ...awsSyncProgress,
  // @ts-expect-error AWS engine statuses must be mapped to the shared public status vocabulary.
  overallStatus: 'in-progress',
};

const invalidStageStatus: ProviderSyncStageProgress = {
  ...awsStage,
  // @ts-expect-error AWS engine stage statuses must be mapped to the shared public status vocabulary.
  status: 'deferred',
};

const invalidStageWithChildRequestIds: ProviderSyncStageProgress = {
  ...awsStage,
  // @ts-expect-error Engine-owned child request IDs are not public progress fields.
  childRequestIds: ['child-request-123'],
};

const invalidProgressWithRequestId: AwsProviderSyncProgress = {
  ...awsSyncProgress,
  // @ts-expect-error Engine request IDs must not cross the public progress boundary.
  requestId: 'engine-request-123',
};

const invalidProgressWithRawFailureReason: AwsProviderSyncProgress = {
  ...awsSyncProgress,
  // @ts-expect-error Raw engine failure reasons must be mapped to sanitized failure details.
  failureReason: 'AccessDenied: internal provider context',
};

void [
  providerSyncProgress,
  sharedProgressStatus,
  subscriptionStepStatus,
  invalidAwsScopeType,
  invalidOverallStatus,
  invalidStageStatus,
  invalidStageWithChildRequestIds,
  invalidProgressWithRequestId,
  invalidProgressWithRawFailureReason,
];
