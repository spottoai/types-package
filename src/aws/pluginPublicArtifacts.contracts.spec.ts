import {
  AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  buildAwsPluginResourceLogicalName,
  buildAwsPluginSubscriptionLogicalName,
  sha256AwsPluginIdentity,
  type AwsPluginGenerationManifest,
  type AwsPluginResourceDetailArtifact,
  type AwsPluginResourceRecommendationsEvidence,
  type AwsPluginResourceTarget,
  type AwsPluginSubscriptionDetailArtifact,
  type AwsPluginSubscriptionTarget,
} from '../index';

const digest = 'a'.repeat(64);
const generatedAt = '2026-07-24T05:00:00.000Z';
const targetKey = 'plugin-subscription-detail|aws|123456789012';
const stableKey = 'aws:ec2:instance:i-123';
const targetKeySha256 = sha256AwsPluginIdentity(targetKey);
const stableKeySha256 = sha256AwsPluginIdentity(stableKey);
const subscriptionTarget: AwsPluginSubscriptionTarget<'123456789012'> = {
  kind: 'subscription-detail',
  provider: 'aws',
  accountId: '123456789012',
  targetKey,
  targetKeySha256,
  accountSummaryTargetKey: 'account-summary-target',
  resourceCollectionTargetKey: 'resources-target',
  recommendationsTargetKey: 'recommendations-target',
  serviceRetirementTargetKey: 'lifecycle-target',
  billing: {
    source: 'cur',
    reportName: 'customer-cur',
    billingPeriod: { start: '2026-07-01', end: '2026-07-31' },
  },
  resourceRegions: ['ap-southeast-2'],
  metricTimeWindow: {
    start: '2026-07-01T00:00:00.000Z',
    end: '2026-07-24T00:00:00.000Z',
  },
  serviceRetirementRegions: ['ap-southeast-2'],
  recommendationScopes: [],
};

const subscription = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  pluginSchemaVersion: AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId: '123456789012',
  artifactType: 'plugin-subscription',
  artifactGeneration: { runId: 'plugin-run-1', generatedAt },
  generatedAt,
  logicalName: buildAwsPluginSubscriptionLogicalName(targetKeySha256),
  target: subscriptionTarget,
  sections: {
    accountSummary: {
      status: 'not-found',
      section: 'account-summary',
      targetKey: 'account-summary-target',
    },
    resources: {
      status: 'not-found',
      section: 'resources',
      targetKey: 'resources-target',
    },
    serviceRetirement: {
      status: 'not-found',
      section: 'service-retirement',
      targetKey: 'lifecycle-target',
    },
    recommendations: {
      status: 'not-found',
      section: 'recommendations',
      targetKey: 'recommendations-target',
    },
  },
} satisfies AwsPluginSubscriptionDetailArtifact<'123456789012', 'plugin-run-1'>;

const resourceTarget: AwsPluginResourceTarget<'123456789012'> = {
  kind: 'resource-detail',
  provider: 'aws',
  accountId: subscriptionTarget.accountId,
  targetKey: subscriptionTarget.targetKey,
  targetKeySha256: subscriptionTarget.targetKeySha256,
  resourceCollectionTargetKey: subscriptionTarget.resourceCollectionTargetKey,
  recommendationsTargetKey: subscriptionTarget.recommendationsTargetKey,
  billing: subscriptionTarget.billing,
  resourceRegions: subscriptionTarget.resourceRegions,
  metricTimeWindow: subscriptionTarget.metricTimeWindow,
  recommendationScopes: subscriptionTarget.recommendationScopes,
  selector: { kind: 'stable-key', stableKey },
  stableKey,
  stableKeySha256,
  relationshipTargetKey: 'relationships-target',
  serviceRetirementTargetKey: 'lifecycle-target',
};

