import assert from 'node:assert/strict';

import {
  createEarlySpendDefaultCriteria,
  DEFAULT_COST_ANOMALY_MIN_DELTA,
  EARLY_SPEND_SIGNAL_KINDS,
  isQuickAlertType,
  QUICK_ALERT_TYPES,
  toAlertDataBasis,
} from '../dist/index.js';

// Early spend runs on the quick-alert lifecycle.
assert.equal(isQuickAlertType('earlySpend'), true);
assert.ok(QUICK_ALERT_TYPES.includes('earlySpend'));
for (const existing of ['credentialExpiry', 'benefitExpiry', 'serviceRetirement', 'backupFailure']) {
  assert.equal(isQuickAlertType(existing), true, `${existing} is still a quick alert type`);
}
assert.equal(isQuickAlertType('costAnomaly'), false);

// Default criteria.
const defaults = createEarlySpendDefaultCriteria();
assert.deepEqual(defaults, {
  kind: 'earlySpend',
  source: 'costSignals',
  templateId: 'early-spend-default',
  signals: ['costImpact', 'createBurst', 'telemetryRunRate'],
  minEstimatedDailyCost: 25,
  minPercentOfBaseline: 5,
  telemetryMinIncreasePercent: 50,
  burst: { minCount: 20, windowMinutes: 60, minCount24h: 100 },
  minConfidence: 0.5,
  includeCallerInExternalNotifications: false,
});
assert.deepEqual(defaults.signals, [...EARLY_SPEND_SIGNAL_KINDS]);

// Each call returns an independent object.
defaults.signals.push('createBurst');
defaults.burst.minCount = 1;
const fresh = createEarlySpendDefaultCriteria();
assert.equal(fresh.signals.length, 3);
assert.equal(fresh.burst.minCount, 20);

// Cost anomaly default.
assert.equal(DEFAULT_COST_ANOMALY_MIN_DELTA, 10);

// Data basis mapping.
assert.equal(toAlertDataBasis('actual'), 'billed');
assert.equal(toAlertDataBasis('blended'), 'blended');
assert.equal(toAlertDataBasis('estimated'), 'estimated');
assert.equal(toAlertDataBasis('metrics_pricing'), 'estimated');
assert.equal(toAlertDataBasis('unknown'), undefined);
assert.equal(toAlertDataBasis(undefined), undefined);

console.log('alert contracts OK');
