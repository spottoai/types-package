import assert from 'node:assert/strict';

import {
  AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES,
  AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME,
  AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION,
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  validateAwsPortalRelationshipArtifact,
} from '../dist/aws/index.js';

const accountId = '123456789012';
const resourceRegion = 'ap-southeast-2';
const generatedAt = '2026-08-11T06:00:00.000Z';
const artifactGeneration = { runId: 'portal-run-1', generatedAt };
const accountNodeId = `account|${accountId}`;
const regionNodeId = `region|${accountId}|${resourceRegion}`;
const resourceNodeId = 'aws:ec2:instance:i-123';
const syntheticNodeId = `synthetic|${accountId}|${resourceRegion}|vpc|vpc-123`;

const artifact = {
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
      id: accountNodeId,
      kind: 'account',
      data: { provider: 'aws', accountId, displayName: 'Production' },
    },
    {
      id: regionNodeId,
      kind: 'region',
      data: { provider: 'aws', accountId, resourceRegion },
    },
    {
      id: resourceNodeId,
      kind: 'resource',
      data: {
        provider: 'aws',
        accountId,
        family: 'ec2-instance',
        resourceRegion,
        stableKey: resourceNodeId,
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
      id: syntheticNodeId,
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
      from: regionNodeId,
      to: accountNodeId,
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
      id: 'resource-to-region',
      from: resourceNodeId,
      to: regionNodeId,
      kind: 'contains',
      relationshipTypes: ['region-resource'],
      confidence: 'high',
      evidence: [
        {
          method: 'persisted-inventory',
          sourceFamily: 'ec2-instance',
          field: 'stableKey',
          matchedValue: resourceNodeId,
        },
      ],
    },
    {
      id: 'synthetic-to-region',
      from: syntheticNodeId,
      to: regionNodeId,
      kind: 'contains',
      relationshipTypes: ['region-topology'],
      confidence: 'high',
      evidence: [
        {
          method: 'field-derived',
          sourceFamily: 'ec2-instance',
          field: 'vpcId',
          matchedValue: 'vpc-123',
        },
      ],
    },
    {
      id: 'resource-to-vpc',
      from: resourceNodeId,
      to: syntheticNodeId,
      kind: 'depends_on',
      relationshipTypes: ['vpc-membership'],
      confidence: 'high',
      evidence: [
        {
          method: 'field-reference',
          sourceFamily: 'ec2-instance',
          field: 'vpcId',
          matchedValue: 'vpc-123',
        },
      ],
    },
  ],
  unresolved: [
    {
      sourceNodeId: resourceNodeId,
      relationshipType: 'subnet-membership',
      sourceFamily: 'ec2-instance',
      field: 'subnetId',
      matchedValue: 'subnet-missing',
      expectedTargetFamily: 'subnet',
    },
  ],
  coverage: {
    families: AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES.map(family =>
      family === 'ec2-instance'
        ? {
            family,
            resourceRegions: [resourceRegion],
            status: 'available',
            lastSuccessfulRefreshAt: generatedAt,
            emptyScope: false,
          }
        : {
            family,
            resourceRegions: [resourceRegion],
            status: 'incomplete',
            reason: 'source-refresh-incomplete',
          }
    ),
  },
  stats: {
    totalNodes: 4,
    totalEdges: 4,
    unresolvedCount: 1,
    truncated: false,
    buildMs: 12,
  },
};

const validated = validateAwsPortalRelationshipArtifact(artifact);
assert.equal(validated.accountId, accountId);
assert.equal(validated.nodes.length, 4);
assert.equal(validated.coverage.families.length, 17);

