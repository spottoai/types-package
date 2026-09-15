import assert from 'node:assert/strict';
import * as scheduler from '../dist/scheduler/index.js';
import { WRITE_PERMISSIONS_METADATA, WritePermission } from '../dist/accounts/writePermissions.js';

const timestamp = '2026-09-15T00:00:00.000Z';
const resourceId = '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1';
const capabilityRef = {
  capabilityId: 'azure.compute.virtual-machines.runtime',
  capabilityVersion: 1,
};
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
    { ruleId: 'restore', transition: 'restore', daysOfWeek: [1, 2, 3, 4, 5], desiredStateAtLocal: '08:00' },
    { ruleId: 'reduce', transition: 'reduce', daysOfWeek: [1, 2, 3, 4, 5], desiredStateAtLocal: '18:00' },
  ],
  busyPolicy: { mode: 'skip' },
  blackoutDatesLocal: ['2026-12-25'],
  initialMode: 'active',
  notificationPolicyId: 'notification-policy-1',
};

assert.equal(scheduler.isResourceStrategyWeeklyScheduleWriteRequest(writeRequest), true);
assert.equal(scheduler.isResourceStrategyWeeklyScheduleWriteRequest({ ...writeRequest, definitionType: 'resource-strategy' }), false);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
    ...writeRequest,
    actionDefinitionId: 'compute-virtualmachines_start',
  }),
  false
);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
    ...writeRequest,
    activeFromUtc: '2026-09-15T00:00:00.500Z',
    activeUntilUtc: '2026-09-15T00:00:00Z',
  }),
  false
);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
    ...writeRequest,
    rules: [{ ...writeRequest.rules[0], transition: undefined, targetMode: 'normal' }],
  }),
  false
);
const throwingParameters = {};
Object.defineProperty(throwingParameters, 'value', {
  enumerable: true,
  get() {
    throw new Error('untrusted getter');
  },
});
assert.doesNotThrow(() => scheduler.isResourceStrategyWeeklyScheduleWriteRequest({ ...writeRequest, defaultParameters: throwingParameters }));
assert.equal(scheduler.isResourceStrategyWeeklyScheduleWriteRequest({ ...writeRequest, defaultParameters: throwingParameters }), false);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
    ...writeRequest,
    rules: [{ ...writeRequest.rules[0], daysOfWeek: [7] }],
  }),
  false
);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
    ...writeRequest,
    defaultParameters: { operation: 'start' },
  }),
  false
);
Object.defineProperty(Object.prototype, 'operation', {
  configurable: true,
  enumerable: true,
  value: 'start',
});
try {
  assert.equal(
    scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
      ...writeRequest,
      defaultParameters: {},
    }),
    false
  );
} finally {
  delete Object.prototype.operation;
}
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
    ...writeRequest,
    defaultParameters: { value: 'x'.repeat(40_000) },
  }),
  false
);
assert.equal(scheduler.isResourceStrategyWeeklyScheduleWriteRequest(JSON.parse('{"__proto__":{"admin":true}}')), false);

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
};
assert.equal(scheduler.isResourceStrategyWeeklyScheduleProjection(schedule), true);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleProjection({
    ...schedule,
    executionBundleHash: 'sha256:public-internal-detail',
  }),
  false
);

