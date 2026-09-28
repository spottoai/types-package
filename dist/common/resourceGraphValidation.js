"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResourceGraphArtifact = validateResourceGraphArtifact;
const capabilityPassport_js_1 = require("./capabilityPassport.js");
const resourceGraph_js_1 = require("./resourceGraph.js");
const resourceIdentity_js_1 = require("./resourceIdentity.js");
const validationHelpers_js_1 = require("./validationHelpers.js");
const ARTIFACT_KEYS = [
    'schemaVersion',
    'provider',
    'accountId',
    'artifactGeneration',
    'generatedAt',
    'scope',
    'currency',
    'currencySymbol',
    'nodes',
    'edges',
    'unresolved',
    'coverage',
    'stats',
];
const NODE_KEYS = [
    'id',
    'kind',
    'family',
    'resourceType',
    'syntheticType',
    'region',
    'name',
    'displayName',
    'icon',
    'nativeId',
    'role',
    'tags',
    'attributes',
    'costs',
];
/** Node fields each kind may carry; anything else is rejected. */
const NODE_FIELDS = {
    scope: ['nativeId', 'attributes'],
    region: [],
    zone: ['nativeId', 'attributes'],
    group: ['family', 'nativeId', 'role', 'tags', 'attributes'],
    resource: ['family', 'resourceType', 'nativeId', 'role', 'tags', 'attributes', 'costs'],
    synthetic: ['family', 'syntheticType', 'nativeId', 'role', 'tags', 'attributes'],
};
/** Allowed `contains` parents: containment is strictly downward, so the graph stays acyclic. */
const CONTAINMENT_PARENTS = {
    scope: [],
    region: ['scope'],
    zone: ['region'],
    group: ['region', 'zone'],
    resource: ['region', 'zone', 'group'],
    synthetic: ['region', 'zone', 'group'],
};
const DEPENDENCY_KINDS = ['group', 'resource', 'synthetic'];
/**
 * Validates one untrusted resource graph artifact. It checks structure and
 * identifier formats only; families are never checked against a service list.
 */
