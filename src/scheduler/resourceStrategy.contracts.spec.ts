import type {
  ResourceSchedulePermissionManifestConsent,
  ResourceSchedulePermissionManifestProjection,
  ResourceSchedulePreviewRequest,
  ResourceSchedulePreviewResponse,
  ResourceSchedulingCapabilityProjection,
  ResourceSchedulingExecutionProjection,
  ResourceSchedulingExecutionHistoryResponse,
  ResourceSchedulingOpportunity,
  ResourceSchedulingReadinessProjection,
  ResourceStrategyWeeklyScheduleSuggestion,
  ResourceStrategyWeeklyScheduleProjection,
  ResourceStrategyWeeklyScheduleWriteRequest,
  ScheduledResourceTransitionV1,
} from './resourceStrategy';

// @ts-expect-error Direct cutover removes the previous generic compatibility alias.
import type { ResourceScheduleDefinition } from './resourceStrategy';

const timestamp = '2026-09-15T00:00:00.000Z';
const resourceId = '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1';
const capabilityRef = {
  capabilityId: 'azure.compute.virtual-machines.runtime',
  capabilityVersion: 1,
} as const;

const capability = {
  capability: capabilityRef,
  contentHash: 'sha256:capability',
  publishedAtUtc: timestamp,
  provider: 'azure',
  resourceTypes: ['Microsoft.Compute/virtualMachines'],
  strategy: 'on-off',
  displayName: 'Virtual machine runtime',
  description: 'Schedule when the virtual machine should be available.',
  configurationSchemaKind: 'weekly-paired-transitions',
  configurationSchema: {},
  recommendationMaturity: 'supported',
  lifecycleStatus: 'published',
  executionPolicy: {
    authoring: 'allowed',
    reduce: 'allowed',
    restore: 'allowed',
  },
  baseline: {
    policy: 'capture-selected-state',
    mutationDomains: ['availability'],
    driftPolicy: 'restore-captured',
  },
  cost: {
    billingClass: 'A-meter-stops',
    reducedMeters: ['Virtual machine compute'],
    retainedMeters: ['Managed disks'],
    commitmentInteraction: 'may-reduce-invoice-saving',
  },
  cadence: {
    minimumTransitionIntervalMinutes: 30,
    maximumReducedDurationMinutes: 10080,
  },
  disruption: {
    reversibility: 'reversible',
    risk: 'medium',
    affectedScopeLabel: 'Virtual machine',
    supportedBusyPolicies: ['skip', 'wait-until-deadline'],
  },
  restore: {
    restoreLeadMinutes: 10,
    capacityReturnRisk: 'possible',
    retryPolicyLabel: 'Restore retry policy',
    escalationClass: 'resource-availability',
  },
  automation: {
    ownership: 'spotto',
    conflictingControllerLabels: [],
  },
  dependencies: {
    hasDependencies: false,
  },
  evidence: {
    sourceUrls: [],
    labResult: 'passed',
    verifiedAtUtc: timestamp,
    expiresAtUtc: null,
  },
} satisfies ResourceSchedulingCapabilityProjection;

const writeRequest = {
  definitionType: 'resource-strategy-weekly',
  providerScopeId: 'sub-1',
  cloudAccountId: 'account-1',
  resourceId,
  capability: capabilityRef,
  name: 'Weekday availability',
  timezone: 'Pacific/Auckland',
  defaultParameters: {},
  rules: [
    {
      ruleId: 'weekday-restore',
      transition: 'restore',
      daysOfWeek: [1, 2, 3, 4, 5],
      desiredStateAtLocal: '08:00',
    },
    {
      ruleId: 'weekday-reduce',
      transition: 'reduce',
      daysOfWeek: [1, 2, 3, 4, 5],
      desiredStateAtLocal: '18:00',
    },
  ],
  busyPolicy: { mode: 'skip' },
  blackoutDatesLocal: ['2026-12-25'],
  initialMode: 'active',
  notificationPolicyId: 'notification-policy-1',
  notes: 'Keep the current UI behavior.',
} satisfies ResourceStrategyWeeklyScheduleWriteRequest;

const suggestion = {
  definitionType: 'resource-strategy-weekly',
  capability: capabilityRef,
  rules: writeRequest.rules,
  busyPolicy: { mode: 'skip' },
} satisfies ResourceStrategyWeeklyScheduleSuggestion;

