import type { AIChatWorkspaceDrillDownV1 } from './workspaceArtifacts.js';
/** Bounds for a focused, snapshot-only chat graph, independent of the full Relationships page. */
export declare const AI_CHAT_WORKSPACE_GRAPH_LIMITS: {
    readonly nodes: 24;
    readonly edges: 36;
    readonly depth: 2;
};
export interface AIChatWorkspaceGraphNode {
    /** Opaque identity local to this artifact; never a storage or resource identifier. */
    id: string;
    label: string;
    depth: number;
    resourceType?: string;
    /** Key into the artifact's server-authored safe link table. */
    linkKey?: string;
}
export interface AIChatWorkspaceGraphEdge {
    id: string;
    source: string;
    target: string;
    label: string;
    kind: 'contains' | 'depends_on';
    /** Topology evidence does not establish observed traffic or successful reachability. */
    evidenceKind: 'configuration' | 'inferred' | 'unknown';
}
export interface AIChatWorkspaceGraphPayload {
    rootNodeId: string;
    nodes: AIChatWorkspaceGraphNode[];
    edges: AIChatWorkspaceGraphEdge[];
    direction: 'both' | 'dependencies' | 'dependents';
    maxDepth: 1 | 2;
    omittedNodeCount: number;
    omittedEdgeCount: number;
    unresolvedReferenceCount: number;
    /** Parallel to nodes, followed by edges. Empty keys mark elements with no admitted follow-up. */
    drillDown?: AIChatWorkspaceDrillDownV1;
}
/**
 * Strict wire validation shared by API and Portal. No coordinates, executable
 * styles, endpoint addresses or model-authored graph configuration are admitted.
 */
export declare const isAIChatWorkspaceGraphPayload: (value: unknown) => value is AIChatWorkspaceGraphPayload;
//# sourceMappingURL=workspaceGraph.d.ts.map