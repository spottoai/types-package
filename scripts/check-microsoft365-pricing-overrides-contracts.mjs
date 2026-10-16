import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const esm = await import('../dist/esm/entries/root.js');
const cjs = require('../dist/index.js');
for (const api of [esm, cjs]) {
  assert.equal(typeof api.isMicrosoft365PricingOverridesConfiguration, 'function');
  const row = {
    skuId: 'sku-basic',
    currency: 'AUD',
    unitPriceMonthly: 0,
    effectiveFrom: '2026-10-01',
    effectiveTo: null,
    source: 'Customer-confirmed grant',
  };
  const config = {
    schemaVersion: 'microsoft-365-pricing-overrides/v1',
    tenantId: 'tenant-a',
    revision: 'revision-a',
    overrides: [row],
    updatedAt: '2026-10-16T00:00:00.000Z',
    updatedBy: 'manager-a',
  };
  assert(api.isMicrosoft365PricingOverride(row));
  assert(api.isMicrosoft365PricingOverridesConfiguration(config));
  for (const patch of [
    { unitPriceMonthly: null },
    { unitPriceMonthly: -1 },
    { unitPriceMonthly: Infinity },
    { unitPriceMonthly: 1000001 },
    { currency: 'aud' },
    { currency: '' },
    { effectiveFrom: '2026-02-30' },
    { effectiveTo: '2026-10-01' },
    { source: 'x'.repeat(257) },
    { accountId: 'private' },
  ]) {
    assert(!api.isMicrosoft365PricingOverride({ ...row, ...patch }), JSON.stringify(patch));
  }
  assert(!api.isMicrosoft365PricingOverridesConfiguration({ ...config, overrides: [row, row] }), 'Overlapping identical entries rejected');
  assert(!api.isMicrosoft365PricingOverridesConfiguration({ ...config, overrides: Array.from({ length: 1001 }, () => row) }));
  assert(!api.isMicrosoft365PricingOverridesConfiguration({ ...config, credentials: 'private' }));
  assert(api.isMicrosoft365PricingOverridesConfiguration({ ...config, revision: 'none', overrides: [], updatedAt: null, updatedBy: null }));
  assert(
    api.isMicrosoft365PricingOverridesConfiguration({
      ...config,
      overrides: [
        { ...row, effectiveTo: '2026-11-01' },
        { ...row, effectiveFrom: '2026-11-01' },
      ],
    }),
    'Adjacent intervals are valid'
  );
  assert(
    !api.isMicrosoft365PricingOverridesConfiguration({
      ...config,
      overrides: [
        { ...row, effectiveTo: '2026-11-02' },
        { ...row, effectiveFrom: '2026-11-01' },
      ],
    }),
    'Overlapping intervals are invalid'
  );
}
console.log('M365 pricing override CJS/ESM contracts passed.');
