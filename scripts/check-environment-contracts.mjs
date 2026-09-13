import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import {
  ENVIRONMENT_ARTIFACT_KINDS_V1,
  ENVIRONMENT_CONTRACT_LIMITS_V1,
  ENVIRONMENT_DOCUMENT_NAMES_V1,
  ENVIRONMENT_PILLARS_V1,
  buildEnvironmentLogicalArtifactReferenceV1,
  buildEnvironmentLogicalResourceReferenceV1,
  deriveEnvironmentAzureResourceTypeV1,
  buildEnvironmentScopeQualifiedSubjectV1,
  buildEnvironmentTreeDigestPreimageV1,
  isAIChatGroundingSummary,
  isAIEnvironmentEvidenceMatch,
  isEnvironmentCardinalityV1,
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
  isEnvironmentPortalRouteV1,
  parseEnvironmentLogicalArtifactReferenceV1,
  parseEnvironmentLogicalResourceReferenceV1,
  ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1,
  buildEnvironmentTenantScopeQualifiedSubjectV1,
  buildEnvironmentTenantTreeDigestPreimageV1,
  isEnvironmentTenantCompiledGenerationPointerV1,
  isEnvironmentTenantDocumentDescriptorSetV1,
  isEnvironmentTenantProjectionV1,
  isEnvironmentTenantScopeV1,
  isEnvironmentTenantSourceBindingV1,
} from '../dist/index.js';

const scope = {
  kind: 'azure-subscription',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  subscriptionId: 'subscription-1',
};

const resourceRoute =
  '/company/company-1/resources/' + encodeURIComponent('/subscriptions/sub-1/resourcegroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1');
for (const route of [
  resourceRoute,
  '/company/company-1/recommendations/rec-1?subscriptions=sub-1',
  '/company/company-1/dashboard?subscriptions=sub-1',
]) {
  assert.equal(isEnvironmentPortalRouteV1(route), true, route);
}
for (const route of [
  '//evil.example/resources',
  '/company/company-1/dashboard?token=secret',
  '/company/company-1/dashboard?subscriptions=sub-1&subscriptions=sub-2',
  '/company/company-1/dashboard?subscriptions=sub-1#other',
  '/company/company-1/recommendations/%2E%2E?subscriptions=sub-1',
  '/company/company-1/recommendations/%252Fusers?subscriptions=sub-1',
  '/company/company%2F2/dashboard?subscriptions=sub-1',
  resourceRoute + '?subscriptions=foreign',
  '/company/company-1/resources/' + encodeURIComponent('/subscriptions/sub-1/resourcegroups/../providers/X/Y/Z'),
])
  assert.equal(isEnvironmentPortalRouteV1(route), false, route);
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

