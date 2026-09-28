import type { ArtifactProvider } from './artifactGeneration.js';
import { CAPABILITY_REASON_CODES } from './capabilityPassport.js';
import {
  RESOURCE_GRAPH_EDGE_CONFIDENCES,
  RESOURCE_GRAPH_EDGE_KINDS,
  RESOURCE_GRAPH_EVIDENCE_METHODS,
  RESOURCE_GRAPH_NODE_KINDS,
  RESOURCE_GRAPH_NODE_ROLES,
  RESOURCE_GRAPH_SCHEMA_VERSION,
  type ResourceGraphArtifact,
  type ResourceGraphNodeKind,
} from './resourceGraph.js';
import { isAttributeKey, isAttributeScalar, isKebabIdentifier, type AttributeValue } from './resourceIdentity.js';
import {
  asArray,
  asRecord,
  assertExactKeys,
  assertPlainJson,
  assertUnique,
  assertValue,
  finiteNumber,
  isoTimestamp,
  nonNegativeInteger,
  requiredBoolean,
  requiredEnum,
  requiredString,
  validateGeneration,
  type JsonRecord,
} from './validationHelpers.js';

/** Account and Region a node's provider-native values must stay within. */
export interface ResourceGraphNodeScope {
  accountId: string;
  region?: string;
}

/**
 * Provider format rules. The generic validator checks structure only; each
 * provider supplies identifier formats here. Every callback throws on failure.
 */
export interface ResourceGraphValidationOptions<Provider extends ArtifactProvider = ArtifactProvider> {
  provider: Provider;
  isAccountId?: (value: string) => boolean;
  isRegion?: (value: string) => boolean;
  isResourceType?: (value: string) => boolean;
  validateNativeId?: (nativeId: string, scope: ResourceGraphNodeScope, field: string) => void;
  /** Validates a zone node name against its Region. */
  validateZone?: (zone: string, region: string, field: string) => void;
  validateAttribute?: (key: string, value: AttributeValue, scope: ResourceGraphNodeScope, field: string) => void;
  /** Rejects keys at every depth; `inAttributes` is true inside a node's provider-native attributes. */
  isForbiddenKey?: (key: string, inAttributes: boolean) => boolean;
}

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
] as const;

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
] as const;

type NodeField = 'family' | 'resourceType' | 'syntheticType' | 'nativeId' | 'role' | 'tags' | 'attributes' | 'costs';

/** Node fields each kind may carry; anything else is rejected. */
const NODE_FIELDS: Record<ResourceGraphNodeKind, readonly NodeField[]> = {
  scope: ['nativeId', 'attributes'],
  region: [],
  zone: ['nativeId', 'attributes'],
  group: ['family', 'nativeId', 'role', 'tags', 'attributes'],
  resource: ['family', 'resourceType', 'nativeId', 'role', 'tags', 'attributes', 'costs'],
  synthetic: ['family', 'syntheticType', 'nativeId', 'role', 'tags', 'attributes'],
};

/** Allowed `contains` parents: containment is strictly downward, so the graph stays acyclic. */
const CONTAINMENT_PARENTS: Record<ResourceGraphNodeKind, readonly ResourceGraphNodeKind[]> = {
  scope: [],
  region: ['scope'],
  zone: ['region'],
  group: ['region', 'zone'],
  resource: ['region', 'zone', 'group'],
  synthetic: ['region', 'zone', 'group'],
};

const DEPENDENCY_KINDS: readonly ResourceGraphNodeKind[] = ['group', 'resource', 'synthetic'];

type ValidatedNode = { kind: ResourceGraphNodeKind; region?: string; family?: string };

/**
 * Validates one untrusted resource graph artifact. It checks structure and
 * identifier formats only; families are never checked against a service list.
 */
