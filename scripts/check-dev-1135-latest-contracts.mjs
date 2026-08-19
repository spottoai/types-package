import assert from 'node:assert/strict';

import {
  ARTIFACT_RUN_REFERENCE_V1_LIMITS,
  compareEpochFreeArtifactRevisionVector,
  encodeArtifactRunReferenceV1,
  isArtifactRunReferenceV1,
  isBillingAnalysisCurrentPointerV2,
  isBillingAnalyzerInputCurrentPointerV2,
  isBillingAnalyzerRequestV3,
  isRawArtifactRunIdV1,
} from '../dist/index.js';

const digestA = 'a'.repeat(64);
const digestB = 'b'.repeat(64);
const subscriptionId = 'sub-123';
const generationId = 'billing-input-generation-42';
const completedAt = '2026-08-19T00:05:00.000Z';
const ownership = {
  provider: 'azure',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId: subscriptionId,
};
const revision = { sourceRevision: 42, policyRevision: 7 };

assert.equal(compareEpochFreeArtifactRevisionVector(revision, { ...revision, sourceRevision: 41 }), 'newer');
assert.equal(compareEpochFreeArtifactRevisionVector(revision, { ...revision }), 'equal');
assert.equal(compareEpochFreeArtifactRevisionVector(revision, { ...revision, sourceRevision: 43 }), 'older');
assert.equal(compareEpochFreeArtifactRevisionVector(revision, { ...revision, policyRevision: 8 }), 'incomparable');
const inputManifestPath = `subscriptions/${subscriptionId}/history/billing/analyzer-inputs/generations/${generationId}/manifest.json`;
const outputManifestPath = `subscriptions/${subscriptionId}/billing/generations/${generationId}/manifest.json`;

const inputPointer = {
  schemaVersion: 2,
  status: 'completed',
  subscriptionId,
  generationId,
  ownership,
  revision,
  manifestPath: inputManifestPath,
  manifestDigest: digestA,
  completedAt,
};

const request = {
  schemaVersion: 3,
  eventId: 'billing-analyzer-event-42',
  messageId: digestA,
  correlationId: 'correlation-42',
  occurredAt: completedAt,
  idempotencyKey: digestA,
  subscriptionId,
  generationId,
  ownership,
  revision,
  inputManifestPath,
  inputManifestDigest: digestA,
  displayMetadata: { currencyCode: 'NZD', currencySymbol: '$' },
};

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

const outputPointer = {
  schemaVersion: 2,
  status: 'completed',
  subscriptionId,
  generationId,
  ownership,
  revision,
  inputManifestPath,
  inputManifestDigest: digestA,
  outputManifestPath,
  outputManifestDigest: digestB,
  publicationDecision,
  completedAt,
};

assert.equal(isBillingAnalyzerInputCurrentPointerV2(inputPointer), true, 'latest input pointer accepts epoch-free identity');
assert.equal(isBillingAnalyzerRequestV3(request), true, 'latest analyzer request accepts epoch-free identity');
assert.equal(isBillingAnalysisCurrentPointerV2(outputPointer), true, 'latest output pointer accepts epoch-free identity');
assert.equal(
  isBillingAnalyzerInputCurrentPointerV2({ ...inputPointer, ownership: { ...ownership, ownershipEpochRevision: 1 } }),
  false,
  'latest input pointer rejects legacy ownership epochs'
);
assert.equal(isBillingAnalyzerRequestV3({ ...request, publicationMode: 'enforce' }), false, 'latest analyzer request rejects observe/enforce modes');
assert.equal(
  isBillingAnalysisCurrentPointerV2({ ...outputPointer, revision: { ...revision, ownershipEpochRevision: 1 } }),
  false,
  'latest output pointer rejects legacy revision epochs'
);

const knownRunReferences = new Map([
  ['a/b', 'r1-YS9i'],
  ['a?b', 'r1-YT9i'],
  ['a_b', 'r1-YV9i'],
  ['运行/42', 'r1-6L-Q6KGMLzQy'],
]);
for (const [rawRunId, expectedReference] of knownRunReferences) {
  assert.equal(encodeArtifactRunReferenceV1(rawRunId), expectedReference, `run reference is deterministic for ${rawRunId}`);
  assert.equal(isArtifactRunReferenceV1(expectedReference), true, `run reference is path-safe for ${rawRunId}`);
}
assert.equal(new Set(knownRunReferences.values()).size, knownRunReferences.size, 'distinct semantic run IDs do not collide');
assert.equal(isRawArtifactRunIdV1('x'.repeat(ARTIFACT_RUN_REFERENCE_V1_LIMITS.maxRawUtf8Bytes)), true, 'raw ID accepts exact byte limit');
assert.equal(isRawArtifactRunIdV1('x'.repeat(ARTIFACT_RUN_REFERENCE_V1_LIMITS.maxRawUtf8Bytes + 1)), false, 'raw ID rejects byte overflow');
for (const invalidRunId of ['', ' run-1', 'run-1 ', 'run\n1', '\ud800']) {
  assert.equal(isRawArtifactRunIdV1(invalidRunId), false, `raw ID rejects invalid input ${JSON.stringify(invalidRunId)}`);
  assert.throws(() => encodeArtifactRunReferenceV1(invalidRunId), TypeError);
}

console.log('DEV-1135 latest billing and run-reference contract checks passed.');
