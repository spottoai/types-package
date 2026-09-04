import type * as EnvironmentContracts from './index.js';
import type {
  EnvironmentCompiledGenerationPointerV1,
  EnvironmentCardinalityV1,
  EnvironmentDocumentDescriptorV1,
  EnvironmentLogicalArtifactReferenceV1,
  EnvironmentLogicalResourceReferenceV1,
  EnvironmentMoneyValueV1,
  EnvironmentRecommendationV1,
  EnvironmentSubscriptionProjectionV1,
  EnvironmentTenantCompiledGenerationPointerV1,
  EnvironmentTenantProjectionV1,
} from './index.js';

const scope = {
  kind: 'azure-subscription',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  subscriptionId: 'subscription-1',
} as const;

const sourceBinding = {
  kind: 'azure-subscription-view-set',
  viewSetSchemaVersion: 1,
  scope,
  publicationId: 'publication:1',
  portalRunId: 'portal:run/1',
  pluginRunId: 'plugin:run/1',
  economicsGenerationId: 'economics:1',
  economicsFingerprint: 'sha256:source-owned-value',
  completedAt: '2026-08-29T00:00:00.000Z',
} as const;

const artifactReference =
  'spotto://artifact/v1/subscription-summary/WyJhenVyZS1zdWJzY3JpcHRpb24iLCJ0ZW5hbnQtMSIsImNvbXBhbnktMSIsInN1YnNjcmlwdGlvbi0xIl0' as EnvironmentLogicalArtifactReferenceV1;
const resourceReference =
  'spotto://resource/v1/L3N1YnNjcmlwdGlvbnMvc3Vic2NyaXB0aW9uLTEvcmVzb3VyY2VHcm91cHMvcmcvcHJvdmlkZXJzL01pY3Jvc29mdC5Db21wdXRlL3ZpcnR1YWxNYWNoaW5lcy92bQ' as EnvironmentLogicalResourceReferenceV1;

const emptyList = { items: [], totalCount: 0, includedCount: 0, truncated: false };
const completeCoverage = { status: 'complete' } as const;
const exactAffectedResources = { basis: 'exact', value: 1 } as const;

