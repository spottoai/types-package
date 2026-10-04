export const PUBLIC_IP_ADDRESSES_SCHEMA_VERSION = '2026-05-02.public-ip-addresses-v1' as const;

export const PUBLIC_IP_ADDRESSES_PORTAL_FILE = 'public-ip-addresses.json' as const;

export type PublicIpAddressesJsonPrimitive = string | number | boolean | null;
export type PublicIpAddressesJsonValue =
  | PublicIpAddressesJsonPrimitive
  | PublicIpAddressesJsonValue[]
  | { [key: string]: PublicIpAddressesJsonValue };

export type PublicIpAddressesUseClassification = 'assigned' | 'unassigned' | 'unresolved';

export type PublicIpAddressesExposureKind = 'rdp' | 'ssh' | 'https' | 'database' | 'kafka' | 'other';

export type PublicIpAddressesExposureEvidenceSource =
  | 'nsg_rule'
  | 'security_group_rule'
  | 'lb_rule'
  | 'lb_listener'
  | 'appgw_listener'
  | 'direct_rule'
  | 'derived';

export type PublicIpAddressesExposureConfidence = 'high' | 'medium' | 'low';

export type PublicIpAddressesExposureSourceKind =
  | 'internet'
  | 'restricted_public'
  | 'private'
  | 'service_tag'
  | 'application_security_group'
  | 'unknown';

export type PublicIpAddressesExposureProtocol = 'tcp' | 'udp' | 'icmp' | 'ah' | 'esp' | 'any' | 'unknown';

export type PublicIpAddressesExposureScopeKind = 'nic' | 'subnet' | 'load_balancer' | 'app_gateway' | 'direct' | 'derived';

export type PublicIpAddressesEffectiveReachability = 'effective' | 'possible' | 'not_reachable' | 'unknown';

export type PublicIpAddressesRuleDirection = 'inbound' | 'outbound' | 'unknown';

export type PublicIpAddressesRuleAccess = 'allow' | 'deny' | 'unknown';

export type PublicIpAddressesRemediationOptionKind =
  | 'azure_bastion'
  | 'vpn_gateway'
  | 'jit_vm_access'
  | 'azure_virtual_desktop'
  | 'cloudflare_tunnel'
  | 'restrict_nsg_allowlist'
  | 'restrict_ingress_allowlist'
  | 'private_session_access'
  | 'remove_public_ip'
  | 'front_with_app_gateway_waf'
  | 'front_with_waf'
  | 'document_exception';

export type PublicIpAddressesRemediationSuitability = 'recommended' | 'suitable' | 'conditional' | 'not_recommended';

export type PublicIpAddressesRemediationLevel = 'low' | 'medium' | 'high' | 'unknown';

export type PublicIpAddressesAssignmentVia =
  | 'relationship_graph'
  | 'direct_ip_configuration'
  | 'reverse_consumer_lookup'
  | 'nat_gateway_reference'
  | 'prefix_membership'
  | 'unassigned'
  | 'unresolved';

export type PublicIpAddressesAssociatedService =
  | 'bastion'
  | 'azure_firewall'
  | 'application_gateway'
  | 'load_balancer'
  | 'network_interface'
  | 'nat_gateway'
  | 'database'
  | 'message_broker'
  | 'unknown_network_consumer'
  | 'unknown'
  | 'unassigned';

export type PublicIpAddressesConcern =
  | 'unused_public_ip'
  | 'dynamic_unassigned'
  | 'basic_sku_retiring'
  | 'missing_assignment_resolution'
  | 'attached_to_direct_nic'
  | 'attached_to_bastion'
  | 'attached_to_azure_firewall'
  | 'attached_to_app_gateway'
  | 'attached_to_load_balancer'
  | 'attached_to_nat_gateway'
  | 'orphaned_graph_reference'
  | 'rdp_exposed'
  | 'ssh_exposed'
  | 'https_exposed'
  | 'database_exposed'
  | 'kafka_exposed'
  | 'other_exposed';

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
  /** Endpoint count with database exposure evidence; older producers may omit it. */
  exposedDatabase?: number;
  /** Endpoint count with Kafka exposure evidence; older producers may omit it. */
  exposedKafka?: number;
  /** Endpoint count with exposure evidence outside the named service categories. */
  exposedOther?: number;
  byService: Record<string, number>;
  byConcern: Record<string, number>;
  byLocation: Record<string, number>;
  byPrefix: Record<string, number>;
  broadManagementExposure?: number;
  restrictedManagementExposure?: number;
  remediationOptionCounts?: Record<string, number>;
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

