import type { ArtifactGeneration } from '../common/artifactGeneration';
import type { RelationshipSnapshotCostOverlay, RelationshipSnapshotEdge, RelationshipSnapshotStats, UnresolvedRelationshipReference } from '../azure/relationships';
import type { AwsPublicArtifactEnvelope, AwsPublicArtifactForbiddenCredentialFields } from './publicArtifacts';
import type { AwsPortalResourceCollectionBody, AwsPortalResourceCollectionScope } from './portalPublicArtifacts';
import type { AwsPortalRelationshipResourceNodeData } from './portalRelationshipResourceNodeTypes';
export declare const AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME: "relationships.json.gz";
export declare const AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION: 2;
export declare const AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES: readonly ["ec2-instance", "ebs-volume", "vpc", "subnet", "route-table", "internet-gateway", "virtual-private-gateway", "network-interface", "nat-gateway", "security-group", "rds-db-cluster", "rds-db-instance", "load-balancer-v2", "classic-load-balancer", "elasticache-cache-cluster", "elasticache-serverless-cache", "efs-file-system"];
export declare const AWS_PORTAL_RELATIONSHIP_SYNTHETIC_TYPES: readonly ["vpc", "subnet", "availability-zone", "db-subnet-group", "db-cluster", "elasticache-replication-group", "elasticache-global-datastore", "kms-key", "snapshot"];
export declare const AWS_PORTAL_RELATIONSHIP_TYPES: readonly ["account-region", "region-resource", "region-topology", "vpc-membership", "subnet-membership", "availability-zone-placement", "kms-key-encryption", "ebs-snapshot-origin", "db-subnet-group-membership", "elasticache-replication-group-membership", "elasticache-global-datastore-membership", "security-group-association", "classic-load-balancer-registration", "ebs-attachment", "network-interface-attachment", "route-table-association", "gateway-route-table-association", "route-propagation-source", "rds-read-replica", "db-cluster-membership", "db-cluster-member", "security-group-peer-reference"];
export declare const AWS_PORTAL_RELATIONSHIP_CONFIDENCE_SCORES: {
    readonly high: 1;
};
export type AwsPortalRelationshipDiscoveryFamily = (typeof AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES)[number];
export type AwsPortalRelationshipSyntheticType = (typeof AWS_PORTAL_RELATIONSHIP_SYNTHETIC_TYPES)[number];
export type AwsPortalRelationshipType = (typeof AWS_PORTAL_RELATIONSHIP_TYPES)[number];
export type AwsPortalRelationshipEdgeConfidence = keyof typeof AWS_PORTAL_RELATIONSHIP_CONFIDENCE_SCORES;
export type AwsPortalRelationshipEvidenceMethod = 'field-derived' | 'field-reference' | 'persisted-inventory' | 'request-scope';
export interface AwsPortalRelationshipScope<AccountId extends string = string> {
    provider: 'aws';
    accountId: AccountId;
    resourceRegions: string[];
}
interface AwsPortalRelationshipFamilyCoverageBase {
    family: AwsPortalRelationshipDiscoveryFamily;
    resourceRegions: string[];
}
export type AwsPortalRelationshipFamilyCoverage = (AwsPortalRelationshipFamilyCoverageBase & {
    status: 'available';
    lastSuccessfulRefreshAt: string;
    emptyScope: boolean;
    reason?: never;
}) | (AwsPortalRelationshipFamilyCoverageBase & {
    status: 'incomplete';
    lastSuccessfulRefreshAt?: never;
    emptyScope?: never;
    reason: 'source-refresh-incomplete';
});
interface AwsPortalRelationshipNodeDataBase<AccountId extends string> extends AwsPublicArtifactForbiddenCredentialFields {
    provider: 'aws';
    accountId: AccountId;
}
export type AwsPortalRelationshipAccountNodeData<AccountId extends string = string> = AwsPortalRelationshipNodeDataBase<AccountId> & {
    displayName?: string;
};
export type AwsPortalRelationshipRegionNodeData<AccountId extends string = string> = AwsPortalRelationshipNodeDataBase<AccountId> & {
    resourceRegion: string;
    displayName?: string;
};
export type AwsPortalRelationshipSyntheticNodeData<AccountId extends string = string> = AwsPortalRelationshipNodeDataBase<AccountId> & {
    resourceRegion: string;
    syntheticType: AwsPortalRelationshipSyntheticType;
    identifier: string;
    displayName?: string;
};
export type AwsPortalRelationshipNode<AccountId extends string = string> = {
    id: string;
    kind: 'account';
    data: AwsPortalRelationshipAccountNodeData<AccountId>;
} | {
    id: string;
    kind: 'region';
    data: AwsPortalRelationshipRegionNodeData<AccountId>;
} | {
    id: string;
    kind: 'resource';
    data: AwsPortalRelationshipResourceNodeData<AccountId>;
} | {
    id: string;
    kind: 'synthetic';
    data: AwsPortalRelationshipSyntheticNodeData<AccountId>;
};
export type AwsPortalRelationshipNodeKind = AwsPortalRelationshipNode['kind'];
export type AwsPortalRelationshipNodeData<AccountId extends string = string> = AwsPortalRelationshipNode<AccountId>['data'];
/** @deprecated Reduced Azure-derived shape retained only for explicit migration from the former declaration. */
export type AwsPortalRelationshipLegacyNodeData<AccountId extends string = string> = AwsPublicArtifactForbiddenCredentialFields & {
    accountId: AccountId;
    region?: string;
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
    resourceGroup?: never;
    properties?: never;
};
/** @deprecated Use `AwsPortalRelationshipNode` in new producers and consumers. */
export interface AwsPortalRelationshipLegacyNode<AccountId extends string = string> {
    id: string;
    kind: 'account' | 'region' | 'resource' | 'location' | 'availabilityZone';
    data: AwsPortalRelationshipLegacyNodeData<AccountId>;
    cost?: RelationshipSnapshotCostOverlay;
}
export type AwsPortalRelationshipEdgeKind = 'contains' | 'depends_on';
export interface AwsPortalRelationshipEdgeEvidence {
    method: AwsPortalRelationshipEvidenceMethod;
    sourceFamily: AwsPortalRelationshipDiscoveryFamily | 'graph-scope';
    field?: string;
    matchedValue?: string;
}
/** `contains` edges point from the child to its parent. */
export interface AwsPortalRelationshipEdge {
    id: string;
    from: string;
    to: string;
    kind: AwsPortalRelationshipEdgeKind;
    relationshipTypes: [AwsPortalRelationshipType, ...AwsPortalRelationshipType[]];
    confidence: AwsPortalRelationshipEdgeConfidence;
    evidence: [AwsPortalRelationshipEdgeEvidence, ...AwsPortalRelationshipEdgeEvidence[]];
}
export interface AwsPortalRelationshipUnresolvedReference {
    sourceNodeId: string;
    relationshipType: AwsPortalRelationshipType;
    sourceFamily: AwsPortalRelationshipDiscoveryFamily;
    field: string;
    matchedValue: string;
    expectedTargetFamily: 'ec2-instance' | 'vpc' | 'subnet' | 'internet-gateway' | 'virtual-private-gateway' | 'security-group' | 'rds-db-cluster' | 'rds-db-instance';
}
export interface AwsPortalRelationshipCostOverlay<AccountId extends string = string> {
    source: {
        artifactType: 'resource-collection';
        logicalName: 'resources.json.gz';
        artifactGeneration: ArtifactGeneration;
        sha256: string;
        scope: AwsPortalResourceCollectionScope<AccountId>;
    };
    coverage: {
        totalResourceCount: number;
        billedResourceCount: number;
        matchedResourceNodeCount: number;
        unmatchedBillingExpenseCount: number;
    };
    billing: AwsPortalResourceCollectionBody<AccountId>['coverage']['billing'];
}
interface AwsPortalRelationshipStatsBase {
    totalNodes: number;
    totalEdges: number;
    unresolvedCount: number;
    buildMs?: number;
    snapshotBytes?: number;
}
export type AwsPortalRelationshipStats = AwsPortalRelationshipStatsBase & ({
    truncated: false;
    truncation?: never;
} | {
    truncated: true;
    truncation: {
        reason: 'snapshot-size-limit';
        edgesDroppedCount: number;
        unresolvedDroppedCount: number;
        tagsRemovedFromNodeCount: number;
    };
});
export type AwsPortalRelationshipArtifactV2<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<'relationships', AccountId, RunId> & {
    portalSchemaVersion: 1;
    relationshipSchemaVersion: typeof AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION;
    logicalName: typeof AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME;
    generatedAt: string;
    source: {
        artifactType: 'relationship-graph';
        artifactVersion: 1;
        generatedAt: string;
    };
    scope: AwsPortalRelationshipScope<AccountId>;
    currency?: string;
    currencySymbol?: string;
    nodes: AwsPortalRelationshipNode<AccountId>[];
    edges: AwsPortalRelationshipEdge[];
    unresolved: AwsPortalRelationshipUnresolvedReference[];
    coverage: {
        families: AwsPortalRelationshipFamilyCoverage[];
    };
    costOverlay?: AwsPortalRelationshipCostOverlay<AccountId>;
    stats: AwsPortalRelationshipStats;
};
/** @deprecated Former reduced declaration; it has no qualified Portal v2 wire metadata. */
export type AwsPortalRelationshipArtifactV1<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<'relationships', AccountId, RunId> & {
    generatedAt: string;
    currency?: string;
    currencySymbol?: string;
    nodes: AwsPortalRelationshipLegacyNode<AccountId>[];
    edges: RelationshipSnapshotEdge[];
    unresolved: UnresolvedRelationshipReference[];
    stats: RelationshipSnapshotStats;
};
/** @deprecated Use the versioned `AwsPortalRelationshipArtifactV1` name when migrating legacy declarations. */
export type AwsPortalRelationshipLegacyArtifact<AccountId extends string = string, RunId extends string = string> = AwsPortalRelationshipArtifactV1<AccountId, RunId>;
/** Current lossless AWS relationship artifact. */
export type AwsPortalRelationshipArtifact<AccountId extends string = string, RunId extends string = string> = AwsPortalRelationshipArtifactV2<AccountId, RunId>;
export {};
//# sourceMappingURL=portalRelationshipPublicArtifacts.d.ts.map