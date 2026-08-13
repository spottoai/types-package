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

const isRecord = value => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = value => typeof value === 'string' && value.length > 0;

const resolveMutationParent = (document, path) => {
  const segments = path.split('.');
  assert.ok(segments.length > 0 && segments.every(segment => segment.length > 0), `invalid mutation path: ${path}`);

  let target = document;
  for (const [index, segment] of segments.slice(0, -1).entries()) {
    assert.ok(isRecord(target) || Array.isArray(target), `mutation path is not traversable: ${path}`);
    if (target[segment] === undefined) {
      target[segment] = /^\d+$/.test(segments[index + 1]) ? [] : {};
    }
    target = target[segment];
  }
  assert.ok(isRecord(target) || Array.isArray(target), `mutation parent is not traversable: ${path}`);
  return { parent: target, key: segments.at(-1) };
};

const applyMutation = (document, mutation) => {
  assert.ok(isRecord(mutation) && isNonEmptyString(mutation.path), 'every corpus mutation requires a path');
  const hasValue = Object.prototype.hasOwnProperty.call(mutation, 'value');
  const deletesValue = mutation.delete === true;
  assert.notEqual(hasValue, deletesValue, `mutation must set or delete exactly one value: ${mutation.path}`);

  const { parent, key } = resolveMutationParent(document, mutation.path);
  if (deletesValue) {
    if (Array.isArray(parent) && /^\d+$/.test(key)) parent.splice(Number(key), 1);
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

const isLegacyBillingCostAnalysisMetadata = value => {
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
  isBillingAnalyzerInputCurrentPointerV1,
};

let mutationCount = 0;
for (const corpusCase of contractCorpus.cases) {
  assert.ok(Array.isArray(corpusCase.mutations), `corpus case has no mutation list: ${corpusCase.name}`);
  mutationCount += corpusCase.mutations.length;
  const { base, document } = materializeCorpusCase(corpusCase);

  if (corpusCase.validator === 'billingCostAnalysisMetadataCompatibility') {
    assert.equal(isBillingCostAnalysisMetadataV2(document), false, `${corpusCase.name}: legacy V1 must not be treated as V2`);
    assert.equal(isLegacyBillingCostAnalysisMetadata(document), corpusCase.valid, corpusCase.name);
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
const completedAt = '2026-08-13T00:05:00.000Z';
const subscriptionId = 'sub-123';
const generationId = 'billing-input-generation-42';
const inputManifestPath = 'subscriptions/sub-123/history/billing/analyzer-inputs/generations/billing-input-generation-42/manifest.json';
const outputManifestPath = 'subscriptions/sub-123/billing/generations/billing-input-generation-42/manifest.json';

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
      digest: digestA,
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
const inputManifest = {
  schemaVersion: 2,
  status: 'completed',
  subscriptionId,
  generationId,
  publicationKey: 'billing-input:sub-123:source-run-42',
  ownership,
  revision,
  coveragePlanDigest: digestA,
  asOfUtc: '2026-08-13T00:00:00.000Z',
  stableCutoffUtc: '2026-08-12T00:00:00.000Z',
  requestedPeriods: [
    {
      fromInclusive: '2026-07-01T00:00:00.000Z',
      throughExclusive: '2026-08-01T00:00:00.000Z',
      dateBasis: 'utc',
      basis: 'amortized',
    },
  ],
  inputs: [
    {
      path: 'subscriptions/sub-123/history/billing/analyzer-inputs/generations/billing-input-generation-42/months/month_2026-07.json.gz',
      versionId: 'version-1',
      etag: 'etag-1',
      sha256: digestB,
      byteCount: 512,
      rowCount: 31,
      basis: 'amortized',
      currencyCode: 'NZD',
      coverage: 'complete',
    },
  ],
  manifestDigest: digestC,
  completedAt,
};
const inputPointer = {
  schemaVersion: 1,
  status: 'completed',
  subscriptionId,
  generationId,
  ownership,
  revision,
  manifestPath: inputManifestPath,
  manifestDigest: inputManifest.manifestDigest,
  completedAt,
};
const analyzerRequest = {
  schemaVersion: 2,
  eventId: 'billing-analyzer-event-42',
  messageId: digestA,
  correlationId: 'correlation-42',
  occurredAt: completedAt,
  idempotencyKey: digestA,
  publicationMode: 'enforce',
  subscriptionId,
  generationId,
  ownership,
  revision,
  inputManifestPath,
  inputManifestDigest: inputManifest.manifestDigest,
  displayMetadata: { currencyCode: 'NZD', currencySymbol: '$' },
};
const outputManifest = {
  schemaVersion: 2,
  status: 'completed',
  subscriptionId,
  generationId,
  ownership,
  revision,
  inputManifestPath,
  inputManifestDigest: inputManifest.manifestDigest,
  artifacts: [
    {
      path: 'subscriptions/sub-123/billing/generations/billing-input-generation-42/metadata.json',
      name: 'metadata.json',
      mediaType: 'application/json',
      contentEncoding: 'identity',
      byteLength: 1024,
      sha256: digestA,
    },
  ],
  publicationDecision,
  manifestDigest: digestB,
  completedAt,
};
const analysisPointer = {
  schemaVersion: 1,
  status: 'completed',
  subscriptionId,
  generationId,
  ownership,
  revision,
  inputManifestPath,
  inputManifestDigest: inputManifest.manifestDigest,
  outputManifestPath,
  outputManifestDigest: outputManifest.manifestDigest,
  publicationDecision,
  completedAt,
};
const costAnalysisMetadata = {
  schemaVersion: 2,
  subscriptionId,
  billingGenerationId: generationId,
  ownership,
  revision,
  artifactState: 'current',
  artifactEvidence: publicationDecision,
  inputManifestDigest: inputManifest.manifestDigest,
  outputManifestDigest: outputManifest.manifestDigest,
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

const withoutOwnershipEpoch = value => {
  const candidate = structuredClone(value);
  delete candidate.ownership.ownershipEpochRevision;
  delete candidate.revision.ownershipEpochRevision;
  return candidate;
};

const observeRequest = withoutOwnershipEpoch({ ...analyzerRequest, publicationMode: 'observe' });
const billingValidatorCases = [
  ['input manifest accepts its V2 fixture', isBillingAnalyzerInputManifestV2, inputManifest, true],
  ['input manifest accepts observe-only absent epoch', isBillingAnalyzerInputManifestV2, withoutOwnershipEpoch(inputManifest), true],
  ['input manifest rejects malformed digest', isBillingAnalyzerInputManifestV2, { ...inputManifest, manifestDigest: 'bad' }, false],
  ['input pointer accepts its V1 fixture', isBillingAnalyzerInputCurrentPointerV1, inputPointer, true],
  ['input pointer rejects absent promoted epoch', isBillingAnalyzerInputCurrentPointerV1, withoutOwnershipEpoch(inputPointer), false],
  ['request accepts enforce mode', isBillingAnalyzerRequestV2, analyzerRequest, true],
  ['request accepts observe-only absent epoch', isBillingAnalyzerRequestV2, observeRequest, true],
  ['request rejects enforce mode absent epoch', isBillingAnalyzerRequestV2, withoutOwnershipEpoch(analyzerRequest), false],
  ['request rejects idempotency mismatch', isBillingAnalyzerRequestV2, { ...analyzerRequest, idempotencyKey: digestB }, false],
  ['output manifest accepts its V2 fixture', isBillingAnalyzerOutputManifestV2, outputManifest, true],
  ['output manifest accepts observe-only absent epoch', isBillingAnalyzerOutputManifestV2, withoutOwnershipEpoch(outputManifest), true],
  ['output manifest rejects missing metadata artifact', isBillingAnalyzerOutputManifestV2, { ...outputManifest, artifacts: [] }, false],
  ['analysis pointer accepts its V1 fixture', isBillingAnalysisCurrentPointerV1, analysisPointer, true],
  ['analysis pointer rejects absent promoted epoch', isBillingAnalysisCurrentPointerV1, withoutOwnershipEpoch(analysisPointer), false],
  [
    'analysis pointer rejects quarantined publication',
    isBillingAnalysisCurrentPointerV1,
    {
      ...analysisPointer,
      publicationDecision: { ...publicationDecision, processing: 'failed', evidence: 'insufficient', publication: 'quarantined' },
    },
    false,
  ],
  ['metadata accepts its V2 fixture', isBillingCostAnalysisMetadataV2, costAnalysisMetadata, true],
  ['metadata rejects an unknown schema version', isBillingCostAnalysisMetadataV2, { ...costAnalysisMetadata, schemaVersion: 3 }, false],
];

for (const [name, validator, value, expected] of billingValidatorCases) assert.equal(validator(value), expected, name);

const ownershipValidatorCases = [
  ['ownership accepts observe-only absent epoch', isArtifactOwnershipBinding, withoutOwnershipEpoch(inputManifest).ownership, true],
  ['ownership rejects zero epoch', isArtifactOwnershipBinding, { ...ownership, ownershipEpochRevision: 0 }, false],
  ['enforceable ownership accepts positive epoch', isEnforceableArtifactOwnershipBinding, ownership, true],
  ['enforceable ownership rejects absent epoch', isEnforceableArtifactOwnershipBinding, withoutOwnershipEpoch(inputManifest).ownership, false],
];
for (const [name, validator, value, expected] of ownershipValidatorCases) assert.equal(validator(value), expected, name);

process.stdout.write(
  `Artifact evidence contract checks passed: ${contractCorpus.cases.length} corpus cases, ${mutationCount} mutations, ` +
    `${contractCorpus.revisionComparisons.length} revision comparisons, ${billingValidatorCases.length} billing checks, ` +
    `${ownershipValidatorCases.length} ownership checks.\nArtifact evidence corpus SHA-256: ${corpusDigest}\n`
);
