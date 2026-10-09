import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as esm from '../dist/esm/entries/root.js';
const cjs = createRequire(import.meta.url)('../dist/index.js');
const account = { state: 'complete', enabledIds: ['intune-p1'], disabledIds: [], unknownIds: [], errorIds: [], unavailableIds: [] };
const product = {
  state: 'complete',
  omittedPlanCount: 0,
  plans: [{ servicePlanId: 'plan', name: 'Intune Plan 1', capabilityId: 'intune-p1', provisioningStatus: 'PendingActivation', appliesTo: 'User' }],
};
const projection = {
  catalogueVersion: 'test-v1',
  accountsComplete: true,
  definitions: [{ id: 'intune-p1', name: 'Intune Plan 1', group: 'Device management' }],
  summary: [{ capabilityId: 'intune-p1', includedProductCount: 1, enabledAccountCount: 1, observedEnabledAccountCount: 1 }],
  notices: [{ kind: 'assignment_error', skuId: 'sku', accountId: 'account', title: 'Assignment error', detail: 'Review assignment' }],
  observedNoticeCount: 1,
  omittedNoticeCount: 0,
};
for (const module of [esm, cjs]) {
  const comparison = {
    targetSkuId: 'target',
    targetProductName: 'Target',
    source: 'publisher',
    addedCapabilityIds: [],
    lostCapabilityIds: [],
    unverifiedPlanCount: 0,
    monthlyRetailDifferenceByCurrency: { USD: 0 },
    priceListVersion: 'test-v1',
    priceEvidenceByCurrency: {
      USD: {
        current: { unitPriceMonthly: 26, confidence: 'verified', source: 'https://www.microsoft.com/microsoft-365', checkedAt: '2026-10-06' },
        target: { unitPriceMonthly: 26, confidence: 'reference', source: 'https://learn.microsoft.com/microsoft-365', checkedAt: '2024-01-01' },
      },
    },
  };
  assert(module.isMicrosoft365ProductCapabilities({ ...product, comparison }));
  assert(!module.isMicrosoft365AccountCapabilities({ ...account, state: ['complete'] }), 'States must be scalar strings.');
  assert(!module.isMicrosoft365ProductCapabilities({ ...product, state: ['complete'] }));
  assert(
    !module.isMicrosoft365ProductCapabilities({ ...product, comparison: { ...comparison, source: ['publisher'] } }),
    'Comparison source must be a scalar string.'
  );
  assert(
    !module.isMicrosoft365CapabilityProjection({ ...projection, notices: [{ ...projection.notices[0], kind: ['redundant_addon'] }] }),
    'Notice kinds cannot bypass kind-specific evidence requirements.'
  );
  for (const invalid of [
    { confidence: ['verified'] },
    { unitPriceMonthly: -1 },
    { source: 'https://www.microsoft.com@evil.example/path' },
    { checkedAt: 'yesterday' },
  ]) {
    assert(
      !module.isMicrosoft365ProductCapabilities({
        ...product,
        comparison: {
          ...comparison,
          priceEvidenceByCurrency: {
            USD: { ...comparison.priceEvidenceByCurrency.USD, target: { ...comparison.priceEvidenceByCurrency.USD.target, ...invalid } },
          },
        },
      })
    );
  }
  assert(module.isMicrosoft365AccountCapabilities(account));
  assert(!module.isMicrosoft365AccountCapabilities({ ...account, disabledIds: ['intune-p1'] }), 'Exclusive states cannot overlap.');
  assert(!module.isMicrosoft365AccountCapabilities({ ...account, enabledIds: Array(129).fill('capability') }));
  assert(module.isMicrosoft365ProductCapabilities(product), 'Pending provisioning is valid included capability evidence.');
  assert(!module.isMicrosoft365ProductCapabilities({ ...product, plans: [product.plans[0], product.plans[0]] }));
  assert(module.isMicrosoft365CapabilityProjection(projection));
  assert(!module.isMicrosoft365CapabilityProjection({ ...projection, observedNoticeCount: 0 }), 'Notice omissions reconcile.');
  assert(
    !module.isMicrosoft365CapabilityProjection({ ...projection, accountsComplete: false }),
    'Incomplete population cannot publish exact counts.'
  );
  assert(!module.isMicrosoft365CapabilityProjection({ ...projection, definitions: [...projection.definitions, projection.definitions[0]] }));
  assert(!module.isMicrosoft365CapabilityProjection({ ...projection, notices: [{ ...projection.notices[0], accountId: undefined }] }));
  const retirement = {
    kind: 'retired_service',
    skuId: 'sku',
    title: 'Service retired',
    detail: 'Remaining rights require review',
    retiredAt: '2026-09-30',
    sourceUrl: 'https://learn.microsoft.com/en-us/projectonline/get-started-with-project-online',
  };
  assert(module.isMicrosoft365CapabilityProjection({ ...projection, notices: [retirement] }));
  assert(!module.isMicrosoft365CapabilityProjection({ ...projection, notices: [{ ...retirement, sourceUrl: 'javascript:alert(1)' }] }));
  assert(
    !module.isMicrosoft365CapabilityProjection({
      ...projection,
      notices: [{ ...retirement, sourceUrl: 'https://learn.microsoft.com@evil.example/path' }],
    })
  );
}
console.log('PASS: Microsoft 365 capability CJS/ESM contracts, bounds, mutually exclusive states, count reconciliation and safe retirement sources.');
