import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import {
  ENVIRONMENT_ARTIFACT_KINDS_V1,
  ENVIRONMENT_CONTRACT_LIMITS_V1,
  ENVIRONMENT_DOCUMENT_NAMES_V1,
  ENVIRONMENT_PILLARS_V1,
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
  isEnvironmentPillarV1,
  isEnvironmentRunIdV1,
  isEnvironmentScopeV1,
  isEnvironmentSourceBindingV1,
  isEnvironmentSubscriptionProjectionV1,
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

assert.deepEqual(ENVIRONMENT_PILLARS_V1, ['cost', 'security', 'governance', 'reliability', 'performance', 'operations']);
assert.equal(ENVIRONMENT_DOCUMENT_NAMES_V1.length, 8);
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
for (const pillar of ENVIRONMENT_PILLARS_V1) assert.equal(isEnvironmentPillarV1(pillar), true);
assert.equal(isEnvironmentPillarV1('sustainability'), false);

assert.equal(isEnvironmentRunIdV1('550e8400-e29b-41d4-a716-446655440000'), true);
for (const invalidRunId of ['.', '..', '../run', 'portal:run/1', 'C:\\run', 'https://storage/run', 'a'.repeat(129), '']) {
  assert.equal(isEnvironmentRunIdV1(invalidRunId), false, `rejects environment run ID ${invalidRunId}`);
}

const subject = buildEnvironmentScopeQualifiedSubjectV1(scope);
assert.equal(subject, '["azure-subscription","tenant-1","company-1","subscription-1"]');
const artifactReferences = Object.fromEntries(
  ENVIRONMENT_ARTIFACT_KINDS_V1.map(artifactKind => [artifactKind, buildEnvironmentLogicalArtifactReferenceV1(artifactKind, subject)])
);
for (const artifactKind of ENVIRONMENT_ARTIFACT_KINDS_V1) {
  const reference = artifactReferences[artifactKind];
  assert.deepEqual(parseEnvironmentLogicalArtifactReferenceV1(reference), { kind: 'artifact', artifactKind, subject });
  assert.equal(isEnvironmentLogicalArtifactReferenceV1(reference), true);
}
const artifactReference = artifactReferences['subscription-summary'];
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
const completeCoverage = { status: 'complete' };
const pillarRoutes = {
  cost: '/company/company-1/cost-analysis',
  security: '/company/company-1/recommendations',
  governance: '/company/company-1/recommendations',
  reliability: '/company/company-1/recommendations',
  performance: '/company/company-1/recommendations',
  operations: '/company/company-1/recommendations',
};
const pillars = Object.fromEntries(
  ENVIRONMENT_PILLARS_V1.map(pillar => [
    pillar,
    {
      pillar,
      coverage: pillar === 'governance' ? { status: 'partial', reason: 'Independent governance sidecars are not bound.' } : completeCoverage,
      findingCount: pillar === 'security' ? 1 : 0,
      recommendationCount: 1,
      affectedResourceCount: 1,
      portalRoute: pillarRoutes[pillar],
      ...(pillar === 'security' ? { score: { value: '72.5', maximum: '100', safeLabel: 'Secure score' } } : {}),
      sourceReferences: [artifactReference],
    },
  ])
);
const projection = {
  schemaVersion: 1,
  scope,
  sourceBinding,
  generatedAt,
  subscription: { safeLabel: 'Production', portalRoute: '/company/company-1/dashboard' },
  sourceCoverage: {
    completedViewSet: completeCoverage,
    subscriptionSummary: { status: 'complete', observedAt: completedAt },
    resources: completeCoverage,
    recommendations: { status: 'partial', reason: 'One source failed.' },
    serviceRetirements: completeCoverage,
    monitorAlerts: { status: 'not-collected', reason: 'Not requested.' },
    pluginMetrics: { status: 'partial', reason: 'Some resource families do not expose supported metrics.' },
  },
  estateSummary: { resourceCount: 1, serviceFamilyCount: 1, locationCount: 1 },
  costSummary: { observedCost, potentialSavings, costRecommendationCount: 1 },
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
  pillars,
  findings: {
    items: [
      {
        findingId: 'security-score',
        pillar: 'security',
        kind: 'security-posture',
        safeLabel: 'Secure score requires attention',
        severity: 'high',
        confidencePercentage: '90',
        affectedResourceCount: 1,
        portalRoute: '/company/company-1/recommendations',
        resourceReferences: [resourceReference],
        sourceReferences: [artifactReference],
      },
    ],
    totalCount: 1,
    includedCount: 1,
    truncated: false,
  },
  recommendations: {
    items: [
      {
        recommendationId: 'recommendation-1',
        pillar: 'performance',
        safeLabel: 'Enable autoscale',
        portalRoute: '/company/company-1/recommendations',
        impact: 'high',
        effort: 'medium',
        confidencePercentage: '90',
        affectedResourceCount: 1,
        resourceReferences: [resourceReference],
        sourceReferences: [artifactReferences['subscription-recommendations']],
      },
    ],
    totalCount: 1,
    includedCount: 1,
    truncated: false,
  },
  changes: emptyList,
  warnings: emptyList,
  sourceReferences: [artifactReference, resourceReference],
};
assert.equal(isEnvironmentSubscriptionProjectionV1(projection), true);
assert.equal(isEnvironmentSubscriptionProjectionV1({ ...projection, future: true }), false, 'projection rejects unknown keys');
assert.equal(
  isEnvironmentSubscriptionProjectionV1({ ...projection, pillars: { ...pillars, security: { ...pillars.security, pillar: 'cost' } } }),
  false,
  'pillar map keys bind their discriminator'
);
const { operations: _removedPillar, ...missingPillar } = pillars;
assert.equal(isEnvironmentSubscriptionProjectionV1({ ...projection, pillars: missingPillar }), false, 'all pillars are mandatory');
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    recommendations: {
      ...projection.recommendations,
      items: [{ ...projection.recommendations.items[0], confidencePercentage: '100.1' }],
    },
  }),
  false,
  'confidence percentages cannot exceed 100'
);
assert.equal(isEnvironmentSubscriptionProjectionV1({ ...projection, generatedAt: '2026-08-28T23:59:59.999Z' }), false);
assert.equal(
  isEnvironmentSubscriptionProjectionV1({ ...projection, scope: { ...scope, subscriptionId: 'subscription-2' } }),
  false,
  'projection scope must match source binding'
);
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    serviceFamilyRollups: { ...projection.serviceFamilyRollups, includedCount: 0 },
  }),
  false,
  'bounded list count must match its items'
);
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    serviceFamilyRollups: { items: [], totalCount: 1, includedCount: 0, truncated: true },
  }),
  false,
  'truncated lists require a logical continuation reference'
);
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
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
      detail: '😀'.repeat(4096),
      sourceReferences: [],
    })),
    totalCount: 50,
    includedCount: 50,
    truncated: false,
  },
};
assert.equal(isEnvironmentSubscriptionProjectionV1(oversizedProjection), false, 'projection rejects its UTF-8 byte cap plus one');

