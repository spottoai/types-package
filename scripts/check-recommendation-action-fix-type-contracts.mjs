import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import * as esmRoot from '../dist/esm/entries/root.js';
import * as esmRecommendations from '../dist/esm/entries/recommendations.js';

const require = createRequire(import.meta.url);
const cjsRoot = require('../dist/index.js');
const cjsRecommendations = require('../dist/azure/recommendations.js');

const EXPECTED_FIX_TYPES = ['securitySettings', 'rightsize', 'power', 'licensing', 'cleanup'];

for (const [label, api] of [
  ['esm root', esmRoot],
  ['esm recommendations', esmRecommendations],
  ['cjs root', cjsRoot],
  ['cjs recommendations', cjsRecommendations],
]) {
  const { RECOMMENDATION_ACTION_FIX_TYPES, isRecommendationActionFixType } = api;

  // Values are only ever added, so existing values keep their position and spelling.
  assert.deepEqual([...RECOMMENDATION_ACTION_FIX_TYPES].slice(0, EXPECTED_FIX_TYPES.length), EXPECTED_FIX_TYPES, label);
  assert.equal(new Set(RECOMMENDATION_ACTION_FIX_TYPES).size, RECOMMENDATION_ACTION_FIX_TYPES.length, label);

  for (const fixType of RECOMMENDATION_ACTION_FIX_TYPES) assert.equal(isRecommendationActionFixType(fixType), true, `${label}: ${fixType}`);
  for (const invalid of ['delete', 'Rightsize', 'security-settings', '', undefined, null, 7, {}]) {
    assert.equal(isRecommendationActionFixType(invalid), false, `${label}: ${String(invalid)}`);
  }
}

console.log('recommendation action fix type contracts passed');
