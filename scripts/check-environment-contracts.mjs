import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import {
  ENVIRONMENT_CONTRACT_LIMITS_V1,
  buildEnvironmentLogicalArtifactReferenceV1,
  buildEnvironmentLogicalResourceReferenceV1,
  buildEnvironmentScopeQualifiedSubjectV1,
  buildEnvironmentTreeDigestPreimageV1,
  isAIEnvironmentEvidenceMatch,
  isEnvironmentCompiledGenerationPointerV1,
  isEnvironmentCoverageStateV1,
  isEnvironmentDocumentDescriptorSetV1,
  isEnvironmentDocumentDescriptorV1,
  isEnvironmentLogicalArtifactReferenceV1,
  isEnvironmentLogicalResourceReferenceV1,
  isEnvironmentMoneyValueV1,
  isEnvironmentRunIdV1,
  isEnvironmentScopeV1,
  isEnvironmentSourceBindingV1,
  isEnvironmentSubscriptionCostProjectionV1,
  parseEnvironmentLogicalArtifactReferenceV1,
  parseEnvironmentLogicalResourceReferenceV1,
} from '../dist/index.js';

const scope = {
  kind: 'azure-subscription',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  subscriptionId: 'subscription-1',
};
const completedAt = '2026-08-29T00:00:00.000Z';
const generatedAt = '2026-08-29T00:00:01.000Z';
const sourceBinding = {
  kind: 'azure-subscription-view-set',
  viewSetSchemaVersion: 1,
  scope,
  publicationId: 'publication:1/source',
  portalRunId: 'portal:run/1',
  pluginRunId: 'plugin:run/1',
  economicsGenerationId: 'economics:1/source',
  economicsFingerprint: 'sha256:source-owned/fingerprint',
  completedAt,
};

assert.equal(isEnvironmentScopeV1(scope), true);
assert.equal(isEnvironmentScopeV1({ ...scope, future: true }), false, 'scope rejects unknown keys');
assert.equal(isEnvironmentScopeV1({ ...scope, subscriptionId: '../subscription' }), true, 'logical source IDs remain opaque');
assert.equal(isEnvironmentSourceBindingV1(sourceBinding), true, 'source identities preserve colons and slashes');
assert.equal(isEnvironmentSourceBindingV1({ ...sourceBinding, manifestPath: 'runs/source/manifest.json' }), false);
assert.equal(isEnvironmentSourceBindingV1({ ...sourceBinding, publicationId: ' publication-1' }), false);
assert.equal(isEnvironmentSourceBindingV1({ ...sourceBinding, portalRunId: 'portal\u0000run' }), false);
assert.equal(isEnvironmentSourceBindingV1({ ...sourceBinding, viewSetSchemaVersion: 2 }), false);
assert.equal(isEnvironmentSourceBindingV1({ ...sourceBinding, publicationId: 'a'.repeat(256) }), true);
assert.equal(isEnvironmentSourceBindingV1({ ...sourceBinding, publicationId: 'a'.repeat(257) }), false);
assert.equal(isEnvironmentScopeV1({ ...scope, companyId: 'a'.repeat(2048) }), true);
assert.equal(isEnvironmentScopeV1({ ...scope, companyId: 'a'.repeat(2049) }), false);

assert.equal(isEnvironmentRunIdV1('550e8400-e29b-41d4-a716-446655440000'), true);
for (const invalidRunId of ['.', '..', '../run', 'portal:run/1', 'C:\\run', 'https://storage/run', 'a'.repeat(129), '']) {
  assert.equal(isEnvironmentRunIdV1(invalidRunId), false, `rejects environment run ID ${invalidRunId}`);
}