const resourceId = '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Web/serverFarms/plan-1';
const resourceReference = buildEnvironmentLogicalResourceReferenceV1(resourceId);
assert.deepEqual(parseEnvironmentLogicalResourceReferenceV1(resourceReference), { kind: 'resource', resourceId });
assert.equal(isEnvironmentLogicalResourceReferenceV1(resourceReference), true);
assert.equal(deriveEnvironmentAzureResourceTypeV1(resourceId), 'microsoft.web/serverfarms');
assert.equal(
  deriveEnvironmentAzureResourceTypeV1(
    '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/providers/blobServices/default'
  ),
  'microsoft.storage/storageaccounts/blobservices',
  'a resource name equal to providers is not treated as an extension-resource boundary'
);
assert.equal(
  deriveEnvironmentAzureResourceTypeV1(
    '/subscriptions/subscription-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1/providers/Microsoft.Insights/diagnosticSettings/default'
  ),
  'microsoft.insights/diagnosticsettings',
  'an extension-resource provider boundary selects the extension resource type'
);
for (const invalidResourceId of [
  '../resource',
  'C:\\resource',
  `${resourceId}?sig=secret`,
  `${resourceId}#fragment`,
  `${resourceId}%2fsecret`,
  resourceId.replace('/plan-1', '/..'),
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
assert.equal(isEnvironmentMoneyValueV1({ ...observedCost, currencyCode: 'unknown', basis: 'unknown', period: 'unknown' }), true);
for (const invalidMoney of [
  { ...observedCost, amount: 125.4 },
  { ...observedCost, amount: '01.00' },
  { ...observedCost, amount: '1e3' },
  { ...observedCost, amount: '-0.01' },
  { ...observedCost, currencyCode: 'nzd' },
  { ...observedCost, currencyCode: 'UNKNOWN' },
  { ...observedCost, basis: 'estimated' },
  { ...observedCost, future: true },
]) {
  assert.equal(isEnvironmentMoneyValueV1(invalidMoney), false);
}

// E-9: observed money may carry the producer spend-source semantics; savings money may carry
// the producer savings basis. Both are additive and both stay on the side of money they
// describe.
const blendedObservedCost = {
  ...observedCost,
  spendSource: 'blended',
  spendSourceConfidence: 'unknown',
  composition: { billingBacked: 1893652, estimated: 25831, minorUnitScale: 2, currencyCode: 'NZD' },
};
const projectedSavings = {
  ...potentialSavings,
  savingsBasis: {
    projection: 'projected-monthly',
    observedPeriod: 'mixed_stable_and_legacy',
    stableWindow: '2026-08-07/2026-09-02',
    containsLegacySavings: true,
  },
};
assert.equal(isEnvironmentMoneyValueV1(blendedObservedCost), true);
assert.equal(isEnvironmentMoneyValueV1(projectedSavings), true);
assert.equal(isEnvironmentMoneyValueV1({ ...observedCost, spendSource: 'estimated' }), true);
for (const invalidSemantics of [
  { ...blendedObservedCost, spendSource: 'billing-and-estimated' },
  { ...blendedObservedCost, spendSourceConfidence: 'certain' },
  { ...blendedObservedCost, composition: { ...blendedObservedCost.composition, currencyCode: 'USD' } },
  { ...blendedObservedCost, composition: { ...blendedObservedCost.composition, billingBacked: 1893652.5 } },
  { ...blendedObservedCost, composition: { billingBacked: 1, estimated: 1, minorUnitScale: 2 } },
  { ...projectedSavings, savingsBasis: { projection: 'annualised' } },
  { ...projectedSavings, savingsBasis: { projection: 'projected-monthly', stableWindow: '2026-08-07' } },
]) {
  assert.equal(isEnvironmentMoneyValueV1(invalidSemantics), false);
}
assert.equal(isEnvironmentCardinalityV1({ basis: 'exact', value: 0 }), true);
assert.equal(isEnvironmentCardinalityV1({ basis: 'lower-bound', value: 1, reason: 'Category overlap is unavailable.' }), true);
assert.equal(isEnvironmentCardinalityV1({ basis: 'unavailable', reason: 'The source has no subject identifiers.' }), true);
assert.equal(isEnvironmentCardinalityV1({ basis: 'unavailable', value: 1, reason: 'Contradictory.' }), false);
assert.equal(isEnvironmentCardinalityV1({ basis: 'lower-bound', value: 1 }), false);
assert.equal(isEnvironmentCardinalityV1({ basis: 'exact', value: 1, reason: 'Unexpected.' }), false);

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
      affectedResources:
        pillar === 'governance' ? { basis: 'lower-bound', value: 1, reason: 'Category overlap is unavailable.' } : { basis: 'exact', value: 1 },
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
        affectedResources: { basis: 'exact', value: 1 },
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
        technicalName: 'Enable autoscale for eligible App Service plans',
        affectedResourceTypes: ['microsoft.web/serverfarms'],
        portalRoute: '/company/company-1/recommendations',
        impact: 'high',
        effort: 'medium',
        affectedResources: { basis: 'exact', value: 1 },
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
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    costSummary: { ...projection.costSummary, observedCost: { ...blendedObservedCost, savingsBasis: projectedSavings.savingsBasis } },
  }),
  false,
  'observed money never carries a savings basis'
);
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    costSummary: { ...projection.costSummary, potentialSavings: { ...projectedSavings, spendSource: 'blended' } },
  }),
  false,
  'savings money never carries a spend source'
);

