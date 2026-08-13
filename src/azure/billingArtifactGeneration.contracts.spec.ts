import {
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisMetadataV2,
  type ArtifactRevisionVector,
  type ArtifactPublicationDecision,
  type BillingAnalysisCurrentPointerV1,
  type BillingArtifactPublicationDecision,
  type BillingAnalyzerInputCurrentPointerV1,
  type BillingAnalyzerInputManifestV2,
  type BillingAnalyzerOutputManifestV2,
  type BillingAnalyzerRequestV2,
  type BillingCostAnalysisMetadataV2,
  type BillingPartialArtifactPublicationDecision,
} from '../index';

// @ts-expect-error Billing artifact basis is an implementation detail of the six Task 3 documents.
import type { BillingArtifactBasis } from '../index';
// @ts-expect-error Requested-period helpers are not part of the exact Task 3 root surface.
import type { BillingAnalyzerRequestedPeriod } from '../index';
// @ts-expect-error Input-object helpers are not part of the exact Task 3 root surface.
import type { BillingAnalyzerInputObjectDescriptor } from '../index';
// @ts-expect-error Output-artifact helpers are not part of the exact Task 3 root surface.
import type { BillingAnalyzerOutputArtifactDescriptor } from '../index';
// @ts-expect-error Metadata state helpers are not part of the exact Task 3 root surface.
import type { BillingCostAnalysisDocumentState } from '../index';

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
} as const;

const revision = {
  ownershipEpochRevision: 3,
  sourceRevision: 42,
  policyRevision: 7,
} satisfies ArtifactRevisionVector;

const billingHistoryDependency = {
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
} satisfies BillingAnalyzerOutputManifestV2['publicationDecision']['dependencies'][number];

const costAnalysisClaim = {
  claimId: 'cost-analysis',
  sectionPaths: ['chartData', 'anomalies'],
  requiredDependencies: ['billing-history'],
  evidence: 'complete',
  publication: 'completed',
  issues: [],
} satisfies BillingAnalyzerOutputManifestV2['publicationDecision']['claims'][number];

const publicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [billingHistoryDependency],
  claims: [costAnalysisClaim],
  issues: [],
} satisfies BillingAnalyzerOutputManifestV2['publicationDecision'];

const portalPluginPublicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [
    { ...billingHistoryDependency, name: 'portal', generationId: 'portal-run-42', digest: digestA },
    { ...billingHistoryDependency, name: 'plugin', generationId: 'plugin-run-42', digest: digestB },
  ],
  claims: [
    {
      ...costAnalysisClaim,
      claimId: 'coordinated-view-set',
      sectionPaths: ['portal', 'plugin'],
      requiredDependencies: ['portal', 'plugin'],
    },
  ],
  issues: [],
} satisfies ArtifactPublicationDecision;

const partialBillingPublicationDecision = {
  processing: 'succeeded',
  evidence: 'partial',
  publication: 'partial',
  dependencies: [
    billingHistoryDependency,
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
} satisfies BillingPartialArtifactPublicationDecision;

const billingEvidence: BillingArtifactPublicationDecision = publicationDecision;
const partialBillingEvidence: BillingPartialArtifactPublicationDecision = partialBillingPublicationDecision;

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
} satisfies BillingAnalyzerInputManifestV2;

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
} satisfies BillingAnalyzerInputCurrentPointerV1;

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
  displayMetadata: {
    currencyCode: 'NZD',
    currencySymbol: '$',
  },
} satisfies BillingAnalyzerRequestV2;

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
} satisfies BillingAnalyzerOutputManifestV2;

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
} satisfies BillingAnalysisCurrentPointerV1;

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
    dataWindow: {
      startDate: 1754006400,
      endDate: 1756684800,
      pointCount: 0,
    },
    views: {},
    detectors: {
      threshold: 2,
      methods: [],
    },
  },
  anomalies: [],
  currencyCode: 'NZD',
  currencySymbol: '$',
} satisfies BillingCostAnalysisMetadataV2;

const partialCostAnalysisMetadata = {
  ...costAnalysisMetadata,
  artifactState: 'partial',
  artifactEvidence: partialBillingPublicationDecision,
} satisfies BillingCostAnalysisMetadataV2;

const additiveInputPointer = {
  ...inputPointer,
  futureTopLevelField: { producer: 'next-version' },
  ownership: { ...inputPointer.ownership, futureOwnershipField: true },
};

const harmlessAdditiveRequest = {
  ...analyzerRequest,
  futureTopLevelField: { producer: 'next-version' },
  displayMetadata: {
    futureDisplayField: { enabled: true },
    resourceId: '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
  },
};

