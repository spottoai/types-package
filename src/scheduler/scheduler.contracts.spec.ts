import type {
  ResourceScheduleDefinition,
  ResourceScheduleDefinitionWriteRequest,
  ScheduleWriteRequest,
  VmRuntimeWeeklyConfiguration,
} from './scheduler';

const compiledSchedule: ScheduleWriteRequest = {
  name: 'weekday-start',
  targetType: 'resource-operation',
  selectorType: 'single-resource',
  providerName: 'azure',
  providerScopeId: 'sub-123',
  resourceId:
    '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
  operation: 'start',
  scheduleType: 'recurring',
  cronExpression: '0 8 * * 1-5',
  timezone: 'Pacific/Auckland',
  definitionId: 'rsd-1',
  definitionClass: 'composite',
  definitionType: 'vm-runtime-weekly',
  scheduleGroupId: 'rsd-1',
  scheduleGroupType: 'resource-schedule-definition',
  compiledRuleId: 'rule-start-weekdays',
  compiledOperation: 'start',
};

void compiledSchedule;

const vmConfiguration: VmRuntimeWeeklyConfiguration = {
  startRules: [
    {
      ruleId: 'rule-start-weekdays',
      daysOfWeek: [1, 2, 3, 4, 5],
      timeLocal: '08:00',
    },
  ],
  deallocateRules: [
    {
      ruleId: 'rule-stop-weekdays',
      daysOfWeek: [1, 2, 3, 4, 5],
      timeLocal: '19:00',
    },
  ],
};

const vmDefinition: ResourceScheduleDefinition = {
  definitionId: 'rsd-1',
  definitionClass: 'composite',
  definitionType: 'vm-runtime-weekly',
  companyId: 'comp-123',
  providerName: 'azure',
  providerScopeId: 'sub-123',
  resourceId:
    '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
  targetResourceType: 'Microsoft.Compute/virtualMachines',
  name: 'Weekday runtime',
  timezone: 'Pacific/Auckland',
  status: 'active',
  configuration: vmConfiguration,
  compiledScheduleIds: ['schedule-1', 'schedule-2'],
  createdAtUtc: '2026-05-26T00:00:00.000Z',
  updatedAtUtc: '2026-05-26T00:00:00.000Z',
};

void vmDefinition;

const createVmDefinition: ResourceScheduleDefinitionWriteRequest = {
  definitionType: 'vm-runtime-weekly',
  name: 'Weekday runtime',
  providerName: 'azure',
  providerScopeId: 'sub-123',
  resourceId:
    '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
  timezone: 'Pacific/Auckland',
  configuration: vmConfiguration,
};

void createVmDefinition;

// @ts-expect-error vm-runtime-weekly definitions require composite rule configuration, not recommendation fields.
const invalidVmDefinition: ResourceScheduleDefinitionWriteRequest = {
  definitionType: 'vm-runtime-weekly',
  name: 'Broken runtime',
  providerName: 'azure',
  providerScopeId: 'sub-123',
  resourceId:
    '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
  timezone: 'Pacific/Auckland',
  recommendationId: 'compute-virtualmachines_schedule-shutdown-windows',
};

void invalidVmDefinition;
