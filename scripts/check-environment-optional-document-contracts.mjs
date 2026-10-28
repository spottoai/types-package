import assert from 'node:assert/strict';
import * as environment from '../dist/environment/index.js';
import * as esm from '../dist/esm/environment/index.js';
const scope = { kind: 'azure-tenant', tenantId: 'tenant-1' };
const sourceBinding = { kind: 'azure-tenant-sync', scope, tenantSyncRunId: 'sync-1', completedAt: '2026-10-28T00:00:00.000Z' };
const content = (mediaType = 'text/markdown; charset=utf-8', byteCount = 100) => ({
  mediaType,
  byteCount,
  contentSha256: 'a'.repeat(64),
  approximateTokenCount: Math.ceil(byteCount / 4),
});
const document = {
  documentId: 'future-widget',
  fileName: 'future-widget.md',
  capabilityId: 'future_feature',
  title: 'Future context',
  scope,
  requiredFeatures: ['future_feature'],
  content: content(),
  evidence: [
    {
      evidenceId: 'summary',
      mode: 'immutable',
      title: 'Summary',
      requiredFeatures: [],
      fileName: 'future-widget.evidence.json',
      content: content('application/json'),
    },
  ],
};
const facts = {
  schemaVersion: 1,
  capabilityId: document.capabilityId,
  documentId: document.documentId,
  evidenceId: 'summary',
  scope,
  sourceBinding,
  observedAt: '2026-10-28T00:00:01.000Z',
  coverage: { status: 'partial', reason: 'Observed subset' },
  sections: [
    {
      sectionId: 'summary',
      title: 'Observed facts',
      facts: {
        items: [{ factId: 'count', label: 'Observed count', value: { kind: 'quantity', amount: '-12.5', unit: 'GiB', basis: 'observed' } }],
        totalCount: 1,
        includedCount: 1,
        truncated: false,
      },
    },
  ],
};
for (const e of [environment, esm]) {
  assert.equal(typeof e.isEnvironmentCapabilityDocumentV1, 'function');
  assert.equal(e.isEnvironmentCapabilityDocumentV1(document), true);
  assert.equal(e.isEnvironmentCapabilityDocumentSetV1([document], scope), true);
  assert.equal(e.isEnvironmentCapabilityDocumentSetV1(Array(1), scope), false);
  assert.equal(e.isEnvironmentCapabilityDocumentSetV1([document, document], scope), false);
  assert.equal(e.isEnvironmentCapabilityDocumentSetV1([document], { ...scope, tenantId: 'other' }), false);
  assert.equal(
    e.isEnvironmentCapabilityDocumentSetV1(
      Array.from({ length: 17 }, (_, i) => ({ ...document, documentId: `future-${i}`, fileName: `future-${i}.md`, evidence: [] })),
      scope
    ),
    false
  );
  for (const patch of [
    { documentId: 'catalogue' },
    { documentId: 'evidence' },
    { documentId: 'cost' },
    { fileName: 'projection.json' },
    { fileName: '../escape.md' },
    { requiredFeatures: [] },
    { requiredFeatures: ['different'] },
    { extra: true },
    { content: { ...document.content, byteCount: 8193 } },
    { content: { ...document.content, contentSha256: 'invalid' } },
    { content: { ...document.content, approximateTokenCount: 999 } },
    { evidence: Array(1) },
  ])
    assert.equal(e.isEnvironmentCapabilityDocumentV1({ ...document, ...patch }), false, JSON.stringify(patch));
  assert.equal(
    e.isEnvironmentCapabilityDocumentV1({
      ...document,
      evidence: [
        { evidenceId: 'summary', mode: 'runtime', title: 'Summary', requiredFeatures: ['additional_feature'], projectorId: 'future.runtime' },
      ],
    }),
    true
  );
  assert.equal(
    e.isEnvironmentCapabilityDocumentV1({ ...document, evidence: [{ ...document.evidence[0], content: content('application/json', 32769) }] }),
    false
  );
  assert.equal(e.isEnvironmentCapabilityFactsV1(facts), true);
  assert.equal(e.isEnvironmentImmutableCapabilityFactsV1(facts), true);
  for (const patch of [
    { scope: { ...scope, tenantId: 'other' } },
    { sections: Array(1) },
    { sections: Array(11).fill(facts.sections[0]) },
    { extra: true },
    { observedAt: 'yesterday' },
  ])
    assert.equal(e.isEnvironmentCapabilityFactsV1({ ...facts, ...patch }), false);
  const fact = value => ({
    ...facts,
    sections: [
      { ...facts.sections[0], facts: { items: [{ factId: 'amount', label: 'Amount', value }], totalCount: 1, includedCount: 1, truncated: false } },
    ],
  });
  for (const amount of ['-0', '01', 'NaN', 'Infinity', '1e20', '1.00'])
    assert.equal(e.isEnvironmentCapabilityFactsV1(fact({ kind: 'quantity', amount, unit: 'count', basis: 'observed' })), false, amount);
  const money = {
    kind: 'money',
    value: { amount: '120.00', currencyCode: 'USD', basis: 'billed', period: 'monthly', provenance: 'future-billing' },
    meaning: 'review-value',
    valuation: 'source-snapshot',
    additivity: 'non-additive',
  };
  assert.equal(e.isEnvironmentImmutableCapabilityFactsV1(fact(money)), true);
  assert.equal(e.isEnvironmentCapabilityFactsV1(fact({ ...money, valuation: 'current-company' })), true);
  assert.equal(e.isEnvironmentImmutableCapabilityFactsV1(fact({ ...money, valuation: 'current-company' })), false);
  for (const patch of [
    { meaning: 'confirmed-savings' },
    { additivity: 'additive-within-group' },
    { value: { ...money.value, currencyCode: 'usd' } },
    { value: { ...money.value, amount: 'Infinity' } },
    { value: { ...money.value, provenance: '' } },
    { value: { ...money.value, savingsAdditivity: 'additive' } },
  ])
    assert.equal(e.isEnvironmentCapabilityFactsV1(fact({ ...money, ...patch })), false, JSON.stringify(patch));
  assert.equal(e.isEnvironmentCapabilityFactsV1(fact({ ...money, additivity: 'additive-within-group', additiveGroupId: 'one-group' })), true);
  const ref = e.buildEnvironmentCapabilityEvidenceReferenceV1(scope, document.capabilityId, document.documentId, 'summary');
  assert.deepEqual(e.parseEnvironmentCapabilityEvidenceReferenceV1(ref), {
    scope,
    capabilityId: document.capabilityId,
    documentId: document.documentId,
    evidenceId: 'summary',
  });
  assert.equal(e.parseEnvironmentLogicalArtifactReferenceV1(ref).artifactKind, 'environment-capability-evidence');
  assert.notEqual(ref, e.buildEnvironmentCapabilityEvidenceReferenceV1(scope, document.capabilityId, 'different-document', 'summary'));
  assert.throws(() => e.buildEnvironmentCapabilityEvidenceReferenceV1(scope, '../bad', 'document', 'summary'));
  assert.equal(e.parseEnvironmentCapabilityEvidenceReferenceV1(ref + '/extra'), null);
  const pointer = {
    schemaVersion: 1,
    status: 'completed',
    environmentRunId: 'run-1',
    scope,
    sourceBinding,
    treeDigestSha256: 'b'.repeat(64),
    fileCount: 5,
    generatedAt: '2026-10-28T00:00:01.000Z',
  };
  assert.equal(e.isEnvironmentTenantCompiledGenerationPointerV1(pointer), true);
  assert.equal(e.isEnvironmentTenantCompiledGenerationPointerV1({ ...pointer, optionalDocuments: [document] }), true);
  assert.equal(
    e.isEnvironmentTenantCompiledGenerationPointerV1({ ...pointer, optionalDocuments: [{ ...document, scope: { ...scope, tenantId: 'other' } }] }),
    false
  );
  assert.deepEqual(e.getEnvironmentOptionalDocumentDescriptorsV1(pointer), []);
  assert.deepEqual(e.getEnvironmentOptionalDocumentDescriptorsV1({ ...pointer, optionalDocuments: [document] }), [document]);
  for (const removed of ['subscription-licensing', 'tenant-microsoft365-licenses', 'tenant-microsoft365-storage'])
    assert.equal(e.ENVIRONMENT_ARTIFACT_KINDS_V1.includes(removed), false);
}
console.log('Generic capability document, typed facts and reference contracts passed in CJS and ESM.');

