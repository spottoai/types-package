"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsOrganizationCommitmentsPlanningViewIdentity = validateAwsOrganizationCommitmentsPlanningViewIdentity;
const provider_js_1 = require("../common/provider.js");
const pluginPublicArtifactValidationHelpers_js_1 = require("./pluginPublicArtifactValidationHelpers.js");
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
/** Validates the multi-account identity boundary of an AWS organization commitments view. */
function validateAwsOrganizationCommitmentsPlanningViewIdentity(value, expected) {
    const view = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(value, 'organizationCommitmentsPlanning');
    const providerScope = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(view.providerScope, 'organizationCommitmentsPlanning.providerScope');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertExactKeys)(providerScope, ['providerName', 'providerScopeId', 'scopeType', 'companyId', 'estateId', 'organizationId', 'managementAccountId'], 'organizationCommitmentsPlanning.providerScope');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(providerScope.providerName, provider_js_1.ProviderName.Aws, 'organizationCommitmentsPlanning.providerScope.providerName');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(providerScope.scopeType, 'organization', 'organizationCommitmentsPlanning.providerScope.scopeType');
    const companyId = (0, pluginPublicArtifactValidationHelpers_js_1.requiredString)(providerScope.companyId, 'organizationCommitmentsPlanning.providerScope.companyId');
    const estateId = (0, pluginPublicArtifactValidationHelpers_js_1.requiredString)(providerScope.estateId, 'organizationCommitmentsPlanning.providerScope.estateId');
    const organizationId = requiredOrganizationId(providerScope.organizationId, 'organizationCommitmentsPlanning.providerScope.organizationId');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(providerScope.providerScopeId, organizationId, 'organizationCommitmentsPlanning.providerScope.providerScopeId');
    const managementAccountId = requiredAccountId(providerScope.managementAccountId, 'organizationCommitmentsPlanning.providerScope.managementAccountId');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(expected.companyId, companyId, 'expected.companyId');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(expected.estateId, estateId, 'expected.estateId');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(expected.organizationId, organizationId, 'expected.organizationId');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(expected.managementAccountId, managementAccountId, 'expected.managementAccountId');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(expected.manifestRevision, (0, pluginPublicArtifactValidationHelpers_js_1.requiredString)(view.manifestRevision, 'organizationCommitmentsPlanning.manifestRevision'), 'expected.manifestRevision');
    const accountMembership = validateAccounts(view.accounts, managementAccountId);
    validateExpectedMembers(expected.memberAccountIds, accountMembership.accountIds);
    validateInventory(view.inventory, accountMembership.members);
    validatePayerAggregates(view.payerAggregates, accountMembership.members, managementAccountId);
    validatePurchaseRecommendations(view.purchaseRecommendations, accountMembership.members, managementAccountId);
    validateAttribution(view.allocation, accountMembership.members, false, 'organizationCommitmentsPlanning.allocation');
    validateAttribution(view.resourceAttribution, accountMembership.members, true, 'organizationCommitmentsPlanning.resourceAttribution');
    validateBoundIdentities(view, accountMembership.members, organizationId, companyId, estateId, managementAccountId, 'organizationCommitmentsPlanning');
}
function validateAccounts(value, managementAccountId) {
    if (!Array.isArray(value) || value.length === 0)
        throw new Error('organizationCommitmentsPlanning.accounts must be a non-empty array.');
    const accountIds = value.map((entry, index) => {
        const field = `organizationCommitmentsPlanning.accounts[${index}]`;
        const account = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(entry, field);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertExactKeys)(account, ['accountId', 'displayName', 'role', 'inventoryStatus', 'lastSuccessfulRefreshAt'], field);
        const accountId = requiredAccountId(account.accountId, `${field}.accountId`);
        const role = (0, pluginPublicArtifactValidationHelpers_js_1.requiredEnum)(account.role, ['management', 'member'], `${field}.role`);
        if ((accountId === managementAccountId) !== (role === 'management')) {
            throw new Error(`${field}.role must identify the exact management account.`);
        }
        return accountId;
    });
    if (new Set(accountIds).size !== accountIds.length)
        throw new Error('organizationCommitmentsPlanning.accounts must not contain duplicates.');
    const sorted = [...accountIds].sort((left, right) => left.localeCompare(right));
    if (JSON.stringify(sorted) !== JSON.stringify(accountIds))
        throw new Error('organizationCommitmentsPlanning.accounts must be sorted by accountId.');
    if (!accountIds.includes(managementAccountId))
        throw new Error('organizationCommitmentsPlanning.accounts must contain the management account.');
    return { accountIds, members: new Set(accountIds) };
}
function validateInventory(value, members) {
    if (!Array.isArray(value))
        throw new Error('organizationCommitmentsPlanning.inventory must be an array.');
    value.forEach((entry, index) => {
        const field = `organizationCommitmentsPlanning.inventory[${index}]`;
        const item = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(entry, field);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(item.sourceKind, 'aws-native', `${field}.sourceKind`);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(item.provider, provider_js_1.ProviderName.Aws, `${field}.provider`);
        requiredMember(item.ownerAccountId, members, `${field}.ownerAccountId`);
        if (item.shape !== undefined)
            validateAwsShape(item.shape, `${field}.shape`);
    });
}
function validatePayerAggregates(value, members, managementAccountId) {
    if (!Array.isArray(value))
        throw new Error('organizationCommitmentsPlanning.payerAggregates must be an array.');
    value.forEach((entry, index) => {
        const field = `organizationCommitmentsPlanning.payerAggregates[${index}]`;
        const aggregate = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(entry, field);
        const payerAccountId = requiredMember(aggregate.payerAccountId, members, `${field}.payerAccountId`);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(payerAccountId, managementAccountId, `${field}.payerAccountId`);
        validateAwsSource(aggregate.source, `${field}.source`);
    });
}
function validatePurchaseRecommendations(value, members, managementAccountId) {
    if (value === undefined)
        return;
    if (!Array.isArray(value))
        throw new Error('organizationCommitmentsPlanning.purchaseRecommendations must be an array.');
    value.forEach((entry, index) => {
        const field = `organizationCommitmentsPlanning.purchaseRecommendations[${index}]`;
        const recommendation = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(entry, field);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(recommendation.purchaseScope, 'payer', `${field}.purchaseScope`);
        const payerAccountId = requiredMember(recommendation.payerAccountId, members, `${field}.payerAccountId`);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(payerAccountId, managementAccountId, `${field}.payerAccountId`);
        if (recommendation.recommendedAccountId !== undefined) {
            requiredMember(recommendation.recommendedAccountId, members, `${field}.recommendedAccountId`);
        }
        validateAwsSource(recommendation.source, `${field}.source`);
        validateAwsShape(recommendation.targetShape, `${field}.targetShape`);
    });
}
function validateAttribution(value, members, resource, field) {
    const evidence = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(value, field);
    if (evidence.status === 'unavailable') {
        (0, pluginPublicArtifactValidationHelpers_js_1.assertExactKeys)(evidence, ['status', 'reason'], field);
        (0, pluginPublicArtifactValidationHelpers_js_1.requiredEnum)(evidence.reason, ['not-collected', 'not-proved', 'source-unavailable'], `${field}.reason`);
        return;
    }
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(evidence.status, 'available', `${field}.status`);
    (0, pluginPublicArtifactValidationHelpers_js_1.assertExactKeys)(evidence, ['status', 'source', 'records'], field);
    validateAwsSource(evidence.source, `${field}.source`, true);
    if (!Array.isArray(evidence.records) || evidence.records.length === 0) {
        throw new Error(`${field}.records must be non-empty when attribution is available.`);
    }
    evidence.records.forEach((entry, index) => {
        const record = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(entry, `${field}.records[${index}]`);
        if (resource) {
            requiredMember(record.accountId, members, `${field}.records[${index}].accountId`);
        }
        else {
            requiredMember(record.beneficiaryAccountId, members, `${field}.records[${index}].beneficiaryAccountId`);
            if (record.ownerAccountId !== undefined)
                requiredMember(record.ownerAccountId, members, `${field}.records[${index}].ownerAccountId`);
        }
    });
}
function validateAwsSource(value, field, allowDerived = false) {
    const source = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(value, field);
    const allowed = allowDerived ? ['aws-native', 'spotto-derived'] : ['aws-native'];
    (0, pluginPublicArtifactValidationHelpers_js_1.requiredEnum)(source.sourceKind, allowed, `${field}.sourceKind`);
}
function validateAwsShape(value, field) {
    const shape = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(shape.provider, 'aws', `${field}.provider`);
}
function validateBoundIdentities(value, members, organizationId, companyId, estateId, managementAccountId, field) {
    if (Array.isArray(value)) {
        value.forEach((entry, index) => validateBoundIdentities(entry, members, organizationId, companyId, estateId, managementAccountId, `${field}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object') {
        if (typeof value === 'string')
            validateArnAccount(value, members, field);
        return;
    }
    for (const [key, child] of Object.entries(value)) {
        if (FORBIDDEN_ORGANIZATION_COMMITMENTS_KEYS.has(key)) {
            throw new Error(`${field}.${key} is not allowed in an AWS organization commitments artifact.`);
        }
        if (key === 'accountId' || key === 'ownerAccountId' || key === 'beneficiaryAccountId' || key === 'payerAccountId') {
            requiredMember(child, members, `${field}.${key}`);
        }
        if (key === 'organizationId')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(child, organizationId, `${field}.${key}`);
        if (key === 'companyId')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(child, companyId, `${field}.${key}`);
        if (key === 'estateId')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(child, estateId, `${field}.${key}`);
        if (key === 'managementAccountId')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertAccount)(child, managementAccountId, `${field}.${key}`);
        if (key === 'providerName')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(child, provider_js_1.ProviderName.Aws, `${field}.${key}`);
        if (key === 'provider')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(child, 'aws', `${field}.${key}`);
        if (key === 'sourceKind' && child === 'azure-native') {
            throw new Error(`${field}.${key} cannot contain Azure-native evidence.`);
        }
        validateBoundIdentities(child, members, organizationId, companyId, estateId, managementAccountId, `${field}.${key}`);
    }
}
function validateArnAccount(value, members, field) {
    if (!value.startsWith('arn:'))
        return;
    const arnAccountId = value.split(':', 6)[4];
    if (arnAccountId && !members.has(arnAccountId))
        throw new Error(`${field} contains an ARN outside the declared organization membership.`);
}
function requiredMember(value, members, field) {
    const accountId = requiredAccountId(value, field);
    if (!members.has(accountId))
        throw new Error(`${field} must belong to the declared organization membership.`);
    return accountId;
}
function requiredAccountId(value, field) {
    const accountId = (0, pluginPublicArtifactValidationHelpers_js_1.requiredString)(value, field);
    (0, pluginPublicArtifactValidationHelpers_js_1.assertAccount)(value, accountId, field);
    return accountId;
}
function requiredOrganizationId(value, field) {
    const organizationId = (0, pluginPublicArtifactValidationHelpers_js_1.requiredString)(value, field);
    if (!ORGANIZATION_ID.test(organizationId))
        throw new Error(`${field} must be a canonical AWS organization id.`);
    return organizationId;
}
function validateExpectedMembers(expected, actual) {
    const normalized = expected.map((accountId, index) => requiredAccountId(accountId, `expected.memberAccountIds[${index}]`));
    if (new Set(normalized).size !== normalized.length)
        throw new Error('expected.memberAccountIds must not contain duplicates.');
    const sorted = [...normalized].sort((left, right) => left.localeCompare(right));
    if (JSON.stringify(sorted) !== JSON.stringify(normalized))
        throw new Error('expected.memberAccountIds must be sorted.');
    if (JSON.stringify(normalized) !== JSON.stringify(actual)) {
        throw new Error('expected.memberAccountIds must match the artifact membership exactly.');
    }
}
//# sourceMappingURL=organizationCommitmentsValidation.js.map