import assert from 'node:assert/strict';

import {
  isBastionAvailabilityStatusV1,
  isBastionAvailabilityWeeklyScheduleDefinition,
  isBastionAvailabilityWeeklyScheduleWriteRequest,
  isBastionPauseResponse,
  isBastionRestoreNowResponse,
  isBastionScheduleControlV1,
  isBastionScheduleReadinessV1,
  isBastionScheduleRun,
} from '../dist/scheduler/index.js';

const resourceId = '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Network/bastionHosts/bastion-1';
const timestamp = '2026-09-09T00:00:00.000Z';

const writeRequest = {
  definitionType: 'bastion-availability-weekly',
  name: 'Business-hours Bastion',
  providerName: 'azure',
  providerScopeId: 'sub-123',
  cloudAccountId: 'cloud-account-1',
  resourceId,
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
};

assert.equal(isBastionAvailabilityWeeklyScheduleWriteRequest(writeRequest), true);
assert.equal(
  isBastionAvailabilityWeeklyScheduleDefinition({
    ...writeRequest,
    definitionId: 'definition-1',
    definitionClass: 'composite',
    companyId: 'company-1',
    targetResourceType: 'Microsoft.Network/bastionHosts',
    definitionRevision: 1,
    status: 'active',
    createdAtUtc: timestamp,
    updatedAtUtc: timestamp,
  }),
  true
);
assert.equal(isBastionAvailabilityWeeklyScheduleWriteRequest({ ...writeRequest, restoreLeadMinutes: 15 }), false);
assert.equal(
  isBastionAvailabilityWeeklyScheduleWriteRequest({
    ...writeRequest,
    configuration: { accessWindows: [] },
  }),
  false
);
assert.equal(
  isBastionAvailabilityWeeklyScheduleWriteRequest({
    ...writeRequest,
    configuration: {
      accessWindows: Array.from({ length: 15 }, (_, index) => ({
        windowId: `window-${index}`,
        daysOfWeek: [index % 7],
        accessStartTimeLocal: '08:00',
        accessEndTimeLocal: '09:00',
      })),
    },
  }),
  false
);
assert.equal(
  isBastionAvailabilityWeeklyScheduleWriteRequest({
    ...writeRequest,
    configuration: {
      accessWindows: [
        {
          windowId: 'overnight',
          daysOfWeek: [5],
          accessStartTimeLocal: '22:00',
          accessEndTimeLocal: '02:00',
        },
      ],
    },
  }),
  true
);
assert.equal(
  isBastionAvailabilityWeeklyScheduleWriteRequest({
    ...writeRequest,
    configuration: {
      accessWindows: [
        {
          windowId: 'invalid-equal-times',
          daysOfWeek: [1],
          accessStartTimeLocal: '08:00',
          accessEndTimeLocal: '08:00',
        },
      ],
    },
  }),
  false
);
assert.equal(
  isBastionAvailabilityWeeklyScheduleWriteRequest({
    ...writeRequest,
    configuration: {
      accessWindows: [
        ...writeRequest.configuration.accessWindows,
        {
          windowId: 'overlap',
          daysOfWeek: [1],
          accessStartTimeLocal: '17:00',
          accessEndTimeLocal: '19:00',
        },
      ],
    },
  }),
  false
);

const removeRun = {
  scheduleId: 'schedule-remove-1',
  scheduleRunId: 'run-remove-1',
  targetType: 'resource-operation',
  selectorType: 'single-resource',
  scheduleType: 'recurring',
  providerScopeId: 'sub-123',
  cloudAccountId: 'cloud-account-1',
  resourceId,
  definitionId: 'definition-1',
  definitionClass: 'composite',
  definitionType: 'bastion-availability-weekly',
  compiledRuleId: 'weekday-access-remove',
  compiledOperation: 'remove',
  definitionRevision: 1,
  controlGeneration: 2,
  scheduledForUtc: timestamp,
};

