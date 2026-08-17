import {
  BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH,
  BILLING_ARTIFACT_OBJECT_LIMITS_V1,
  buildBillingAnalyzerInputObservationPointerPath,
  canonicalizeBillingAnalyzerInputManifestV2ForDigest,
  canonicalizeBillingAnalysisPromotionObservationV1ForDigest,
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest,
  canonicalizeBillingOutputBindingV1,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalysisPromotionObservationV1,
  isBillingAnalyzerInputObservationPointerV1,
  isBillingAnalyzerInputObservationPointerPath,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisBusinessPayloadV1,
  isBillingCostAnalysisLegacyFallbackResponse,
  isBillingCostAnalysisMetadataV2,
  isBillingCostAnalysisReadResponse,
  isBillingCostAnalysisVerifiedReadResponse,
  projectBillingOutputBindingV1FromManifest,
  projectBillingOutputBindingV1FromMetadata,
  type ArtifactRevisionVector,
  type ArtifactPublicationDecision,
  type BillingAnalysisCurrentPointerV1,
  type BillingAnalysisPromotionObservationV1,
  type BillingArtifactPublicationDecision,
  type BillingAnalyzerInputCurrentPointerV1,
  type BillingAnalyzerInputManifestV2,
  type BillingAnalyzerInputObservationPointerV1,
  type BillingAnalyzerOutputManifestV2,
  type BillingAnalyzerRequestV2,
  type BillingCostAnalysisMetadataV2,
  type BillingCostAnalysisLegacyFallbackResponse,
  type BillingCostAnalysisReadResponse,
  type BillingCostAnalysisVerifiedReadResponse,
  type BillingOutputBindingV1,
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
const digestD = 'd'.repeat(64);
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

const observeOwnership = {
  provider: 'azure',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId: subscriptionId,
} as const;

const observeRevision = {
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

const inputObservationPointer = {
  schemaVersion: 1,
  documentType: 'billing-analyzer-input-observation-pointer',
  authority: 'diagnostic-only',
  publicationMode: 'observe',
  inputState: 'enqueued',
  subscriptionId,
  generationId,
  ownership: observeOwnership,
  revision: observeRevision,
  inputManifestPath,
  inputManifestDigest: inputManifest.manifestDigest,
  messageId: analyzerRequest.messageId,
  correlationId: analyzerRequest.correlationId,
  enqueuedAt: completedAt,
} satisfies BillingAnalyzerInputObservationPointerV1;

const inputObservationPointerWithSelfDigest: BillingAnalyzerInputObservationPointerV1 = {
  ...inputObservationPointer,
  // @ts-expect-error Diagnostic discovery pointers do not carry a self digest.
  observationDigest: digestD,
};

const inputObservationPointerPath = buildBillingAnalyzerInputObservationPointerPath(subscriptionId);

const outputManifest = {
  schemaVersion: 2,
  status: 'completed',
  subscriptionId,
  generationId,
  ownership,
  revision,
  inputManifestPath,
  inputManifestDigest: inputManifest.manifestDigest,
  outputBindingDigest: digestD,
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

const promotionObservation = {
  schemaVersion: 1,
  documentType: 'billing-analysis-promotion-observation',
  authority: 'diagnostic-only',
  publicationMode: 'observe',
  processingState: 'succeeded',
  subscriptionId,
  generationId,
  ownership: observeOwnership,
  revision: observeRevision,
  messageId: analyzerRequest.messageId,
  correlationId: analyzerRequest.correlationId,
  inputManifestPath,
  inputManifestDigest: inputManifest.manifestDigest,
  outputManifestPath,
  outputManifestDigest: outputManifest.manifestDigest,
  evaluation: {
    comparison: 'unenforceable',
    projectedOutcome: 'not-enforceable',
  },
  observationDigest: digestD,
  observedAt: completedAt,
} satisfies BillingAnalysisPromotionObservationV1;

const equalSamePromotionObservation = {
  ...promotionObservation,
  ownership,
  revision,
  evaluation: {
    comparison: 'equal',
    projectedOutcome: 'would-be-idempotent',
    outputDigestRelation: 'same',
  },
} satisfies BillingAnalysisPromotionObservationV1;

const equalDifferentPromotionObservation = {
  ...promotionObservation,
  ownership,
  revision,
  evaluation: {
    comparison: 'equal',
    projectedOutcome: 'would-quarantine',
    outputDigestRelation: 'different',
  },
} satisfies BillingAnalysisPromotionObservationV1;

const costAnalysisMetadata = {
  schemaVersion: 2,
  subscriptionId,
  billingGenerationId: generationId,
  ownership,
  revision,
  artifactState: 'current',
  artifactEvidence: publicationDecision,
  inputManifestDigest: inputManifest.manifestDigest,
  outputBindingDigest: outputManifest.outputBindingDigest,
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

const manifestBinding = projectBillingOutputBindingV1FromManifest(outputManifest);
const metadataBinding = projectBillingOutputBindingV1FromMetadata(costAnalysisMetadata);
const binding = {
  kind: 'billing-analysis-output',
  schemaVersion: 1,
  subscriptionId,
  generationId,
  ownership,
  revision,
  inputManifestDigest: inputManifest.manifestDigest,
  publicationDecision,
} satisfies BillingOutputBindingV1;
const canonicalPreimages: string[] = [
  canonicalizeBillingOutputBindingV1(binding),
  canonicalizeBillingAnalyzerInputManifestV2ForDigest(inputManifest),
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest(outputManifest),
  canonicalizeBillingAnalysisPromotionObservationV1ForDigest(promotionObservation),
];

const partialCostAnalysisMetadata = {
  ...costAnalysisMetadata,
  artifactState: 'partial',
  artifactEvidence: partialBillingPublicationDecision,
} satisfies BillingCostAnalysisMetadataV2;

const legacyFallbackResponse = {
  subscriptionId: costAnalysisMetadata.subscriptionId,
  billingGenerationId: costAnalysisMetadata.billingGenerationId,
  chartData: costAnalysisMetadata.chartData,
  anomalies: costAnalysisMetadata.anomalies,
  currencyCode: costAnalysisMetadata.currencyCode,
  currencySymbol: costAnalysisMetadata.currencySymbol,
  artifactState: 'fallback',
  artifactSource: 'legacy-transition',
} satisfies BillingCostAnalysisLegacyFallbackResponse;

const verifiedReadResponse = costAnalysisMetadata satisfies BillingCostAnalysisVerifiedReadResponse;
const legacyReadResponse = legacyFallbackResponse satisfies BillingCostAnalysisReadResponse;

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
  isBillingCostAnalysisBusinessPayloadV1(legacyFallbackResponse),
  isBillingCostAnalysisLegacyFallbackResponse(legacyFallbackResponse),
  isBillingCostAnalysisVerifiedReadResponse(verifiedReadResponse),
  isBillingCostAnalysisReadResponse(verifiedReadResponse),
  isBillingCostAnalysisReadResponse(legacyReadResponse),
  isBillingAnalyzerInputObservationPointerV1(inputObservationPointer),
  isBillingAnalysisPromotionObservationV1(promotionObservation),
  isBillingAnalysisPromotionObservationV1(equalSamePromotionObservation),
  isBillingAnalysisPromotionObservationV1(equalDifferentPromotionObservation),
  !isBillingAnalyzerInputCurrentPointerV1(inputObservationPointer),
  !isBillingAnalysisCurrentPointerV1(inputObservationPointer),
  !isBillingAnalyzerInputCurrentPointerV1(promotionObservation),
  !isBillingAnalysisCurrentPointerV1(promotionObservation),
];

const runtimeSafetyResults: boolean[] = [
  Object.isFrozen(BILLING_ARTIFACT_OBJECT_LIMITS_V1),
  BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH === 'history/billing/analyzer-inputs/latest-enqueued.json',
  inputObservationPointerPath === 'subscriptions/sub-123/history/billing/analyzer-inputs/latest-enqueued.json',
  isBillingAnalyzerInputObservationPointerPath(inputObservationPointerPath),
  !isBillingAnalyzerInputObservationPointerPath('subscriptions/sub-123/history/billing/analyzer-inputs/current.json'),
  !isBillingAnalyzerInputObservationPointerPath('subscriptions/../history/billing/analyzer-inputs/latest-enqueued.json'),
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

// @ts-expect-error Observation pointers use schema version 1.
const unknownInputObservationVersion: BillingAnalyzerInputObservationPointerV1 = { ...inputObservationPointer, schemaVersion: 2 };

// @ts-expect-error Promotion observations use schema version 1.
const unknownPromotionObservationVersion: BillingAnalysisPromotionObservationV1 = { ...promotionObservation, schemaVersion: 2 };

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

const fallbackMetadataV2: BillingCostAnalysisMetadataV2 = {
  ...costAnalysisMetadata,
  // @ts-expect-error V2 metadata never represents a legacy-transition fallback response.
  artifactState: 'fallback',
};

const partialVerifiedReadResponse: BillingCostAnalysisVerifiedReadResponse = {
  ...partialCostAnalysisMetadata,
  // @ts-expect-error Partial V2 metadata remains internal and is not a verified endpoint response.
  artifactState: 'partial',
};

const fallbackWithV2Leakage: BillingCostAnalysisLegacyFallbackResponse = {
  ...legacyFallbackResponse,
  // @ts-expect-error Legacy fallback responses must not expose V2 schema controls.
  schemaVersion: 2,
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

const cyclicMetadataAlias = {
  ...costAnalysisMetadata,
  outputManifestDigest: outputManifest.manifestDigest,
};
runtimeSafetyResults.push(!isBillingCostAnalysisMetadataV2(cyclicMetadataAlias));

void [
  validationResults,
  canonicalPreimages,
  runtimeSafetyResults,
  unknownInputManifestVersion,
  unknownInputPointerVersion,
  unknownRequestVersion,
  unknownInputObservationVersion,
  inputObservationPointerWithSelfDigest,
  unknownPromotionObservationVersion,
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
  fallbackMetadataV2,
  partialVerifiedReadResponse,
  fallbackWithV2Leakage,
  completeEmptyMetadataWithPortalEvidence,
  partialMetadataWithPortalEvidence,
  partialEvidenceWithWrongFirstDependency,
  partialEvidenceWithWrongFirstClaim,
  suppressedMetadata,
  cyclicMetadataAlias,
];