const capability = {
  capability: capabilityRef,
  contentHash: 'sha256:capability',
  publishedAtUtc: timestamp,
  provider: 'azure',
  resourceTypes: ['Microsoft.Compute/virtualMachines'],
  strategy: 'on-off',
  displayName: 'Virtual machine runtime',
  description: 'Schedule VM availability.',
  configurationSchemaKind: 'weekly-paired-transitions',
  configurationSchema: {},
  recommendationMaturity: 'supported',
  lifecycleStatus: 'published',
  executionPolicy: { authoring: 'allowed', reduce: 'allowed', restore: 'allowed' },
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
  cadence: { minimumTransitionIntervalMinutes: 30, maximumReducedDurationMinutes: 10080 },
  disruption: {
    reversibility: 'reversible',
    risk: 'medium',
    affectedScopeLabel: 'Virtual machine',
    supportedBusyPolicies: ['skip'],
  },
  restore: {
    restoreLeadMinutes: 10,
    capacityReturnRisk: 'possible',
    retryPolicyLabel: 'Restore retry policy',
    escalationClass: 'resource-availability',
  },
  automation: { ownership: 'spotto', conflictingControllerLabels: [] },
  dependencies: { hasDependencies: false },
  evidence: {
    sourceUrls: ['https://learn.microsoft.com/azure/virtual-machines/states-billing'],
    labResult: 'passed',
    verifiedAtUtc: timestamp,
    expiresAtUtc: null,
  },
};
assert.equal(scheduler.isResourceSchedulingCapabilityProjection(capability), true);
assert.equal(
  scheduler.isResourceSchedulingCapabilityProjection({
    ...capability,
    actionDefinitionId: 'compute-virtualmachines_start',
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulingCapabilityProjection({
    ...capability,
    disruption: { ...capability.disruption, supportedBusyPolicies: Array(100_000).fill('skip') },
  }),
  false
);

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
};
assert.equal(scheduler.isResourceSchedulingReadinessProjection(readiness), true);
assert.equal(scheduler.isResourceSchedulingReadinessProjection({ ...readiness, state: 'permission' }), false);

const previewRequest = {
  draft: writeRequest,
  draftHash: 'sha256:draft',
  evidenceReferences: ['billing-evidence-1'],
  concurrency: { requestVersion: 1 },
  draftPeriodKeys: ['weekday'],
};
assert.equal(scheduler.isResourceSchedulePreviewRequest(previewRequest), true);
assert.equal(scheduler.isResourceSchedulePreviewRequest({ ...previewRequest, scheduleId: 'schedule-1' }), false);

const aggregate = {
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
};
const previewResponse = {
  draftHash: 'sha256:draft',
  requestVersion: 1,
  availability: 'available',
  aggregate,
  windows: [{ draftPeriodKey: 'weekday', availability: 'available', projection: aggregate }],
};
assert.equal(scheduler.isResourceSchedulePreviewResponse(previewResponse), true);
assert.equal(
  scheduler.isResourceSchedulePreviewResponse({
    ...previewResponse,
    aggregate: { ...aggregate, currency: '$' },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePreviewResponse({
    ...previewResponse,
    aggregate: { ...aggregate, provenance: 'retail-derived' },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePreviewResponse({
    ...previewResponse,
    aggregate: {
      ...aggregate,
      components: [{ ...aggregate.components[0], amount: '1.00' }],
    },
  }),
  false
);
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
      operationSetHash: 'sha256:ops',
      principalRef: 'write-service-principal',
      roleDefinitionRef: 'role-1',
      roleName: 'Spotto Resource Scheduling sha256-group',
      roleDefinitionScope: '/subscriptions/sub-1',
      roleAssignmentRef: 'role-assignment-1',
      actions: [
        {
          operation: 'Microsoft.Compute/virtualMachines/start/action',
          permissionSetRefs: ['compute-virtualmachines_start'],
          reason: 'Restore the virtual machine for its availability window.',
          evidenceUrl: 'https://learn.microsoft.com/azure/role-based-access-control/resource-provider-operations',
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
};
assert.equal(scheduler.isResourceSchedulePermissionManifestProjection(manifest), true);
const scaledActions = Array.from({ length: 65 }, (_, index) => ({
  operation: `Microsoft.Compute/virtualMachines/read${index}`,
  permissionSetRefs: ['compute-virtualmachines_read'],
  reason: 'Read scheduling state.',
  evidenceUrl: 'https://learn.microsoft.com/azure/role-based-access-control/resource-provider-operations',
}));
const scaledGroups = [
  { ...manifest.grantGroups[0], groupHash: 'sha256:scaled-a', actions: scaledActions.slice(0, 64) },
  { ...manifest.grantGroups[0], groupHash: 'sha256:scaled-b', actions: scaledActions.slice(64) },
];
const scaledAddedOperations = scaledGroups.flatMap(group =>
  group.actions.map(action => ({
    groupHash: group.groupHash,
    providerScopeId: group.providerScopeId,
    exactAssignmentScope: group.exactAssignmentScope,
    operationKind: 'action',
    operation: action.operation,
  }))
);
const scaledManifest = {
  ...manifest,
  orderedGrantGroupHashes: scaledGroups.map(group => group.groupHash),
  grantGroups: scaledGroups,
  change: { status: 'new', addedOperations: scaledAddedOperations, removedOperations: [] },
};
assert.equal(scheduler.isResourceSchedulePermissionManifestProjection(scaledManifest), true);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...scaledManifest,
    change: { ...scaledManifest.change, addedOperations: scaledAddedOperations.slice(0, 64) },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    permissions: ['Microsoft.Compute/virtualMachines/start/action'],
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestConsent({
    version: 'manifest-v1',
    contentHash: 'sha256:manifest',
    orderedGrantGroupHashes: ['sha256:group'],
  }),
  true
);
try {
  Object.prototype.contentHash = 'sha256:polluted';
  assert.equal(
    scheduler.isResourceSchedulePermissionManifestConsent({
      version: 'manifest-v1',
      orderedGrantGroupHashes: ['sha256:group'],
    }),
    false
  );
} finally {
  delete Object.prototype.contentHash;
}
let contentHashReads = 0;
const accessorConsent = {
  version: 'manifest-v1',
  orderedGrantGroupHashes: ['sha256:group'],
};
Object.defineProperty(accessorConsent, 'contentHash', {
  enumerable: true,
  get() {
    contentHashReads += 1;
    if (contentHashReads > 1) throw new Error('getter-after-size-check');
    return 'sha256:manifest';
  },
});
assert.doesNotThrow(() => scheduler.isResourceSchedulePermissionManifestConsent(accessorConsent));
assert.equal(scheduler.isResourceSchedulePermissionManifestConsent(accessorConsent), false);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    orderedGrantGroupHashes: ['sha256:wrong-group'],
  }),
  false
);
const resourceGroupScope = '/subscriptions/sub-1/resourceGroups/rg-1';
const scopeMoveGroup = {
  ...manifest.grantGroups[0],
  groupHash: 'sha256:resource-group',
  exactAssignmentScope: resourceGroupScope,
};
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    orderedGrantGroupHashes: [scopeMoveGroup.groupHash],
    grantGroups: [scopeMoveGroup],
    change: {
      status: 'expanding',
      addedOperations: [
        {
          ...manifest.change.addedOperations[0],
          groupHash: scopeMoveGroup.groupHash,
          exactAssignmentScope: resourceGroupScope,
        },
      ],
      removedOperations: manifest.change.addedOperations,
    },
  }),
  true
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    change: {
      status: 'narrowing',
      addedOperations: [],
      removedOperations: manifest.change.addedOperations,
    },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    grantGroups: [{ ...manifest.grantGroups[0], actions: [], dataActions: [] }],
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    change: { status: 'unchanged', addedOperations: manifest.change.addedOperations, removedOperations: [] },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    change: { status: 'expanding', addedOperations: [], removedOperations: [] },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    change: {
      status: 'narrowing',
      addedOperations: manifest.change.addedOperations,
      removedOperations: [
        {
          ...manifest.change.addedOperations[0],
          operation: 'Microsoft.Compute/virtualMachines/deallocate/action',
        },
      ],
    },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    grantGroups: [
      {
        ...manifest.grantGroups[0],
        actions: [{ ...manifest.grantGroups[0].actions[0], operation: 'Microsoft.Compute/*/action' }],
      },
    ],
  }),
  false
);