const schedule = {
  scheduleId: 'schedule-1',
  definitionRevision: 1,
  controlGeneration: 1,
  etag: 'etag-1',
  status: 'active',
  definition: writeRequest,
  permissionManifest: { version: 'manifest-v1', contentHash: 'sha256:manifest' },
  createdAtUtc: timestamp,
  createdBy: 'user-1',
  updatedAtUtc: timestamp,
  updatedBy: 'user-1',
} satisfies ResourceStrategyWeeklyScheduleProjection;

const readiness = {
  companyId: 'company-1',
  cloudAccountId: 'account-1',
  providerScopeId: 'sub-1',
  resourceId,
  capability: capabilityRef,
  state: 'missing-permission',
  checkedAtUtc: timestamp,
  expiresAtUtc: '2026-09-15T00:05:00.000Z',
  reasonCodes: ['AZURE_RBAC_PROPAGATING'],
  missingActions: ['Microsoft.Compute/virtualMachines/start/action'],
  requiredScopes: [resourceId],
  repairLink: '/cloud-accounts/account-1/permissions',
} satisfies ResourceSchedulingReadinessProjection;

const run = {
  schemaVersion: 1,
  companyId: 'company-1',
  providerScopeId: 'sub-1',
  cloudAccountId: 'account-1',
  resourceId,
  scheduleId: schedule.scheduleId,
  definitionRevision: schedule.definitionRevision,
  controlGeneration: schedule.controlGeneration,
  ruleId: 'weekday-reduce',
  occurrenceKey: '2026-09-15T18:00:00+12:00',
  scheduleRunId: 'schedule-run-1',
  desiredStateAtUtc: timestamp,
  dispatchNotBeforeUtc: timestamp,
  reduceDeadlineUtc: '2026-09-15T00:15:00.000Z',
  capability: capabilityRef,
  transition: 'reduce',
  parameters: {},
  permissionManifest: { version: 'manifest-v1', contentHash: 'sha256:manifest' },
  correlationId: 'correlation-1',
} satisfies ScheduledResourceTransitionV1;

const execution = {
  companyId: 'company-1',
  resourceId,
  scheduleId: schedule.scheduleId,
  definitionRevision: schedule.definitionRevision,
  controlGeneration: schedule.controlGeneration,
  lifecycleState: 'restore-failed',
  activeRecoveryCycleId: 'recovery-1',
  restoreOwed: true,
  lastRun: {
    scheduleRunId: 'schedule-run-2',
    transition: 'restore',
    outcome: 'failed',
    desiredStateAtUtc: timestamp,
    updatedAtUtc: timestamp,
    reasonCode: 'AZURE_RBAC_DENIED',
  },
  allowedCommands: ['restore-now', 'leave-current-state'],
  updatedAtUtc: timestamp,
} satisfies ResourceSchedulingExecutionProjection;

const executionHistory = {
  execution,
  runs: [
    {
      scheduleRunId: 'schedule-run-2',
      resourceId,
      transition: 'restore',
      desiredStateAtUtc: timestamp,
      claimedAtUtc: timestamp,
      completedAtUtc: timestamp,
      outcome: 'failed',
      reasonCode: 'AZURE_RBAC_DENIED',
      attemptCount: 1,
    },
  ],
} satisfies ResourceSchedulingExecutionHistoryResponse;

const previewRequest = {
  draft: writeRequest,
  draftHash: 'sha256:draft',
  evidenceReferences: ['billing-evidence-1'],
  concurrency: { requestVersion: 3 },
  draftPeriodKeys: ['weekday'],
} satisfies ResourceSchedulePreviewRequest;

const previewResponse = {
  draftHash: previewRequest.draftHash,
  requestVersion: 3,
  availability: 'available',
  aggregate: {
    measure: 'savings',
    amount: '42.50',
    basis: 'amortized',
    provenance: 'billing-backed',
    period: { startDate: '2026-08-01', endDate: '2026-08-31' },
    currency: 'NZD',
    additivity: 'scenario',
    evidenceObservedAtUtc: timestamp,
    coverage: 'complete',
    components: [{ componentId: 'virtual-machine-compute', amount: '42.50', unit: '1/Hour', tier: 'D2s_v5' }],
  },
  windows: [
    {
      draftPeriodKey: 'weekday',
      availability: 'available',
      projection: {
        measure: 'savings',
        amount: '42.50',
        basis: 'amortized',
        provenance: 'billing-backed',
        period: { startDate: '2026-08-01', endDate: '2026-08-31' },
        currency: 'NZD',
        additivity: 'scenario',
        evidenceObservedAtUtc: timestamp,
        coverage: 'complete',
        components: [{ componentId: 'virtual-machine-compute', amount: '42.50', unit: '1/Hour', tier: 'D2s_v5' }],
      },
    },
  ],
} satisfies ResourceSchedulePreviewResponse;