const scopedArn = (service, resource) => `arn:aws:${service}:${resourceRegion}:${accountId}:${resource}`;
const resourceSamples = {
  'ec2-instance': {
    instanceId: 'i-123',
    instanceArn: scopedArn('ec2', 'instance/i-123'),
    availabilityZone: `${resourceRegion}a`,
  },
  'ebs-volume': {
    volumeId: 'vol-123',
    volumeArn: scopedArn('ec2', 'volume/vol-123'),
    attachments: [{ instanceId: 'i-123', device: '/dev/xvda', deleteOnTermination: true }],
  },
  vpc: {
    vpcId: 'vpc-123',
    vpcArn: scopedArn('ec2', 'vpc/vpc-123'),
    ownerId: accountId,
    cidrBlockAssociations: [{ associationId: 'vpc-cidr-assoc-1', cidrBlock: '10.0.0.0/16' }],
    ipv6CidrBlockAssociations: [],
  },
  subnet: {
    subnetId: 'subnet-123',
    subnetArn: scopedArn('ec2', 'subnet/subnet-123'),
    availabilityZone: `${resourceRegion}a`,
    ipv6CidrBlockAssociations: [],
  },
  'route-table': {
    routeTableId: 'rtb-123',
    routeTableArn: scopedArn('ec2', 'route-table/rtb-123'),
    hasMainAssociation: true,
    associations: [{ associationId: 'rtbassoc-1', main: true }],
  },
  'internet-gateway': {
    internetGatewayId: 'igw-123',
    internetGatewayArn: scopedArn('ec2', 'internet-gateway/igw-123'),
    attachments: [{ vpcId: 'vpc-123', state: 'available' }],
    attachedVpcIds: ['vpc-123'],
  },
  'virtual-private-gateway': {
    virtualPrivateGatewayId: 'vgw-123',
    virtualPrivateGatewayArn: scopedArn('ec2', 'vpn-gateway/vgw-123'),
    attachments: [{ vpcId: 'vpc-123' }],
    attachedVpcIds: ['vpc-123'],
  },
  'network-interface': {
    networkInterfaceId: 'eni-123',
    ownerId: accountId,
    availabilityZone: `${resourceRegion}a`,
  },
  'nat-gateway': {
    natGatewayId: 'nat-123',
    natGatewayArn: scopedArn('ec2', 'natgateway/nat-123'),
    addresses: [{ networkInterfaceId: 'eni-123', privateIp: '10.0.0.4', isPrimary: true }],
  },
  'security-group': {
    groupId: 'sg-123',
    securityGroupArn: scopedArn('ec2', 'security-group/sg-123'),
    groupName: 'web',
    ownerId: accountId,
  },
  'rds-db-cluster': {
    dbClusterResourceId: 'cluster-resource-1',
    dbClusterIdentifier: 'cluster-1',
    dbClusterArn: scopedArn('rds', 'cluster:cluster-1'),
    availabilityZones: [`${resourceRegion}a`],
    dbProxyNames: [],
    dbClusterMemberIdentifiers: ['db-1'],
    dbClusterMembers: [{ dbInstanceIdentifier: 'db-1', isClusterWriter: true, promotionTier: 0 }],
  },
  'rds-db-instance': {
    dbInstanceIdentifier: 'db-1',
    dbiResourceId: 'db-resource-1',
    dbInstanceArn: scopedArn('rds', 'db:db-1'),
    availabilityZone: `${resourceRegion}a`,
  },
  'load-balancer-v2': {
    loadBalancerArn: scopedArn('elasticloadbalancing', 'loadbalancer/app/lb-1/123'),
    loadBalancerName: 'lb-1',
    subnetIds: ['subnet-123'],
    availabilityZoneNames: [`${resourceRegion}a`],
  },
  'classic-load-balancer': {
    loadBalancerName: 'classic-1',
    subnetIds: ['subnet-123'],
    availabilityZoneNames: [`${resourceRegion}a`],
    securityGroupIds: ['sg-123'],
    instanceIds: ['i-123'],
  },
  'elasticache-cache-cluster': {
    cacheClusterId: 'cache-1',
    cacheClusterArn: scopedArn('elasticache', 'cluster:cache-1'),
    preferredAvailabilityZone: `${resourceRegion}a`,
  },
  'elasticache-serverless-cache': {
    serverlessCacheName: 'serverless-1',
    serverlessCacheArn: scopedArn('elasticache', 'serverlesscache:serverless-1'),
    subnetIds: ['subnet-123'],
  },
  'efs-file-system': {
    fileSystemId: 'fs-123',
    fileSystemArn: scopedArn('elasticfilesystem', 'file-system/fs-123'),
    availabilityZoneName: `${resourceRegion}a`,
  },
};