function validateResourceGraphArtifact(value, options) {
    const artifact = (0, validationHelpers_js_1.asRecord)(value, 'artifact');
    (0, validationHelpers_js_1.assertExactKeys)(artifact, ARTIFACT_KEYS, 'artifact');
    (0, validationHelpers_js_1.assertValue)(artifact.schemaVersion, resourceGraph_js_1.RESOURCE_GRAPH_SCHEMA_VERSION, 'artifact.schemaVersion');
    (0, validationHelpers_js_1.assertValue)(artifact.provider, options.provider, 'artifact.provider');
    const accountId = (0, validationHelpers_js_1.requiredString)(artifact.accountId, 'artifact.accountId');
    if (options.isAccountId && !options.isAccountId(accountId))
        throw new Error('artifact.accountId is not a valid provider account id.');
    const generation = (0, validationHelpers_js_1.validateGeneration)(artifact.artifactGeneration, 'artifact.artifactGeneration');
    const outputAt = Date.parse(generation.generatedAt);
    const generatedAt = (0, validationHelpers_js_1.isoTimestamp)(artifact.generatedAt, 'artifact.generatedAt');
    if (Date.parse(generatedAt) > outputAt)
        throw new Error('artifact.generatedAt must not be newer than the artifact generation.');
    const regions = validateScope(artifact.scope, options);
    if (artifact.currency !== undefined)
        (0, validationHelpers_js_1.requiredString)(artifact.currency, 'artifact.currency');
    if (artifact.currencySymbol !== undefined)
        (0, validationHelpers_js_1.requiredString)(artifact.currencySymbol, 'artifact.currencySymbol');
    const nodes = validateNodes(artifact.nodes, accountId, regions, options);
    if (nodes.hasCosts && artifact.currency === undefined)
        throw new Error('artifact.currency is required when nodes carry costs.');
    const edgeCount = validateEdges(artifact.edges, nodes.byId);
    const unresolvedCount = validateUnresolved(artifact.unresolved, nodes.byId);
    validateCoverage(artifact.coverage, regions, outputAt, nodes.byId);
    validateStats(artifact.stats, nodes.byId.size, edgeCount, unresolvedCount);
    assertPublicGraphJson(artifact, options.isForbiddenKey);
    return value;
}
function validateScope(value, options) {
    const scope = (0, validationHelpers_js_1.asRecord)(value, 'artifact.scope');
    (0, validationHelpers_js_1.assertExactKeys)(scope, ['regions'], 'artifact.scope');
    const regions = (0, validationHelpers_js_1.asArray)(scope.regions, 'artifact.scope.regions', true).map((region, index) => {
        const field = `artifact.scope.regions[${index}]`;
        const name = (0, validationHelpers_js_1.requiredString)(region, field);
        if (options.isRegion && !options.isRegion(name))
            throw new Error(`${field} is not a valid provider Region.`);
        return name;
    });
    (0, validationHelpers_js_1.assertUnique)(regions, 'artifact.scope.regions');
    return new Set(regions);
}
function validateNodes(value, accountId, regions, options) {
    const byId = new Map();
    const regionNodes = [];
    let scopeCount = 0;
    let hasCosts = false;
    (0, validationHelpers_js_1.asArray)(value, 'artifact.nodes').forEach((entry, index) => {
        const field = `artifact.nodes[${index}]`;
        const node = (0, validationHelpers_js_1.asRecord)(entry, field);
        (0, validationHelpers_js_1.assertExactKeys)(node, NODE_KEYS, field);
        const id = (0, validationHelpers_js_1.requiredString)(node.id, `${field}.id`);
        if (byId.has(id))
            throw new Error('artifact node ids must be unique.');
        const kind = (0, validationHelpers_js_1.requiredEnum)(node.kind, resourceGraph_js_1.RESOURCE_GRAPH_NODE_KINDS, `${field}.kind`);
        const allowed = NODE_FIELDS[kind];
        const undeclared = ['family', 'resourceType', 'syntheticType', 'nativeId', 'role', 'tags', 'attributes', 'costs'].filter(key => node[key] !== undefined && !allowed.includes(key));
        if (undeclared.length > 0)
            throw new Error(`${field} ${kind} nodes must not carry: ${undeclared.join(', ')}.`);
        (0, validationHelpers_js_1.requiredString)(node.name, `${field}.name`);
        if (node.displayName !== undefined)
            (0, validationHelpers_js_1.requiredString)(node.displayName, `${field}.displayName`);
        if (node.icon !== undefined)
            (0, validationHelpers_js_1.requiredString)(node.icon, `${field}.icon`);
        let region;
        if (kind === 'scope') {
            scopeCount += 1;
            if (node.region !== undefined)
                throw new Error(`${field}.region is not allowed on the scope node.`);
        }
        else {
            region = (0, validationHelpers_js_1.requiredString)(node.region, `${field}.region`);
            if (!regions.has(region))
                throw new Error(`${field}.region is outside artifact scope.`);
        }
        if (kind === 'region')
            regionNodes.push(region);
        if (kind === 'zone')
            options.validateZone?.(String(node.name), region, `${field}.name`);
        if (kind === 'resource' || node.family !== undefined)
            kebab(node.family, `${field}.family`);
        if (kind === 'resource') {
            const resourceType = (0, validationHelpers_js_1.requiredString)(node.resourceType, `${field}.resourceType`);
            if (options.isResourceType && !options.isResourceType(resourceType))
                throw new Error(`${field}.resourceType is not a valid provider resource type.`);
        }
        if (kind === 'synthetic')
            kebab(node.syntheticType, `${field}.syntheticType`);
        if (node.role !== undefined)
            (0, validationHelpers_js_1.requiredEnum)(node.role, resourceGraph_js_1.RESOURCE_GRAPH_NODE_ROLES, `${field}.role`);
        const scope = { accountId, region };
        if (node.nativeId !== undefined)
            options.validateNativeId?.((0, validationHelpers_js_1.requiredString)(node.nativeId, `${field}.nativeId`), scope, `${field}.nativeId`);
        if (node.tags !== undefined)
            validateTags(node.tags, `${field}.tags`);
        if (node.attributes !== undefined)
            validateAttributes(node.attributes, scope, options, `${field}.attributes`);
        if (node.costs !== undefined) {
            validateCosts(node.costs, `${field}.costs`);
            hasCosts = true;
        }
        byId.set(id, { kind, region, family: node.family === undefined ? undefined : String(node.family) });
    });
    if (scopeCount !== 1)
        throw new Error('artifact must contain exactly one scope node.');
    (0, validationHelpers_js_1.assertUnique)(regionNodes, 'artifact Region nodes');
    if (regionNodes.length !== regions.size)
        throw new Error('artifact Region nodes must exactly match artifact scope Regions.');
    return { byId, hasCosts };
}
function kebab(value, field) {
    if (!(0, resourceIdentity_js_1.isKebabIdentifier)(value))
        throw new Error(`${field} must be a kebab-case identifier.`);
    return value;
}
function validateTags(value, field) {
    Object.entries((0, validationHelpers_js_1.asRecord)(value, field)).forEach(([key, tagValue]) => {
        if (key.length === 0)
            throw new Error(`${field} keys must be non-empty.`);
        if (typeof tagValue !== 'string')
            throw new Error(`${field}.${key} must be a string.`);
    });
}
function validateAttributes(value, scope, options, field) {
    Object.entries((0, validationHelpers_js_1.asRecord)(value, field)).forEach(([key, item]) => {
        const itemField = `${field}.${key}`;
        if (!(0, resourceIdentity_js_1.isAttributeKey)(key))
            throw new Error(`${itemField} key must be camelCase.`);
        validateAttributeValue(item, itemField);
        options.validateAttribute?.(key, item, scope, itemField);
    });
}
function validateAttributeValue(value, field) {
    if ((0, resourceIdentity_js_1.isAttributeScalar)(value))
        return;
    if (!Array.isArray(value))
        throw new Error(`${field} must be a scalar, a scalar array, or an array of flat records.`);
    if (value.every(resourceIdentity_js_1.isAttributeScalar))
        return;
    value.forEach((entry, index) => {
        const entryField = `${field}[${index}]`;
        Object.entries((0, validationHelpers_js_1.asRecord)(entry, entryField)).forEach(([key, item]) => {
            if (!(0, resourceIdentity_js_1.isAttributeKey)(key))
                throw new Error(`${entryField}.${key} key must be camelCase.`);
            if (!(0, resourceIdentity_js_1.isAttributeScalar)(item))
                throw new Error(`${entryField}.${key} must be a string, finite number, or boolean.`);
        });
    });
}
function validateCosts(value, field) {
    const costs = (0, validationHelpers_js_1.asRecord)(value, field);
    (0, validationHelpers_js_1.assertExactKeys)(costs, ['spend30d', 'spend30dAmortized'], field);
    if (Object.keys(costs).length === 0)
        throw new Error(`${field} must report at least one amount.`);
    Object.entries(costs).forEach(([key, amount]) => (0, validationHelpers_js_1.finiteNumber)(amount, `${field}.${key}`));
}
function validateEdges(value, nodes) {
    const edges = (0, validationHelpers_js_1.asArray)(value, 'artifact.edges');
    const ids = new Set();
    const parents = new Map();
    edges.forEach((entry, index) => {
        const field = `artifact.edges[${index}]`;
        const edge = (0, validationHelpers_js_1.asRecord)(entry, field);
        (0, validationHelpers_js_1.assertExactKeys)(edge, ['id', 'from', 'to', 'kind', 'relationshipTypes', 'confidence', 'evidence'], field);
        const id = (0, validationHelpers_js_1.requiredString)(edge.id, `${field}.id`);
        if (ids.has(id))
            throw new Error('artifact edge ids must be unique.');
        ids.add(id);
        const from = (0, validationHelpers_js_1.requiredString)(edge.from, `${field}.from`);
        const to = (0, validationHelpers_js_1.requiredString)(edge.to, `${field}.to`);
        const child = nodes.get(from);
        const parent = nodes.get(to);
        if (!child || !parent)
            throw new Error(`${field} references a missing node.`);
        if (from === to)
            throw new Error(`${field} must not be a self edge.`);
        const kind = (0, validationHelpers_js_1.requiredEnum)(edge.kind, resourceGraph_js_1.RESOURCE_GRAPH_EDGE_KINDS, `${field}.kind`);
        const relationshipTypes = (0, validationHelpers_js_1.asArray)(edge.relationshipTypes, `${field}.relationshipTypes`, true).map((type, typeIndex) => kebab(type, `${field}.relationshipTypes[${typeIndex}]`));
        (0, validationHelpers_js_1.assertUnique)(relationshipTypes, `${field}.relationshipTypes`);
        (0, validationHelpers_js_1.requiredEnum)(edge.confidence, resourceGraph_js_1.RESOURCE_GRAPH_EDGE_CONFIDENCES, `${field}.confidence`);
        validateEvidence(edge.evidence, `${field}.evidence`);
        if (kind === 'contains') {
            if (!CONTAINMENT_PARENTS[child.kind].includes(parent.kind))
                throw new Error(`${field} ${child.kind} nodes cannot be contained by ${parent.kind} nodes; contains edges point child to parent.`);
            if (parent.region !== undefined && child.region !== parent.region)
                throw new Error(`${field} containment must not cross Regions.`);
            parents.set(from, (parents.get(from) ?? 0) + 1);
        }
        else if (!DEPENDENCY_KINDS.includes(child.kind) || !DEPENDENCY_KINDS.includes(parent.kind)) {
            throw new Error(`${field} depends_on edges must connect group, resource, or synthetic nodes.`);
        }
    });
    nodes.forEach((node, id) => {
        const expected = node.kind === 'scope' ? 0 : 1;
        if ((parents.get(id) ?? 0) !== expected)
            throw new Error(`artifact node ${id} must have exactly ${expected} contains parent edge${expected === 1 ? '' : 's'}.`);
    });
    return edges.length;
}
function validateEvidence(value, field) {
    (0, validationHelpers_js_1.asArray)(value, field, true).forEach((entry, index) => {
        const itemField = `${field}[${index}]`;
        const item = (0, validationHelpers_js_1.asRecord)(entry, itemField);
        (0, validationHelpers_js_1.assertExactKeys)(item, ['method', 'sourceFamily', 'field', 'matchedValue'], itemField);
        (0, validationHelpers_js_1.requiredEnum)(item.method, resourceGraph_js_1.RESOURCE_GRAPH_EVIDENCE_METHODS, `${itemField}.method`);
        kebab(item.sourceFamily, `${itemField}.sourceFamily`);
        if (item.field !== undefined)
            (0, validationHelpers_js_1.requiredString)(item.field, `${itemField}.field`);
        if (item.matchedValue !== undefined)
            (0, validationHelpers_js_1.requiredString)(item.matchedValue, `${itemField}.matchedValue`);
    });
}
function validateUnresolved(value, nodes) {
    const unresolved = (0, validationHelpers_js_1.asArray)(value, 'artifact.unresolved');
    unresolved.forEach((entry, index) => {
        const field = `artifact.unresolved[${index}]`;
        const reference = (0, validationHelpers_js_1.asRecord)(entry, field);
        (0, validationHelpers_js_1.assertExactKeys)(reference, ['sourceNodeId', 'relationshipType', 'sourceFamily', 'field', 'matchedValue', 'expectedTargetFamily'], field);
        const source = nodes.get((0, validationHelpers_js_1.requiredString)(reference.sourceNodeId, `${field}.sourceNodeId`));
        if (!source)
            throw new Error(`${field}.sourceNodeId references a missing node.`);
        kebab(reference.relationshipType, `${field}.relationshipType`);
        const sourceFamily = kebab(reference.sourceFamily, `${field}.sourceFamily`);
        if (source.family !== undefined && source.family !== sourceFamily)
            throw new Error(`${field}.sourceFamily must match its source node family.`);
        (0, validationHelpers_js_1.requiredString)(reference.field, `${field}.field`);
        (0, validationHelpers_js_1.requiredString)(reference.matchedValue, `${field}.matchedValue`);
        kebab(reference.expectedTargetFamily, `${field}.expectedTargetFamily`);
    });
    return unresolved.length;
}
/** Coverage is self-closing: it must declare every family that appears on a resource node. */
function validateCoverage(value, regions, outputAt, nodes) {
    const coverage = (0, validationHelpers_js_1.asRecord)(value, 'artifact.coverage');
    (0, validationHelpers_js_1.assertExactKeys)(coverage, ['families'], 'artifact.coverage');
    const declared = new Map();
    (0, validationHelpers_js_1.asArray)(coverage.families, 'artifact.coverage.families').forEach((entry, index) => {
        const field = `artifact.coverage.families[${index}]`;
        const family = (0, validationHelpers_js_1.asRecord)(entry, field);
        (0, validationHelpers_js_1.assertExactKeys)(family, ['family', 'regions', 'status', 'lastSuccessfulRefreshAt', 'emptyScope', 'reason'], field);
        const name = kebab(family.family, `${field}.family`);
        if (declared.has(name))
            throw new Error('artifact.coverage family identities must not contain duplicates.');
        const familyRegions = (0, validationHelpers_js_1.asArray)(family.regions, `${field}.regions`, true).map((region, regionIndex) => (0, validationHelpers_js_1.requiredString)(region, `${field}.regions[${regionIndex}]`));
        (0, validationHelpers_js_1.assertUnique)(familyRegions, `${field}.regions`);
        if (familyRegions.some(region => !regions.has(region)))
            throw new Error(`${field}.regions must be within artifact scope Regions.`);
        let emptyScope = false;
        if ((0, validationHelpers_js_1.requiredEnum)(family.status, ['available', 'incomplete'], `${field}.status`) === 'available') {
            const refreshedAt = (0, validationHelpers_js_1.isoTimestamp)(family.lastSuccessfulRefreshAt, `${field}.lastSuccessfulRefreshAt`);
            if (Date.parse(refreshedAt) > outputAt)
                throw new Error(`${field}.lastSuccessfulRefreshAt must not be newer than the artifact generation.`);
            emptyScope = (0, validationHelpers_js_1.requiredBoolean)(family.emptyScope, `${field}.emptyScope`);
            if (family.reason !== undefined)
                throw new Error(`${field}.reason is not allowed for available coverage.`);
        }
        else {
            (0, validationHelpers_js_1.requiredEnum)(family.reason, capabilityPassport_js_1.CAPABILITY_REASON_CODES, `${field}.reason`);
            if (family.lastSuccessfulRefreshAt !== undefined || family.emptyScope !== undefined)
                throw new Error(`${field} incomplete coverage cannot claim successful refresh evidence.`);
        }
        declared.set(name, { regions: new Set(familyRegions), emptyScope });
    });
    nodes.forEach((node, id) => {
        if (node.kind !== 'resource')
            return;
        const family = declared.get(node.family);
        if (!family)
            throw new Error(`artifact.coverage must declare family ${node.family} of resource node ${id}.`);
        if (!family.regions.has(node.region))
            throw new Error(`artifact.coverage for ${node.family} must include Region ${node.region}.`);
        if (family.emptyScope)
            throw new Error(`artifact.coverage for ${node.family} claims an empty scope but resource node ${id} exists.`);
    });
}
function validateStats(value, nodeCount, edgeCount, unresolvedCount) {
    const stats = (0, validationHelpers_js_1.asRecord)(value, 'artifact.stats');
    (0, validationHelpers_js_1.assertExactKeys)(stats, ['totalNodes', 'totalEdges', 'unresolvedCount', 'truncated', 'truncation', 'buildMs', 'snapshotBytes'], 'artifact.stats');
    (0, validationHelpers_js_1.assertValue)((0, validationHelpers_js_1.nonNegativeInteger)(stats.totalNodes, 'artifact.stats.totalNodes'), nodeCount, 'artifact.stats.totalNodes');
    (0, validationHelpers_js_1.assertValue)((0, validationHelpers_js_1.nonNegativeInteger)(stats.totalEdges, 'artifact.stats.totalEdges'), edgeCount, 'artifact.stats.totalEdges');
    (0, validationHelpers_js_1.assertValue)((0, validationHelpers_js_1.nonNegativeInteger)(stats.unresolvedCount, 'artifact.stats.unresolvedCount'), unresolvedCount, 'artifact.stats.unresolvedCount');
    if ((0, validationHelpers_js_1.requiredBoolean)(stats.truncated, 'artifact.stats.truncated')) {
        const truncation = (0, validationHelpers_js_1.asRecord)(stats.truncation, 'artifact.stats.truncation');
        const counts = ['edgesDroppedCount', 'unresolvedDroppedCount', 'tagsRemovedFromNodeCount'];
        (0, validationHelpers_js_1.assertExactKeys)(truncation, ['reason', ...counts], 'artifact.stats.truncation');
        (0, validationHelpers_js_1.assertValue)(truncation.reason, 'snapshot-size-limit', 'artifact.stats.truncation.reason');
        if (counts.map(key => (0, validationHelpers_js_1.nonNegativeInteger)(truncation[key], `artifact.stats.truncation.${key}`)).every(count => count === 0))
            throw new Error('artifact.stats.truncation must report at least one omitted item.');
    }
    else if (stats.truncation !== undefined) {
        throw new Error('artifact.stats.truncation is only allowed when truncated is true.');
    }
    if (stats.buildMs !== undefined)
        (0, validationHelpers_js_1.nonNegativeInteger)(stats.buildMs, 'artifact.stats.buildMs');
    if (stats.snapshotBytes !== undefined)
        (0, validationHelpers_js_1.nonNegativeInteger)(stats.snapshotBytes, 'artifact.stats.snapshotBytes');
}
/** Rejects non-plain JSON everywhere, applying the provider key guard with attribute context. */
function assertPublicGraphJson(artifact, isForbiddenKey) {
    const { nodes, ...envelope } = artifact;
    (0, validationHelpers_js_1.assertPlainJson)(envelope, 'artifact', key => isForbiddenKey?.(key, false) ?? false);
    nodes.forEach((node, index) => {
        const { attributes, ...rest } = node;
        (0, validationHelpers_js_1.assertPlainJson)(rest, `artifact.nodes[${index}]`, key => isForbiddenKey?.(key, false) ?? false);
        if (attributes !== undefined)
            (0, validationHelpers_js_1.assertPlainJson)(attributes, `artifact.nodes[${index}].attributes`, key => isForbiddenKey?.(key, true) ?? false);
    });
}
//# sourceMappingURL=resourceGraphValidation.js.map