const projection = {
  schemaVersion: 1,
  scope,
  sourceBinding,
  generatedAt: '2026-08-29T00:00:01.000Z',
  subscription: {
    safeLabel: 'Production',
    portalRoute: '/company/company-1/dashboard',
  },
  sourceCoverage: {
    completedViewSet: completeCoverage,
    subscriptionSummary: { status: 'complete', observedAt: '2026-08-29T00:00:00.000Z' },
    resources: completeCoverage,
    recommendations: { status: 'partial', reason: 'Some recommendation sources were unavailable.' },
    serviceRetirements: completeCoverage,
    monitorAlerts: { status: 'not-collected', reason: 'Monitor alerts were not requested.' },
    pluginMetrics: { status: 'partial', reason: 'Some resource families do not expose supported metrics.' },
  },
  estateSummary: {
    resourceCount: 1,
    serviceFamilyCount: 1,
    locationCount: 1,
  },
  costSummary: {
    observedCost: {
      amount: '125.40',
      currencyCode: 'NZD',
      basis: 'billed',
      period: '2026-08',
      provenance: 'subscription-summary',
    },
    potentialSavings: {
      amount: '25.00',
      currencyCode: 'NZD',
      basis: 'billed',
      period: 'monthly',
      provenance: 'savings-aggregate',
      savingsAdditivity: 'scenario-non-additive',
    },
    costRecommendationCount: 1,
  },
  serviceFamilyRollups: {
    items: [
      {
        key: 'microsoft.compute/virtualmachines',
        safeLabel: 'Virtual machines',
        resourceCount: 1,
        observedCost: {
          amount: '125.40',
          currencyCode: 'NZD',
          basis: 'billed',
          period: '2026-08',
          provenance: 'subscription-resources',
        },
        sourceReferences: [resourceReference],
      },
    ],
    totalCount: 1,
    includedCount: 1,
    truncated: false,
  },
  estateCostRollups: emptyList,
  costDrivers: emptyList,
  pillars: {
    cost: {
      pillar: 'cost',
      coverage: completeCoverage,
      findingCount: 1,
      recommendationCount: 1,
      affectedResources: exactAffectedResources,
      portalRoute: '/company/company-1/cost-analysis',
      sourceReferences: [artifactReference],
    },
    security: {
      pillar: 'security',
      coverage: completeCoverage,
      findingCount: 1,
      recommendationCount: 1,
      affectedResources: exactAffectedResources,
      portalRoute: '/company/company-1/recommendations',
      score: { value: '72.5', maximum: '100', safeLabel: 'Secure score' },
      sourceReferences: [artifactReference],
    },
    governance: {
      pillar: 'governance',
      coverage: { status: 'partial', reason: 'Compliance recommendations are available; independent governance sidecars are not bound.' },
      findingCount: 0,
      recommendationCount: 1,
      affectedResources: { basis: 'lower-bound', value: 1, reason: 'Only category-level overlap evidence is available.' },
      portalRoute: '/company/company-1/recommendations',
      sourceReferences: [artifactReference],
    },
    reliability: {
      pillar: 'reliability',
      coverage: completeCoverage,
      findingCount: 1,
      recommendationCount: 1,
      affectedResources: exactAffectedResources,
      portalRoute: '/company/company-1/recommendations',
      sourceReferences: [artifactReference],
    },
    performance: {
      pillar: 'performance',
      coverage: { status: 'partial', reason: 'Metrics are unavailable for some resource types.' },
      findingCount: 1,
      recommendationCount: 1,
      affectedResources: exactAffectedResources,
      portalRoute: '/company/company-1/recommendations',
      sourceReferences: [artifactReference],
    },
    operations: {
      pillar: 'operations',
      coverage: completeCoverage,
      findingCount: 1,
      recommendationCount: 1,
      affectedResources: { basis: 'unavailable', reason: 'The source does not identify distinct affected resources.' },
      portalRoute: '/company/company-1/recommendations',
      sourceReferences: [artifactReference],
    },
  },
  findings: {
    items: [
      {
        findingId: 'security-score',
        pillar: 'security',
        kind: 'security-posture',
        safeLabel: 'Secure score requires attention',
        severity: 'high',
        affectedResources: exactAffectedResources,
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
        affectedResources: exactAffectedResources,
        resourceReferences: [resourceReference],
        sourceReferences: [artifactReference],
      },
    ],
    totalCount: 1,
    includedCount: 1,
    truncated: false,
  },
  changes: emptyList,
  warnings: emptyList,
  sourceReferences: [artifactReference, resourceReference],
} satisfies EnvironmentSubscriptionProjectionV1;

const descriptors: EnvironmentDocumentDescriptorV1[] = [
  'projection.json',
  'environment-index.md',
  'pillars/cost.md',
  'pillars/security.md',
  'pillars/governance.md',
  'pillars/reliability.md',
  'pillars/performance.md',
  'pillars/operations.md',
].map((name, index) => ({
  name,
  mediaType: name === 'projection.json' ? ('application/json' as const) : ('text/markdown; charset=utf-8' as const),
  byteCount: 100,
  contentSha256: `${index}`.repeat(64),
  approximateTokenCount: 25,
})) as EnvironmentDocumentDescriptorV1[];

const pointer = {
  schemaVersion: 1,
  status: 'completed',
  environmentRunId: '550e8400-e29b-41d4-a716-446655440000',
  scope,
  sourceBinding,
  treeDigestSha256: 'd'.repeat(64),
  fileCount: 8,
  generatedAt: '2026-08-29T00:00:01.000Z',
} satisfies EnvironmentCompiledGenerationPointerV1;

void projection;
void descriptors;
void pointer;

