import type { AwsOrganizationCommitmentsPlanningView } from './organizationCommitments.js';
import { ProviderName } from '../common/provider.js';
import { asRecord, assertAccount, assertExactKeys, assertValue, requiredEnum, requiredString } from './pluginPublicArtifactValidationHelpers.js';

const ORGANIZATION_ID = /^o-[a-z0-9]{10,32}$/u;
const FORBIDDEN_ORGANIZATION_COMMITMENTS_KEYS = new Set([
  'billingScopeId',
  'blobPath',
  'checkpoint',
  'cloudAccountId',
  'connectionString',
  'credentialHealth',
  'credentialId',
  'credentialReference',
  'externalId',
  'managementGroupId',
  'pricingQuote',
  'quotePolicy',
  'resourceGroupId',
  'roleArn',
  'saga',
  'sasToken',
  'secretArn',
  'secretReference',
  'storageCapacity',
  'storagePath',
  'subscription',
  'subscriptionId',
  'tenantId',
  'unlockFinancialLedger',
]);

export interface AwsOrganizationCommitmentsExpectedIdentity {
  companyId: string;
  estateId: string;
  organizationId: string;
  managementAccountId: string;
  manifestRevision: string;
  memberAccountIds: readonly string[];
}

/** Validates the multi-account identity boundary of an AWS organization commitments view. */
export function validateAwsOrganizationCommitmentsPlanningViewIdentity(
  value: unknown,
  expected: AwsOrganizationCommitmentsExpectedIdentity
): asserts value is AwsOrganizationCommitmentsPlanningView {
  const view = asRecord(value, 'organizationCommitmentsPlanning');
  const providerScope = asRecord(view.providerScope, 'organizationCommitmentsPlanning.providerScope');
  assertExactKeys(
    providerScope,
    ['providerName', 'providerScopeId', 'scopeType', 'companyId', 'estateId', 'organizationId', 'managementAccountId'],
    'organizationCommitmentsPlanning.providerScope'
  );
  assertValue(providerScope.providerName, ProviderName.Aws, 'organizationCommitmentsPlanning.providerScope.providerName');
  assertValue(providerScope.scopeType, 'organization', 'organizationCommitmentsPlanning.providerScope.scopeType');

  const companyId = requiredString(providerScope.companyId, 'organizationCommitmentsPlanning.providerScope.companyId');
  const estateId = requiredString(providerScope.estateId, 'organizationCommitmentsPlanning.providerScope.estateId');
  const organizationId = requiredOrganizationId(providerScope.organizationId, 'organizationCommitmentsPlanning.providerScope.organizationId');
  assertValue(providerScope.providerScopeId, organizationId, 'organizationCommitmentsPlanning.providerScope.providerScopeId');
  const managementAccountId = requiredAccountId(
    providerScope.managementAccountId,
    'organizationCommitmentsPlanning.providerScope.managementAccountId'
  );

  assertValue(expected.companyId, companyId, 'expected.companyId');
  assertValue(expected.estateId, estateId, 'expected.estateId');
  assertValue(expected.organizationId, organizationId, 'expected.organizationId');
  assertValue(expected.managementAccountId, managementAccountId, 'expected.managementAccountId');
  assertValue(
    expected.manifestRevision,
    requiredString(view.manifestRevision, 'organizationCommitmentsPlanning.manifestRevision'),
    'expected.manifestRevision'
  );

  const accountMembership = validateAccounts(view.accounts, managementAccountId);
  validateExpectedMembers(expected.memberAccountIds, accountMembership.accountIds);
  validateInventory(view.inventory, accountMembership.members);
  validatePayerAggregates(view.payerAggregates, accountMembership.members, managementAccountId);
  validatePurchaseRecommendations(view.purchaseRecommendations, accountMembership.members, managementAccountId);
  validateAttribution(view.allocation, accountMembership.members, false, 'organizationCommitmentsPlanning.allocation');
  validateAttribution(view.resourceAttribution, accountMembership.members, true, 'organizationCommitmentsPlanning.resourceAttribution');
  validateBoundIdentities(
    view,
    accountMembership.members,
    organizationId,
    companyId,
    estateId,
    managementAccountId,
    'organizationCommitmentsPlanning'
  );
}

