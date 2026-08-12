"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsCommitmentsPlanningViewIdentity = validateAwsCommitmentsPlanningViewIdentity;
const provider_js_1 = require("../common/provider.js");
const pluginPublicArtifactValidationHelpers_js_1 = require("./pluginPublicArtifactValidationHelpers.js");
const FORBIDDEN_AWS_COMMITMENTS_KEYS = new Set([
    'billingScopeId',
    'cloudAccountId',
    'companyId',
    'credentialHealth',
    'credentialId',
    'managementGroupId',
    'pricingQuote',
    'quotePolicy',
    'resourceGroupId',
    'storageCapacity',
    'subscription',
    'subscriptionId',
    'tenantId',
    'unlockFinancialLedger',
]);
/**
 * Validates the security-sensitive AWS identity boundary of a commitments view.
 * A full public-artifact validator should call this before publication or response.
 */
function validateAwsCommitmentsPlanningViewIdentity(value, expectedAccountId) {
    const view = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(value, 'commitmentsPlanning');
    const providerScope = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(view.providerScope, 'commitmentsPlanning.providerScope');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertExactKeys)(providerScope, ['providerName', 'providerScopeId'], 'commitmentsPlanning.providerScope');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(providerScope.providerName, provider_js_1.ProviderName.Aws, 'commitmentsPlanning.providerScope.providerName');
    const accountId = String(providerScope.providerScopeId ?? '');
    (0, pluginPublicArtifactValidationHelpers_js_1.assertAccount)(providerScope.providerScopeId, accountId, 'commitmentsPlanning.providerScope.providerScopeId');
    if (expectedAccountId !== undefined) {
        (0, pluginPublicArtifactValidationHelpers_js_1.assertAccount)(expectedAccountId, accountId, 'expectedAccountId');
    }
    validateInventory(view.inventory, accountId);
    validatePurchaseRecommendations(view.purchaseRecommendations, accountId);
    validateBoundIdentities(view, accountId, 'commitmentsPlanning');
}
function validateInventory(value, accountId) {
    if (!Array.isArray(value))
        throw new Error('commitmentsPlanning.inventory must be an array.');
    value.forEach((item, index) => {
        const field = `commitmentsPlanning.inventory[${index}]`;
        const record = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(item, field);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(record.sourceKind, 'aws-native', `${field}.sourceKind`);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(record.provider, provider_js_1.ProviderName.Aws, `${field}.provider`);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(record.appliedScopeType, 'linked-account', `${field}.appliedScopeType`);
        validateAppliedScope(record.appliedScopeProperties, accountId, `${field}.appliedScopeProperties`);
        validateAwsShape(record.shape, `${field}.shape`);
    });
}
function validatePurchaseRecommendations(value, accountId) {
    if (value === undefined)
        return;
    if (!Array.isArray(value))
        throw new Error('commitmentsPlanning.purchaseRecommendations must be an array.');
    value.forEach((item, index) => {
        const field = `commitmentsPlanning.purchaseRecommendations[${index}]`;
        const record = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(item, field);
        (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(record.purchaseScope, 'linked-account', `${field}.purchaseScope`);
        validateAppliedScope(record.appliedScopeProperties, accountId, `${field}.appliedScopeProperties`);
        validateAwsSource(record.source, `${field}.source`);
        validateAwsShape(record.currentShape, `${field}.currentShape`);
        validateAwsShape(record.targetShape, `${field}.targetShape`, true);
        if (record.eligibility !== undefined) {
            const eligibility = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(record.eligibility, `${field}.eligibility`);
            validateAwsShape(eligibility.currentShape, `${field}.eligibility.currentShape`);
            validateAwsShape(eligibility.targetShape, `${field}.eligibility.targetShape`);
            if (eligibility.source !== undefined)
                validateAwsSource(eligibility.source, `${field}.eligibility.source`);
        }
    });
}
function validateAppliedScope(value, accountId, field) {
    const scope = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_js_1.assertExactKeys)(scope, ['accountId', 'region', 'availabilityZone'], field);
    (0, pluginPublicArtifactValidationHelpers_js_1.assertAccount)(scope.accountId, accountId, `${field}.accountId`);
}
function validateAwsSource(value, field) {
    const source = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(source.sourceKind, 'aws-native', `${field}.sourceKind`);
}
function validateAwsShape(value, field, required = false) {
    if (value === undefined && !required)
        return;
    const shape = (0, pluginPublicArtifactValidationHelpers_js_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(shape.provider, 'aws', `${field}.provider`);
}
function validateBoundIdentities(value, accountId, field) {
    if (Array.isArray(value)) {
        value.forEach((item, index) => validateBoundIdentities(item, accountId, `${field}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object') {
        if (typeof value === 'string')
            validateArnAccount(value, accountId, field);
        return;
    }
    for (const [key, child] of Object.entries(value)) {
        if (FORBIDDEN_AWS_COMMITMENTS_KEYS.has(key)) {
            throw new Error(`${field}.${key} is not allowed in an AWS commitments artifact.`);
        }
        if (key === 'accountId')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertAccount)(child, accountId, `${field}.${key}`);
        if (key === 'providerName')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(child, provider_js_1.ProviderName.Aws, `${field}.${key}`);
        if (key === 'provider')
            (0, pluginPublicArtifactValidationHelpers_js_1.assertValue)(child, 'aws', `${field}.${key}`);
        if (key === 'sourceKind' && child === 'azure-native') {
            throw new Error(`${field}.${key} cannot contain Azure-native evidence.`);
        }
        validateBoundIdentities(child, accountId, `${field}.${key}`);
    }
}
function validateArnAccount(value, accountId, field) {
    if (!value.startsWith('arn:'))
        return;
    const arnAccountId = value.split(':', 6)[4];
    if (arnAccountId)
        (0, pluginPublicArtifactValidationHelpers_js_1.assertAccount)(arnAccountId, accountId, field);
}
//# sourceMappingURL=commitmentsPlanningValidation.js.map