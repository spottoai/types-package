import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  isBillingCostAnalysisBusinessPayloadV1,
  isBillingCostAnalysisLegacyFallbackResponse,
  isBillingCostAnalysisMetadataV2,
  isBillingCostAnalysisPublicResponse,
  isBillingCostAnalysisReadResponse,
  isBillingCostAnalysisVerifiedReadResponse,
  isPublicCostComposition,
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
const proseBearingLegacyBusinessPayload = {
  ...legacyBusinessPayload,
  subscriptionId: 'tenant:sub-123',
  billingGenerationId: 'billing:generation-v1',
  currencyCode: 'currency:NZD',
  currencySymbol: 'symbol:$',
  forecastMethod: 'forecast:linear-v2',
  chartData: {
    ...legacyBusinessPayload.chartData,
    source: 'source:aggregated',
    views: {
      daily: {
        aggregation: 'daily',
        startDate: 1_782_864_000,
        endDate: 1_785_542_400,
        averageDailyCost: 10,
        totalCost: 310,
        points: [
          {
            date: 'date:2026-07-01',
            timestamp: 1_782_864_000,
            cost: 10,
            isAnomaly: false,
            anomalyVotes: 0,
            anomalyMethods: ['detector:seasonal'],
          },
        ],
        trend: { method: 'trend:linear', slope: 1, intercept: 0 },
      },
      forecast: {
        aggregation: 'daily',
        forecastMethod: 'forecast:linear-v2',
        startDate: 1_782_864_000,
        endDate: 1_785_542_400,
        actualTotalCost: 10,
        forecastRemaining: 20,
        forecastMonthTotal: 30,
        actualPoints: [
          {
            date: 'date:2026-07-01',
            timestamp: 1_782_864_000,
            cost: 10,
            isAnomaly: false,
            anomalyVotes: 0,
            anomalyMethods: ['detector:actual'],
          },
        ],
        forecastPoints: [{ date: 'date:2026-07-02', timestamp: 1_782_950_400, cost: 11 }],
        fittedPoints: [{ date: 'date:2026-07-01', timestamp: 1_782_864_000, cost: 10 }],
        trend: { method: 'trend:forecast', slope: 1, intercept: 0 },
      },
    },
    detectors: {
      ...legacyBusinessPayload.chartData.detectors,
      methods: [
        {
          name: 'detector:seasonal',
          status: 'status:ready',
          error: 'Alert: historical variance exceeded https://example.invalid/policy',
          triggeredDates: [],
        },
      ],
    },
  },
  anomalies: [
    {
      date: 1_782_864_000,
      summary: 'Alert: cost increased; see https://example.invalid/runbook',
      confidence: 'urn:confidence:high',
      notes: ['Investigation: compare service:baseline', 'Reference: https://example.invalid/anomaly'],
      impact: {
        cost: 10,
        delta: 5,
        baseline7Day: null,
        baseline30Day: null,
        percentChange: null,
        previousDayCost: null,
        previousDayDelta: null,
        monthToDateCost: 20,
        monthToDateBaseline: null,
        monthToDateDelta: null,
        monthToDatePercentChange: null,
      },
      drivers: [
        {
          type: 'service:azure',
          name: 'Compute: Premium',
          summary: 'Driver: usage moved to https://example.invalid/tier',
          cost: 10,
          delta: 5,
          baseline: null,
          percentChange: null,
          shareOfImpactPercent: 100,
          isNew: false,
          resources: [
            {
              name: 'vm:primary',
              resourceScope: 'scope:subscription',
              resourceId: '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
              cost: 10,
              baseline: null,
              delta: 5,
              percentChange: null,
              isNew: false,
              summary: 'Resource: investigate https://example.invalid/resource',
            },
          ],
        },
      ],
    },
  ],
};
const proseBearingLegacyFallback = {
  ...proseBearingLegacyBusinessPayload,
  artifactState: 'fallback',
  artifactSource: 'legacy-transition',
};
const { billingGenerationId: _internalGenerationId, ...publicBusinessData } = legacyBusinessPayload;
const currentPublicResponse = {
  schemaVersion: 1,
  dataState: 'current',
  ...publicBusinessData,
};
const noActivityPublicResponse = {
  schemaVersion: 1,
  subscriptionId: legacyBusinessPayload.subscriptionId,
  dataState: 'no-activity',
};