export function validateResourceGraphArtifact<Provider extends ArtifactProvider>(
  value: unknown,
  options: ResourceGraphValidationOptions<Provider>
): ResourceGraphArtifact<Provider> {
  const artifact = asRecord(value, 'artifact');
  assertExactKeys(artifact, ARTIFACT_KEYS, 'artifact');
  assertValue(artifact.schemaVersion, RESOURCE_GRAPH_SCHEMA_VERSION, 'artifact.schemaVersion');
  assertValue(artifact.provider, options.provider, 'artifact.provider');
  const accountId = requiredString(artifact.accountId, 'artifact.accountId');
  if (options.isAccountId && !options.isAccountId(accountId)) throw new Error('artifact.accountId is not a valid provider account id.');
  const generation = validateGeneration(artifact.artifactGeneration, 'artifact.artifactGeneration');
  const outputAt = Date.parse(generation.generatedAt);
  const generatedAt = isoTimestamp(artifact.generatedAt, 'artifact.generatedAt');
  if (Date.parse(generatedAt) > outputAt) throw new Error('artifact.generatedAt must not be newer than the artifact generation.');
  const regions = validateScope(artifact.scope, options);
  if (artifact.currency !== undefined) requiredString(artifact.currency, 'artifact.currency');
  if (artifact.currencySymbol !== undefined) requiredString(artifact.currencySymbol, 'artifact.currencySymbol');

  const nodes = validateNodes(artifact.nodes, accountId, regions, options);
  if (nodes.hasCosts && artifact.currency === undefined) throw new Error('artifact.currency is required when nodes carry costs.');
  const edgeCount = validateEdges(artifact.edges, nodes.byId);
  const unresolvedCount = validateUnresolved(artifact.unresolved, nodes.byId);
  validateCoverage(artifact.coverage, regions, outputAt, nodes.byId);
  validateStats(artifact.stats, nodes.byId.size, edgeCount, unresolvedCount);
  assertPublicGraphJson(artifact, options.isForbiddenKey);
  return value as ResourceGraphArtifact<Provider>;
}

function validateScope(value: unknown, options: ResourceGraphValidationOptions): Set<string> {
  const scope = asRecord(value, 'artifact.scope');
  assertExactKeys(scope, ['regions'], 'artifact.scope');
  const regions = asArray(scope.regions, 'artifact.scope.regions', true).map((region, index) => {
    const field = `artifact.scope.regions[${index}]`;
    const name = requiredString(region, field);
    if (options.isRegion && !options.isRegion(name)) throw new Error(`${field} is not a valid provider Region.`);
    return name;
  });
  assertUnique(regions, 'artifact.scope.regions');
  return new Set(regions);
}

function validateNodes(
  value: unknown,
  accountId: string,
  regions: ReadonlySet<string>,
  options: ResourceGraphValidationOptions
): { byId: Map<string, ValidatedNode>; hasCosts: boolean } {
  const byId = new Map<string, ValidatedNode>();
  const regionNodes: string[] = [];
  let scopeCount = 0;
  let hasCosts = false;
  asArray(value, 'artifact.nodes').forEach((entry, index) => {
    const field = `artifact.nodes[${index}]`;
    const node = asRecord(entry, field);
    assertExactKeys(node, NODE_KEYS, field);
    const id = requiredString(node.id, `${field}.id`);
    if (byId.has(id)) throw new Error('artifact node ids must be unique.');
    const kind = requiredEnum(node.kind, RESOURCE_GRAPH_NODE_KINDS, `${field}.kind`);
    const allowed = NODE_FIELDS[kind];
    const undeclared = (['family', 'resourceType', 'syntheticType', 'nativeId', 'role', 'tags', 'attributes', 'costs'] as const).filter(
      key => node[key] !== undefined && !allowed.includes(key)
    );
    if (undeclared.length > 0) throw new Error(`${field} ${kind} nodes must not carry: ${undeclared.join(', ')}.`);
    requiredString(node.name, `${field}.name`);
    if (node.displayName !== undefined) requiredString(node.displayName, `${field}.displayName`);
    if (node.icon !== undefined) requiredString(node.icon, `${field}.icon`);

    let region: string | undefined;
    if (kind === 'scope') {
      scopeCount += 1;
      if (node.region !== undefined) throw new Error(`${field}.region is not allowed on the scope node.`);
    } else {
      region = requiredString(node.region, `${field}.region`);
      if (!regions.has(region)) throw new Error(`${field}.region is outside artifact scope.`);
    }
    if (kind === 'region') regionNodes.push(region as string);
    if (kind === 'zone') options.validateZone?.(String(node.name), region as string, `${field}.name`);

    if (kind === 'resource' || node.family !== undefined) kebab(node.family, `${field}.family`);
    if (kind === 'resource') {
      const resourceType = requiredString(node.resourceType, `${field}.resourceType`);
      if (options.isResourceType && !options.isResourceType(resourceType))
        throw new Error(`${field}.resourceType is not a valid provider resource type.`);
    }
    if (kind === 'synthetic') kebab(node.syntheticType, `${field}.syntheticType`);
    if (node.role !== undefined) requiredEnum(node.role, RESOURCE_GRAPH_NODE_ROLES, `${field}.role`);

    const scope: ResourceGraphNodeScope = { accountId, region };
    if (node.nativeId !== undefined) options.validateNativeId?.(requiredString(node.nativeId, `${field}.nativeId`), scope, `${field}.nativeId`);
    if (node.tags !== undefined) validateTags(node.tags, `${field}.tags`);
    if (node.attributes !== undefined) validateAttributes(node.attributes, scope, options, `${field}.attributes`);
    if (node.costs !== undefined) {
      validateCosts(node.costs, `${field}.costs`);
      hasCosts = true;
    }
    byId.set(id, { kind, region, family: node.family === undefined ? undefined : String(node.family) });
  });
  if (scopeCount !== 1) throw new Error('artifact must contain exactly one scope node.');
  assertUnique(regionNodes, 'artifact Region nodes');
  if (regionNodes.length !== regions.size) throw new Error('artifact Region nodes must exactly match artifact scope Regions.');
  return { byId, hasCosts };
}