const resource = {
  ...subscription,
  artifactType: 'plugin-resource',
  logicalName: buildAwsPluginResourceLogicalName(stableKeySha256, targetKeySha256),
  target: resourceTarget,
  selector: resourceTarget.selector,
  stableKey: resourceTarget.stableKey,
  sections: {
    resource: {
      status: 'available',
      section: 'resource',
      targetKey: 'resources-target',
      generatedAt,
      sourceGeneration: {
        provider: 'aws',
        accountId: '123456789012',
        section: 'resource',
        sourceArtifactType: 'resource-collection',
        generationId: 'portal-run-1',
        generatedAt,
        targetKey: 'resources-target',
        artifactSha256: digest,
        billing: resourceTarget.billing,
        resourceRegions: resourceTarget.resourceRegions,
        metricTimeWindow: resourceTarget.metricTimeWindow,
        selector: resourceTarget.selector,
        stableKey: resourceTarget.stableKey,
      },
      evidence: {
        item: {
          stableKey: resourceTarget.stableKey,
          family: 'ec2-instance',
          resourceRegion: 'ap-southeast-2',
          resourceType: 'AWS::EC2::Instance',
          discovery: {},
        },
      },
    },
    relationships: {
      status: 'not-found',
      section: 'relationships',
      targetKey: 'relationships-target',
    },
    serviceRetirement: {
      status: 'not-found',
      section: 'service-retirement',
      targetKey: 'lifecycle-target',
    },
    recommendations: {
      status: 'not-found',
      section: 'recommendations',
      targetKey: 'recommendations-target',
    },
  },
} satisfies AwsPluginResourceDetailArtifact<'123456789012', 'plugin-run-1'>;

const manifest = {
  schemaVersion: AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  status: 'completed',
  provider: 'aws',
  accountId: '123456789012',
  artifactGeneration: { runId: 'plugin-run-1', generatedAt },
  requestBinding: { requestId: 'request-1', requestedAt: generatedAt },
  operation: { kind: 'full' },
  members: [
    {
      state: 'active',
      publication: 'replaced',
      provider: 'aws',
      accountId: '123456789012',
      logicalName: subscription.logicalName,
      artifactType: 'plugin-subscription',
      target: subscriptionTarget,
      artifact: {
        name: subscription.logicalName,
        mediaType: 'application/json',
        contentEncoding: 'gzip',
        byteLength: 1,
        sha256: digest,
      },
      sourceGenerations: [
        {
          provider: 'aws',
          accountId: '123456789012',
          section: 'account-summary',
          sourceArtifactType: 'account-summary',
          generationId: 'portal-run-1',
          generatedAt,
          targetKey: 'account-summary-target',
          artifactSha256: digest,
          billing: subscriptionTarget.billing,
          resourceRegions: subscriptionTarget.resourceRegions,
          metricTimeWindow: subscriptionTarget.metricTimeWindow,
        },
      ],
    },
  ],
  counts: { active: 1, replaced: 1, carriedForward: 0, retired: 0 },
  completedAt: generatedAt,
} satisfies AwsPluginGenerationManifest<'123456789012', 'plugin-run-1'>;

const invalidBodyRequest: AwsPluginSubscriptionDetailArtifact = {
  ...subscription,
  // @ts-expect-error Plugin publication request identity is body-free.
  requestId: 'request-1',
};

const invalidRetirementBody: AwsPluginResourceDetailArtifact = {
  ...resource,
  // @ts-expect-error Retirement is represented in active-set membership.
  retiredAt: generatedAt,
};

const resourceRecommendationEvidence = {
  summary: {
    requestedScopeCount: 1,
    availableScopeCount: 1,
    notFoundScopeCount: 0,
    unsupportedScopeCount: 0,
  },
  sections: [
    {
      status: 'available',
      source: 'custom',
      targetKey: 'recommendation-target',
      generatedAt,
      artifact: { artifactType: 'resource-recommendations' },
    },
  ],
} satisfies AwsPluginResourceRecommendationsEvidence;

void [subscription, resource, manifest, invalidBodyRequest, invalidRetirementBody, resourceRecommendationEvidence];