function validateAccounts(value: unknown, managementAccountId: string): { accountIds: string[]; members: Set<string> } {
  if (!Array.isArray(value) || value.length === 0) throw new Error('organizationCommitmentsPlanning.accounts must be a non-empty array.');
  const accountIds = value.map((entry, index) => {
    const field = `organizationCommitmentsPlanning.accounts[${index}]`;
    const account = asRecord(entry, field);
    assertExactKeys(account, ['accountId', 'displayName', 'role', 'inventoryStatus', 'lastSuccessfulRefreshAt'], field);
    const accountId = requiredAccountId(account.accountId, `${field}.accountId`);
    const role = requiredEnum(account.role, ['management', 'member'] as const, `${field}.role`);
    if ((accountId === managementAccountId) !== (role === 'management')) {
      throw new Error(`${field}.role must identify the exact management account.`);
    }
    return accountId;
  });
  if (new Set(accountIds).size !== accountIds.length) throw new Error('organizationCommitmentsPlanning.accounts must not contain duplicates.');
  const sorted = [...accountIds].sort((left, right) => left.localeCompare(right));
  if (JSON.stringify(sorted) !== JSON.stringify(accountIds)) throw new Error('organizationCommitmentsPlanning.accounts must be sorted by accountId.');
  if (!accountIds.includes(managementAccountId)) throw new Error('organizationCommitmentsPlanning.accounts must contain the management account.');
  return { accountIds, members: new Set(accountIds) };
}

function validateInventory(value: unknown, members: Set<string>): void {
  if (!Array.isArray(value)) throw new Error('organizationCommitmentsPlanning.inventory must be an array.');
  value.forEach((entry, index) => {
    const field = `organizationCommitmentsPlanning.inventory[${index}]`;
    const item = asRecord(entry, field);
    assertValue(item.sourceKind, 'aws-native', `${field}.sourceKind`);
    assertValue(item.provider, ProviderName.Aws, `${field}.provider`);
    requiredMember(item.ownerAccountId, members, `${field}.ownerAccountId`);
    if (item.shape !== undefined) validateAwsShape(item.shape, `${field}.shape`);
  });
}

function validatePayerAggregates(value: unknown, members: Set<string>, managementAccountId: string): void {
  if (!Array.isArray(value)) throw new Error('organizationCommitmentsPlanning.payerAggregates must be an array.');
  value.forEach((entry, index) => {
    const field = `organizationCommitmentsPlanning.payerAggregates[${index}]`;
    const aggregate = asRecord(entry, field);
    const payerAccountId = requiredMember(aggregate.payerAccountId, members, `${field}.payerAccountId`);
    assertValue(payerAccountId, managementAccountId, `${field}.payerAccountId`);
    validateAwsSource(aggregate.source, `${field}.source`);
  });
}

function validatePurchaseRecommendations(value: unknown, members: Set<string>, managementAccountId: string): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) throw new Error('organizationCommitmentsPlanning.purchaseRecommendations must be an array.');
  value.forEach((entry, index) => {
    const field = `organizationCommitmentsPlanning.purchaseRecommendations[${index}]`;
    const recommendation = asRecord(entry, field);
    assertValue(recommendation.purchaseScope, 'payer', `${field}.purchaseScope`);
    const payerAccountId = requiredMember(recommendation.payerAccountId, members, `${field}.payerAccountId`);
    assertValue(payerAccountId, managementAccountId, `${field}.payerAccountId`);
    if (recommendation.recommendedAccountId !== undefined) {
      requiredMember(recommendation.recommendedAccountId, members, `${field}.recommendedAccountId`);
    }
    validateAwsSource(recommendation.source, `${field}.source`);
    validateAwsShape(recommendation.targetShape, `${field}.targetShape`);
  });
}

function validateAttribution(value: unknown, members: Set<string>, resource: boolean, field: string): void {
  const evidence = asRecord(value, field);
  if (evidence.status === 'unavailable') {
    assertExactKeys(evidence, ['status', 'reason'], field);
    requiredEnum(evidence.reason, ['not-collected', 'not-proved', 'source-unavailable'] as const, `${field}.reason`);
    return;
  }
  assertValue(evidence.status, 'available', `${field}.status`);
  assertExactKeys(evidence, ['status', 'source', 'records'], field);
  validateAwsSource(evidence.source, `${field}.source`, true);
  if (!Array.isArray(evidence.records) || evidence.records.length === 0) {
    throw new Error(`${field}.records must be non-empty when attribution is available.`);
  }
  evidence.records.forEach((entry, index) => {
    const record = asRecord(entry, `${field}.records[${index}]`);
    if (resource) {
      requiredMember(record.accountId, members, `${field}.records[${index}].accountId`);
    } else {
      requiredMember(record.beneficiaryAccountId, members, `${field}.records[${index}].beneficiaryAccountId`);
      if (record.ownerAccountId !== undefined) requiredMember(record.ownerAccountId, members, `${field}.records[${index}].ownerAccountId`);
    }
  });
}