// Optional detail sections: additive, self-describing, and bounded by their own row cap.
const sectionList = items => ({ items, totalCount: items.length, includedCount: items.length, truncated: false });
const detailSections = {
  commitments: {
    coverage: { status: 'partial', reason: 'Commitment planning sidecar: savings-plan inventory was unavailable.' },
    benefitCount: 8,
    utilizationPercent30Day: '98.56',
    expiredCount: 43,
    expiring90DayCount: 2,
    purchaseOptions: sectionList([
      { key: 'sp-1', safeLabel: 'Savings Plan P3Y hourly commitment', termMonths: 36, estimatedMonthlySavings: potentialSavings },
    ]),
    benefitCoverage: sectionList([
      { key: 'vm-1', safeLabel: 'vm-1', detail: 'microsoft.compute/virtualmachines', benefitLabels: ['VM_RI_2026-01'], resourceReference },
    ]),
    sourceReferences: [],
  },
  budgets: {
    coverage: { status: 'complete' },
    budgets: sectionList([
      { key: '2026-09', safeLabel: '2026-09-01 ~ 2026-09-30', period: '2026-09-01/2026-09-30', amount: observedCost, consumedPercent: '12.3' },
    ]),
    sourceReferences: [artifactReference],
  },
  idleResources: {
    coverage: { status: 'complete' },
    recommendationCount: 1,
    resourceCount: 6,
    monthlyWaste: potentialSavings,
    subjects: sectionList([{ key: 'natgw-1', safeLabel: 'natgw-1', resourceReference }]),
    sourceReferences: [artifactReference],
  },
  publicIpExposure: {
    coverage: { status: 'complete' },
    totalCount: 6,
    httpsExposedCount: 3,
    exposedSubjects: sectionList([{ key: 'pip-1', safeLabel: 'pip-1', detail: 'exposed https' }]),
    remediationOptions: sectionList([{ key: 'front_with_app_gateway_waf', safeLabel: 'front_with_app_gateway_waf', count: 3 }]),
    sourceReferences: [],
  },
  secretStoreCoverage: {
    coverage: { status: 'unavailable', reason: 'Key Vault object metadata could not be listed for 15 of 15 vaults.' },
    vaultCount: 15,
    inspectedVaultCount: 0,
    reasons: sectionList([{ key: 'metadata-list-not-authorized', safeLabel: 'metadata-list-not-authorized', count: 15 }]),
    sourceReferences: [],
  },
  tagCoverage: {
    coverage: { status: 'complete' },
    resourceCount: 247,
    taggedResourceCount: 131,
    untaggedResourceCount: 116,
    distinctTagKeyCount: 18,
    topTagKeys: sectionList([{ key: 'environment_class', safeLabel: 'environment_class', count: 125 }]),
    sourceReferences: [artifactReference],
  },
  changeSignals: {
    coverage: { status: 'complete' },
    windowDays: 30,
    changeCount: 1038,
    materialChangeCount: 415,
    securityRelevantCount: 637,
    topOperations: sectionList([{ key: 'List Storage Account Keys', safeLabel: 'List Storage Account Keys', count: 183 }]),
    sourceReferences: [],
  },
  healthEvents: {
    coverage: { status: 'complete' },
    totalCount: 59,
    activeCount: 25,
    resolvedCount: 34,
    activeEvents: sectionList([
      {
        key: '9Q5T-8LZ',
        safeLabel: 'Network connectivity advisory',
        severity: 'medium',
        eventType: 'HealthAdvisory',
        startedAt: '2026-08-11T17:07:57.547Z',
      },
    ]),
    sourceReferences: [artifactReference],
  },
};
assert.equal(isEnvironmentSubscriptionProjectionV1({ ...projection, ...detailSections }), true, 'detail sections are additive');
for (const [key, value] of Object.entries(detailSections)) {
  assert.equal(isEnvironmentSubscriptionProjectionV1({ ...projection, [key]: value }), true, `${key} validates on its own`);
  assert.equal(isEnvironmentSubscriptionProjectionV1({ ...projection, [key]: { ...value, future: true } }), false, `${key} rejects unknown keys`);
}
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    tagCoverage: { ...detailSections.tagCoverage, untaggedResourceCount: 0 },
  }),
  false,
  'tag coverage counts must reconcile with the resource total'
);
const overCapRows = Array.from({ length: ENVIRONMENT_CONTRACT_LIMITS_V1.sectionListItems + 1 }, (_value, index) => ({
  key: `operation-${index}`,
  safeLabel: `Operation ${index}`,
  count: 1,
}));
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    changeSignals: { ...detailSections.changeSignals, topOperations: sectionList(overCapRows) },
  }),
  false,
  'detail sections are bounded by the section row cap'
);
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
    recommendations: { ...projection.recommendations, items: [{ ...projection.recommendations.items[0], confidencePercentage: '90' }] },
  }),
  false,
  'legacy environment confidence percentages are rejected'
);
const { technicalName: _missingTechnicalName, ...recommendationWithoutTechnicalName } = projection.recommendations.items[0];
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    recommendations: { ...projection.recommendations, items: [recommendationWithoutTechnicalName] },
  }),
  false,
  'recommendations require the canonical technical name'
);
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    recommendations: {
      ...projection.recommendations,
      items: [{ ...projection.recommendations.items[0], affectedResourceTypes: ['Microsoft.Web/serverfarms'] }],
    },
  }),
  false,
  'affected Azure resource types must be canonical lower-case values'
);
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    recommendations: {
      ...projection.recommendations,
      items: [{ ...projection.recommendations.items[0], affectedResourceTypes: ['microsoft.compute/virtualmachines'] }],
    },
  }),
  false,
  'affected Azure resource types must exactly match resource references'
);
assert.equal(
  isEnvironmentSubscriptionProjectionV1({
    ...projection,
    pillars: {
      ...pillars,
      security: { ...pillars.security, affectedResources: { basis: 'unavailable', value: 1, reason: 'Contradictory.' } },
    },
  }),
  false,
  'unavailable affected-resource cardinality cannot carry a value'
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

const tenantScope = { kind: 'azure-tenant', tenantId: 'tenant-1' };
const tenantSourceBinding = {
  kind: 'azure-tenant-sync',
  scope: tenantScope,
  tenantSyncRunId: 'tenant-sync:run/1',
  completedAt,
};
const tenantSubject = buildEnvironmentTenantScopeQualifiedSubjectV1(tenantScope);
const tenantGovernanceReference = buildEnvironmentLogicalArtifactReferenceV1('tenant-governance', tenantSubject);
const tenantAccessReference = buildEnvironmentLogicalArtifactReferenceV1('tenant-governance-access', tenantSubject);
const tenantReservationsReference = buildEnvironmentLogicalArtifactReferenceV1('tenant-reservations', tenantSubject);
assert.equal(isEnvironmentTenantScopeV1(tenantScope), true);
assert.equal(isEnvironmentTenantScopeV1({ ...tenantScope, companyId: 'company-1' }), false);
assert.equal(isEnvironmentTenantSourceBindingV1(tenantSourceBinding), true);

const emptyTenantList = { items: [], totalCount: 0, includedCount: 0, truncated: false };
const tenantProjection = {
  schemaVersion: 1,
  scope: tenantScope,
  sourceBinding: tenantSourceBinding,
  generatedAt,
  tenant: { safeLabel: 'Azure tenant' },
  sourceCoverage: {
    tenantSync: completeCoverage,
    governance: completeCoverage,
    identity: completeCoverage,
    commitments: completeCoverage,
  },
  identitySummary: {
    applicationCount: 4,
    servicePrincipalCount: 7,
    globalAdministratorCount: 2,
    permanentGlobalAdministratorCount: 1,
    eligibleGlobalAdministratorCount: 1,
    mfaKnownGlobalAdministratorCount: 2,
  },
  governanceSummary: {
    managementGroupCount: 2,
    subscriptionCount: 3,
    policyAssignmentCount: 5,
    policyExemptionCount: 1,
    roleAssignmentCount: 8,
    privilegedAssignmentCount: 2,
    customRoleCount: 1,
    findingCount: 1,
  },
  commitmentSummary: { reservationCount: 2, savingsPlanCount: 1, expiringWithin90DaysCount: 1 },
  globalAdministrators: {
    items: [
      {
        principalId: 'principal-1',
        safeLabel: 'Tenant administrator',
        principalType: 'user',
        assignmentModes: ['permanent'],
        mfaStatus: 'mfa',
        sourceReferences: [tenantAccessReference],
      },
    ],
    totalCount: 1,
    includedCount: 1,
    truncated: false,
  },
  governanceFindings: {
    items: [
      {
        findingId: 'finding-1',
        safeLabel: 'Policy coverage requires attention',
        severity: 'high',
        category: 'policy',
        scopeType: 'tenant',
        sourceReferences: [tenantGovernanceReference],
      },
    ],
    totalCount: 1,
    includedCount: 1,
    truncated: false,
  },
  commitments: emptyTenantList,
  warnings: emptyTenantList,
  sourceReferences: [tenantGovernanceReference, tenantAccessReference, tenantReservationsReference],
};
assert.equal(isEnvironmentTenantProjectionV1(tenantProjection), true);
assert.equal(isEnvironmentTenantProjectionV1({ ...tenantProjection, future: true }), false);

const tenantDescriptors = ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.map((name, index) => ({
  name,
  mediaType: name === 'projection.json' ? 'application/json' : 'text/markdown; charset=utf-8',
  byteCount: 100 + index,
  contentSha256: `${index + 1}`.repeat(64),
  approximateTokenCount: 25,
}));
assert.equal(isEnvironmentTenantDocumentDescriptorSetV1(tenantDescriptors), true);
const tenantTreeDigestPreimage = buildEnvironmentTenantTreeDigestPreimageV1(tenantDescriptors);
assert.equal(buildEnvironmentTenantTreeDigestPreimageV1([...tenantDescriptors].reverse()), tenantTreeDigestPreimage);
const tenantPointer = {
  schemaVersion: 1,
  status: 'completed',
  environmentRunId: '550e8400-e29b-41d4-a716-446655440009',
  scope: tenantScope,
  sourceBinding: tenantSourceBinding,
  treeDigestSha256: 'e'.repeat(64),
  fileCount: ENVIRONMENT_TENANT_DOCUMENT_NAMES_V1.length,
  generatedAt,
};
assert.equal(isEnvironmentTenantCompiledGenerationPointerV1(tenantPointer), true);
assert.equal(isEnvironmentTenantCompiledGenerationPointerV1({ ...tenantPointer, fileCount: 8 }), false);

const safeEvidenceMatch = {
  safeLabel: 'Production subscription environment',
  portalRoute: '/company/company-1/dashboard',
  artifactKind: 'subscription-recommendations',
  sourceCompletedAt: completedAt,
  coverageStatus: 'partial',
  truncated: true,
  citationIds: ['environment-call-1'],
};
assert.deepEqual(Object.keys(JSON.parse(JSON.stringify(safeEvidenceMatch))).sort(), [
  'artifactKind',
  'citationIds',
  'coverageStatus',
  'portalRoute',
  'safeLabel',
  'sourceCompletedAt',
  'truncated',
]);
assert.equal(isAIEnvironmentEvidenceMatch(safeEvidenceMatch), true);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, storagePath: 'environment/runs/run-1' }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, scope }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, sourceGeneration: sourceBinding }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, portalRoute: '//evil.example/path' }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, portalRoute: '/companies/../admin' }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, sourceCompletedAt: 'yesterday' }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, coverageStatus: 'healthy' }), false);
assert.equal(isAIEnvironmentEvidenceMatch({ ...safeEvidenceMatch, citationIds: [] }), false);

