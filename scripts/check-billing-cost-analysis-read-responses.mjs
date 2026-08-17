import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  isBillingCostAnalysisBusinessPayloadV1,
  isBillingCostAnalysisLegacyFallbackResponse,
  isBillingCostAnalysisMetadataV2,
  isBillingCostAnalysisReadResponse,
  isBillingCostAnalysisVerifiedReadResponse,
} from '../dist/index.js';

const corpus = JSON.parse(await readFile(new URL('../fixtures/artifact-evidence-contract-corpus.json', import.meta.url), 'utf8'));
const legacyBusinessPayload = structuredClone(corpus.fixtures.legacyBillingCostAnalysisMetadataV1);
const currentV2 = structuredClone(corpus.fixtures.billingCostAnalysisMetadataV2);
const partialV2 = structuredClone(corpus.fixtures.billingCostAnalysisMetadataPartialV2);
const completeEmptyV2 = structuredClone(corpus.fixtures.billingCostAnalysisMetadataCompleteEmptyV2);
const legacyFallback = {
  subscriptionId: legacyBusinessPayload.subscriptionId,
  billingGenerationId: legacyBusinessPayload.billingGenerationId,
  chartData: legacyBusinessPayload.chartData,
  anomalies: legacyBusinessPayload.anomalies,
  currencyCode: legacyBusinessPayload.currencyCode,
  currencySymbol: legacyBusinessPayload.currencySymbol,
  artifactState: 'fallback',
  artifactSource: 'legacy-transition',
};

assert.equal(isBillingCostAnalysisBusinessPayloadV1(legacyBusinessPayload), true, 'strict V1 business validator accepts the complete legacy payload');
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1({ ...legacyBusinessPayload, forecastMethod: 'linear', forecastMonthTotal: 12, future: { label: 'ok' } }),
  true,
  'strict V1 business validator preserves optional and harmless additive business fields'
);
for (const requiredField of ['subscriptionId', 'billingGenerationId', 'chartData', 'anomalies', 'currencyCode', 'currencySymbol']) {
  const incomplete = structuredClone(legacyBusinessPayload);
  delete incomplete[requiredField];
  assert.equal(isBillingCostAnalysisBusinessPayloadV1(incomplete), false, `strict V1 business validator requires ${requiredField}`);
}
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1({ ...legacyBusinessPayload, forecastRemaining: '12' }),
  false,
  'strict V1 business validator rejects an invalid optional business field'
);
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1({ ...legacyBusinessPayload, future: { sourcePath: 'private/metadata.json' } }),
  false,
  'strict V1 business validator rejects additive physical control data'
);

assert.equal(
  isBillingCostAnalysisLegacyFallbackResponse(legacyFallback),
  true,
  'legacy-transition fallback accepts an explicit V1 business response'
);
assert.equal(isBillingCostAnalysisReadResponse(legacyFallback), true, 'read-response union accepts a validated legacy-transition fallback');
assert.equal(
  isBillingCostAnalysisLegacyFallbackResponse({ ...legacyFallback, future: { label: 'safe-additive-business-field' } }),
  true,
  'legacy-transition fallback retains the additive business boundary'
);
assert.equal(
  isBillingCostAnalysisLegacyFallbackResponse({ ...legacyFallback, artifactSource: 'analyzer-v2' }),
  false,
  'legacy fallback requires the exact legacy-transition source'
);
assert.equal(
  isBillingCostAnalysisLegacyFallbackResponse({ ...legacyFallback, artifactState: 'current' }),
  false,
  'legacy fallback requires the exact fallback state'
);

const forbiddenLegacyOwnFields = [
  'schemaVersion',
  'ownership',
  'revision',
  'inputManifestDigest',
  'outputBindingDigest',
  'outputManifestDigest',
  'artifactEvidence',
];
for (const field of forbiddenLegacyOwnFields) {
  assert.equal(
    isBillingCostAnalysisLegacyFallbackResponse({ ...legacyFallback, [field]: undefined }),
    false,
    `legacy fallback rejects leaked own property even when undefined: ${field}`
  );
}
assert.equal(
  isBillingCostAnalysisLegacyFallbackResponse({ ...currentV2, artifactState: 'fallback', artifactSource: 'legacy-transition' }),
  false,
  'legacy fallback rejects V2 control evidence leaked by object spread'
);

for (const verifiedState of ['current', 'stale']) {
  const response = { ...currentV2, artifactState: verifiedState };
  assert.equal(isBillingCostAnalysisVerifiedReadResponse(response), true, `verified response accepts ${verifiedState}`);
  assert.equal(isBillingCostAnalysisReadResponse(response), true, `read-response union accepts verified ${verifiedState}`);
}
assert.equal(isBillingCostAnalysisVerifiedReadResponse(completeEmptyV2), true, 'verified response accepts proved complete-empty');
assert.equal(isBillingCostAnalysisMetadataV2(partialV2), true, 'partial remains a valid internal V2 metadata contract');
assert.equal(isBillingCostAnalysisVerifiedReadResponse(partialV2), false, 'verified endpoint response rejects partial V2 metadata');
assert.equal(isBillingCostAnalysisReadResponse(partialV2), false, 'read-response union rejects partial V2 metadata');
assert.equal(
  isBillingCostAnalysisMetadataV2({ ...currentV2, artifactState: 'fallback' }),
  false,
  'V2 metadata rejects fallback after the explicit response split'
);
assert.equal(isBillingCostAnalysisVerifiedReadResponse(legacyFallback), false, 'verified response does not accept legacy fallback');
