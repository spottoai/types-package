import type { AwsPublicArtifactForbiddenCredentialFields } from './publicArtifacts';
import type { AwsPortalResourceDetailItem } from './portalPublicArtifacts';
import type { AwsPortalRelationshipDiscoveryFamily } from './portalRelationshipPublicArtifacts';
type AwsPortalRelationshipNodeDataBase<AccountId extends string> = AwsPublicArtifactForbiddenCredentialFields & {
    provider: 'aws';
    accountId: AccountId;
};
export interface AwsPortalRelationshipVpcCidrBlockAssociation {
    associationId?: string;
    cidrBlock: string;
    state?: string;
}
export interface AwsPortalRelationshipIpv6CidrBlockAssociation {
    associationId?: string;
    ipv6CidrBlock: string;
    state?: string;
}
export interface AwsPortalRelationshipRouteTableAssociation {
    associationId?: string;
    subnetId?: string;
    gatewayId?: string;
    main?: boolean;
    associationState?: string;
    associationStateMessage?: string;
}
export interface AwsPortalRelationshipGatewayAttachment {
    vpcId?: string;
    state?: string;
}
export interface AwsPortalRelationshipEbsAttachment {
    instanceId?: string;
    device?: string;
    state?: string;
    attachTime?: string;
    deleteOnTermination?: boolean;
}
export interface AwsPortalRelationshipNatGatewayAddress {
    allocationId?: string;
    associationId?: string;
    isPrimary?: boolean;
    networkInterfaceId?: string;
    privateIp?: string;
    publicIp?: string;
    status?: string;
}
export interface AwsPortalRelationshipRdsDbClusterMember {
    dbInstanceIdentifier: string;
    isClusterWriter?: boolean;
    promotionTier?: number;
}
type AwsPortalRelationshipResourceNodeDataBase<Family extends AwsPortalRelationshipDiscoveryFamily, AccountId extends string> = AwsPortalRelationshipNodeDataBase<AccountId> & {
    family: Family;
    resourceRegion: string;
    stableKey: string;
    resourceType: string;
    tags?: Record<string, string>;
    billing?: NonNullable<AwsPortalResourceDetailItem['billing']>;
};
export type AwsPortalRelationshipEc2NodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'ec2-instance', AccountId> & {
    instanceId: string;
    instanceArn: string;
    name?: string;
    state?: string;
    instanceType?: string;
    availabilityZone?: string;
    subnetId?: string;
    vpcId?: string;
};
export type AwsPortalRelationshipEbsNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'ebs-volume', AccountId> & {
    volumeId: string;
    volumeArn: string;
    state?: string;
    availabilityZone?: string;
    volumeType?: string;
    sizeGiB?: number;
    encrypted?: boolean;
    snapshotId?: string;
    attachments: AwsPortalRelationshipEbsAttachment[];
};
export type AwsPortalRelationshipVpcNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'vpc', AccountId> & {
    vpcId: string;
    vpcArn: string;
    state?: string;
    cidrBlock?: string;
    dhcpOptionsId?: string;
    instanceTenancy?: string;
    isDefault?: boolean;
    ownerId?: string;
    cidrBlockAssociations: AwsPortalRelationshipVpcCidrBlockAssociation[];
    ipv6CidrBlockAssociations: AwsPortalRelationshipIpv6CidrBlockAssociation[];
};
export type AwsPortalRelationshipSubnetNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'subnet', AccountId> & {
    subnetArn: string;
    subnetId: string;
    vpcId?: string;
    availabilityZone?: string;
    availabilityZoneId?: string;
    state?: string;
    cidrBlock?: string;
    availableIpAddressCount?: number;
    defaultForAz?: boolean;
    mapPublicIpOnLaunch?: boolean;
    assignIpv6AddressOnCreation?: boolean;
    ipv6Native?: boolean;
    ownerId?: string;
    customerOwnedIpv4Pool?: string;
    mapCustomerOwnedIpOnLaunch?: boolean;
    outpostArn?: string;
    enableDns64?: boolean;
    enableLniAtDeviceIndex?: number;
    privateDnsHostnameType?: string;
    privateDnsEnableResourceNameDnsARecord?: boolean;
    privateDnsEnableResourceNameDnsAAAARecord?: boolean;
    ipv6CidrBlockAssociations: AwsPortalRelationshipIpv6CidrBlockAssociation[];
};
export type AwsPortalRelationshipRouteTableNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'route-table', AccountId> & {
    routeTableArn: string;
    routeTableId: string;
    vpcId?: string;
    ownerId?: string;
    hasMainAssociation: boolean;
    associations: AwsPortalRelationshipRouteTableAssociation[];
};
export type AwsPortalRelationshipInternetGatewayNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'internet-gateway', AccountId> & {
    internetGatewayArn: string;
    internetGatewayId: string;
    ownerId?: string;
    attachments: AwsPortalRelationshipGatewayAttachment[];
    attachedVpcIds: string[];
};
export type AwsPortalRelationshipVirtualPrivateGatewayNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'virtual-private-gateway', AccountId> & {
    virtualPrivateGatewayArn: string;
    virtualPrivateGatewayId: string;
    amazonSideAsn?: number;
    availabilityZone?: string;
    state?: string;
    type?: string;
    attachments: AwsPortalRelationshipGatewayAttachment[];
    attachedVpcIds: string[];
};
export type AwsPortalRelationshipNetworkInterfaceNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'network-interface', AccountId> & {
    networkInterfaceId: string;
    ownerId?: string;
    subnetId?: string;
    vpcId?: string;
    availabilityZone?: string;
    status?: string;
    interfaceType?: string;
    requesterManaged?: boolean;
    requesterId?: string;
    privateIpAddress?: string;
    attachmentInstanceId?: string;
};
export type AwsPortalRelationshipNatGatewayNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'nat-gateway', AccountId> & {
    natGatewayId: string;
    natGatewayArn: string;
    subnetId?: string;
    vpcId?: string;
    availabilityZone?: string;
    state?: string;
    connectivityType?: string;
    failureCode?: string;
    failureMessage?: string;
    createTime?: string;
    deleteTime?: string;
    addresses: AwsPortalRelationshipNatGatewayAddress[];
};
export type AwsPortalRelationshipSecurityGroupNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'security-group', AccountId> & {
    groupId: string;
    securityGroupArn?: string;
    groupName: string;
    description?: string;
    vpcId?: string;
    ownerId?: string;
};
export type AwsPortalRelationshipRdsDbClusterNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'rds-db-cluster', AccountId> & {
    dbClusterResourceId: string;
    dbClusterIdentifier: string;
    dbClusterArn: string;
    engine?: string;
    engineVersion?: string;
    engineMode?: string;
    status?: string;
    serverlessV2MinCapacityAcu?: number;
    serverlessV2MaxCapacityAcu?: number;
    serverlessV2SecondsUntilAutoPause?: number;
    serverlessV2PlatformVersion?: string;
    globalClusterIdentifier?: string;
    clusterScalabilityType?: string;
    limitlessDatabaseStatus?: string;
    endpointAddress?: string;
    readerEndpointAddress?: string;
    hostedZoneId?: string;
    endpointPort?: number;
    availabilityZones: string[];
    storageEncrypted?: boolean;
    kmsKeyId?: string;
    deletionProtection?: boolean;
    copyTagsToSnapshot?: boolean;
    dbProxyNames: string[];
    dbClusterMemberIdentifiers: string[];
    dbClusterMembers: AwsPortalRelationshipRdsDbClusterMember[];
};
export type AwsPortalRelationshipRdsDbInstanceNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'rds-db-instance', AccountId> & {
    dbInstanceIdentifier: string;
    dbiResourceId: string;
    dbInstanceArn: string;
    engine?: string;
    engineVersion?: string;
    dbInstanceClass?: string;
    status?: string;
    availabilityZone?: string;
    vpcId?: string;
    dbSubnetGroupName?: string;
    dbClusterIdentifier?: string;
};
export type AwsPortalRelationshipLoadBalancerV2NodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'load-balancer-v2', AccountId> & {
    loadBalancerArn: string;
    loadBalancerName: string;
    loadBalancerType?: string;
    scheme?: string;
    state?: string;
    vpcId?: string;
    subnetIds: string[];
    availabilityZoneNames: string[];
};
export type AwsPortalRelationshipClassicLoadBalancerNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'classic-load-balancer', AccountId> & {
    loadBalancerName: string;
    scheme?: string;
    vpcId?: string;
    subnetIds: string[];
    availabilityZoneNames: string[];
    securityGroupIds: string[];
    instanceIds: string[];
};
export type AwsPortalRelationshipElasticacheCacheClusterNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'elasticache-cache-cluster', AccountId> & {
    cacheClusterId: string;
    cacheClusterArn: string;
    engine?: string;
    engineVersion?: string;
    status?: string;
    cacheNodeType?: string;
    preferredAvailabilityZone?: string;
    cacheSubnetGroupName?: string;
    replicationGroupId?: string;
    replicationGroupGlobalReplicationGroupId?: string;
    kmsKeyId?: string;
};
export type AwsPortalRelationshipElasticacheServerlessCacheNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'elasticache-serverless-cache', AccountId> & {
    serverlessCacheName: string;
    serverlessCacheArn: string;
    engine?: string;
    majorEngineVersion?: string;
    status?: string;
    subnetIds: string[];
    kmsKeyId?: string;
};
export type AwsPortalRelationshipEfsNodeData<AccountId extends string = string> = AwsPortalRelationshipResourceNodeDataBase<'efs-file-system', AccountId> & {
    fileSystemId: string;
    fileSystemArn: string;
    name?: string;
    state?: string;
    availabilityZoneName?: string;
    encrypted?: boolean;
    kmsKeyId?: string;
};
export type AwsPortalRelationshipResourceNodeData<AccountId extends string = string> = AwsPortalRelationshipEc2NodeData<AccountId> | AwsPortalRelationshipEbsNodeData<AccountId> | AwsPortalRelationshipVpcNodeData<AccountId> | AwsPortalRelationshipSubnetNodeData<AccountId> | AwsPortalRelationshipRouteTableNodeData<AccountId> | AwsPortalRelationshipInternetGatewayNodeData<AccountId> | AwsPortalRelationshipVirtualPrivateGatewayNodeData<AccountId> | AwsPortalRelationshipNetworkInterfaceNodeData<AccountId> | AwsPortalRelationshipNatGatewayNodeData<AccountId> | AwsPortalRelationshipSecurityGroupNodeData<AccountId> | AwsPortalRelationshipRdsDbClusterNodeData<AccountId> | AwsPortalRelationshipRdsDbInstanceNodeData<AccountId> | AwsPortalRelationshipLoadBalancerV2NodeData<AccountId> | AwsPortalRelationshipClassicLoadBalancerNodeData<AccountId> | AwsPortalRelationshipElasticacheCacheClusterNodeData<AccountId> | AwsPortalRelationshipElasticacheServerlessCacheNodeData<AccountId> | AwsPortalRelationshipEfsNodeData<AccountId>;
export {};
//# sourceMappingURL=portalRelationshipResourceNodeTypes.d.ts.map