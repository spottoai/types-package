"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsPortalRelationshipArtifact = validateAwsPortalRelationshipArtifact;
const portalRelationshipPublicArtifacts_1 = require("./portalRelationshipPublicArtifacts");
const portalRelationshipResourceNodeValidation_1 = require("./portalRelationshipResourceNodeValidation");
const portalPublicArtifactEvidenceValidation_1 = require("./portalPublicArtifactEvidenceValidation");
const portalPublicArtifactValidationCommon_1 = require("./portalPublicArtifactValidationCommon");
const pluginPublicArtifactValidationHelpers_1 = require("./pluginPublicArtifactValidationHelpers");
const CURRENT_KEYS = [
    'schemaVersion',
    'portalSchemaVersion',
    'relationshipSchemaVersion',
    'provider',
    'accountId',
    'artifactType',
    'artifactGeneration',
    'generatedAt',
    'logicalName',
    'source',
    'scope',
    'currency',
    'currencySymbol',
    'nodes',
    'edges',
    'unresolved',
    'coverage',
    'costOverlay',
    'stats',
];
/** Validates one untrusted, lossless AWS relationship Portal artifact. */
function validateAwsPortalRelationshipArtifact(value) {
    const artifact = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact');
    const { accountId, portalGeneratedAt, bodyGeneratedAt } = (0, portalPublicArtifactValidationCommon_1.validatePortalEnvelope)(artifact, 'relationships', CURRENT_KEYS);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.relationshipSchemaVersion, portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION, 'artifact.relationshipSchemaVersion');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(artifact.logicalName, portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME, 'artifact.logicalName');
    validateSource(artifact.source, bodyGeneratedAt, portalGeneratedAt);
    const regions = validateScope(artifact.scope, accountId);
    const regionSet = new Set(regions);
    if (artifact.currency !== undefined)
        (0, portalPublicArtifactValidationCommon_1.requiredString)(artifact.currency, 'artifact.currency');
    if (artifact.currencySymbol !== undefined)
        (0, portalPublicArtifactValidationCommon_1.requiredString)(artifact.currencySymbol, 'artifact.currencySymbol');
    const nodes = validateNodes(artifact.nodes, accountId, regions, regionSet);
    validateEdges(artifact.edges, nodes);
    validateUnresolved(artifact.unresolved, nodes);
    validateCoverage(artifact.coverage, regions, portalGeneratedAt);
    const matchedBillingNodeCount = artifact.costOverlay === undefined
        ? undefined
        : validateCostOverlay(artifact.costOverlay, accountId, regions, portalGeneratedAt, nodes.resourceCount);
    if (nodes.billingNodeCount > 0 && matchedBillingNodeCount === undefined)
        throw new Error('artifact.costOverlay is required when resource nodes contain billing.');
    if (matchedBillingNodeCount !== undefined && matchedBillingNodeCount !== nodes.billingNodeCount)
        throw new Error('artifact.costOverlay matched count must equal resource nodes containing billing.');
    validateStats(artifact.stats, asArray(artifact.nodes, 'artifact.nodes').length, asArray(artifact.edges, 'artifact.edges').length, asArray(artifact.unresolved, 'artifact.unresolved').length);
    (0, portalPublicArtifactValidationCommon_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
function validateSource(value, bodyGeneratedAt, portalGeneratedAt) {
    const source = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.source');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(source, ['artifactType', 'artifactVersion', 'generatedAt'], 'artifact.source');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(source.artifactType, 'relationship-graph', 'artifact.source.artifactType');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(source.artifactVersion, 1, 'artifact.source.artifactVersion');
    const generatedAt = (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(source.generatedAt, 'artifact.source.generatedAt');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(generatedAt, bodyGeneratedAt, 'artifact.source.generatedAt');
    if (Date.parse(generatedAt) > Date.parse(portalGeneratedAt))
        throw new Error('artifact.source generation cannot exceed Portal output.');
}
function validateScope(value, accountId) {
    const scope = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.scope');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(scope, ['provider', 'accountId', 'resourceRegions'], 'artifact.scope');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.provider, 'aws', 'artifact.scope.provider');
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(scope.accountId, accountId, 'artifact.scope.accountId');
    return (0, portalPublicArtifactValidationCommon_1.regionArray)(scope.resourceRegions, 'artifact.scope.resourceRegions');
}
function validateNodes(value, accountId, regions, regionSet) {
    const nodes = asArray(value, 'artifact.nodes');
    const byId = new Map();
    const regionNodes = [];
    let accountNodeCount = 0;
    let resourceCount = 0;
    let billingNodeCount = 0;
    nodes.forEach((entry, index) => {
        const field = `artifact.nodes[${index}]`;
        const node = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(node, ['id', 'kind', 'data'], field);
        const id = (0, portalPublicArtifactValidationCommon_1.requiredString)(node.id, `${field}.id`);
        if (byId.has(id))
            throw new Error('artifact node ids must be unique.');
        const kind = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(node.kind, ['account', 'region', 'resource', 'synthetic'], `${field}.kind`);
        const data = (0, portalPublicArtifactValidationCommon_1.asRecord)(node.data, `${field}.data`);
        validateNodeBinding(data, accountId, `${field}.data`);
        if (kind === 'account') {
            accountNodeCount += 1;
            (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(data, ['provider', 'accountId', 'displayName'], `${field}.data`);
            if (data.displayName !== undefined)
                (0, portalPublicArtifactValidationCommon_1.requiredString)(data.displayName, `${field}.data.displayName`);
        }
        else if (kind === 'region') {
            (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(data, ['provider', 'accountId', 'resourceRegion', 'displayName'], `${field}.data`);
            const region = validateNodeRegion(data, regionSet, `${field}.data`);
            regionNodes.push(region);
            if (data.displayName !== undefined)
                (0, portalPublicArtifactValidationCommon_1.requiredString)(data.displayName, `${field}.data.displayName`);
        }
        else if (kind === 'synthetic') {
            (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(data, ['provider', 'accountId', 'resourceRegion', 'syntheticType', 'identifier', 'displayName'], `${field}.data`);
            const resourceRegion = validateNodeRegion(data, regionSet, `${field}.data`);
            (0, portalPublicArtifactValidationCommon_1.requiredEnum)(data.syntheticType, portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_SYNTHETIC_TYPES, `${field}.data.syntheticType`);
            (0, portalPublicArtifactValidationCommon_1.requiredString)(data.identifier, `${field}.data.identifier`);
            if (data.displayName !== undefined)
                (0, portalPublicArtifactValidationCommon_1.requiredString)(data.displayName, `${field}.data.displayName`);
            byId.set(id, { kind, resourceRegion });
            return;
        }
        else {
            (0, portalRelationshipResourceNodeValidation_1.validateAwsPortalRelationshipResourceNode)(data, accountId, regionSet, `${field}.data`);
            resourceCount += 1;
            if (data.billing !== undefined)
                billingNodeCount += 1;
            byId.set(id, { kind, resourceRegion: String(data.resourceRegion) });
            return;
        }
        byId.set(id, kind === 'region' ? { kind, resourceRegion: String(data.resourceRegion) } : { kind });
    });
    if (accountNodeCount !== 1)
        throw new Error('artifact must contain exactly one account node.');
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(regionNodes, 'artifact Region nodes');
    assertExactRegionSet(regionNodes, regions, 'artifact Region nodes');
    return { byId, resourceCount, billingNodeCount };
}
function validateNodeBinding(data, accountId, field) {
    (0, portalPublicArtifactValidationCommon_1.assertValue)(data.provider, 'aws', `${field}.provider`);
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(data.accountId, accountId, `${field}.accountId`);
}
function validateNodeRegion(data, regions, field) {
    const region = (0, portalPublicArtifactValidationCommon_1.requiredString)(data.resourceRegion, `${field}.resourceRegion`);
    if (!regions.has(region))
        throw new Error(`${field}.resourceRegion is outside artifact scope.`);
    return region;
}
const STRUCTURAL_RELATIONSHIPS = {
    'account-region': ['region', 'account'],
    'region-resource': ['resource', 'region'],
    'region-topology': ['synthetic', 'region'],
};
function validateEdges(value, nodes) {
    const edges = asArray(value, 'artifact.edges');
    const ids = new Set();
    const structuralParents = new Map();
    edges.forEach((entry, index) => {
        const field = `artifact.edges[${index}]`;
        const edge = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(edge, ['id', 'from', 'to', 'kind', 'relationshipTypes', 'confidence', 'evidence'], field);
        const id = (0, portalPublicArtifactValidationCommon_1.requiredString)(edge.id, `${field}.id`);
        if (ids.has(id))
            throw new Error('artifact edge ids must be unique.');
        ids.add(id);
        const from = (0, portalPublicArtifactValidationCommon_1.requiredString)(edge.from, `${field}.from`);
        const to = (0, portalPublicArtifactValidationCommon_1.requiredString)(edge.to, `${field}.to`);
        const fromNode = nodes.byId.get(from);
        const toNode = nodes.byId.get(to);
        if (!fromNode || !toNode)
            throw new Error(`${field} references a missing node.`);
        if (from === to)
            throw new Error(`${field} must not be a self edge.`);
        const kind = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(edge.kind, ['contains', 'depends_on'], `${field}.kind`);
        const relationshipTypes = nonEmptyStringEnumArray(edge.relationshipTypes, portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_TYPES, `${field}.relationshipTypes`);
        (0, portalPublicArtifactValidationCommon_1.assertValue)(edge.confidence, 'high', `${field}.confidence`);
        validateEdgeEvidence(edge.evidence, `${field}.evidence`);
        const structuralTypes = relationshipTypes.filter(isStructuralRelationship);
        if (structuralTypes.length > 0) {
            if (kind !== 'contains' || structuralTypes.length !== relationshipTypes.length)
                throw new Error(`${field} structural relationship types require a contains edge.`);
            structuralTypes.forEach(type => validateContainmentDirection(type, fromNode.kind, toNode.kind, field));
            structuralParents.set(from, (structuralParents.get(from) ?? 0) + 1);
        }
        else {
            if (kind !== 'depends_on')
                throw new Error(`${field} dependency relationship types require a depends_on edge.`);
            if (fromNode.kind !== 'resource' || (toNode.kind !== 'resource' && toNode.kind !== 'synthetic'))
                throw new Error(`${field} dependency edges must connect a resource to a resource or synthetic node.`);
            if (fromNode.resourceRegion !== toNode.resourceRegion)
                throw new Error(`${field} dependency edge crosses resource Regions.`);
        }
    });
    nodes.byId.forEach((node, id) => {
        const expected = node.kind === 'account' ? 0 : 1;
        if ((structuralParents.get(id) ?? 0) !== expected)
            throw new Error(`artifact node ${id} must have exactly ${expected} structural parent edge${expected === 1 ? '' : 's'}.`);
    });
}
function isStructuralRelationship(value) {
    return value in STRUCTURAL_RELATIONSHIPS;
}
function validateEdgeEvidence(value, field) {
    const evidence = asArray(value, field, true);
    evidence.forEach((entry, index) => {
        const itemField = `${field}[${index}]`;
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, ['method', 'sourceFamily', 'field', 'matchedValue'], itemField);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(item.method, ['field-derived', 'field-reference', 'persisted-inventory', 'request-scope'], `${itemField}.method`);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(item.sourceFamily, [...portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES, 'graph-scope'], `${itemField}.sourceFamily`);
        if (item.field !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(item.field, `${itemField}.field`);
        if (item.matchedValue !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(item.matchedValue, `${itemField}.matchedValue`);
    });
}
function validateContainmentDirection(relationshipType, fromKind, toKind, field) {
    const [expectedFrom, expectedTo] = STRUCTURAL_RELATIONSHIPS[relationshipType];
    if (fromKind !== expectedFrom || toKind !== expectedTo)
        throw new Error(`${field} ${relationshipType} containment must point child to parent.`);
}
function validateUnresolved(value, nodes) {
    const expectedFamilies = [
        'ec2-instance',
        'vpc',
        'subnet',
        'internet-gateway',
        'virtual-private-gateway',
        'security-group',
        'rds-db-cluster',
        'rds-db-instance',
    ];
    asArray(value, 'artifact.unresolved').forEach((entry, index) => {
        const field = `artifact.unresolved[${index}]`;
        const unresolved = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(unresolved, ['sourceNodeId', 'relationshipType', 'sourceFamily', 'field', 'matchedValue', 'expectedTargetFamily'], field);
        const sourceNodeId = (0, portalPublicArtifactValidationCommon_1.requiredString)(unresolved.sourceNodeId, `${field}.sourceNodeId`);
        if (!nodes.byId.has(sourceNodeId))
            throw new Error(`${field}.sourceNodeId references a missing node.`);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(unresolved.relationshipType, portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_TYPES, `${field}.relationshipType`);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(unresolved.sourceFamily, portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES, `${field}.sourceFamily`);
        (0, portalPublicArtifactValidationCommon_1.requiredString)(unresolved.field, `${field}.field`);
        (0, portalPublicArtifactValidationCommon_1.requiredString)(unresolved.matchedValue, `${field}.matchedValue`);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(unresolved.expectedTargetFamily, expectedFamilies, `${field}.expectedTargetFamily`);
    });
}
function validateCoverage(value, regions, portalGeneratedAt) {
    const coverage = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.coverage');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(coverage, ['families'], 'artifact.coverage');
    const familyNames = [];
    asArray(coverage.families, 'artifact.coverage.families').forEach((entry, index) => {
        const field = `artifact.coverage.families[${index}]`;
        const family = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(family, ['family', 'resourceRegions', 'status', 'lastSuccessfulRefreshAt', 'emptyScope', 'reason'], field);
        const familyName = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(family.family, portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES, `${field}.family`);
        familyNames.push(familyName);
        const familyRegions = (0, portalPublicArtifactValidationCommon_1.regionArray)(family.resourceRegions, `${field}.resourceRegions`);
        assertExactRegionSet(familyRegions, regions, `${field}.resourceRegions`);
        const status = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(family.status, ['available', 'incomplete'], `${field}.status`);
        if (status === 'available') {
            const refreshedAt = (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(family.lastSuccessfulRefreshAt, `${field}.lastSuccessfulRefreshAt`);
            if (Date.parse(refreshedAt) > Date.parse(portalGeneratedAt))
                throw new Error(`${field}.lastSuccessfulRefreshAt cannot exceed Portal output.`);
            (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(family.emptyScope, `${field}.emptyScope`);
            if (family.reason !== undefined)
                throw new Error(`${field}.reason is not allowed for available coverage.`);
        }
        else {
            (0, portalPublicArtifactValidationCommon_1.assertValue)(family.reason, 'source-refresh-incomplete', `${field}.reason`);
            if (family.lastSuccessfulRefreshAt !== undefined || family.emptyScope !== undefined)
                throw new Error(`${field} incomplete coverage cannot claim successful refresh evidence.`);
        }
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(familyNames, 'artifact.coverage family identities');
    if (familyNames.length !== portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES.length ||
        portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES.some(family => !familyNames.includes(family)))
        throw new Error('artifact.coverage must declare every relationship family.');
}
function validateCostOverlay(value, accountId, regions, portalGeneratedAt, resourceNodeCount) {
    const overlay = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.costOverlay');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(overlay, ['source', 'coverage', 'billing'], 'artifact.costOverlay');
    const source = (0, portalPublicArtifactValidationCommon_1.asRecord)(overlay.source, 'artifact.costOverlay.source');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(source, ['artifactType', 'logicalName', 'artifactGeneration', 'sha256', 'scope'], 'artifact.costOverlay.source');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(source.artifactType, 'resource-collection', 'artifact.costOverlay.source.artifactType');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(source.logicalName, 'resources.json.gz', 'artifact.costOverlay.source.logicalName');
    const generation = (0, portalPublicArtifactValidationCommon_1.validateGeneration)(source.artifactGeneration, 'artifact.costOverlay.source.artifactGeneration');
    if (Date.parse(generation.generatedAt) > Date.parse(portalGeneratedAt))
        throw new Error('artifact.costOverlay source cannot exceed Portal output.');
    (0, pluginPublicArtifactValidationHelpers_1.sha256)(source.sha256, 'artifact.costOverlay.source.sha256');
    const sourceScope = (0, portalPublicArtifactValidationCommon_1.validateResourceScope)(source.scope, accountId, 'artifact.costOverlay.source.scope');
    assertExactRegionSet(sourceScope.resourceRegions, regions, 'artifact.costOverlay.source.scope.resourceRegions');
    const coverage = (0, portalPublicArtifactValidationCommon_1.asRecord)(overlay.coverage, 'artifact.costOverlay.coverage');
    const coverageKeys = ['totalResourceCount', 'billedResourceCount', 'matchedResourceNodeCount', 'unmatchedBillingExpenseCount'];
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(coverage, coverageKeys, 'artifact.costOverlay.coverage');
    coverageKeys.forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(coverage[key], `artifact.costOverlay.coverage.${key}`));
    if (Number(coverage.billedResourceCount) > Number(coverage.totalResourceCount))
        throw new Error('artifact.costOverlay billed count exceeds resource count.');
    if (Number(coverage.matchedResourceNodeCount) > Number(coverage.billedResourceCount))
        throw new Error('artifact.costOverlay matched count exceeds billed count.');
    if (Number(coverage.matchedResourceNodeCount) > resourceNodeCount)
        throw new Error('artifact.costOverlay matched count exceeds graph resource node count.');
    (0, portalPublicArtifactEvidenceValidation_1.validateAwsPortalBillingBlock)(overlay.billing, 'artifact.costOverlay.billing', sourceScope.billing, accountId, false);
    return Number(coverage.matchedResourceNodeCount);
}
function validateStats(value, nodeCount, edgeCount, unresolvedCount) {
    const stats = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, 'artifact.stats');
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(stats, ['totalNodes', 'totalEdges', 'unresolvedCount', 'truncated', 'truncation', 'buildMs', 'snapshotBytes'], 'artifact.stats');
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(stats.totalNodes, 'artifact.stats.totalNodes');
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(stats.totalEdges, 'artifact.stats.totalEdges');
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(stats.unresolvedCount, 'artifact.stats.unresolvedCount');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(stats.totalNodes, nodeCount, 'artifact.stats.totalNodes');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(stats.totalEdges, edgeCount, 'artifact.stats.totalEdges');
    (0, portalPublicArtifactValidationCommon_1.assertValue)(stats.unresolvedCount, unresolvedCount, 'artifact.stats.unresolvedCount');
    const truncated = (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(stats.truncated, 'artifact.stats.truncated');
    if (truncated) {
        const truncation = (0, portalPublicArtifactValidationCommon_1.asRecord)(stats.truncation, 'artifact.stats.truncation');
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(truncation, ['reason', 'edgesDroppedCount', 'unresolvedDroppedCount', 'tagsRemovedFromNodeCount'], 'artifact.stats.truncation');
        (0, portalPublicArtifactValidationCommon_1.assertValue)(truncation.reason, 'snapshot-size-limit', 'artifact.stats.truncation.reason');
        const dropped = ['edgesDroppedCount', 'unresolvedDroppedCount', 'tagsRemovedFromNodeCount'].map(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(truncation[key], `artifact.stats.truncation.${key}`));
        if (dropped.every(count => count === 0))
            throw new Error('artifact.stats.truncation must report at least one omitted item.');
    }
    else if (stats.truncation !== undefined) {
        throw new Error('artifact.stats.truncation is only allowed when truncated is true.');
    }
    if (stats.buildMs !== undefined)
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(stats.buildMs, 'artifact.stats.buildMs');
    if (stats.snapshotBytes !== undefined)
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(stats.snapshotBytes, 'artifact.stats.snapshotBytes');
}
function assertExactRegionSet(actual, expected, field) {
    const actualSet = new Set(actual);
    if (actualSet.size !== expected.length || expected.some(region => !actualSet.has(region)))
        throw new Error(`${field} must exactly match artifact scope Regions.`);
}
function nonEmptyStringEnumArray(value, allowed, field) {
    const values = asArray(value, field, true).map((entry, index) => (0, portalPublicArtifactValidationCommon_1.requiredEnum)(entry, allowed, `${field}[${index}]`));
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(values, field);
    return values;
}
function asArray(value, field, nonEmpty = false) {
    if (!Array.isArray(value) || (nonEmpty && value.length === 0))
        throw new Error(`${field} must be ${nonEmpty ? 'a non-empty' : 'an'} array.`);
    return value;
}
//# sourceMappingURL=portalRelationshipPublicArtifactValidation.js.map