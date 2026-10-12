import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { validateCurrentStateReportPrerequisitesV1 } = createRequire(import.meta.url)('../dist/reporting/jobs/index.js');

const valid = { hourlyRateAmount: 125, hourlyRateCurrency: 'NZD', scopeCurrencyCode: 'AUD', preparedBy: 'Provider team' };
assert.deepEqual(validateCurrentStateReportPrerequisitesV1(valid), { ok: true });
for (const hourlyRateAmount of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 10001]) {
  assert.deepEqual(validateCurrentStateReportPrerequisitesV1({ ...valid, hourlyRateAmount }), { ok: false, failureCode: 'invalid-rate' });
}
assert.deepEqual(validateCurrentStateReportPrerequisitesV1({ ...valid, hourlyRateCurrency: '' }), { ok: false, failureCode: 'invalid-rate' });
assert.deepEqual(validateCurrentStateReportPrerequisitesV1({ ...valid, scopeCurrencyCode: 'ZZZ' }), { ok: false, failureCode: 'invalid-currency' });
assert.deepEqual(
  validateCurrentStateReportPrerequisitesV1({ ...valid, preparedBy: undefined, providerName: 'Service Provider', parentCompanyName: 'Partner' }),
  { ok: true }
);
assert.deepEqual(validateCurrentStateReportPrerequisitesV1({ ...valid, preparedBy: undefined, providerName: 'Service Provider' }), {
  ok: false,
  failureCode: 'no-prepared-by',
});
assert.deepEqual(validateCurrentStateReportPrerequisitesV1({ ...valid, preparedBy: '' }), { ok: false, failureCode: 'no-prepared-by' });
assert.deepEqual(validateCurrentStateReportPrerequisitesV1({ ...valid, preparedBy: '<unsafe>' }), { ok: false, failureCode: 'no-prepared-by' });
assert.deepEqual(validateCurrentStateReportPrerequisitesV1({ ...valid, preparedBy: 'x'.repeat(121) }), { ok: false, failureCode: 'no-prepared-by' });
