import assert from 'node:assert/strict';

for (const path of ['../dist/index.js', '../dist/esm/entries/root.js']) {
  const { isKnownResourceGroupSpend } = await import(path);
  assert.equal(typeof isKnownResourceGroupSpend, 'function');
  const known = {
    currency: 'USD',
    totalResourceCount: 3,
    billedResourceCount: 2,
    amortizedResourceCount: 1,
    cost: -1,
    costAmortized: 0,
  };
  assert.equal(isKnownResourceGroupSpend(known), true);
  assert.equal(isKnownResourceGroupSpend({ ...known, amortizedResourceCount: 0, costAmortized: undefined }), true);
  for (const invalid of [
    undefined,
    { ...known, taxTreatment: 'consumption-only' },
    { ...known, currency: '' },
    { ...known, currency: 'unknown' },
    { ...known, totalResourceCount: 0 },
    { ...known, billedResourceCount: 4 },
    { ...known, billedResourceCount: -1 },
    { ...known, billedResourceCount: 1.5 },
    { ...known, billedResourceCount: undefined },
    { ...known, cost: undefined },
    { ...known, cost: NaN },
    { ...known, costAmortized: Infinity },
    { ...known, amortizedResourceCount: 0 },
    { ...known, billedResourceCount: 0, amortizedResourceCount: 0, cost: undefined, costAmortized: undefined },
    { ...known, unrelated: true },
  ])
    assert.equal(isKnownResourceGroupSpend(invalid), false, JSON.stringify(invalid));
  console.log(`${path}: known resource group spend checks passed`);
}
