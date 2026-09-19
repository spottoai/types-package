import assert from 'node:assert/strict';

import * as scheduler from '../dist/scheduler/index.js';

const writeRequest = {
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

const schedulerControlRequest = {
  schemaVersion: 1,
  entity: 'scheduler',
  action: 'control',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  tenantId: '',
  clientId: '',
  operationId: 'scheduler-operation-1',
  requestedAtUtc: '2026-09-17T01:02:03.000Z',
  actorId: 'user-1',
  correlationId: 'correlation-1',
  command: {
    commandType: 'create-schedule',
    definition: writeRequest,
    idempotencyKey: 'create-1',
  },
};

assert.equal(scheduler.isSchedulerControlRequestMessageV1(schedulerControlRequest), true);
assert.equal(
  scheduler.isSchedulerControlRequestMessageV1({
    ...schedulerControlRequest,
    command: { ...schedulerControlRequest.command, providerOperation: 'Microsoft.Compute/virtualMachines/start/action' },
  }),
  false
);

const acceptedOperation = {
  schemaVersion: 1,
  operationId: schedulerControlRequest.operationId,
  status: 'accepted',
  submittedAtUtc: schedulerControlRequest.requestedAtUtc,
};
assert.equal(scheduler.isSchedulerOperationAcceptedResponse(acceptedOperation), true);

const pendingOperation = {
  schemaVersion: 1,
  companyId: schedulerControlRequest.companyId,
  operationId: schedulerControlRequest.operationId,
  operationType: 'create-schedule',
  status: 'pending',
  submittedAtUtc: schedulerControlRequest.requestedAtUtc,
  updatedAtUtc: schedulerControlRequest.requestedAtUtc,
};
assert.equal(scheduler.isSchedulerOperationProjection(pendingOperation), true);
assert.equal(scheduler.isSchedulerOperationProjection({ ...pendingOperation, providerToken: 'forbidden' }), false);

assert.equal(scheduler.isRecommendationActionScheduleWriteRequest(writeRequest), true);
assert.equal(scheduler.isScheduleWriteRequest(writeRequest), true);
assert.equal(
  scheduler.isRecommendationActionScheduleWriteRequest({
    ...writeRequest,
    trigger: { triggerType: 'recurring', cronExpression: '0 8 * * 1-5' },
  }),
  true
);

for (const command of [
  { command: 'pause', idempotencyKey: 'pause-1' },
  { command: 'resume', idempotencyKey: 'resume-1' },
]) {
  assert.equal(scheduler.isRecommendationActionScheduleCommand(command), true);
  assert.equal(scheduler.isScheduleCommand(command), true);
}
for (const command of [
  { command: 'restore-now', idempotencyKey: 'restore-1' },
  { command: 'rerun-dry-run', idempotencyKey: 'dry-run-1' },
  { command: 'leave-current-state', idempotencyKey: 'leave-1', acknowledgement: 'acknowledged' },
]) {
  assert.equal(scheduler.isRecommendationActionScheduleCommand(command), false);
  assert.equal(scheduler.isScheduleCommand(command), true);
}
assert.equal(scheduler.isScheduleCommand({ command: 'pause', idempotencyKey: 'pause-1', legacy: true }), false);

for (const invalid of [
  { ...writeRequest, operation: 'apply' },
  { ...writeRequest, providerName: 'azure' },
  { ...writeRequest, targetType: 'recommendation-action' },
  { ...writeRequest, trigger: { triggerType: 'once', localDateTime: '' } },
  { ...writeRequest, trigger: { triggerType: 'recurring', cronExpression: '' } },
  { ...writeRequest, trigger: { triggerType: 'recurring', cronExpression: '0 0 8 * * 1-5' } },
  { ...writeRequest, trigger: { triggerType: 'recurring', cronExpression: '0 8 * *' } },
  { ...writeRequest, trigger: { triggerType: 'recurring', cronExpression: ' 0 8 * * 1-5' } },
  { ...writeRequest, target: { selectorType: 'selected-resources', resourceIds: [] } },
  { ...writeRequest, target: { selectorType: 'provider-scope', resourceId: 'forbidden' } },
  { ...writeRequest, configuration: { value: 'x'.repeat(40_000) } },
]) {
  assert.equal(scheduler.isRecommendationActionScheduleWriteRequest(invalid), false, JSON.stringify(invalid));
  assert.equal(scheduler.isScheduleWriteRequest(invalid), false, JSON.stringify(invalid));
}

const projection = {
  scheduleId: 'schedule-1',
  definitionRevision: 1,
  controlGeneration: 1,
  etag: 'etag-1',
  status: 'active',
  definition: writeRequest,
  nextOccurrenceAtUtc: '2026-09-16T22:00:00.000Z',
  createdAtUtc: '2026-09-16T00:00:00.000Z',
  createdBy: 'user-1',
  updatedAtUtc: '2026-09-16T00:00:00.000Z',
  updatedBy: 'user-1',
};

assert.equal(scheduler.isRecommendationActionScheduleProjection(projection), true);
assert.equal(scheduler.isScheduleProjection(projection), true);
assert.equal(scheduler.isScheduleListResponse({ results: [projection], continuation: { cursor: 'next-page' } }), true);
assert.equal(scheduler.isRecommendationActionScheduleProjection({ ...projection, targetCount: 1 }), false);
assert.equal(
  scheduler.isSchedulerOperationProjection({
    ...pendingOperation,
    status: 'succeeded',
    completedAtUtc: '2026-09-17T01:02:04.000Z',
    updatedAtUtc: '2026-09-17T01:02:04.000Z',
    result: { resultType: 'schedule', schedule: projection },
  }),
  true
);

const occurrence = {
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
  target: writeRequest.target,
  configuration: {},
  correlationId: 'correlation-1',
};

assert.equal(scheduler.isScheduledRecommendationActionV1(occurrence), true);
assert.equal(scheduler.isScheduledOccurrenceV1(occurrence), true);
assert.equal(scheduler.isScheduledRecommendationActionV1({ ...occurrence, providerName: 'azure' }), false);

const throwingDefinition = { ...writeRequest };
Object.defineProperty(throwingDefinition, 'name', {
  enumerable: true,
  get() {
    throw new Error('adversarial accessor');
  },
});
assert.equal(scheduler.isRecommendationActionScheduleWriteRequest(throwingDefinition), false);
assert.equal(scheduler.isRecommendationActionScheduleWriteRequest(JSON.parse('{"__proto__":{"admin":true}}')), false);

console.log('Unified scheduler contract checks passed.');
