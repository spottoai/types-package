import type {
  RecommendationActionScheduleProjection,
  RecommendationActionScheduleCommand,
  ScheduleCommand,
  RecommendationActionScheduleWriteRequest,
  ScheduleListResponse,
  ScheduleProjection,
  ScheduleWriteRequest,
  ScheduledOccurrenceV1,
  ScheduledRecommendationActionV1,
} from './schedulerContracts';
import type { ResourceStrategyWeeklyScheduleWriteRequest } from './resourceStrategyContracts';

const onceRecommendationAction: RecommendationActionScheduleWriteRequest = {
  definitionType: 'recommendation-action',
  name: 'Apply recommendation',
  timezone: 'Pacific/Auckland',
  trigger: { triggerType: 'once', localDateTime: '2026-09-17T10:00' },
  providerScopeId: 'subscription-1',
  cloudAccountId: 'cloud-account-1',
  recommendationId: 'recommendation-1',
  operation: 'implement',
  target: {
    selectorType: 'single-resource',
    resourceId: '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
  },
  initialMode: 'active',
};

const recurringRecommendationAction: RecommendationActionScheduleWriteRequest = {
  ...onceRecommendationAction,
  trigger: { triggerType: 'recurring', cronExpression: '0 8 * * 1-5' },
  target: {
    selectorType: 'selected-resources',
    resourceIds: [
      '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
      '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-2',
    ],
  },
};

const resourceWeeklyDefinition = undefined as unknown as ResourceStrategyWeeklyScheduleWriteRequest;
const resourceScheduleWriteRequest: ScheduleWriteRequest = resourceWeeklyDefinition;
const recommendationScheduleWriteRequest: ScheduleWriteRequest = onceRecommendationAction;
const recommendationPause: RecommendationActionScheduleCommand = { command: 'pause', idempotencyKey: 'pause-1' };
const scheduleCommand: ScheduleCommand = recommendationPause;

const recommendationProjection: RecommendationActionScheduleProjection = {
  scheduleId: 'schedule-1',
  definitionRevision: 1,
  controlGeneration: 1,
  etag: 'etag-1',
  status: 'active',
  definition: onceRecommendationAction,
  nextOccurrenceAtUtc: '2026-09-16T22:00:00.000Z',
  createdAtUtc: '2026-09-16T00:00:00.000Z',
  createdBy: 'user-1',
  updatedAtUtc: '2026-09-16T00:00:00.000Z',
  updatedBy: 'user-1',
};

const scheduleProjection: ScheduleProjection = recommendationProjection;
const scheduleList: ScheduleListResponse = {
  results: [scheduleProjection],
  continuation: { cursor: 'next-page' },
};

const scheduledRecommendationAction: ScheduledRecommendationActionV1 = {
  schemaVersion: 1,
  definitionType: 'recommendation-action',
  companyId: 'company-1',
  providerScopeId: 'subscription-1',
  cloudAccountId: 'cloud-account-1',
  scheduleId: 'schedule-1',
  definitionRevision: 1,
  controlGeneration: 1,
  occurrenceKey: 'recommendation-action|schedule-1|2026-09-16T22:00:00.000Z',
  scheduleRunId: 'run-1',
  dueAtUtc: '2026-09-16T22:00:00.000Z',
  recommendationId: 'recommendation-1',
  operation: 'implement',
  target: onceRecommendationAction.target,
  configuration: {},
  correlationId: 'correlation-1',
};

const scheduledOccurrence: ScheduledOccurrenceV1 = scheduledRecommendationAction;

const invalidOperation: RecommendationActionScheduleWriteRequest = {
  ...onceRecommendationAction,
  // @ts-expect-error Recommendation scheduling exposes only the implement operation.
  operation: 'apply',
};

const invalidLegacyTarget: RecommendationActionScheduleWriteRequest = {
  ...onceRecommendationAction,
  // @ts-expect-error The new definition does not retain the legacy targetType field.
  targetType: 'recommendation-action',
};

const invalidSelectedResources: RecommendationActionScheduleWriteRequest = {
  ...onceRecommendationAction,
  // @ts-expect-error Selected-resource targets require a non-empty resourceIds array.
  target: { selectorType: 'selected-resources' },
};

void [
  recurringRecommendationAction,
  resourceScheduleWriteRequest,
  recommendationScheduleWriteRequest,
  scheduleCommand,
  scheduleList,
  scheduledOccurrence,
  invalidOperation,
  invalidLegacyTarget,
  invalidSelectedResources,
];
