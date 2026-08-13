import {
  AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME,
  AWS_PORTAL_PUBLIC_ARTIFACT_RELATIONSHIPS,
  AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  ProviderName,
  type AwsPortalCommitmentsPlanningArtifact,
  type AwsPortalPublicLogicalName,
} from '../index';

const accountId = '123456789012' as const;
const generatedAt = '2026-08-13T00:00:00.000Z';

const artifact = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType: 'commitments-planning',
  artifactGeneration: { runId: 'portal-run-1', generatedAt },
  logicalName: AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME,
  version: '2.0',
  generatedAt,
  providerScope: {
    providerName: ProviderName.Aws,
    providerScopeId: accountId,
  },
  utilizationSummary: { total: 0, withData: 0, byBenefitType: [] },
  expirySummary: { expired: 0, expiring30d: 0, expiring60d: 0, expiring90d: 0, expiring180d: 0 },
  inventory: [],
  resourceCoverage: [],
  obsoleteCandidates: [],
  pricingContext: { source: 'unknown' },
  termStrategy: [],
} satisfies AwsPortalCommitmentsPlanningArtifact<typeof accountId, 'portal-run-1'>;

const logicalName: AwsPortalPublicLogicalName = AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME;
const relationship = AWS_PORTAL_PUBLIC_ARTIFACT_RELATIONSHIPS['commitments-planning'];

const invalidLogicalName: AwsPortalCommitmentsPlanningArtifact = {
  ...artifact,
  // @ts-expect-error The immutable current artifact has one package-owned logical name.
  logicalName: 'private-commitments.json.gz',
};

const invalidAccountBinding: AwsPortalCommitmentsPlanningArtifact<typeof accountId> = {
  ...artifact,
  providerScope: {
    ...artifact.providerScope,
    // @ts-expect-error Provider scope identity must match the immutable envelope account.
    providerScopeId: '999999999999',
  },
};

const invalidCredentialReference: AwsPortalCommitmentsPlanningArtifact = {
  ...artifact,
  // @ts-expect-error Public artifacts cannot expose credential-store locators.
  credentialReference: 'secret-store-key',
};

void [artifact, logicalName, relationship, invalidLogicalName, invalidAccountBinding, invalidCredentialReference];
