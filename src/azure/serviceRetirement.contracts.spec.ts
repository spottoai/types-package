import type {
  AwsCertificateRetirementRenderData,
  KeyVaultObjectRetirementRenderData,
  ServiceRetirementKnownRenderKind,
  ServiceRetirementRenderData,
  KeyVaultRetirementCoverageArtifact,
  ServiceRetirementPortalEntry,
} from './serviceRetirement';
import type { PortfolioExpiryKind } from '../portfolio/portfolioOperations';
import {
  ProviderName,
  type CredentialLifecycleRetirementRenderData,
  type ServiceRetirementCoverageArtifact,
  type ServiceRetirementDeadlineKind,
  type ServiceRetirementResourceCoverage,
  type ServiceRetirementSourceCoverage,
} from '../index';

const renderData: KeyVaultObjectRetirementRenderData = {
  kind: 'key-vault-object',
  vaultResourceId: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.KeyVault/vaults/vault-1',
  vaultName: 'vault-1',
  objectName: 'api-token',
  objectType: 'secret',
  enabled: true,
};

const retirement: ServiceRetirementPortalEntry = {
  Id: 'key-vault:example',
  ServiceName: 'Azure Key Vault',
  RetiringFeature: 'vault-1/api-token secret expires',
  RetirementDate: '2026-09-30T00:00:00.000Z',
  Link: 'https://portal.azure.com/',
  effort: 'Low',
  effortHours: 2,
  effortReason: 'Rotate the object and update its consumers.',
  risk: 'High',
  riskReason: 'Consumers may fail after the configured expiry.',
  considerations: 'Review dependent services before rotation.',
  confidencePercentage: 95,
  confidenceReason: 'Expiry is sourced from Key Vault metadata.',
  lastProcessedAt: '2026-08-29T00:00:00.000Z',
  resources: [{ id: renderData.vaultResourceId, name: renderData.vaultName, resourceType: 'microsoft.keyvault/vaults' }],
  renderData,
};

const coverage: KeyVaultRetirementCoverageArtifact = {
  schemaVersion: 1,
  generatedAt: '2026-08-29T00:00:00.000Z',
  subscriptionId: 'sub-1',
  status: 'current',
  vaultCount: 1,
  currentVaultCount: 1,
  vaults: [
    {
      vaultResourceId: renderData.vaultResourceId,
      vaultName: renderData.vaultName,
      authorizationModel: 'rbac',
      families: [{ objectType: 'secret', status: 'current', itemCount: 1 }],
    },
  ],
};

const portfolioKind: PortfolioExpiryKind = 'key-vault-secret';

const awsCertificate: AwsCertificateRetirementRenderData = {
  kind: 'aws-certificate',
  manager: 'acm',
  certificateArn: 'arn:aws:acm:ap-southeast-2:123456789012:certificate/11111111-2222-3333-4444-555555555555',
  domainName: 'example.com',
  certificateType: 'AMAZON_ISSUED',
  renewalEligibility: 'ELIGIBLE',
  renewalStatus: 'PENDING_AUTO_RENEWAL',
  keyAlgorithm: 'RSA_2048',
  inUseBy: ['arn:aws:elasticloadbalancing:ap-southeast-2:123456789012:loadbalancer/app/web/0123456789abcdef'],
};
const iamCertificate: AwsCertificateRetirementRenderData = {
  kind: 'aws-certificate',
  manager: 'iam',
  certificateArn: 'arn:aws:iam::123456789012:server-certificate/legacy-web',
};
const awsRetirement: ServiceRetirementPortalEntry = { ...retirement, renderData: awsCertificate };
const awsKind: ServiceRetirementKnownRenderKind = awsCertificate.kind;
/** Unregistered kinds still fall back to the unknown render data shape. */
const futureRenderData: ServiceRetirementRenderData = { kind: 'future-kind', anything: 1 };
const invalidManager: AwsCertificateRetirementRenderData = {
  ...iamCertificate,
  // @ts-expect-error Only ACM and IAM manage AWS certificates.
  manager: 'key-vault',
};

void [awsRetirement, awsKind, futureRenderData, invalidManager];
void retirement;
void coverage;
void portfolioKind;

