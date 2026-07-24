"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSourceBinding = void 0;
exports.validateAwsPluginSubscriptionDetailArtifact = validateAwsPluginSubscriptionDetailArtifact;
exports.validateAwsPluginResourceDetailArtifact = validateAwsPluginResourceDetailArtifact;
exports.validateTarget = validateTarget;
const pluginPublicArtifacts_1 = require("./pluginPublicArtifacts");
const publicArtifacts_1 = require("./publicArtifacts");
const pluginPublicArtifactValidationHelpers_1 = require("./pluginPublicArtifactValidationHelpers");
const pluginPublicArtifactSectionValidation_1 = require("./pluginPublicArtifactSectionValidation");
var pluginPublicArtifactSectionValidation_2 = require("./pluginPublicArtifactSectionValidation");
Object.defineProperty(exports, "validateSourceBinding", { enumerable: true, get: function () { return pluginPublicArtifactSectionValidation_2.validateSourceBinding; } });
/** Validates and returns one lossless AWS plugin subscription-detail body. */
function validateAwsPluginSubscriptionDetailArtifact(value) {
    const artifact = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'artifact');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(artifact, [
        'schemaVersion',
        'pluginSchemaVersion',
        'provider',
        'accountId',
        'artifactType',
        'artifactGeneration',
        'generatedAt',
        'logicalName',
        'target',
        'sections',
    ], 'artifact');
    validateArtifactEnvelope(artifact, 'plugin-subscription');
    const target = validateTarget(artifact.target, 'subscription-detail');
    const accountId = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(artifact.accountId, 'artifact.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(target.accountId, accountId, 'artifact.target.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.logicalName, (0, pluginPublicArtifacts_1.buildAwsPluginSubscriptionLogicalName)(target.targetKeySha256), 'artifact.logicalName');
    (0, pluginPublicArtifactSectionValidation_1.validateSubscriptionSections)(artifact.sections, target, (0, pluginPublicArtifactValidationHelpers_1.requiredString)(artifact.generatedAt, 'artifact.generatedAt'));
    (0, pluginPublicArtifactValidationHelpers_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
/** Validates and returns one lossless AWS plugin resource-detail body. */
function validateAwsPluginResourceDetailArtifact(value) {
    const artifact = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'artifact');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(artifact, [
        'schemaVersion',
        'pluginSchemaVersion',
        'provider',
        'accountId',
        'artifactType',
        'artifactGeneration',
        'generatedAt',
        'logicalName',
        'target',
        'selector',
        'stableKey',
        'sections',
    ], 'artifact');
    validateArtifactEnvelope(artifact, 'plugin-resource');
    const target = validateTarget(artifact.target, 'resource-detail');
    const accountId = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(artifact.accountId, 'artifact.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(target.accountId, accountId, 'artifact.target.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.logicalName, (0, pluginPublicArtifacts_1.buildAwsPluginResourceLogicalName)(target.stableKeySha256, target.targetKeySha256), 'artifact.logicalName');
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(artifact.selector, target.selector, 'artifact.selector');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.stableKey, target.stableKey, 'artifact.stableKey');
    (0, pluginPublicArtifactSectionValidation_1.validateResourceSections)(artifact.sections, target, (0, pluginPublicArtifactValidationHelpers_1.requiredString)(artifact.generatedAt, 'artifact.generatedAt'));
    (0, pluginPublicArtifactValidationHelpers_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
function validateArtifactEnvelope(artifact, artifactType) {
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.schemaVersion, publicArtifacts_1.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.schemaVersion');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.pluginSchemaVersion, pluginPublicArtifacts_1.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.pluginSchemaVersion');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.provider, 'aws', 'artifact.provider');
    (0, pluginPublicArtifactValidationHelpers_1.requiredString)(artifact.accountId, 'artifact.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.artifactType, artifactType, 'artifact.artifactType');
    const generation = validateGeneration(artifact.artifactGeneration, 'artifact.artifactGeneration');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)((0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(artifact.generatedAt, 'artifact.generatedAt'), generation.generatedAt, 'artifact.generatedAt');
}
function validateGeneration(value, field) {
    const generation = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(generation, ['runId', 'generatedAt'], field);
    return {
        runId: (0, pluginPublicArtifactValidationHelpers_1.requiredString)(generation.runId, `${field}.runId`),
        generatedAt: (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(generation.generatedAt, `${field}.generatedAt`),
    };
}
function validateTarget(value, kind) {
    const target = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'target');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(target.kind, kind, 'target.kind');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(target.provider, 'aws', 'target.provider');
    (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.accountId, 'target.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.targetKey, 'target.targetKey');
    (0, pluginPublicArtifactValidationHelpers_1.sha256)(target.targetKeySha256, 'target.targetKeySha256');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(target.targetKeySha256, (0, pluginPublicArtifacts_1.sha256AwsPluginIdentity)((0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.targetKey, 'target.targetKey')), 'target.targetKeySha256');
    (0, pluginPublicArtifactValidationHelpers_1.validateBilling)(target.billing);
    (0, pluginPublicArtifactValidationHelpers_1.stringArray)(target.resourceRegions, 'target.resourceRegions');
    (0, pluginPublicArtifactValidationHelpers_1.validateMetricWindow)(target.metricTimeWindow, 'target.metricTimeWindow');
    validateRecommendationScopes(target.recommendationScopes, (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.accountId, 'target.accountId'));
    if (kind === 'subscription-detail') {
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(target, [
            'kind',
            'provider',
            'accountId',
            'targetKey',
            'targetKeySha256',
            'accountSummaryTargetKey',
            'resourceCollectionTargetKey',
            'recommendationsTargetKey',
            'aiCostSummaryTargetKey',
            'serviceRetirementTargetKey',
            'commitmentAnalysisTargetKey',
            'reliabilityTargetKey',
            'accountGovernanceTargetKey',
            'billing',
            'resourceRegions',
            'metricTimeWindow',
            'aiCostSummaryAudience',
            'serviceRetirementRegions',
            'recommendationScopes',
            'commitmentAnalysis',
            'reliability',
            'accountGovernance',
        ], 'target');
        (0, pluginPublicArtifactValidationHelpers_1.optionalEnum)(target.aiCostSummaryAudience, ['portal', 'plugin'], 'target.aiCostSummaryAudience');
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.accountSummaryTargetKey, 'target.accountSummaryTargetKey');
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.resourceCollectionTargetKey, 'target.resourceCollectionTargetKey');
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.recommendationsTargetKey, 'target.recommendationsTargetKey');
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.serviceRetirementTargetKey, 'target.serviceRetirementTargetKey');
        validateOptionalTargetKey(target.aiCostSummaryTargetKey, target.aiCostSummaryAudience !== undefined, 'target.aiCostSummaryTargetKey');
        validateOptionalTargetKey(target.commitmentAnalysisTargetKey, target.commitmentAnalysis !== undefined, 'target.commitmentAnalysisTargetKey');
        validateOptionalTargetKey(target.reliabilityTargetKey, target.reliability !== undefined, 'target.reliabilityTargetKey');
        validateOptionalTargetKey(target.accountGovernanceTargetKey, target.accountGovernance !== undefined, 'target.accountGovernanceTargetKey');
        (0, pluginPublicArtifactValidationHelpers_1.stringArray)(target.serviceRetirementRegions, 'target.serviceRetirementRegions');
        validateCommitmentAnalysisTarget(target.commitmentAnalysis);
        validateReliabilityTarget(target.reliability);
        validateAccountGovernanceTarget(target.accountGovernance);
    }
    else {
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(target, [
            'kind',
            'provider',
            'accountId',
            'targetKey',
            'targetKeySha256',
            'resourceCollectionTargetKey',
            'recommendationsTargetKey',
            'billing',
            'resourceRegions',
            'metricTimeWindow',
            'tagRuleScope',
            'selector',
            'stableKey',
            'stableKeySha256',
            'relationshipTargetKey',
            'serviceRetirementTargetKey',
            'recommendationScopes',
        ], 'target');
        (0, pluginPublicArtifactValidationHelpers_1.validateTagRuleScope)(target.tagRuleScope);
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.resourceCollectionTargetKey, 'target.resourceCollectionTargetKey');
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.recommendationsTargetKey, 'target.recommendationsTargetKey');
        (0, pluginPublicArtifactValidationHelpers_1.validateSelector)(target.selector, 'target.selector');
        const stableKey = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.stableKey, 'target.stableKey');
        if ((0, pluginPublicArtifactValidationHelpers_1.asRecord)(target.selector, 'target.selector').kind === 'stable-key') {
            (0, pluginPublicArtifactValidationHelpers_1.assertValue)((0, pluginPublicArtifactValidationHelpers_1.asRecord)(target.selector, 'target.selector').stableKey, stableKey, 'target.selector.stableKey');
        }
        (0, pluginPublicArtifactValidationHelpers_1.sha256)(target.stableKeySha256, 'target.stableKeySha256');
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(target.stableKeySha256, (0, pluginPublicArtifacts_1.sha256AwsPluginIdentity)(stableKey), 'target.stableKeySha256');
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.relationshipTargetKey, 'target.relationshipTargetKey');
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.serviceRetirementTargetKey, 'target.serviceRetirementTargetKey');
    }
    return value;
}
function validateOptionalTargetKey(value, required, field) {
    if (required)
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(value, field);
    else if (value !== undefined)
        throw new Error(`${field} requires its corresponding optional target.`);
}
function validateCommitmentAnalysisTarget(value) {
    if (value === undefined)
        return;
    const target = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'target.commitmentAnalysis');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(target, ['resourceRegions', 'maxBenefitEntries'], 'target.commitmentAnalysis');
    (0, pluginPublicArtifactValidationHelpers_1.stringArray)(target.resourceRegions, 'target.commitmentAnalysis.resourceRegions');
    if (!Number.isSafeInteger(target.maxBenefitEntries) || Number(target.maxBenefitEntries) <= 0) {
        throw new Error('target.commitmentAnalysis.maxBenefitEntries must be a positive safe integer.');
    }
}
function validateReliabilityTarget(value) {
    if (value === undefined)
        return;
    const target = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'target.reliability');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(target, ['includeTemplateContent', 'includeScoring', 'maxResultsPerSection', 'sectionScopeKeys'], 'target.reliability');
    if (target.includeTemplateContent !== undefined)
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(target.includeTemplateContent, true, 'target.reliability.includeTemplateContent');
    if (target.includeScoring !== undefined)
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(target.includeScoring, true, 'target.reliability.includeScoring');
    if (!Number.isSafeInteger(target.maxResultsPerSection) || Number(target.maxResultsPerSection) <= 0) {
        throw new Error('target.reliability.maxResultsPerSection must be a positive safe integer.');
    }
    (0, pluginPublicArtifactValidationHelpers_1.stringArray)(target.sectionScopeKeys, 'target.reliability.sectionScopeKeys');
}
function validateAccountGovernanceTarget(value) {
    if (value === undefined)
        return;
    const target = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'target.accountGovernance');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(target, ['apiRegion'], 'target.accountGovernance');
    (0, pluginPublicArtifactValidationHelpers_1.requiredString)(target.apiRegion, 'target.accountGovernance.apiRegion');
}
function validateRecommendationScopes(value, accountId) {
    if (!Array.isArray(value))
        throw new Error('target.recommendationScopes must be an array.');
    const scopes = value;
    scopes.forEach((value, index) => {
        const field = `target.recommendationScopes[${index}]`;
        const scope = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(scope, ['source', 'scope', 'accountId', 'scopeDiscriminator', 'computeOptimizerFamily', 'resourceRegions', 'targetKey', 'actionabilityTargetKey'], field);
        (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(scope.source, ['custom', 'compute-optimizer', 'cost-optimization-hub', 'resilience-hub', 'security-hub', 'trusted-advisor', 'well-architected'], `${field}.source`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(scope.scope, 'account', `${field}.scope`);
        (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(scope.accountId, accountId, `${field}.accountId`);
        if (scope.scopeDiscriminator !== undefined)
            (0, pluginPublicArtifactValidationHelpers_1.requiredString)(scope.scopeDiscriminator, `${field}.scopeDiscriminator`);
        if (scope.computeOptimizerFamily !== undefined)
            (0, pluginPublicArtifactValidationHelpers_1.requiredString)(scope.computeOptimizerFamily, `${field}.computeOptimizerFamily`);
        (0, pluginPublicArtifactValidationHelpers_1.stringArray)(scope.resourceRegions, `${field}.resourceRegions`);
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(scope.targetKey, `${field}.targetKey`);
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(scope.actionabilityTargetKey, `${field}.actionabilityTargetKey`);
    });
}
//# sourceMappingURL=pluginPublicArtifactBodyValidation.js.map