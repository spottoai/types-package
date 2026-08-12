import {
  AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES,
  AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME,
  AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION,
  AWS_PORTAL_RELATIONSHIP_SYNTHETIC_TYPES,
  AWS_PORTAL_RELATIONSHIP_TYPES,
  type AwsPortalRelationshipArtifact,
} from './portalRelationshipPublicArtifacts';
import { validateAwsPortalRelationshipResourceNode } from './portalRelationshipResourceNodeValidation';
import { validateAwsPortalBillingBlock } from './portalPublicArtifactEvidenceValidation';
import {
  asRecord,
  assertExactKeys,
  assertPublicJson,
  assertUnique,
  assertValue,
  isoTimestamp,
  nonNegativeInteger,
  regionArray,
  requiredBoolean,
  requiredEnum,
  requiredString,
  validateGeneration,
  validatePortalEnvelope,
  validateResourceScope,
} from './portalPublicArtifactValidationCommon';
import { assertAccount, sha256 } from './pluginPublicArtifactValidationHelpers';

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
] as const;

/** Validates one untrusted, lossless AWS relationship Portal artifact. */
export function validateAwsPortalRelationshipArtifact(value: unknown): AwsPortalRelationshipArtifact {
  const artifact = asRecord(value, 'artifact');
  const { accountId, portalGeneratedAt, bodyGeneratedAt } = validatePortalEnvelope(artifact, 'relationships', CURRENT_KEYS);
  assertValue(artifact.relationshipSchemaVersion, AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION, 'artifact.relationshipSchemaVersion');
  assertValue(artifact.logicalName, AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME, 'artifact.logicalName');
  validateSource(artifact.source, bodyGeneratedAt, portalGeneratedAt);
  const regions = validateScope(artifact.scope, accountId);
  const regionSet = new Set(regions);
  if (artifact.currency !== undefined) requiredString(artifact.currency, 'artifact.currency');
  if (artifact.currencySymbol !== undefined) requiredString(artifact.currencySymbol, 'artifact.currencySymbol');
  const nodes = validateNodes(artifact.nodes, accountId, regions, regionSet);
  validateEdges(artifact.edges, nodes);
  validateUnresolved(artifact.unresolved, nodes);
  validateCoverage(artifact.coverage, regions, portalGeneratedAt);
  const matchedBillingNodeCount =
    artifact.costOverlay === undefined
      ? undefined
      : validateCostOverlay(artifact.costOverlay, accountId, regions, portalGeneratedAt, nodes.resourceCount);
  if (nodes.billingNodeCount > 0 && matchedBillingNodeCount === undefined)
    throw new Error('artifact.costOverlay is required when resource nodes contain billing.');
  if (matchedBillingNodeCount !== undefined && matchedBillingNodeCount !== nodes.billingNodeCount)
    throw new Error('artifact.costOverlay matched count must equal resource nodes containing billing.');
  validateStats(
    artifact.stats,
    asArray(artifact.nodes, 'artifact.nodes').length,
    asArray(artifact.edges, 'artifact.edges').length,
    asArray(artifact.unresolved, 'artifact.unresolved').length
  );
  assertPublicJson(artifact, 'artifact');
  return value as AwsPortalRelationshipArtifact;
}

function validateSource(value: unknown, bodyGeneratedAt: string, portalGeneratedAt: string): void {
  const source = asRecord(value, 'artifact.source');
  assertExactKeys(source, ['artifactType', 'artifactVersion', 'generatedAt'], 'artifact.source');
  assertValue(source.artifactType, 'relationship-graph', 'artifact.source.artifactType');
  assertValue(source.artifactVersion, 1, 'artifact.source.artifactVersion');
  const generatedAt = isoTimestamp(source.generatedAt, 'artifact.source.generatedAt');
  assertValue(generatedAt, bodyGeneratedAt, 'artifact.source.generatedAt');
  if (Date.parse(generatedAt) > Date.parse(portalGeneratedAt)) throw new Error('artifact.source generation cannot exceed Portal output.');
}

function validateScope(value: unknown, accountId: string): string[] {
  const scope = asRecord(value, 'artifact.scope');
  assertExactKeys(scope, ['provider', 'accountId', 'resourceRegions'], 'artifact.scope');
  assertValue(scope.provider, 'aws', 'artifact.scope.provider');
  assertAccount(scope.accountId, accountId, 'artifact.scope.accountId');
  return regionArray(scope.resourceRegions, 'artifact.scope.resourceRegions');
}