const verifiedGrounding = {
  status: 'verified',
  method: 'deterministic-citation-and-value',
  totalClaimCount: 1,
  verifiedClaimCount: 1,
  claims: [{ claimId: 'claim-1', status: 'verified', citationIds: ['environment-call-1'] }],
};
assert.equal(isAIChatGroundingSummary(verifiedGrounding), true);
assert.equal(
  isAIChatGroundingSummary({
    status: 'unverified',
    method: 'deterministic-citation-and-value',
    totalClaimCount: 1,
    verifiedClaimCount: 0,
    claims: [{ claimId: 'claim-1', status: 'unverified', citationIds: [], reasonCode: 'grounding.missing-citation' }],
    reasonCode: 'grounding.missing-citation',
  }),
  true
);
assert.equal(
  isAIChatGroundingSummary({
    status: 'unverified',
    method: 'deterministic-citation-and-value',
    totalClaimCount: 0,
    verifiedClaimCount: 0,
    claims: [],
    reasonCode: 'grounding.claim-extraction-failed',
  }),
  true
);
assert.equal(
  isAIChatGroundingSummary({
    status: 'unverified',
    method: 'deterministic-citation-and-value',
    totalClaimCount: 2,
    verifiedClaimCount: 1,
    claims: [
      { claimId: 'claim-1', status: 'verified', citationIds: ['environment-call-1'] },
      { claimId: 'claim-2', status: 'unverified', citationIds: [], reasonCode: 'grounding.value-mismatch' },
    ],
    reasonCode: 'grounding.value-mismatch',
  }),
  true
);
assert.equal(
  isAIChatGroundingSummary({
    status: 'not-required',
    method: 'deterministic-citation-and-value',
    totalClaimCount: 0,
    verifiedClaimCount: 0,
    claims: [],
    reasonCode: 'grounding.not-required',
  }),
  true
);
assert.equal(isAIChatGroundingSummary({ ...verifiedGrounding, verifiedClaimCount: 0 }), false);
assert.equal(isAIChatGroundingSummary({ ...verifiedGrounding, confidencePercentage: 100 }), false);
assert.equal(isAIChatGroundingSummary({ ...verifiedGrounding, reasonCode: 'grounding.value-mismatch' }), false);
assert.equal(
  isAIChatGroundingSummary({ ...verifiedGrounding, claims: [...verifiedGrounding.claims, verifiedGrounding.claims[0]], totalClaimCount: 2 }),
  false
);
assert.equal(
  isAIChatGroundingSummary({
    status: 'not-required',
    method: 'deterministic-citation-and-value',
    totalClaimCount: 1,
    verifiedClaimCount: 1,
    claims: verifiedGrounding.claims,
    reasonCode: 'grounding.not-required',
  }),
  false
);
assert.equal(
  isAIChatGroundingSummary({
    ...verifiedGrounding,
    claims: [{ claimId: 'claim-1', status: 'verified', citationIds: [] }],
  }),
  false
);
assert.equal(
  isAIChatGroundingSummary({
    ...verifiedGrounding,
    totalClaimCount: 129,
    verifiedClaimCount: 129,
    claims: Array.from({ length: 129 }, (_, index) => ({
      claimId: `claim-${index}`,
      status: 'verified',
      citationIds: [`citation-${index}`],
    })),
  }),
  false,
  'grounding claim lists are bounded'
);
assert.equal(
  isAIChatGroundingSummary({
    ...verifiedGrounding,
    claims: [
      {
        claimId: 'claim-1',
        status: 'verified',
        citationIds: Array.from({ length: 33 }, (_, index) => `citation-${index}`),
      },
    ],
  }),
  false,
  'claim citation lists are bounded'
);
assert.equal(
  isAIChatGroundingSummary({
    ...verifiedGrounding,
    claims: [{ claimId: 'claim-1', status: 'verified', citationIds: ['citation-1', 'citation-1'] }],
  }),
  false,
  'claim citation identifiers are unique'
);

const environmentEsm = await import('@spottoai/types-package/environment');
const environmentCommonJs = createRequire(import.meta.url)('@spottoai/types-package/environment');
assert.equal(typeof environmentEsm.isEnvironmentSubscriptionProjectionV1, 'function', 'ESM environment subpath is exported');
assert.equal(typeof environmentCommonJs.isEnvironmentSubscriptionProjectionV1, 'function', 'CommonJS environment subpath is exported');
assert.equal(environmentEsm.isEnvironmentSubscriptionCostProjectionV1, undefined, 'cost-only ESM validator is not retained');
assert.equal(environmentCommonJs.isEnvironmentSubscriptionCostProjectionV1, undefined, 'cost-only CommonJS validator is not retained');

process.stdout.write('Environment contract checks passed.\n');