function kebab(value: unknown, field: string): string {
  if (!isKebabIdentifier(value)) throw new Error(`${field} must be a kebab-case identifier.`);
  return value;
}

function validateTags(value: unknown, field: string): void {
  Object.entries(asRecord(value, field)).forEach(([key, tagValue]) => {
    if (key.length === 0) throw new Error(`${field} keys must be non-empty.`);
    if (typeof tagValue !== 'string') throw new Error(`${field}.${key} must be a string.`);
  });
}

function validateAttributes(value: unknown, scope: ResourceGraphNodeScope, options: ResourceGraphValidationOptions, field: string): void {
  Object.entries(asRecord(value, field)).forEach(([key, item]) => {
    const itemField = `${field}.${key}`;
    if (!isAttributeKey(key)) throw new Error(`${itemField} key must be camelCase.`);
    validateAttributeValue(item, itemField);
    options.validateAttribute?.(key, item as AttributeValue, scope, itemField);
  });
}

function validateAttributeValue(value: unknown, field: string): void {
  if (isAttributeScalar(value)) return;
  if (!Array.isArray(value)) throw new Error(`${field} must be a scalar, a scalar array, or an array of flat records.`);
  if (value.every(isAttributeScalar)) return;
  value.forEach((entry, index) => {
    const entryField = `${field}[${index}]`;
    Object.entries(asRecord(entry, entryField)).forEach(([key, item]) => {
      if (!isAttributeKey(key)) throw new Error(`${entryField}.${key} key must be camelCase.`);
      if (!isAttributeScalar(item)) throw new Error(`${entryField}.${key} must be a string, finite number, or boolean.`);
    });
  });
}

function validateCosts(value: unknown, field: string): void {
  const costs = asRecord(value, field);
  assertExactKeys(costs, ['spend30d', 'spend30dAmortized'], field);
  if (Object.keys(costs).length === 0) throw new Error(`${field} must report at least one amount.`);
  Object.entries(costs).forEach(([key, amount]) => finiteNumber(amount, `${field}.${key}`));
}

