import assert from 'node:assert/strict';

import {
  AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME,
  AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  buildAwsOrganizationCommitmentsSessionId,
  validateAwsOrganizationCommitmentsPlanningViewIdentity,
  validateAwsOrganizationCommitmentsRefreshAcceptedResponse,
  validateAwsOrganizationCommitmentsRefreshStatusResponse,
  validateAwsOrganizationCommitmentsScopeListResponse,
  validateAwsPortalOrganizationCommitmentsPlanningArtifact,
} from '../dist/aws/index.js';

const companyId = 'company-example';
const estateId = 'estate-example';
const organizationId = 'o-exampleorg123';
const managementAccountId = '111122223333';
const memberAccountId = '444455556666';
const generatedAt = '2026-08-25T01:00:00.000Z';

const artifact = {
  schemaVersion: AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  portalSchemaVersion: 1,
  provider: 'aws',
  artifactType: 'organization-commitments-planning',
  artifactGeneration: { runId: 'org-run-1', generatedAt },
  logicalName: AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME,
  manifestRevision: 'etag-42',
  version: '1.0',
  generatedAt,
  providerScope: {
    providerName: 'aws',
    providerScopeId: organizationId,
    scopeType: 'organization',
    companyId,
    estateId,
    organizationId,
    managementAccountId,
  },
  accounts: [
    { accountId: managementAccountId, role: 'management', inventoryStatus: 'current' },
    { accountId: memberAccountId, role: 'member', inventoryStatus: 'current' },
  ],
  utilizationSummary: { total: 1, withData: 0, byBenefitType: [] },
  expirySummary: { expired: 0, expiring30d: 0, expiring60d: 0, expiring90d: 0, expiring180d: 0 },
  inventory: [
    {
      id: 'ri-1',
      benefitType: 'reservation',
      commitmentFamily: 'compute-reservation',
      sourceKind: 'aws-native',
      sourceId: `arn:aws:ec2:ap-southeast-2:${memberAccountId}:reserved-instances/ri-1`,
      provider: 'aws',
      ownerAccountId: memberAccountId,
      scope: 'Single',
      type: 'ec2-reserved-instance',
      status: 'active',
      shape: { provider: 'aws', region: 'ap-southeast-2' },
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
      source: { sourceKind: 'aws-native', sourceId: 'ce:payer:sp-recommendation' },
      targetShape: { provider: 'aws', commitmentFamily: 'compute-savings-plan' },
    },
  ],
  allocation: { status: 'unavailable', reason: 'not-proved' },
  resourceAttribution: { status: 'unavailable', reason: 'not-proved' },
};

const expected = {
  companyId,
  estateId,
  organizationId,
  managementAccountId,
  manifestRevision: artifact.manifestRevision,
  memberAccountIds: [managementAccountId, memberAccountId],
};
assert.equal(validateAwsPortalOrganizationCommitmentsPlanningArtifact(artifact, expected), artifact);
assert.doesNotThrow(() => validateAwsOrganizationCommitmentsPlanningViewIdentity(artifact, expected));

const admission = {
  schemaVersion: 1,
  provider: 'AWS',
  scopeType: 'organization',
  companyId,
  estateId,
  organizationId,
  managementAccountId,
  requestId: 'request-org-1',
  correlationId: 'correlation-org-1',
  manifestRevision: artifact.manifestRevision,
  disposition: 'accepted',
  acceptedAt: generatedAt,
};
assert.equal(
  validateAwsOrganizationCommitmentsRefreshAcceptedResponse(admission, {
    companyId,
    estateId,
    manifestRevision: artifact.manifestRevision,
  }),
  admission
);

const cooldownAdmission = {
  ...admission,
  disposition: 'cooldown',
  nextEligibleAt: '2026-08-25T01:05:00.000Z',
};
assert.equal(
  validateAwsOrganizationCommitmentsRefreshAcceptedResponse(cooldownAdmission, {
    companyId,
    estateId,
    manifestRevision: artifact.manifestRevision,
  }),
  cooldownAdmission
);

