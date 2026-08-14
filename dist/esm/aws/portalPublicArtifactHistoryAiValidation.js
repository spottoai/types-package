import { AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME, AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME, buildAwsPortalAccountSummaryHistoryLogicalNameForScope, buildAwsPortalAccountSummaryAiCostSummaryTargetKey, buildAwsPortalAccountSummaryTargetKey, buildAwsPortalResourceCollectionHistoryLogicalNameForScope, } from './portalPublicArtifacts.js';
import { asRecord, assertExactKeys, assertPublicJson, assertUnique, assertValue, finiteNumber, isoTimestamp, nonNegativeInteger, requiredBoolean, requiredEnum, requiredString, validateAccountScope, validateGeneration, validateHistoryAccountScope, validateJsonObject, validatePortalEnvelope, validateResourceScope, } from './portalPublicArtifactValidationCommon.js';
import { sha256, validateDescriptor } from './pluginPublicArtifactValidationHelpers.js';
import { validateAwsPortalAccountSummaryDetailArtifact } from './portalPublicArtifactCurrentValidation.js';
import { validateRecommendationPosture, validateSavingsByCurrency } from './portalPublicArtifactNestedEvidenceValidation.js';
import { validateRecommendationActionHealth, validateRecommendationSourceEvidence } from './portalPublicArtifactEvidenceValidation.js';
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
export function validateAwsPortalResourceCollectionHistoryArtifact(value) {
    const artifact = asRecord(value, 'artifact');
    const { accountId } = validatePortalEnvelope(artifact, 'resource-collection-history', [...HISTORY_ENVELOPE_KEYS, 'summary', 'metrics']);
    const scope = validateResourceScope(artifact.scope, accountId, 'artifact.scope');
    assertValue(artifact.logicalName, buildAwsPortalResourceCollectionHistoryLogicalNameForScope(scope, String(artifact.generatedAt)), 'artifact.logicalName');
    validateResourceSummary(artifact.summary);
    validateHistoryBilling(artifact.billing, 'artifact.billing');
    validateHistoryDiscovery(artifact.discovery, 'artifact.discovery');
    validateHistoryMetrics(artifact.metrics);
    validateResourceHistoryRecommendations(artifact.recommendations);
    assertPublicJson(artifact, 'artifact');
    return value;
}
export function validateAwsPortalAccountSummaryHistoryArtifact(value) {
    const artifact = asRecord(value, 'artifact');
    const { accountId } = validatePortalEnvelope(artifact, 'account-summary-history', HISTORY_ENVELOPE_KEYS);
    validateHistoryAccountScope(artifact.scope, accountId, 'artifact.scope');
    assertValue(artifact.logicalName, buildAwsPortalAccountSummaryHistoryLogicalNameForScope(artifact.scope), 'artifact.logicalName');
    validateHistoryBilling(artifact.billing, 'artifact.billing');
    validateHistoryDiscovery(artifact.discovery, 'artifact.discovery');
    validateAccountHistoryRecommendations(artifact.recommendations);
    assertPublicJson(artifact, 'artifact');
    return value;
}
export function validateAwsPortalRetainedHistoryBodyReference(value) {
    const reference = asRecord(value, 'reference');
    assertExactKeys(reference, ['artifactType', 'logicalName', 'artifactGeneration', 'body'], 'reference');
    const artifactType = requiredEnum(reference.artifactType, ['resource-collection-history', 'account-summary-history'], 'reference.artifactType');
    validateHistoryLogicalName(reference.logicalName, artifactType === 'resource-collection-history' ? 'resources-history--' : 'account-summary-history--', 'reference.logicalName');
    validateGeneration(reference.artifactGeneration, 'reference.artifactGeneration');
    validateDescriptor(reference.body, 'reference.body');
    const descriptor = asRecord(reference.body, 'reference.body');
    assertValue(descriptor.name, reference.logicalName, 'reference.body.name');
    assertValue(descriptor.mediaType, 'application/json', 'reference.body.mediaType');
    assertValue(descriptor.contentEncoding, 'gzip', 'reference.body.contentEncoding');
    assertPublicJson(reference, 'reference');
    return value;
}
export function validateAwsPortalRetainedHistoryBodyBinding(referenceValue, artifactValue) {
    const reference = validateAwsPortalRetainedHistoryBodyReference(referenceValue);
    const artifact = reference.artifactType === 'resource-collection-history'
        ? validateAwsPortalResourceCollectionHistoryArtifact(artifactValue)
        : validateAwsPortalAccountSummaryHistoryArtifact(artifactValue);
    assertValue(artifact.artifactType, reference.artifactType, 'artifact.artifactType');
    assertValue(artifact.logicalName, reference.logicalName, 'artifact.logicalName');
    if (JSON.stringify(artifact.artifactGeneration) !== JSON.stringify(reference.artifactGeneration))
        throw new Error('artifact.artifactGeneration must match its retained-history reference exactly.');
    return reference;
}
export function validateAwsPortalAccountSummaryAiCostSummaryArtifact(value) {
    const artifact = asRecord(value, 'artifact');
    const { accountId, runId, portalGeneratedAt, bodyGeneratedAt } = validatePortalEnvelope(artifact, 'account-summary-ai-cost-summary', [
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
    assertValue(bodyGeneratedAt, portalGeneratedAt, 'artifact.generatedAt');
    assertValue(artifact.logicalName, AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME, 'artifact.logicalName');
    const source = asRecord(artifact.source, 'artifact.source');
    assertExactKeys(source, ['scope', 'targetKey', 'logicalName', 'artifactType', 'artifactGeneration', 'sha256'], 'artifact.source');
    const sourceScope = validateAccountScope(source.scope, accountId, 'artifact.source.scope');
    assertValue(source.targetKey, buildAwsPortalAccountSummaryTargetKey(sourceScope), 'artifact.source.targetKey');
    assertValue(source.logicalName, AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME, 'artifact.source.logicalName');
    assertValue(source.artifactType, 'account-summary', 'artifact.source.artifactType');
    const sourceGeneration = validateGeneration(source.artifactGeneration, 'artifact.source.artifactGeneration');
    assertValue(sourceGeneration.runId, runId, 'artifact.source.artifactGeneration.runId');
    assertValue(sourceGeneration.generatedAt, portalGeneratedAt, 'artifact.source.artifactGeneration.generatedAt');
    sha256(source.sha256, 'artifact.source.sha256');
    validateAiEntries(artifact.entries, sourceScope, bodyGeneratedAt);
    assertPublicJson(artifact, 'artifact');
    return value;
}
export function validateAwsPortalAccountSummaryAiCostSummarySiblingBinding(aiValue, siblingValue, siblingBodyDescriptorValue) {
    const ai = validateAwsPortalAccountSummaryAiCostSummaryArtifact(aiValue);
    const sibling = validateAwsPortalAccountSummaryDetailArtifact(siblingValue);
    validateDescriptor(siblingBodyDescriptorValue, 'siblingBodyDescriptor');
    const descriptor = asRecord(siblingBodyDescriptorValue, 'siblingBodyDescriptor');
    assertValue(descriptor.name, AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME, 'siblingBodyDescriptor.name');
    assertValue(descriptor.mediaType, 'application/json', 'siblingBodyDescriptor.mediaType');
    assertValue(descriptor.contentEncoding, 'gzip', 'siblingBodyDescriptor.contentEncoding');
    assertValue(ai.accountId, sibling.accountId, 'artifact.accountId');
    if (JSON.stringify(ai.source.scope) !== JSON.stringify(sibling.scope))
        throw new Error('artifact.source.scope must match its sibling account summary exactly.');
    if (JSON.stringify(ai.source.artifactGeneration) !== JSON.stringify(sibling.artifactGeneration))
        throw new Error('artifact.source.artifactGeneration must match its sibling account summary exactly.');
    assertValue(ai.source.sha256, descriptor.sha256, 'artifact.source.sha256');
    return ai;
}
function validateAiEntries(value, sourceScope, siblingGeneratedAt) {
    if (!Array.isArray(value) || value.length === 0)
        throw new Error('artifact.entries must be a non-empty array.');
    const audiences = [];
    value.forEach((entry, index) => {
        const field = `artifact.entries[${index}]`;
        const item = asRecord(entry, field);
        assertExactKeys(item, [
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
        const audience = requiredEnum(item.audience, AI_AUDIENCES, `${field}.audience`);
        audiences.push(audience);
        assertValue(item.targetKey, buildAwsPortalAccountSummaryAiCostSummaryTargetKey(sourceScope, audience), `${field}.targetKey`);
        assertValue(item.artifactVersion, 1, `${field}.artifactVersion`);
        const entryGeneratedAt = isoTimestamp(item.generatedAt, `${field}.generatedAt`);
        if (Date.parse(entryGeneratedAt) < Date.parse(siblingGeneratedAt))
            throw new Error(`${field}.generatedAt must not predate its sibling account summary.`);
        const createdAt = isoTimestamp(item.createdAt, `${field}.createdAt`);
        const updatedAt = isoTimestamp(item.updatedAt, `${field}.updatedAt`);
        if (Date.parse(createdAt) > Date.parse(updatedAt) || Date.parse(updatedAt) > Date.parse(entryGeneratedAt))
            throw new Error(`${field} record times must not exceed generatedAt.`);
        if (item.sourceRecommendationPosture !== undefined)
            validateRecommendationPosture(item.sourceRecommendationPosture, `${field}.sourceRecommendationPosture`);
        assertValue(item.status, 'available', `${field}.status`);
        const summary = asRecord(item.summary, `${field}.summary`);
        assertExactKeys(summary, ['headline', 'narrative'], `${field}.summary`);
        requiredString(summary.headline, `${field}.summary.headline`);
        requiredString(summary.narrative, `${field}.summary.narrative`);
        validateAiProvider(item.provider, `${field}.provider`);
    });
    assertUnique(audiences, 'artifact.entries audiences');
    const expected = [...audiences].sort((left, right) => AI_AUDIENCES.indexOf(left) - AI_AUDIENCES.indexOf(right));
    if (JSON.stringify(audiences) !== JSON.stringify(expected))
        throw new Error('artifact.entries must be ordered by audience.');
}
function validateAiProvider(value, field) {
    const provider = asRecord(value, field);
    assertExactKeys(provider, ['type', 'inferenceProfileId', 'promptVersionArn', 'stopReason', 'latencyMs', 'usage', 'trace'], field);
    assertValue(provider.type, 'amazon-bedrock', `${field}.type`);
    requiredString(provider.inferenceProfileId, `${field}.inferenceProfileId`);
    requiredString(provider.promptVersionArn, `${field}.promptVersionArn`);
    if (provider.stopReason !== undefined)
        requiredString(provider.stopReason, `${field}.stopReason`);
    if (provider.latencyMs !== undefined)
        nonNegativeInteger(provider.latencyMs, `${field}.latencyMs`);
    if (provider.usage !== undefined) {
        const usage = asRecord(provider.usage, `${field}.usage`);
        assertExactKeys(usage, ['inputTokens', 'outputTokens', 'totalTokens'], `${field}.usage`);
        const input = nonNegativeInteger(usage.inputTokens, `${field}.usage.inputTokens`);
        const output = nonNegativeInteger(usage.outputTokens, `${field}.usage.outputTokens`);
        const total = nonNegativeInteger(usage.totalTokens, `${field}.usage.totalTokens`);
        if (total !== input + output)
            throw new Error(`${field}.usage.totalTokens must equal inputTokens plus outputTokens.`);
    }
    if (provider.trace !== undefined) {
        const trace = asRecord(provider.trace, `${field}.trace`);
        assertExactKeys(trace, ['guardrailActionReason', 'invokedModelId'], `${field}.trace`);
        if (trace.guardrailActionReason !== undefined)
            requiredString(trace.guardrailActionReason, `${field}.trace.guardrailActionReason`);
        if (trace.invokedModelId !== undefined)
            requiredString(trace.invokedModelId, `${field}.trace.invokedModelId`);
    }
}
function validateResourceSummary(value) {
    const summary = asRecord(value, 'artifact.summary');
    assertExactKeys(summary, [
        'totalDiscoveredResourceCount',
        'returnedResourceCount',
        'emptyCollection',
        'truncated',
        'unmatchedRecommendationResourceCount',
        'unmatchedBillingExpenseCount',
    ], 'artifact.summary');
    ['totalDiscoveredResourceCount', 'returnedResourceCount', 'unmatchedRecommendationResourceCount', 'unmatchedBillingExpenseCount'].forEach(key => nonNegativeInteger(summary[key], `artifact.summary.${key}`));
    requiredBoolean(summary.emptyCollection, 'artifact.summary.emptyCollection');
    requiredBoolean(summary.truncated, 'artifact.summary.truncated');
}
function validateHistoryBilling(value, field) {
    const billing = asRecord(value, field);
    assertExactKeys(billing, [
        'totalPersistedExpenseCount',
        'emptyScope',
        'metadataFound',
        'metadataMatchesRequestedBillingPeriod',
        'totalsByCurrency',
        'pricingReferenceEstimation',
        'estimatedBillingAuthority',
    ], field);
    nonNegativeInteger(billing.totalPersistedExpenseCount, `${field}.totalPersistedExpenseCount`);
    requiredBoolean(billing.emptyScope, `${field}.emptyScope`);
    requiredBoolean(billing.metadataFound, `${field}.metadataFound`);
    requiredBoolean(billing.metadataMatchesRequestedBillingPeriod, `${field}.metadataMatchesRequestedBillingPeriod`);
    if (!Array.isArray(billing.totalsByCurrency))
        throw new Error(`${field}.totalsByCurrency must be an array.`);
    const currencies = [];
    billing.totalsByCurrency.forEach((entry, index) => {
        const itemField = `${field}.totalsByCurrency[${index}]`;
        const total = asRecord(entry, itemField);
        assertExactKeys(total, ['currency', 'expenseCount', 'baseCostAmount', 'amortizedCostAmount', 'amortizedExpenseCount'], itemField);
        currencies.push(requiredString(total.currency, `${itemField}.currency`));
        nonNegativeInteger(total.expenseCount, `${itemField}.expenseCount`);
        finiteNumber(total.baseCostAmount, `${itemField}.baseCostAmount`);
        if (total.amortizedCostAmount !== undefined)
            finiteNumber(total.amortizedCostAmount, `${itemField}.amortizedCostAmount`);
        if (total.amortizedExpenseCount !== undefined)
            nonNegativeInteger(total.amortizedExpenseCount, `${itemField}.amortizedExpenseCount`);
    });
    assertUnique(currencies, `${field}.totalsByCurrency`);
    if (billing.pricingReferenceEstimation !== undefined)
        validateJsonObject(billing.pricingReferenceEstimation, `${field}.pricingReferenceEstimation`);
    if (billing.estimatedBillingAuthority !== undefined)
        validateJsonObject(billing.estimatedBillingAuthority, `${field}.estimatedBillingAuthority`);
}
function validateHistoryDiscovery(value, field) {
    const discovery = asRecord(value, field);
    assertExactKeys(discovery, ['families'], field);
    if (!Array.isArray(discovery.families))
        throw new Error(`${field}.families must be an array.`);
    const identities = [];
    discovery.families.forEach((entry, index) => {
        const itemField = `${field}.families[${index}]`;
        const item = asRecord(entry, itemField);
        assertExactKeys(item, ['family', 'resourceRegionCount', 'totalResources', 'regionsWithSuccessfulRefresh', 'regionsWithoutSuccessfulRefresh'], itemField);
        identities.push(requiredEnum(item.family, DISCOVERY_FAMILIES, `${itemField}.family`));
        ['resourceRegionCount', 'regionsWithSuccessfulRefresh', 'regionsWithoutSuccessfulRefresh'].forEach(key => nonNegativeInteger(item[key], `${itemField}.${key}`));
        if (item.totalResources !== undefined)
            nonNegativeInteger(item.totalResources, `${itemField}.totalResources`);
    });
    assertUnique(identities, `${field}.families`);
}
function validateHistoryMetrics(value) {
    const metrics = asRecord(value, 'artifact.metrics');
    assertExactKeys(metrics, ['families'], 'artifact.metrics');
    if (!Array.isArray(metrics.families))
        throw new Error('artifact.metrics.families must be an array.');
    const identities = [];
    metrics.families.forEach((entry, index) => {
        const field = `artifact.metrics.families[${index}]`;
        const item = asRecord(entry, field);
        assertExactKeys(item, [
            'metricFamily',
            'resourceRegionCount',
            'requestedMonthCount',
            'availableMonthCount',
            'missingMonthCount',
            'regionsWithCompleteCoverage',
            'regionsWithMissingCoverage',
        ], field);
        identities.push(requiredEnum(item.metricFamily, METRIC_FAMILIES, `${field}.metricFamily`));
        Object.keys(item)
            .filter(key => key !== 'metricFamily')
            .forEach(key => nonNegativeInteger(item[key], `${field}.${key}`));
    });
    assertUnique(identities, 'artifact.metrics.families');
}
function validateResourceHistoryRecommendations(value) {
    validateHistoryRecommendations(value, true);
}
function validateAccountHistoryRecommendations(value) {
    validateHistoryRecommendations(value, false);
}
function validateHistoryRecommendations(value, resourceHistory) {
    const recommendations = asRecord(value, 'artifact.recommendations');
    assertExactKeys(recommendations, ['sources'], 'artifact.recommendations');
    if (!Array.isArray(recommendations.sources))
        throw new Error('artifact.recommendations.sources must be an array.');
    const sources = [];
    recommendations.sources.forEach((entry, index) => {
        const field = `artifact.recommendations.sources[${index}]`;
        const source = asRecord(entry, field);
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
        assertExactKeys(source, keys, field);
        sources.push(requiredEnum(source.source, RECOMMENDATION_SOURCES, `${field}.source`));
        keys.filter(key => key.endsWith('Count')).forEach(key => nonNegativeInteger(source[key], `${field}.${key}`));
        if (source.sourceEvidence !== undefined)
            validateRecommendationSourceEvidence(source.sourceEvidence, `${field}.sourceEvidence`);
        if (source.actionHealth !== undefined)
            validateRecommendationActionHealth(source.actionHealth, `${field}.actionHealth`);
        validateSavingsByCurrency(source.savingsByCurrency, `${field}.savingsByCurrency`);
    });
    assertUnique(sources, 'artifact.recommendations.sources');
}
function validateHistoryLogicalName(value, prefix, field) {
    const logicalName = requiredString(value, field);
    const pattern = new RegExp(`^${prefix}[a-f0-9]{64}\\.json\\.gz$`);
    if (!pattern.test(logicalName))
        throw new Error(`${field} must be a canonical package-owned history logical name.`);
}