function validateEdges(value: unknown, nodes: ReadonlyMap<string, ValidatedNode>): number {
  const edges = asArray(value, 'artifact.edges');
  const ids = new Set<string>();
  const parents = new Map<string, number>();
  edges.forEach((entry, index) => {
    const field = `artifact.edges[${index}]`;
    const edge = asRecord(entry, field);
    assertExactKeys(edge, ['id', 'from', 'to', 'kind', 'relationshipTypes', 'confidence', 'evidence'], field);
    const id = requiredString(edge.id, `${field}.id`);
    if (ids.has(id)) throw new Error('artifact edge ids must be unique.');
    ids.add(id);
    const from = requiredString(edge.from, `${field}.from`);
    const to = requiredString(edge.to, `${field}.to`);
    const child = nodes.get(from);
    const parent = nodes.get(to);
    if (!child || !parent) throw new Error(`${field} references a missing node.`);
    if (from === to) throw new Error(`${field} must not be a self edge.`);
    const kind = requiredEnum(edge.kind, RESOURCE_GRAPH_EDGE_KINDS, `${field}.kind`);
    const relationshipTypes = asArray(edge.relationshipTypes, `${field}.relationshipTypes`, true).map((type, typeIndex) =>
      kebab(type, `${field}.relationshipTypes[${typeIndex}]`)
    );
    assertUnique(relationshipTypes, `${field}.relationshipTypes`);
    requiredEnum(edge.confidence, RESOURCE_GRAPH_EDGE_CONFIDENCES, `${field}.confidence`);
    validateEvidence(edge.evidence, `${field}.evidence`);
    if (kind === 'contains') {
      if (!CONTAINMENT_PARENTS[child.kind].includes(parent.kind))
        throw new Error(`${field} ${child.kind} nodes cannot be contained by ${parent.kind} nodes; contains edges point child to parent.`);
      if (parent.region !== undefined && child.region !== parent.region) throw new Error(`${field} containment must not cross Regions.`);
      parents.set(from, (parents.get(from) ?? 0) + 1);
    } else if (!DEPENDENCY_KINDS.includes(child.kind) || !DEPENDENCY_KINDS.includes(parent.kind)) {
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

function validateEvidence(value: unknown, field: string): void {
  asArray(value, field, true).forEach((entry, index) => {
    const itemField = `${field}[${index}]`;
    const item = asRecord(entry, itemField);
    assertExactKeys(item, ['method', 'sourceFamily', 'field', 'matchedValue'], itemField);
    requiredEnum(item.method, RESOURCE_GRAPH_EVIDENCE_METHODS, `${itemField}.method`);
    kebab(item.sourceFamily, `${itemField}.sourceFamily`);
    if (item.field !== undefined) requiredString(item.field, `${itemField}.field`);
    if (item.matchedValue !== undefined) requiredString(item.matchedValue, `${itemField}.matchedValue`);
  });
}

function validateUnresolved(value: unknown, nodes: ReadonlyMap<string, ValidatedNode>): number {
  const unresolved = asArray(value, 'artifact.unresolved');
  unresolved.forEach((entry, index) => {
    const field = `artifact.unresolved[${index}]`;
    const reference = asRecord(entry, field);
    assertExactKeys(reference, ['sourceNodeId', 'relationshipType', 'sourceFamily', 'field', 'matchedValue', 'expectedTargetFamily'], field);
    const source = nodes.get(requiredString(reference.sourceNodeId, `${field}.sourceNodeId`));
    if (!source) throw new Error(`${field}.sourceNodeId references a missing node.`);
    kebab(reference.relationshipType, `${field}.relationshipType`);
    const sourceFamily = kebab(reference.sourceFamily, `${field}.sourceFamily`);
    if (source.family !== undefined && source.family !== sourceFamily) throw new Error(`${field}.sourceFamily must match its source node family.`);
    requiredString(reference.field, `${field}.field`);
    requiredString(reference.matchedValue, `${field}.matchedValue`);
    kebab(reference.expectedTargetFamily, `${field}.expectedTargetFamily`);
  });
  return unresolved.length;
}

/** Coverage is self-closing: it must declare every family that appears on a resource node. */
function validateCoverage(value: unknown, regions: ReadonlySet<string>, outputAt: number, nodes: ReadonlyMap<string, ValidatedNode>): void {
  const coverage = asRecord(value, 'artifact.coverage');
  assertExactKeys(coverage, ['families'], 'artifact.coverage');
  const declared = new Map<string, { regions: Set<string>; emptyScope: boolean }>();
  asArray(coverage.families, 'artifact.coverage.families').forEach((entry, index) => {
    const field = `artifact.coverage.families[${index}]`;
    const family = asRecord(entry, field);
    assertExactKeys(family, ['family', 'regions', 'status', 'lastSuccessfulRefreshAt', 'emptyScope', 'reason'], field);
    const name = kebab(family.family, `${field}.family`);
    if (declared.has(name)) throw new Error('artifact.coverage family identities must not contain duplicates.');
    const familyRegions = asArray(family.regions, `${field}.regions`, true).map((region, regionIndex) =>
      requiredString(region, `${field}.regions[${regionIndex}]`)
    );
    assertUnique(familyRegions, `${field}.regions`);
    if (familyRegions.some(region => !regions.has(region))) throw new Error(`${field}.regions must be within artifact scope Regions.`);
    let emptyScope = false;
    if (requiredEnum(family.status, ['available', 'incomplete'], `${field}.status`) === 'available') {
      const refreshedAt = isoTimestamp(family.lastSuccessfulRefreshAt, `${field}.lastSuccessfulRefreshAt`);
      if (Date.parse(refreshedAt) > outputAt) throw new Error(`${field}.lastSuccessfulRefreshAt must not be newer than the artifact generation.`);
      emptyScope = requiredBoolean(family.emptyScope, `${field}.emptyScope`);
      if (family.reason !== undefined) throw new Error(`${field}.reason is not allowed for available coverage.`);
    } else {
      requiredEnum(family.reason, CAPABILITY_REASON_CODES, `${field}.reason`);
      if (family.lastSuccessfulRefreshAt !== undefined || family.emptyScope !== undefined)
        throw new Error(`${field} incomplete coverage cannot claim successful refresh evidence.`);
    }
    declared.set(name, { regions: new Set(familyRegions), emptyScope });
  });
  nodes.forEach((node, id) => {
    if (node.kind !== 'resource') return;
    const family = declared.get(node.family as string);
    if (!family) throw new Error(`artifact.coverage must declare family ${node.family} of resource node ${id}.`);
    if (!family.regions.has(node.region as string)) throw new Error(`artifact.coverage for ${node.family} must include Region ${node.region}.`);
    if (family.emptyScope) throw new Error(`artifact.coverage for ${node.family} claims an empty scope but resource node ${id} exists.`);
  });
}

function validateStats(value: unknown, nodeCount: number, edgeCount: number, unresolvedCount: number): void {
  const stats = asRecord(value, 'artifact.stats');
  assertExactKeys(stats, ['totalNodes', 'totalEdges', 'unresolvedCount', 'truncated', 'truncation', 'buildMs', 'snapshotBytes'], 'artifact.stats');
  assertValue(nonNegativeInteger(stats.totalNodes, 'artifact.stats.totalNodes'), nodeCount, 'artifact.stats.totalNodes');
  assertValue(nonNegativeInteger(stats.totalEdges, 'artifact.stats.totalEdges'), edgeCount, 'artifact.stats.totalEdges');
  assertValue(nonNegativeInteger(stats.unresolvedCount, 'artifact.stats.unresolvedCount'), unresolvedCount, 'artifact.stats.unresolvedCount');
  if (requiredBoolean(stats.truncated, 'artifact.stats.truncated')) {
    const truncation = asRecord(stats.truncation, 'artifact.stats.truncation');
    const counts = ['edgesDroppedCount', 'unresolvedDroppedCount', 'tagsRemovedFromNodeCount'] as const;
    assertExactKeys(truncation, ['reason', ...counts], 'artifact.stats.truncation');
    assertValue(truncation.reason, 'snapshot-size-limit', 'artifact.stats.truncation.reason');
    if (counts.map(key => nonNegativeInteger(truncation[key], `artifact.stats.truncation.${key}`)).every(count => count === 0))
      throw new Error('artifact.stats.truncation must report at least one omitted item.');
  } else if (stats.truncation !== undefined) {
    throw new Error('artifact.stats.truncation is only allowed when truncated is true.');
  }
  if (stats.buildMs !== undefined) nonNegativeInteger(stats.buildMs, 'artifact.stats.buildMs');
  if (stats.snapshotBytes !== undefined) nonNegativeInteger(stats.snapshotBytes, 'artifact.stats.snapshotBytes');
}

/** Rejects non-plain JSON everywhere, applying the provider key guard with attribute context. */
function assertPublicGraphJson(artifact: JsonRecord, isForbiddenKey?: (key: string, inAttributes: boolean) => boolean): void {
  const { nodes, ...envelope } = artifact;
  assertPlainJson(envelope, 'artifact', key => isForbiddenKey?.(key, false) ?? false);
  (nodes as JsonRecord[]).forEach((node, index) => {
    const { attributes, ...rest } = node;
    assertPlainJson(rest, `artifact.nodes[${index}]`, key => isForbiddenKey?.(key, false) ?? false);
    if (attributes !== undefined) assertPlainJson(attributes, `artifact.nodes[${index}].attributes`, key => isForbiddenKey?.(key, true) ?? false);
  });
}
