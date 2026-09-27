import assert from 'node:assert/strict';

import { RESOURCE_GRAPH_LOGICAL_NAME, RESOURCE_GRAPH_SCHEMA_VERSION, validateResourceGraphArtifact } from '../dist/common/index.js';
import { validateAwsResourceGraphArtifact } from '../dist/aws/index.js';

const accountId = '123456789012';
const region = 'ap-southeast-2';
const generatedAt = '2026-09-28T06:00:00.000Z';
const arn = (service, resource, arnRegion = region, arnAccount = accountId) => `arn:aws:${service}:${arnRegion}:${arnAccount}:${resource}`;
const evidence = (sourceFamily, method = 'persisted-inventory') => [{ method, sourceFamily }];
const contains = (id, from, to, relationshipType, sourceFamily = 'graph-scope') => ({
  id,
  from,
  to,
  kind: 'contains',
  relationshipTypes: [relationshipType],
  confidence: 'high',
  evidence: evidence(sourceFamily, sourceFamily === 'graph-scope' ? 'request-scope' : 'persisted-inventory'),
});

const baseArtifact = {
  schemaVersion: RESOURCE_GRAPH_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactGeneration: { runId: 'portal-run-1', generatedAt },
  generatedAt,
  scope: { regions: [region, 'global'] },
  currency: 'NZD',
  currencySymbol: '$',
  nodes: [
    { id: 'scope', kind: 'scope', name: accountId, displayName: 'Production' },
    { id: 'region', kind: 'region', region, name: region },
    { id: 'region-global', kind: 'region', region: 'global', name: 'Global' },
    { id: 'zone-a', kind: 'zone', region, name: 'ap-southeast-2a' },
    {
      id: 'vpc',
      kind: 'resource',
      family: 'vpc',
      resourceType: 'AWS::EC2::VPC',
      region,
      name: 'vpc-123',
      nativeId: arn('ec2', 'vpc/vpc-123'),
      role: 'network-baseline',
      attributes: { cidrBlock: '10.0.0.0/16', isDefault: false, cidrBlockAssociations: [{ associationId: 'a-1', cidrBlock: '10.0.0.0/16' }] },
    },
    {
      id: 'instance',
      kind: 'resource',
      family: 'ec2-instance',
      resourceType: 'AWS::EC2::Instance',
      region,
      name: 'web-1',
      nativeId: arn('ec2', 'instance/i-123'),
      role: 'workload',
      tags: { Name: 'web-1', Empty: '' },
      attributes: {
        instanceType: 't3.micro',
        availabilityZone: 'ap-southeast-2a',
        iamInstanceProfileArn: arn('iam', 'instance-profile/web', ''),
        roleArn: arn('iam', 'role/web', ''),
        managedPolicyArn: 'arn:aws:iam::aws:policy/ReadOnlyAccess',
      },
      costs: { spend30d: 12.5, spend30dAmortized: 11 },
    },
    // A family the package has never heard of: no package change is needed to publish it.
    {
      id: 'agent',
      kind: 'resource',
      family: 'bedrock-agent',
      resourceType: 'AWS::Bedrock::Agent',
      region,
      name: 'support-agent',
      nativeId: arn('bedrock', 'agent/AGENT1'),
      attributes: { agentStatus: 'PREPARED', actionGroupNames: ['lookup'], knowledgeBases: [{ knowledgeBaseId: 'KB1', enabled: true }] },
    },
    {
      id: 'role',
      kind: 'resource',
      family: 'iam-role',
      resourceType: 'AWS::IAM::Role',
      region: 'global',
      name: 'web',
      nativeId: arn('iam', 'role/web', ''),
    },
    { id: 'bucket', kind: 'resource', family: 's3-bucket', resourceType: 'AWS::S3::Bucket', region, name: 'assets', nativeId: 'arn:aws:s3:::assets' },
    { id: 'az-synthetic', kind: 'synthetic', syntheticType: 'db-subnet-group', region, name: 'default-db-subnets' },
  ],
  edges: [
    contains('e-region', 'region', 'scope', 'account-region'),
    contains('e-region-global', 'region-global', 'scope', 'account-region'),
    contains('e-zone', 'zone-a', 'region', 'region-zone'),
    contains('e-vpc', 'vpc', 'region', 'region-resource', 'vpc'),
    contains('e-instance', 'instance', 'zone-a', 'zone-placement', 'ec2-instance'),
    contains('e-agent', 'agent', 'region', 'region-resource', 'bedrock-agent'),
    contains('e-role', 'role', 'region-global', 'region-resource', 'iam-role'),
    contains('e-bucket', 'bucket', 'region', 'region-resource', 's3-bucket'),
    contains('e-synthetic', 'az-synthetic', 'region', 'region-topology'),
    {
      id: 'd-instance-vpc',
      from: 'instance',
      to: 'vpc',
      kind: 'depends_on',
      relationshipTypes: ['vpc-membership'],
      confidence: 'high',
      evidence: [{ method: 'field-reference', sourceFamily: 'ec2-instance', field: 'vpcId', matchedValue: 'vpc-123' }],
    },
    {
      id: 'd-agent-role',
      from: 'agent',
      to: 'role',
      kind: 'depends_on',
      relationshipTypes: ['agent-execution-role'],
      confidence: 'medium',
      evidence: evidence('bedrock-agent', 'field-reference'),
    },
  ],
  unresolved: [
    {
      sourceNodeId: 'instance',
      relationshipType: 'security-group-association',
      sourceFamily: 'ec2-instance',
      field: 'securityGroupIds',
      matchedValue: 'sg-missing',
      expectedTargetFamily: 'security-group',
    },
  ],
  coverage: {
    families: [
      { family: 'vpc', regions: [region], status: 'available', lastSuccessfulRefreshAt: generatedAt, emptyScope: false },
      { family: 'ec2-instance', regions: [region], status: 'available', lastSuccessfulRefreshAt: generatedAt, emptyScope: false },
      { family: 'bedrock-agent', regions: [region], status: 'available', lastSuccessfulRefreshAt: generatedAt, emptyScope: false },
      { family: 'iam-role', regions: ['global'], status: 'available', lastSuccessfulRefreshAt: generatedAt, emptyScope: false },
      { family: 's3-bucket', regions: [region], status: 'available', lastSuccessfulRefreshAt: generatedAt, emptyScope: false },
      { family: 'nat-gateway', regions: [region], status: 'incomplete', reason: 'permission-denied' },
      { family: 'efs-file-system', regions: [region], status: 'available', lastSuccessfulRefreshAt: generatedAt, emptyScope: true },
    ],
  },
  stats: { totalNodes: 10, totalEdges: 11, unresolvedCount: 1, truncated: false, buildMs: 12, snapshotBytes: 4096 },
};