assert.equal(isBillingCostAnalysisPublicResponse(currentPublicResponse), true, 'public response accepts current business data');
assert.equal(
  isBillingCostAnalysisPublicResponse({ ...currentPublicResponse, dataState: 'previous-verified' }),
  true,
  'public response accepts previous verified business data'
);
assert.equal(isBillingCostAnalysisPublicResponse(noActivityPublicResponse), true, 'public response accepts no-activity state');
for (const internalField of [
  'billingGenerationId',
  'ownership',
  'revision',
  'inputManifestDigest',
  'outputBindingDigest',
  'artifactState',
  'artifactEvidence',
  'artifactSource',
  'runId',
  'reason',
]) {
  assert.equal(
    isBillingCostAnalysisPublicResponse({ ...currentPublicResponse, [internalField]: 'internal' }),
    false,
    `public response rejects internal field ${internalField}`
  );
}
assert.equal(
  isBillingCostAnalysisPublicResponse({ ...noActivityPublicResponse, chartData: legacyBusinessPayload.chartData }),
  false,
  'no-activity response rejects synthetic chart data'
);

const publicCostComposition = {
  schemaVersion: 1,
  selectedLens: 'actual-plus-estimated',
  billed: {
    basis: 'billed',
    actual: { support: 'supported', availability: { status: 'available', component: { amount: '10.25', currencyCode: 'NZD' } } },
    estimated: { support: 'supported', availability: { status: 'unavailable' } },
    combined: { status: 'available', component: { amount: '10.25', currencyCode: 'NZD' } },
    status: 'actual-only',
    estimateConfidence: 'high',
  },
  amortized: {
    basis: 'amortized',
    actual: { support: 'unknown', availability: { status: 'unavailable' } },
    estimated: { support: 'unknown', availability: { status: 'unavailable' } },
    combined: { status: 'unavailable' },
    status: 'unavailable',
  },
};
assert.equal(isPublicCostComposition(publicCostComposition), true, 'public cost composition accepts customer monetary data');
for (const internalField of [
  'compositionId',
  'coverageIdentity',
  'coverageCompletenessRef',
  'allocationRef',
  'sourceGenerationRefs',
  'rowCount',
  'supersessionRefs',
  'estimateMethodRef',
  'uncertaintyRef',
]) {
  assert.equal(
    isPublicCostComposition({ ...publicCostComposition, [internalField]: 'internal' }),
    false,
    `public cost composition rejects internal field ${internalField}`
  );
}

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
for (const leakedResponseControl of [
  { artifactState: 'current' },
  { artifactState: 'partial' },
  { artifactSource: 'analyzer-v2' },
  { artifactState: 'fallback', artifactSource: 'legacy-transition' },
]) {
  assert.equal(
    isBillingCostAnalysisBusinessPayloadV1({ ...legacyBusinessPayload, ...leakedResponseControl }),
    false,
    'strict V1 business validator rejects response-authority controls'
  );
}
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1(proseBearingLegacyBusinessPayload),
  true,
  'strict V1 business validator allows URI-shaped prose in schema-owned business text fields'
);
assert.equal(
  isBillingCostAnalysisLegacyFallbackResponse(proseBearingLegacyFallback),
  true,
  'legacy fallback allows URI-shaped prose in schema-owned business text fields'
);
assert.equal(isBillingCostAnalysisReadResponse(proseBearingLegacyFallback), true, 'read union allows a prose-bearing legacy fallback');
for (const [name, maliciousAdditive] of [
  ['physical reference field', { sourcePath: 'private/metadata.json' }],
  ['credential field', { authorization: 'Bearer secret-example' }],
  ['physical URI value', { location: 'https://storage.example.invalid/private/metadata.json' }],
  ['URI-shaped business-like field in an unknown subtree', { source: 'source:additive' }],
  ['raw digest value under an unknown key', { fingerprint: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }],
  ['nested manifest digest control field', { manifestDigest: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }],
  ['nested sha256 control field', { sha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }],
  ['undefined nested evidence control field', { manifestDigest: undefined }],
  ['non-Azure resource identity', { resourceId: 'vm-1' }],
]) {
  const maliciousBusinessPayload = { ...legacyBusinessPayload, future: maliciousAdditive };
  const maliciousFallback = { ...legacyFallback, future: maliciousAdditive };
  const maliciousV2 = { ...currentV2, future: maliciousAdditive };
  assert.equal(isBillingCostAnalysisBusinessPayloadV1(maliciousBusinessPayload), false, `strict V1 business validator rejects ${name}`);
  assert.equal(isBillingCostAnalysisLegacyFallbackResponse(maliciousFallback), false, `legacy fallback rejects ${name}`);
  assert.equal(isBillingCostAnalysisReadResponse(maliciousFallback), false, `read union rejects ${name}`);
  assert.equal(isBillingCostAnalysisMetadataV2(maliciousV2), false, `V2 metadata rejects ${name}`);
  assert.equal(isBillingCostAnalysisVerifiedReadResponse(maliciousV2), false, `verified response rejects ${name}`);
  assert.equal(isBillingCostAnalysisReadResponse(maliciousV2), false, `read union rejects V2 ${name}`);
}

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
const expandedForbiddenLegacyOwnFields = {
  manifestDigest: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  sha256: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  publicationDecision: { processing: 'succeeded', evidence: 'complete', publication: 'completed', dependencies: [], claims: [], issues: [] },
  artifacts: [{ name: 'metadata.json', byteLength: 128, mediaType: 'application/json', contentEncoding: 'identity' }],
  byteLength: 128,
  contentEncoding: 'gzip',
  mediaType: 'application/json',
  etag: 'etag-1',
  versionId: 'version-1',
  manifestPath: 'subscriptions/sub-123/billing/generations/generation-1/manifest.json',
};
for (const [field, realisticValue] of Object.entries(expandedForbiddenLegacyOwnFields)) {
  for (const value of [realisticValue, undefined]) {
    const leakedFallback = { ...legacyFallback, [field]: value };
    assert.equal(isBillingCostAnalysisLegacyFallbackResponse(leakedFallback), false, `legacy fallback rejects own control field: ${field}`);
    assert.equal(isBillingCostAnalysisReadResponse(leakedFallback), false, `read union rejects own control field: ${field}`);
  }
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
assert.equal(
  isBillingCostAnalysisMetadataV2({ ...currentV2, artifactSource: 'legacy-transition' }),
  false,
  'V2 metadata rejects the legacy fallback source discriminant'
);
assert.equal(
  isBillingCostAnalysisVerifiedReadResponse({ ...currentV2, artifactSource: 'legacy-transition' }),
  false,
  'verified V2 response rejects the legacy fallback source discriminant'
);
assert.equal(
  isBillingCostAnalysisReadResponse({ ...currentV2, artifactSource: 'legacy-transition' }),
  false,
  'read-response union rejects a V2 and legacy-source hybrid'
);
assert.equal(isBillingCostAnalysisVerifiedReadResponse(legacyFallback), false, 'verified response does not accept legacy fallback');

const schemaOwnedIdentityV2 = structuredClone(currentV2);
schemaOwnedIdentityV2.subscriptionId = 'tenant:sub-123';
schemaOwnedIdentityV2.billingGenerationId = 'c'.repeat(64);
schemaOwnedIdentityV2.ownership.tenantId = 'https://identity.example.invalid/tenant';
schemaOwnedIdentityV2.ownership.companyId = 'd'.repeat(64);
schemaOwnedIdentityV2.ownership.cloudAccountId = 'urn:cloud-account:primary';
schemaOwnedIdentityV2.ownership.accountId = schemaOwnedIdentityV2.subscriptionId;
schemaOwnedIdentityV2.artifactEvidence.dependencies[0].generationId = schemaOwnedIdentityV2.billingGenerationId;
schemaOwnedIdentityV2.artifactEvidence.dependencies.push(
  {
    name: 'dependency:auxiliary',
    required: false,
    support: 'supported',
    applicability: 'applicable',
    attempt: 'succeeded',
    coverage: 'complete',
    emptyEvidence: 'populated',
    freshness: 'current',
    evidence: 'complete',
    publication: 'completed',
    generationId: 'https://generation.example.invalid/auxiliary',
    reasonCode: 'e'.repeat(64),
  },
  {
    name: 'dependency:complete-empty',
    required: false,
    support: 'supported',
    applicability: 'applicable',
    attempt: 'succeeded',
    coverage: 'complete',
    emptyEvidence: 'complete-empty',
    freshness: 'current',
    evidence: 'complete',
    publication: 'completed',
    acceptedRowCount: 0,
    emptyProofRef: 'proofs/complete-empty.json',
  }
);
schemaOwnedIdentityV2.artifactEvidence.claims.push({
  claimId: 'claim:auxiliary',
  sectionPaths: ['https://sections.example.invalid/auxiliary', 'f'.repeat(64)],
  requiredDependencies: ['dependency:auxiliary'],
  evidence: 'complete',
  publication: 'completed',
  issues: [{ code: 'claim:advisory', blocking: false, dependency: 'dependency:auxiliary' }],
});
schemaOwnedIdentityV2.artifactEvidence.issues.push({
  code: 'a'.repeat(64),
  blocking: false,
  dependency: 'https://dependency.example.invalid/advisory',
});
assert.equal(
  isBillingCostAnalysisMetadataV2(schemaOwnedIdentityV2),
  true,
  'V2 metadata allows URI-shaped and digest-shaped values in schema-owned identity and evidence fields'
);
assert.equal(
  isBillingCostAnalysisVerifiedReadResponse(schemaOwnedIdentityV2),
  true,
  'verified response allows URI-shaped and digest-shaped values in schema-owned identity and evidence fields'
);
assert.equal(
  isBillingCostAnalysisReadResponse(schemaOwnedIdentityV2),
  true,
  'read union allows URI-shaped and digest-shaped values in schema-owned identity and evidence fields'
);

const instrumentPropertyReads = (value, reads) => {
  const instrumented = {};
  for (const [key, propertyValue] of Object.entries(value)) {
    Object.defineProperty(instrumented, key, {
      enumerable: true,
      get: () => {
        reads.count += 1;
        return propertyValue;
      },
    });
  }
  return instrumented;
};
const buildLargeLegacyBusinessPayload = (pointCount, reads) => {
  const payload = structuredClone(legacyBusinessPayload);
  payload.chartData.views = {
    daily: {
      aggregation: 'daily',
      startDate: 1_782_864_000,
      endDate: 1_785_542_400,
      averageDailyCost: 10,
      totalCost: pointCount * 10,
      points: Array.from({ length: pointCount }, (_, index) =>
        instrumentPropertyReads(
          {
            date: `2026-07-${String((index % 28) + 1).padStart(2, '0')}`,
            timestamp: 1_782_864_000 + index,
            cost: 10,
            isAnomaly: false,
            anomalyVotes: 0,
            anomalyMethods: ['detector:seasonal'],
          },
          reads
        )
      ),
    },
  };
  return payload;
};
const smallReads = { count: 0 };
const largeReads = { count: 0 };
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1(buildLargeLegacyBusinessPayload(1_000, smallReads)),
  true,
  'large legacy business payload remains valid'
);
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1(buildLargeLegacyBusinessPayload(8_000, largeReads)),
  true,
  '8x legacy business payload remains valid'
);
assert.ok(
  largeReads.count <= smallReads.count * 8 && largeReads.count >= smallReads.count * 7,
  `billing business validation must keep property reads linear for 8x payload growth (${smallReads.count} -> ${largeReads.count})`
);
