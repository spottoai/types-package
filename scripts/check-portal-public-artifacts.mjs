import assert from 'node:assert/strict';

import {
  AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME,
  AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
  AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME,
  AWS_PORTAL_PUBLIC_ARTIFACT_RELATIONSHIPS,
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  buildAwsPortalAccountSummaryAiCostSummaryTargetKey,
  buildAwsPortalAccountSummaryHistoryLogicalNameForScope,
  buildAwsPortalAccountSummaryTargetKey,
  buildAwsPortalResourceCollectionHistoryLogicalNameForScope,
  validateAwsPortalAccountSummaryAiCostSummaryArtifact,
  validateAwsPortalAccountSummaryAiCostSummarySiblingBinding,
  validateAwsPortalAccountSummaryDetailArtifact,
  validateAwsPortalAccountSummaryHistoryArtifact,
  validateAwsPortalResourceCollectionDetailArtifact,
  validateAwsPortalResourceCollectionHistoryArtifact,
  validateAwsPortalRetainedHistoryBodyBinding,
  validateAwsPortalRetainedHistoryBodyReference,
} from '../dist/aws/index.js';

const accountId = '123456789012';
const generatedAt = '2026-07-24T06:00:00.000Z';
const generation = { runId: 'portal-run-1', generatedAt };
const billing = {
  source: 'cur',
  reportName: 'customer-cur',
  billingPeriod: { start: '2026-07-01', end: '2026-07-31' },
};
const metricTimeWindow = {
  start: '2026-07-01T00:00:00.000Z',
  end: '2026-07-24T00:00:00.000Z',
};
const resourceScope = {
  provider: 'aws',
  accountId,
  billing,
  resourceRegions: ['ap-southeast-2'],
  metricTimeWindow,
};
const accountScope = { ...resourceScope };
const billingEvidenceScope = {
  provider: 'aws',
  source: 'cur',
  scope: 'account',
  accountId,
  reportName: billing.reportName,
  billingPeriod: billing.billingPeriod,
};
const billingSummary = {
  totalPersistedExpenseCount: 1,
  emptyScope: false,
  metadataFound: true,
  metadataMatchesRequestedBillingPeriod: true,
};
const emptyBillingGroup = {
  totalGroupCount: 0,
  returnedGroupCount: 0,
  truncated: false,
  items: [],
};
const emptyRecommendationSummary = {
  totalStateCount: 0,
  currentStateCount: 0,
  missingStateCount: 0,
  snapshotBackedCount: 0,
  orphanSnapshotCount: 0,
  matchedStateCount: 0,
  filteredOutStateCount: 0,
  emptyScope: true,
  emptyResult: true,
};
const emptyRecommendationCounts = {
  byLifecycleStatus: [],
  bySourcePresence: [],
  byCategory: [],
  byRegion: [],
  bySourceService: [],
  byResourceType: [],
  byActionType: [],
  byImplementationEffort: [],
};
const emptyRecommendationSavings = {
  snapshotBackedMatchedCount: 0,
  positiveEstimatedSavingsRecommendationCount: 0,
  nonPositiveEstimatedSavingsCount: 0,
  missingEstimatedSavingsCount: 0,
  missingCurrencyCodeCount: 0,
  emptySavings: true,
  mixedCurrencies: false,
  byCurrency: [],
};
const envelope = (artifactType, logicalName) => ({
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType,
  artifactGeneration: generation,
  generatedAt,
  logicalName,
});

