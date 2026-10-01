// Contract check for the provider-neutral resource size options (specs/compute-alternatives/resource-size-options-types-package.md).
// The positive fixture is real ap-southeast-2 EC2 list-price output from the cloud-engine-aws instance catalog;
// negatives apply one patch per rejection rule.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RESOURCE_SIZE_OPTION_LIMITS, isResourceSizeOption, isResourceSizeOptions } from '../dist/index.js';

const fixturePath = join(resolve(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'resource-size-options'), 'ec2-ap-southeast-2.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const patched = patch => {
  const copy = structuredClone(fixture);
  patch(copy);
  return copy;
};

assert.equal(isResourceSizeOptions(fixture), true, 'the engine fixture conforms');
assert.equal(isResourceSizeOption(fixture.current), true);
assert.deepEqual(RESOURCE_SIZE_OPTION_LIMITS, { alternatives: 5, memoryPreservingAlternatives: 5, tradeOffAlternatives: 5 });

// Additive: unknown fields, unknown capability and price-source values, and empty lists are accepted.
assert.equal(isResourceSizeOptions(patched(value => { value.futureField = 1; value.current.futureField = true; })), true);
assert.equal(isResourceSizeOptions(patched(value => { value.tradeOffAlternatives[0].lostCapabilities = ['future-capability']; })), true);
assert.equal(isResourceSizeOptions(patched(value => { value.priceSource = 'future-source'; })), true);
assert.equal(
  isResourceSizeOptions(patched(value => { value.alternatives = []; value.memoryPreservingAlternatives = []; value.tradeOffAlternatives = []; })),
  true,
  'a size with no cheaper option still publishes its own prices'
);
assert.equal(isResourceSizeOptions(patched(value => { delete value.current.architecture; delete value.current.prices.reserved1yNoUpfrontHourly; })), true);

const rejections = {
  'not an object': () => null,
  'missing service': value => { delete value.service; },
  'price basis other than list': value => { value.priceBasis = 'billed'; },
  'cross-region scope': value => { value.comparisonScope = 'cross-region'; },
  'unknown availability': value => { value.availability = 'maybe'; },
  'non-string pricing dimension': value => { value.pricingDimensions.operatingSystem = 1; },
  'current that changes price': value => { value.current.changePercent = -1; },
  'current that gives something up': value => { value.current.lostCapabilities = ['gpu']; },
  'option without a sku': value => { delete value.alternatives[0].sku; },
  'zero vCPU': value => { value.alternatives[0].vcpu = 0; },
  'negative price': value => { value.alternatives[0].prices.onDemandHourly = -0.1; },
  'negative reserved price': value => { value.current.prices.reserved3yAllUpfrontHourly = -1; },
  'non-cheaper alternative': value => { value.alternatives[0].changePercent = 0; },
  'alternative that gives something up': value => { value.alternatives[0].lostCapabilities = ['architecture']; },
  'trade-off that gives nothing up': value => { value.tradeOffAlternatives[0].lostCapabilities = []; },
  'unsorted alternatives': value => { value.alternatives.reverse(); value.alternatives[0].prices.onDemandHourly = 0.3; },
  'memory-preserving option with less memory': value => { value.memoryPreservingAlternatives[0].memoryGB = 16; },
  'list over its limit': value => {
    value.alternatives = Array.from({ length: RESOURCE_SIZE_OPTION_LIMITS.alternatives + 1 }, () => structuredClone(fixture.alternatives[0]));
  },
};
for (const [name, patch] of Object.entries(rejections)) {
  const candidate = name === 'not an object' ? patch() : patched(patch);
  assert.equal(isResourceSizeOptions(candidate), false, `rejects ${name}`);
}

console.log(`resource size options contracts: 1 fixture, ${Object.keys(rejections).length} rejections`);
