import {
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisMetadataV2,
  type ArtifactPublicationDecision,
  type ArtifactRevisionVector,
  type BillingAnalysisCurrentPointerV1,
  type BillingAnalyzerInputCurrentPointerV1,
  type BillingAnalyzerInputManifestV2,
  type BillingAnalyzerOutputManifestV2,
  type BillingAnalyzerRequestV2,
  type BillingCostAnalysisMetadataV2,
} from '../index';

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
} satisfies ArtifactPublicationDecision;

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

const additiveInputPointer = {
  ...inputPointer,
  futureTopLevelField: { producer: 'next-version' },
  ownership: { ...inputPointer.ownership, futureOwnershipField: true },
};

const validationResults: boolean[] = [
  isBillingAnalyzerInputManifestV2(inputManifest),
  isBillingAnalyzerInputCurrentPointerV1(inputPointer),
  isBillingAnalyzerInputCurrentPointerV1(additiveInputPointer),
  isBillingAnalyzerRequestV2(analyzerRequest),
  isBillingAnalyzerOutputManifestV2(outputManifest),
  isBillingAnalysisCurrentPointerV1(analysisPointer),
  isBillingCostAnalysisMetadataV2(costAnalysisMetadata),
];

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

// @ts-expect-error Suppressed is an error/decision-path state, not successful metadata.
const suppressedMetadata: BillingCostAnalysisMetadataV2 = { ...costAnalysisMetadata, artifactState: 'suppressed' };

void [
  validationResults,
  unknownInputManifestVersion,
  unknownInputPointerVersion,
  unknownRequestVersion,
  unknownOutputManifestVersion,
  incompleteAnalysisPointer,
  suppressedMetadata,
];
