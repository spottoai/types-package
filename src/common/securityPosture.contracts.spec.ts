import type { AwsSecurityPostureArtifact } from '../aws';
import type {
  SecurityPostureArtifact,
  SecurityPostureFinding,
  SecureScoreEvidence,
  ProviderScopeSelectionItem,
  SubscriptionHistoryItem,
  SubscriptionProperties,
} from '../index';
import { ProviderName, ProviderScopeType } from '../index';

const availableZeroEvidence: SecureScoreEvidence = {
  status: 'available',
  percentage: 0,
  providerName: 'aws',
  source: 'security-hub-cspm',
  method: 'control-pass-rate',
  controlCounts: { passed: 0, failed: 1, unknown: 0, noData: 2, disabled: 3 },
  observedAt: '2026-10-03T00:00:00.000Z',
  coverage: {
    status: 'available',
    scopes: [{ accountId: '123456789012', region: 'ap-southeast-2', source: 'security-hub-cspm', status: 'available' }],
  },
};

const artifact = {
  schemaVersion: 1,
  provider: 'aws',
  accountId: '123456789012',
  artifactType: 'security-posture',
  artifactGeneration: { runId: 'security-run-1', generatedAt: '2026-10-03T00:00:00.000Z' },
  providerName: 'aws',
  providerScopeId: '123456789012',
  companyId: 'company-1',
  generatedAt: '2026-10-03T00:00:00.000Z',
  status: 'available',
  secureScore: 0,
  secureScoreEvidence: availableZeroEvidence,
  coverage: availableZeroEvidence.coverage!,
  standards: [{ id: 'fsbp', name: 'AWS Foundational Security Best Practices', accountId: '123456789012', status: 'enabled' }],
  controls: [
    {
      id: 'IAM.1',
      source: 'security-hub',
      title: 'Remove root user access keys',
      status: 'failed',
      severity: 'critical',
      standardIds: ['fsbp'],
      scopeStatuses: [{ accountId: '123456789012', region: 'ap-southeast-2', status: 'failed' }],
    },
  ],
  findings: [],
} satisfies AwsSecurityPostureArtifact<'123456789012', 'security-run-1'>;

const neutralArtifact: SecurityPostureArtifact = artifact;
const unavailableEvidence: SecureScoreEvidence = {
  status: 'unavailable',
  providerName: 'aws',
  source: 'security-hub-cspm',
  reason: 'security-hub-not-enabled',
  coverage: {
    status: 'unavailable',
    scopes: [{ accountId: '123456789012', region: 'ap-southeast-2', source: 'security-hub-cspm', status: 'unavailable', reason: 'access-denied' }],
  },
};

const partialEvidence: SecureScoreEvidence = { ...unavailableEvidence, status: 'partial', reason: 'missing-region-evidence' };
const legacyAzureEvidence: SecureScoreEvidence = { status: 'available', percentage: 0, currentScore: 0, maxScore: 50, weight: 1 };
const summaryProperties: Pick<SubscriptionProperties, 'secureScore' | 'secureScoreEvidence'> = {
  secureScore: 0,
  secureScoreEvidence: availableZeroEvidence,
};
const historyEvidence: Pick<SubscriptionHistoryItem, 'secureScore' | 'secureScoreEvidence'> = {
  secureScore: 0,
  secureScoreEvidence: availableZeroEvidence,
};
const selector = {
  companyId: 'company-1',
  providerName: ProviderName.Aws,
  providerScopeId: '123456789012',
  scopeType: ProviderScopeType.Account,
  name: 'AWS production',
  cloudAccountId: 'cloud-account-1',
  cloudAccountName: 'AWS',
  ready: true,
  secureScore: 0,
  secureScoreEvidence: availableZeroEvidence,
} satisfies ProviderScopeSelectionItem;

const threatFinding: SecurityPostureFinding = {
  id: 'guardduty:finding-1',
  sourceId: 'finding-1',
  source: 'guardduty',
  kind: 'threat',
  accountId: '123456789012',
  title: 'Suspicious activity',
  severity: 'high',
  status: 'active',
  workflowStatus: 'NEW',
  resources: [{ id: 'i-123', providerName: 'aws', accountId: '123456789012', region: 'ap-southeast-2' }],
};
const vulnerabilityFinding: SecurityPostureFinding = { ...threatFinding, source: 'inspector', kind: 'vulnerability' };

const forbiddenCredential: AwsSecurityPostureArtifact = {
  ...artifact,
  // @ts-expect-error Public security artifacts never expose credential-store references.
  credentialReference: 'secret-reference',
};
const wrongAccount: AwsSecurityPostureArtifact<'123456789012'> = {
  ...artifact,
  // @ts-expect-error Publication account and neutral provider scope must bind to the same account.
  providerScopeId: '999999999999',
};
const unknownSource: SecurityPostureFinding = {
  ...threatFinding,
  // @ts-expect-error Unknown finding producers require a coordinated contract extension.
  source: 'unknown-provider-service',
};

void [
  neutralArtifact,
  unavailableEvidence,
  partialEvidence,
  legacyAzureEvidence,
  summaryProperties,
  historyEvidence,
  selector,
  vulnerabilityFinding,
  forbiddenCredential,
  wrongAccount,
  unknownSource,
];