const opportunity = {
  opportunityId: 'opportunity-1',
  provider: 'azure',
  providerScopeId: 'sub-1',
  cloudAccountId: 'account-1',
  resourceId,
  capability: capabilityRef,
  suggestedDefinition: writeRequest,
  projectionAvailability: 'available',
  projection: aggregate,
  observedAtUtc: timestamp,
};
assert.equal(scheduler.isResourceSchedulingOpportunity(opportunity), true);
assert.equal(scheduler.isResourceSchedulingOpportunity({ ...opportunity, scheduleId: 'schedule-1' }), false);
assert.equal(
  scheduler.isResourceSchedulingOpportunity({
    ...opportunity,
    suggestedDefinition: { ...writeRequest, resourceId: `${resourceId}-other` },
  }),
  false
);

for (const forbiddenParameterKey of ['actionRef', 'workflowRef', 'permissionSetRef', 'selectorRef', 'baseline', 'requestTemplate']) {
  assert.equal(
    scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
      ...writeRequest,
      defaultParameters: { [forbiddenParameterKey]: 'client-authority' },
    }),
    false,
    `${forbiddenParameterKey} must not be accepted as authoring authority`
  );
}
assert.equal(scheduler.isResourceStrategyWeeklyScheduleWriteRequest({ ...writeRequest, blackoutDatesLocal: ['2026-02-31'] }), false);
assert.equal(scheduler.isResourceStrategyWeeklyScheduleWriteRequest({ ...writeRequest, timezone: 'Mars/Olympus' }), false);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
    ...writeRequest,
    capability: { ...capabilityRef, capabilityVersion: Number.MAX_SAFE_INTEGER + 1 },
  }),
  false
);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleWriteRequest({
    ...writeRequest,
    defaultParameters: { value: '😀'.repeat(9_000) },
  }),
  false
);