const scopeList = {
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
assert.equal(validateAwsOrganizationCommitmentsScopeListResponse(scopeList, companyId), scopeList);

const refreshStatus = {
  schemaVersion: 1,
  provider: 'AWS',
  scopeType: 'organization',
  companyId,
  estateId,
  organizationId,
  managementAccountId,
  targetManifestRevision: artifact.manifestRevision,
  state: 'fresh',
  requestId: admission.requestId,
  correlationId: admission.correlationId,
  requestedAt: admission.acceptedAt,
  updatedAt: generatedAt,
  stages: ['account-inventory', 'payer-analytics', 'payer-recommendations', 'materialization', 'publication'].map(id => ({
    id,
    status: 'fresh',
    updatedAt: generatedAt,
  })),
  latestArtifact: {
    state: 'available',
    generatedAt,
    artifactGeneration: { runId: 'org-run-1', generatedAt },
  },
};
const expectedStatus = {
  companyId,
  estateId,
  organizationId,
  managementAccountId,
  targetManifestRevision: artifact.manifestRevision,
  requestId: admission.requestId,
};
assert.equal(validateAwsOrganizationCommitmentsRefreshStatusResponse(refreshStatus, expectedStatus), refreshStatus);

const rejectAdmission = (mutate, pattern) => {
  const value = structuredClone(admission);
  mutate(value);
  assert.throws(
    () =>
      validateAwsOrganizationCommitmentsRefreshAcceptedResponse(value, {
        companyId,
        estateId,
        manifestRevision: artifact.manifestRevision,
      }),
    pattern
  );
};
rejectAdmission(value => {
  value.manifestRevision = 'stale-revision';
}, /manifestRevision must match/);
rejectAdmission(value => {
  value.disposition = 'cooldown';
}, /nextEligibleAt|missing required/);

const rejectStatus = (mutate, pattern) => {
  const value = structuredClone(refreshStatus);
  mutate(value);
  assert.throws(() => validateAwsOrganizationCommitmentsRefreshStatusResponse(value, expectedStatus), pattern);
};
rejectStatus(value => {
  value.stages.reverse();
}, /stages\[0\]\.id must match/);
rejectStatus(value => {
  value.stages[0].completedCount = 3;
  value.stages[0].totalCount = 2;
}, /completedCount must not exceed totalCount/);
rejectStatus(value => {
  value.stages[0].failureCode = 'raw-provider-exception';
}, /failureCode is not declared/);
rejectStatus(value => {
  value.saga = { attempts: 2 };
}, /undeclared fields: saga/);

const invalidScopeList = structuredClone(scopeList);
invalidScopeList.organizations[0].roleArn = `arn:aws:iam::${managementAccountId}:role/Example`;
assert.throws(() => validateAwsOrganizationCommitmentsScopeListResponse(invalidScopeList, companyId), /undeclared fields: roleArn/);

const reject = (mutate, pattern) => {
  const value = structuredClone(artifact);
  mutate(value);
  assert.throws(() => validateAwsPortalOrganizationCommitmentsPlanningArtifact(value, expected), pattern);
};

reject(value => {
  value.providerScope.companyId = 'company-other';
}, /expected\.companyId must match/);
reject(value => {
  value.providerScope.estateId = 'estate-other';
}, /expected\.estateId must match/);
reject(value => {
  value.providerScope.organizationId = 'o-otherorg1234';
  value.providerScope.providerScopeId = 'o-otherorg1234';
}, /expected\.organizationId must match/);
reject(value => {
  value.accounts.reverse();
}, /must be sorted by accountId/);
reject(value => {
  value.accounts.push(structuredClone(value.accounts[1]));
}, /must not contain duplicates/);
reject(value => {
  value.accounts[0].role = 'member';
}, /must identify the exact management account/);
reject(value => {
  value.inventory[0].ownerAccountId = '999999999999';
}, /must belong to the declared organization membership/);
reject(value => {
  value.inventory[0].sourceId = 'arn:aws:ec2:ap-southeast-2:999999999999:reserved-instances/ri-other';
}, /ARN outside the declared organization membership/);
reject(value => {
  value.payerAggregates[0].payerAccountId = memberAccountId;
}, /payerAccountId must match/);
reject(value => {
  value.purchaseRecommendations[0].recommendedAccountId = '999999999999';
}, /must belong to the declared organization membership/);
reject(value => {
  value.purchaseRecommendations[0].source.sourceKind = 'azure-native';
}, /sourceKind is not declared|cannot contain Azure-native evidence/);
reject(value => {
  value.sharingPosture.status = 'shared';
}, /sharingPosture\.status must match/);
reject(value => {
  value.sharingPosture.providerResponse = { sharingEnabled: true };
}, /undeclared fields: providerResponse/);
reject(value => {
  value.allocation.records = [];
}, /undeclared fields: records/);
reject(value => {
  value.allocation = { status: 'available', source: { sourceKind: 'spotto-derived' }, records: [] };
}, /records must be non-empty/);
reject(value => {
  value.resourceAttribution = {
    status: 'available',
    source: { sourceKind: 'spotto-derived', sourceId: 'cur:proved-attribution' },
    records: [
      {
        accountId: memberAccountId,
        resourceId: 'arn:aws:ec2:ap-southeast-2:999999999999:instance/i-other',
        benefitIds: ['ri-1'],
        windowStart: '2026-07-26',
        windowEnd: '2026-08-25',
      },
    ],
  };
}, /ARN outside the declared organization membership/);
reject(value => {
  value.inventory[0].credentials = { accessKeyId: 'AKIAEXAMPLE' };
}, /undeclared fields: credentials|not allowed in a public artifact/);
reject(value => {
  value.accountId = managementAccountId;
}, /undeclared fields: accountId/);
reject(value => {
  value.providerScope.undeclaredIdentity = true;
}, /undeclared fields: undeclaredIdentity/);

const provedAttribution = structuredClone(artifact);
provedAttribution.resourceAttribution = {
  status: 'available',
  source: { sourceKind: 'spotto-derived', sourceId: 'cur:proved-attribution' },
  records: [
    {
      accountId: memberAccountId,
      resourceId: `arn:aws:ec2:ap-southeast-2:${memberAccountId}:instance/i-member`,
      benefitIds: ['ri-1'],
      windowStart: '2026-07-26',
      windowEnd: '2026-08-25',
    },
  ],
};
assert.equal(validateAwsPortalOrganizationCommitmentsPlanningArtifact(provedAttribution, expected), provedAttribution);

const sessionId = buildAwsOrganizationCommitmentsSessionId(companyId, estateId);
assert.equal(sessionId, buildAwsOrganizationCommitmentsSessionId(companyId, estateId));
assert.notEqual(sessionId, buildAwsOrganizationCommitmentsSessionId('company-other', estateId));
assert.ok(sessionId.length <= 128);
assert.throws(() => buildAwsOrganizationCommitmentsSessionId(' company-example', estateId), /companyId must be/);

console.log('AWS organization commitments planning contract checks passed.');
