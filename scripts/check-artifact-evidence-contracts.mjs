import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import {
  compareArtifactRevisionVector,
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisMetadataV2,
  isEnforceableArtifactOwnershipBinding,
} from '../dist/index.js';

const corpusBytes = await readFile(new URL('../fixtures/artifact-evidence-contract-corpus.json', import.meta.url));
const contractCorpus = JSON.parse(corpusBytes.toString('utf8'));
const corpusDigest = createHash('sha256').update(corpusBytes).digest('hex');
assert.equal(contractCorpus.corpusVersion, 2, 'portable corpus version must match the downstream parity contract');

const isRecord = value => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = value => typeof value === 'string' && value.length > 0;
const isArrayIndex = segment => /^(0|[1-9]\d*)$/.test(segment);
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const resolveMutationParent = (document, path) => {
  const segments = path.split('.');
  assert.ok(segments.length > 0 && segments.every(segment => segment.length > 0), `invalid mutation path: ${path}`);

  let target = document;
  for (const [index, segment] of segments.slice(0, -1).entries()) {
    if (Array.isArray(target)) {
      assert.ok(isArrayIndex(segment), `mutation path requires an array index: ${path}`);
      assert.ok(Number(segment) < target.length && hasOwn(target, segment), `mutation array index does not exist: ${path}`);
    } else {
      assert.ok(isRecord(target), `mutation path requires an object parent: ${path}`);
      assert.ok(!isArrayIndex(segment), `mutation path requires an object property: ${path}`);
      assert.ok(hasOwn(target, segment), `mutation parent does not exist: ${path}`);
    }

    target = target[segment];
    const nextSegment = segments[index + 1];
    assert.ok(isArrayIndex(nextSegment) ? Array.isArray(target) : isRecord(target), `mutation parent has the wrong container shape: ${path}`);
  }

  const key = segments.at(-1);
  if (Array.isArray(target)) {
    assert.ok(isArrayIndex(key), `mutation target requires an array index: ${path}`);
    assert.ok(Number(key) <= target.length, `mutation array target is out of range: ${path}`);
  } else {
    assert.ok(isRecord(target), `mutation target requires an object parent: ${path}`);
    assert.ok(!isArrayIndex(key), `mutation target requires an object property: ${path}`);
  }
  return { parent: target, key };
};

const applyMutation = (document, mutation) => {
  assert.ok(isRecord(mutation) && isNonEmptyString(mutation.path), 'every corpus mutation requires a path');
  const hasValue = Object.prototype.hasOwnProperty.call(mutation, 'value');
  const deletesValue = mutation.delete === true;
  assert.notEqual(hasValue, deletesValue, `mutation must set or delete exactly one value: ${mutation.path}`);

  const { parent, key } = resolveMutationParent(document, mutation.path);
  if (deletesValue) {
    assert.ok(hasOwn(parent, key), `mutation delete target does not exist: ${mutation.path}`);
    if (Array.isArray(parent)) parent.splice(Number(key), 1);
    else delete parent[key];
    return;
  }
  parent[key] = structuredClone(mutation.value);
};

const materializeCorpusCase = corpusCase => {
  const sourceFixture = contractCorpus.fixtures[corpusCase.fixture];
  assert.notEqual(sourceFixture, undefined, `unknown corpus fixture: ${corpusCase.fixture}`);
  const fixtureBefore = structuredClone(sourceFixture);
  const document = structuredClone(sourceFixture);
  for (const mutation of corpusCase.mutations) applyMutation(document, mutation);
  assert.deepEqual(sourceFixture, fixtureBefore, `corpus fixture was mutated: ${corpusCase.fixture}`);
  return { base: fixtureBefore, document };
};

const mutationFailureCases = [
  ['typoed intermediate parent', { path: 'dependenciez.0.name', value: 'billing-history' }],
  ['missing delete target', { path: 'dependencies.0.missingField', delete: true }],
  ['out-of-range array index', { path: 'dependencies.99.name', value: 'billing-history' }],
];
const mutationFailureResults = mutationFailureCases.map(([, mutation]) => {
  try {
    applyMutation(structuredClone(contractCorpus.fixtures.currentPopulatedDecision), mutation);
    return false;
  } catch {
    return true;
  }
});
assert.deepEqual(
  mutationFailureResults,
  mutationFailureCases.map(() => true),
  'mutation materialization must fail fast for malformed paths'
);
assert.equal(
  compareArtifactRevisionVector(
    { ownershipEpochRevision: 3, sourceRevision: 0, policyRevision: 7 },
    { ownershipEpochRevision: 3, sourceRevision: 1, policyRevision: 7 }
  ),
  'older',
  'the comparator compares supplied vectors; callers must validate positive revisions before comparison'
);

