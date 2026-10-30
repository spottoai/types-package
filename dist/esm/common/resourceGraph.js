/**
 * Provider-neutral resource relationship graph published for one provider
 * account. Families, relationship types, and synthetic types are open
 * identifiers: a new provider service needs no package change.
 */
export const RESOURCE_GRAPH_SCHEMA_VERSION = 1;
/** Package-owned logical artifact name; storage paths remain producer-owned. */
export const RESOURCE_GRAPH_LOGICAL_NAME = 'relationships.json.gz';
export const RESOURCE_GRAPH_NODE_KINDS = ['scope', 'region', 'zone', 'group', 'resource', 'synthetic'];
export const RESOURCE_GRAPH_NODE_ROLES = ['network-baseline', 'topology', 'workload'];
export const RESOURCE_GRAPH_EDGE_KINDS = ['contains', 'depends_on'];
export const RESOURCE_GRAPH_EDGE_CONFIDENCES = ['high', 'medium', 'low'];
export const RESOURCE_GRAPH_EVIDENCE_METHODS = ['field-derived', 'field-reference', 'persisted-inventory', 'request-scope'];
