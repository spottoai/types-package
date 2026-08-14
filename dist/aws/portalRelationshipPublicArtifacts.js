"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_PORTAL_RELATIONSHIP_CONFIDENCE_SCORES = exports.AWS_PORTAL_RELATIONSHIP_TYPES = exports.AWS_PORTAL_RELATIONSHIP_SYNTHETIC_TYPES = exports.AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES = exports.AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION = exports.AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME = void 0;
exports.AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME = 'relationships.json.gz';
exports.AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION = 2;
exports.AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES = [
    'ec2-instance',
    'ebs-volume',
    'vpc',
    'subnet',
    'route-table',
    'internet-gateway',
    'virtual-private-gateway',
    'network-interface',
    'nat-gateway',
    'security-group',
    'rds-db-cluster',
    'rds-db-instance',
    'load-balancer-v2',
    'classic-load-balancer',
    'elasticache-cache-cluster',
    'elasticache-serverless-cache',
    'efs-file-system',
];
exports.AWS_PORTAL_RELATIONSHIP_SYNTHETIC_TYPES = [
    'vpc',
    'subnet',
    'availability-zone',
    'db-subnet-group',
    'db-cluster',
    'elasticache-replication-group',
    'elasticache-global-datastore',
    'kms-key',
    'snapshot',
];
exports.AWS_PORTAL_RELATIONSHIP_TYPES = [
    'account-region',
    'region-resource',
    'region-topology',
    'vpc-membership',
    'subnet-membership',
    'availability-zone-placement',
    'kms-key-encryption',
    'ebs-snapshot-origin',
    'db-subnet-group-membership',
    'elasticache-replication-group-membership',
    'elasticache-global-datastore-membership',
    'security-group-association',
    'classic-load-balancer-registration',
    'ebs-attachment',
    'network-interface-attachment',
    'route-table-association',
    'gateway-route-table-association',
    'route-propagation-source',
    'rds-read-replica',
    'db-cluster-membership',
    'db-cluster-member',
    'security-group-peer-reference',
];
exports.AWS_PORTAL_RELATIONSHIP_CONFIDENCE_SCORES = {
    high: 1,
};
//# sourceMappingURL=portalRelationshipPublicArtifacts.js.map