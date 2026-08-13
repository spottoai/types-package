"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsPortalRelationshipResourceNode = validateAwsPortalRelationshipResourceNode;
const portalRelationshipPublicArtifacts_1 = require("./portalRelationshipPublicArtifacts");
const portalPublicArtifactNestedEvidenceValidation_1 = require("./portalPublicArtifactNestedEvidenceValidation");
const portalPublicArtifactValidationCommon_1 = require("./portalPublicArtifactValidationCommon");
const pluginPublicArtifactValidationHelpers_1 = require("./pluginPublicArtifactValidationHelpers");
const RESOURCE_COMMON_KEYS = ['provider', 'accountId', 'family', 'resourceRegion', 'stableKey', 'resourceType', 'tags', 'billing'];
const RESOURCE_KEYS = {
    'ec2-instance': ['instanceId', 'instanceArn', 'name', 'state', 'instanceType', 'availabilityZone', 'subnetId', 'vpcId'],
    'ebs-volume': ['volumeId', 'volumeArn', 'state', 'availabilityZone', 'volumeType', 'sizeGiB', 'encrypted', 'snapshotId', 'attachments'],
    vpc: [
        'vpcId',
        'vpcArn',
        'state',
        'cidrBlock',
        'dhcpOptionsId',
        'instanceTenancy',
        'isDefault',
        'ownerId',
        'cidrBlockAssociations',
        'ipv6CidrBlockAssociations',
    ],
    subnet: [
        'subnetArn',
        'subnetId',
        'vpcId',
        'availabilityZone',
        'availabilityZoneId',
        'state',
        'cidrBlock',
        'availableIpAddressCount',
        'defaultForAz',
        'mapPublicIpOnLaunch',
        'assignIpv6AddressOnCreation',
        'ipv6Native',
        'ownerId',
        'customerOwnedIpv4Pool',
        'mapCustomerOwnedIpOnLaunch',
        'outpostArn',
        'enableDns64',
        'enableLniAtDeviceIndex',
        'privateDnsHostnameType',
        'privateDnsEnableResourceNameDnsARecord',
        'privateDnsEnableResourceNameDnsAAAARecord',
        'ipv6CidrBlockAssociations',
    ],
    'route-table': ['routeTableArn', 'routeTableId', 'vpcId', 'ownerId', 'hasMainAssociation', 'associations'],
    'internet-gateway': ['internetGatewayArn', 'internetGatewayId', 'ownerId', 'attachments', 'attachedVpcIds'],
    'virtual-private-gateway': [
        'virtualPrivateGatewayArn',
        'virtualPrivateGatewayId',
        'amazonSideAsn',
        'availabilityZone',
        'state',
        'type',
        'attachments',
        'attachedVpcIds',
    ],
    'network-interface': [
        'networkInterfaceId',
        'ownerId',
        'subnetId',
        'vpcId',
        'availabilityZone',
        'status',
        'interfaceType',
        'requesterManaged',
        'requesterId',
        'privateIpAddress',
        'attachmentInstanceId',
    ],
    'nat-gateway': [
        'natGatewayId',
        'natGatewayArn',
        'subnetId',
        'vpcId',
        'availabilityZone',
        'state',
        'connectivityType',
        'failureCode',
        'failureMessage',
        'createTime',
        'deleteTime',
        'addresses',
    ],
    'security-group': ['groupId', 'securityGroupArn', 'groupName', 'description', 'vpcId', 'ownerId'],
    'rds-db-cluster': [
        'dbClusterResourceId',
        'dbClusterIdentifier',
        'dbClusterArn',
        'engine',
        'engineVersion',
        'engineMode',
        'status',
        'serverlessV2MinCapacityAcu',
        'serverlessV2MaxCapacityAcu',
        'serverlessV2SecondsUntilAutoPause',
        'serverlessV2PlatformVersion',
        'globalClusterIdentifier',
        'clusterScalabilityType',
        'limitlessDatabaseStatus',
        'endpointAddress',
        'readerEndpointAddress',
        'hostedZoneId',
        'endpointPort',
        'availabilityZones',
        'storageEncrypted',
        'kmsKeyId',
        'deletionProtection',
        'copyTagsToSnapshot',
        'dbProxyNames',
        'dbClusterMemberIdentifiers',
        'dbClusterMembers',
    ],
    'rds-db-instance': [
        'dbInstanceIdentifier',
        'dbiResourceId',
        'dbInstanceArn',
        'engine',
        'engineVersion',
        'dbInstanceClass',
        'status',
        'availabilityZone',
        'vpcId',
        'dbSubnetGroupName',
        'dbClusterIdentifier',
    ],
    'load-balancer-v2': ['loadBalancerArn', 'loadBalancerName', 'loadBalancerType', 'scheme', 'state', 'vpcId', 'subnetIds', 'availabilityZoneNames'],
    'classic-load-balancer': ['loadBalancerName', 'scheme', 'vpcId', 'subnetIds', 'availabilityZoneNames', 'securityGroupIds', 'instanceIds'],
    'elasticache-cache-cluster': [
        'cacheClusterId',
        'cacheClusterArn',
        'engine',
        'engineVersion',
        'status',
        'cacheNodeType',
        'preferredAvailabilityZone',
        'cacheSubnetGroupName',
        'replicationGroupId',
        'replicationGroupGlobalReplicationGroupId',
        'kmsKeyId',
    ],
    'elasticache-serverless-cache': ['serverlessCacheName', 'serverlessCacheArn', 'engine', 'majorEngineVersion', 'status', 'subnetIds', 'kmsKeyId'],
    'efs-file-system': ['fileSystemId', 'fileSystemArn', 'name', 'state', 'availabilityZoneName', 'encrypted', 'kmsKeyId'],
};
const REQUIRED_RESOURCE_KEYS = {
    'ec2-instance': ['instanceId', 'instanceArn'],
    'ebs-volume': ['volumeId', 'volumeArn', 'attachments'],
    vpc: ['vpcId', 'vpcArn', 'cidrBlockAssociations', 'ipv6CidrBlockAssociations'],
    subnet: ['subnetArn', 'subnetId', 'ipv6CidrBlockAssociations'],
    'route-table': ['routeTableArn', 'routeTableId', 'hasMainAssociation', 'associations'],
    'internet-gateway': ['internetGatewayArn', 'internetGatewayId', 'attachments', 'attachedVpcIds'],
    'virtual-private-gateway': ['virtualPrivateGatewayArn', 'virtualPrivateGatewayId', 'attachments', 'attachedVpcIds'],
    'network-interface': ['networkInterfaceId'],
    'nat-gateway': ['natGatewayId', 'natGatewayArn', 'addresses'],
    'security-group': ['groupId', 'groupName'],
    'rds-db-cluster': [
        'dbClusterResourceId',
        'dbClusterIdentifier',
        'dbClusterArn',
        'availabilityZones',
        'dbProxyNames',
        'dbClusterMemberIdentifiers',
        'dbClusterMembers',
    ],
    'rds-db-instance': ['dbInstanceIdentifier', 'dbiResourceId', 'dbInstanceArn'],
    'load-balancer-v2': ['loadBalancerArn', 'loadBalancerName', 'subnetIds', 'availabilityZoneNames'],
    'classic-load-balancer': ['loadBalancerName', 'subnetIds', 'availabilityZoneNames', 'securityGroupIds', 'instanceIds'],
    'elasticache-cache-cluster': ['cacheClusterId', 'cacheClusterArn'],
    'elasticache-serverless-cache': ['serverlessCacheName', 'serverlessCacheArn', 'subnetIds'],
    'efs-file-system': ['fileSystemId', 'fileSystemArn'],
};
const STRING_FIELDS = new Set([
    'stableKey',
    'resourceType',
    ...Object.values(RESOURCE_KEYS)
        .flat()
        .filter(field => ![
        'attachments',
        'addresses',
        'associations',
        'attachedVpcIds',
        'availabilityZoneNames',
        'availabilityZones',
        'cidrBlockAssociations',
        'dbClusterMemberIdentifiers',
        'dbClusterMembers',
        'dbProxyNames',
        'instanceIds',
        'ipv6CidrBlockAssociations',
        'securityGroupIds',
        'subnetIds',
        'availableIpAddressCount',
        'amazonSideAsn',
        'enableLniAtDeviceIndex',
        'endpointPort',
        'serverlessV2MaxCapacityAcu',
        'serverlessV2MinCapacityAcu',
        'serverlessV2SecondsUntilAutoPause',
        'sizeGiB',
        'assignIpv6AddressOnCreation',
        'copyTagsToSnapshot',
        'defaultForAz',
        'deletionProtection',
        'enableDns64',
        'encrypted',
        'hasMainAssociation',
        'ipv6Native',
        'isDefault',
        'mapCustomerOwnedIpOnLaunch',
        'mapPublicIpOnLaunch',
        'privateDnsEnableResourceNameDnsARecord',
        'privateDnsEnableResourceNameDnsAAAARecord',
        'requesterManaged',
        'storageEncrypted',
    ].includes(field)),
]);
const NUMBER_FIELDS = new Set([
    'amazonSideAsn',
    'availableIpAddressCount',
    'enableLniAtDeviceIndex',
    'endpointPort',
    'serverlessV2MaxCapacityAcu',
    'serverlessV2MinCapacityAcu',
    'serverlessV2SecondsUntilAutoPause',
    'sizeGiB',
]);
const BOOLEAN_FIELDS = new Set([
    'assignIpv6AddressOnCreation',
    'copyTagsToSnapshot',
    'defaultForAz',
    'deletionProtection',
    'enableDns64',
    'encrypted',
    'hasMainAssociation',
    'ipv6Native',
    'isDefault',
    'mapCustomerOwnedIpOnLaunch',
    'mapPublicIpOnLaunch',
    'privateDnsEnableResourceNameDnsARecord',
    'privateDnsEnableResourceNameDnsAAAARecord',
    'requesterManaged',
    'storageEncrypted',
]);
const STRING_ARRAY_FIELDS = new Set([
    'attachedVpcIds',
    'availabilityZoneNames',
    'availabilityZones',
    'dbClusterMemberIdentifiers',
    'dbProxyNames',
    'instanceIds',
    'securityGroupIds',
    'subnetIds',
]);
function validateAwsPortalRelationshipResourceNode(data, accountId, regions, field) {
    (0, portalPublicArtifactValidationCommon_1.assertValue)(data.provider, 'aws', `${field}.provider`);
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(data.accountId, accountId, `${field}.accountId`);
    const resourceRegion = (0, portalPublicArtifactValidationCommon_1.requiredString)(data.resourceRegion, `${field}.resourceRegion`);
    if (!regions.has(resourceRegion))
        throw new Error(`${field}.resourceRegion is outside artifact scope.`);
    const family = (0, portalPublicArtifactValidationCommon_1.requiredEnum)(data.family, portalRelationshipPublicArtifacts_1.AWS_PORTAL_RELATIONSHIP_DISCOVERY_FAMILIES, `${field}.family`);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(data, [...RESOURCE_COMMON_KEYS, ...RESOURCE_KEYS[family]], field);
    (0, pluginPublicArtifactValidationHelpers_1.assertRequiredKeys)(data, ['provider', 'accountId', 'family', 'resourceRegion', 'stableKey', 'resourceType', ...REQUIRED_RESOURCE_KEYS[family]], field);
    for (const key of Object.keys(data)) {
        if (STRING_FIELDS.has(key) && data[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(data[key], `${field}.${key}`);
        if (NUMBER_FIELDS.has(key) && data[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.finiteNumber)(data[key], `${field}.${key}`);
        if (BOOLEAN_FIELDS.has(key) && data[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(data[key], `${field}.${key}`);
        if (STRING_ARRAY_FIELDS.has(key) && data[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.stringArray)(data[key], `${field}.${key}`);
    }
    if (data.tags !== undefined)
        validateTags(data.tags, `${field}.tags`);
    if (data.billing !== undefined)
        (0, portalPublicArtifactNestedEvidenceValidation_1.validateResourceBillingEvidence)(data.billing, `${field}.billing`);
    validateNativeScopeIdentity(data, accountId, resourceRegion, field);
    validateNestedResourceArrays(data, family, field);
}
function validateNativeScopeIdentity(data, accountId, resourceRegion, field) {
    if (data.ownerId !== undefined)
        (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(data.ownerId, accountId, `${field}.ownerId`);
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value !== 'string')
            return;
        if (key.endsWith('Arn') || key === 'stableKey' || key === 'kmsKeyId') {
            if (value.startsWith('arn:'))
                validateScopedArn(value, accountId, resourceRegion, `${field}.${key}`);
        }
        if (['availabilityZone', 'availabilityZoneName', 'preferredAvailabilityZone'].includes(key))
            validateAvailabilityZone(value, resourceRegion, `${field}.${key}`);
    });
    for (const key of ['availabilityZones', 'availabilityZoneNames']) {
        if (!Array.isArray(data[key]))
            continue;
        data[key].forEach((value, index) => {
            if (typeof value === 'string')
                validateAvailabilityZone(value, resourceRegion, `${field}.${key}[${index}]`);
        });
    }
}
function validateScopedArn(value, accountId, resourceRegion, field) {
    const match = /^arn:(aws(?:-[a-z0-9-]+)?):[^:]+:([^:]*):([^:]*):.+$/.exec(value);
    if (!match)
        throw new Error(`${field} must be a canonical AWS ARN.`);
    const [, , arnRegion, arnAccountId] = match;
    if (arnRegion !== resourceRegion)
        throw new Error(`${field} ARN Region must match its resource node.`);
    if (arnAccountId !== accountId)
        throw new Error(`${field} ARN account must match its resource node.`);
}
function validateAvailabilityZone(value, resourceRegion, field) {
    if (resourceRegion === 'global' || value === resourceRegion || !value.startsWith(resourceRegion))
        throw new Error(`${field} must belong to its resource Region.`);
}
function validateTags(value, field) {
    const tags = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    Object.entries(tags).forEach(([key, tagValue]) => {
        (0, portalPublicArtifactValidationCommon_1.requiredString)(key, `${field} key`);
        (0, portalPublicArtifactValidationCommon_1.requiredString)(tagValue, `${field}.${key}`);
    });
}
function validateNestedResourceArrays(data, family, field) {
    if (family === 'vpc') {
        validateObjectArray(data.cidrBlockAssociations, ['associationId', 'cidrBlock', 'state'], ['cidrBlock'], `${field}.cidrBlockAssociations`);
        validateObjectArray(data.ipv6CidrBlockAssociations, ['associationId', 'ipv6CidrBlock', 'state'], ['ipv6CidrBlock'], `${field}.ipv6CidrBlockAssociations`);
    }
    else if (family === 'subnet') {
        validateObjectArray(data.ipv6CidrBlockAssociations, ['associationId', 'ipv6CidrBlock', 'state'], ['ipv6CidrBlock'], `${field}.ipv6CidrBlockAssociations`);
    }
    else if (family === 'route-table') {
        validateObjectArray(data.associations, ['associationId', 'subnetId', 'gatewayId', 'main', 'associationState', 'associationStateMessage'], [], `${field}.associations`);
    }
    else if (family === 'internet-gateway' || family === 'virtual-private-gateway') {
        validateObjectArray(data.attachments, ['vpcId', 'state'], [], `${field}.attachments`);
    }
    else if (family === 'ebs-volume') {
        validateObjectArray(data.attachments, ['instanceId', 'device', 'state', 'attachTime', 'deleteOnTermination'], [], `${field}.attachments`);
    }
    else if (family === 'nat-gateway') {
        validateObjectArray(data.addresses, ['allocationId', 'associationId', 'isPrimary', 'networkInterfaceId', 'privateIp', 'publicIp', 'status'], [], `${field}.addresses`);
    }
    else if (family === 'rds-db-cluster') {
        validateObjectArray(data.dbClusterMembers, ['dbInstanceIdentifier', 'isClusterWriter', 'promotionTier'], ['dbInstanceIdentifier'], `${field}.dbClusterMembers`);
    }
}
function validateObjectArray(value, keys, required, field) {
    asArray(value, field).forEach((entry, index) => {
        const itemField = `${field}[${index}]`;
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, keys, itemField);
        (0, pluginPublicArtifactValidationHelpers_1.assertRequiredKeys)(item, required, itemField);
        Object.entries(item).forEach(([key, itemValue]) => {
            if (itemValue === undefined)
                return;
            if (['main', 'deleteOnTermination', 'isPrimary', 'isClusterWriter'].includes(key))
                (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(itemValue, `${itemField}.${key}`);
            else if (key === 'promotionTier')
                (0, portalPublicArtifactValidationCommon_1.finiteNumber)(itemValue, `${itemField}.${key}`);
            else
                (0, portalPublicArtifactValidationCommon_1.requiredString)(itemValue, `${itemField}.${key}`);
        });
    });
}
function asArray(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    return value;
}
//# sourceMappingURL=portalRelationshipResourceNodeValidation.js.map