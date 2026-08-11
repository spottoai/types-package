import {
  AWS_PORTAL_RELATIONSHIP_CONFIDENCE_SCORES,
  AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME,
  AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION,
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  type AwsPortalRelationshipArtifact,
  type AwsPortalRelationshipArtifactV1,
  type PublicRelationshipArtifact,
} from '../index';

const accountId = '123456789012' as const;
const generatedAt = '2026-08-11T06:00:00.000Z';
const artifactGeneration = { runId: 'portal-run-1', generatedAt } as const;
const resourceRegion = 'ap-southeast-2';

const relationshipArtifact = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: 1,
  relationshipSchemaVersion: AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType: 'relationships',
  artifactGeneration,
  generatedAt,
  logicalName: AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME,
  source: {
    artifactType: 'relationship-graph',
    artifactVersion: 1,
    generatedAt,
  },
  scope: {
    provider: 'aws',
    accountId,
    resourceRegions: [resourceRegion],
  },
  nodes: [
    {
      id: `account|${accountId}`,
      kind: 'account',
      data: { provider: 'aws', accountId, displayName: 'Production' },
    },
    {
      id: `region|${accountId}|${resourceRegion}`,
      kind: 'region',
      data: { provider: 'aws', accountId, resourceRegion },
    },
    {
      id: 'aws:ec2:instance:i-123',
      kind: 'resource',
      data: {
        provider: 'aws',
        accountId,
        family: 'ec2-instance',
        resourceRegion,
        stableKey: 'aws:ec2:instance:i-123',
        resourceType: 'ec2-instance',
        instanceId: 'i-123',
        instanceArn: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
        name: 'web-1',
        availabilityZone: 'ap-southeast-2a',
        vpcId: 'vpc-123',
        tags: { Environment: 'production' },
      },
    },
    {
      id: `synthetic|${accountId}|${resourceRegion}|vpc|vpc-123`,
      kind: 'synthetic',
      data: {
        provider: 'aws',
        accountId,
        resourceRegion,
        syntheticType: 'vpc',
        identifier: 'vpc-123',
      },
    },
  ],
  edges: [
    {
      id: 'region-to-account',
      from: `region|${accountId}|${resourceRegion}`,
      to: `account|${accountId}`,
      kind: 'contains',
      relationshipTypes: ['account-region'],
      confidence: 'high',
      evidence: [
        {
          method: 'request-scope',
          sourceFamily: 'graph-scope',
          field: 'resourceRegions',
          matchedValue: resourceRegion,
        },
      ],
    },
    {
      id: 'instance-to-region',
      from: 'aws:ec2:instance:i-123',
      to: `region|${accountId}|${resourceRegion}`,
      kind: 'contains',
      relationshipTypes: ['region-resource'],
      confidence: 'high',
      evidence: [
        {
          method: 'persisted-inventory',
          sourceFamily: 'ec2-instance',
          field: 'stableKey',
          matchedValue: 'aws:ec2:instance:i-123',
        },
      ],
    },
  ],
  unresolved: [
    {
      sourceNodeId: 'aws:ec2:instance:i-123',
      relationshipType: 'vpc-membership',
      sourceFamily: 'ec2-instance',
      field: 'vpcId',
      matchedValue: 'vpc-123',
      expectedTargetFamily: 'vpc',
    },
  ],
  coverage: {
    families: [
      {
        family: 'ec2-instance',
        resourceRegions: [resourceRegion],
        status: 'available',
        lastSuccessfulRefreshAt: generatedAt,
        emptyScope: false,
      },
    ],
  },
  costOverlay: {
    source: {
      artifactType: 'resource-collection',
      logicalName: 'resources.json.gz',
      artifactGeneration,
      sha256: 'a'.repeat(64),
      scope: {
        provider: 'aws',
        accountId,
        billing: {
          source: 'cur',
          reportName: 'customer-cur',
          billingPeriod: { start: '2026-08-01', end: '2026-08-31' },
        },
        resourceRegions: [resourceRegion],
        metricTimeWindow: {
          start: '2026-08-01T00:00:00.000Z',
          end: generatedAt,
        },
      },
    },
    coverage: {
      totalResourceCount: 1,
      billedResourceCount: 1,
      matchedResourceNodeCount: 0,
      unmatchedBillingExpenseCount: 0,
    },
    billing: {
      scope: {
        provider: 'aws',
        source: 'cur',
        scope: 'account',
        accountId,
        reportName: 'customer-cur',
        billingPeriod: { start: '2026-08-01', end: '2026-08-31' },
      },
      freshness: {
        lastSuccessfulImportAt: generatedAt,
        hasSuccessfulImport: true,
      },
      summary: {
        totalPersistedExpenseCount: 1,
        emptyScope: false,
        metadataFound: true,
        metadataMatchesRequestedBillingPeriod: true,
      },
      totalsByCurrency: {
        totalGroupCount: 1,
        returnedGroupCount: 1,
        truncated: false,
        items: [
          {
            currency: 'NZD',
            expenseCount: 1,
            baseCostAmount: 10,
            amortizedCostAmount: 9,
            amortizedExpenseCount: 1,
          },
        ],
      },
    },
  },
  stats: {
    totalNodes: 4,
    totalEdges: 2,
    unresolvedCount: 1,
    truncated: false,
    buildMs: 12,
  },
} satisfies AwsPortalRelationshipArtifact<typeof accountId, 'portal-run-1'>;

const providerAwareArtifact: PublicRelationshipArtifact = relationshipArtifact;
const highConfidenceScore: 1 = AWS_PORTAL_RELATIONSHIP_CONFIDENCE_SCORES.high;

const legacyRelationshipDeclaration = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType: 'relationships',
  artifactGeneration,
  generatedAt,
  nodes: [{ id: `account|${accountId}`, kind: 'account', data: { accountId } }],
  edges: [],
  unresolved: [],
  stats: { totalNodes: 1, totalEdges: 0, unresolvedCount: 0, buildMs: 0 },
} satisfies AwsPortalRelationshipArtifactV1<typeof accountId, 'portal-run-1'>;

const invalidResourceGroup: AwsPortalRelationshipArtifact = {
  ...relationshipArtifact,
  nodes: [
    {
      ...relationshipArtifact.nodes[0],
      data: {
        ...relationshipArtifact.nodes[0].data,
        // @ts-expect-error AWS relationship nodes never carry Azure resource groups.
        resourceGroup: 'azure-only',
      },
    },
  ],
};

const invalidProperties: AwsPortalRelationshipArtifact = {
  ...relationshipArtifact,
  nodes: [
    {
      ...relationshipArtifact.nodes[0],
      data: {
        ...relationshipArtifact.nodes[0].data,
        // @ts-expect-error AWS relationship nodes expose closed typed fields.
        properties: { secretAccessKey: 'raw-secret' },
      },
    },
  ],
};

const invalidConfidence: AwsPortalRelationshipArtifact = {
  ...relationshipArtifact,
  edges: [
    {
      ...relationshipArtifact.edges[0],
      // @ts-expect-error AWS confidence remains lossless; use the exported score mapping for UI display.
      confidence: 1,
    },
  ],
};

void [
  relationshipArtifact,
  providerAwareArtifact,
  highConfidenceScore,
  legacyRelationshipDeclaration,
  invalidResourceGroup,
  invalidProperties,
  invalidConfidence,
];
