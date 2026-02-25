export type RelationshipSnapshotNodeKind =
  'subscription' | 'resourceGroup' | 'resource' | 'location' | 'availabilityZone' | 'managementGroup';

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