const { isAIEnvironmentEvidenceMatch } = await import('../dist/index.js');
const customFeatures = Object.assign(['future_feature'], { toJSON: () => [] });
assert.equal(environment.isEnvironmentCapabilityDocumentV1({ ...document, requiredFeatures: customFeatures }), false);
const customDocuments = Object.assign([document], { extra: true });
assert.equal(environment.isEnvironmentCapabilityDocumentSetV1(customDocuments, scope), false);
const customFacts = Object.assign([...facts.sections[0].facts.items], { toJSON: () => [] });
assert.equal(environment.isEnvironmentCapabilityFactsV1({
  ...facts, sections: [{ ...facts.sections[0], facts: { ...facts.sections[0].facts, items: customFacts } }],
}), false);
assert.equal(
  isAIEnvironmentEvidenceMatch({
    safeLabel: 'Future evidence',
    portalRoute: '/company/company-1/dashboard',
    artifactKind: 'environment-capability-evidence',
    sourceKey: 'a'.repeat(64),
    sourceCompletedAt: facts.observedAt,
    coverageStatus: 'partial',
    truncated: false,
    citationIds: ['future-call-1'],
  }),
  true
);
const subscriptionScope = { kind: 'azure-subscription', tenantId: 'tenant-1', companyId: 'company-1', subscriptionId: 'subscription-1' };
const subscriptionSource = {
  kind: 'azure-subscription-view-set',
  scope: subscriptionScope,
  viewSetSchemaVersion: 1,
  publicationId: 'publication-1',
  portalRunId: 'portal-1',
  pluginRunId: 'plugin-1',
  economicsGenerationId: 'economics-1',
  economicsFingerprint: 'fingerprint-1',
  completedAt: '2026-10-28T00:00:00.000Z',
};
const subscriptionPointer = {
  schemaVersion: 1,
  status: 'completed',
  environmentRunId: 'run-1',
  scope: subscriptionScope,
  sourceBinding: subscriptionSource,
  treeDigestSha256: 'b'.repeat(64),
  fileCount: 8,
  generatedAt: facts.observedAt,
  optionalDocuments: [{ ...document, scope: subscriptionScope }],
};
assert.equal(environment.isEnvironmentCompiledGenerationPointerV1(subscriptionPointer), true);
assert.equal(environment.isEnvironmentCompiledGenerationPointerV1({ ...subscriptionPointer, optionalDocuments: [document] }), false);
assert.deepEqual(
  environment.parseEnvironmentCapabilityEvidenceReferenceV1(
    environment.buildEnvironmentCapabilityEvidenceReferenceV1(subscriptionScope, 'future_feature', 'future-widget', 'summary')
  ),
  { scope: subscriptionScope, capabilityId: 'future_feature', documentId: 'future-widget', evidenceId: 'summary' }
);
assert.equal(
  environment.isEnvironmentCapabilityDocumentV1({
    ...document,
    evidence: Array.from({ length: 5 }, (_, i) => ({
      mode: 'runtime',
      evidenceId: `evidence-${i}`,
      title: 'Evidence',
      requiredFeatures: [],
      projectorId: 'future.runtime',
    })),
  }),
  false
);
assert.equal(
  environment.isEnvironmentCapabilityDocumentSetV1([document, { ...document, documentId: 'another-widget', fileName: 'another-widget.md' }], scope),
  false,
  'immutable filenames cannot collide across documents'
);
const lotsOfFacts = Array.from({ length: 51 }, (_, i) => ({ ...facts.sections[0].facts.items[0], factId: `fact-${i}` }));
assert.equal(
  environment.isEnvironmentCapabilityFactsV1({
    ...facts,
    sections: [{ ...facts.sections[0], facts: { items: lotsOfFacts, totalCount: 51, includedCount: 51, truncated: false } }],
  }),
  false
);
assert.equal(
  environment.isEnvironmentCapabilityFactsV1({
    ...facts,
    sections: [{ ...facts.sections[0], facts: { items: Array(1), totalCount: 1, includedCount: 1, truncated: false } }],
  }),
  false
);
assert.equal(
  environment.isEnvironmentCapabilityFactsV1({
    ...facts,
    sections: [
      {
        ...facts.sections[0],
        facts: {
          items: Array.from({ length: 9 }, (_, i) => ({ factId: `fact-${i}`, label: 'Text', value: { kind: 'text', value: 'x'.repeat(4096) } })),
          totalCount: 9,
          includedCount: 9,
          truncated: false,
        },
      },
    ],
  }),
  false,
  'JSON evidence stays within32KiB'
);

