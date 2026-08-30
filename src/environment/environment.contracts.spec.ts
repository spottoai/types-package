import type {
  EnvironmentCompiledGenerationPointerV1,
  EnvironmentDocumentDescriptorV1,
  EnvironmentLogicalArtifactReferenceV1,
  EnvironmentLogicalResourceReferenceV1,
  EnvironmentSubscriptionCostProjectionV1,
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

const projection = {
  schemaVersion: 1,
  scope,
  sourceBinding,
  generatedAt: '2026-08-29T00:00:01.000Z',
  subscription: {
    safeLabel: 'Production',
    portalRoute: '/companies/company-1/subscriptions/subscription-1',
  },
  sourceCoverage: {
    subscriptionSummary: { status: 'complete', observedAt: '2026-08-29T00:00:00.000Z' },
    resources: { status: 'complete' },
    recommendations: { status: 'partial', reason: 'Some recommendation sources were unavailable.' },
    costs: { status: 'complete' },
    savings: { status: 'complete' },
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
    resourceCount: 1,
    recommendationCount: 1,
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
  estateCostRollups: { items: [], totalCount: 0, includedCount: 0, truncated: false },
  costDrivers: { items: [], totalCount: 0, includedCount: 0, truncated: false },
  recommendations: { items: [], totalCount: 0, includedCount: 0, truncated: false },
  changes: { items: [], totalCount: 0, includedCount: 0, truncated: false },
  warnings: { items: [], totalCount: 0, includedCount: 0, truncated: false },
  sourceReferences: [artifactReference, resourceReference],
} satisfies EnvironmentSubscriptionCostProjectionV1;

const descriptors: EnvironmentDocumentDescriptorV1[] = [
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
    byteCount: 100,
    contentSha256: 'b'.repeat(64),
    approximateTokenCount: 25,
  },
  {
    name: 'pillars/cost.md',
    mediaType: 'text/markdown; charset=utf-8',
    byteCount: 100,
    contentSha256: 'c'.repeat(64),
    approximateTokenCount: 25,
  },
];

const pointer = {
  schemaVersion: 1,
  status: 'completed',
  environmentRunId: '550e8400-e29b-41d4-a716-446655440000',
  scope,
  sourceBinding,
  treeDigestSha256: 'd'.repeat(64),
  fileCount: 3,
  generatedAt: '2026-08-29T00:00:01.000Z',
} satisfies EnvironmentCompiledGenerationPointerV1;

void projection;
void descriptors;
void pointer;

const invalidDescriptorName: EnvironmentDocumentDescriptorV1 = {
  // @ts-expect-error V1 has an exact document-name allowlist.
  name: 'pillars/security.md',
  mediaType: 'text/markdown; charset=utf-8',
  byteCount: 1,
  contentSha256: 'a'.repeat(64),
  approximateTokenCount: 1,
};

// @ts-expect-error completed V1 pointers always publish exactly three files.
const invalidFileCount: EnvironmentCompiledGenerationPointerV1 = { ...pointer, fileCount: 2 };

void invalidDescriptorName;
void invalidFileCount;