const hasLegacyBillingCostAnalysisMetadataShape = value => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== undefined ||
    !isNonEmptyString(value.subscriptionId) ||
    !isNonEmptyString(value.billingGenerationId) ||
    !isRecord(value.chartData) ||
    !Array.isArray(value.anomalies) ||
    !isNonEmptyString(value.currencyCode) ||
    !isNonEmptyString(value.currencySymbol)
  ) {
    return false;
  }

  const { chartData } = value;
  return (
    Number.isSafeInteger(chartData.schemaVersion) &&
    chartData.schemaVersion > 0 &&
    isNonEmptyString(chartData.source) &&
    isRecord(chartData.dataWindow) &&
    Number.isFinite(chartData.dataWindow.startDate) &&
    Number.isFinite(chartData.dataWindow.endDate) &&
    Number.isSafeInteger(chartData.dataWindow.pointCount) &&
    chartData.dataWindow.pointCount >= 0 &&
    isRecord(chartData.views) &&
    isRecord(chartData.detectors) &&
    Number.isFinite(chartData.detectors.threshold) &&
    Array.isArray(chartData.detectors.methods)
  );
};

const satisfiesPromotionPrecondition = (current, candidate) => {
  const comparison = compareArtifactRevisionVector(candidate.revision, current.revision);
  if (comparison === 'newer' || comparison === 'newer-ownership') return true;
  return (
    comparison === 'equal' &&
    typeof current.manifestDigest === 'string' &&
    typeof candidate.manifestDigest === 'string' &&
    candidate.manifestDigest === current.manifestDigest
  );
};

const corpusValidators = {
  isArtifactPublicationDecision,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
};

const expectedCorpusValidatorNames = new Set([
  'artifactPromotionPrecondition',
  'billingCostAnalysisMetadataCompatibility',
  'isArtifactPublicationDecision',
  'isBillingAnalysisCurrentPointerV1',
  'isBillingAnalyzerInputCurrentPointerV1',
  'isBillingAnalyzerInputManifestV2',
  'isBillingAnalyzerOutputManifestV2',
  'isBillingAnalyzerRequestV2',
]);
const requiredPortableBillingValidatorNames = [
  'isBillingAnalysisCurrentPointerV1',
  'isBillingAnalyzerInputCurrentPointerV1',
  'isBillingAnalyzerInputManifestV2',
  'isBillingAnalyzerOutputManifestV2',
  'isBillingAnalyzerRequestV2',
];
const corpusValidatorNames = new Set(contractCorpus.cases.map(corpusCase => corpusCase.validator));
assert.deepEqual(corpusValidatorNames, expectedCorpusValidatorNames, 'portable corpus validator-name set must remain exact');
for (const validatorName of requiredPortableBillingValidatorNames) {
  const portableCases = contractCorpus.cases.filter(corpusCase => corpusCase.validator === validatorName);
  assert.ok(
    portableCases.some(corpusCase => corpusCase.valid === true),
    `${validatorName} requires a portable positive case`
  );
  assert.ok(
    portableCases.some(corpusCase => corpusCase.valid === false),
    `${validatorName} requires a portable negative case`
  );
}