type ValidatedNode = {
  kind: 'account' | 'region' | 'resource' | 'synthetic';
  resourceRegion?: string;
};

type ValidatedNodes = {
  byId: Map<string, ValidatedNode>;
  resourceCount: number;
  billingNodeCount: number;
};

function validateNodes(value: unknown, accountId: string, regions: string[], regionSet: ReadonlySet<string>): ValidatedNodes {
  const nodes = asArray(value, 'artifact.nodes');
  const byId = new Map<string, ValidatedNode>();
  const regionNodes: string[] = [];
  let accountNodeCount = 0;
  let resourceCount = 0;
  let billingNodeCount = 0;
  nodes.forEach((entry, index) => {
    const field = `artifact.nodes[${index}]`;
    const node = asRecord(entry, field);
    assertExactKeys(node, ['id', 'kind', 'data'], field);
    const id = requiredString(node.id, `${field}.id`);
    if (byId.has(id)) throw new Error('artifact node ids must be unique.');
    const kind = requiredEnum(node.kind, ['account', 'region', 'resource', 'synthetic'], `${field}.kind`);
    const data = asRecord(node.data, `${field}.data`);
    validateNodeBinding(data, accountId, `${field}.data`);
    if (kind === 'account') {
      accountNodeCount += 1;
      assertExactKeys(data, ['provider', 'accountId', 'displayName'], `${field}.data`);
      if (data.displayName !== undefined) requiredString(data.displayName, `${field}.data.displayName`);
    } else if (kind === 'region') {
      assertExactKeys(data, ['provider', 'accountId', 'resourceRegion', 'displayName'], `${field}.data`);
      const region = validateNodeRegion(data, regionSet, `${field}.data`);
      regionNodes.push(region);
      if (data.displayName !== undefined) requiredString(data.displayName, `${field}.data.displayName`);
    } else if (kind === 'synthetic') {
      assertExactKeys(data, ['provider', 'accountId', 'resourceRegion', 'syntheticType', 'identifier', 'displayName'], `${field}.data`);
      const resourceRegion = validateNodeRegion(data, regionSet, `${field}.data`);
      requiredEnum(data.syntheticType, AWS_PORTAL_RELATIONSHIP_SYNTHETIC_TYPES, `${field}.data.syntheticType`);
      requiredString(data.identifier, `${field}.data.identifier`);
      if (data.displayName !== undefined) requiredString(data.displayName, `${field}.data.displayName`);
      byId.set(id, { kind, resourceRegion });
      return;
    } else {
      validateAwsPortalRelationshipResourceNode(data, accountId, regionSet, `${field}.data`);
      resourceCount += 1;
      if (data.billing !== undefined) billingNodeCount += 1;
      byId.set(id, { kind, resourceRegion: String(data.resourceRegion) });
      return;
    }
    byId.set(id, kind === 'region' ? { kind, resourceRegion: String(data.resourceRegion) } : { kind });
  });
  if (accountNodeCount !== 1) throw new Error('artifact must contain exactly one account node.');
  assertUnique(regionNodes, 'artifact Region nodes');
  assertExactRegionSet(regionNodes, regions, 'artifact Region nodes');
  return { byId, resourceCount, billingNodeCount };
}

function validateNodeBinding(data: Record<string, unknown>, accountId: string, field: string): void {
  assertValue(data.provider, 'aws', `${field}.provider`);
  assertAccount(data.accountId, accountId, `${field}.accountId`);
}

function validateNodeRegion(data: Record<string, unknown>, regions: ReadonlySet<string>, field: string): string {
  const region = requiredString(data.resourceRegion, `${field}.resourceRegion`);
  if (!regions.has(region)) throw new Error(`${field}.resourceRegion is outside artifact scope.`);
  return region;
}

const STRUCTURAL_RELATIONSHIPS = {
  'account-region': ['region', 'account'],
  'region-resource': ['resource', 'region'],
  'region-topology': ['synthetic', 'region'],
} as const;

