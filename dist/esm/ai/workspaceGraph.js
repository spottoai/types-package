/** Bounds for a focused, snapshot-only chat graph, independent of the full Relationships page. */
export const AI_CHAT_WORKSPACE_GRAPH_LIMITS = { nodes: 24, edges: 36, depth: 2 };
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasOnlyKeys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
// Wire labels must be single-line plain text.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[<>\u0000-\u001f\u007f]/;
const isText = (value, maximum) => typeof value === 'string' && value.trim().length > 0 && value.length <= maximum && !CONTROL_CHARACTERS.test(value);
const isIdentifier = (value) => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(value);
const isCount = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const isDrillDown = (value, elementCount) => {
    if (!isRecord(value) ||
        !hasOnlyKeys(value, ['drillDownId', 'elementKeys', 'prompts']) ||
        value.drillDownId !== 'subject.explain@1' ||
        !Array.isArray(value.elementKeys) ||
        !Array.isArray(value.prompts) ||
        value.elementKeys.length !== elementCount ||
        value.prompts.length !== elementCount)
        return false;
    const keys = new Set();
    for (let index = 0; index < elementCount; index++) {
        const key = value.elementKeys[index];
        const prompt = value.prompts[index];
        if (typeof key !== 'string' || !/^(?:e\d{1,3})?$/.test(key) || typeof prompt !== 'string')
            return false;
        if (key === '') {
            if (prompt !== '')
                return false;
            continue;
        }
        if (!isText(prompt, 200) || /[{}<>`]/.test(prompt) || keys.has(key))
            return false;
        keys.add(key);
    }
    return keys.size > 0;
};
/**
 * Strict wire validation shared by API and Portal. No coordinates, executable
 * styles, endpoint addresses or model-authored graph configuration are admitted.
 */
export const isAIChatWorkspaceGraphPayload = (value) => {
    if (!isRecord(value) ||
        !hasOnlyKeys(value, [
            'rootNodeId',
            'nodes',
            'edges',
            'direction',
            'maxDepth',
            'omittedNodeCount',
            'omittedEdgeCount',
            'unresolvedReferenceCount',
            'drillDown',
        ]) ||
        !isIdentifier(value.rootNodeId) ||
        !Array.isArray(value.nodes) ||
        value.nodes.length < 1 ||
        value.nodes.length > AI_CHAT_WORKSPACE_GRAPH_LIMITS.nodes ||
        !Array.isArray(value.edges) ||
        value.edges.length > AI_CHAT_WORKSPACE_GRAPH_LIMITS.edges ||
        (value.direction !== 'both' && value.direction !== 'dependencies' && value.direction !== 'dependents') ||
        (value.maxDepth !== 1 && value.maxDepth !== 2) ||
        !isCount(value.omittedNodeCount) ||
        !isCount(value.omittedEdgeCount) ||
        !isCount(value.unresolvedReferenceCount))
        return false;
    const depths = new Map();
    for (const candidate of value.nodes) {
        if (!isRecord(candidate) ||
            !hasOnlyKeys(candidate, ['id', 'label', 'depth', 'resourceType', 'linkKey']) ||
            !isIdentifier(candidate.id) ||
            depths.has(candidate.id) ||
            !isText(candidate.label, 120) ||
            !isCount(candidate.depth) ||
            candidate.depth > value.maxDepth ||
            (candidate.id === value.rootNodeId ? candidate.depth !== 0 : candidate.depth === 0) ||
            (candidate.resourceType !== undefined && !isText(candidate.resourceType, 160)) ||
            (candidate.linkKey !== undefined && !isIdentifier(candidate.linkKey)))
            return false;
        depths.set(candidate.id, candidate.depth);
    }
    if (!depths.has(value.rootNodeId))
        return false;
    const edgeIds = new Set();
    const adjacency = new Map();
    const connect = (source, target) => {
        const neighbors = adjacency.get(source) ?? [];
        neighbors.push(target);
        adjacency.set(source, neighbors);
    };
    for (const candidate of value.edges) {
        if (!isRecord(candidate) ||
            !hasOnlyKeys(candidate, ['id', 'source', 'target', 'label', 'kind', 'evidenceKind']) ||
            !isIdentifier(candidate.id) ||
            edgeIds.has(candidate.id) ||
            depths.has(candidate.id) ||
            !isIdentifier(candidate.source) ||
            !depths.has(candidate.source) ||
            !isIdentifier(candidate.target) ||
            !depths.has(candidate.target) ||
            candidate.source === candidate.target ||
            !isText(candidate.label, 160) ||
            (candidate.kind !== 'contains' && candidate.kind !== 'depends_on') ||
            (candidate.evidenceKind !== 'configuration' && candidate.evidenceKind !== 'inferred' && candidate.evidenceKind !== 'unknown'))
            return false;
        edgeIds.add(candidate.id);
        if (value.direction !== 'dependents')
            connect(candidate.source, candidate.target);
        if (value.direction !== 'dependencies')
            connect(candidate.target, candidate.source);
    }
    // Every displayed node must be reachable in the requested direction at its stated depth.
    const reached = new Map([[value.rootNodeId, 0]]);
    const queue = [value.rootNodeId];
    for (let cursor = 0; cursor < queue.length; cursor++) {
        const source = queue[cursor];
        const depth = reached.get(source);
        if (depth >= value.maxDepth)
            continue;
        for (const target of adjacency.get(source) ?? []) {
            if (reached.has(target))
                continue;
            reached.set(target, depth + 1);
            queue.push(target);
        }
    }
    if (reached.size !== depths.size || [...depths].some(([id, depth]) => reached.get(id) !== depth))
        return false;
    return value.drillDown === undefined || isDrillDown(value.drillDown, value.nodes.length + value.edges.length);
};