assert.equal(RESOURCE_GRAPH_LOGICAL_NAME, 'relationships.json.gz');
assert.equal(validateAwsResourceGraphArtifact(baseArtifact), baseArtifact);
assert.equal(validateAwsResourceGraphArtifact(structuredClone(baseArtifact)).nodes.length, 10);

const reject = (label, mutate, pattern) => {
  const value = structuredClone(baseArtifact);
  mutate(value);
  assert.throws(() => validateAwsResourceGraphArtifact(value), pattern, label);
};
const node = (value, id) => value.nodes.find(entry => entry.id === id);

// Envelope and structure.
reject('schema version', value => (value.schemaVersion = 2), /schemaVersion must match/);
reject('provider', value => (value.provider = 'azure'), /provider must match/);
reject('account format', value => (value.accountId = '1234'), /account id/);
reject('undeclared top-level field', value => (value.relationshipSchemaVersion = 2), /undeclared fields: relationshipSchemaVersion/);
reject('body newer than generation', value => (value.generatedAt = '2026-09-28T07:00:00.000Z'), /must not be newer/);
reject('region format', value => (value.scope.regions[0] = 'Sydney'), /valid provider Region/);
reject('duplicate node id', value => value.nodes.push({ ...value.nodes[1] }), /node ids must be unique/);
reject('two scope nodes', value => value.nodes.push({ id: 'scope-2', kind: 'scope', name: 'x' }), /exactly one scope node/);
reject(
  'missing Region node',
  value => (value.nodes = value.nodes.filter(entry => entry.id !== 'region-global')),
  /Region nodes must exactly match|missing node/
);
reject('Region outside scope', value => (node(value, 'bucket').region = 'us-east-1'), /outside artifact scope/);
reject('resource without family', value => delete node(value, 'bucket').family, /family must be a kebab-case identifier/);
reject('kind-specific field', value => (node(value, 'scope').family = 'vpc'), /scope nodes must not carry: family/);
reject('synthetic without type', value => delete node(value, 'az-synthetic').syntheticType, /syntheticType must be a kebab-case identifier/);
reject('Azure resource group', value => (node(value, 'vpc').resourceGroup = 'rg'), /undeclared fields: resourceGroup/);
reject('costs without currency', value => delete value.currency, /currency is required/);
reject('non-numeric cost', value => (node(value, 'instance').costs.spend30d = '12'), /spend30d must be a finite number/);