const descriptors = ENVIRONMENT_DOCUMENT_NAMES_V1.map((name, index) => ({
  name,
  mediaType: name === 'projection.json' ? 'application/json' : 'text/markdown; charset=utf-8',
  byteCount: 100 + index,
  contentSha256: `${index}`.repeat(64),
  approximateTokenCount: 25,
}));
assert.equal(isEnvironmentDocumentDescriptorSetV1(descriptors), true);
assert.equal(isEnvironmentDocumentDescriptorSetV1(descriptors.slice(0, -1)), false);
assert.equal(isEnvironmentDocumentDescriptorSetV1([...descriptors.slice(0, -1), descriptors[1]]), false);
assert.equal(isEnvironmentDocumentDescriptorV1({ ...descriptors[0], future: true }), false);
assert.equal(isEnvironmentDocumentDescriptorV1({ ...descriptors[0], contentSha256: 'A'.repeat(64) }), false);
assert.equal(isEnvironmentDocumentDescriptorV1({ ...descriptors[1], byteCount: ENVIRONMENT_CONTRACT_LIMITS_V1.environmentIndexBytes + 1 }), false);
assert.equal(isEnvironmentDocumentDescriptorV1({ ...descriptors[2], byteCount: ENVIRONMENT_CONTRACT_LIMITS_V1.pillarDocumentBytes + 1 }), false);
const expectedPreimage = JSON.stringify(
  descriptors
    .map(descriptor => [descriptor.name, descriptor.contentSha256])
    .sort((left, right) => left[0].localeCompare(right[0], 'en', { sensitivity: 'variant' }))
);
assert.equal(buildEnvironmentTreeDigestPreimageV1(descriptors), expectedPreimage);
assert.equal(buildEnvironmentTreeDigestPreimageV1([...descriptors].reverse()), expectedPreimage, 'digest preimage is order-independent');
assert.throws(() => buildEnvironmentTreeDigestPreimageV1(descriptors.slice(0, -1)));

const pointer = {
  schemaVersion: 1,
  status: 'completed',
  environmentRunId: '550e8400-e29b-41d4-a716-446655440000',
  scope,
  sourceBinding,
  treeDigestSha256: 'd'.repeat(64),
  fileCount: ENVIRONMENT_DOCUMENT_NAMES_V1.length,
  generatedAt,
};
assert.equal(isEnvironmentCompiledGenerationPointerV1(pointer), true);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, fileCount: 3 }), false);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, generatedAt: '2026-08-28T23:59:59.999Z' }), false);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, environmentRunId: sourceBinding.publicationId }), false);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, scope: { ...scope, companyId: 'company-2' } }), false);
assert.equal(isEnvironmentCompiledGenerationPointerV1({ ...pointer, storagePath: 'environment/runs/run-1' }), false);

const safeEvidenceMatch = {
  safeLabel: 'Production subscription environment',
  portalRoute: '/company/company-1/dashboard',
  scope,
  artifactKind: 'subscription-recommendations',
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
assert.equal(typeof environmentEsm.isEnvironmentSubscriptionProjectionV1, 'function', 'ESM environment subpath is exported');
assert.equal(typeof environmentCommonJs.isEnvironmentSubscriptionProjectionV1, 'function', 'CommonJS environment subpath is exported');
assert.equal(environmentEsm.isEnvironmentSubscriptionCostProjectionV1, undefined, 'cost-only ESM validator is not retained');
assert.equal(environmentCommonJs.isEnvironmentSubscriptionCostProjectionV1, undefined, 'cost-only CommonJS validator is not retained');

process.stdout.write('Environment contract checks passed.\n');
