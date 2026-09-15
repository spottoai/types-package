import type { BaseScheduleWriteRequest, ScheduleDocument, SchedulerBatchRunItem, ScheduleWriteRequest } from './scheduler';

const recommendationSchedule: ScheduleDocument = {
  scheduleId: 'schedule-1',
  name: 'Apply recommendation',
  targetType: 'recommendation-action',
  selectorType: 'single-resource',
  scheduleType: 'once',
  status: 'active',
  timezone: 'Pacific/Auckland',
  localDateTime: '2026-09-15T10:00',
  nextRunUtc: '2026-09-14T22:00:00.000Z',
  createdAtUtc: '2026-09-15T00:00:00.000Z',
  updatedAtUtc: '2026-09-15T00:00:00.000Z',
  companyId: 'company-1',
  providerName: 'azure',
  providerScopeId: 'subscription-1',
  resourceId: '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1',
  recommendationId: 'recommendation-1',
  recommendationAction: 'apply',
};

const schedulerBatchRunItem: SchedulerBatchRunItem = {
  scheduleId: 'schedule-1',
  scheduleRunId: 'run-1',
  targetType: 'recommendation-action',
  selectorType: 'single-resource',
  scheduleType: 'once',
  providerScopeId: 'subscription-1',
  resourceId: recommendationSchedule.resourceId,
  recommendationId: 'recommendation-1',
  recommendationAction: 'apply',
};

const writeRequest: BaseScheduleWriteRequest = {
  name: 'Apply recommendation',
  targetType: 'recommendation-action',
  selectorType: 'single-resource',
  providerName: 'azure',
  providerScopeId: 'subscription-1',
  recommendationId: 'recommendation-1',
  recommendationAction: 'apply',
};

const recurringProviderScopeRequest: ScheduleWriteRequest = {
  name: 'Refresh provider scope',
  targetType: 'provider-scope-operation',
  selectorType: 'provider-scope',
  providerName: 'azure',
  providerScopeId: 'subscription-1',
  scheduleType: 'recurring',
  cronExpression: '0 8 * * 1-5',
  timezone: 'Pacific/Auckland',
};

const invalidResourceOperation: BaseScheduleWriteRequest = {
  ...writeRequest,
  // @ts-expect-error Resource mutations use ResourceStrategyScheduleWriteRequest.
  targetType: 'resource-operation',
};

void [recommendationSchedule, schedulerBatchRunItem, writeRequest, recurringProviderScopeRequest, invalidResourceOperation];