const opportunity = {
  opportunityId: 'opportunity-1',
  provider: 'azure',
  providerScopeId: 'sub-1',
  cloudAccountId: 'account-1',
  resourceId,
  capability: capabilityRef,
  suggestedDefinition: suggestion,
  projectionAvailability: 'available',
  projection: previewResponse.aggregate,
  observedAtUtc: timestamp,
} satisfies ResourceSchedulingOpportunity;

const manifest = {
  schemaVersion: 1,
  provider: 'azure',
  version: 'manifest-v1',
  contentHash: 'sha256:manifest',
  capabilityVersions: [capabilityRef],
  orderedGrantGroupHashes: ['sha256:group'],
  grantGroups: [
    {
      groupHash: 'sha256:group',
      provider: 'azure',
      providerScopeId: 'sub-1',
      exactAssignmentScope: resourceId,
      operationSetHash: 'sha256:operations',
      principalRef: 'write-service-principal',
      roleDefinitionRef: 'role-definition-1',
      roleName: 'Spotto Resource Scheduling sha256-group',
      roleDefinitionScope: '/subscriptions/sub-1',
      roleAssignmentRef: 'role-assignment-1',
      actions: [
        {
          operation: 'Microsoft.Compute/virtualMachines/start/action',
          permissionSetRefs: ['compute-virtualmachines_start'],
          reason: 'Restore the virtual machine for its availability window.',
          evidenceUrl: 'https://learn.microsoft.com/azure/virtual-machines/states-billing',
        },
      ],
      dataActions: [],
    },
  ],
  generatedAtUtc: timestamp,
  evidenceObservedAtUtc: timestamp,
  expiresAtUtc: null,
  reviewStatus: 'current',
  change: {
    status: 'new',
    addedOperations: [
      {
        groupHash: 'sha256:group',
        providerScopeId: 'sub-1',
        exactAssignmentScope: resourceId,
        operationKind: 'action',
        operation: 'Microsoft.Compute/virtualMachines/start/action',
      },
    ],
    removedOperations: [],
  },
} satisfies ResourceSchedulePermissionManifestProjection;

const consent = {
  version: manifest.version,
  contentHash: manifest.contentHash,
  orderedGrantGroupHashes: manifest.grantGroups.map(group => group.groupHash),
} satisfies ResourceSchedulePermissionManifestConsent;

const invalidAction: ResourceStrategyWeeklyScheduleWriteRequest = {
  ...writeRequest,
  // @ts-expect-error Clients cannot select an Action.
  actionDefinitionId: 'compute-virtualmachines_deallocate',
};

const invalidSupersededDiscriminator: ResourceStrategyWeeklyScheduleWriteRequest = {
  ...writeRequest,
  // @ts-expect-error The original public discriminator remains authoritative.
  definitionType: 'resource-strategy',
};

const invalidDesiredModeRule: ResourceStrategyWeeklyScheduleWriteRequest = {
  ...writeRequest,
  rules: [
    {
      ruleId: 'wrong-contract',
      daysOfWeek: [1],
      desiredStateAtLocal: '08:00',
      // @ts-expect-error Public rules retain reduce/restore transitions.
      targetMode: 'normal',
    },
  ],
};

const invalidExecutableSuggestion: ResourceStrategyWeeklyScheduleSuggestion = {
  ...suggestion,
  // @ts-expect-error Recommendation suggestions cannot choose an Azure cloud account.
  cloudAccountId: 'account-1',
};

// @ts-expect-error A complete executable write request cannot be reused as a non-executable suggestion.
const invalidSuggestionFromWriteRequest: ResourceStrategyWeeklyScheduleSuggestion = writeRequest;

void [
  capability,
  schedule,
  readiness,
  run,
  execution,
  previewResponse,
  opportunity,
  manifest,
  consent,
  invalidAction,
  invalidSupersededDiscriminator,
  invalidDesiredModeRule,
  invalidExecutableSuggestion,
  invalidSuggestionFromWriteRequest,
  undefined as unknown as ResourceScheduleDefinition,
];