let mutationCount = 0;
for (const corpusCase of contractCorpus.cases) {
  assert.ok(Array.isArray(corpusCase.mutations), `corpus case has no mutation list: ${corpusCase.name}`);
  mutationCount += corpusCase.mutations.length;
  const { base, document } = materializeCorpusCase(corpusCase);

  if (corpusCase.validator === 'billingCostAnalysisMetadataCompatibility') {
    assert.equal(isBillingCostAnalysisMetadataV2(document), false, `${corpusCase.name}: legacy V1 must not be treated as V2`);
    assert.equal(hasLegacyBillingCostAnalysisMetadataShape(document), corpusCase.valid, `${corpusCase.name}: structural compatibility`);
    continue;
  }

  if (corpusCase.validator === 'artifactPromotionPrecondition') {
    const comparison = compareArtifactRevisionVector(document.revision, base.revision);
    assert.equal(comparison, corpusCase.expectedRevisionComparison, `${corpusCase.name}: revision comparison`);
    assert.equal(satisfiesPromotionPrecondition(base, structuredClone(base)), true, `${corpusCase.name}: equal digest is idempotent`);
    assert.equal(satisfiesPromotionPrecondition(base, document), corpusCase.valid, corpusCase.name);
    continue;
  }

  const validator = corpusValidators[corpusCase.validator];
  assert.equal(typeof validator, 'function', `unknown corpus validator: ${corpusCase.validator}`);
  assert.equal(validator(document), corpusCase.valid, corpusCase.name);
}

const comparisonOutcomes = new Set();
for (const comparisonCase of contractCorpus.revisionComparisons) {
  const actual = compareArtifactRevisionVector(comparisonCase.left, comparisonCase.right);
  comparisonOutcomes.add(actual);
  assert.equal(actual, comparisonCase.expected, comparisonCase.name);
}
assert.deepEqual(
  comparisonOutcomes,
  new Set(['unenforceable', 'newer-ownership', 'older-ownership', 'newer', 'older', 'incomparable', 'equal']),
  'canonical corpus must execute every revision-comparison branch'
);

const digestA = 'a'.repeat(64);
const digestB = 'b'.repeat(64);
const digestC = 'c'.repeat(64);
const subscriptionId = 'sub-123';
const generationId = 'billing-input-generation-42';

const ownership = {
  provider: 'azure',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId: subscriptionId,
  ownershipEpochRevision: 3,
};
const revision = { ownershipEpochRevision: 3, sourceRevision: 42, policyRevision: 7 };
const publicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [
    {
      name: 'billing-history',
      required: true,
      support: 'supported',
      applicability: 'applicable',
      attempt: 'succeeded',
      coverage: 'complete',
      emptyEvidence: 'populated',
      freshness: 'current',
      evidence: 'complete',
      publication: 'completed',
      generationId,
      digest: digestC,
      sourceRevision: 42,
      policyRevision: 7,
    },
  ],
  claims: [
    {
      claimId: 'cost-analysis',
      sectionPaths: ['chartData', 'anomalies'],
      requiredDependencies: ['billing-history'],
      evidence: 'complete',
      publication: 'completed',
      issues: [],
    },
  ],
  issues: [],
};
const portalPluginPublicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [
    { ...publicationDecision.dependencies[0], name: 'portal', generationId: 'portal-run-42', digest: digestA },
    { ...publicationDecision.dependencies[0], name: 'plugin', generationId: 'plugin-run-42', digest: digestB },
  ],
  claims: [
    {
      ...publicationDecision.claims[0],
      claimId: 'coordinated-view-set',
      sectionPaths: ['portal', 'plugin'],
      requiredDependencies: ['portal', 'plugin'],
    },
  ],
  issues: [],
};
const partialBillingPublicationDecision = {
  processing: 'succeeded',
  evidence: 'partial',
  publication: 'partial',
  dependencies: [
    publicationDecision.dependencies[0],
    {
      name: 'exchange-rates',
      required: false,
      support: 'supported',
      applicability: 'applicable',
      attempt: 'failed',
      coverage: 'none',
      emptyEvidence: 'not-observed',
      freshness: 'unknown',
      evidence: 'insufficient',
      publication: 'suppressed',
      reasonCode: 'exchange-rates-unavailable',
    },
  ],
  claims: [
    {
      claimId: 'cost-analysis',
      sectionPaths: ['chartData', 'anomalies'],
      requiredDependencies: ['billing-history'],
      evidence: 'partial',
      publication: 'partial',
      issues: [{ code: 'exchange-rates-unavailable', blocking: false, dependency: 'exchange-rates' }],
    },
  ],
  issues: [{ code: 'exchange-rates-unavailable', blocking: false, dependency: 'exchange-rates' }],
};
const costAnalysisMetadata = {
  schemaVersion: 2,
  subscriptionId,
  billingGenerationId: generationId,
  ownership,
  revision,
  artifactState: 'current',
  artifactEvidence: publicationDecision,
  inputManifestDigest: digestC,
  outputManifestDigest: digestB,
  chartData: {
    schemaVersion: 1,
    source: 'aggregated',
    dataWindow: { startDate: 1754006400, endDate: 1756684800, pointCount: 0 },
    views: {},
    detectors: { threshold: 2, methods: [] },
  },
  anomalies: [],
  currencyCode: 'NZD',
  currencySymbol: '$',
};
const partialCostAnalysisMetadata = {
  ...costAnalysisMetadata,
  artifactState: 'partial',
  artifactEvidence: partialBillingPublicationDecision,
};

