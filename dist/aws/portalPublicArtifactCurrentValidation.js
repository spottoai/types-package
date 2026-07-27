"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsPortalResourceCollectionDetailArtifact = validateAwsPortalResourceCollectionDetailArtifact;
exports.validateAwsPortalAccountSummaryDetailArtifact = validateAwsPortalAccountSummaryDetailArtifact;
const portalPublicArtifacts_1 = require("./portalPublicArtifacts");
const portalPublicArtifactValidationCommon_1 = require("./portalPublicArtifactValidationCommon");
const portalPublicArtifactEvidenceValidation_1 = require("./portalPublicArtifactEvidenceValidation");
const portalPublicArtifactNestedEvidenceValidation_1 = require("./portalPublicArtifactNestedEvidenceValidation");
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
const CURRENT_KEYS = [
    'schemaVersion',
    'portalSchemaVersion',
    'provider',
    'accountId',
    'artifactType',
    'artifactGeneration',
    'generatedAt',
    'logicalName',
    'scope',
];
function validateAwsPortalResourceCollectionDetailArtifact(value) {
    const artifact = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact');
    const { accountId } = (0, portalPublicArtifactValidationCommon_1.validatePortalEnvelope)(artifact, 'resource-collection', [...CURRENT_KEYS, 'summary', 'coverage', 'resources']);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.logicalName, portalPublicArtifacts_1.AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME, 'artifact.logicalName');
    const scope = (0, portalPublicArtifactValidationCommon_1.validateResourceScope)(artifact.scope, accountId, 'artifact.scope');
    validateResourceSummary(artifact.summary, 'artifact.summary');
    validateResourceCoverage(artifact.coverage, accountId, scope);
    if (!Array.isArray(artifact.resources))
        throw new Error('artifact.resources must be an array.');
    validateResources(artifact.resources, scope.resourceRegions);
    const summary = (0, portalPublicArtifactValidationCommon_1.asRecord)(artifact.summary, 'artifact.summary');
    if (summary.returnedResourceCount !== artifact.resources.length)
        throw new Error('artifact.summary.returnedResourceCount must equal artifact.resources length.');
    if (Number(summary.totalDiscoveredResourceCount) < Number(summary.returnedResourceCount))
        throw new Error('artifact.summary.totalDiscoveredResourceCount must not be less than returnedResourceCount.');
    (0, portalPublicArtifactValidationCommon_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
function validateAwsPortalAccountSummaryDetailArtifact(value) {
    const artifact = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact');
    const { accountId } = (0, portalPublicArtifactValidationCommon_1.validatePortalEnvelope)(artifact, 'account-summary', [
        ...CURRENT_KEYS,
        'account',
        'billing',
        'discovery',
        'metrics',
        'recommendations',
    ]);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.logicalName, portalPublicArtifacts_1.AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME, 'artifact.logicalName');
    const scope = (0, portalPublicArtifactValidationCommon_1.validateAccountScope)(artifact.scope, accountId, 'artifact.scope');
    validateAccount(artifact.account, accountId);
    (0, portalPublicArtifactEvidenceValidation_1.validateAwsPortalBillingBlock)(artifact.billing, 'artifact.billing', scope.billing, accountId, true);
    validateDiscovery(artifact.discovery, scope.resourceRegions, 'artifact.discovery');
    validateMetrics(artifact.metrics, scope.resourceRegions, 'artifact.metrics', 'account');
    (0, portalPublicArtifactEvidenceValidation_1.validateAwsPortalRecommendationCoverage)(artifact.recommendations, accountId, scope.resourceRegions, 'artifact.recommendations', RECOMMENDATION_SOURCES, true);
    (0, portalPublicArtifactValidationCommon_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
function validateResourceSummary(value, field) {
    const summary = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    const keys = [
        'totalDiscoveredResourceCount',
        'returnedResourceCount',
        'emptyCollection',
        'truncated',
        'unmatchedRecommendationResourceCount',
        'unmatchedBillingExpenseCount',
    ];
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(summary, keys, field);
    keys.filter(key => !['emptyCollection', 'truncated'].includes(key)).forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(summary[key], `${field}.${key}`));
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.emptyCollection, `${field}.emptyCollection`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.truncated, `${field}.truncated`);
    if (summary.emptyCollection === true && Number(summary.returnedResourceCount) !== 0)
        throw new Error(`${field}.emptyCollection requires zero returned resources.`);
}
function validateResourceCoverage(value, accountId, scope) {
    const coverage = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.coverage');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(coverage, ['billing', 'discovery', 'metrics', 'recommendations', 'virtualTags'], 'artifact.coverage');
    (0, portalPublicArtifactEvidenceValidation_1.validateAwsPortalBillingBlock)(coverage.billing, 'artifact.coverage.billing', scope.billing, accountId, false);
    validateDiscovery(coverage.discovery, scope.resourceRegions, 'artifact.coverage.discovery');
    validateMetrics(coverage.metrics, scope.resourceRegions, 'artifact.coverage.metrics', 'resource');
    (0, portalPublicArtifactEvidenceValidation_1.validateAwsPortalRecommendationCoverage)(coverage.recommendations, accountId, scope.resourceRegions, 'artifact.coverage.recommendations', RECOMMENDATION_SOURCES, false);
    if (coverage.virtualTags !== undefined)
        validateVirtualTags(coverage.virtualTags);
}
function validateDiscovery(value, regions, field) {
    const discovery = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(discovery, ['families'], field);
    if (!Array.isArray(discovery.families))
        throw new Error(`${field}.families must be an array.`);
    const identities = [];
    discovery.families.forEach((entry, index) => {
        const itemField = `${field}.families[${index}]`;
        const family = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(family, ['family', 'resourceRegion', 'freshness', 'summary', 'groupedTotals'], itemField);
        const familyName = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(family.family, DISCOVERY_FAMILIES, `${itemField}.family`);
        const region = (0, portalPublicArtifactValidationCommon_1.requiredString)(family.resourceRegion, `${itemField}.resourceRegion`);
        if (!regions.includes(region))
            throw new Error(`${itemField}.resourceRegion is outside artifact scope.`);
        identities.push(`${familyName}|${region}`);
        (0, portalPublicArtifactValidationCommon_1.validateFreshness)(family.freshness, `${itemField}.freshness`, 'lastSuccessfulRefreshAt');
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(family.summary, `${itemField}.summary`);
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(family.groupedTotals, `${itemField}.groupedTotals`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(identities, `${field}.families`);
}
function validateMetrics(value, regions, field, kind) {
    const metrics = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(metrics, ['families'], field);
    if (!Array.isArray(metrics.families))
        throw new Error(`${field}.families must be an array.`);
    const identities = [];
    metrics.families.forEach((entry, index) => {
        const itemField = `${field}.families[${index}]`;
        const family = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        const keys = kind === 'resource'
            ? ['metricFamily', 'resourceRegion', 'requestedMonths', 'availableMonths', 'missingMonths', 'coverage', 'summary']
            : ['metricFamily', 'resourceRegion', 'status', 'requestedMonths', 'availableMonths', 'missingMonths', 'freshness', 'readiness', 'summary'];
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(family, keys, itemField);
        const metricFamily = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(family.metricFamily, METRIC_FAMILIES, `${itemField}.metricFamily`);
        const region = (0, portalPublicArtifactValidationCommon_1.requiredString)(family.resourceRegion, `${itemField}.resourceRegion`);
        if (!regions.includes(region))
            throw new Error(`${itemField}.resourceRegion is outside artifact scope.`);
        identities.push(`${metricFamily}|${region}`);
        if (family.status !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredEnum)(family.status, ['available', 'not-found'], `${itemField}.status`);
        const requestedMonths = (0, portalPublicArtifactValidationCommon_1.stringArray)(family.requestedMonths, `${itemField}.requestedMonths`);
        const availableMonths = (0, portalPublicArtifactValidationCommon_1.stringArray)(family.availableMonths, `${itemField}.availableMonths`);
        const missingMonths = (0, portalPublicArtifactValidationCommon_1.stringArray)(family.missingMonths, `${itemField}.missingMonths`);
        [...requestedMonths, ...availableMonths, ...missingMonths].forEach(month => {
            if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
                throw new Error(`${itemField} contains a non-canonical billing month: ${month}.`);
        });
        const classifiedMonths = [...availableMonths, ...missingMonths].sort();
        (0, portalPublicArtifactValidationCommon_1.assertUnique)(classifiedMonths, `${itemField} classified months`);
        if (JSON.stringify(requestedMonths) !== JSON.stringify(classifiedMonths))
            throw new Error(`${itemField} requestedMonths must equal availableMonths plus missingMonths.`);
        if (family.freshness !== undefined)
            (0, portalPublicArtifactValidationCommon_1.validateFreshness)(family.freshness, `${itemField}.freshness`, 'lastSuccessfulRefreshAt');
        if (family.readiness !== undefined)
            (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(family.readiness, `${itemField}.readiness`);
        if (family.coverage !== undefined)
            (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(family.coverage, `${itemField}.coverage`);
        if (family.summary !== undefined)
            (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(family.summary, `${itemField}.summary`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(identities, `${field}.families`);
}
function validateVirtualTags(value) {
    const tags = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.coverage.virtualTags');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(tags, ['status', 'source', 'generatedAt', 'rulesHash', 'enabledRuleCount', 'appliedRuleCount', 'taggedResourceCount', 'unsupportedRuleCount', 'reason'], 'artifact.coverage.virtualTags');
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(tags.status, ['available', 'missing', 'malformed', 'unsupported'], 'artifact.coverage.virtualTags.status');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(tags.source, 'spotto-tags', 'artifact.coverage.virtualTags.source');
    (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(tags.generatedAt, 'artifact.coverage.virtualTags.generatedAt');
    if (tags.rulesHash !== undefined && !/^[a-f0-9]{64}$/.test(String(tags.rulesHash)))
        throw new Error('artifact.coverage.virtualTags.rulesHash must be a SHA-256.');
    ['enabledRuleCount', 'appliedRuleCount', 'taggedResourceCount', 'unsupportedRuleCount'].forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(tags[key], `artifact.coverage.virtualTags.${key}`));
    if (tags.reason !== undefined)
        (0, portalPublicArtifactValidationCommon_1.requiredString)(tags.reason, 'artifact.coverage.virtualTags.reason');
}
function validateResources(value, regions) {
    if (!Array.isArray(value))
        throw new Error('artifact.resources must be an array.');
    const stableKeys = [];
    value.forEach((entry, index) => {
        const field = `artifact.resources[${index}]`;
        const resource = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(resource, [
            'stableKey',
            'family',
            'resourceRegion',
            'resourceType',
            'resourceArn',
            'resourceId',
            'resourceName',
            'tags',
            'spottoTags',
            'discovery',
            'billing',
            'metrics',
            'recommendations',
        ], field);
        stableKeys.push((0, portalPublicArtifactValidationCommon_1.requiredString)(resource.stableKey, `${field}.stableKey`));
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(resource.family, DISCOVERY_FAMILIES, `${field}.family`);
        const region = (0, portalPublicArtifactValidationCommon_1.requiredString)(resource.resourceRegion, `${field}.resourceRegion`);
        if (!regions.includes(region))
            throw new Error(`${field}.resourceRegion is outside artifact scope.`);
        (0, portalPublicArtifactValidationCommon_1.requiredString)(resource.resourceType, `${field}.resourceType`);
        ['resourceArn', 'resourceId', 'resourceName'].forEach(key => {
            if (resource[key] !== undefined)
                (0, portalPublicArtifactValidationCommon_1.requiredString)(resource[key], `${field}.${key}`);
        });
        if (resource.tags !== undefined)
            validateStringMap(resource.tags, `${field}.tags`);
        if (resource.spottoTags !== undefined)
            (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(resource.spottoTags, `${field}.spottoTags`);
        const discovery = (0, portalPublicArtifactValidationCommon_1.asRecord)(resource.discovery, `${field}.discovery`);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(discovery, ['freshness', 'summary'], `${field}.discovery`);
        (0, portalPublicArtifactValidationCommon_1.validateFreshness)(discovery.freshness, `${field}.discovery.freshness`, 'lastSuccessfulRefreshAt');
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(discovery.summary, `${field}.discovery.summary`);
        if (resource.billing !== undefined)
            (0, portalPublicArtifactNestedEvidenceValidation_1.validateResourceBillingEvidence)(resource.billing, `${field}.billing`);
        if (resource.metrics !== undefined)
            validateResourceMetrics(resource.metrics, `${field}.metrics`);
        if (resource.recommendations !== undefined)
            validateResourceRecommendations(resource.recommendations, `${field}.recommendations`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(stableKeys, 'artifact.resources');
}
function validateResourceMetrics(value, field) {
    const metrics = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(metrics, ['supported', 'families'], field);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(metrics.supported, `${field}.supported`);
    if (!Array.isArray(metrics.families))
        throw new Error(`${field}.families must be an array.`);
    metrics.families.forEach((entry, index) => {
        const family = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, `${field}.families[${index}]`);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(family, ['metricFamily', 'summary', 'coverage'], `${field}.families[${index}]`);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(family.metricFamily, METRIC_FAMILIES, `${field}.families[${index}].metricFamily`);
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(family.summary, `${field}.families[${index}].summary`);
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(family.coverage, `${field}.families[${index}].coverage`);
    });
}
function validateResourceRecommendations(value, field) {
    const recommendations = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(recommendations, ['matchedRecommendationCount', 'sources', 'actionability', 'templateProvenance', 'counts', 'savings'], field);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(recommendations.matchedRecommendationCount, `${field}.matchedRecommendationCount`);
    (0, portalPublicArtifactValidationCommon_1.stringArray)(recommendations.sources, `${field}.sources`).forEach(source => (0, portalPublicArtifactValidationCommon_1.requiredEnum)(source, RECOMMENDATION_SOURCES, `${field}.sources`));
    if (recommendations.actionability !== undefined) {
        (0, portalPublicArtifactNestedEvidenceValidation_1.validateRecommendationActionability)(recommendations.actionability, `${field}.actionability`);
    }
    if (recommendations.templateProvenance !== undefined)
        validateTemplateProvenance(recommendations.templateProvenance, `${field}.templateProvenance`);
    (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(recommendations.counts, `${field}.counts`);
    (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(recommendations.savings, `${field}.savings`);
}
function validateTemplateProvenance(value, field) {
    const provenance = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(provenance, [
        'status',
        'templateBackedRecommendationCount',
        'missingTemplateRecommendationCount',
        'internalTemplateCount',
        'externalTemplateCount',
        'confidenceBackedRecommendationCount',
        'templateRecommendationWithoutConfidenceCount',
        'lowestConfidenceSources',
        'minimumConfidencePercentage',
        'maximumConfidencePercentage',
        'averageConfidencePercentage',
    ], field);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(provenance.status, ['available-no-template-items', 'missing-template-evidence', 'missing-confidence-evidence', 'available-with-confidence'], `${field}.status`);
    [
        'templateBackedRecommendationCount',
        'missingTemplateRecommendationCount',
        'internalTemplateCount',
        'externalTemplateCount',
        'confidenceBackedRecommendationCount',
        'templateRecommendationWithoutConfidenceCount',
    ].forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(provenance[key], `${field}.${key}`));
    (0, portalPublicArtifactNestedEvidenceValidation_1.validateTemplateProvenanceSources)(provenance.lowestConfidenceSources, `${field}.lowestConfidenceSources`);
    ['minimumConfidencePercentage', 'maximumConfidencePercentage', 'averageConfidencePercentage'].forEach(key => {
        if (provenance[key] !== undefined && (typeof provenance[key] !== 'number' || !Number.isFinite(provenance[key])))
            throw new Error(`${field}.${key} must be finite.`);
    });
}
function validateAccount(value, accountId) {
    const account = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.account');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(account, [
        'metadataFound',
        'providerAccountId',
        'cloudAccountId',
        'accountName',
        'validatedAt',
        'providerPartition',
        'summary',
        'firstUsefulRecommendationReadiness',
    ], 'artifact.account');
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(account.metadataFound, 'artifact.account.metadataFound');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(account.providerAccountId, accountId, 'artifact.account.providerAccountId');
    ['cloudAccountId', 'accountName', 'providerPartition'].forEach(key => {
        if (account[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(account[key], `artifact.account.${key}`);
    });
    (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(account.validatedAt, 'artifact.account.validatedAt');
    (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(account.summary, 'artifact.account.summary');
    if (account.firstUsefulRecommendationReadiness !== undefined)
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(account.firstUsefulRecommendationReadiness, 'artifact.account.firstUsefulRecommendationReadiness');
}
function validateStringMap(value, field) {
    const map = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    Object.entries(map).forEach(([key, item]) => {
        (0, portalPublicArtifactValidationCommon_1.requiredString)(key, `${field} key`);
        (0, portalPublicArtifactValidationCommon_1.requiredString)(item, `${field}.${key}`);
    });
}
//# sourceMappingURL=portalPublicArtifactCurrentValidation.js.map