import {
  RESOURCE_GRAPH_SCHEMA_VERSION,
  type AwsResourceGraphArtifact,
  type PublicRelationshipArtifact,
  type RelationshipSnapshot,
  type ResourceGraphArtifact,
  type ResourceGraphNode,
} from '../index';

const artifactGeneration = { runId: 'portal-run-1', generatedAt: '2026-09-28T00:05:00.000Z' } as const;

// A family the package has never heard of type-checks without any package change.
const agentNode = {
  id: 'resource:agent',
  kind: 'resource',
  family: 'bedrock-agent',
  resourceType: 'AWS::Bedrock::Agent',
  region: 'ap-southeast-2',
  name: 'support-agent',
  nativeId: 'arn:aws:bedrock:ap-southeast-2:123456789012:agent/AGENT1',
  role: 'workload',
  attributes: {
    agentStatus: 'PREPARED',
    idleSessionTtlInSeconds: 600,
    guardrailEnabled: false,
    actionGroupNames: ['lookup', 'escalate'],
    knowledgeBases: [{ knowledgeBaseId: 'KB1', state: 'ENABLED' }],
  },
} satisfies ResourceGraphNode;

const graph = {
  schemaVersion: RESOURCE_GRAPH_SCHEMA_VERSION,
  provider: 'aws',
  accountId: '123456789012',
  artifactGeneration,
  generatedAt: artifactGeneration.generatedAt,
  scope: { regions: ['ap-southeast-2'] },
  nodes: [
    { id: 'scope', kind: 'scope', name: '123456789012' },
    { id: 'region:ap-southeast-2', kind: 'region', region: 'ap-southeast-2', name: 'ap-southeast-2' },
    agentNode,
  ],
  edges: [
    {
      id: 'edge:region',
      from: 'region:ap-southeast-2',
      to: 'scope',
      kind: 'contains',
      relationshipTypes: ['account-region'],
      confidence: 'high',
      evidence: [{ method: 'request-scope', sourceFamily: 'graph-scope' }],
    },
    {
      id: 'edge:agent',
      from: 'resource:agent',
      to: 'region:ap-southeast-2',
      kind: 'contains',
      relationshipTypes: ['region-resource'],
      confidence: 'high',
      evidence: [{ method: 'persisted-inventory', sourceFamily: 'bedrock-agent' }],
    },
  ],
  unresolved: [],
  coverage: {
    families: [
      {
        family: 'bedrock-agent',
        regions: ['ap-southeast-2'],
        status: 'available',
        lastSuccessfulRefreshAt: artifactGeneration.generatedAt,
        emptyScope: false,
      },
    ],
  },
  stats: { totalNodes: 3, totalEdges: 2, unresolvedCount: 0, truncated: false },
} satisfies AwsResourceGraphArtifact<'123456789012', 'portal-run-1'>;

const neutral: ResourceGraphArtifact = graph;
const publicArtifact: PublicRelationshipArtifact = graph;
const azureSnapshot: PublicRelationshipArtifact = {
  schemaVersion: 1,
  generatedAt: artifactGeneration.generatedAt,
  subscriptionId: 'subscription-1',
  nodes: [],
  edges: [],
  unresolved: [],
  stats: { totalNodes: 0, totalEdges: 0, unresolvedCount: 0, buildMs: 0 },
} satisfies RelationshipSnapshot;

const invalidSecret: AwsResourceGraphArtifact = {
  ...graph,
  // @ts-expect-error AWS resource graphs cannot expose credential material.
  secretAccessKey: 'raw-secret',
};

const invalidNestedAttribute: ResourceGraphNode = {
  ...agentNode,
  attributes: {
    // @ts-expect-error Attribute values are scalars, scalar arrays, or arrays of flat records.
    nested: { deeper: { value: 1 } },
  },
};

const invalidEvidence: AwsResourceGraphArtifact = {
  ...graph,
  edges: [
    {
      ...graph.edges[0],
      // @ts-expect-error Edges carry at least one relationship type.
      relationshipTypes: [],
    },
  ],
};

void [neutral, publicArtifact, azureSnapshot, invalidSecret, invalidNestedAttribute, invalidEvidence];
