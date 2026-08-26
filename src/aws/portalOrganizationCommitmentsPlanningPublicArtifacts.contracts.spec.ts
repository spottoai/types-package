import {
  AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME,
  AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  ProviderName,
  type AwsPortalOrganizationCommitmentsPlanningArtifact,
} from '../index';

const artifact = {
  schemaVersion: AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: 1,
  provider: 'aws',
  artifactType: 'organization-commitments-planning',
  artifactGeneration: { runId: 'org-run-1', generatedAt: '2026-08-25T01:00:00.000Z' },
  logicalName: AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME,
  manifestRevision: 'etag-42',
  version: '1.0',
  generatedAt: '2026-08-25T01:00:00.000Z',
  providerScope: {
    providerName: ProviderName.Aws,
    providerScopeId: 'o-exampleorg123',
    scopeType: 'organization',
    companyId: 'company-example',
    estateId: 'estate-example',
    organizationId: 'o-exampleorg123',
    managementAccountId: '111122223333',
  },
  accounts: [
    { accountId: '111122223333', role: 'management', inventoryStatus: 'current' },
    { accountId: '444455556666', role: 'member', inventoryStatus: 'current' },
  ],
  utilizationSummary: { total: 0, withData: 0, byBenefitType: [] },
  expirySummary: { expired: 0, expiring30d: 0, expiring60d: 0, expiring90d: 0, expiring180d: 0 },
  inventory: [],
  payerAggregates: [],
  sharingPosture: { status: 'unknown', reason: 'not-collected' },
  pricingContext: { source: 'unknown' },
  allocation: { status: 'unavailable', reason: 'not-proved' },
  resourceAttribution: { status: 'unavailable', reason: 'not-proved' },
} satisfies AwsPortalOrganizationCommitmentsPlanningArtifact<
  'company-example',
  'estate-example',
  'o-exampleorg123',
  '111122223333' | '444455556666',
  'org-run-1'
>;

const invalidAccountEnvelope: AwsPortalOrganizationCommitmentsPlanningArtifact = {
  ...artifact,
  // @ts-expect-error Organization artifacts never use the account-only public envelope.
  accountId: '111122223333',
};

const invalidLogicalName: AwsPortalOrganizationCommitmentsPlanningArtifact = {
  ...artifact,
  // @ts-expect-error Organization planning has one package-owned logical name.
  logicalName: 'commitments-planning.json.gz',
};

void [artifact, invalidAccountEnvelope, invalidLogicalName];
