"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsPluginGenerationManifest = validateAwsPluginGenerationManifest;
const pluginPublicArtifacts_1 = require("./pluginPublicArtifacts");
const pluginPublicArtifactBodyValidation_1 = require("./pluginPublicArtifactBodyValidation");
const pluginPublicArtifactSectionValidation_1 = require("./pluginPublicArtifactSectionValidation");
const pluginPublicArtifactValidationHelpers_1 = require("./pluginPublicArtifactValidationHelpers");
/** Validates complete active-set identity and targeted carry-forward semantics. */
function validateAwsPluginGenerationManifest(value) {
    const manifest = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'manifest');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(manifest, [
        'schemaVersion',
        'status',
        'provider',
        'accountId',
        'artifactGeneration',
        'requestBinding',
        'operation',
        'previousGeneration',
        'members',
        'counts',
        'completedAt',
    ], 'manifest');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(manifest.schemaVersion, pluginPublicArtifacts_1.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'manifest.schemaVersion');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(manifest.status, 'completed', 'manifest.status');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(manifest.provider, 'aws', 'manifest.provider');
    const accountId = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(manifest.accountId, 'manifest.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(accountId, accountId, 'manifest.accountId');
    const generation = validateGeneration(manifest.artifactGeneration);
    const request = validateRequestBinding(manifest.requestBinding);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(request.requestedAt, generation.generatedAt, 'manifest.requestBinding.requestedAt');
    const completedAt = (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(manifest.completedAt, 'manifest.completedAt');
    if (completedAt < generation.generatedAt)
        throw new Error('manifest.completedAt cannot precede the output generation time.');
    const operation = validateOperation(manifest.operation, accountId);
    const previous = validatePreviousGeneration(manifest.previousGeneration, accountId);
    const members = (0, pluginPublicArtifactValidationHelpers_1.requiredArray)(manifest.members, 'manifest.members').map((member, index) => validateMember(member, accountId, generation.generatedAt, `manifest.members[${index}]`));
    assertUniqueLogicalNames(members);
    validateCounts(manifest.counts, members);
    validateTransition(operation, previous, members);
    return value;
}
function validateGeneration(value) {
    const generation = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'manifest.artifactGeneration');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(generation, ['runId', 'generatedAt'], 'manifest.artifactGeneration');
    return {
        runId: (0, pluginPublicArtifactValidationHelpers_1.requiredString)(generation.runId, 'manifest.artifactGeneration.runId'),
        generatedAt: (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(generation.generatedAt, 'manifest.artifactGeneration.generatedAt'),
    };
}
function validateRequestBinding(value) {
    const request = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'manifest.requestBinding');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(request, ['requestId', 'requestedAt'], 'manifest.requestBinding');
    return {
        requestId: (0, pluginPublicArtifactValidationHelpers_1.requiredString)(request.requestId, 'manifest.requestBinding.requestId'),
        requestedAt: (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(request.requestedAt, 'manifest.requestBinding.requestedAt'),
    };
}
function validateOperation(value, accountId) {
    const operation = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'manifest.operation');
    if (operation.kind === 'full') {
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(operation, ['kind'], 'manifest.operation');
        return operation;
    }
    const kind = (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(operation.kind, ['targeted-replacement', 'targeted-retirement'], 'manifest.operation.kind');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(operation, ['kind', 'target'], 'manifest.operation');
    const targetRecord = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(operation.target, 'manifest.operation.target');
    const target = targetRecord.kind === 'subscription-detail'
        ? (0, pluginPublicArtifactBodyValidation_1.validateTarget)(operation.target, 'subscription-detail')
        : (0, pluginPublicArtifactBodyValidation_1.validateTarget)(operation.target, 'resource-detail');
    if (targetRecord.kind !== 'subscription-detail' && targetRecord.kind !== 'resource-detail')
        throw new Error('manifest.operation.target.kind is not declared.');
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(target.accountId, accountId, 'manifest.operation.target.accountId');
    return { kind, target };
}
function validateMember(value, accountId, outputGeneratedAt, field) {
    const member = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    const common = ['state', 'publication', 'provider', 'accountId', 'logicalName', 'artifactType', 'target'];
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(member.provider, 'aws', `${field}.provider`);
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(member.accountId, accountId, `${field}.accountId`);
    const artifactType = (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(member.artifactType, ['plugin-subscription', 'plugin-resource'], `${field}.artifactType`);
    const target = artifactType === 'plugin-subscription' ? (0, pluginPublicArtifactBodyValidation_1.validateTarget)(member.target, 'subscription-detail') : (0, pluginPublicArtifactBodyValidation_1.validateTarget)(member.target, 'resource-detail');
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(target.accountId, accountId, `${field}.target.accountId`);
    const logicalName = validateLogicalName(member.logicalName, target, `${field}.logicalName`);
    if (member.state === 'active') {
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(member, [...common, 'artifact', 'sourceGenerations'], field);
        (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(member.publication, ['replaced', 'carried-forward'], `${field}.publication`);
        (0, pluginPublicArtifactValidationHelpers_1.validateDescriptor)(member.artifact, `${field}.artifact`);
        const descriptor = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(member.artifact, `${field}.artifact`);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(descriptor.name, logicalName, `${field}.artifact.name`);
        const sourceIdentities = new Set();
        const sourceBindings = [];
        (0, pluginPublicArtifactValidationHelpers_1.requiredArray)(member.sourceGenerations, `${field}.sourceGenerations`).forEach((source, index) => {
            const sourceRecord = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(source, `${field}.sourceGenerations[${index}]`);
            const binding = (0, pluginPublicArtifactBodyValidation_1.validateSourceBinding)(source, accountId, (0, pluginPublicArtifactValidationHelpers_1.requiredString)(sourceRecord.section, `${field}.sourceGenerations[${index}].section`), `${field}.sourceGenerations[${index}]`);
            if (binding.generatedAt > outputGeneratedAt)
                throw new Error(`${field}.sourceGenerations[${index}].generatedAt cannot exceed output time.`);
            (0, pluginPublicArtifactSectionValidation_1.validateSourceBindingForTarget)(binding, target, `${field}.sourceGenerations[${index}]`);
            const identity = [binding.section, binding.sourceArtifactType, binding.generationId, binding.targetKey, binding.artifactSha256].join('|');
            if (sourceIdentities.has(identity))
                throw new Error(`${field}.sourceGenerations contains duplicate source bindings.`);
            sourceIdentities.add(identity);
            sourceBindings.push(binding);
        });
        validateCompleteSourceSet(sourceBindings, target, field);
    }
    else if (member.state === 'retired') {
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(member, [...common, 'priorArtifactSha256', 'retiredAt'], field);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(member.publication, 'retired', `${field}.publication`);
        (0, pluginPublicArtifactValidationHelpers_1.sha256)(member.priorArtifactSha256, `${field}.priorArtifactSha256`);
        (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(member.retiredAt, `${field}.retiredAt`);
    }
    else {
        throw new Error(`${field}.state is not declared.`);
    }
    return value;
}
function validateCompleteSourceSet(sources, target, field) {
    const expected = [];
    const add = (section, sourceType, targetKey) => {
        if (targetKey)
            expected.push(`${section}|${sourceType}|${targetKey}`);
    };
    if (target.kind === 'subscription-detail') {
        add('account-summary', 'account-summary', target.accountSummaryTargetKey);
        add('resources', 'resource-collection', target.resourceCollectionTargetKey);
        add('service-retirement', 'lifecycle', target.serviceRetirementTargetKey);
        add('ai-cost-summary', 'ai-cost-summary', target.aiCostSummaryTargetKey);
        add('commitment-analysis', 'commitment-analysis', target.commitmentAnalysisTargetKey);
        add('reliability', 'reliability', target.reliabilityTargetKey);
        add('account-governance', 'account-governance', target.accountGovernanceTargetKey);
    }
    else {
        add('resource', 'resource-collection', target.resourceCollectionTargetKey);
        add('relationships', 'relationships', target.relationshipTargetKey);
        add('service-retirement', 'lifecycle', target.serviceRetirementTargetKey);
    }
    target.recommendationScopes.forEach(scope => {
        add('recommendations', 'recommendations', scope.targetKey);
        add('recommendations', 'recommendation-actionability', scope.actionabilityTargetKey);
    });
    const actual = sources.map(source => `${source.section}|${source.sourceArtifactType}|${source.targetKey}`);
    (0, pluginPublicArtifactValidationHelpers_1.assertJsonEqual)([...actual].sort(), [...expected].sort(), `${field}.sourceGenerations complete source set`);
}
function validatePreviousGeneration(value, accountId) {
    if (value === undefined)
        return new Map();
    const previous = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'manifest.previousGeneration');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(previous, ['provider', 'accountId', 'runId', 'manifestSha256', 'members'], 'manifest.previousGeneration');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(previous.provider, 'aws', 'manifest.previousGeneration.provider');
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(previous.accountId, accountId, 'manifest.previousGeneration.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.requiredString)(previous.runId, 'manifest.previousGeneration.runId');
    (0, pluginPublicArtifactValidationHelpers_1.sha256)(previous.manifestSha256, 'manifest.previousGeneration.manifestSha256');
    const result = new Map();
    (0, pluginPublicArtifactValidationHelpers_1.requiredArray)(previous.members, 'manifest.previousGeneration.members').forEach((value, index) => {
        const field = `manifest.previousGeneration.members[${index}]`;
        const member = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(member, ['provider', 'accountId', 'logicalName', 'artifactType', 'targetKeySha256', 'stableKeySha256', 'artifactSha256'], field);
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(member.provider, 'aws', `${field}.provider`);
        (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(member.accountId, accountId, `${field}.accountId`);
        const name = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(member.logicalName, `${field}.logicalName`);
        if (result.has(name))
            throw new Error('manifest.previousGeneration.members has duplicate logicalName values.');
        (0, pluginPublicArtifactValidationHelpers_1.requiredEnum)(member.artifactType, ['plugin-subscription', 'plugin-resource'], `${field}.artifactType`);
        (0, pluginPublicArtifactValidationHelpers_1.sha256)(member.targetKeySha256, `${field}.targetKeySha256`);
        if (member.stableKeySha256 !== undefined)
            (0, pluginPublicArtifactValidationHelpers_1.sha256)(member.stableKeySha256, `${field}.stableKeySha256`);
        (0, pluginPublicArtifactValidationHelpers_1.sha256)(member.artifactSha256, `${field}.artifactSha256`);
        result.set(name, member);
    });
    return result;
}
function validateTransition(operation, previous, members) {
    if (operation.kind === 'full')
        return;
    if (previous.size === 0)
        throw new Error('Targeted publication requires previousGeneration.members.');
    const target = operation.target;
    const targetName = logicalNameForTarget(target);
    const current = new Map(members.map(member => [member.logicalName, member]));
    for (const [name, prior] of previous) {
        const member = current.get(name);
        if (!member)
            throw new Error(`Targeted publication omitted prior member ${name}.`);
        if (name === targetName) {
            assertTargetPublication(operation.kind, member);
            assertPriorIdentity(member, prior, name);
            continue;
        }
        if (member.state !== 'active' || member.publication !== 'carried-forward')
            throw new Error(`Untargeted member ${name} must be carried forward.`);
        assertPriorIdentity(member, prior, name);
    }
    const targetMember = current.get(targetName);
    if (!targetMember)
        throw new Error('Targeted publication omitted its target member.');
    if (!previous.has(targetName)) {
        if (operation.kind === 'targeted-retirement')
            throw new Error('Cannot retire a target absent from the previous active set.');
        assertTargetPublication(operation.kind, targetMember);
    }
    for (const member of members) {
        if (!previous.has(member.logicalName) && member.logicalName !== targetName)
            throw new Error(`Targeted publication contains undeclared member ${member.logicalName}.`);
    }
}
function assertPriorIdentity(member, prior, name) {
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(member.artifactType, prior.artifactType, `${name}.artifactType`);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(member.target.targetKeySha256, prior.targetKeySha256, `${name}.target.targetKeySha256`);
    if (member.target.kind === 'resource-detail') {
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(member.target.stableKeySha256, prior.stableKeySha256, `${name}.target.stableKeySha256`);
    }
    else if (prior.stableKeySha256 !== undefined) {
        throw new Error(`${name}.stableKeySha256 is ambiguous for a subscription artifact.`);
    }
    if (member.state === 'active') {
        if (member.publication === 'carried-forward') {
            (0, pluginPublicArtifactValidationHelpers_1.assertValue)(member.artifact.sha256, prior.artifactSha256, `${name}.artifact.sha256`);
        }
    }
    else {
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(member.priorArtifactSha256, prior.artifactSha256, `${name}.priorArtifactSha256`);
    }
}
function assertTargetPublication(kind, member) {
    const expected = kind === 'targeted-retirement' ? 'retired' : 'replaced';
    if (member.publication !== expected)
        throw new Error(`Target member publication must be ${expected}.`);
}
function validateCounts(value, members) {
    const counts = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, 'manifest.counts');
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(counts, ['active', 'replaced', 'carriedForward', 'retired'], 'manifest.counts');
    const expected = {
        active: members.filter(member => member.state === 'active').length,
        replaced: members.filter(member => member.publication === 'replaced').length,
        carriedForward: members.filter(member => member.publication === 'carried-forward').length,
        retired: members.filter(member => member.state === 'retired').length,
    };
    for (const [key, count] of Object.entries(expected))
        (0, pluginPublicArtifactValidationHelpers_1.assertValue)(counts[key], count, `manifest.counts.${key}`);
}
function validateLogicalName(value, target, field) {
    const expected = logicalNameForTarget(target);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(value, expected, field);
    if (/[\\/]/.test(expected) || expected.includes('..'))
        throw new Error(`${field} must be path-free.`);
    return expected;
}
function logicalNameForTarget(target) {
    return target.kind === 'subscription-detail'
        ? (0, pluginPublicArtifacts_1.buildAwsPluginSubscriptionLogicalName)(target.targetKeySha256)
        : (0, pluginPublicArtifacts_1.buildAwsPluginResourceLogicalName)(target.stableKeySha256, target.targetKeySha256);
}
function assertUniqueLogicalNames(members) {
    const names = members.map(member => member.logicalName);
    if (new Set(names).size !== names.length)
        throw new Error('manifest.members contains duplicate logicalName values.');
}
//# sourceMappingURL=pluginPublicArtifactManifestValidation.js.map