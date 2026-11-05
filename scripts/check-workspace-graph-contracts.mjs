import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const contracts = require('../dist/index.js');
const { isAIChatWorkspaceGraphPayload: valid, AI_CHAT_WORKSPACE_GRAPH_LIMITS: limits } = contracts;
const fixture = JSON.parse(readFileSync(new URL('../fixtures/ai-chat/workspace-graph.json', import.meta.url), 'utf8'));
const graph = () => structuredClone(fixture);

test('graph capability is snapshot-only and excluded from live recipes', () => {
  assert.deepEqual(
    contracts.AI_CHAT_WORKSPACE_CAPABILITIES.find(c => c.viewId === 'cloud.relationships.graph'),
    {
      viewId: 'cloud.relationships.graph',
      version: 1,
      artifactKind: 'graph',
      presentations: ['graph'],
      dataModes: ['snapshot'],
    }
  );
  assert.ok(contracts.AI_CHAT_WORKSPACE_GENERIC_VIEW_IDS.includes('cloud.relationships.graph'));
  assert.deepEqual(limits, { nodes: 24, edges: 36, depth: 2 });
});
test('golden relationship snapshot accepts node-then-edge opaque follow-ups', () => assert.equal(valid(graph()), true));
test('ESM and CommonJS package exports validate the same snapshot', async () => {
  const esm = await import('../dist/esm/entries/root.js');
  assert.equal(esm.isAIChatWorkspaceGraphPayload(graph()), true);
  assert.deepEqual(esm.AI_CHAT_WORKSPACE_GRAPH_LIMITS, limits);
});
test('root-only snapshot can describe missing evidence without follow-ups', () => {
  const candidate = graph();
  candidate.nodes = [candidate.nodes[0]];
  candidate.edges = [];
  candidate.unresolvedReferenceCount = 2;
  delete candidate.drillDown;
  assert.equal(valid(candidate), true);
});
test('dependents preserve actual edge direction rather than reversing topology', () => {
  const candidate = graph();
  candidate.direction = 'dependents';
  [candidate.edges[0].source, candidate.edges[0].target] = [candidate.edges[0].target, candidate.edges[0].source];
  assert.equal(valid(candidate), true);
});
test('two-hop cyclic topology is valid with shortest-path depths', () => {
  const candidate = graph();
  candidate.maxDepth = 2;
  candidate.nodes.push({ id: 'n2', label: 'database', depth: 2 });
  candidate.edges.push(
    { id: 'e1', source: 'n1', target: 'n2', label: 'Uses', kind: 'depends_on', evidenceKind: 'inferred' },
    { id: 'e2', source: 'n2', target: 'n0', label: 'References', kind: 'depends_on', evidenceKind: 'unknown' }
  );
  delete candidate.drillDown;
  assert.equal(valid(candidate), true);
});
test('non-drillable elements use empty key and prompt together', () => {
  const candidate = graph();
  candidate.drillDown.elementKeys[1] = '';
  candidate.drillDown.prompts[1] = '';
  assert.equal(valid(candidate), true);
});

const invalidCases = [
  [
    'missing root',
    g => {
      g.rootNodeId = 'missing';
    },
  ],
  [
    'duplicate nodes',
    g => {
      g.nodes.push(g.nodes[1]);
    },
  ],
  [
    'duplicate edges',
    g => {
      g.edges.push(g.edges[0]);
    },
  ],
  [
    'node/edge identity collision',
    g => {
      g.edges[0].id = 'n0';
    },
  ],
  [
    'dangling endpoint',
    g => {
      g.edges[0].target = 'missing';
    },
  ],
  [
    'self edge',
    g => {
      g.edges[0].target = 'n0';
    },
  ],
  [
    'disconnected node',
    g => {
      g.nodes.push({ id: 'n2', label: 'hidden', depth: 1 });
    },
  ],
  [
    'wrong direction reachability',
    g => {
      g.direction = 'dependents';
    },
  ],
  [
    'wrong declared depth',
    g => {
      g.nodes[1].depth = 2;
      g.maxDepth = 2;
    },
  ],
  [
    'second depth-zero node',
    g => {
      g.nodes[1].depth = 0;
    },
  ],
  [
    'unbounded depth',
    g => {
      g.maxDepth = 3;
    },
  ],
  [
    'node cap',
    g => {
      g.nodes = Array.from({ length: 25 }, (_, i) => ({ id: `n${i}`, label: 'resource', depth: i === 0 ? 0 : 1 }));
    },
  ],
  [
    'edge cap',
    g => {
      g.edges = Array.from({ length: 37 }, (_, i) => ({ ...g.edges[0], id: `e${i}` }));
    },
  ],
  [
    'markup label',
    g => {
      g.nodes[0].label = '<script>bad</script>';
    },
  ],
  [
    'control character',
    g => {
      g.edges[0].label = 'Uses\nresource';
    },
  ],
  [
    'oversized label',
    g => {
      g.nodes[0].label = 'a'.repeat(121);
    },
  ],
  [
    'executable properties',
    g => {
      g.nodes[0].style = { color: 'red' };
    },
  ],
  [
    'endpoint in payload',
    g => {
      g.endpoint = '/api/other';
    },
  ],
  [
    'negative omissions',
    g => {
      g.omittedNodeCount = -1;
    },
  ],
  [
    'non-finite count',
    g => {
      g.omittedEdgeCount = Infinity;
    },
  ],
  [
    'fractional count',
    g => {
      g.unresolvedReferenceCount = 0.5;
    },
  ],
  [
    'unsafe count',
    g => {
      g.unresolvedReferenceCount = Number.MAX_SAFE_INTEGER + 1;
    },
  ],
  [
    'observed-traffic claim',
    g => {
      g.edges[0].evidenceKind = 'observedTraffic';
    },
  ],
  [
    'invalid edge kind',
    g => {
      g.edges[0].kind = 'connects';
    },
  ],
  [
    'URL instead of link key',
    g => {
      g.nodes[0].linkKey = 'https://example.com';
    },
  ],
  [
    'drill-down length mismatch',
    g => {
      g.drillDown.elementKeys.pop();
    },
  ],
  [
    'duplicate opaque keys',
    g => {
      g.drillDown.elementKeys[1] = 'e0';
    },
  ],
  [
    'unregistered action',
    g => {
      g.drillDown.drillDownId = 'execute@1';
    },
  ],
  [
    'template injection',
    g => {
      g.drillDown.prompts[0] = 'Explain {resourceId}';
    },
  ],
  [
    'unpaired empty key',
    g => {
      g.drillDown.elementKeys[0] = '';
    },
  ],
];
for (const [name, mutate] of invalidCases) {
  test(`rejects ${name}`, () => {
    const candidate = graph();
    mutate(candidate);
    assert.equal(valid(candidate), false);
  });
}
test('rejects non-object wire values without throwing', () => {
  for (const candidate of [null, undefined, [], 42, 'graph']) assert.equal(valid(candidate), false);
});
