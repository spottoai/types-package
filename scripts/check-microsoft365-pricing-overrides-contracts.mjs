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
  const targetFacts = {
    schemaVersion: 'microsoft-365-pricing-facts/v1',
    evidence: {
      inventoryKnown: true,
      usersKnown: true,
      signInsKnown: true,
      overlapKnown: true,
      downgradeKnown: true,
      ambiguousPaidAllocation: false,
    },
    products: [{ skuId: 'source', noOfficeActivityUnits: 0 }],
    noOfficeActivityAccountCount: 0,
    downgradeEdges: [{ skuId: 'source', targetSkuId: 'target', targetSkuPartNumber: 'TARGET', count: 1 }],
    targetUnitPrices: { NZD: { TARGET: 10, ANOTHER: null } },
    targetProducts: [
      { skuId: 'target', skuPartNumber: 'TARGET', productName: 'Target', referencePrices: { NZD: 10 } },
      { skuId: 'another', skuPartNumber: 'ANOTHER', productName: 'Another', referencePrices: { NZD: null } },
    ],
    groupRanking: 'reference_price',
  };
  assert(api.isMicrosoft365PricingFacts(targetFacts), 'Reviewed unheld targets and stable edge identities remain bounded');
  assert(
    api.isMicrosoft365PricingFacts({ ...targetFacts, evidence: { ...targetFacts.evidence, chargeableAccountCountsKnown: true } }),
    'New producers attest price-independent chargeable account unions'
  );
  for (const invalid of [false, null, 1, 'true']) {
    assert(!api.isMicrosoft365PricingFacts({ ...targetFacts, evidence: { ...targetFacts.evidence, chargeableAccountCountsKnown: invalid } }));
  }
  const suspended = { kind: 'suspended_subscription', skuId: 'source', accountId: 'account', title: 'Suspended subscription assignment', detail: 'Review coverage.' };
  assert(api.isMicrosoft365CapabilityNotice(suspended));
  assert(!api.isMicrosoft365CapabilityNotice({ ...suspended, accountId: undefined }));
  assert(
    api.isMicrosoft365PricingFacts({ ...targetFacts, evidence: { ...targetFacts.evidence, unpricedQuantitiesKnown: true } }),
    'New producers attest previously unpriced review quantities'
  );
  assert(
    !api.isMicrosoft365PricingFacts({ ...targetFacts, evidence: { ...targetFacts.evidence, unpricedQuantitiesKnown: false } }),
    'Only an explicit true attestation is accepted'
  );
  assert(
    !api.isMicrosoft365PricingFacts({ ...targetFacts, targetProducts: [{ ...targetFacts.targetProducts[0], accountId: 'private' }] }),
    'Catalogue cannot carry identity fields'
  );
  assert(
    !api.isMicrosoft365PricingFacts({ ...targetFacts, targetProducts: [...targetFacts.targetProducts, targetFacts.targetProducts[0]] }),
    'Catalogue identities are unique'
  );
  assert(api.isMicrosoft365PricingOverride({ ...row, effectiveFrom: null }), 'An open start applies to all historical months');
  assert(api.isMicrosoft365PricingOverride({ ...row, unitPriceMonthly: 1.0001 }), 'Four decimal agreed rate retained');
  assert(!api.isMicrosoft365PricingOverride({ ...row, unitPriceMonthly: 1.00001 }), 'More than four decimal places rejected');
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
  assert(
    !api.isMicrosoft365PricingOverridesConfiguration({ ...config, overrides: [{ ...row, effectiveFrom: null }, row] }),
    'Open intervals overlap a later unclosed price'
  );
  assert(api.isMicrosoft365PricingOverridesConfiguration({ ...config, updatedBy: undefined }), 'Reader responses omit actor identity');
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