const subject = buildEnvironmentScopeQualifiedSubjectV1(scope);
assert.equal(subject, '["azure-subscription","tenant-1","company-1","subscription-1"]');
const artifactReference = buildEnvironmentLogicalArtifactReferenceV1('subscription-summary', subject);
assert.deepEqual(parseEnvironmentLogicalArtifactReferenceV1(artifactReference), {
  kind: 'artifact',
  artifactKind: 'subscription-summary',
  subject,
});
assert.equal(isEnvironmentLogicalArtifactReferenceV1(artifactReference), true);
assert.throws(() => buildEnvironmentLogicalArtifactReferenceV1('subscription-summary', '../storage/path'), /canonical/u);
assert.equal(isEnvironmentLogicalArtifactReferenceV1(artifactReference.replace('subscription-summary', 'unknown-artifact')), false);
assert.equal(isEnvironmentLogicalArtifactReferenceV1(`${artifactReference}=`), false, 'rejects padded base64url');
assert.equal(isEnvironmentLogicalArtifactReferenceV1(`${artifactReference}/extra`), false);
assert.equal(isEnvironmentLogicalArtifactReferenceV1(artifactReference.replace(/.$/u, 'A')), false, 'rejects a changed payload');
const oversizedReferenceSubject = buildEnvironmentScopeQualifiedSubjectV1({ ...scope, tenantId: '😀'.repeat(1200) });
assert.throws(
  () => buildEnvironmentLogicalArtifactReferenceV1('subscription-summary', oversizedReferenceSubject),
  /payload limit/u,
  'logical references reject decoded payloads over 4 KiB'
);

const resourceId = '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1';
const resourceReference = buildEnvironmentLogicalResourceReferenceV1(resourceId);
assert.deepEqual(parseEnvironmentLogicalResourceReferenceV1(resourceReference), { kind: 'resource', resourceId });
assert.equal(isEnvironmentLogicalResourceReferenceV1(resourceReference), true);
for (const invalidResourceId of [
  '../resource',
  'C:\\resource',
  `${resourceId}?sig=secret`,
  `${resourceId}#fragment`,
  `${resourceId}%2fsecret`,
  resourceId.replace('/vm-1', '/..'),
]) {
  assert.throws(() => buildEnvironmentLogicalResourceReferenceV1(invalidResourceId));
}

const observedCost = {
  amount: '125.40',
  currencyCode: 'NZD',
  basis: 'billed',
  period: '2026-08',
  provenance: 'subscription-summary',
};
const potentialSavings = {
  amount: '25.00',
  currencyCode: 'NZD',
  basis: 'billed',
  period: 'monthly',
  provenance: 'savings-aggregate',
  savingsAdditivity: 'scenario-non-additive',
};
assert.equal(isEnvironmentMoneyValueV1(observedCost), true);
for (const invalidMoney of [
  { ...observedCost, amount: 125.4 },
  { ...observedCost, amount: '01.00' },
  { ...observedCost, amount: '1e3' },
  { ...observedCost, amount: '-0.01' },
  { ...observedCost, currencyCode: 'nzd' },
  { ...observedCost, future: true },
]) {
  assert.equal(isEnvironmentMoneyValueV1(invalidMoney), false);
}

assert.equal(isEnvironmentCoverageStateV1({ status: 'complete' }), true);
assert.equal(isEnvironmentCoverageStateV1({ status: 'partial', reason: 'One source failed.' }), true);
assert.equal(isEnvironmentCoverageStateV1({ status: 'stale', reason: 'New scan available.', observedAt: completedAt }), true);
assert.equal(isEnvironmentCoverageStateV1({ status: 'unavailable', reason: 'Permission denied.' }), true);
assert.equal(isEnvironmentCoverageStateV1({ status: 'not-collected', reason: 'Not requested.' }), true);
assert.equal(isEnvironmentCoverageStateV1({ status: 'partial' }), false);
assert.equal(isEnvironmentCoverageStateV1({ status: 'unavailable', reason: 'Unavailable.', observedAt: completedAt }), false);
assert.equal(isEnvironmentCoverageStateV1({ status: 'complete', future: true }), false);