const completeEmptyPublicationDecision = {
  ...publicationDecision,
  dependencies: [
    {
      ...publicationDecision.dependencies[0],
      emptyEvidence: 'complete-empty',
      acceptedRowCount: 0,
      emptyProofRef: 'subscriptions/sub-123/history/billing/proofs/billing-input-generation-42-empty.json',
    },
  ],
};
const completeEmptyMetadata = {
  ...costAnalysisMetadata,
  artifactState: 'complete-empty',
  artifactEvidence: completeEmptyPublicationDecision,
};
const populatedDailyView = {
  aggregation: 'daily',
  startDate: 1754006400,
  endDate: 1756684800,
  averageDailyCost: 10,
  totalCost: 310,
  points: [],
};
const validAnomaly = {
  date: 1754006400,
  summary: 'A valid populated anomaly',
  confidence: 'high',
  notes: [],
  impact: {
    cost: 10,
    delta: 5,
    monthToDateCost: 20,
    baseline7Day: null,
    baseline30Day: null,
    percentChange: null,
    previousDayCost: null,
    previousDayDelta: null,
    monthToDateBaseline: null,
    monthToDateDelta: null,
    monthToDatePercentChange: null,
  },
  drivers: [],
};
const percentageBearingMetadata = {
  ...costAnalysisMetadata,
  chartData: {
    ...costAnalysisMetadata.chartData,
    detectors: {
      ...costAnalysisMetadata.chartData.detectors,
      methods: [{ name: 'seasonal-detector', error: 'Variance remained below the 20% threshold', triggeredDates: [] }],
    },
  },
  anomalies: [{ ...validAnomaly, summary: 'Daily cost increased by 20%', notes: ['The 20% change needs review'] }],
};

const withoutOwnershipEpoch = value => {
  const candidate = structuredClone(value);
  delete candidate.ownership.ownershipEpochRevision;
  delete candidate.revision.ownershipEpochRevision;
  return candidate;
};