for (const { isAIEnvironmentEvidenceMatch: guard } of [
  await import('../dist/index.js'),
  await import('../dist/esm/ai/grounding.js'),
]) {
  const legacy = {
    safeLabel: 'Legacy source', portalRoute: '/company/company-1/dashboard',
    artifactKind: 'subscription-summary', sourceCompletedAt: facts.observedAt,
    coverageStatus: 'complete', truncated: false, citationIds: ['source-call-1'],
  };
  const generic = { ...legacy, artifactKind: 'environment-capability-evidence', sourceKey: 'a'.repeat(64) };
  assert.equal(guard(legacy), true, 'legacy source metadata remains valid without sourceKey');
  assert.equal(guard({ ...legacy, sourceKey: 'b'.repeat(64) }), true);
  assert.equal(guard(generic), true);
  const { sourceKey: _sourceKey, ...missingKey } = generic;
  assert.equal(guard(missingKey), false, 'generic capability evidence requires a source key');
  for (const sourceKey of ['', 'A'.repeat(64), 'a'.repeat(63), 'a'.repeat(65), 'envh_runtime-handle', 'tenant-1', 123, null]) {
    assert.equal(guard({ ...generic, sourceKey }), false);
    assert.equal(guard({ ...legacy, sourceKey }), false);
  }
  assert.equal(guard({ ...generic, rawScopeId: 'tenant-1' }), false);
}
