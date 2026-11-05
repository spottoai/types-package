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
  const suspended = {
    kind: 'suspended_subscription',
    skuId: 'source',
    accountId: 'account',
    title: 'Suspended subscription assignment',
    detail: 'Review coverage.',
  };
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

  // Optional agreement terms: absent on older documents, strictly shaped when present.
  const terms = {
    channel: 'enterprise_agreement_subscription',
    reductionDate: '2027-01-01',
    reductionRepeatsAnnually: true,
    agreementEndDate: '2027-12-31',
    additionsAreTrueUps: true,
    excludedSkuIds: ['sku-audio-conferencing', 'sku-agent'],
  };
  assert(api.isMicrosoft365AgreementTerms(terms));
  assert(api.isMicrosoft365PricingOverridesConfiguration(config), 'Documents without agreement terms stay valid');
  assert(api.isMicrosoft365PricingOverridesConfiguration({ ...config, agreementTerms: terms }), 'Agreement terms are accepted');
  assert(
    api.isMicrosoft365AgreementTerms({
      channel: null,
      reductionDate: null,
      reductionRepeatsAnnually: false,
      agreementEndDate: null,
      additionsAreTrueUps: null,
      excludedSkuIds: [],
    }),
    'Unknown terms fall back to Microsoft lifecycle dates'
  );
  assert.deepEqual(api.MICROSOFT365_AGREEMENT_CHANNELS, ['enterprise_agreement', 'enterprise_agreement_subscription', 'csp', 'mca', 'other']);
  for (const [invalid, message] of [
    [{ ...terms, channel: 'volume' }, 'Unknown channel'],
    [{ ...terms, reductionDate: '2027-02-30' }, 'Impossible reduction date'],
    [{ ...terms, reductionDate: '2027-01-01T00:00:00Z' }, 'Timestamp instead of a date'],
    [{ ...terms, agreementEndDate: '2026-12-31' }, 'Agreement ends before the reduction date'],
    [{ ...terms, reductionRepeatsAnnually: null }, 'Repeat flag must be boolean'],
    [{ ...terms, additionsAreTrueUps: 'yes' }, 'True-up flag must be boolean or null'],
    [{ ...terms, excludedSkuIds: ['SKU-A', 'sku-a'] }, 'Excluded products are unique, case-insensitive'],
    [{ ...terms, excludedSkuIds: [''] }, 'Excluded product IDs are non-empty'],
    [{ ...terms, excludedSkuIds: Array.from({ length: 201 }, (_, index) => `sku-${index}`) }, 'Excluded products are bounded'],
    [{ ...terms, notes: 'free text' }, 'Unknown fields are rejected'],
    [(({ excludedSkuIds: _omit, ...rest }) => rest)(terms), 'Excluded products are always present'],
  ]) {
    assert(!api.isMicrosoft365AgreementTerms(invalid), message);
    assert(!api.isMicrosoft365PricingOverridesConfiguration({ ...config, agreementTerms: invalid }), `${message} (in configuration)`);
  }
  assert(!api.isMicrosoft365PricingOverridesConfiguration({ ...config, agreementTerms: null }), 'Absent, not null, means no terms');
}
console.log('M365 pricing override CJS/ESM contracts passed.');