// Identifier and attribute formats.
reject('family not kebab', value => (node(value, 'agent').family = 'BedrockAgent'), /family must be a kebab-case identifier/);
reject('resource type format', value => (node(value, 'agent').resourceType = 'bedrock-agent'), /valid provider resource type/);
reject('attribute key case', value => (node(value, 'agent').attributes.AgentStatus = 'x'), /key must be camelCase/);
reject(
  'nested attribute object',
  value => (node(value, 'agent').attributes.config = { nested: { deep: 1 } }),
  /scalar array, or an array of flat records/
);
reject(
  'record attribute nesting',
  value => (node(value, 'agent').attributes.knowledgeBases = [{ nested: { deep: 1 } }]),
  /must be a string, finite number, or boolean/
);
reject('non-finite attribute', value => (node(value, 'agent').attributes.size = Number.NaN), /scalar/);
reject('relationship type format', value => (value.edges[0].relationshipTypes = ['Account_Region']), /kebab-case identifier/);
reject('empty relationship types', value => (value.edges[0].relationshipTypes = []), /non-empty array/);
reject('empty evidence', value => (value.edges[0].evidence = []), /non-empty array/);
reject('evidence method', value => (value.edges[0].evidence[0].method = 'guess'), /method is not declared/);

// ARN scope and Availability Zone rules.
reject(
  'nativeId foreign account',
  value => (node(value, 'agent').nativeId = arn('bedrock', 'agent/AGENT1', region, '999988887777')),
  /ARN account must match/
);
reject('nativeId foreign Region', value => (node(value, 'agent').nativeId = arn('bedrock', 'agent/AGENT1', 'us-east-1')), /ARN Region must match/);
reject('nativeId AWS-owned', value => (node(value, 'role').nativeId = 'arn:aws:iam::aws:policy/ReadOnlyAccess'), /ARN account must match/);
reject('malformed nativeId ARN', value => (node(value, 'agent').nativeId = 'arn:aws:bedrock'), /canonical AWS ARN/);
reject(
  'attribute ARN foreign account',
  value => (node(value, 'instance').attributes.iamInstanceProfileArn = arn('iam', 'instance-profile/web', '', '999988887777')),
  /ARN account must match/
);
reject(
  'attribute ARN foreign Region',
  value => (node(value, 'agent').attributes.aliasArn = arn('bedrock', 'agent-alias/A1', 'us-east-1')),
  /ARN Region must match/
);
reject('attribute ARN not a string', value => (node(value, 'agent').attributes.aliasArn = ['arn:aws:bedrock']), /must be an ARN string/);
reject('attribute zone outside Region', value => (node(value, 'instance').attributes.availabilityZone = 'us-east-1a'), /belong to its node Region/);
reject(
  'attribute zones outside Region',
  value => (node(value, 'agent').attributes.availabilityZones = ['ap-southeast-2a', 'us-east-1b']),
  /availabilityZones\[1\] must belong/
);
reject('zone node outside Region', value => (node(value, 'zone-a').name = 'us-east-1a'), /belong to its node Region/);

// Containment direction and dependencies.
reject(
  'upward containment',
  value => (value.edges[3] = contains('e-vpc', 'region', 'vpc', 'region-resource')),
  /cannot be contained by resource nodes/
);
reject('two parents', value => value.edges.push(contains('e-vpc-2', 'vpc', 'zone-a', 'zone-placement')), /exactly 1 contains parent edge/);
reject('orphan resource', value => (value.edges = value.edges.filter(edge => edge.id !== 'e-bucket')), /bucket must have exactly 1 contains parent/);
reject('cross-Region containment', value => (value.edges[6] = contains('e-role', 'role', 'region', 'region-resource')), /must not cross Regions/);
reject('dependency on a Region', value => (value.edges[9].to = 'region'), /depends_on edges must connect/);
reject('missing endpoint', value => (value.edges[9].to = 'missing'), /missing node/);
reject('self edge', value => (value.edges[9].to = 'instance'), /self edge/);

// Unresolved references.
reject('unresolved missing node', value => (value.unresolved[0].sourceNodeId = 'missing'), /missing node/);
reject('unresolved family mismatch', value => (value.unresolved[0].sourceFamily = 'vpc'), /must match its source node family/);

