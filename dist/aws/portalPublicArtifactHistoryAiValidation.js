"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsPortalResourceCollectionHistoryArtifact = validateAwsPortalResourceCollectionHistoryArtifact;
exports.validateAwsPortalAccountSummaryHistoryArtifact = validateAwsPortalAccountSummaryHistoryArtifact;
exports.validateAwsPortalRetainedHistoryBodyReference = validateAwsPortalRetainedHistoryBodyReference;
exports.validateAwsPortalRetainedHistoryBodyBinding = validateAwsPortalRetainedHistoryBodyBinding;
exports.validateAwsPortalAccountSummaryAiCostSummaryArtifact = validateAwsPortalAccountSummaryAiCostSummaryArtifact;
exports.validateAwsPortalAccountSummaryAiCostSummarySiblingBinding = validateAwsPortalAccountSummaryAiCostSummarySiblingBinding;
const portalPublicArtifacts_1 = require("./portalPublicArtifacts");
const portalPublicArtifactValidationCommon_1 = require("./portalPublicArtifactValidationCommon");
const pluginPublicArtifactValidationHelpers_1 = require("./pluginPublicArtifactValidationHelpers");
const portalPublicArtifactCurrentValidation_1 = require("./portalPublicArtifactCurrentValidation");
const portalPublicArtifactNestedEvidenceValidation_1 = require("./portalPublicArtifactNestedEvidenceValidation");
const portalPublicArtifactEvidenceValidation_1 = require("./portalPublicArtifactEvidenceValidation");
const HISTORY_ENVELOPE_KEYS = [
    'schemaVersion',
    'portalSchemaVersion',
    'provider',
    'accountId',
    'artifactType',
    'artifactGeneration',
    'generatedAt',
    'logicalName',
    'scope',
    'billing',
    'discovery',
    'recommendations',
];
const AI_AUDIENCES = ['executive', 'finops', 'engineering'];
const DISCOVERY_FAMILIES = [
    'ec2-instance',
    'ebs-volume',
    'efs-file-system',
    'lambda-function',
    'elasticache-cache-cluster',
    'elasticache-serverless-cache',
    'vpc',
    'subnet',
    'route-table',
    'internet-gateway',
    'nat-gateway',
    'network-interface',
    'virtual-private-gateway',
    'load-balancer-v2',
    'classic-load-balancer',
    'security-group',
    'rds-db-cluster',
    'rds-db-instance',
];
const METRIC_FAMILIES = [
    'ec2-core-utilization',
    'ebs-volume-performance',
    'lambda-function-performance',
    'load-balancer-v2-network-traffic',
    'load-balancer-v2-application-traffic',
    'rds-db-instance-utilization',
];
const RECOMMENDATION_SOURCES = [
    'custom',
    'compute-optimizer',
    'cost-optimization-hub',
    'resilience-hub',
    'security-hub',
    'trusted-advisor',
    'well-architected',
];
function validateAwsPortalResourceCollectionHistoryArtifact(value) {
    const artifact = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact');
    const { accountId } = (0, portalPublicArtifactValidationCommon_1.validatePortalEnvelope)(artifact, 'resource-collection-history', [...HISTORY_ENVELOPE_KEYS, 'summary', 'metrics']);
    const scope = (0, portalPublicArtifactValidationCommon_1.validateResourceScope)(artifact.scope, accountId, 'artifact.scope');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.logicalName, (0, portalPublicArtifacts_1.buildAwsPortalResourceCollectionHistoryLogicalNameForScope)(scope, String(artifact.generatedAt)), 'artifact.logicalName');
    validateResourceSummary(artifact.summary);
    validateHistoryBilling(artifact.billing, 'artifact.billing');
    validateHistoryDiscovery(artifact.discovery, 'artifact.discovery');
    validateHistoryMetrics(artifact.metrics);
    validateResourceHistoryRecommendations(artifact.recommendations);
    (0, portalPublicArtifactValidationCommon_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
function validateAwsPortalAccountSummaryHistoryArtifact(value) {
    const artifact = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact');
    const { accountId } = (0, portalPublicArtifactValidationCommon_1.validatePortalEnvelope)(artifact, 'account-summary-history', HISTORY_ENVELOPE_KEYS);
    (0, portalPublicArtifactValidationCommon_1.validateHistoryAccountScope)(artifact.scope, accountId, 'artifact.scope');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.logicalName, (0, portalPublicArtifacts_1.buildAwsPortalAccountSummaryHistoryLogicalNameForScope)(artifact.scope), 'artifact.logicalName');
    validateHistoryBilling(artifact.billing, 'artifact.billing');
    validateHistoryDiscovery(artifact.discovery, 'artifact.discovery');
    validateAccountHistoryRecommendations(artifact.recommendations);
    (0, portalPublicArtifactValidationCommon_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
function validateAwsPortalRetainedHistoryBodyReference(value) {
    const reference = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'reference');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(reference, ['artifactType', 'logicalName', 'artifactGeneration', 'body'], 'reference');
    const artifactType = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(reference.artifactType, ['resource-collection-history', 'account-summary-history'], 'reference.artifactType');
    validateHistoryLogicalName(reference.logicalName, artifactType === 'resource-collection-history' ? 'resources-history--' : 'account-summary-history--', 'reference.logicalName');
    (0, portalPublicArtifactValidationCommon_1.validateGeneration)(reference.artifactGeneration, 'reference.artifactGeneration');
    (0, pluginPublicArtifactValidationHelpers_1.validateDescriptor)(reference.body, 'reference.body');
    const descriptor = (0, portalPublicArtifactValidationCommon_1.asRecord)(reference.body, 'reference.body');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(descriptor.name, reference.logicalName, 'reference.body.name');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(descriptor.mediaType, 'application/json', 'reference.body.mediaType');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(descriptor.contentEncoding, 'gzip', 'reference.body.contentEncoding');
    (0, portalPublicArtifactValidationCommon_1.assertPublicJson)(reference, 'reference');
    return value;
}
function validateAwsPortalRetainedHistoryBodyBinding(referenceValue, artifactValue) {
    const reference = validateAwsPortalRetainedHistoryBodyReference(referenceValue);
    const artifact = reference.artifactType === 'resource-collection-history'
        ? validateAwsPortalResourceCollectionHistoryArtifact(artifactValue)
        : validateAwsPortalAccountSummaryHistoryArtifact(artifactValue);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.artifactType, reference.artifactType, 'artifact.artifactType');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.logicalName, reference.logicalName, 'artifact.logicalName');
    if (JSON.stringify(artifact.artifactGeneration) !== JSON.stringify(reference.artifactGeneration))
        throw new Error('artifact.artifactGeneration must match its retained-history reference exactly.');
    return reference;
}
function validateAwsPortalAccountSummaryAiCostSummaryArtifact(value) {
    const artifact = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact');
    const { accountId, runId, portalGeneratedAt, bodyGeneratedAt } = (0, portalPublicArtifactValidationCommon_1.validatePortalEnvelope)(artifact, 'account-summary-ai-cost-summary', [
        'schemaVersion',
        'portalSchemaVersion',
        'provider',
        'accountId',
        'artifactType',
        'artifactGeneration',
        'generatedAt',
        'logicalName',
        'source',
        'entries',
    ]);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(bodyGeneratedAt, portalGeneratedAt, 'artifact.generatedAt');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.logicalName, portalPublicArtifacts_1.AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME, 'artifact.logicalName');
    const source = (0, portalPublicArtifactValidationCommon_1.asRecord)(artifact.source, 'artifact.source');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(source, ['scope', 'targetKey', 'logicalName', 'artifactType', 'artifactGeneration', 'sha256'], 'artifact.source');
    const sourceScope = (0, portalPublicArtifactValidationCommon_1.validateAccountScope)(source.scope, accountId, 'artifact.source.scope');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(source.targetKey, (0, portalPublicArtifacts_1.buildAwsPortalAccountSummaryTargetKey)(sourceScope), 'artifact.source.targetKey');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(source.logicalName, portalPublicArtifacts_1.AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME, 'artifact.source.logicalName');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(source.artifactType, 'account-summary', 'artifact.source.artifactType');
    const sourceGeneration = (0, portalPublicArtifactValidationCommon_1.validateGeneration)(source.artifactGeneration, 'artifact.source.artifactGeneration');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(sourceGeneration.runId, runId, 'artifact.source.artifactGeneration.runId');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(sourceGeneration.generatedAt, portalGeneratedAt, 'artifact.source.artifactGeneration.generatedAt');
    (0, pluginPublicArtifactValidationHelpers_1.sha256)(source.sha256, 'artifact.source.sha256');
    validateAiEntries(artifact.entries, sourceScope, bodyGeneratedAt);
    (0, portalPublicArtifactValidationCommon_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
function validateAwsPortalAccountSummaryAiCostSummarySiblingBinding(aiValue, siblingValue, siblingBodyDescriptorValue) {
    const ai = validateAwsPortalAccountSummaryAiCostSummaryArtifact(aiValue);
    const sibling = (0, portalPublicArtifactCurrentValidation_1.validateAwsPortalAccountSummaryDetailArtifact)(siblingValue);
    (0, pluginPublicArtifactValidationHelpers_1.validateDescriptor)(siblingBodyDescriptorValue, 'siblingBodyDescriptor');
    const descriptor = (0, portalPublicArtifactValidationCommon_1.asRecord)(siblingBodyDescriptorValue, 'siblingBodyDescriptor');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(descriptor.name, portalPublicArtifacts_1.AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME, 'siblingBodyDescriptor.name');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(descriptor.mediaType, 'application/json', 'siblingBodyDescriptor.mediaType');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(descriptor.contentEncoding, 'gzip', 'siblingBodyDescriptor.contentEncoding');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(ai.accountId, sibling.accountId, 'artifact.accountId');
    if (JSON.stringify(ai.source.scope) !== JSON.stringify(sibling.scope))
        throw new Error('artifact.source.scope must match its sibling account summary exactly.');
    if (JSON.stringify(ai.source.artifactGeneration) !== JSON.stringify(sibling.artifactGeneration))
        throw new Error('artifact.source.artifactGeneration must match its sibling account summary exactly.');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(ai.source.sha256, descriptor.sha256, 'artifact.source.sha256');
    return ai;
}
function validateAiEntries(value, sourceScope, siblingGeneratedAt) {
    if (!Array.isArray(value) || value.length === 0)
        throw new Error('artifact.entries must be a non-empty array.');
    const audiences = [];
    value.forEach((entry, index) => {
        const field = `artifact.entries[${index}]`;
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, [
            'targetKey',
            'audience',
            'artifactVersion',
            'generatedAt',
            'createdAt',
            'updatedAt',
            'sourceRecommendationPosture',
            'status',
            'summary',
            'provider',
        ], field);
        const audience = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(item.audience, AI_AUDIENCES, `${field}.audience`);
        audiences.push(audience);
        (0, portalPublicArtifactValidationCommon_1.assertValue)(item.targetKey, (0, portalPublicArtifacts_1.buildAwsPortalAccountSummaryAiCostSummaryTargetKey)(sourceScope, audience), `${field}.targetKey`);
        (0, portalPublicArtifactValidationCommon_1.assertValue)(item.artifactVersion, 1, `${field}.artifactVersion`);
        const entryGeneratedAt = (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(item.generatedAt, `${field}.generatedAt`);
        if (Date.parse(entryGeneratedAt) < Date.parse(siblingGeneratedAt))
            throw new Error(`${field}.generatedAt must not predate its sibling account summary.`);
        const createdAt = (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(item.createdAt, `${field}.createdAt`);
        const updatedAt = (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(item.updatedAt, `${field}.updatedAt`);
        if (Date.parse(createdAt) > Date.parse(updatedAt) || Date.parse(updatedAt) > Date.parse(entryGeneratedAt))
            throw new Error(`${field} record times must not exceed generatedAt.`);
        if (item.sourceRecommendationPosture !== undefined)
            (0, portalPublicArtifactNestedEvidenceValidation_1.validateRecommendationPosture)(item.sourceRecommendationPosture, `${field}.sourceRecommendationPosture`);
        (0, portalPublicArtifactValidationCommon_1.assertValue)(item.status, 'available', `${field}.status`);
        const summary = (0, portalPublicArtifactValidationCommon_1.asRecord)(item.summary, `${field}.summary`);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(summary, ['headline', 'narrative'], `${field}.summary`);
        (0, portalPublicArtifactValidationCommon_1.requiredString)(summary.headline, `${field}.summary.headline`);
        (0, portalPublicArtifactValidationCommon_1.requiredString)(summary.narrative, `${field}.summary.narrative`);
        validateAiProvider(item.provider, `${field}.provider`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(audiences, 'artifact.entries audiences');
    const expected = [...audiences].sort((left, right) => AI_AUDIENCES.indexOf(left) - AI_AUDIENCES.indexOf(right));
    if (JSON.stringify(audiences) !== JSON.stringify(expected))
        throw new Error('artifact.entries must be ordered by audience.');
}
function validateAiProvider(value, field) {
    const provider = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(provider, ['type', 'inferenceProfileId', 'promptVersionArn', 'stopReason', 'latencyMs', 'usage', 'trace'], field);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(provider.type, 'amazon-bedrock', `${field}.type`);
    (0, portalPublicArtifactValidationCommon_1.requiredString)(provider.inferenceProfileId, `${field}.inferenceProfileId`);
    (0, portalPublicArtifactValidationCommon_1.requiredString)(provider.promptVersionArn, `${field}.promptVersionArn`);
    if (provider.stopReason !== undefined)
        (0, portalPublicArtifactValidationCommon_1.requiredString)(provider.stopReason, `${field}.stopReason`);
    if (provider.latencyMs !== undefined)
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(provider.latencyMs, `${field}.latencyMs`);
    if (provider.usage !== undefined) {
        const usage = (0, portalPublicArtifactValidationCommon_1.asRecord)(provider.usage, `${field}.usage`);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(usage, ['inputTokens', 'outputTokens', 'totalTokens'], `${field}.usage`);
        const input = (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(usage.inputTokens, `${field}.usage.inputTokens`);
        const output = (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(usage.outputTokens, `${field}.usage.outputTokens`);
        const total = (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(usage.totalTokens, `${field}.usage.totalTokens`);
        if (total !== input + output)
            throw new Error(`${field}.usage.totalTokens must equal inputTokens plus outputTokens.`);
    }
    if (provider.trace !== undefined) {
        const trace = (0, portalPublicArtifactValidationCommon_1.asRecord)(provider.trace, `${field}.trace`);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(trace, ['guardrailActionReason', 'invokedModelId'], `${field}.trace`);
        if (trace.guardrailActionReason !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(trace.guardrailActionReason, `${field}.trace.guardrailActionReason`);
        if (trace.invokedModelId !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(trace.invokedModelId, `${field}.trace.invokedModelId`);
    }
}
function validateResourceSummary(value) {
    const summary = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.summary');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(summary, [
        'totalDiscoveredResourceCount',
        'returnedResourceCount',
        'emptyCollection',
        'truncated',
        'unmatchedRecommendationResourceCount',
        'unmatchedBillingExpenseCount',
    ], 'artifact.summary');
    ['totalDiscoveredResourceCount', 'returnedResourceCount', 'unmatchedRecommendationResourceCount', 'unmatchedBillingExpenseCount'].forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(summary[key], `artifact.summary.${key}`));
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.emptyCollection, 'artifact.summary.emptyCollection');
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.truncated, 'artifact.summary.truncated');
}
function validateHistoryBilling(value, field) {
    const billing = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(billing, [
        'totalPersistedExpenseCount',
        'emptyScope',
        'metadataFound',
        'metadataMatchesRequestedBillingPeriod',
        'totalsByCurrency',
        'pricingReferenceEstimation',
        'estimatedBillingAuthority',
    ], field);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(billing.totalPersistedExpenseCount, `${field}.totalPersistedExpenseCount`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(billing.emptyScope, `${field}.emptyScope`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(billing.metadataFound, `${field}.metadataFound`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(billing.metadataMatchesRequestedBillingPeriod, `${field}.metadataMatchesRequestedBillingPeriod`);
    if (!Array.isArray(billing.totalsByCurrency))
        throw new Error(`${field}.totalsByCurrency must be an array.`);
    const currencies = [];
    billing.totalsByCurrency.forEach((entry, index) => {
        const itemField = `${field}.totalsByCurrency[${index}]`;
        const total = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(total, ['currency', 'expenseCount', 'baseCostAmount', 'amortizedCostAmount', 'amortizedExpenseCount'], itemField);
        currencies.push((0, portalPublicArtifactValidationCommon_1.requiredString)(total.currency, `${itemField}.currency`));
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(total.expenseCount, `${itemField}.expenseCount`);
        (0, portalPublicArtifactValidationCommon_1.finiteNumber)(total.baseCostAmount, `${itemField}.baseCostAmount`);
        if (total.amortizedCostAmount !== undefined)
            (0, portalPublicArtifactValidationCommon_1.finiteNumber)(total.amortizedCostAmount, `${itemField}.amortizedCostAmount`);
        if (total.amortizedExpenseCount !== undefined)
            (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(total.amortizedExpenseCount, `${itemField}.amortizedExpenseCount`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(currencies, `${field}.totalsByCurrency`);
    if (billing.pricingReferenceEstimation !== undefined)
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(billing.pricingReferenceEstimation, `${field}.pricingReferenceEstimation`);
    if (billing.estimatedBillingAuthority !== undefined)
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(billing.estimatedBillingAuthority, `${field}.estimatedBillingAuthority`);
}
function validateHistoryDiscovery(value, field) {
    const discovery = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(discovery, ['families'], field);
    if (!Array.isArray(discovery.families))
        throw new Error(`${field}.families must be an array.`);
    const identities = [];
    discovery.families.forEach((entry, index) => {
        const itemField = `${field}.families[${index}]`;
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, ['family', 'resourceRegionCount', 'totalResources', 'regionsWithSuccessfulRefresh', 'regionsWithoutSuccessfulRefresh'], itemField);
        identities.push((0, portalPublicArtifactValidationCommon_1.requiredEnum)(item.family, DISCOVERY_FAMILIES, `${itemField}.family`));
        ['resourceRegionCount', 'regionsWithSuccessfulRefresh', 'regionsWithoutSuccessfulRefresh'].forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(item[key], `${itemField}.${key}`));
        if (item.totalResources !== undefined)
            (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(item.totalResources, `${itemField}.totalResources`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(identities, `${field}.families`);
}
function validateHistoryMetrics(value) {
    const metrics = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.metrics');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(metrics, ['families'], 'artifact.metrics');
    if (!Array.isArray(metrics.families))
        throw new Error('artifact.metrics.families must be an array.');
    const identities = [];
    metrics.families.forEach((entry, index) => {
        const field = `artifact.metrics.families[${index}]`;
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, [
            'metricFamily',
            'resourceRegionCount',
            'requestedMonthCount',
            'availableMonthCount',
            'missingMonthCount',
            'regionsWithCompleteCoverage',
            'regionsWithMissingCoverage',
        ], field);
        identities.push((0, portalPublicArtifactValidationCommon_1.requiredEnum)(item.metricFamily, METRIC_FAMILIES, `${field}.metricFamily`));
        Object.keys(item)
            .filter(key => key !== 'metricFamily')
            .forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(item[key], `${field}.${key}`));
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(identities, 'artifact.metrics.families');
}
function validateResourceHistoryRecommendations(value) {
    validateHistoryRecommendations(value, true);
}
function validateAccountHistoryRecommendations(value) {
    validateHistoryRecommendations(value, false);
}
function validateHistoryRecommendations(value, resourceHistory) {
    const recommendations = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.recommendations');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(recommendations, ['sources'], 'artifact.recommendations');
    if (!Array.isArray(recommendations.sources))
        throw new Error('artifact.recommendations.sources must be an array.');
    const sources = [];
    recommendations.sources.forEach((entry, index) => {
        const field = `artifact.recommendations.sources[${index}]`;
        const source = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, field);
        const keys = resourceHistory
            ? [
                'source',
                'totalStateCount',
                'currentStateCount',
                'matchedStateCount',
                'filteredOutStateCount',
                'positiveEstimatedSavingsRecommendationCount',
                'savingsByCurrency',
            ]
            : [
                'source',
                'totalStateCount',
                'matchedStateCount',
                'positiveEstimatedSavingsRecommendationCount',
                'sourceEvidence',
                'actionHealth',
                'savingsByCurrency',
            ];
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(source, keys, field);
        sources.push((0, portalPublicArtifactValidationCommon_1.requiredEnum)(source.source, RECOMMENDATION_SOURCES, `${field}.source`));
        keys.filter(key => key.endsWith('Count')).forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(source[key], `${field}.${key}`));
        if (source.sourceEvidence !== undefined)
            (0, portalPublicArtifactEvidenceValidation_1.validateRecommendationSourceEvidence)(source.sourceEvidence, `${field}.sourceEvidence`);
        if (source.actionHealth !== undefined)
            (0, portalPublicArtifactEvidenceValidation_1.validateRecommendationActionHealth)(source.actionHealth, `${field}.actionHealth`);
        (0, portalPublicArtifactNestedEvidenceValidation_1.validateSavingsByCurrency)(source.savingsByCurrency, `${field}.savingsByCurrency`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(sources, 'artifact.recommendations.sources');
}
function validateHistoryLogicalName(value, prefix, field) {
    const logicalName = (0, portalPublicArtifactValidationCommon_1.requiredString)(value, field);
    const pattern = new RegExp(`^${prefix}[a-f0-9]{64}\\.json\\.gz$`);
    if (!pattern.test(logicalName))
        throw new Error(`${field} must be a canonical package-owned history logical name.`);
}
//# sourceMappingURL=portalPublicArtifactHistoryAiValidation.js.map