for (const family of AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES) {
  const familyArtifact = structuredClone(artifact);
  familyArtifact.nodes[2].data = {
    provider: 'aws',
    accountId,
    family,
    resourceRegion,
    stableKey: resourceNodeId,
    resourceType: family,
    ...resourceSamples[family],
  };
  familyArtifact.edges[1].evidence[0].sourceFamily = family;
  assert.equal(validateAwsPortalRelationshipArtifact(familyArtifact).nodes[2].data.family, family);
}

const emptyResourceBilling = {
  costProvenance: { costSource: 'billing', costSourceConfidence: 'high' },
  matchedExpenseCount: 0,
  totalsByCurrency: [],
  costViewByCurrency: [],
  commitmentSpend: {
    expenseCountWithCommitmentEvidence: 0,
    expenseCountWithoutCommitmentEvidence: 0,
    totalsByCurrency: [],
    costViewByCurrency: [],
    groupedByAmortizationSource: [],
  },
};
const billingPeriod = { start: '2026-08-01', end: '2026-08-31' };
const costArtifact = structuredClone(artifact);
costArtifact.nodes[2].data.billing = emptyResourceBilling;
costArtifact.costOverlay = {
  source: {
    artifactType: 'resource-collection',
    logicalName: 'resources.json.gz',
    artifactGeneration,
    sha256: 'a'.repeat(64),
    scope: {
      provider: 'aws',
      accountId,
      billing: { source: 'cur', reportName: 'customer-cur', billingPeriod },
      resourceRegions: [resourceRegion],
      metricTimeWindow: { start: '2026-08-01T00:00:00.000Z', end: generatedAt },
    },
  },
  coverage: {
    totalResourceCount: 1,
    billedResourceCount: 1,
    matchedResourceNodeCount: 1,
    unmatchedBillingExpenseCount: 0,
  },
  billing: {
    scope: {
      provider: 'aws',
      source: 'cur',
      scope: 'account',
      accountId,
      reportName: 'customer-cur',
      billingPeriod,
    },
    freshness: { hasSuccessfulImport: false },
    summary: {
      totalPersistedExpenseCount: 0,
      emptyScope: true,
      metadataFound: false,
      metadataMatchesRequestedBillingPeriod: false,
    },
    totalsByCurrency: { totalGroupCount: 0, returnedGroupCount: 0, truncated: false, items: [] },
  },
};
assert.equal(validateAwsPortalRelationshipArtifact(costArtifact).costOverlay.coverage.matchedResourceNodeCount, 1);

const clone = value => structuredClone(value);
const rejects = (value, pattern) => assert.throws(() => validateAwsPortalRelationshipArtifact(value), pattern);

const mixedAccount = clone(artifact);
mixedAccount.nodes[2].data.accountId = '999999999999';
rejects(mixedAccount, /accountId must match its exact binding/);

const foreignRegion = clone(artifact);
foreignRegion.nodes[2].data.resourceRegion = 'us-east-1';
rejects(foreignRegion, /outside artifact scope/);

const unknownKind = clone(artifact);
unknownKind.nodes[3].kind = 'availabilityZone';
rejects(unknownKind, /kind is not declared/);

const arbitraryProperties = clone(artifact);
arbitraryProperties.nodes[2].data.properties = { state: 'running' };
rejects(arbitraryProperties, /undeclared fields/);

const credential = clone(artifact);
credential.nodes[2].data.secretAccessKey = 'raw-secret';
rejects(credential, /undeclared fields|not allowed in a public artifact/);

const unsafeEvidenceMethod = clone(artifact);
unsafeEvidenceMethod.edges[0].evidence[0].method = 'raw-error-message';
rejects(unsafeEvidenceMethod, /method is not declared/);

const danglingEdge = clone(artifact);
danglingEdge.edges[1].to = 'missing-node';
rejects(danglingEdge, /references a missing node/);

const reversedContainment = clone(artifact);
reversedContainment.edges[0].from = accountNodeId;
reversedContainment.edges[0].to = regionNodeId;
rejects(reversedContainment, /must point child to parent/);