// Self-closing coverage.
reject(
  'family missing from coverage',
  value => (value.coverage.families = value.coverage.families.filter(entry => entry.family !== 'bedrock-agent')),
  /must declare family bedrock-agent/
);
reject('duplicate coverage family', value => value.coverage.families.push({ ...value.coverage.families[0] }), /must not contain duplicates/);
reject('coverage Region missing node Region', value => (value.coverage.families[3].regions = [region]), /must include Region global/);
reject('coverage Region outside scope', value => (value.coverage.families[0].regions = ['us-east-1']), /within artifact scope Regions/);
reject('emptyScope with nodes', value => (value.coverage.families[0].emptyScope = true), /claims an empty scope/);
reject('incomplete reason', value => (value.coverage.families[5].reason = 'source-refresh-incomplete'), /reason is not declared/);
reject(
  'incomplete with refresh evidence',
  value => (value.coverage.families[5].lastSuccessfulRefreshAt = generatedAt),
  /incomplete coverage cannot claim/
);
reject('refresh after generation', value => (value.coverage.families[0].lastSuccessfulRefreshAt = '2026-09-29T00:00:00.000Z'), /must not be newer/);

// Stats and truncation.
reject('node count', value => (value.stats.totalNodes = 9), /totalNodes must match/);
reject('edge count', value => (value.stats.totalEdges = 1), /totalEdges must match/);
reject('unresolved count', value => (value.stats.unresolvedCount = 0), /unresolvedCount must match/);
reject(
  'truncation without flag',
  value => (value.stats.truncation = { reason: 'snapshot-size-limit', edgesDroppedCount: 1, unresolvedDroppedCount: 0, tagsRemovedFromNodeCount: 0 }),
  /only allowed when truncated/
);
reject('truncated without detail', value => (value.stats.truncated = true), /truncation must be a JSON object/);
reject(
  'truncated with no omissions',
  value => {
    value.stats.truncated = true;
    value.stats.truncation = { reason: 'snapshot-size-limit', edgesDroppedCount: 0, unresolvedDroppedCount: 0, tagsRemovedFromNodeCount: 0 };
  },
  /at least one omitted item/
);
const truncated = structuredClone(baseArtifact);
truncated.stats.truncated = true;
truncated.stats.truncation = { reason: 'snapshot-size-limit', edgesDroppedCount: 3, unresolvedDroppedCount: 0, tagsRemovedFromNodeCount: 0 };
assert.equal(validateAwsResourceGraphArtifact(truncated), truncated);

// Public-boundary key guard: envelope and node fields reject setup and credential keys; provider attributes reject only credentials.
reject('envelope external id', value => (value.externalId = 'setup'), /undeclared fields: externalId/);
reject('attribute credential', value => (node(value, 'agent').attributes.secretAccessKey = 'raw'), /secretAccessKey is not allowed/);
reject('tag storage path', value => (node(value, 'vpc').tags = { blobPath: 'x' }), /blobPath is not allowed/);
reject('evidence etag', value => (value.edges[0].evidence[0].etag = 'x'), /undeclared fields: etag/);
reject('node storage path', value => (node(value, 'scope').sourceUri = 'x'), /undeclared fields: sourceUri/);
// Provider-native attributes may use names such as an IAM role `path`; only credential keys are rejected there.
const nativeAttributes = structuredClone(baseArtifact);
node(nativeAttributes, 'role').attributes = { path: '/service-role/', roleArn: arn('iam', 'role/web', '') };
assert.equal(validateAwsResourceGraphArtifact(nativeAttributes), nativeAttributes);

// The generic validator accepts any provider's format rules; with none it checks structure alone.
const neutral = structuredClone(baseArtifact);
neutral.provider = 'azure';
neutral.accountId = 'subscription-1';
node(neutral, 'agent').resourceType = 'Microsoft.Web/sites';
assert.equal(validateResourceGraphArtifact(neutral, { provider: 'azure' }), neutral);
assert.throws(() => validateResourceGraphArtifact(neutral, { provider: 'aws' }), /provider must match/);

// Scale: many families and nodes validate without a family list.
const large = structuredClone(baseArtifact);
for (let index = 0; index < 2_000; index += 1) {
  const family = `custom-family-${index % 50}`;
  large.nodes.push({ id: `n-${index}`, kind: 'resource', family, resourceType: 'AWS::Custom::Thing', region, name: `n-${index}` });
  large.edges.push(contains(`c-${index}`, `n-${index}`, 'region', 'region-resource', family));
}
for (let index = 0; index < 50; index += 1)
  large.coverage.families.push({
    family: `custom-family-${index}`,
    regions: [region],
    status: 'available',
    lastSuccessfulRefreshAt: generatedAt,
    emptyScope: false,
  });
large.stats.totalNodes = large.nodes.length;
large.stats.totalEdges = large.edges.length;
assert.equal(validateAwsResourceGraphArtifact(large).nodes.length, 2_010);

process.stdout.write('Resource graph generic and AWS format checks passed.\n');