const resource = {
  ...envelope('resource-collection', AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME),
  scope: resourceScope,
  summary: {
    totalDiscoveredResourceCount: 1,
    returnedResourceCount: 1,
    emptyCollection: false,
    truncated: false,
    unmatchedRecommendationResourceCount: 0,
    unmatchedBillingExpenseCount: 0,
  },
  coverage: {
    billing: {
      scope: billingEvidenceScope,
      freshness: { lastSuccessfulImportAt: generatedAt, hasSuccessfulImport: true },
      summary: billingSummary,
      totalsByCurrency: {
        totalGroupCount: 1,
        returnedGroupCount: 1,
        truncated: false,
        items: [{ currency: 'NZD', expenseCount: 1, baseCostAmount: 12 }],
      },
    },
    discovery: {
      families: [
        {
          family: 'ec2-instance',
          resourceRegion: 'ap-southeast-2',
          freshness: { lastSuccessfulRefreshAt: generatedAt, hasSuccessfulRefresh: true },
          summary: { count: 1 },
          groupedTotals: {},
        },
      ],
    },
    metrics: {
      families: [
        {
          metricFamily: 'ec2-core-utilization',
          resourceRegion: 'ap-southeast-2',
          requestedMonths: ['2026-07'],
          availableMonths: ['2026-07'],
          missingMonths: [],
          coverage: { complete: true },
          summary: { average: 10 },
        },
      ],
    },
    recommendations: {
      sources: [
        {
          source: 'custom',
          scope: {
            provider: 'aws',
            source: 'custom',
            scope: 'account',
            accountId,
            resourceRegions: ['ap-southeast-2'],
          },
          summary: emptyRecommendationSummary,
          counts: emptyRecommendationCounts,
          savings: emptyRecommendationSavings,
        },
      ],
    },
    virtualTags: {
      status: 'available',
      source: 'spotto-tags',
      generatedAt,
      rulesHash: 'a'.repeat(64),
      enabledRuleCount: 1,
      appliedRuleCount: 1,
      taggedResourceCount: 1,
      unsupportedRuleCount: 0,
    },
  },
  resources: [
    {
      stableKey: 'aws:ec2:instance:i-123',
      family: 'ec2-instance',
      resourceRegion: 'ap-southeast-2',
      resourceType: 'AWS::EC2::Instance',
      resourceId: 'i-123',
      discovery: {
        freshness: { lastSuccessfulRefreshAt: generatedAt, hasSuccessfulRefresh: true },
        summary: { state: 'running' },
      },
      metrics: { supported: true, families: [] },
      recommendations: {
        matchedRecommendationCount: 0,
        sources: [],
        counts: {},
        savings: {},
      },
    },
  ],
};

const account = {
  ...envelope('account-summary', AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME),
  scope: accountScope,
  account: {
    metadataFound: true,
    providerAccountId: accountId,
    accountName: 'Production',
    validatedAt: generatedAt,
    providerPartition: 'aws',
    summary: {},
    firstUsefulRecommendationReadiness: { ready: true },
  },
  billing: {
    scope: billingEvidenceScope,
    freshness: { lastSuccessfulImportAt: generatedAt, hasSuccessfulImport: true },
    summary: billingSummary,
    totalsByCurrency: {
      totalGroupCount: 1,
      returnedGroupCount: 1,
      truncated: false,
      items: [{ currency: 'NZD', expenseCount: 1, baseCostAmount: 12 }],
    },
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
};

const historyBilling = {
  totalPersistedExpenseCount: 1,
  emptyScope: false,
  metadataFound: true,
  metadataMatchesRequestedBillingPeriod: true,
  totalsByCurrency: [{ currency: 'NZD', expenseCount: 1, baseCostAmount: 12 }],
};
const resourceHistory = {
  ...envelope('resource-collection-history', buildAwsPortalResourceCollectionHistoryLogicalNameForScope(resourceScope, generatedAt)),
  scope: resourceScope,
  summary: resource.summary,
  billing: historyBilling,
  discovery: { families: [] },
  metrics: { families: [] },
  recommendations: { sources: [] },
};
const accountHistoryScope = {
  provider: 'aws',
  accountId,
  billing,
  resourceRegions: ['ap-southeast-2'],
};
const accountHistory = {
  ...envelope('account-summary-history', buildAwsPortalAccountSummaryHistoryLogicalNameForScope(accountHistoryScope)),
  scope: accountHistoryScope,
  billing: historyBilling,
  discovery: { families: [] },
  recommendations: { sources: [] },
};
const ai = {
  ...envelope('account-summary-ai-cost-summary', AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME),
  source: {
    scope: accountScope,
    targetKey: buildAwsPortalAccountSummaryTargetKey(accountScope),
    logicalName: AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
    artifactType: 'account-summary',
    artifactGeneration: generation,
    sha256: 'd'.repeat(64),
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
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      },
    },
  ],
};
const retained = {
  artifactType: 'resource-collection-history',
  logicalName: resourceHistory.logicalName,
  artifactGeneration: generation,
  body: {
    name: resourceHistory.logicalName,
    mediaType: 'application/json',
    contentEncoding: 'gzip',
    byteLength: 123,
    sha256: 'e'.repeat(64),
  },
};
const accountBodyDescriptor = {
  name: AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
  mediaType: 'application/json',
  contentEncoding: 'gzip',
  byteLength: 456,
  sha256: ai.source.sha256,
};