function validateAwsSource(value: unknown, field: string, allowDerived = false): void {
  const source = asRecord(value, field);
  const allowed = allowDerived ? (['aws-native', 'spotto-derived'] as const) : (['aws-native'] as const);
  requiredEnum(source.sourceKind, allowed, `${field}.sourceKind`);
}

function validateAwsShape(value: unknown, field: string): void {
  const shape = asRecord(value, field);
  assertValue(shape.provider, 'aws', `${field}.provider`);
}

function validateBoundIdentities(
  value: unknown,
  members: Set<string>,
  organizationId: string,
  companyId: string,
  estateId: string,
  managementAccountId: string,
  field: string
): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      validateBoundIdentities(entry, members, organizationId, companyId, estateId, managementAccountId, `${field}[${index}]`)
    );
    return;
  }
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string') validateArnAccount(value, members, field);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_ORGANIZATION_COMMITMENTS_KEYS.has(key)) {
      throw new Error(`${field}.${key} is not allowed in an AWS organization commitments artifact.`);
    }
    if (key === 'accountId' || key === 'ownerAccountId' || key === 'beneficiaryAccountId' || key === 'payerAccountId') {
      requiredMember(child, members, `${field}.${key}`);
    }
    if (key === 'organizationId') assertValue(child, organizationId, `${field}.${key}`);
    if (key === 'companyId') assertValue(child, companyId, `${field}.${key}`);
    if (key === 'estateId') assertValue(child, estateId, `${field}.${key}`);
    if (key === 'managementAccountId') assertAccount(child, managementAccountId, `${field}.${key}`);
    if (key === 'providerName') assertValue(child, ProviderName.Aws, `${field}.${key}`);
    if (key === 'provider') assertValue(child, 'aws', `${field}.${key}`);
    if (key === 'sourceKind' && child === 'azure-native') {
      throw new Error(`${field}.${key} cannot contain Azure-native evidence.`);
    }
    validateBoundIdentities(child, members, organizationId, companyId, estateId, managementAccountId, `${field}.${key}`);
  }
}

function validateArnAccount(value: string, members: Set<string>, field: string): void {
  if (!value.startsWith('arn:')) return;
  const arnAccountId = value.split(':', 6)[4];
  if (arnAccountId && !members.has(arnAccountId)) throw new Error(`${field} contains an ARN outside the declared organization membership.`);
}

function requiredMember(value: unknown, members: Set<string>, field: string): string {
  const accountId = requiredAccountId(value, field);
  if (!members.has(accountId)) throw new Error(`${field} must belong to the declared organization membership.`);
  return accountId;
}

function requiredAccountId(value: unknown, field: string): string {
  const accountId = requiredString(value, field);
  assertAccount(value, accountId, field);
  return accountId;
}

function requiredOrganizationId(value: unknown, field: string): string {
  const organizationId = requiredString(value, field);
  if (!ORGANIZATION_ID.test(organizationId)) throw new Error(`${field} must be a canonical AWS organization id.`);
  return organizationId;
}

function validateExpectedMembers(expected: readonly string[], actual: readonly string[]): void {
  const normalized = expected.map((accountId, index) => requiredAccountId(accountId, `expected.memberAccountIds[${index}]`));
  if (new Set(normalized).size !== normalized.length) throw new Error('expected.memberAccountIds must not contain duplicates.');
  const sorted = [...normalized].sort((left, right) => left.localeCompare(right));
  if (JSON.stringify(sorted) !== JSON.stringify(normalized)) throw new Error('expected.memberAccountIds must be sorted.');
  if (JSON.stringify(normalized) !== JSON.stringify(actual)) {
    throw new Error('expected.memberAccountIds must match the artifact membership exactly.');
  }
}