function validateEdges(value: unknown, nodes: ValidatedNodes): void {
  const edges = asArray(value, 'artifact.edges');
  const ids = new Set<string>();
  const structuralParents = new Map<string, number>();
  edges.forEach((entry, index) => {
    const field = `artifact.edges[${index}]`;
    const edge = asRecord(entry, field);
    assertExactKeys(edge, ['id', 'from', 'to', 'kind', 'relationshipTypes', 'confidence', 'evidence'], field);
    const id = requiredString(edge.id, `${field}.id`);
    if (ids.has(id)) throw new Error('artifact edge ids must be unique.');
    ids.add(id);
    const from = requiredString(edge.from, `${field}.from`);
    const to = requiredString(edge.to, `${field}.to`);
    const fromNode = nodes.byId.get(from);
    const toNode = nodes.byId.get(to);
    if (!fromNode || !toNode) throw new Error(`${field} references a missing node.`);
    if (from === to) throw new Error(`${field} must not be a self edge.`);
    const kind = requiredEnum(edge.kind, ['contains', 'depends_on'], `${field}.kind`);
    const relationshipTypes = nonEmptyStringEnumArray(edge.relationshipTypes, AWS_PORTAL_RELATIONSHIP_TYPES, `${field}.relationshipTypes`);
    assertValue(edge.confidence, 'high', `${field}.confidence`);
    validateEdgeEvidence(edge.evidence, `${field}.evidence`);
    const structuralTypes = relationshipTypes.filter(isStructuralRelationship);
    if (structuralTypes.length > 0) {
      if (kind !== 'contains' || structuralTypes.length !== relationshipTypes.length)
        throw new Error(`${field} structural relationship types require a contains edge.`);
      structuralTypes.forEach(type => validateContainmentDirection(type, fromNode.kind, toNode.kind, field));
      structuralParents.set(from, (structuralParents.get(from) ?? 0) + 1);
    } else {
      if (kind !== 'depends_on') throw new Error(`${field} dependency relationship types require a depends_on edge.`);
      if (fromNode.kind !== 'resource' || (toNode.kind !== 'resource' && toNode.kind !== 'synthetic'))
        throw new Error(`${field} dependency edges must connect a resource to a resource or synthetic node.`);
      if (fromNode.resourceRegion !== toNode.resourceRegion) throw new Error(`${field} dependency edge crosses resource Regions.`);
    }
  });
  nodes.byId.forEach((node, id) => {
    const expected = node.kind === 'account' ? 0 : 1;
    if ((structuralParents.get(id) ?? 0) !== expected)
      throw new Error(`artifact node ${id} must have exactly ${expected} structural parent edge${expected === 1 ? '' : 's'}.`);
  });
}

function isStructuralRelationship(value: string): value is keyof typeof STRUCTURAL_RELATIONSHIPS {
  return value in STRUCTURAL_RELATIONSHIPS;
}

function validateEdgeEvidence(value: unknown, field: string): void {
  const evidence = asArray(value, field, true);
  evidence.forEach((entry, index) => {
    const itemField = `${field}[${index}]`;
    const item = asRecord(entry, itemField);
    assertExactKeys(item, ['method', 'sourceFamily', 'field', 'matchedValue'], itemField);
    requiredEnum(item.method, ['field-derived', 'field-reference', 'persisted-inventory', 'request-scope'], `${itemField}.method`);
    requiredEnum(item.sourceFamily, [...AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES, 'graph-scope'], `${itemField}.sourceFamily`);
    if (item.field !== undefined) requiredString(item.field, `${itemField}.field`);
    if (item.matchedValue !== undefined) requiredString(item.matchedValue, `${itemField}.matchedValue`);
  });
}

function validateContainmentDirection(
  relationshipType: keyof typeof STRUCTURAL_RELATIONSHIPS,
  fromKind: string,
  toKind: string,
  field: string
): void {
  const [expectedFrom, expectedTo] = STRUCTURAL_RELATIONSHIPS[relationshipType];
  if (fromKind !== expectedFrom || toKind !== expectedTo) throw new Error(`${field} ${relationshipType} containment must point child to parent.`);
}