const emptyList = { items: [], totalCount: 0, includedCount: 0, truncated: false };
const projection = {
  schemaVersion: 1,
  scope,
  sourceBinding,
  generatedAt,
  subscription: { safeLabel: 'Production', portalRoute: '/companies/company-1/subscriptions/subscription-1' },
  sourceCoverage: {
    subscriptionSummary: { status: 'complete', observedAt: completedAt },
    resources: { status: 'complete' },
    recommendations: { status: 'partial', reason: 'One source failed.' },
    costs: { status: 'complete' },
    savings: { status: 'complete' },
  },
  costSummary: { observedCost, potentialSavings, resourceCount: 1, recommendationCount: 1 },
  serviceFamilyRollups: {
    items: [
      {
        key: 'microsoft.compute/virtualmachines',
        safeLabel: 'Virtual machines',
        resourceCount: 1,
        observedCost,
        sourceReferences: [resourceReference],
      },
    ],
    totalCount: 1,
    includedCount: 1,
    truncated: false,
  },
  estateCostRollups: emptyList,
  costDrivers: emptyList,
  recommendations: emptyList,
  changes: emptyList,
  warnings: emptyList,
  sourceReferences: [artifactReference, resourceReference],
};
assert.equal(isEnvironmentSubscriptionCostProjectionV1(projection), true);
assert.equal(isEnvironmentSubscriptionCostProjectionV1({ ...projection, future: true }), false, 'projection rejects unknown keys');
assert.equal(
  isEnvironmentSubscriptionCostProjectionV1({
    ...projection,
    subscription: { ...projection.subscription, safeLabel: 'a'.repeat(513) },
  }),
  false,
  'safe labels reject cap plus one'
);
assert.equal(isEnvironmentSubscriptionCostProjectionV1({ ...projection, generatedAt: '2026-08-28T23:59:59.999Z' }), false);
assert.equal(
  isEnvironmentSubscriptionCostProjectionV1({ ...projection, scope: { ...scope, subscriptionId: 'subscription-2' } }),
  false,
  'projection scope must match source binding'
);
assert.equal(
  isEnvironmentSubscriptionCostProjectionV1({
    ...projection,
    serviceFamilyRollups: { ...projection.serviceFamilyRollups, includedCount: 0 },
  }),
  false,
  'bounded list count must match its items'
);
assert.equal(
  isEnvironmentSubscriptionCostProjectionV1({
    ...projection,
    serviceFamilyRollups: { items: [], totalCount: 1, includedCount: 0, truncated: true },
  }),
  false,
  'truncated lists require a logical continuation reference'
);
assert.equal(
  isEnvironmentSubscriptionCostProjectionV1({
    ...projection,
    warnings: {
      items: Array.from({ length: ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems + 1 }, (_, index) => ({
        code: `warning-${index}`,
        safeLabel: `Warning ${index}`,
        sourceReferences: [],
      })),
      totalCount: ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems + 1,
      includedCount: ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems + 1,
      truncated: false,
    },
  }),
  false,
  'bounded lists reject cap plus one'
);
assert.equal(
  isEnvironmentSubscriptionCostProjectionV1({
    ...projection,
    subscription: JSON.parse('{"safeLabel":"Production","portalRoute":"/safe","__proto__":{"polluted":true}}'),
  }),
  false,
  'rejects prototype-control keys'
);
const oversizedProjection = {
  ...projection,
  warnings: {
    items: Array.from({ length: 50 }, (_, index) => ({
      code: `warning-${index}`,
      safeLabel: `Warning ${index}`,
      detail: 'a'.repeat(4096),
      sourceReferences: [],
    })),
    totalCount: 50,
    includedCount: 50,
    truncated: false,
  },
};
assert.equal(isEnvironmentSubscriptionCostProjectionV1(oversizedProjection), false, 'projection rejects its UTF-8 byte cap plus one');

