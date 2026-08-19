import {
  compareEpochFreeArtifactRevisionVector,
  encodeArtifactRunReferenceV1,
  isArtifactRunReferenceV1,
  isBillingAnalysisCurrentPointerV2,
  isBillingAnalyzerInputCurrentPointerV2,
  isBillingAnalyzerRequestV3,
  type BillingAnalysisCurrentPointerV2,
  type BillingAnalyzerInputCurrentPointerV2,
  type BillingAnalyzerRequestV3,
} from '../index.js';

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
} as const;
const revision = { sourceRevision: 42, policyRevision: 7 } as const;
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
} satisfies BillingAnalyzerInputCurrentPointerV2;

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
} satisfies BillingAnalyzerRequestV3;

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
} satisfies BillingAnalysisCurrentPointerV2['publicationDecision'];

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
} satisfies BillingAnalysisCurrentPointerV2;

const runReferences = ['a/b', 'a?b', 'a_b', '运行/42'].map(encodeArtifactRunReferenceV1);
const runtimeResults = [
  isBillingAnalyzerInputCurrentPointerV2(inputPointer),
  isBillingAnalyzerRequestV3(request),
  isBillingAnalysisCurrentPointerV2(outputPointer),
  !isBillingAnalyzerInputCurrentPointerV2({ ...inputPointer, ownership: { ...ownership, ownershipEpochRevision: 1 } }),
  !isBillingAnalyzerRequestV3({ ...request, publicationMode: 'enforce' }),
  !isBillingAnalysisCurrentPointerV2({ ...outputPointer, revision: { ...revision, ownershipEpochRevision: 1 } }),
  new Set(runReferences).size === runReferences.length,
  runReferences.every(isArtifactRunReferenceV1),
  runReferences.every(reference => !reference.includes('/') && !reference.includes('?')),
  compareEpochFreeArtifactRevisionVector(revision, { ...revision, sourceRevision: 41 }) === 'newer',
  compareEpochFreeArtifactRevisionVector(revision, { ...revision }) === 'equal',
  compareEpochFreeArtifactRevisionVector(revision, { ...revision, sourceRevision: 43 }) === 'older',
  compareEpochFreeArtifactRevisionVector(revision, { ...revision, policyRevision: 8 }) === 'incomparable',
];

if (!runtimeResults.every(Boolean)) throw new Error('DEV-1135 latest contract assertion failed.');

void [inputPointer, request, outputPointer, runReferences];