function validateUnresolved(value: unknown, nodes: ValidatedNodes): void {
  const expectedFamilies = [
    'ec2-instance',
    'vpc',
    'subnet',
    'internet-gateway',
    'virtual-private-gateway',
    'security-group',
    'rds-db-cluster',
    'rds-db-instance',
  ] as const;
  asArray(value, 'artifact.unresolved').forEach((entry, index) => {
    const field = `artifact.unresolved[${index}]`;
    const unresolved = asRecord(entry, field);
    assertExactKeys(unresolved, ['sourceNodeId', 'relationshipType', 'sourceFamily', 'field', 'matchedValue', 'expectedTargetFamily'], field);
    const sourceNodeId = requiredString(unresolved.sourceNodeId, `${field}.sourceNodeId`);
    if (!nodes.byId.has(sourceNodeId)) throw new Error(`${field}.sourceNodeId references a missing node.`);
    requiredEnum(unresolved.relationshipType, AWS_PORTAL_RELATIONSHIP_TYPES, `${field}.relationshipType`);
    requiredEnum(unresolved.sourceFamily, AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES, `${field}.sourceFamily`);
    requiredString(unresolved.field, `${field}.field`);
    requiredString(unresolved.matchedValue, `${field}.matchedValue`);
    requiredEnum(unresolved.expectedTargetFamily, expectedFamilies, `${field}.expectedTargetFamily`);
  });
}

function validateCoverage(value: unknown, regions: string[], portalGeneratedAt: string): void {
  const coverage = asRecord(value, 'artifact.coverage');
  assertExactKeys(coverage, ['families'], 'artifact.coverage');
  const familyNames: string[] = [];
  asArray(coverage.families, 'artifact.coverage.families').forEach((entry, index) => {
    const field = `artifact.coverage.families[${index}]`;
    const family = asRecord(entry, field);
    assertExactKeys(family, ['family', 'resourceRegions', 'status', 'lastSuccessfulRefreshAt', 'emptyScope', 'reason'], field);
    const familyName = requiredEnum(family.family, AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES, `${field}.family`);
    familyNames.push(familyName);
    const familyRegions = regionArray(family.resourceRegions, `${field}.resourceRegions`);
    assertExactRegionSet(familyRegions, regions, `${field}.resourceRegions`);
    const status = requiredEnum(family.status, ['available', 'incomplete'], `${field}.status`);
    if (status === 'available') {
      const refreshedAt = isoTimestamp(family.lastSuccessfulRefreshAt, `${field}.lastSuccessfulRefreshAt`);
      if (Date.parse(refreshedAt) > Date.parse(portalGeneratedAt)) throw new Error(`${field}.lastSuccessfulRefreshAt cannot exceed Portal output.`);
      requiredBoolean(family.emptyScope, `${field}.emptyScope`);
      if (family.reason !== undefined) throw new Error(`${field}.reason is not allowed for available coverage.`);
    } else {
      assertValue(family.reason, 'source-refresh-incomplete', `${field}.reason`);
      if (family.lastSuccessfulRefreshAt !== undefined || family.emptyScope !== undefined)
        throw new Error(`${field} incomplete coverage cannot claim successful refresh evidence.`);
    }
  });
  assertUnique(familyNames, 'artifact.coverage family identities');
  if (
    familyNames.length !== AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES.length ||
    AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES.some(family => !familyNames.includes(family))
  )
    throw new Error('artifact.coverage must declare every relationship family.');
}

