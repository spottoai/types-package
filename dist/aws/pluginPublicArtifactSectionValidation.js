"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSubscriptionSections = validateSubscriptionSections;
exports.validateResourceSections = validateResourceSections;
exports.validateSourceBinding = validateSourceBinding;
exports.validateSourceBindingForTarget = validateSourceBindingForTarget;
const pluginPublicArtifacts_1 = require("./pluginPublicArtifacts");
const pluginPublicArtifactValidationHelpers_1 = require("./pluginPublicArtifactValidationHelpers");
function validateSubscriptionSections(value, target, outputGeneratedAt) {
    const sections = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'artifact.sections');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(sections, [
        'accountSummary',
        'resources',
        'aiCostSummary',
        'serviceRetirement',
        'recommendations',
        'commitmentAnalysis',
        'reliability',
        'accountGovernance',
    ], 'artifact.sections');
    validateSection(sections.accountSummary, 'account-summary', target, outputGeneratedAt);
    validateSection(sections.resources, 'resources', target, outputGeneratedAt);
    validateDeclaredOptionalSection(sections.aiCostSummary, 'ai-cost-summary', target.aiCostSummaryTargetKey, target, outputGeneratedAt);
    validateSection(sections.serviceRetirement, 'service-retirement', target, outputGeneratedAt);
    validateSection(sections.recommendations, 'recommendations', target, outputGeneratedAt);
    validateDeclaredOptionalSection(sections.commitmentAnalysis, 'commitment-analysis', target.commitmentAnalysisTargetKey, target, outputGeneratedAt);
    validateDeclaredOptionalSection(sections.reliability, 'reliability', target.reliabilityTargetKey, target, outputGeneratedAt);
    validateDeclaredOptionalSection(sections.accountGovernance, 'account-governance', target.accountGovernanceTargetKey, target, outputGeneratedAt);
}
function validateResourceSections(value, target, outputGeneratedAt) {
    const sections = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'artifact.sections');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(sections, ['resource', 'relationships', 'serviceRetirement', 'recommendations'], 'artifact.sections');
    const resource = validateSection(sections.resource, 'resource', target, outputGeneratedAt);
    if (resource.status !== 'available')
        throw new Error('artifact.sections.resource must be available.');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(resource.sourceGeneration.stableKey, target.stableKey, 'artifact.sections.resource.sourceGeneration.stableKey');
    const item = (0, pluginPublicArtifactValidationHelpers_1.asRecord)((0, pluginPublicArtifactValidationHelpers_1.asRecord)(resource.evidence, 'section.resource.evidence').item, 'section.resource.evidence.item');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(item.stableKey, target.stableKey, 'section.resource.evidence.item.stableKey');
    validateSection(sections.relationships, 'relationships', target, outputGeneratedAt);
    validateSection(sections.serviceRetirement, 'service-retirement', target, outputGeneratedAt);
    validateSection(sections.recommendations, 'recommendations', target, outputGeneratedAt);
}
function validateDeclaredOptionalSection(value, section, targetKey, target, outputGeneratedAt) {
    if (targetKey === undefined) {
        if (value !== undefined)
            throw new Error(`section.${section} is undeclared by its target.`);
        return;
    }
    if (value === undefined)
        throw new Error(`section.${section} is required by its declared target.`);
    validateSection(value, section, target, outputGeneratedAt);
}
function validateSection(value, section, target, outputGeneratedAt) {
    const field = `section.${section}`;
    const bodySection = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    if (bodySection.status === 'available') {
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(bodySection, ['status', 'section', 'targetKey', 'generatedAt', 'sourceGeneration', 'additionalSourceGenerations', 'evidence'], field);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(bodySection.section, section, `${field}.section`);
        const targetKey = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(bodySection.targetKey, `${field}.targetKey`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(targetKey, bodySectionTargetKey(section, target), `${field}.targetKey`);
        const generatedAt = (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(bodySection.generatedAt, `${field}.generatedAt`);
        const source = validateSourceBinding(bodySection.sourceGeneration, target.accountId, section, `${field}.sourceGeneration`);
        validateSourceBindingForTarget(source, target, `${field}.sourceGeneration`);
        if (section !== 'recommendations') {
            (0, pluginPublicArtifactValidationHelpers_1.assertValue)(source.targetKey, targetKey, `${field}.sourceGeneration.targetKey`);
            (0, pluginPublicArtifactValidationHelpers_1.assertValue)(source.generatedAt, generatedAt, `${field}.sourceGeneration.generatedAt`);
        }
        if (generatedAt > outputGeneratedAt)
            throw new Error(`${field}.generatedAt cannot exceed output generation time.`);
        validateAdditionalSources(bodySection.additionalSourceGenerations, target, section, source);
        const sources = [source, ...(bodySection.additionalSourceGenerations ?? [])];
        if (section === 'recommendations')
            validateCompleteRecommendationSources(sources, target, field);
        validateEvidence(bodySection.evidence, section, target, source, generatedAt);
    }
    else if (bodySection.status === 'not-found') {
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(bodySection, ['status', 'section', 'targetKey'], field);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(bodySection.section, section, `${field}.section`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)((0, pluginPublicArtifactValidationHelpers_1.requiredString)(bodySection.targetKey, `${field}.targetKey`), bodySectionTargetKey(section, target), `${field}.targetKey`);
    }
    else {
        throw new Error(`${field}.status is not declared.`);
    }
    return bodySection;
}
function bodySectionTargetKey(section, target) {
    if (section === 'recommendations')
        return target.recommendationsTargetKey;
    if (target.kind === 'resource-detail') {
        if (section === 'resource')
            return target.resourceCollectionTargetKey;
        if (section === 'relationships')
            return target.relationshipTargetKey;
        if (section === 'service-retirement')
            return target.serviceRetirementTargetKey;
    }
    else {
        const keys = {
            'account-summary': target.accountSummaryTargetKey,
            resources: target.resourceCollectionTargetKey,
            'ai-cost-summary': target.aiCostSummaryTargetKey,
            'service-retirement': target.serviceRetirementTargetKey,
            'commitment-analysis': target.commitmentAnalysisTargetKey,
            reliability: target.reliabilityTargetKey,
            'account-governance': target.accountGovernanceTargetKey,
        };
        const key = keys[section];
        if (key)
            return key;
    }
    throw new Error(`section.${section} has no declared target key.`);
}
function validateSourceBinding(value, accountId, section, field) {
    const source = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(source, [
        'provider',
        'accountId',
        'section',
        'sourceArtifactType',
        'generationId',
        'generatedAt',
        'targetKey',
        'artifactSha256',
        'billing',
        'resourceRegions',
        'selector',
        'stableKey',
        'metricTimeWindow',
        'tagRuleScope',
    ], field);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(source.provider, 'aws', `${field}.provider`);
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(source.accountId, accountId, `${field}.accountId`);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(source.section, section, `${field}.section`);
    (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(source.sourceArtifactType, pluginPublicArtifacts_1.AWS_PLUGIN_SOURCE_ARTIFACT_TYPES, `${field}.sourceArtifactType`);
    if (!sourceTypesForSection(section).includes(String(source.sourceArtifactType))) {
        throw new Error(`${field}.sourceArtifactType does not match section ${section}.`);
    }
    (0, pluginPublicArtifactValidationHelpers_1.requiredString)(source.generationId, `${field}.generationId`);
    (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(source.generatedAt, `${field}.generatedAt`);
    (0, pluginPublicArtifactValidationHelpers_1.requiredString)(source.targetKey, `${field}.targetKey`);
    (0, pluginPublicArtifactValidationHelpers_1.sha256)(source.artifactSha256, `${field}.artifactSha256`);
    (0, pluginPublicArtifactValidationHelpers_1.validateBilling)(source.billing, `${field}.billing`);
    (0, pluginPublicArtifactValidationHelpers_1.stringArray)(source.resourceRegions, `${field}.resourceRegions`);
    (0, pluginPublicArtifactValidationHelpers_1.validateMetricWindow)(source.metricTimeWindow, `${field}.metricTimeWindow`);
    if (source.selector !== undefined)
        (0, pluginPublicArtifactValidationHelpers_1.validateSelector)(source.selector, `${field}.selector`);
    if (source.stableKey !== undefined)
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(source.stableKey, `${field}.stableKey`);
    (0, pluginPublicArtifactValidationHelpers_1.validateTagRuleScope)(source.tagRuleScope);
    return value;
}
function validateSourceBindingForTarget(source, target, field) {
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(source.billing, target.billing, `${field}.billing`);
    const expectedRegions = target.kind === 'subscription-detail' && source.section === 'service-retirement'
        ? target.serviceRetirementRegions
        : target.kind === 'subscription-detail' && source.section === 'commitment-analysis'
            ? target.commitmentAnalysis?.resourceRegions
            : target.resourceRegions;
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(source.resourceRegions, expectedRegions, `${field}.resourceRegions`);
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(source.metricTimeWindow, target.metricTimeWindow, `${field}.metricTimeWindow`);
    const expectedTargetKeys = expectedSourceTargetKeys(source, target);
    if (!expectedTargetKeys.includes(source.targetKey)) {
        throw new Error(`${field}.targetKey does not match the exact declared section target.`);
    }
    if (target.kind === 'resource-detail') {
        (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(source.selector, target.selector, `${field}.selector`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(source.stableKey, target.stableKey, `${field}.stableKey`);
        (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(source.tagRuleScope, target.tagRuleScope, `${field}.tagRuleScope`);
    }
    else if (source.selector !== undefined || source.stableKey !== undefined || source.tagRuleScope !== undefined) {
        throw new Error(`${field} contains resource-only selector, stable-key, or tag-rule scope.`);
    }
}
function expectedSourceTargetKeys(source, target) {
    if (source.section === 'recommendations') {
        return target.recommendationScopes.map(scope => source.sourceArtifactType === 'recommendation-actionability' ? scope.actionabilityTargetKey : scope.targetKey);
    }
    if (target.kind === 'resource-detail') {
        if (source.section === 'resource')
            return [target.resourceCollectionTargetKey];
        if (source.section === 'relationships')
            return [target.relationshipTargetKey];
        if (source.section === 'service-retirement')
            return [target.serviceRetirementTargetKey];
    }
    else {
        const targetBySection = {
            'account-summary': target.accountSummaryTargetKey,
            resources: target.resourceCollectionTargetKey,
            'ai-cost-summary': target.aiCostSummaryTargetKey,
            'service-retirement': target.serviceRetirementTargetKey,
            'commitment-analysis': target.commitmentAnalysisTargetKey,
            reliability: target.reliabilityTargetKey,
            'account-governance': target.accountGovernanceTargetKey,
        };
        const targetKey = targetBySection[source.section];
        if (targetKey)
            return [targetKey];
    }
    throw new Error(`No exact target is declared for ${source.section}/${source.sourceArtifactType}.`);
}
function validateAdditionalSources(value, target, section, primary) {
    if (value === undefined)
        return;
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`section.${section}.additionalSourceGenerations must be a non-empty array when declared.`);
    }
    const identities = new Set([sourceIdentity(primary)]);
    value.forEach((source, index) => {
        const field = `section.${section}.additionalSourceGenerations[${index}]`;
        const binding = validateSourceBinding(source, target.accountId, section, field);
        validateSourceBindingForTarget(binding, target, field);
        const identity = sourceIdentity(binding);
        if (identities.has(identity))
            throw new Error(`section.${section} contains a duplicate source-generation binding.`);
        identities.add(identity);
    });
}
function sourceIdentity(source) {
    return [source.section, source.sourceArtifactType, source.generationId, source.targetKey, source.artifactSha256].join('|');
}
function validateCompleteRecommendationSources(sources, target, field) {
    const expected = target.recommendationScopes.flatMap(scope => [
        `recommendations|${scope.targetKey}`,
        `recommendation-actionability|${scope.actionabilityTargetKey}`,
    ]);
    const actual = sources.map(source => `${source.sourceArtifactType}|${source.targetKey}`);
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)([...actual].sort(), [...expected].sort(), `${field}.sourceGenerations complete recommendation source set`);
}
function sourceTypesForSection(section) {
    const sourceBySection = {
        'account-summary': ['account-summary'],
        resources: ['resource-collection'],
        resource: ['resource-collection'],
        'ai-cost-summary': ['ai-cost-summary'],
        relationships: ['relationships'],
        'service-retirement': ['lifecycle'],
        recommendations: ['recommendations', 'recommendation-actionability'],
        'commitment-analysis': ['commitment-analysis'],
        reliability: ['reliability'],
        'account-governance': ['account-governance'],
    };
    const source = sourceBySection[section];
    if (!source)
        throw new Error(`section ${section} is not declared.`);
    return source;
}
function validateEvidence(value, section, target, source, generatedAt) {
    const field = `section.${section}.evidence`;
    const evidence = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    const shape = EVIDENCE_SHAPES[section];
    if (!shape)
        throw new Error(`section ${section} has no declared evidence contract.`);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(evidence, shape.allowed, field);
    const required = section === 'service-retirement'
        ? 'summary' in evidence || 'entries' in evidence
            ? ['summary', 'entries']
            : ['stats', 'refreshMetadataBySource', 'refreshMetadataByFamily', 'highlights']
        : shape.required;
    (0, pluginPublicArtifactValidationHelpers_1.assertRequiredKeys)(evidence, required, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertPublicJson)(evidence, field);
    validateEvidenceStructure(evidence, section, target, source, generatedAt, field);
}
function validateEvidenceStructure(evidence, section, target, source, generatedAt, field) {
    if (section === 'account-summary') {
        const artifact = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.artifact, `${field}.artifact`);
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(artifact, ['artifactType', 'artifactVersion', 'generatedAt', 'scope', 'account', 'billing', 'discovery', 'metrics', 'recommendations'], `${field}.artifact`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.artifactType, 'account-summary', `${field}.artifact.artifactType`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.artifactVersion, 1, `${field}.artifact.artifactVersion`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)((0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(artifact.generatedAt, `${field}.artifact.generatedAt`), generatedAt, `${field}.artifact.generatedAt`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(source.generatedAt, generatedAt, `${field}.sourceGeneration.generatedAt`);
        validatePortalScope(artifact.scope, target, `${field}.artifact.scope`);
    }
    else if (section === 'resources') {
        validateResourceSummary(evidence.summary, `${field}.summary`);
        (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.coverage, `${field}.coverage`);
        validateResourceItems(evidence.highlights, `${field}.highlights`);
    }
    else if (section === 'resource') {
        validateResourceItems([evidence.item], `${field}.item`);
    }
    else if (section === 'ai-cost-summary') {
        (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(evidence.audience, ['portal', 'plugin'], `${field}.audience`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(evidence.audience, target.kind === 'subscription-detail' ? target.aiCostSummaryAudience : undefined, `${field}.audience`);
        (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(evidence.sourceAccountSummaryGeneratedAt, `${field}.sourceAccountSummaryGeneratedAt`);
        (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.artifact, `${field}.artifact`);
    }
    else if (section === 'recommendations') {
        validateRecommendationEvidence(evidence, target, field);
    }
    else if (section === 'relationships') {
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(evidence.anchorNodeId, `${field}.anchorNodeId`);
        const stats = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.stats, `${field}.stats`);
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(stats, ['directNodeCount', 'directEdgeCount', 'unresolvedCount'], `${field}.stats`);
        ['directNodeCount', 'directEdgeCount', 'unresolvedCount'].forEach(key => nonNegativeInteger(stats[key], `${field}.stats.${key}`));
        ['nodes', 'edges', 'unresolved'].forEach(key => jsonArray(evidence[key], `${field}.${key}`));
    }
    else if (section === 'service-retirement') {
        if ('summary' in evidence) {
            const summary = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.summary, `${field}.summary`);
            (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(summary, ['matchedEntryCount', 'totalArtifactEntryCount'], `${field}.summary`);
            nonNegativeInteger(summary.matchedEntryCount, `${field}.summary.matchedEntryCount`);
            nonNegativeInteger(summary.totalArtifactEntryCount, `${field}.summary.totalArtifactEntryCount`);
            jsonArray(evidence.entries, `${field}.entries`);
        }
        else {
            const stats = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.stats, `${field}.stats`);
            (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(stats, ['entryCount', 'matchedResourceCount', 'unmatchedSourceEntryCount', 'truncated'], `${field}.stats`);
            ['entryCount', 'matchedResourceCount', 'unmatchedSourceEntryCount'].forEach(key => nonNegativeInteger(stats[key], `${field}.stats.${key}`));
            (0, pluginPublicArtifactValidationHelpers_1.assertValue)(stats.truncated, false, `${field}.stats.truncated`);
            jsonArray(evidence.highlights, `${field}.highlights`);
        }
    }
    else if (section === 'reliability') {
        (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.request, `${field}.request`);
        (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.summary, `${field}.summary`);
        jsonArray(evidence.sections, `${field}.sections`);
    }
    else if (section === 'account-governance') {
        (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.workflow, `${field}.workflow`);
        const checklist = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.checklist, `${field}.checklist`);
        (0, pluginPublicArtifactValidationHelpers_1.assertRequiredKeys)(checklist, ['present', 'targetKey'], `${field}.checklist`);
        if (typeof checklist.present !== 'boolean')
            throw new Error(`${field}.checklist.present must be boolean.`);
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(checklist.targetKey, `${field}.checklist.targetKey`);
    }
    else {
        for (const [key, child] of Object.entries(evidence)) {
            if (key !== 'evidenceSource' && !Array.isArray(child))
                (0, pluginPublicArtifactValidationHelpers_1.asRecord)(child, `${field}.${key}`);
        }
    }
}
function validatePortalScope(value, target, field) {
    const scope = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(scope, ['provider', 'accountId', 'billing', 'resourceRegions', 'metricTimeWindow'], field);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(scope.provider, 'aws', `${field}.provider`);
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(scope.accountId, target.accountId, `${field}.accountId`);
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(scope.billing, target.billing, `${field}.billing`);
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(scope.resourceRegions, target.resourceRegions, `${field}.resourceRegions`);
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(scope.metricTimeWindow, target.metricTimeWindow, `${field}.metricTimeWindow`);
}
function validateResourceSummary(value, field) {
    const summary = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    const keys = [
        'totalDiscoveredResourceCount',
        'returnedResourceCount',
        'emptyCollection',
        'truncated',
        'unmatchedRecommendationResourceCount',
        'unmatchedBillingExpenseCount',
    ];
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(summary, keys, field);
    keys.filter(key => !['emptyCollection', 'truncated'].includes(key)).forEach(key => nonNegativeInteger(summary[key], `${field}.${key}`));
    if (typeof summary.emptyCollection !== 'boolean' || typeof summary.truncated !== 'boolean')
        throw new Error(`${field} flags must be boolean.`);
}
function validateResourceItems(value, field) {
    jsonArray(value, field).forEach((item, index) => {
        const itemField = `${field}[${index}]`;
        const resource = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(item, itemField);
        (0, pluginPublicArtifactValidationHelpers_1.assertRequiredKeys)(resource, ['stableKey', 'family', 'resourceRegion', 'resourceType', 'discovery'], itemField);
        ['stableKey', 'family', 'resourceRegion', 'resourceType'].forEach(key => (0, pluginPublicArtifactValidationHelpers_1.requiredString)(resource[key], `${itemField}.${key}`));
        (0, pluginPublicArtifactValidationHelpers_1.asRecord)(resource.discovery, `${itemField}.discovery`);
    });
}
function validateRecommendationEvidence(evidence, target, field) {
    const summary = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(evidence.summary, `${field}.summary`);
    ['requestedScopeCount', 'availableScopeCount', 'notFoundScopeCount'].forEach(key => nonNegativeInteger(summary[key], `${field}.summary.${key}`));
    const allowedSummary = ['requestedScopeCount', 'availableScopeCount', 'notFoundScopeCount', 'unsupportedScopeCount'];
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(summary, allowedSummary, `${field}.summary`);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(summary.requestedScopeCount, target.recommendationScopes.length, `${field}.summary.requestedScopeCount`);
    const sections = jsonArray(evidence.sections, `${field}.sections`);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(sections.length, target.recommendationScopes.length, `${field}.sections.length`);
    const matchedTargets = new Set();
    const statusCounts = { available: 0, 'not-found': 0, 'unsupported-resource-identity': 0 };
    sections.forEach((value, index) => {
        const section = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, `${field}.sections[${index}]`);
        const status = (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(section.status, ['available', 'not-found', 'unsupported-resource-identity'], `${field}.sections[${index}].status`);
        const source = (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(section.source, ['custom', 'compute-optimizer', 'cost-optimization-hub', 'resilience-hub', 'security-hub', 'trusted-advisor', 'well-architected'], `${field}.sections[${index}].source`);
        statusCounts[status] += 1;
        const targetKey = status === 'unsupported-resource-identity'
            ? target.recommendationScopes.find(scope => scope.source === source && !matchedTargets.has(scope.targetKey))?.targetKey
            : (0, pluginPublicArtifactValidationHelpers_1.requiredString)(section.targetKey, `${field}.sections[${index}].targetKey`);
        const scope = target.recommendationScopes.find(candidate => candidate.targetKey === targetKey && candidate.source === source);
        if (!scope || matchedTargets.has(scope.targetKey))
            throw new Error(`${field}.sections[${index}] does not match one exact declared recommendation scope.`);
        matchedTargets.add(scope.targetKey);
        if (status === 'available') {
            (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(section, target.kind === 'subscription-detail'
                ? [
                    'status',
                    'source',
                    'targetKey',
                    'generatedAt',
                    'scope',
                    'filters',
                    'summary',
                    'counts',
                    'savings',
                    'evidenceFreshness',
                    'templateProvenance',
                    'actionability',
                    'highlights',
                ]
                : ['status', 'source', 'targetKey', 'generatedAt', 'evidenceFreshness', 'templateProvenance', 'actionability', 'artifact'], `${field}.sections[${index}]`);
            (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(section.generatedAt, `${field}.sections[${index}].generatedAt`);
            if (target.kind === 'subscription-detail') {
                (0, pluginPublicArtifactValidationHelpers_1.assertRequiredKeys)(section, ['scope', 'filters', 'summary', 'counts', 'savings', 'highlights'], `${field}.sections[${index}]`);
                validateRecommendationScope(section.scope, scope, `${field}.sections[${index}].scope`);
                jsonArray(section.highlights, `${field}.sections[${index}].highlights`);
            }
            else {
                (0, pluginPublicArtifactValidationHelpers_1.assertRequiredKeys)(section, ['artifact'], `${field}.sections[${index}]`);
                (0, pluginPublicArtifactValidationHelpers_1.asRecord)(section.artifact, `${field}.sections[${index}].artifact`);
            }
        }
        else if (status === 'not-found') {
            (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(section, ['status', 'source', 'targetKey'], `${field}.sections[${index}]`);
        }
        else {
            (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(section, ['status', 'source'], `${field}.sections[${index}]`);
        }
    });
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(summary.availableScopeCount, statusCounts.available, `${field}.summary.availableScopeCount`);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(summary.notFoundScopeCount, statusCounts['not-found'], `${field}.summary.notFoundScopeCount`);
    if (summary.unsupportedScopeCount !== undefined) {
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(summary.unsupportedScopeCount, statusCounts['unsupported-resource-identity'], `${field}.summary.unsupportedScopeCount`);
    }
    else if (statusCounts['unsupported-resource-identity'] > 0) {
        throw new Error(`${field}.summary.unsupportedScopeCount is required.`);
    }
}
function validateRecommendationScope(value, expected, field) {
    const scope = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(scope, ['source', 'scope', 'accountId', 'scopeDiscriminator', 'computeOptimizerFamily', 'resourceRegions'], field);
    for (const key of ['source', 'scope', 'accountId', 'scopeDiscriminator', 'computeOptimizerFamily', 'resourceRegions']) {
        (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)(scope[key], expected[key], `${field}.${key}`);
    }
}
function jsonArray(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    return value;
}
function nonNegativeInteger(value, field) {
    if (!Number.isSafeInteger(value) || Number(value) < 0)
        throw new Error(`${field} must be a non-negative safe integer.`);
}
const EVIDENCE_SHAPES = {
    'account-summary': { allowed: ['artifact'], required: ['artifact'] },
    resources: { allowed: ['summary', 'coverage', 'highlights'], required: ['summary', 'coverage', 'highlights'] },
    'ai-cost-summary': {
        allowed: ['audience', 'sourceAccountSummaryGeneratedAt', 'artifact'],
        required: ['audience', 'sourceAccountSummaryGeneratedAt', 'artifact'],
    },
    'service-retirement': {
        allowed: ['stats', 'refreshMetadataBySource', 'refreshMetadataByFamily', 'highlights', 'summary', 'entries'],
        required: [],
    },
    recommendations: { allowed: ['summary', 'sections'], required: ['summary', 'sections'] },
    'commitment-analysis': { allowed: ['request', 'billing', 'benefitExpiry', 'evidenceSource'], required: ['billing', 'benefitExpiry'] },
    reliability: { allowed: ['request', 'summary', 'sections'], required: ['request', 'summary', 'sections'] },
    'account-governance': { allowed: ['workflow', 'checklist', 'complianceResults'], required: ['workflow', 'checklist'] },
    resource: { allowed: ['item'], required: ['item'] },
    relationships: {
        allowed: ['anchorNodeId', 'stats', 'nodes', 'edges', 'unresolved'],
        required: ['anchorNodeId', 'stats', 'nodes', 'edges', 'unresolved'],
    },
};
//# sourceMappingURL=pluginPublicArtifactSectionValidation.js.map