import {
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  RecommendationCategory,
  type AwsPluginResourceArtifact,
  type AwsPluginSubscriptionArtifact,
  type AwsPortalAccountSummaryArtifact,
  type AwsPortalLifecycleArtifact,
  type AwsPortalRelationshipArtifact,
  type AwsPortalResourceCollectionArtifact,
} from '../index';

const artifactGeneration = {
  runId: 'portal-run-1',
  generatedAt: '2026-07-23T00:05:00.000Z',
} as const;

const account = {
  provider: 'aws',
  accountId: '123456789012',
  companyId: 'company-123',
  displayName: 'Production AWS',
} as const;

const accountSummary = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId: account.accountId,
  artifactType: 'account-summary',
  artifactGeneration,
  account,
  timestamp: artifactGeneration.generatedAt,
} satisfies AwsPortalAccountSummaryArtifact<'123456789012', 'portal-run-1'>;

const resourceCollection = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId: account.accountId,
  artifactType: 'resource-collection',
  artifactGeneration,
  account,
  timestamp: artifactGeneration.generatedAt,
  resources: [
    {
      provider: 'aws',
      accountId: account.accountId,
      id: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
      arn: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
      name: 'web-1',
      type: 'AWS::EC2::Instance',
      region: 'ap-southeast-2',
      location: 'ap-southeast-2',
      spend: 10,
      spendAmortized: 9,
      recommendations: [],
      customRecommendations: [],
    },
  ],
} satisfies AwsPortalResourceCollectionArtifact<'123456789012', 'portal-run-1'>;

const relationships = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId: account.accountId,
  artifactType: 'relationships',
  artifactGeneration,
  generatedAt: artifactGeneration.generatedAt,
  currency: 'NZD',
  currencySymbol: '$',
  nodes: [
    {
      id: account.accountId,
      kind: 'account',
      data: {
        accountId: account.accountId,
        name: account.displayName,
      },
    },
  ],
  edges: [],
  unresolved: [],
  stats: {
    totalNodes: 1,
    totalEdges: 0,
    unresolvedCount: 0,
    buildMs: 1,
  },
} satisfies AwsPortalRelationshipArtifact<'123456789012', 'portal-run-1'>;

const lifecycle = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId: account.accountId,
  artifactType: 'lifecycle',
  artifactGeneration,
  generatedAt: artifactGeneration.generatedAt,
  entries: [
    {
      id: 'service-retirement:example',
      lifecycleClass: 'service-retirement',
      title: 'Example retirement',
      effectiveAt: '2026-12-01T00:00:00.000Z',
      severity: 'warning',
      resources: [
        {
          provider: 'aws',
          id: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
          arn: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
          accountId: account.accountId,
          region: 'ap-southeast-2',
          name: 'web-1',
          resourceType: 'AWS::EC2::Instance',
        },
      ],
    },
  ],
} satisfies AwsPortalLifecycleArtifact<'123456789012', 'portal-run-1'>;

const pluginSubscription = {
  ...accountSummary,
  artifactType: 'plugin-subscription',
} satisfies AwsPluginSubscriptionArtifact<'123456789012', 'portal-run-1'>;

const pluginResource = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId: account.accountId,
  artifactType: 'plugin-resource',
  artifactGeneration,
  currency: 'NZD',
  currencySymbol: '$',
  timestamp: artifactGeneration.generatedAt,
  id: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
  arn: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
  type: 'AWS::EC2::Instance',
  name: 'web-1',
  region: 'ap-southeast-2',
  location: 'ap-southeast-2',
} satisfies AwsPluginResourceArtifact<'123456789012', 'portal-run-1'>;

const invalidCredentialReference: AwsPortalAccountSummaryArtifact = {
  ...accountSummary,
  // @ts-expect-error Public account-summary artifacts cannot expose credential references.
  credentialReference: 'arn:aws:secretsmanager:example',
};

const invalidSecretAccessKey: AwsPortalResourceCollectionArtifact = {
  ...resourceCollection,
  // @ts-expect-error Public resource artifacts cannot expose raw AWS credentials.
  secretAccessKey: 'raw-secret',
};

const invalidAccountBinding: AwsPortalAccountSummaryArtifact<'123456789012', 'portal-run-1'> = {
  ...accountSummary,
  account: {
    ...accountSummary.account,
    // @ts-expect-error Nested public account identity must match the artifact account.
    accountId: '999999999999',
  },
};

const invalidExternalId: AwsPluginSubscriptionArtifact = {
  ...pluginSubscription,
  // @ts-expect-error Public plugin artifacts cannot expose setup External IDs.
  externalId: 'setup-secret',
};

const invalidRoleArn: AwsPluginResourceArtifact = {
  ...pluginResource,
  // @ts-expect-error Public plugin artifacts cannot expose credential-bearing role configuration.
  roleArn: 'arn:aws:iam::123456789012:role/SpottoReadOnly',
};

const invalidRelationshipResourceGroup: AwsPortalRelationshipArtifact = {
  ...relationships,
  nodes: [
    {
      ...relationships.nodes[0],
      data: {
        ...relationships.nodes[0].data,
        // @ts-expect-error AWS relationship nodes use account and Region identity, not Azure resource groups.
        resourceGroup: 'azure-only',
      },
    },
  ],
};

const invalidRelationshipProperties: AwsPortalRelationshipArtifact = {
  ...relationships,
  nodes: [
    {
      ...relationships.nodes[0],
      data: {
        ...relationships.nodes[0].data,
        // @ts-expect-error Public relationship artifacts do not expose arbitrary property bags.
        properties: { secretAccessKey: 'raw-secret' },
      },
    },
  ],
};

const invalidPluginResourceProperties: AwsPluginResourceArtifact = {
  ...pluginResource,
  // @ts-expect-error Public plugin-resource artifacts do not expose arbitrary property bags.
  properties: { secretAccessKey: 'raw-secret' },
};

const invalidPluginRecommendationRenderData: AwsPluginResourceArtifact = {
  ...pluginResource,
  recommendations: [
    {
      id: 'recommendation-1',
      name: 'Recommendation',
      category: RecommendationCategory.Cost,
      impact: 'Reduce cost.',
      // @ts-expect-error Public AWS recommendations cannot expose arbitrary render-data property bags.
      renderData: { secretAccessKey: 'raw-secret' },
    },
  ],
};

void [
  accountSummary,
  resourceCollection,
  relationships,
  lifecycle,
  pluginSubscription,
  pluginResource,
  invalidCredentialReference,
  invalidSecretAccessKey,
  invalidAccountBinding,
  invalidExternalId,
  invalidRoleArn,
  invalidRelationshipResourceGroup,
  invalidRelationshipProperties,
  invalidPluginResourceProperties,
  invalidPluginRecommendationRenderData,
];