// Cost-analysis metadata is not an analyzer transport/current-pointer contract. Its chart/anomaly
// compatibility matrix remains runtime-local while the five analyzer boundary validators above
// are executed exclusively from the portable corpus.
const billingValidatorCases = [
  ['metadata accepts its V2 fixture', isBillingCostAnalysisMetadataV2, costAnalysisMetadata, true],
  ['partial metadata accepts billing-bound partial evidence', isBillingCostAnalysisMetadataV2, partialCostAnalysisMetadata, true],
  ['metadata accepts human-readable percentage text', isBillingCostAnalysisMetadataV2, percentageBearingMetadata, true],
  ['metadata rejects an unknown schema version', isBillingCostAnalysisMetadataV2, { ...costAnalysisMetadata, schemaVersion: 3 }, false],
  ['complete-empty metadata accepts exact billing-history proof', isBillingCostAnalysisMetadataV2, completeEmptyMetadata, true],
  [
    'current metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, artifactEvidence: portalPluginPublicationDecision },
    false,
  ],
  [
    'stale metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, artifactState: 'stale', artifactEvidence: portalPluginPublicationDecision },
    false,
  ],
  [
    'fallback metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, artifactState: 'fallback', artifactEvidence: portalPluginPublicationDecision },
    false,
  ],
  [
    'partial metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: { ...portalPluginPublicationDecision, evidence: 'partial', publication: 'partial' },
    },
    false,
  ],
  [
    'complete-empty metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    { ...completeEmptyMetadata, artifactEvidence: portalPluginPublicationDecision },
    false,
  ],
  [
    'current metadata rejects a billing-history generation mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...costAnalysisMetadata,
      artifactEvidence: {
        ...publicationDecision,
        dependencies: [{ ...publicationDecision.dependencies[0], generationId: 'billing-generation-other' }],
      },
    },
    false,
  ],
  [
    'current metadata rejects a billing-history digest mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...costAnalysisMetadata,
      artifactEvidence: {
        ...publicationDecision,
        dependencies: [{ ...publicationDecision.dependencies[0], digest: digestB }],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a billing-history generation mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        dependencies: [
          { ...partialBillingPublicationDecision.dependencies[0], generationId: 'billing-generation-other' },
          partialBillingPublicationDecision.dependencies[1],
        ],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a billing-history digest mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        dependencies: [{ ...partialBillingPublicationDecision.dependencies[0], digest: digestB }, partialBillingPublicationDecision.dependencies[1]],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a wrong first dependency identity',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        dependencies: [
          { ...partialBillingPublicationDecision.dependencies[0], name: 'portal' },
          partialBillingPublicationDecision.dependencies[0],
          partialBillingPublicationDecision.dependencies[1],
        ],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a wrong first claim identity',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        claims: [{ ...partialBillingPublicationDecision.claims[0], claimId: 'coordinated-view-set' }, partialBillingPublicationDecision.claims[0]],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a wrong first required dependency identity',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        claims: [{ ...partialBillingPublicationDecision.claims[0], requiredDependencies: ['portal', 'billing-history'] }],
      },
    },
    false,
  ],
  [
    'complete-empty metadata rejects an unrelated optional empty dependency',
    isBillingCostAnalysisMetadataV2,
    {
      ...costAnalysisMetadata,
      artifactState: 'complete-empty',
      artifactEvidence: {
        ...publicationDecision,
        dependencies: [
          publicationDecision.dependencies[0],
          {
            ...publicationDecision.dependencies[0],
            name: 'unrelated-history',
            required: false,
            generationId: 'unrelated-generation',
            digest: digestB,
            emptyEvidence: 'complete-empty',
            acceptedRowCount: 0,
            emptyProofRef: 'subscriptions/sub-123/history/billing/proofs/unrelated-empty.json',
          },
        ],
      },
    },
    false,
  ],
  [
    'complete-empty metadata rejects a billing-history generation mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...completeEmptyMetadata,
      artifactEvidence: {
        ...completeEmptyPublicationDecision,
        dependencies: [{ ...completeEmptyPublicationDecision.dependencies[0], generationId: 'billing-generation-other' }],
      },
    },
    false,
  ],
  [
    'complete-empty metadata rejects a non-zero chart point count',
    isBillingCostAnalysisMetadataV2,
    {
      ...completeEmptyMetadata,
      chartData: { ...completeEmptyMetadata.chartData, dataWindow: { ...completeEmptyMetadata.chartData.dataWindow, pointCount: 1 } },
    },
    false,
  ],
  [
    'complete-empty metadata rejects a populated chart view',
    isBillingCostAnalysisMetadataV2,
    { ...completeEmptyMetadata, chartData: { ...completeEmptyMetadata.chartData, views: { daily: populatedDailyView } } },
    false,
  ],
  [
    'complete-empty metadata rejects populated anomalies',
    isBillingCostAnalysisMetadataV2,
    { ...completeEmptyMetadata, anomalies: [validAnomaly] },
    false,
  ],
];

for (const [name, validator, value, expected] of billingValidatorCases) assert.equal(validator(value), expected, name);

const harmlessAdditiveControlData = {
  future: {
    itemCount: 2,
    reviewStatus: 'accepted',
    tokenCount: 3,
    authorizationStatus: 'granted',
    secretary: 'named-role',
    message: 'Cost review: accepted',
    timestamp: '2026-08-13T00:05:00.000Z',
    resourceId: '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
  },
};
const billingControlDataCases = [
  ['metadata accepts harmless additive fields', isBillingCostAnalysisMetadataV2, { ...costAnalysisMetadata, ...harmlessAdditiveControlData }, true],
  [
    'metadata rejects a nested exact credential key',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, future: { settings: { authorization: 'Bearer secret-example' } } },
    false,
  ],
  [
    'metadata rejects an additive physical reference field',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, future: { sourcePath: 'private/container/metadata.json' } },
    false,
  ],
  [
    'metadata rejects an additive physical reference value',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, future: { location: 'C:\\private\\metadata.json' } },
    false,
  ],
];
for (const [name, validator, value, expected] of billingControlDataCases) assert.equal(validator(value), expected, name);

