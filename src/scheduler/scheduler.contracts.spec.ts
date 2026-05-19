import type {
  BaseScheduleWriteRequest,
  ScheduleDocument,
  SchedulerBatchRunItem,
} from '../index';

const resourceOperationSchedule: ScheduleDocument = {
  scheduleId: 'schedule-1',
  name: 'Weekday VM runtime',
  targetType: 'resource-operation',
  selectorType: 'single-resource',
  scheduleType: 'recurring',
  status: 'active',
  timezone: 'Pacific/Auckland',
  cronExpression: '0 8 * * 1-5',
  nextRunUtc: '2026-05-19T20:00:00.000Z',
  createdAtUtc: '2026-05-19T00:00:00.000Z',
  updatedAtUtc: '2026-05-19T00:00:00.000Z',
  companyId: 'company-1',
  providerName: 'azure',
  providerScopeId: 'subscription-1',
  cloudAccountId: 'cloud-account-1',
  resourceId:
    '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1',
  actionDefinitionId: 'compute-virtualmachines_start',
};

const schedulerBatchRunItem: SchedulerBatchRunItem = {
  scheduleId: 'schedule-1',
  scheduleRunId: 'run-1',
  targetType: 'resource-operation',
  scheduleType: 'recurring',
  providerScopeId: 'subscription-1',
  cloudAccountId: 'cloud-account-1',
  resourceId:
    '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1',
  actionDefinitionId: 'compute-virtualmachines_deallocate',
};

const writeRequest: BaseScheduleWriteRequest = {
  name: 'Weekday VM runtime',
  targetType: 'resource-operation',
  selectorType: 'single-resource',
  providerName: 'azure',
  providerScopeId: 'subscription-1',
  cloudAccountId: 'cloud-account-1',
  resourceId:
    '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1',
  actionDefinitionId: 'compute-virtualmachines_start',
};

void resourceOperationSchedule;
void schedulerBatchRunItem;
void writeRequest;
