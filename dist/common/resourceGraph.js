"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESOURCE_GRAPH_EVIDENCE_METHODS = exports.RESOURCE_GRAPH_EDGE_CONFIDENCES = exports.RESOURCE_GRAPH_EDGE_KINDS = exports.RESOURCE_GRAPH_NODE_ROLES = exports.RESOURCE_GRAPH_NODE_KINDS = exports.RESOURCE_GRAPH_LOGICAL_NAME = exports.RESOURCE_GRAPH_SCHEMA_VERSION = void 0;
/**
 * Provider-neutral resource relationship graph published for one provider
 * account. Families, relationship types, and synthetic types are open
 * identifiers: a new provider service needs no package change.
 */
exports.RESOURCE_GRAPH_SCHEMA_VERSION = 1;
/** Package-owned logical artifact name; storage paths remain producer-owned. */
exports.RESOURCE_GRAPH_LOGICAL_NAME = 'relationships.json.gz';
exports.RESOURCE_GRAPH_NODE_KINDS = ['scope', 'region', 'zone', 'group', 'resource', 'synthetic'];
exports.RESOURCE_GRAPH_NODE_ROLES = ['network-baseline', 'topology', 'workload'];
exports.RESOURCE_GRAPH_EDGE_KINDS = ['contains', 'depends_on'];
exports.RESOURCE_GRAPH_EDGE_CONFIDENCES = ['high', 'medium', 'low'];
exports.RESOURCE_GRAPH_EVIDENCE_METHODS = ['field-derived', 'field-reference', 'persisted-inventory', 'request-scope'];
//# sourceMappingURL=resourceGraph.js.map