assert.equal(isBastionScheduleRun(removeRun), true);
assert.equal(isBastionScheduleRun({ ...removeRun, controlGeneration: undefined }), false);
assert.equal(isBastionScheduleRun({ ...removeRun, definitionRevision: undefined }), false);
assert.equal(isBastionScheduleRun({ ...removeRun, scheduledForUtc: 'not-a-timestamp' }), false);
assert.equal(isBastionScheduleRun({ ...removeRun, compiledOperation: 'delete' }), false);
assert.equal(isBastionScheduleRun({ ...removeRun, actionDefinitionId: 'network-bastionhosts-delete' }), false);
assert.equal(isBastionScheduleRun({ ...removeRun, snapshotBlobPath: 'private/snapshot.json' }), false);
const { controlGeneration: _removeControlGeneration, ...runWithoutControlGeneration } = removeRun;
assert.equal(
  isBastionScheduleRun({
    ...runWithoutControlGeneration,
    scheduleId: 'schedule-restore-1',
    scheduleRunId: 'run-restore-1',
    compiledOperation: 'restore',
  }),
  true
);
assert.equal(
  isBastionScheduleRun({
    ...removeRun,
    scheduleId: 'schedule-restore-1',
    scheduleRunId: 'run-restore-1',
    compiledOperation: 'restore',
    controlGeneration: 2,
  }),
  false
);

assert.equal(
  isBastionScheduleControlV1({
    schemaVersion: 1,
    companyId: 'company-1',
    resourceId,
    definitionId: 'definition-1',
    definitionRevision: 1,
    controlGeneration: 2,
    desiredStatus: 'active',
    updatedAtUtc: timestamp,
  }),
  true
);

assert.equal(
  isBastionAvailabilityStatusV1({
    schemaVersion: 1,
    companyId: 'company-1',
    resourceId,
    definitionId: 'definition-1',
    definitionRevision: 1,
    phase: 'removing',
    lastOperation: 'remove',
    lastResult: 'pending',
    snapshotCapturedAtUtc: timestamp,
    restoreAvailable: true,
    updatedAtUtc: timestamp,
  }),
  true
);
assert.equal(
  isBastionScheduleControlV1({
    schemaVersion: 1,
    companyId: 'company-1',
    resourceId,
    definitionId: 'definition-1',
    definitionRevision: 1,
    controlGeneration: 0,
    desiredStatus: 'active',
    updatedAtUtc: timestamp,
  }),
  false
);
assert.equal(
  isBastionScheduleControlV1({
    schemaVersion: 1,
    companyId: 'company-1',
    resourceId,
    definitionId: 'definition-1',
    definitionRevision: 1,
    controlGeneration: 2,
    desiredStatus: 'active',
    updatedAtUtc: timestamp,
    etag: 'private-etag',
  }),
  false
);

assert.equal(
  isBastionScheduleReadinessV1({
    schemaVersion: 1,
    status: 'confirmed',
    companyId: 'company-1',
    cloudAccountId: 'cloud-account-1',
    subscriptionId: 'sub-123',
    resourceId,
    requiredActions: ['Microsoft.Network/bastionHosts/read'],
    missingActions: [],
    checkedAtUtc: timestamp,
  }),
  true
);

assert.equal(
  isBastionAvailabilityStatusV1({
    schemaVersion: 1,
    companyId: 'company-1',
    resourceId,
    definitionId: 'definition-1',
    definitionRevision: 1,
    phase: 'absent',
    lastOperation: 'remove',
    lastResult: 'succeeded',
    snapshotCapturedAtUtc: timestamp,
    restoreAvailable: true,
    updatedAtUtc: timestamp,
  }),
  true
);

assert.equal(isBastionPauseResponse({ status: 'paused', resourceId, controlGeneration: 3, requestedAtUtc: timestamp }), true);
assert.equal(isBastionRestoreNowResponse({ accepted: true, scheduleRunId: 'restore-now-1', resourceId, requestedAtUtc: timestamp }), true);
assert.equal(
  isBastionRestoreNowResponse({
    accepted: true,
    scheduleRunId: 'restore-now-1',
    resourceId,
    requestedAtUtc: 'tomorrow',
  }),
  false
);
assert.equal(
  isBastionRestoreNowResponse({
    accepted: true,
    scheduleRunId: 'restore-now-1',
    resourceId,
    requestedAtUtc: '2026-02-31T00:00:00.000Z',
  }),
  false
);

const polluted = JSON.parse('{"__proto__":{"admin":true},"definitionType":"bastion-availability-weekly"}');
assert.equal(isBastionAvailabilityWeeklyScheduleWriteRequest(polluted), false);

const hostileProxy = new Proxy(
  {},
  {
    getPrototypeOf() {
      throw new Error('hostile prototype trap');
    },
  }
);
assert.doesNotThrow(() => isBastionAvailabilityWeeklyScheduleWriteRequest(hostileProxy));
assert.equal(isBastionAvailabilityWeeklyScheduleWriteRequest(hostileProxy), false);

console.log('Bastion schedule public contract checks passed.');