assert.equal(
  scheduler.isResourceSchedulingCapabilityProjection({
    ...capability,
    baseline: { ...capability.baseline, selectorRef: 'private-baseline' },
  }),
  false
);
assert.equal(scheduler.isResourceSchedulingCapabilityProjection({ ...capability, lifecycleStatus: 'withdrawn' }), false);
assert.equal(
  scheduler.isResourceSchedulingCapabilityProjection({
    ...capability,
    cost: { ...capability.cost, billingClass: 'C-no-material-saving' },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulingCapabilityProjection({
    ...capability,
    evidence: { ...capability.evidence, expiresAtUtc: '2026-09-14T23:59:59.000Z' },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulingCapabilityProjection({
    ...capability,
    evidence: { sourceUrls: [], labResult: 'passed', verifiedAtUtc: null, expiresAtUtc: null },
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulingReadinessProjection({
    ...readiness,
    expiresAtUtc: '2026-09-14T23:59:59.000Z',
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    grantGroups: [{ ...manifest.grantGroups[0], dataActions: [manifest.grantGroups[0].actions[0]] }],
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePermissionManifestProjection({
    ...manifest,
    grantGroups: [
      {
        ...manifest.grantGroups[0],
        actions: manifest.grantGroups[0].actions.map(({ evidenceUrl: _evidenceUrl, ...operation }) => operation),
      },
    ],
  }),
  false
);

assert.equal(
  scheduler.isResourceSchedulePreviewResponse({
    draftHash: 'sha256:draft',
    requestVersion: 1,
    availability: 'unavailable',
    unavailableReason: 'missing-evidence',
    windows: [{ draftPeriodKey: 'weekday', availability: 'unavailable', projection: aggregate, unavailableReason: 'missing-evidence' }],
  }),
  false
);
assert.equal(
  scheduler.isResourceSchedulePreviewResponse({
    ...previewResponse,
    windows: [{ draftPeriodKey: 'weekday', availability: 'available' }],
  }),
  false
);

const run = {
  schemaVersion: 1,
  companyId: 'company-1',
  providerScopeId: 'sub-1',
  cloudAccountId: 'account-1',
  resourceId,
  scheduleId: 'schedule-1',
  definitionRevision: 1,
  controlGeneration: 1,
  ruleId: 'reduce',
  occurrenceKey: '2026-09-15T18:00:00+12:00',
  scheduleRunId: 'schedule-run-1',
  desiredStateAtUtc: timestamp,
  dispatchNotBeforeUtc: timestamp,
  capability: capabilityRef,
  transition: 'reduce',
  parameters: {},
  permissionManifest: { version: 'manifest-v1', contentHash: 'sha256:manifest' },
  correlationId: 'correlation-1',
};
assert.equal(scheduler.isScheduledResourceTransitionV1(run), true);
assert.equal(
  scheduler.isScheduledResourceTransitionV1({
    ...run,
    actionDefinitionId: 'compute-virtualmachines_deallocate',
  }),
  false
);

const execution = {
  companyId: 'company-1',
  resourceId,
  scheduleId: 'schedule-1',
  definitionRevision: 1,
  controlGeneration: 1,
  lifecycleState: 'restore-failed',
  activeRecoveryCycleId: 'recovery-1',
  restoreOwed: true,
  lastRun: {
    scheduleRunId: 'schedule-run-2',
    transition: 'restore',
    outcome: 'failed',
    desiredStateAtUtc: timestamp,
    updatedAtUtc: timestamp,
  },
  allowedCommands: ['restore-now', 'leave-current-state'],
  updatedAtUtc: timestamp,
};
assert.equal(scheduler.isResourceSchedulingExecutionProjection(execution), true);
assert.equal(scheduler.isResourceSchedulingExecutionProjection({ ...execution, lifecycleState: 'restore-blocked' }), false);
assert.equal(scheduler.isResourceSchedulingExecutionProjection({ ...execution, allowedCommands: Array(100_000).fill('pause') }), false);
assert.equal(
  scheduler.isResourceSchedulingExecutionProjection({
    ...execution,
    lastRun: { ...execution.lastRun, phase: 'executing' },
  }),
  false
);
const { outcome: _outcome, ...runWithoutProgress } = execution.lastRun;
assert.equal(
  scheduler.isResourceSchedulingExecutionProjection({
    ...execution,
    lastRun: runWithoutProgress,
  }),
  false
);

assert.equal(scheduler.isResourceStrategyScheduleCommand({ command: 'restore-now', idempotencyKey: 'command-1' }), true);
assert.equal(scheduler.isResourceStrategyScheduleCommand({ command: 'start', idempotencyKey: 'command-1' }), false);
assert.equal(
  scheduler.isResourceStrategyWeeklyScheduleListResponse({
    results: [schedule],
    continuation: { cursor: 'next' },
  }),
  true
);
assert.equal(scheduler.isResourceStrategyWeeklyScheduleListResponse({ results: Array(101).fill(schedule) }), false);

for (const removedExport of [
  'isBastionAvailabilityWeeklyScheduleDefinition',
  'isBastionAvailabilityWeeklyScheduleWriteRequest',
  'isBastionScheduleRun',
  'readSupportedBastionScheduleProfileV1',
]) {
  assert.equal(removedExport in scheduler, false, `${removedExport} must not remain exported`);
}

assert.equal(Array.isArray(scheduler.WEEKLY_AVAILABILITY_FIXTURES_V1), true);
assert.deepEqual(
  new Set(scheduler.WEEKLY_AVAILABILITY_FIXTURES_V1.map(fixture => fixture.caseId)),
  new Set([
    'business-hours',
    'daily',
    'cross-midnight',
    'week-wrap',
    'touching-periods',
    'exact-boundaries',
    'spring-forward-gap',
    'fall-back-restore-first',
    'fall-back-reduce-second',
    'invalid-overlap',
    'invalid-conflicting-transition',
  ])
);
assert.equal(
  scheduler.WEEKLY_AVAILABILITY_FIXTURES_V1.filter(fixture => fixture.validity === 'valid').every(
    fixture => Array.isArray(fixture.stateSamples) && fixture.stateSamples.length > 0
  ),
  true
);
const businessHours = scheduler.WEEKLY_AVAILABILITY_FIXTURES_V1.find(fixture => fixture.caseId === 'business-hours');
assert.deepEqual(businessHours.expectedRules[0].daysOfWeek, [1, 2, 3, 4, 5]);
assert.equal(businessHours.expectedRules[0].transition, 'restore');
assert.equal(businessHours.expectedRules[1].transition, 'reduce');
const touchingPeriods = scheduler.WEEKLY_AVAILABILITY_FIXTURES_V1.find(fixture => fixture.caseId === 'touching-periods');
assert.deepEqual(touchingPeriods.expectedRules, [
  { ruleId: 'touching-restore', daysOfWeek: [1], desiredStateAtLocal: '08:00', transition: 'restore' },
  { ruleId: 'touching-reduce', daysOfWeek: [1], desiredStateAtLocal: '18:00', transition: 'reduce' },
]);
assert.equal(Object.isFrozen(touchingPeriods.periods), true);
assert.equal(Object.isFrozen(touchingPeriods.expectedRules), true);
assert.equal(Object.isFrozen(touchingPeriods.expectedRules[0].daysOfWeek), true);

assert.equal(
  WRITE_PERMISSIONS_METADATA.some(
    permission => permission.id === WritePermission.ResourceScheduling && permission.permissionManifestKind === 'resource-scheduling'
  ),
  true
);

console.log('Resource strategy weekly schedule contract checks passed.');
