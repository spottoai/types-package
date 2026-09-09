import type {
  BaseScheduleWriteRequest,
  ResourceScheduleDefinition,
  ResourceScheduleDefinitionWriteRequest,
  ScheduleDocument,
  SchedulerBatchRunItem,
  ScheduleWriteRequest,
  VmRuntimeWeeklyConfiguration,
} from './scheduler';
import type {
  BastionAvailabilityStatusV1,
  BastionAvailabilityWeeklyScheduleDefinition,
  BastionAvailabilityWeeklyScheduleWriteRequest,
  BastionRemoveScheduleRun,
  BastionPauseResponse,
  BastionRestoreScheduleRun,
  BastionRestoreNowResponse,
  BastionScheduleControlV1,
  BastionScheduleReadinessV1,
} from './bastionSchedule';

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
  scheduleName: 'Weekday deallocate',
  targetType: 'resource-operation',
  selectorType: 'single-resource',
  scheduleType: 'recurring',
  providerScopeId: 'subscription-1',
  cloudAccountId: 'cloud-account-1',
  resourceId:
    '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1',
  actionDefinitionId: 'compute-virtualmachines_deallocate',
  compiledOperation: 'deallocate',
  targetCount: 1,
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

const invalidVmDefinition: ResourceScheduleDefinitionWriteRequest = {
  definitionType: 'vm-runtime-weekly',
  name: 'Broken runtime',
  providerName: 'azure',
  providerScopeId: 'sub-123',
  resourceId:
    '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
  timezone: 'Pacific/Auckland',
  // @ts-expect-error vm-runtime-weekly definitions require composite rule configuration, not recommendation fields.
  recommendationId: 'compute-virtualmachines_schedule-shutdown-windows',
};

void invalidVmDefinition;

const bastionWriteRequest = {
  definitionType: 'bastion-availability-weekly',
  name: 'Business-hours Bastion',
  providerName: 'azure',
  providerScopeId: 'sub-123',
  cloudAccountId: 'cloud-account-1',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Network/bastionHosts/bastion-1',
  timezone: 'Pacific/Auckland',
  acknowledgementVersion: 'bastion-delete-recreate-v1',
  configuration: {
    accessWindows: [
      {
        windowId: 'weekday-access',
        daysOfWeek: [1, 2, 3, 4, 5],
        accessStartTimeLocal: '08:00',
        accessEndTimeLocal: '18:00',
      },
    ],
  },
} satisfies BastionAvailabilityWeeklyScheduleWriteRequest;

const bastionDefinition = {
  ...bastionWriteRequest,
  definitionId: 'definition-1',
  definitionClass: 'composite',
  companyId: 'company-1',
  targetResourceType: 'Microsoft.Network/bastionHosts',
  definitionRevision: 1,
  status: 'active',
  createdAtUtc: '2026-09-09T00:00:00.000Z',
  updatedAtUtc: '2026-09-09T00:00:00.000Z',
} satisfies BastionAvailabilityWeeklyScheduleDefinition;

const invalidBastionDefinition: BastionAvailabilityWeeklyScheduleDefinition = {
  ...bastionDefinition,
  // @ts-expect-error Bastion definitions do not accept VM execution policies.
  executionPolicy: {},
};

const bastionRemoveRun: BastionRemoveScheduleRun = {
  scheduleId: 'schedule-remove-1',
  scheduleRunId: 'run-remove-1',
  targetType: 'resource-operation',
  selectorType: 'single-resource',
  scheduleType: 'recurring',
  providerScopeId: 'sub-123',
  cloudAccountId: 'cloud-account-1',
  resourceId: bastionWriteRequest.resourceId,
  definitionId: 'definition-1',
  definitionClass: 'composite',
  definitionType: 'bastion-availability-weekly',
  compiledRuleId: 'weekday-access-remove',
  compiledOperation: 'remove',
  definitionRevision: 1,
  controlGeneration: 2,
  scheduledForUtc: '2026-09-09T06:00:00.000Z',
};

const { controlGeneration: _bastionRemoveControlGeneration, ...bastionRemoveRunWithoutControl } = bastionRemoveRun;

const bastionRestoreRun: BastionRestoreScheduleRun = {
  ...bastionRemoveRunWithoutControl,
  scheduleId: 'schedule-restore-1',
  scheduleRunId: 'run-restore-1',
  compiledRuleId: 'weekday-access-restore',
  compiledOperation: 'restore',
  scheduledForUtc: '2026-09-08T19:30:00.000Z',
};

const bastionSchedulerRuns: SchedulerBatchRunItem[] = [bastionRemoveRun, bastionRestoreRun];

const invalidBastionRemoveRun: SchedulerBatchRunItem = {
  ...bastionRemoveRun,
  // @ts-expect-error remove runs require a positive control generation.
  controlGeneration: undefined,
};

const invalidBastionRestoreRun: SchedulerBatchRunItem = {
  ...bastionRestoreRun,
  // @ts-expect-error Bastion runs cannot carry client-selected action authority.
  actionDefinitionId: 'network-bastionhosts-delete',
};

const bastionControl = {
  schemaVersion: 1,
  companyId: 'company-1',
  resourceId: bastionWriteRequest.resourceId,
  definitionId: 'definition-1',
  definitionRevision: 1,
  controlGeneration: 2,
  desiredStatus: 'active',
  updatedAtUtc: '2026-09-09T00:00:00.000Z',
} satisfies BastionScheduleControlV1;

const bastionReadiness = {
  schemaVersion: 1,
  status: 'confirmed',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  subscriptionId: 'sub-123',
  resourceId: bastionWriteRequest.resourceId,
  requiredActions: ['Microsoft.Network/bastionHosts/read'],
  missingActions: [],
  checkedAtUtc: '2026-09-09T00:00:00.000Z',
} satisfies BastionScheduleReadinessV1;

const bastionStatus = {
  schemaVersion: 1,
  companyId: 'company-1',
  resourceId: bastionWriteRequest.resourceId,
  definitionId: 'definition-1',
  definitionRevision: 1,
  phase: 'absent',
  lastOperation: 'remove',
  lastResult: 'succeeded',
  snapshotCapturedAtUtc: '2026-09-09T00:00:00.000Z',
  restoreAvailable: true,
  updatedAtUtc: '2026-09-09T00:10:00.000Z',
} satisfies BastionAvailabilityStatusV1;

const bastionPause = {
  status: 'pause-pending',
  resourceId: bastionWriteRequest.resourceId,
  controlGeneration: 3,
  requestedAtUtc: '2026-09-09T00:11:00.000Z',
} satisfies BastionPauseResponse;

const bastionRestoreNow = {
  accepted: true,
  scheduleRunId: 'run-restore-now-1',
  resourceId: bastionWriteRequest.resourceId,
  requestedAtUtc: '2026-09-09T00:12:00.000Z',
} satisfies BastionRestoreNowResponse;

void [
  bastionDefinition,
  invalidBastionDefinition,
  _bastionRemoveControlGeneration,
  bastionRemoveRun,
  bastionRestoreRun,
  bastionSchedulerRuns,
  invalidBastionRemoveRun,
  invalidBastionRestoreRun,
  bastionControl,
  bastionReadiness,
  bastionStatus,
  bastionPause,
  bastionRestoreNow,
];