export interface PublicIpAddressesPortRange {
  value: string;
  from: number | null;
  to: number | null;
}

export interface PublicIpAddressesNsgRuleMetadata {
  id?: string;
  name?: string;
  networkSecurityGroupId?: string;
  networkSecurityGroupName?: string;
  priority?: number;
  direction?: PublicIpAddressesRuleDirection;
  access?: PublicIpAddressesRuleAccess;
  sourceAddressPrefixes?: string[];
  sourcePortRanges?: string[];
  destinationAddressPrefixes?: string[];
  destinationPortRanges?: string[];
  protocol?: PublicIpAddressesExposureProtocol;
  description?: string;
}

export interface PublicIpAddressesExposureScope {
  kind: PublicIpAddressesExposureScopeKind;
  resourceId?: string;
  resourceName?: string;
  resourceType?: string;
}

/** Native security-group evidence. Azure NSG rule evidence retains its nsgRule shape. */
export interface PublicIpAddressesSecurityGroupRuleMetadata {
  id?: string;
  name?: string;
  groupId?: string;
  groupName?: string;
  direction?: PublicIpAddressesRuleDirection;
  access?: PublicIpAddressesRuleAccess;
  sourceAddressPrefixes?: string[];
  destinationPortRanges?: string[];
  protocol?: PublicIpAddressesExposureProtocol;
  description?: string;
}

export interface PublicIpAddressesExposure {
  kind: PublicIpAddressesExposureKind;
  evidenceSource: PublicIpAddressesExposureEvidenceSource;
  evidence: string;
  confidence: PublicIpAddressesExposureConfidence;
  sourceKind?: PublicIpAddressesExposureSourceKind;
  sourcePrefixes?: string[];
  destinationPortRanges?: PublicIpAddressesPortRange[];
  protocol?: PublicIpAddressesExposureProtocol;
  nsgRule?: PublicIpAddressesNsgRuleMetadata;
  securityGroupRule?: PublicIpAddressesSecurityGroupRuleMetadata;
  scope?: PublicIpAddressesExposureScope;
  effectiveReachability?: PublicIpAddressesEffectiveReachability;
  reason?: string;
}

export interface PublicIpAddressesReferenceLink {
  label: string;
  url: string;
}

export interface PublicIpAddressesCostRange {
  currency?: string;
  minMonthly?: number;
  maxMonthly?: number;
  billingPeriod?: 'monthly' | 'one_time' | 'usage_based' | 'unknown';
  summary?: string;
}

export interface PublicIpAddressesRemediationAction {
  label: string;
  summary?: string;
  links?: PublicIpAddressesReferenceLink[];
}

export interface PublicIpAddressesRemediationOption {
  kind: PublicIpAddressesRemediationOptionKind;
  label: string;
  summary: string;
  suitability: PublicIpAddressesRemediationSuitability;
  estimatedMonthlyCostRange?: PublicIpAddressesCostRange;
  effort?: PublicIpAddressesRemediationLevel;
  risk?: PublicIpAddressesRemediationLevel;
  impact?: PublicIpAddressesRemediationLevel;
  actions?: PublicIpAddressesRemediationAction[];
  links?: PublicIpAddressesReferenceLink[];
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
  remediationOptions?: PublicIpAddressesRemediationOption[];
  concerns: PublicIpAddressesConcern[];
  tags: Record<string, string>;
}

export interface PublicIpAddressesReport {
  schemaVersion?: typeof PUBLIC_IP_ADDRESSES_SCHEMA_VERSION;
  subscription: PublicIpAddressesSubscription;
  timestamp: string;
  summary: PublicIpAddressesSummary;
  items: PublicIpAddressesItem[];
  /** Collection evidence. Omission means completeness is unknown, not complete. */
  coverage?: PublicIpAddressesCoverage;
}

export interface PublicIpAddressesCoverageSource {
  family: string;
  location: string;
  status: 'complete' | 'partial' | 'missing';
  reason?: string;
}

export interface PublicIpAddressesCoverageIssue {
  code: string;
  message: string;
  resourceId?: string;
  family?: string;
  location?: string;
}

/** Complete collection does not prove effective network reachability. */
export interface PublicIpAddressesCoverage {
  status: 'complete' | 'partial' | 'unavailable';
  sources: PublicIpAddressesCoverageSource[];
  issues: PublicIpAddressesCoverageIssue[];
}
