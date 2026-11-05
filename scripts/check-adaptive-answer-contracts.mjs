import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const commonjs = require('../dist/index.js');
const presentation = () => ({ schemaVersion: 1, kind: 'visual', artifactIds: ['artifact-1'] });
const grounding = () => ({
  status: 'verified',
  method: 'server-rendered-artifacts',
  totalClaimCount: 0,
  verifiedClaimCount: 0,
  claims: [],
  artifactIds: ['artifact-1'],
  figures: [{ figureId: 'figure-1', kind: 'percentage', text: '70%', status: 'verified', citationIds: ['citation-1'] }],
});

test('visual completion has a bounded explicit artifact set', () => {
  assert.equal(typeof commonjs.isAIChatAnswerPresentationV1, 'function');
  assert.equal(commonjs.isAIChatAnswerPresentationV1(presentation()), true);
  for (const kind of ['brief', 'full']) assert.equal(commonjs.isAIChatAnswerPresentationV1({ ...presentation(), kind, artifactIds: [] }), true);
});
test('CommonJS explicitly recognizes verified artifact/text grounding', () => assert.equal(commonjs.isAIChatGroundingSummary(grounding()), true));
test('ESM exports agree with CommonJS for presentation and artifact grounding', async () => {
  const esm = await import('../dist/esm/entries/root.js');
  assert.equal(esm.isAIChatAnswerPresentationV1(presentation()), true);
  assert.equal(esm.isAIChatGroundingSummary(grounding()), true);
});

for (const [name, mutate] of [
  [
    'unknown version',
    p => {
      p.schemaVersion = 2;
    },
  ],
  [
    'unknown response kind',
    p => {
      p.kind = 'instant';
    },
  ],
  [
    'empty visual',
    p => {
      p.artifactIds = [];
    },
  ],
  [
    'too many visual artifacts',
    p => {
      p.artifactIds = ['a', 'b', 'c', 'd'];
    },
  ],
  [
    'duplicate artifact IDs',
    p => {
      p.artifactIds = ['artifact-1', 'artifact-1'];
    },
  ],
  [
    'invalid artifact ID',
    p => {
      p.artifactIds = ['  '];
    },
  ],
  [
    'oversized ID',
    p => {
      p.artifactIds = ['a'.repeat(129)];
    },
  ],
  [
    'unrecognized metadata',
    p => {
      p.confidence = 0.99;
    },
  ],
])
  test(`presentation rejects ${name}`, () => {
    const candidate = presentation();
    mutate(candidate);
    assert.equal(commonjs.isAIChatAnswerPresentationV1(candidate), false);
  });

for (const [name, mutate] of [
  [
    'absent artifact bindings',
    g => {
      delete g.artifactIds;
    },
  ],
  [
    'empty artifact bindings',
    g => {
      g.artifactIds = [];
    },
  ],
  [
    'duplicate artifact bindings',
    g => {
      g.artifactIds.push('artifact-1');
    },
  ],
  [
    'oversized artifact set',
    g => {
      g.artifactIds = ['a', 'b', 'c', 'd'];
    },
  ],
  [
    'missing figure citations',
    g => {
      g.figures[0].citationIds = [];
    },
  ],
  [
    'unverified figure',
    g => {
      g.figures[0] = { ...g.figures[0], status: 'unverified', citationIds: [], reasonCode: 'grounding.figure-unreferenced' };
    },
  ],
  [
    'fabricated model claim',
    g => {
      g.claims = [{ claimId: 'claim-1', status: 'verified', citationIds: ['citation-1'] }];
      g.totalClaimCount = 1;
      g.verifiedClaimCount = 1;
    },
  ],
  [
    'not-required bypass',
    g => {
      g.status = 'not-required';
      g.reasonCode = 'grounding.not-required';
    },
  ],
  [
    'partial verification',
    g => {
      g.status = 'partial';
    },
  ],
  [
    'legacy method carrying artifact bindings',
    g => {
      g.method = 'server-rendered-figures';
    },
  ],
])
  test(`artifact grounding rejects ${name}`, () => {
    const candidate = grounding();
    mutate(candidate);
    assert.equal(commonjs.isAIChatGroundingSummary(candidate), false);
  });

test('artifact method can verify a snapshot without numeric figures', () =>
  assert.equal(commonjs.isAIChatGroundingSummary({ ...grounding(), figures: [] }), true));
test('legacy grounding summaries retain their original validation', () => {
  const legacy = { ...grounding(), method: 'server-rendered-figures' };
  delete legacy.artifactIds;
  assert.equal(commonjs.isAIChatGroundingSummary(legacy), true);
  assert.equal(
    commonjs.isAIChatGroundingSummary({
      status: 'not-required',
      method: 'deterministic-citation-and-value',
      claims: [],
      totalClaimCount: 0,
      verifiedClaimCount: 0,
      reasonCode: 'grounding.not-required',
    }),
    true
  );
});
