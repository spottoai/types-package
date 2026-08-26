import {
  AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES,
  ProviderName,
  buildAwsOrganizationCommitmentsSessionId,
  type AwsCommitmentsPlanningReadScope,
  type AwsOrganizationCommitmentsPlanningView,
  type AwsOrganizationCommitmentsRefreshAcceptedResponse,
  type AwsOrganizationCommitmentsRefreshCommand,
  type AwsOrganizationCommitmentsScopeListResponse,
  type AwsOrganizationCommitmentsRefreshStatusResponse,
} from '../index';

const companyId = 'company-example' as const;
const estateId = 'estate-example' as const;
const organizationId = 'o-exampleorg123' as const;
const managementAccountId = '111122223333' as const;
const memberAccountId = '444455556666' as const;

const command: AwsOrganizationCommitmentsRefreshCommand = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'organization-commitments',
  action: 'refresh',
  companyId,
  estateId,
  manifestRevision: 'etag-42',
  requestId: 'request-org-commitments',
  correlationId: 'correlation-org-commitments',
  requestedAt: '2026-08-25T00:00:00.000Z',
};

const accountScope: AwsCommitmentsPlanningReadScope = {
  provider: 'AWS',
  scopeType: 'account',
  accountId: memberAccountId,
};

const organizationScope: AwsCommitmentsPlanningReadScope = {
  provider: 'AWS',
  scopeType: 'organization',
  companyId,
  estateId,
  organizationId,
  managementAccountId,
};

const accepted: AwsOrganizationCommitmentsRefreshAcceptedResponse = {
  schemaVersion: 1,
  ...organizationScope,
  requestId: command.requestId,
  correlationId: command.correlationId,
  manifestRevision: command.manifestRevision,
  disposition: 'accepted',
  acceptedAt: command.requestedAt,
};

const cooldown: AwsOrganizationCommitmentsRefreshAcceptedResponse = {
  ...accepted,
  disposition: 'cooldown',
  nextEligibleAt: '2026-08-25T00:05:00.000Z',
};

const scopeList: AwsOrganizationCommitmentsScopeListResponse = {
  schemaVersion: 1,
  provider: 'AWS',
  companyId,
  organizations: [
    {
      scopeType: 'organization',
      estateId,
      name: 'Example organization',
      organizationId,
      managementAccountId,
      accountCount: 2,
      availability: 'available',
      canView: true,
      canRefresh: true,
    },
  ],
};

const status: AwsOrganizationCommitmentsRefreshStatusResponse = {
  schemaVersion: 1,
  ...organizationScope,
  targetManifestRevision: command.manifestRevision,
  state: 'processing',
  requestId: command.requestId,
  correlationId: command.correlationId,
  requestedAt: command.requestedAt,
  updatedAt: command.requestedAt,
  stages: AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES.map(id => ({
    id,
    status: id === 'account-inventory' ? 'fresh' : 'pending',
    updatedAt: command.requestedAt,
  })),
};

const view: AwsOrganizationCommitmentsPlanningView<
  typeof companyId,
  typeof estateId,
  typeof organizationId,
  typeof managementAccountId | typeof memberAccountId
> = {
  version: '1.0',
  generatedAt: '2026-08-25T01:00:00.000Z',
  manifestRevision: command.manifestRevision,
  providerScope: {
    providerName: ProviderName.Aws,
    providerScopeId: organizationId,
    scopeType: 'organization',
    companyId,
    estateId,
    organizationId,
    managementAccountId,
  },
  accounts: [
    {
      accountId: managementAccountId,
      role: 'management',
      inventoryStatus: 'current',
    },
    {
      accountId: memberAccountId,
      role: 'member',
      inventoryStatus: 'current',
    },
  ],
  utilizationSummary: { total: 1, withData: 0, byBenefitType: [] },
  expirySummary: { expired: 0, expiring30d: 0, expiring60d: 0, expiring90d: 0, expiring180d: 0 },
  inventory: [
    {
      id: 'ri-1',
      benefitType: 'reservation',
      commitmentFamily: 'compute-reservation',
      sourceKind: 'aws-native',
      sourceId: 'arn:aws:ec2:ap-southeast-2:444455556666:reserved-instances/ri-1',
      provider: ProviderName.Aws,
      ownerAccountId: memberAccountId,
      scope: 'Single',
      type: 'ec2-reserved-instance',
      status: 'active',
    },
  ],
  payerAggregates: [
    {
      benefitType: 'reservation',
      commitmentFamily: 'compute-reservation',
      payerAccountId: managementAccountId,
      windowStart: '2026-07-26',
      windowEnd: '2026-08-25',
      coveragePercent: 75,
      source: { sourceKind: 'aws-native', sourceId: 'ce:payer:reservation-coverage' },
    },
  ],
  sharingPosture: { status: 'unknown', reason: 'not-collected' },
  pricingContext: { source: 'recommendation-apis', currency: 'USD' },
  purchaseRecommendations: [
    {
      id: 'payer-rec-1',
      groupKey: 'compute-savings-plan:payer',
      commitmentFamily: 'compute-savings-plan',
      action: 'buy',
      purchaseScope: 'payer',
      payerAccountId: managementAccountId,
      targetShape: { provider: 'aws', commitmentFamily: 'compute-savings-plan' },
      source: { sourceKind: 'aws-native', sourceId: 'ce:payer:sp-recommendation' },
    },
  ],
  allocation: { status: 'unavailable', reason: 'not-proved' },
  resourceAttribution: { status: 'unavailable', reason: 'not-proved' },
};

const invalidCommandWithOrganization: AwsOrganizationCommitmentsRefreshCommand = {
  ...command,
  // @ts-expect-error Organization identity is resolved from the exact manifest revision.
  organizationId,
};

// @ts-expect-error Cooldown admission must tell the caller when refresh becomes eligible.
const invalidCooldown: AwsOrganizationCommitmentsRefreshAcceptedResponse = {
  ...accepted,
  disposition: 'cooldown',
};

const sessionId = buildAwsOrganizationCommitmentsSessionId(companyId, estateId);

const invalidCommandWithRole: AwsOrganizationCommitmentsRefreshCommand = {
  ...command,
  // @ts-expect-error Commands never carry manifest-owned role metadata.
  roleArn: 'arn:aws:iam::111122223333:role/ExampleRole',
};

// @ts-expect-error Account read scope remains exact-account and does not masquerade as an organization.
const invalidAccountScopeCompany: AwsCommitmentsPlanningReadScope = {
  provider: 'AWS',
  scopeType: 'account',
  accountId: memberAccountId,
  companyId,
};

// @ts-expect-error Unavailable attribution cannot carry records.
const invalidUnavailableAllocation: AwsOrganizationCommitmentsPlanningView['allocation'] = {
  status: 'unavailable',
  reason: 'not-proved',
  records: [],
};

// @ts-expect-error Available attribution requires proved source metadata and records.
const invalidAvailableAllocation: AwsOrganizationCommitmentsPlanningView['allocation'] = {
  status: 'available',
  records: [],
};

void [
  command,
  accountScope,
  organizationScope,
  accepted,
  cooldown,
  scopeList,
  status,
  view,
  invalidCommandWithOrganization,
  invalidCooldown,
  invalidCommandWithRole,
  invalidAccountScopeCompany,
  invalidUnavailableAllocation,
  invalidAvailableAllocation,
  sessionId,
];
