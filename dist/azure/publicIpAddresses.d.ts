export declare const PUBLIC_IP_ADDRESSES_SCHEMA_VERSION: "2026-05-02.public-ip-addresses-v1";
export declare const PUBLIC_IP_ADDRESSES_PORTAL_FILE: "public-ip-addresses.json";
export type PublicIpAddressesJsonPrimitive = string | number | boolean | null;
export type PublicIpAddressesJsonValue = PublicIpAddressesJsonPrimitive | PublicIpAddressesJsonValue[] | {
    [key: string]: PublicIpAddressesJsonValue;
};
export type PublicIpAddressesUseClassification = 'assigned' | 'unassigned' | 'unresolved';
export type PublicIpAddressesExposureKind = 'rdp' | 'ssh' | 'https';
export type PublicIpAddressesExposureEvidenceSource = 'nsg_rule' | 'lb_rule' | 'appgw_listener' | 'direct_rule' | 'derived';
export type PublicIpAddressesExposureConfidence = 'high' | 'medium' | 'low';
export type PublicIpAddressesAssignmentVia = 'relationship_graph' | 'direct_ip_configuration' | 'reverse_consumer_lookup' | 'nat_gateway_reference' | 'prefix_membership' | 'unassigned' | 'unresolved';
export type PublicIpAddressesAssociatedService = 'bastion' | 'azure_firewall' | 'application_gateway' | 'load_balancer' | 'network_interface' | 'nat_gateway' | 'unknown_network_consumer' | 'unknown' | 'unassigned';
export type PublicIpAddressesConcern = 'unused_public_ip' | 'dynamic_unassigned' | 'basic_sku_retiring' | 'missing_assignment_resolution' | 'attached_to_direct_nic' | 'attached_to_bastion' | 'attached_to_azure_firewall' | 'attached_to_app_gateway' | 'attached_to_load_balancer' | 'attached_to_nat_gateway' | 'orphaned_graph_reference' | 'rdp_exposed' | 'ssh_exposed' | 'https_exposed';
export interface PublicIpAddressesSubscriptionProperties {
    secureScore?: number;
    currency?: string;
    currencySymbol?: string;
    foundCurrency?: boolean;
    showAmortizedCosts?: boolean;
    [key: string]: PublicIpAddressesJsonValue | undefined;
}
export interface PublicIpAddressesSubscription {
    companyId?: string;
    tenantId?: string;
    subscriptionId: string;
    displayName: string;
    properties?: PublicIpAddressesSubscriptionProperties;
}
export interface PublicIpAddressesSummary {
    total: number;
    assigned: number;
    unassigned: number;
    dynamicUnassigned: number;
    basicSku: number;
    exposedRdp: number;
    exposedSsh: number;
    exposedHttps: number;
    byService: Record<string, number>;
    byConcern: Record<string, number>;
    byLocation: Record<string, number>;
    byPrefix: Record<string, number>;
}
export interface PublicIpAddressesSku {
    name: string | null;
    tier: string | null;
}
export interface PublicIpAddressesAssignment {
    via: PublicIpAddressesAssignmentVia;
    resourceId: string | null;
    resourceName: string | null;
    resourceType: string | null;
    parentResourceId: string | null;
    parentResourceName: string | null;
    parentResourceType: string | null;
    evidence: string[];
}
export interface PublicIpAddressesPrefix {
    id: string;
    name: string | null;
    ipPrefix: string | null;
}
export interface PublicIpAddressesExposure {
    kind: PublicIpAddressesExposureKind;
    evidenceSource: PublicIpAddressesExposureEvidenceSource;
    evidence: string;
    confidence: PublicIpAddressesExposureConfidence;
}
export interface PublicIpAddressesItem {
    id: string;
    name: string;
    resourceGroup: string | null;
    location: string;
    sku: PublicIpAddressesSku;
    zones: string[];
    allocationMethod: string | null;
    ipVersion: string | null;
    ipAddress: string | null;
    fqdn: string | null;
    use: PublicIpAddressesUseClassification;
    assignment: PublicIpAddressesAssignment;
    associatedResource: string | null;
    associatedResourceType: string | null;
    associatedService: PublicIpAddressesAssociatedService;
    prefix: PublicIpAddressesPrefix | null;
    exposures: PublicIpAddressesExposure[];
    concerns: PublicIpAddressesConcern[];
    tags: Record<string, string>;
}
export interface PublicIpAddressesReport {
    schemaVersion?: typeof PUBLIC_IP_ADDRESSES_SCHEMA_VERSION;
    subscription: PublicIpAddressesSubscription;
    timestamp: string;
    summary: PublicIpAddressesSummary;
    items: PublicIpAddressesItem[];
}
//# sourceMappingURL=publicIpAddresses.d.ts.map