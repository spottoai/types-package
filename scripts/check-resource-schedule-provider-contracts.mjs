import assert from 'node:assert/strict';
import * as scheduler from '../dist/scheduler/index.js';
import * as root from '../dist/index.js';

const timestamp = '2026-10-25T00:00:00.000Z';
const accountId = '123456789012';
const resourceId = `arn:aws:ec2:ap-southeast-2:${accountId}:instance/i-0123456789abcdef0`;
const capability = { capabilityId: 'aws.ec2.instances.runtime', capabilityVersion: 1 };
const transition = {
  schemaVersion: 1,
  companyId: 'company-1',
  providerScopeId: accountId,
  cloudAccountId: 'cloud-account-1',
  resourceId,
  scheduleId: 'schedule-1',
  definitionRevision: 1,
  controlGeneration: 1,
  ruleId: 'reduce',
  occurrenceKey: '2026-10-25T18:00:00+13:00',
  scheduleRunId: 'schedule-run-1',
  desiredStateAtUtc: timestamp,
  dispatchNotBeforeUtc: timestamp,
  capability,
  transition: 'reduce',
  parameters: {},
  permissionManifest: { version: 'manifest-v1', contentHash: 'sha256:manifest' },
  correlationId: 'correlation-1',
};
assert.equal(scheduler.isScheduledResourceTransitionV1(transition), true, 'AWS transition must be a valid scheduled transition');

const check = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'resource-schedule',
  action: 'check',
  requestId: 'rs-check-1',
  correlationId: 'correlation-1',
  requestedAt: timestamp,
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId,
  resourceId,
  capability,
  direction: 'reduce',
  intent: 'ordinary',
};
const transitionRequest = {
  ...check,
  action: 'transition',
  requestId: 'rs-transition-1',
  transition,
  leaseOwnerId: 'lease-owner-1',
};

assert.equal(root.isResourceScheduleProviderRequestV1, scheduler.isResourceScheduleProviderRequestV1);
assert.equal(scheduler.isResourceScheduleProviderRequestV1(check), true);
assert.equal(scheduler.isResourceScheduleProviderRequestV1(transitionRequest), true);
for (const [label, invalid] of [
  ['unknown field', { ...check, extra: true }],
  ['credential key', { ...check, capability: { ...capability, secretAccessKey: 'x' } }],
  ['check with transition', { ...check, transition }],
  ['transition without lease owner', { ...transitionRequest, leaseOwnerId: undefined }],
  ['transition without body', { ...transitionRequest, transition: undefined }],
  ['account mismatch', { ...check, accountId: '210987654321' }],
  ['non-12-digit account', { ...check, accountId: '12345' }],
  ['Azure resource id', { ...check, resourceId: '/subscriptions/s/providers/Microsoft.Compute/virtualMachines/vm' }],
  ['unknown provider', { ...check, provider: 'gcp' }],
  ['transition resource mismatch', { ...transitionRequest, transition: { ...transition, resourceId: `${resourceId}0` } }],
  ['direction mismatch', { ...transitionRequest, direction: 'restore' }],
  ['capability mismatch', { ...transitionRequest, capability: { ...capability, capabilityVersion: 2 } }],
  ['bad intent', { ...check, intent: 'force' }],
]) {
  assert.equal(scheduler.isResourceScheduleProviderRequestV1(invalid), false, label);
}

const checkResult = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'scheduler',
  action: 'provider-result',
  request: check,
  readiness: { state: 'missing-permission', reasonCodes: ['missing-permission'], missingActions: ['ec2:StopInstances'] },
  observed: { state: 'running', instanceType: 't3.medium', availabilityZone: 'ap-southeast-2a', observedAtUtc: timestamp },
  completedAtUtc: timestamp,
};
const transitionResult = {
  ...checkResult,
  request: transitionRequest,
  readiness: { state: 'ready', reasonCodes: [] },
  outcome: 'succeeded',
  submitted: true,
  observed: { state: 'stopped', observedAtUtc: timestamp },
  providerRequestId: 'aws-request-1',
};
assert.equal(scheduler.isResourceScheduleProviderResultV1(checkResult), true);
assert.equal(scheduler.isResourceScheduleProviderResultV1(transitionResult), true);
assert.equal(
  scheduler.isResourceScheduleProviderResultV1({
    ...transitionResult,
    outcome: 'failed',
    submitted: false,
    failure: { reasonCode: 'insufficient-capacity', retryable: true, code: 'InsufficientInstanceCapacity', statusCode: 500 },
  }),
  true
);
for (const [label, invalid] of [
  ['check with outcome', { ...checkResult, outcome: 'succeeded' }],
  ['transition without outcome', { ...transitionResult, outcome: undefined }],
  ['failed without failure', { ...transitionResult, outcome: 'failed' }],
  ['unknown readiness state', { ...checkResult, readiness: { state: 'maybe', reasonCodes: [] } }],
  ['invalid request', { ...checkResult, request: { ...check, extra: 1 } }],
  ['provider mismatch', { ...checkResult, provider: 'gcp' }],
  ['raw provider message field', { ...transitionResult, failure: { reasonCode: 'x', retryable: false, message: 'raw' } }],
  ['credential key', { ...transitionResult, observed: { ...transitionResult.observed, sessionToken: 'x' } }],
  ['oversized', { ...checkResult, readiness: { state: 'blocked', reasonCodes: Array(33).fill('x') } }],
]) {
  assert.equal(scheduler.isResourceScheduleProviderResultV1(invalid), false, label);
}

console.log('Resource schedule provider contract checks passed.');
