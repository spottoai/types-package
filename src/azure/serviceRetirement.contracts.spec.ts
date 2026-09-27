import type {
  AwsCertificateRetirementRenderData,
  KeyVaultObjectRetirementRenderData,
  ServiceRetirementKnownRenderKind,
  ServiceRetirementRenderData,
  KeyVaultRetirementCoverageArtifact,
  ServiceRetirementPortalEntry,
} from './serviceRetirement';
import type { PortfolioExpiryKind } from '../portfolio/portfolioOperations';

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
