import type {
  RelationshipGraphIndex,
  RelationshipGraphManifest,
  RelationshipSubgraphSnapshot,
} from './relationships';
import {
  RELATIONSHIP_GRAPH_INDEX_SCHEMA_VERSION,
  RELATIONSHIP_GRAPH_MANIFEST_SCHEMA_VERSION,
} from './relationships';

const manifest: RelationshipGraphManifest = {
  schemaVersion: RELATIONSHIP_GRAPH_MANIFEST_SCHEMA_VERSION,
  subscriptionId: 'sub-123',
  generatedAt: '2026-05-27T00:00:00.000Z',
  snapshotId: 'snapshot-etag-or-hash',
  mode: 'partitioned',
  stats: {
    nodes: 8500,
    edges: 42000,
    unresolvedCount: 3,
    buildMs: 1200,
    snapshotBytes: 52000000,
  },
  thresholds: {
    nodes: 1000,
    edges: 3000,
    snapshotBytes: 10485760,
  },
  entrypoints: {
    full: 'relationships.json',
    index: 'relationships/index.json',
    overview: 'relationships/overview.json',
    resourceGroupTemplate: 'relationships/resource-groups/{resourceGroupKey}.json',
    resourceTemplate: 'relationships/resources/{resourceKey}.json',
    networkTemplate: 'relationships/network/{scopeKey}.json',
  },
  currency: 'NZD',
  currencySymbol: '$',
};

void manifest;

const subgraph: RelationshipSubgraphSnapshot = {
  schemaVersion: 1,
  generatedAt: '2026-05-27T00:00:00.000Z',
  subscriptionId: 'sub-123',
  currency: 'NZD',
  currencySymbol: '$',
  nodes: [
    {
      id: '/subscriptions/sub-123/resourcegroups/rg-app/providers/microsoft.compute/virtualmachines/vm-1',
      kind: 'resource',
      data: {
        resourceGroup: 'rg-app',
        name: 'vm-1',
        type: 'microsoft.compute/virtualmachines',
        location: 'australiaeast',
      },
      cost: {
        spend30d: 42,
        spend30dAmortized: 40,
      },
    },
  ],
  edges: [],
  unresolved: [],
  stats: {
    totalNodes: 1,
    totalEdges: 0,
    unresolvedCount: 0,
    buildMs: 3,
    snapshotBytes: 2048,
  },
  scope: {
    type: 'resource',
    subscriptionId: 'sub-123',
    rootNodeId: '/subscriptions/sub-123/resourcegroups/rg-app/providers/microsoft.compute/virtualmachines/vm-1',
    resourceGroup: 'rg-app',
    viewMode: 'resource-detail',
    maxHops: 1,
  },
  sourceSnapshot: {
    schemaVersion: 1,
    subscriptionId: 'sub-123',
    generatedAt: '2026-05-27T00:00:00.000Z',
    snapshotId: 'snapshot-etag-or-hash',
    path: 'relationships.json',
    stats: {
      nodes: 8500,
      edges: 42000,
      snapshotBytes: 52000000,
    },
  },
  fullGraphStats: {
    nodes: 8500,
    edges: 42000,
    snapshotBytes: 52000000,
  },
  returnedStats: {
    nodes: 1,
    edges: 0,
    omittedNodes: 8499,
    omittedEdges: 42000,
    snapshotBytes: 2048,
  },
  breadcrumbs: [
    {
      id: '/subscriptions/sub-123',
      label: 'Production',
      level: 1,
      subscriptionId: 'sub-123',
    },
  ],
  summaries: [
    {
      id: 'hidden-children:vm-1',
      kind: 'hiddenChildren',
      parentId: '/subscriptions/sub-123/resourcegroups/rg-app/providers/microsoft.compute/virtualmachines/vm-1',
      label: 'Hidden related resources',
      count: 4,
      nextCursor: 'cursor-1',
    },
  ],
};

void subgraph;

const index: RelationshipGraphIndex = {
  schemaVersion: RELATIONSHIP_GRAPH_INDEX_SCHEMA_VERSION,
  subscriptionId: 'sub-123',
  generatedAt: '2026-05-27T00:00:00.000Z',
  snapshotId: 'snapshot-etag-or-hash',
  sourceSnapshot: {
    schemaVersion: 1,
    subscriptionId: 'sub-123',
    generatedAt: '2026-05-27T00:00:00.000Z',
    snapshotId: 'snapshot-etag-or-hash',
    path: 'relationships.json',
    stats: {
      nodes: 8500,
      edges: 42000,
      snapshotBytes: 52000000,
    },
  },
  nodes: [
    {
      id: '/subscriptions/sub-123/resourcegroups/rg-app/providers/microsoft.compute/virtualmachines/vm-1',
      kind: 'resource',
      subscriptionId: 'sub-123',
      resourceGroup: 'rg-app',
      resourceType: 'microsoft.compute/virtualmachines',
      location: 'australiaeast',
      parentIds: ['/subscriptions/sub-123/resourcegroups/rg-app'],
      childIds: [],
      neighborIds: [
        '/subscriptions/sub-123/resourcegroups/rg-app/providers/microsoft.network/networkinterfaces/nic-1',
      ],
      subgraphs: {
        resource: 'relationships/resources/vm-1.json',
      },
    },
  ],
  scopes: [
    {
      id: 'overview:sub-123',
      type: 'overview',
      path: 'relationships/overview.json',
      title: 'Subscription overview',
      stats: {
        nodes: 50,
        edges: 80,
        omittedNodes: 8450,
        omittedEdges: 41920,
      },
    },
  ],
};

void index;

const invalidManifestMode: RelationshipGraphManifest = {
  ...manifest,
  // @ts-expect-error relationship graph serving mode is a closed vocabulary.
  mode: 'split',
};

const invalidSubgraphScopeType: RelationshipSubgraphSnapshot = {
  ...subgraph,
  scope: {
    ...subgraph.scope,
    // @ts-expect-error subgraph scope type is a closed vocabulary.
    type: 'tenant',
  },
};

const invalidIndexNodeKind: RelationshipGraphIndex = {
  ...index,
  nodes: [
    {
      ...index.nodes[0],
      // @ts-expect-error index node kind uses the relationship snapshot node vocabulary.
      kind: 'tag',
    },
  ],
};

void invalidManifestMode;
void invalidSubgraphScopeType;
void invalidIndexNodeKind;
