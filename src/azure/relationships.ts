export type RelationshipSnapshotNodeKind = 'subscription' | 'resourceGroup' | 'resource' | 'location' | 'availabilityZone' | 'managementGroup';

export type RelationshipSnapshotEdgeKind = 'contains' | 'depends_on';

export interface RelationshipSnapshotCostOverlay {
  spend30d?: number;
  spend30dAmortized?: number;
}

export interface RelationshipSnapshotNodeData {
  resourceGroup?: string;
  name?: string;
  type?: string;
  location?: string;
  tags?: Record<string, string>;
  placeholder?: boolean;
  displayName?: string;
  icon?: string;
  label1?: string;
  label2?: string;
  label3?: string;
  properties?: Record<string, unknown>;
}

export interface RelationshipSnapshotNode {
  id: string;
  kind: RelationshipSnapshotNodeKind;
  data: RelationshipSnapshotNodeData;
  cost?: RelationshipSnapshotCostOverlay;
}

export interface RelationshipSnapshotEdgeEvidence {
  method: string;
  ruleName?: string;
  propertyPath?: string;
  matchedValue?: string;
}

export interface RelationshipSnapshotEdge {
  id: string;
  from: string;
  to: string;
  kind: RelationshipSnapshotEdgeKind;
  relationshipTypes: string[];
  confidence: number;
  evidence: RelationshipSnapshotEdgeEvidence[];
  costImpact?: {
    type: 'full' | 'partial' | 'indirect' | 'none';
    weight?: number;
    category?: string;
    description?: string;
  };
}

export interface UnresolvedRelationshipReference {
  sourceId: string;
  ruleName?: string;
  propertyPath?: string;
  value: string;
  resolverTried?: string;
  reason?: string;
}

export interface RelationshipSnapshotStats {
  totalNodes: number;
  totalEdges: number;
  unresolvedCount: number;
  buildMs: number;
  unresolvedTruncated?: boolean;
  edgesTruncated?: boolean;
  edgesDroppedCount?: number;
  snapshotBytes?: number;
}

export interface RelationshipSnapshot {
  schemaVersion: 1;
  generatedAt: string;
  subscriptionId: string;
  currency?: string;
  currencySymbol?: string;
  nodes: RelationshipSnapshotNode[];
  edges: RelationshipSnapshotEdge[];
  unresolved: UnresolvedRelationshipReference[];
  stats: RelationshipSnapshotStats;
}

export const RELATIONSHIP_GRAPH_MANIFEST_SCHEMA_VERSION = 1;

export const RELATIONSHIP_GRAPH_INDEX_SCHEMA_VERSION = 1;

export type RelationshipGraphServingMode = 'full' | 'partitioned';

export type RelationshipGraphArtifactPath = string;

export type RelationshipSubgraphScopeType = 'overview' | 'subscription' | 'resourceGroup' | 'resource' | 'network';

export type RelationshipSubgraphViewMode =
  | 'architectural'
  | 'network'
  | 'security'
  | 'cost'
  | 'relationships'
  | 'resource-detail'
  | 'overview';

export interface RelationshipGraphPartitionThresholds {
  nodes: number;
  edges: number;
  snapshotBytes: number;
}

export interface RelationshipGraphManifestStats {
  nodes: number;
  edges: number;
  unresolvedCount?: number;
  buildMs?: number;
  snapshotBytes?: number;
}

export interface RelationshipGraphEntrypoints {
  full: RelationshipGraphArtifactPath;
  index?: RelationshipGraphArtifactPath;
  overview?: RelationshipGraphArtifactPath;
  resourceGroupTemplate?: RelationshipGraphArtifactPath;
  resourceTemplate?: RelationshipGraphArtifactPath;
  networkTemplate?: RelationshipGraphArtifactPath;
}

export interface RelationshipGraphManifest {
  schemaVersion: typeof RELATIONSHIP_GRAPH_MANIFEST_SCHEMA_VERSION;
  subscriptionId: string;
  generatedAt: string;
  snapshotId: string;
  mode: RelationshipGraphServingMode;
  stats: RelationshipGraphManifestStats;
  entrypoints: RelationshipGraphEntrypoints;
  thresholds?: RelationshipGraphPartitionThresholds;
  currency?: string;
  currencySymbol?: string;
}

export interface RelationshipGraphSourceSnapshot {
  schemaVersion: RelationshipSnapshot['schemaVersion'];
  subscriptionId: string;
  generatedAt: string;
  snapshotId: string;
  path: RelationshipGraphArtifactPath;
  stats: RelationshipGraphManifestStats;
}

export interface RelationshipSubgraphScope {
  type: RelationshipSubgraphScopeType;
  subscriptionId: string;
  rootNodeId?: string;
  resourceGroup?: string;
  viewMode?: RelationshipSubgraphViewMode;
  maxHops?: number;
}

export interface RelationshipSubgraphReturnedStats {
  nodes: number;
  edges: number;
  omittedNodes: number;
  omittedEdges: number;
  snapshotBytes?: number;
}

export interface RelationshipSubgraphBreadcrumbItem {
  id: string;
  label: string;
  level?: number;
  subscriptionId?: string;
  resourceGroup?: string;
  resourceType?: string;
}

export type RelationshipSubgraphSummaryKind =
  | 'hiddenChildren'
  | 'hiddenEdges'
  | 'resourceTypeGroup'
  | 'resourceGroup'
  | 'networkGroup'
  | 'externalReferences';

export interface RelationshipSubgraphSummary {
  id: string;
  kind: RelationshipSubgraphSummaryKind;
  parentId?: string;
  label?: string;
  count: number;
  nextCursor?: string;
}

export interface RelationshipSubgraphSnapshot extends RelationshipSnapshot {
  scope: RelationshipSubgraphScope;
  sourceSnapshot: RelationshipGraphSourceSnapshot;
  fullGraphStats: RelationshipGraphManifestStats;
  returnedStats: RelationshipSubgraphReturnedStats;
  breadcrumbs?: RelationshipSubgraphBreadcrumbItem[];
  summaries?: RelationshipSubgraphSummary[];
}

export interface RelationshipGraphIndexNode {
  id: string;
  kind: RelationshipSnapshotNodeKind;
  subscriptionId?: string;
  resourceGroup?: string;
  resourceType?: string;
  location?: string;
  parentIds?: string[];
  childIds?: string[];
  neighborIds?: string[];
  subgraphs?: Partial<Record<RelationshipSubgraphScopeType, RelationshipGraphArtifactPath>>;
}

export interface RelationshipGraphIndexScope {
  id: string;
  type: RelationshipSubgraphScopeType;
  path: RelationshipGraphArtifactPath;
  title?: string;
  rootNodeId?: string;
  resourceGroup?: string;
  stats: RelationshipSubgraphReturnedStats;
}

export interface RelationshipGraphIndex {
  schemaVersion: typeof RELATIONSHIP_GRAPH_INDEX_SCHEMA_VERSION;
  subscriptionId: string;
  generatedAt: string;
  snapshotId: string;
  sourceSnapshot: RelationshipGraphSourceSnapshot;
  nodes: RelationshipGraphIndexNode[];
  scopes: RelationshipGraphIndexScope[];
}
