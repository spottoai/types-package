import type { ArtifactAccountBinding, ArtifactGeneration, ArtifactProvider } from './artifactGeneration.js';
import type { CapabilityReasonCode } from './capabilityPassport.js';
import type { ProviderResourceType, ResourceAttributes, ResourceFamilyId } from './resourceIdentity.js';
/**
 * Provider-neutral resource relationship graph published for one provider
 * account. Families, relationship types, and synthetic types are open
 * identifiers: a new provider service needs no package change.
 */
export declare const RESOURCE_GRAPH_SCHEMA_VERSION: 1;
/** Package-owned logical artifact name; storage paths remain producer-owned. */
export declare const RESOURCE_GRAPH_LOGICAL_NAME: "relationships.json.gz";
export declare const RESOURCE_GRAPH_NODE_KINDS: readonly ["scope", "region", "zone", "group", "resource", "synthetic"];
export declare const RESOURCE_GRAPH_NODE_ROLES: readonly ["network-baseline", "topology", "workload"];
export declare const RESOURCE_GRAPH_EDGE_KINDS: readonly ["contains", "depends_on"];
export declare const RESOURCE_GRAPH_EDGE_CONFIDENCES: readonly ["high", "medium", "low"];
export declare const RESOURCE_GRAPH_EVIDENCE_METHODS: readonly ["field-derived", "field-reference", "persisted-inventory", "request-scope"];
export type ResourceGraphSchemaVersion = typeof RESOURCE_GRAPH_SCHEMA_VERSION;
export type ResourceGraphNodeKind = (typeof RESOURCE_GRAPH_NODE_KINDS)[number];
/** Presentation role that lets readers separate baseline networking from workloads without a family list. */
export type ResourceGraphNodeRole = (typeof RESOURCE_GRAPH_NODE_ROLES)[number];
export type ResourceGraphEdgeKind = (typeof RESOURCE_GRAPH_EDGE_KINDS)[number];
export type ResourceGraphEdgeConfidence = (typeof RESOURCE_GRAPH_EDGE_CONFIDENCES)[number];
export type ResourceGraphEvidenceMethod = (typeof RESOURCE_GRAPH_EVIDENCE_METHODS)[number];
/** Open, kebab-case relationship identifier, for example `subnet-membership`. */
export type ResourceGraphRelationshipType = string;
/** Open, kebab-case synthetic node identifier, for example `db-subnet-group`. */
export type ResourceGraphSyntheticType = string;
export interface ResourceGraphNodeCosts {
    spend30d?: number;
    spend30dAmortized?: number;
}
/**
 * One graph node. `family` and `resourceType` are required on resource nodes,
 * `syntheticType` on synthetic nodes, and `region` on every node except the
 * single scope node.
 */
export interface ResourceGraphNode {
    id: string;
    kind: ResourceGraphNodeKind;
    family?: ResourceFamilyId;
    resourceType?: ProviderResourceType;
    syntheticType?: ResourceGraphSyntheticType;
    region?: string;
    name: string;
    displayName?: string;
    icon?: string;
    /** Provider-native identity such as an AWS ARN. */
    nativeId?: string;
    role?: ResourceGraphNodeRole;
    tags?: Record<string, string>;
    attributes?: ResourceAttributes;
    costs?: ResourceGraphNodeCosts;
}
export interface ResourceGraphEvidence {
    method: ResourceGraphEvidenceMethod;
    /** Family whose data proved the edge; `graph-scope` for structural scope edges. */
    sourceFamily: ResourceFamilyId;
    field?: string;
    matchedValue?: string;
}
/** `contains` edges point from the child to its parent. */
export interface ResourceGraphEdge {
    id: string;
    from: string;
    to: string;
    kind: ResourceGraphEdgeKind;
    relationshipTypes: [ResourceGraphRelationshipType, ...ResourceGraphRelationshipType[]];
    confidence: ResourceGraphEdgeConfidence;
    evidence: [ResourceGraphEvidence, ...ResourceGraphEvidence[]];
}
/** A reference a producer observed but could not resolve to a node. */
export interface ResourceGraphUnresolved {
    sourceNodeId: string;
    relationshipType: ResourceGraphRelationshipType;
    sourceFamily: ResourceFamilyId;
    field: string;
    matchedValue: string;
    expectedTargetFamily: ResourceFamilyId;
}
interface ResourceGraphFamilyCoverageBase {
    family: ResourceFamilyId;
    /** Regions the family covers; a subset of the artifact scope Regions. */
    regions: string[];
}
export type ResourceGraphFamilyCoverage = (ResourceGraphFamilyCoverageBase & {
    status: 'available';
    lastSuccessfulRefreshAt: string;
    emptyScope: boolean;
    reason?: never;
}) | (ResourceGraphFamilyCoverageBase & {
    status: 'incomplete';
    lastSuccessfulRefreshAt?: never;
    emptyScope?: never;
    reason: CapabilityReasonCode;
});
/** Self-closing coverage: every resource node family must be declared here. */
export interface ResourceGraphCoverage {
    families: ResourceGraphFamilyCoverage[];
}
interface ResourceGraphStatsBase {
    totalNodes: number;
    totalEdges: number;
    unresolvedCount: number;
    buildMs?: number;
    snapshotBytes?: number;
}
export type ResourceGraphStats = ResourceGraphStatsBase & ({
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
export interface ResourceGraphScope {
    regions: string[];
}
export type ResourceGraphArtifact<Provider extends ArtifactProvider = ArtifactProvider, AccountId extends string = string, RunId extends string = string> = ArtifactAccountBinding<Provider, AccountId> & {
    schemaVersion: ResourceGraphSchemaVersion;
    artifactGeneration: ArtifactGeneration<RunId>;
    generatedAt: string;
    scope: ResourceGraphScope;
    /** Required when any node carries costs. */
    currency?: string;
    currencySymbol?: string;
    nodes: ResourceGraphNode[];
    edges: ResourceGraphEdge[];
    unresolved: ResourceGraphUnresolved[];
    coverage: ResourceGraphCoverage;
    stats: ResourceGraphStats;
};
export {};
//# sourceMappingURL=resourceGraph.d.ts.map