function validateCostOverlay(value: unknown, accountId: string, regions: string[], portalGeneratedAt: string, resourceNodeCount: number): number {
  const overlay = asRecord(value, 'artifact.costOverlay');
  assertExactKeys(overlay, ['source', 'coverage', 'billing'], 'artifact.costOverlay');
  const source = asRecord(overlay.source, 'artifact.costOverlay.source');
  assertExactKeys(source, ['artifactType', 'logicalName', 'artifactGeneration', 'sha256', 'scope'], 'artifact.costOverlay.source');
  assertValue(source.artifactType, 'resource-collection', 'artifact.costOverlay.source.artifactType');
  assertValue(source.logicalName, 'resources.json.gz', 'artifact.costOverlay.source.logicalName');
  const generation = validateGeneration(source.artifactGeneration, 'artifact.costOverlay.source.artifactGeneration');
  if (Date.parse(generation.generatedAt) > Date.parse(portalGeneratedAt)) throw new Error('artifact.costOverlay source cannot exceed Portal output.');
  sha256(source.sha256, 'artifact.costOverlay.source.sha256');
  const sourceScope = validateResourceScope(source.scope, accountId, 'artifact.costOverlay.source.scope');
  assertExactRegionSet(sourceScope.resourceRegions, regions, 'artifact.costOverlay.source.scope.resourceRegions');
  const coverage = asRecord(overlay.coverage, 'artifact.costOverlay.coverage');
  const coverageKeys = ['totalResourceCount', 'billedResourceCount', 'matchedResourceNodeCount', 'unmatchedBillingExpenseCount'] as const;
  assertExactKeys(coverage, coverageKeys, 'artifact.costOverlay.coverage');
  coverageKeys.forEach(key => nonNegativeInteger(coverage[key], `artifact.costOverlay.coverage.${key}`));
  if (Number(coverage.billedResourceCount) > Number(coverage.totalResourceCount))
    throw new Error('artifact.costOverlay billed count exceeds resource count.');
  if (Number(coverage.matchedResourceNodeCount) > Number(coverage.billedResourceCount))
    throw new Error('artifact.costOverlay matched count exceeds billed count.');
  if (Number(coverage.matchedResourceNodeCount) > resourceNodeCount)
    throw new Error('artifact.costOverlay matched count exceeds graph resource node count.');
  validateAwsPortalBillingBlock(overlay.billing, 'artifact.costOverlay.billing', sourceScope.billing, accountId, false);
  return Number(coverage.matchedResourceNodeCount);
}

function validateStats(value: unknown, nodeCount: number, edgeCount: number, unresolvedCount: number): void {
  const stats = asRecord(value, 'artifact.stats');
  assertExactKeys(stats, ['totalNodes', 'totalEdges', 'unresolvedCount', 'truncated', 'truncation', 'buildMs', 'snapshotBytes'], 'artifact.stats');
  nonNegativeInteger(stats.totalNodes, 'artifact.stats.totalNodes');
  nonNegativeInteger(stats.totalEdges, 'artifact.stats.totalEdges');
  nonNegativeInteger(stats.unresolvedCount, 'artifact.stats.unresolvedCount');
  assertValue(stats.totalNodes, nodeCount, 'artifact.stats.totalNodes');
  assertValue(stats.totalEdges, edgeCount, 'artifact.stats.totalEdges');
  assertValue(stats.unresolvedCount, unresolvedCount, 'artifact.stats.unresolvedCount');
  const truncated = requiredBoolean(stats.truncated, 'artifact.stats.truncated');
  if (truncated) {
    const truncation = asRecord(stats.truncation, 'artifact.stats.truncation');
    assertExactKeys(truncation, ['reason', 'edgesDroppedCount', 'unresolvedDroppedCount', 'tagsRemovedFromNodeCount'], 'artifact.stats.truncation');
    assertValue(truncation.reason, 'snapshot-size-limit', 'artifact.stats.truncation.reason');
    const dropped = ['edgesDroppedCount', 'unresolvedDroppedCount', 'tagsRemovedFromNodeCount'].map(key =>
      nonNegativeInteger(truncation[key], `artifact.stats.truncation.${key}`)
    );
    if (dropped.every(count => count === 0)) throw new Error('artifact.stats.truncation must report at least one omitted item.');
  } else if (stats.truncation !== undefined) {
    throw new Error('artifact.stats.truncation is only allowed when truncated is true.');
  }
  if (stats.buildMs !== undefined) nonNegativeInteger(stats.buildMs, 'artifact.stats.buildMs');
  if (stats.snapshotBytes !== undefined) nonNegativeInteger(stats.snapshotBytes, 'artifact.stats.snapshotBytes');
}

function assertExactRegionSet(actual: string[], expected: string[], field: string): void {
  const actualSet = new Set(actual);
  if (actualSet.size !== expected.length || expected.some(region => !actualSet.has(region)))
    throw new Error(`${field} must exactly match artifact scope Regions.`);
}

function nonEmptyStringEnumArray<const Value extends string>(value: unknown, allowed: readonly Value[], field: string): Value[] {
  const values = asArray(value, field, true).map((entry, index) => requiredEnum(entry, allowed, `${field}[${index}]`));
  assertUnique(values, field);
  return values;
}

function asArray(value: unknown, field: string, nonEmpty = false): unknown[] {
  if (!Array.isArray(value) || (nonEmpty && value.length === 0)) throw new Error(`${field} must be ${nonEmpty ? 'a non-empty' : 'an'} array.`);
  return value;
}