const billingControlDocuments = [['cost metadata', isBillingCostAnalysisMetadataV2, costAnalysisMetadata]];
const forbiddenBillingControlData = [
  ['filePath field', { filePath: 'safe/relative.json' }],
  ['filesystemPath field', { filesystemPath: 'safe/relative.json' }],
  ['path field', { path: 'safe/relative.json' }],
  ['url field', { url: 'safe/relative.json' }],
  ['uri field', { uri: 'safe/relative.json' }],
  ['artifactPath field', { artifactPath: 'safe/relative.json' }],
  ['URI value', { location: 'https://storage.example.invalid/container/blob.json' }],
  ['single-slash file URI value', { location: 'file:/tmp/blob.json' }],
  ['opaque S3 URI value', { location: 's3:bucket/key' }],
  ['protocol-relative value', { location: '//storage.example/container/blob.json' }],
  ['UNC value', { location: '\\\\storage.example\\container\\blob.json' }],
  ['Windows-drive value', { location: 'C:\\private\\blob.json' }],
  ['POSIX absolute value', { location: '/tmp/blob.json' }],
  ['parent-traversal value', { location: 'safe/../blob.json' }],
  ['current-directory traversal value', { location: './blob.json' }],
  ['percent-encoded value', { location: 'safe/%2e%2e/blob.json' }],
  ['percent-encoded slash value', { location: 'safe%2Fprivate.json' }],
  ['percent-encoded backslash value', { location: 'safe%5cprivate.json' }],
  ['NUL value', { location: 'safe/blob\u0000.json' }],
  ['newline value', { location: 'safe/blob\n.json' }],
];
for (const [documentName, validator, document] of billingControlDocuments) {
  assert.equal(validator({ ...document, ...harmlessAdditiveControlData }), true, `${documentName} accepts exact harmless sensitive-name prefixes`);
  for (const [caseName, controlData] of forbiddenBillingControlData) {
    assert.equal(validator({ ...document, future: controlData }), false, `${documentName} rejects ${caseName}`);
  }
}

const invalidRevisionBoundaries = [
  ['zero source revision', { sourceRevision: 0 }],
  ['negative source revision', { sourceRevision: -1 }],
  ['zero policy revision', { policyRevision: 0 }],
  ['negative policy revision', { policyRevision: -1 }],
];
for (const [documentName, validator, document] of billingControlDocuments) {
  for (const [caseName, revisionMutation] of invalidRevisionBoundaries) {
    assert.equal(validator({ ...document, revision: { ...document.revision, ...revisionMutation } }), false, `${documentName} rejects ${caseName}`);
  }
}

const ownershipValidatorCases = [
  ['ownership accepts observe-only absent epoch', isArtifactOwnershipBinding, withoutOwnershipEpoch({ ownership, revision }).ownership, true],
  ['ownership rejects zero epoch', isArtifactOwnershipBinding, { ...ownership, ownershipEpochRevision: 0 }, false],
  ['enforceable ownership accepts positive epoch', isEnforceableArtifactOwnershipBinding, ownership, true],
  [
    'enforceable ownership rejects absent epoch',
    isEnforceableArtifactOwnershipBinding,
    withoutOwnershipEpoch({ ownership, revision }).ownership,
    false,
  ],
];
for (const [name, validator, value, expected] of ownershipValidatorCases) assert.equal(validator(value), expected, name);

process.stdout.write(
  `Artifact evidence contract checks passed: corpus v${contractCorpus.corpusVersion}, ${contractCorpus.cases.length} corpus cases, ` +
    `${mutationCount} mutations, ` +
    `${contractCorpus.revisionComparisons.length} revision comparisons, ${billingValidatorCases.length} billing checks, ` +
    `${billingControlDataCases.length} control-data checks, ${ownershipValidatorCases.length} ownership checks, ` +
    `${mutationFailureCases.length} mutation fail-fast checks.\nPortable validator set: ${[...corpusValidatorNames].sort().join(', ')}\n` +
    `Artifact evidence corpus SHA-256: ${corpusDigest}\n`
);