const credentialBearingRequests = [
  { ...analyzerRequest, displayMetadata: { accessKey: 'AKIA-example', artifactPath: '/tmp/billing.json' } },
  { ...analyzerRequest, displayMetadata: { apiKey: 'api-key-example' } },
  { ...analyzerRequest, displayMetadata: { authorization: 'Bearer example' } },
  { ...analyzerRequest, displayMetadata: { path: '/tmp/billing.json' } },
  { ...analyzerRequest, displayMetadata: { url: 'https://storage.example.invalid/billing.json' } },
  { ...analyzerRequest, displayMetadata: { uri: 'file:///tmp/billing.json' } },
  { ...analyzerRequest, displayMetadata: { location: '//storage.example/container/blob.json' } },
  { ...analyzerRequest, displayMetadata: { location: '\\\\storage.example\\container\\blob.json' } },
];

const controlCharacterInputPointer = {
  ...inputPointer,
  generationId: `${generationId}\nunsafe`,
  manifestPath: inputPointer.manifestPath.replace(generationId, `${generationId}\nunsafe`),
};

const controlCharacterRequest = {
  ...analyzerRequest,
  subscriptionId: `${subscriptionId}\u0000unsafe`,
  ownership: { ...analyzerRequest.ownership, accountId: `${subscriptionId}\u0000unsafe` },
  inputManifestPath: analyzerRequest.inputManifestPath.replace(subscriptionId, `${subscriptionId}\u0000unsafe`),
};

const controlCharacterAnalysisPointer = {
  ...analysisPointer,
  generationId: `${generationId}\u001funsafe`,
  inputManifestPath: analysisPointer.inputManifestPath.replace(generationId, `${generationId}\u001funsafe`),
  outputManifestPath: analysisPointer.outputManifestPath.replace(generationId, `${generationId}\u001funsafe`),
};

const harmlessAdditiveMetadata = {
  ...costAnalysisMetadata,
  futureTopLevelField: { producer: 'next-version' },
  resourceId: '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
};

const credentialBearingMetadata = [
  { ...costAnalysisMetadata, accessKey: 'AKIA-example', artifactPath: '/tmp/billing.json' },
  { ...costAnalysisMetadata, apiKey: 'api-key-example' },
  { ...costAnalysisMetadata, authorization: 'Bearer example' },
  { ...costAnalysisMetadata, path: '/tmp/billing.json' },
  { ...costAnalysisMetadata, url: 'https://storage.example.invalid/billing.json' },
  { ...costAnalysisMetadata, uri: 'file:///tmp/billing.json' },
  { ...costAnalysisMetadata, location: '//storage.example/container/blob.json' },
  { ...costAnalysisMetadata, location: '\\\\storage.example\\container\\blob.json' },
];

const validationResults: boolean[] = [
  isBillingAnalyzerInputManifestV2(inputManifest),
  isBillingAnalyzerInputCurrentPointerV1(inputPointer),
  isBillingAnalyzerInputCurrentPointerV1(additiveInputPointer),
  isBillingAnalyzerRequestV2(analyzerRequest),
  isBillingAnalyzerOutputManifestV2(outputManifest),
  isBillingAnalysisCurrentPointerV1(analysisPointer),
  isBillingCostAnalysisMetadataV2(costAnalysisMetadata),
  isBillingCostAnalysisMetadataV2(partialCostAnalysisMetadata),
];

const runtimeSafetyResults: boolean[] = [
  isBillingAnalyzerRequestV2(harmlessAdditiveRequest),
  ...credentialBearingRequests.map(request => !isBillingAnalyzerRequestV2(request)),
  !isBillingAnalyzerInputCurrentPointerV1(controlCharacterInputPointer),
  !isBillingAnalyzerRequestV2(controlCharacterRequest),
  !isBillingAnalysisCurrentPointerV1(controlCharacterAnalysisPointer),
  isBillingCostAnalysisMetadataV2(harmlessAdditiveMetadata),
  ...credentialBearingMetadata.map(metadata => !isBillingCostAnalysisMetadataV2(metadata)),
];

if (!runtimeSafetyResults.every(result => result)) {
  throw new Error('Task 3 billing artifact runtime safety assertion failed.');
}

// @ts-expect-error V2 input manifests reject unknown schema versions.
const unknownInputManifestVersion: BillingAnalyzerInputManifestV2 = { ...inputManifest, schemaVersion: 3 };

// @ts-expect-error Input current pointers use schema version 1.
const unknownInputPointerVersion: BillingAnalyzerInputCurrentPointerV1 = { ...inputPointer, schemaVersion: 2 };

// @ts-expect-error V2 analyzer requests use schema version 2.
const unknownRequestVersion: BillingAnalyzerRequestV2 = { ...analyzerRequest, schemaVersion: 1 };

// @ts-expect-error V2 output manifests reject unknown schema versions.
const unknownOutputManifestVersion: BillingAnalyzerOutputManifestV2 = { ...outputManifest, schemaVersion: 3 };

const incompleteAnalysisPointer: BillingAnalysisCurrentPointerV1 = {
  ...analysisPointer,
  // @ts-expect-error Promoted output pointers require a completed publication decision.
  publicationDecision: { ...publicationDecision, processing: 'failed', evidence: 'insufficient', publication: 'quarantined' },
};