const numericConfidence = clone(artifact);
numericConfidence.edges[0].confidence = 1;
rejects(numericConfidence, /confidence must match its exact binding/);

const incompleteCoverage = clone(artifact);
incompleteCoverage.coverage.families.pop();
rejects(incompleteCoverage, /must declare every relationship family/);

const dishonestStats = clone(artifact);
dishonestStats.stats.totalEdges = 99;
rejects(dishonestStats, /totalEdges must match its exact binding/);

const staleSource = clone(artifact);
staleSource.source.generatedAt = '2026-08-11T06:01:00.000Z';
rejects(staleSource, /generatedAt must match its exact binding/);

const foreignArn = clone(artifact);
foreignArn.nodes[2].data.instanceArn = 'arn:aws:ec2:ap-southeast-2:999999999999:instance/i-123';
rejects(foreignArn, /ARN account must match/);

const foreignAvailabilityZone = clone(artifact);
foreignAvailabilityZone.nodes[2].data.availabilityZone = 'us-east-1a';
rejects(foreignAvailabilityZone, /must belong to its resource Region/);

const billingWithoutOverlay = clone(costArtifact);
delete billingWithoutOverlay.costOverlay;
rejects(billingWithoutOverlay, /costOverlay is required/);

const dishonestBillingMatch = clone(costArtifact);
dishonestBillingMatch.costOverlay.coverage.matchedResourceNodeCount = 0;
rejects(dishonestBillingMatch, /matched count must equal resource nodes containing billing/);

const mislabeledStructuralEdge = clone(artifact);
mislabeledStructuralEdge.edges[0].kind = 'depends_on';
rejects(mislabeledStructuralEdge, /structural relationship types require a contains edge/);

const mislabeledDependencyEdge = clone(artifact);
mislabeledDependencyEdge.edges[3].kind = 'contains';
rejects(mislabeledDependencyEdge, /dependency relationship types require a depends_on edge/);

const disconnectedNode = clone(artifact);
disconnectedNode.edges.splice(2, 1);
disconnectedNode.stats.totalEdges -= 1;
rejects(disconnectedNode, /must have exactly 1 structural parent edge/);

const futureRefresh = clone(artifact);
futureRefresh.coverage.families[0].lastSuccessfulRefreshAt = '2026-08-11T06:00:00.500Z';
rejects(futureRefresh, /lastSuccessfulRefreshAt cannot exceed Portal output/);

const truncated = clone(artifact);
truncated.stats.truncated = true;
truncated.stats.truncation = {
  reason: 'snapshot-size-limit',
  edgesDroppedCount: 1,
  unresolvedDroppedCount: 0,
  tagsRemovedFromNodeCount: 0,
};
assert.equal(validateAwsPortalRelationshipArtifact(truncated).stats.truncated, true);

const largeArtifact = clone(artifact);
for (let index = 0; index < 2_500; index += 1) {
  const nodeId = `aws:ec2:instance:i-scale-${index}`;
  largeArtifact.nodes.push({
    id: nodeId,
    kind: 'resource',
    data: {
      provider: 'aws',
      accountId,
      family: 'ec2-instance',
      resourceRegion,
      stableKey: nodeId,
      resourceType: 'ec2-instance',
      instanceId: `i-scale-${index}`,
      instanceArn: scopedArn('ec2', `instance/i-scale-${index}`),
    },
  });
  largeArtifact.edges.push({
    id: `scale-resource-to-region-${index}`,
    from: nodeId,
    to: regionNodeId,
    kind: 'contains',
    relationshipTypes: ['region-resource'],
    confidence: 'high',
    evidence: [{ method: 'persisted-inventory', sourceFamily: 'ec2-instance', field: 'stableKey', matchedValue: nodeId }],
  });
}
largeArtifact.stats.totalNodes = largeArtifact.nodes.length;
largeArtifact.stats.totalEdges = largeArtifact.edges.length;
assert.equal(validateAwsPortalRelationshipArtifact(largeArtifact).nodes.length, 2_504);

process.stdout.write('AWS relationship public artifact round-trip and rejection checks passed.\n');
