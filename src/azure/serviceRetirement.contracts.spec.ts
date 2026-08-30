import type {
  KeyVaultObjectRetirementRenderData,
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

void retirement;
void coverage;
void portfolioKind;