assert.deepEqual(AWS_PORTAL_PUBLIC_ARTIFACT_RELATIONSHIPS['account-summary-ai-cost-summary'].required, ['account-summary']);
assert.deepEqual(validateAwsPortalResourceCollectionDetailArtifact(resource), resource);
assert.deepEqual(validateAwsPortalAccountSummaryDetailArtifact(account), account);
assert.deepEqual(validateAwsPortalResourceCollectionHistoryArtifact(resourceHistory), resourceHistory);
assert.deepEqual(validateAwsPortalAccountSummaryHistoryArtifact(accountHistory), accountHistory);
assert.deepEqual(validateAwsPortalAccountSummaryAiCostSummaryArtifact(ai), ai);
assert.deepEqual(validateAwsPortalAccountSummaryAiCostSummarySiblingBinding(ai, account, accountBodyDescriptor), ai);
assert.deepEqual(validateAwsPortalRetainedHistoryBodyReference(retained), retained);
assert.deepEqual(validateAwsPortalRetainedHistoryBodyBinding(retained, resourceHistory), retained);

const clone = value => structuredClone(value);
const rejects = (validator, value, pattern) => assert.throws(() => validator(value), pattern);

const undeclared = clone(resource);
undeclared.privateArtifact = true;
rejects(validateAwsPortalResourceCollectionDetailArtifact, undeclared, /undeclared fields/);

const crossRegion = clone(resource);
crossRegion.resources[0].resourceRegion = 'us-east-1';
rejects(validateAwsPortalResourceCollectionDetailArtifact, crossRegion, /outside artifact scope/);

const pathBearing = clone(resource);
pathBearing.coverage.billing.summary.sourcePath = '/private/blob.json';
rejects(validateAwsPortalResourceCollectionDetailArtifact, pathBearing, /undeclared fields|not allowed in a public artifact/);

const credential = clone(account);
credential.account.summary.credentialReference = 'secret-store-key';
rejects(validateAwsPortalAccountSummaryDetailArtifact, credential, /not allowed in a public artifact/);

const mixedAccount = clone(account);
mixedAccount.account.providerAccountId = '999999999999';
rejects(validateAwsPortalAccountSummaryDetailArtifact, mixedAccount, /exact binding/);

const lossyMetric = clone(account);
lossyMetric.metrics.families.push({
  metricFamily: 'ec2-core-utilization',
  resourceRegion: 'ap-southeast-2',
  status: 'not-found',
  requestedMonths: ['2026-07'],
  availableMonths: [],
  missingMonths: ['2026-07'],
  freshness: { hasSuccessfulRefresh: false },
  readiness: {},
  fabricatedZero: 0,
});
rejects(validateAwsPortalAccountSummaryDetailArtifact, lossyMetric, /undeclared fields/);