const descriptors = [
  {
    name: 'projection.json',
    mediaType: 'application/json',
    byteCount: 100,
    contentSha256: 'a'.repeat(64),
    approximateTokenCount: 25,
  },
  {
    name: 'environment-index.md',
    mediaType: 'text/markdown; charset=utf-8',
    byteCount: 200,
    contentSha256: 'b'.repeat(64),
    approximateTokenCount: 50,
  },
  {
    name: 'pillars/cost.md',
    mediaType: 'text/markdown; charset=utf-8',
    byteCount: 300,
    contentSha256: 'c'.repeat(64),
    approximateTokenCount: 75,
  },
];
assert.equal(isEnvironmentDocumentDescriptorSetV1(descriptors), true);
assert.equal(isEnvironmentDocumentDescriptorSetV1([...descriptors.slice(0, 2), descriptors[1]]), false);
assert.equal(isEnvironmentDocumentDescriptorV1({ ...descriptors[0], future: true }), false);
assert.equal(isEnvironmentDocumentDescriptorV1({ ...descriptors[0], contentSha256: 'A'.repeat(64) }), false);
assert.equal(isEnvironmentDocumentDescriptorV1({ ...descriptors[1], byteCount: ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes + 1 }), false);
assert.equal(isEnvironmentDocumentDescriptorV1({ ...descriptors[2], byteCount: ENVIRONMENT_CONTRACT_LIMITS_V1.costPillarBytes + 1 }), false);
const expectedPreimage = `[["environment-index.md","${'b'.repeat(64)}"],["pillars/cost.md","${'c'.repeat(64)}"],["projection.json","${'a'.repeat(64)}"]]`;
assert.equal(buildEnvironmentTreeDigestPreimageV1(descriptors), expectedPreimage);
assert.equal(buildEnvironmentTreeDigestPreimageV1([...descriptors].reverse()), expectedPreimage, 'digest preimage is order-independent');
assert.throws(() => buildEnvironmentTreeDigestPreimageV1(descriptors.slice(0, 2)));

const pointer = {
  schemaVersion: 1,
  status: 'completed',
  environmentRunId: '550e8400-e29b-41d4-a716-446655440000',
  scope,
  sourceBinding,
  treeDigestSha256: 'd'.repeat(64),
  fileCount: 3,
  generatedAt,
};
assert.equal(isEnvironmentCompiledGenerationPointerV1(pointer), true);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, fileCount: 2 }), false);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, generatedAt: '2026-08-28T23:59:59.999Z' }), false);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, environmentRunId: sourceBinding.publicationId }), false);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, scope: { ...scope, companyId: 'company-2' } }), false);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, storagePath: 'environment/runs/run-1' }), false);

const safeEvidenceMatch = {
  safeLabel: 'Production subscription cost summary',
  portalRoute: '/companies/company-1/subscriptions/subscription-1/cost',
  scope,
  artifactKind: 'subscription-summary',
  sourceGeneration: {
    viewSetSchemaVersion: 1,
    publicationId: sourceBinding.publicationId,
    portalRunId: sourceBinding.portalRunId,
    pluginRunId: sourceBinding.pluginRunId,
    economicsGenerationId: sourceBinding.economicsGenerationId,
    economicsFingerprint: sourceBinding.economicsFingerprint,
    completedAt,
  },
};
assert.deepEqual(Object.keys(JSON.parse(JSON.stringify(safeEvidenceMatch))).sort(), [
  'artifactKind',
  'portalRoute',
  'safeLabel',
  'scope',
  'sourceGeneration',
]);
assert.equal(isAIEnvironmentEvidenceMatch(safeEvidenceMatch), true);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, storagePath: 'environment/runs/run-1' }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, portalRoute: '//evil.example/path' }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, portalRoute: '/companies/../admin' }), false);

const environmentEsm = await import('@spottoai/types-package/environment');
const environmentCommonJs = createRequire(import.meta.url)('@spottoai/types-package/environment');
assert.equal(typeof environmentEsm.buildEnvironmentTreeDigestPreimageV1, 'function', 'ESM environment subpath is exported');
assert.equal(typeof environmentCommonJs.buildEnvironmentTreeDigestPreimageV1, 'function', 'CommonJS environment subpath is exported');

process.stdout.write('Environment contract checks passed.\n');
