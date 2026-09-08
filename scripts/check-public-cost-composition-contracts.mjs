import assert from 'node:assert/strict';

import {
  PUBLIC_COST_COMPOSITION_PROJECTION_CONTRACT_V1,
  applyPublicCostCompositionEstimateLensV1,
  isPublicCostComposition,
  projectPublicCostCompositionsV1,
} from '../dist/index.js';

const available = (amount) => ({
  status: 'available',
  component: {
    amount,
    currencyCode: 'NZD',
    currencyResolutionRef: 'currency:nzd',
    coverageRef: 'coverage:rolling-30-days',
    sourceGenerationRefs: ['billing-generation-1'],
    rowCount: 1,
  },
});

const basis = (name) => ({
  basis: name,
  actual: { support: 'supported', availability: available('20') },
  estimated: { support: 'supported', availability: available('7') },
  combined: available('27'),
  status: 'actual-plus-estimated',
  estimateConfidence: 'high',
  supersessionRefs: [],
});

const internalComposition = {
  schemaVersion: 1,
  compositionId: 'composition-1',
  coverageIdentity: {
    schemaVersion: 1,
    identityVersion: 'billing-component-day/v1',
    scopeRef: 'subscription:sub-1',
    periodRef: 'rolling-30-days:2026-08-01:2026-08-31',
    startDate: '2026-08-01',
    endDateExclusive: '2026-08-31',
    dateBasis: 'utc',
    allocationOwnerResourceId: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
    billableComponentKey: 'compute|vm-1',
  },
  selectedLens: 'actual-plus-estimated',
  billed: basis('billed'),
  amortized: basis('amortized'),
  coverageCompletenessRef: 'coverage:complete',
  allocationRef: 'allocation:resource-owner/v1',
};

const source = { nested: [{ composition: internalComposition }] };
const projected = projectPublicCostCompositionsV1(source);
const publicComposition = projected.nested[0].composition;

assert.equal(PUBLIC_COST_COMPOSITION_PROJECTION_CONTRACT_V1, 'public-cost-composition/v1');
assert.equal(isPublicCostComposition(publicComposition), true);
assert.deepEqual(Object.keys(publicComposition), ['schemaVersion', 'selectedLens', 'billed', 'amortized']);
assert.deepEqual(publicComposition.billed.combined, {
  status: 'available',
  component: { amount: '27', currencyCode: 'NZD' },
});
assert.equal(JSON.stringify(projected).includes('compositionId'), false);
assert.equal(JSON.stringify(projected).includes('sourceGenerationRefs'), false);
assert.equal(JSON.stringify(projected).includes('coverageRef'), false);

const estimatesOnly = applyPublicCostCompositionEstimateLensV1(projected, 'estimates-only');
assert.equal(estimatesOnly.nested[0].composition.selectedLens, 'estimates-only');
assert.deepEqual(estimatesOnly.nested[0].composition.billed.combined, {
  status: 'available',
  component: { amount: '7', currencyCode: 'NZD' },
});
assert.equal(isPublicCostComposition(estimatesOnly.nested[0].composition), true);

const alreadyPublic = projectPublicCostCompositionsV1(projected);
assert.equal(alreadyPublic, projected, 'an already-public document should retain object identity');

const unrelated = { schemaVersion: 1, compositionId: 'not-a-cost-composition' };
assert.equal(projectPublicCostCompositionsV1(unrelated), unrelated);

console.log('Public cost composition projection contracts passed.');