const unknownMoney = {
  amount: '125.40',
  currencyCode: 'unknown',
  basis: 'unknown',
  period: 'unknown',
  provenance: 'subscription-summary',
} satisfies EnvironmentMoneyValueV1;

// @ts-expect-error unavailable cardinality cannot claim a numeric value.
const invalidUnavailableCardinality: EnvironmentCardinalityV1 = { basis: 'unavailable', value: 1, reason: 'Unavailable.' };

const recommendationWithoutConfidence = projection.recommendations.items[0] satisfies EnvironmentRecommendationV1;
const invalidRecommendationConfidence: EnvironmentRecommendationV1 = {
  ...recommendationWithoutConfidence,
  // @ts-expect-error environment recommendations no longer expose numeric confidence.
  confidencePercentage: '90',
};

void unknownMoney;
void invalidUnavailableCardinality;
void invalidRecommendationConfidence;

// @ts-expect-error The unpublished cost-only draft was replaced rather than versioned.
type RemovedCostOnlyProjection = EnvironmentContracts.EnvironmentSubscriptionCostProjectionV1;

const invalidDescriptorName: EnvironmentDocumentDescriptorV1 = {
  // @ts-expect-error V1 has an exact document-name allowlist.
  name: 'pillars/sustainability.md',
  mediaType: 'text/markdown; charset=utf-8',
  byteCount: 1,
  contentSha256: 'a'.repeat(64),
  approximateTokenCount: 1,
};

// @ts-expect-error completed V1 pointers always publish exactly eight files.
const invalidFileCount: EnvironmentCompiledGenerationPointerV1 = { ...pointer, fileCount: 3 };

void (undefined as unknown as RemovedCostOnlyProjection);
void invalidDescriptorName;
void invalidFileCount;

const tenantScope = { kind: 'azure-tenant', tenantId: 'tenant-1' } as const;
const tenantSourceBinding = {
  kind: 'azure-tenant-sync',
  scope: tenantScope,
  tenantSyncRunId: 'tenant-sync:run/1',
  completedAt: '2026-08-29T00:00:00.000Z',
} as const;
const tenantEmptyList = { items: [], totalCount: 0, includedCount: 0, truncated: false };
const tenantProjection = {
  schemaVersion: 1,
  scope: tenantScope,
  sourceBinding: tenantSourceBinding,
  generatedAt: '2026-08-29T00:00:01.000Z',
  tenant: { safeLabel: 'Azure tenant' },
  sourceCoverage: { tenantSync: completeCoverage, governance: completeCoverage, identity: completeCoverage, commitments: completeCoverage },
  identitySummary: {
    applicationCount: 0,
    servicePrincipalCount: 0,
    globalAdministratorCount: 0,
    permanentGlobalAdministratorCount: 0,
    eligibleGlobalAdministratorCount: 0,
    mfaKnownGlobalAdministratorCount: 0,
  },
  governanceSummary: {
    managementGroupCount: 0,
    subscriptionCount: 0,
    policyAssignmentCount: 0,
    policyExemptionCount: 0,
    roleAssignmentCount: 0,
    privilegedAssignmentCount: 0,
    customRoleCount: 0,
    findingCount: 0,
  },
  commitmentSummary: { reservationCount: 0, savingsPlanCount: 0, expiringWithin90DaysCount: 0 },
  globalAdministrators: tenantEmptyList,
  governanceFindings: tenantEmptyList,
  commitments: tenantEmptyList,
  warnings: tenantEmptyList,
  sourceReferences: [],
} satisfies EnvironmentTenantProjectionV1;
const tenantPointer = {
  schemaVersion: 1,
  status: 'completed',
  environmentRunId: '550e8400-e29b-41d4-a716-446655440009',
  scope: tenantScope,
  sourceBinding: tenantSourceBinding,
  treeDigestSha256: 'e'.repeat(64),
  fileCount: 5,
  generatedAt: '2026-08-29T00:00:01.000Z',
} satisfies EnvironmentTenantCompiledGenerationPointerV1;

void tenantProjection;
void tenantPointer;