const policyFreeOutputManifest: BillingAnalyzerOutputManifestV2 = {
  ...outputManifest,
  // @ts-expect-error Billing output manifests require a billing-history dependency and cost-analysis claim.
  publicationDecision: { ...publicationDecision, dependencies: [], claims: [] },
};

const unrelatedFirstBillingDependency: BillingAnalyzerOutputManifestV2['publicationDecision'] = {
  ...publicationDecision,
  // @ts-expect-error The first billing authority dependency must be billing-history.
  dependencies: [{ ...publicationDecision.dependencies[0], name: 'unrelated-history', required: false }, publicationDecision.dependencies[0]],
};

const billingDependencyWithoutIdentity: BillingAnalyzerOutputManifestV2['publicationDecision'] = {
  ...publicationDecision,
  // @ts-expect-error The canonical billing-history dependency requires generation and digest identity.
  dependencies: [{ ...publicationDecision.dependencies[0], generationId: undefined, digest: undefined }],
};

const unrelatedFirstBillingClaim: BillingAnalyzerOutputManifestV2['publicationDecision'] = {
  ...publicationDecision,
  // @ts-expect-error The first billing authority claim must be cost-analysis.
  claims: [{ ...publicationDecision.claims[0], claimId: 'unrelated-analysis' }, publicationDecision.claims[0]],
};

const wrongFirstRequiredBillingDependency: BillingAnalyzerOutputManifestV2['publicationDecision'] = {
  ...publicationDecision,
  // @ts-expect-error The cost-analysis claim must require billing-history first.
  claims: [{ ...publicationDecision.claims[0], requiredDependencies: ['unrelated-history', 'billing-history'] }],
};

const currentMetadataWithPortalEvidence: BillingCostAnalysisMetadataV2 = {
  ...costAnalysisMetadata,
  // @ts-expect-error Successful billing metadata must reject portal/plugin publication evidence.
  artifactEvidence: portalPluginPublicationDecision,
};

const staleMetadataWithPortalEvidence: BillingCostAnalysisMetadataV2 = {
  ...costAnalysisMetadata,
  artifactState: 'stale',
  // @ts-expect-error Stale billing metadata still requires billing-bound completed evidence.
  artifactEvidence: portalPluginPublicationDecision,
};

const fallbackMetadataWithPortalEvidence: BillingCostAnalysisMetadataV2 = {
  ...costAnalysisMetadata,
  artifactState: 'fallback',
  // @ts-expect-error Fallback billing metadata still requires billing-bound completed evidence.
  artifactEvidence: portalPluginPublicationDecision,
};

const completeEmptyMetadataWithPortalEvidence: BillingCostAnalysisMetadataV2 = {
  ...costAnalysisMetadata,
  artifactState: 'complete-empty',
  // @ts-expect-error Complete-empty metadata requires billing-bound completed evidence.
  artifactEvidence: portalPluginPublicationDecision,
};

const partialMetadataWithPortalEvidence: BillingCostAnalysisMetadataV2 = {
  ...costAnalysisMetadata,
  artifactState: 'partial',
  // @ts-expect-error Partial metadata requires billing-history and cost-analysis tuple identities.
  artifactEvidence: { ...portalPluginPublicationDecision, evidence: 'partial', publication: 'partial' },
};

const partialEvidenceWithWrongFirstDependency: BillingPartialArtifactPublicationDecision = {
  ...partialBillingPublicationDecision,
  // @ts-expect-error The authoritative tuple entry must be billing-history.
  dependencies: [{ ...billingHistoryDependency, name: 'portal' }, billingHistoryDependency],
};

const partialEvidenceWithWrongFirstClaim: BillingPartialArtifactPublicationDecision = {
  ...partialBillingPublicationDecision,
  // @ts-expect-error The authoritative tuple entry must be cost-analysis.
  claims: [{ ...partialBillingPublicationDecision.claims[0], claimId: 'coordinated-view-set' }, partialBillingPublicationDecision.claims[0]],
};

// @ts-expect-error Suppressed is an error/decision-path state, not successful metadata.
const suppressedMetadata: BillingCostAnalysisMetadataV2 = { ...costAnalysisMetadata, artifactState: 'suppressed' };

void [
  validationResults,
  runtimeSafetyResults,
  unknownInputManifestVersion,
  unknownInputPointerVersion,
  unknownRequestVersion,
  unknownOutputManifestVersion,
  incompleteAnalysisPointer,
  policyFreeOutputManifest,
  unrelatedFirstBillingDependency,
  billingDependencyWithoutIdentity,
  unrelatedFirstBillingClaim,
  wrongFirstRequiredBillingDependency,
  billingEvidence,
  partialBillingEvidence,
  currentMetadataWithPortalEvidence,
  staleMetadataWithPortalEvidence,
  fallbackMetadataWithPortalEvidence,
  completeEmptyMetadataWithPortalEvidence,
  partialMetadataWithPortalEvidence,
  partialEvidenceWithWrongFirstDependency,
  partialEvidenceWithWrongFirstClaim,
  suppressedMetadata,
];