const crossRunAi = clone(ai);
crossRunAi.source.artifactGeneration = { ...crossRunAi.source.artifactGeneration, runId: 'other-run' };
rejects(validateAwsPortalAccountSummaryAiCostSummaryArtifact, crossRunAi, /exact binding/);

const duplicateAudience = clone(ai);
duplicateAudience.entries.push(clone(ai.entries[0]));
rejects(validateAwsPortalAccountSummaryAiCostSummaryArtifact, duplicateAudience, /duplicates/);

const unavailableAi = clone(ai);
unavailableAi.entries[0].status = 'provider-unavailable';
rejects(validateAwsPortalAccountSummaryAiCostSummaryArtifact, unavailableAi, /exact binding/);

const pathLogicalName = clone(retained);
pathLogicalName.logicalName = '../history.json.gz';
rejects(validateAwsPortalRetainedHistoryBodyReference, pathLogicalName, /canonical package-owned/);

const wrongHistoryScope = clone(resourceHistory);
wrongHistoryScope.scope.resourceRegions = ['us-east-1'];
rejects(validateAwsPortalResourceCollectionHistoryArtifact, wrongHistoryScope, /exact binding/);

const wrongSiblingHash = clone(accountBodyDescriptor);
wrongSiblingHash.sha256 = 'f'.repeat(64);
assert.throws(() => validateAwsPortalAccountSummaryAiCostSummarySiblingBinding(ai, account, wrongSiblingHash), /exact binding/);

const wrongRetainedGeneration = clone(retained);
wrongRetainedGeneration.artifactGeneration.runId = 'other-run';
assert.throws(() => validateAwsPortalRetainedHistoryBodyBinding(wrongRetainedGeneration, resourceHistory), /match.*exactly/);

const malformedResourceBilling = clone(resource);
malformedResourceBilling.resources[0].billing = {
  costProvenance: {},
  matchedExpenseCount: 0,
  totalsByCurrency: [],
  costViewByCurrency: [],
  commitmentSpend: {},
};
rejects(validateAwsPortalResourceCollectionDetailArtifact, malformedResourceBilling, /must|binding|required|declared|integer/);

const malformedAction = clone(resource);
malformedAction.resources[0].recommendations.actionability = {
  latestActionStableMaterializationKey: 'recommendation-1',
  latestActionExecution: {},
};
rejects(validateAwsPortalResourceCollectionDetailArtifact, malformedAction, /must|binding|required|declared|integer/);

const malformedTemplateSource = clone(resource);
malformedTemplateSource.resources[0].recommendations.templateProvenance = {
  status: 'available-with-confidence',
  templateBackedRecommendationCount: 1,
  missingTemplateRecommendationCount: 0,
  internalTemplateCount: 1,
  externalTemplateCount: 0,
  confidenceBackedRecommendationCount: 1,
  templateRecommendationWithoutConfidenceCount: 0,
  lowestConfidenceSources: [{}],
};
rejects(validateAwsPortalResourceCollectionDetailArtifact, malformedTemplateSource, /must|binding|required|declared|integer/);

const malformedPosture = clone(ai);
malformedPosture.entries[0].sourceRecommendationPosture = {};
rejects(validateAwsPortalAccountSummaryAiCostSummaryArtifact, malformedPosture, /must|binding|required|declared|integer/);

const malformedHistorySavings = clone(resourceHistory);
malformedHistorySavings.recommendations.sources = [
  {
    source: 'custom',
    totalStateCount: 1,
    currentStateCount: 1,
    matchedStateCount: 1,
    filteredOutStateCount: 0,
    positiveEstimatedSavingsRecommendationCount: 1,
    savingsByCurrency: [{}],
  },
];
rejects(validateAwsPortalResourceCollectionHistoryArtifact, malformedHistorySavings, /must|binding|required|declared|integer/);

process.stdout.write('Lossless AWS resource/account/history/AI public artifact contracts verified.\n');
