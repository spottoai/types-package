import assert from 'node:assert/strict';

import { createResourceSchedulerTickRequestMessageV1, isResourceSchedulerTickRequestMessageV1 } from '../dist/index.js';

const scheduledAtUtc = '2026-09-16T00:00:00.000Z';
const expectedTickId = `resource-scheduler:tick:${scheduledAtUtc}`;
const expected = {
  schemaVersion: 1,
  entity: 'resource-scheduler',
  action: 'tick',
  companyId: '*',
  cloudAccountId: '*',
  tenantId: '*',
  clientId: '*',
  tickId: expectedTickId,
  scheduledAtUtc,
  correlationId: expectedTickId,
};

assert.deepEqual(createResourceSchedulerTickRequestMessageV1(scheduledAtUtc), expected);
assert.deepEqual(createResourceSchedulerTickRequestMessageV1(Date.parse(scheduledAtUtc)), expected);
assert.equal(isResourceSchedulerTickRequestMessageV1(expected), true);

for (const invalid of [
  { ...expected, scheduledAtUtc: '2026-09-16T00:00:00Z' },
  { ...expected, scheduledAtUtc: 'not-a-timestamp' },
  { ...expected, tickId: 'resource-scheduler:tick:different' },
  { ...expected, correlationId: 'different' },
  { ...expected, companyId: 'comp-123' },
  { ...expected, cloudAccountId: 'cloud-123' },
  { ...expected, tenantId: 'tenant-123' },
  { ...expected, clientId: 'client-123' },
  { ...expected, futureField: true },
  { ...expected, tickId: 'x'.repeat(129) },
]) {
  assert.equal(isResourceSchedulerTickRequestMessageV1(invalid), false, JSON.stringify(invalid));
}

for (const invalidScheduledAt of ['not-a-timestamp', '2026-09-16T00:00:00Z', Number.NaN, 253402300800000]) {
  assert.throws(() => createResourceSchedulerTickRequestMessageV1(invalidScheduledAt));
}

const throwingTick = { ...expected };
Object.defineProperty(throwingTick, 'scheduledAtUtc', {
  enumerable: true,
  get() {
    throw new Error('adversarial accessor');
  },
});
assert.equal(isResourceSchedulerTickRequestMessageV1(throwingTick), false);