const apiKey: CredentialLifecycleRetirementRenderData = {
  kind: 'credential-lifecycle',
  credentialType: 'api-key',
  credentialId: 'credential-1',
  credentialName: 'Application API key',
  resourceId: 'arn:aws:iam::123456789012:user/application',
};
const awsScope = { providerName: ProviderName.Aws, providerScopeId: '123456789012' };
const apiKeyExpiry: ServiceRetirementPortalEntry = {
  ...retirement,
  Id: 'credential-expiry:example',
  ServiceName: 'Amazon Bedrock',
  deadlineKind: 'expiry',
  providerScope: awsScope,
  sourceId: 'iam-service-specific-credentials',
  renderData: apiKey,
};
const secretRotation: ServiceRetirementPortalEntry = {
  ...apiKeyExpiry,
  deadlineKind: 'rotation-due',
  renderData: {
    kind: 'credential-lifecycle',
    credentialType: 'secret',
    credentialId: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:database-example',
    rotationEnabled: true,
    lastRotatedAt: '2026-09-01T00:00:00.000Z',
  } satisfies CredentialLifecycleRetirementRenderData,
};
const keyMaterialExpiry: ServiceRetirementPortalEntry = {
  ...apiKeyExpiry,
  renderData: { ...apiKey, credentialType: 'key-material' } satisfies CredentialLifecycleRetirementRenderData,
};
const passwordExpiry: ServiceRetirementPortalEntry = {
  ...apiKeyExpiry,
  renderData: { ...apiKey, credentialType: 'password' } satisfies CredentialLifecycleRetirementRenderData,
};
const unresolvedNotice: ServiceRetirementPortalEntry = {
  ...retirement,
  deadlineKind: 'end-of-support',
  resources: [],
  resourceCoverage: { status: 'unresolved', reasonCode: 'affected-resource-not-discovered' },
};
const currentSource: ServiceRetirementSourceCoverage = {
  sourceId: 'acm-certificate-expiry',
  region: 'us-east-1',
  support: 'supported',
  attempt: 'succeeded',
  coverage: 'complete',
  freshness: 'current',
  lastSuccessfulRefreshAt: '2026-10-04T00:00:00.000Z',
  itemCount: 0,
  lookaheadDays: 45,
};
const sourceCoverage: ServiceRetirementCoverageArtifact = {
  schemaVersion: 1,
  generatedAt: '2026-10-04T00:00:00.000Z',
  providerScope: awsScope,
  sources: [
    currentSource,
    { ...currentSource, sourceId: 'new-provider-source', coverage: 'partial', reasonCode: 'collection-truncated' },
    { ...currentSource, region: 'eu-west-1', attempt: 'failed', freshness: 'stale', reasonCode: 'permission-denied' },
    {
      sourceId: 'aws-health-scheduled-change',
      support: 'supported',
      attempt: 'failed',
      coverage: 'none',
      freshness: 'unknown',
      reasonCode: 'support-plan-required',
    },
    { sourceId: 'uncollected-source', support: 'unknown', attempt: 'not-attempted', coverage: 'unknown', freshness: 'unknown' },
    { sourceId: 'unsupported-source', support: 'unsupported', attempt: 'not-attempted', coverage: 'none', freshness: 'unknown' },
  ],
};
const azureSourceCoverage: ServiceRetirementCoverageArtifact = {
  ...sourceCoverage,
  providerScope: { providerName: ProviderName.Azure, providerScopeId: 'sub-1' },
};
const newKnownKind: ServiceRetirementKnownRenderKind = apiKey.kind;
const deadlineKinds: ServiceRetirementDeadlineKind[] = ['retirement', 'deprecation', 'end-of-support', 'expiry', 'rotation-due'];
// @ts-expect-error Age-based access-key policy is not a true expiry or rotation source deadline.
const invalidDeadline: ServiceRetirementDeadlineKind = 'access-key-age';
const invalidCredential: CredentialLifecycleRetirementRenderData = {
  ...apiKey,
  // @ts-expect-error Public render metadata cannot carry credential values.
  secretValue: 'must-not-publish',
};
const invalidCredentialType: CredentialLifecycleRetirementRenderData = {
  ...apiKey,
  // @ts-expect-error A provider service is not a generic credential type.
  credentialType: 'bedrock',
};
// @ts-expect-error Unresolved resource matching requires a safe reason code.
const unresolvedWithoutReason: ServiceRetirementResourceCoverage = { status: 'unresolved' };
const invalidSourceCoverage: ServiceRetirementSourceCoverage = {
  ...currentSource,
  // @ts-expect-error Source freshness is distinct from collection availability.
  freshness: 'unavailable',
};
const invalidCoverageVersion: ServiceRetirementCoverageArtifact = {
  ...sourceCoverage,
  // @ts-expect-error This artifact defines exactly schema version 1.
  schemaVersion: 2,
};
void [apiKeyExpiry, secretRotation, keyMaterialExpiry, passwordExpiry, unresolvedNotice, sourceCoverage, azureSourceCoverage, newKnownKind];
void [
  deadlineKinds,
  invalidDeadline,
  invalidCredential,
  invalidCredentialType,
  unresolvedWithoutReason,
  invalidSourceCoverage,
  invalidCoverageVersion,
];
