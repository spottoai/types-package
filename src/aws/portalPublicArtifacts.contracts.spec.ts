import {
  AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME,
  AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
  AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME,
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  buildAwsPortalAccountSummaryHistoryLogicalName,
  buildAwsPortalAccountSummaryAiCostSummaryTargetKey,
  buildAwsPortalAccountSummaryTargetKey,
  buildAwsPortalResourceCollectionHistoryLogicalName,
  type AwsPortalAccountSummaryAiCostSummaryArtifact,
  type AwsPortalAccountSummaryDetailArtifact,
  type AwsPortalResourceCollectionDetailArtifact,
  type AwsPortalRetainedHistoryBodyReference,
} from '../index';

const accountId = '123456789012' as const;
const generatedAt = '2026-07-24T06:00:00.000Z';
const artifactGeneration = { runId: 'portal-run-1', generatedAt } as const;
const billing = {
  source: 'cur',
  reportName: 'customer-cur',
  billingPeriod: { start: '2026-07-01', end: '2026-07-31' },
} as const;
const metricTimeWindow = {
  start: '2026-07-01T00:00:00.000Z',
  end: '2026-07-24T00:00:00.000Z',
} as const;
const resourceScope = {
  provider: 'aws',
  accountId,
  billing,
  resourceRegions: ['ap-southeast-2'] as string[],
  metricTimeWindow,
} as const;
const accountScope = { ...resourceScope };
const billingEvidenceScope = {
  provider: 'aws',
  source: 'cur',
  scope: 'account',
  accountId,
  reportName: billing.reportName,
  billingPeriod: billing.billingPeriod,
} as const;
const emptyBillingSummary = {
  totalPersistedExpenseCount: 0,
  emptyScope: true,
  metadataFound: false,
  metadataMatchesRequestedBillingPeriod: false,
} as const;
const emptyBillingGroup = {
  totalGroupCount: 0,
  returnedGroupCount: 0,
  truncated: false,
  items: [] as never[],
} as const;

const resourceCollection = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType: 'resource-collection',
  artifactGeneration,
  generatedAt,
  logicalName: AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME,
  scope: resourceScope,
  summary: {
    totalDiscoveredResourceCount: 0,
    returnedResourceCount: 0,
    emptyCollection: true,
    truncated: false,
    unmatchedRecommendationResourceCount: 0,
    unmatchedBillingExpenseCount: 0,
  },
  coverage: {
    billing: {
      scope: billingEvidenceScope,
      freshness: { hasSuccessfulImport: false },
      summary: emptyBillingSummary,
      totalsByCurrency: emptyBillingGroup,
    },
    discovery: { families: [] },
    metrics: { families: [] },
    recommendations: { sources: [] },
  },
  resources: [],
} satisfies AwsPortalResourceCollectionDetailArtifact<typeof accountId, 'portal-run-1'>;

const accountSummary = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType: 'account-summary',
  artifactGeneration,
  generatedAt,
  logicalName: AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
  scope: accountScope,
  account: {
    metadataFound: false,
    providerAccountId: accountId,
    validatedAt: generatedAt,
    summary: {},
  },
  billing: {
    scope: billingEvidenceScope,
    freshness: { hasSuccessfulImport: false },
    summary: emptyBillingSummary,
    totalsByCurrency: emptyBillingGroup,
    costViewByCurrency: [],
    groupedCosts: {
      byChargeCategory: emptyBillingGroup,
      byServiceCode: emptyBillingGroup,
      byServiceCategory: emptyBillingGroup,
    },
  },
  discovery: { families: [] },
  metrics: { families: [] },
  recommendations: { sources: [] },
} satisfies AwsPortalAccountSummaryDetailArtifact<typeof accountId, 'portal-run-1'>;

const aiSummary = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType: 'account-summary-ai-cost-summary',
  artifactGeneration,
  generatedAt,
  logicalName: AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME,
  source: {
    scope: accountScope,
    targetKey: buildAwsPortalAccountSummaryTargetKey(accountScope),
    logicalName: AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
    artifactType: 'account-summary',
    artifactGeneration,
    sha256: 'a'.repeat(64),
  },
  entries: [
    {
      targetKey: buildAwsPortalAccountSummaryAiCostSummaryTargetKey(accountScope, 'executive'),
      audience: 'executive',
      artifactVersion: 1,
      generatedAt,
      createdAt: generatedAt,
      updatedAt: generatedAt,
      status: 'available',
      summary: { headline: 'Stable spend', narrative: 'No material movement.' },
      provider: {
        type: 'amazon-bedrock',
        inferenceProfileId: 'profile-1',
        promptVersionArn: 'arn:aws:bedrock:ap-southeast-2:123456789012:prompt/example:1',
      },
    },
  ],
} satisfies AwsPortalAccountSummaryAiCostSummaryArtifact<typeof accountId, 'portal-run-1'>;

const historyReference = {
  artifactType: 'resource-collection-history',
  logicalName: buildAwsPortalResourceCollectionHistoryLogicalName('b'.repeat(64)),
  artifactGeneration,
  body: {
    name: buildAwsPortalResourceCollectionHistoryLogicalName('b'.repeat(64)),
    mediaType: 'application/json',
    contentEncoding: 'gzip',
    byteLength: 123,
    sha256: 'c'.repeat(64),
  },
} satisfies AwsPortalRetainedHistoryBodyReference;

const accountHistoryName = buildAwsPortalAccountSummaryHistoryLogicalName('d'.repeat(64));

const invalidAccount: AwsPortalAccountSummaryDetailArtifact<typeof accountId> = {
  ...accountSummary,
  account: {
    ...accountSummary.account,
    // @ts-expect-error Nested provider account identity must match the envelope account.
    providerAccountId: '999999999999',
  },
};

const invalidAiLogicalName: AwsPortalAccountSummaryAiCostSummaryArtifact = {
  ...aiSummary,
  // @ts-expect-error AI summaries use the one declared sibling logical name.
  logicalName: 'private-ai.json.gz',
};

const invalidCredential: AwsPortalResourceCollectionDetailArtifact = {
  ...resourceCollection,
  // @ts-expect-error Public immutable artifacts cannot expose credential references.
  credentialReference: 'secret-store-key',
};

void [resourceCollection, accountSummary, aiSummary, historyReference, accountHistoryName, invalidAccount, invalidAiLogicalName, invalidCredential];
