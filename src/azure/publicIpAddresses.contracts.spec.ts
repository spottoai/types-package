import type { PublicIpAddressesReport } from './publicIpAddresses';
import { PUBLIC_IP_ADDRESSES_SCHEMA_VERSION } from './publicIpAddresses';

const publicIpAddressesReport: PublicIpAddressesReport = {
  schemaVersion: PUBLIC_IP_ADDRESSES_SCHEMA_VERSION,
  subscription: {
    companyId: 'comp-123',
    tenantId: 'tenant-123',
    subscriptionId: 'sub-123',
    displayName: 'Production',
    properties: {
      secureScore: 27,
      currency: 'NZD',
      currencySymbol: '$',
      foundCurrency: true,
      showAmortizedCosts: true,
    },
  },
  timestamp: '2026-05-01T05:18:44.163Z',
  summary: {
    total: 2,
    assigned: 2,
    unassigned: 0,
    dynamicUnassigned: 0,
    basicSku: 0,
    exposedRdp: 1,
    exposedSsh: 0,
    exposedHttps: 1,
    byService: {
      load_balancer: 1,
      application_gateway: 1,
    },
    byConcern: {
      attached_to_load_balancer: 1,
      attached_to_app_gateway: 1,
      rdp_exposed: 1,
      https_exposed: 1,
    },
    byLocation: {
      centralus: 2,
    },
    byPrefix: {},
    broadManagementExposure: 1,
    restrictedManagementExposure: 0,
    remediationOptionCounts: {
      azure_bastion: 1,
      restrict_nsg_allowlist: 1,
      document_exception: 1,
    },
  },
  items: [
    {
      id: '/subscriptions/sub-123/resourcegroups/rg/providers/microsoft.network/publicipaddresses/pip-lb',
      name: 'pip-lb',
      resourceGroup: 'rg',
      location: 'centralus',
      sku: {
        name: 'Standard',
        tier: 'Regional',
      },
      zones: ['1', '2', '3'],
      allocationMethod: 'Static',
      ipVersion: 'IPv4',
      ipAddress: '20.221.41.154',
      fqdn: null,
      use: 'assigned',
      assignment: {
        via: 'relationship_graph',
        resourceId: '/subscriptions/sub-123/resourcegroups/rg/providers/microsoft.network/loadbalancers/kubernetes',
        resourceName: 'kubernetes',
        resourceType: 'microsoft.network/loadbalancers',
        parentResourceId: null,
        parentResourceName: null,
        parentResourceType: null,
        evidence: ['lb_to_public_ip', 'resolver:arm_id'],
      },
      associatedResource: 'kubernetes',
      associatedResourceType: 'microsoft.network/loadbalancers',
      associatedService: 'load_balancer',
      prefix: null,
      exposures: [
        {
          kind: 'rdp',
          evidenceSource: 'nsg_rule',
          evidence: 'nsg:vm-nsg Allow-RDP permits TCP/3389 from Internet',
          confidence: 'high',
          sourceKind: 'internet',
          sourcePrefixes: ['0.0.0.0/0', '::/0'],
          destinationPortRanges: [
            {
              value: '3389',
              from: 3389,
              to: 3389,
            },
          ],
          protocol: 'tcp',
          nsgRule: {
            id: '/subscriptions/sub-123/resourcegroups/rg/providers/microsoft.network/networksecuritygroups/vm-nsg/securityrules/Allow-RDP',
            name: 'Allow-RDP',
            networkSecurityGroupId: '/subscriptions/sub-123/resourcegroups/rg/providers/microsoft.network/networksecuritygroups/vm-nsg',
            networkSecurityGroupName: 'vm-nsg',
            priority: 100,
            direction: 'inbound',
            access: 'allow',
            sourceAddressPrefixes: ['Internet'],
            sourcePortRanges: ['*'],
            destinationAddressPrefixes: ['*'],
            destinationPortRanges: ['3389'],
            protocol: 'tcp',
            description: 'Temporary admin access',
          },
          scope: {
            kind: 'load_balancer',
            resourceId: '/subscriptions/sub-123/resourcegroups/rg/providers/microsoft.network/loadbalancers/kubernetes',
            resourceName: 'kubernetes',
            resourceType: 'microsoft.network/loadbalancers',
          },
          effectiveReachability: 'effective',
          reason: 'A load balancer rule and effective NSG allow rule make RDP reachable from the public internet.',
        },
      ],
      remediationOptions: [
        {
          kind: 'azure_bastion',
          label: 'Use Azure Bastion',
          summary: 'Replace public RDP access with browser-based private VM administration.',
          suitability: 'recommended',
          estimatedMonthlyCostRange: {
            currency: 'NZD',
            minMonthly: 200,
            maxMonthly: 300,
            billingPeriod: 'monthly',
            summary: 'Depends on Bastion SKU, scale units, and outbound data usage.',
          },
          effort: 'medium',
          risk: 'low',
          impact: 'medium',
          actions: [
            {
              label: 'Deploy Bastion subnet and host',
              summary: 'Create AzureBastionSubnet in the virtual network and deploy a Bastion host.',
            },
            {
              label: 'Close public RDP',
              summary: 'Remove or deny the NSG rule and any load balancer rule that exposes TCP/3389.',
            },
          ],
          links: [
            {
              label: 'Azure Bastion documentation',
              url: 'https://learn.microsoft.com/azure/bastion/',
            },
          ],
        },
        {
          kind: 'restrict_nsg_allowlist',
          label: 'Restrict NSG allowlist',
          summary: 'Limit management access to approved source ranges while a private access path is implemented.',
          suitability: 'conditional',
          effort: 'low',
          risk: 'medium',
          impact: 'medium',
          actions: [
            {
              label: 'Replace Internet source',
              summary: 'Change the NSG rule source from Internet to approved administrator CIDR ranges.',
            },
          ],
        },
        {
          kind: 'document_exception',
          label: 'Document exception',
          summary: 'Record ownership, business justification, expiry, and compensating controls.',
          suitability: 'not_recommended',
          effort: 'low',
          risk: 'high',
          impact: 'low',
        },
      ],
      concerns: ['attached_to_load_balancer', 'rdp_exposed'],
      tags: {
        environment: 'prod',
      },
    },
    {
      id: '/subscriptions/sub-123/resourcegroups/rg/providers/microsoft.network/publicipaddresses/pip-appgw',
      name: 'pip-appgw',
      resourceGroup: 'rg',
      location: 'centralus',
      sku: {
        name: 'Standard',
        tier: 'Regional',
      },
      zones: [],
      allocationMethod: 'Static',
      ipVersion: 'IPv4',
      ipAddress: '40.122.236.103',
      fqdn: null,
      use: 'assigned',
      assignment: {
        via: 'relationship_graph',
        resourceId: '/subscriptions/sub-123/resourcegroups/rg/providers/microsoft.network/applicationgateways/appgw',
        resourceName: 'appgw',
        resourceType: 'microsoft.network/applicationgateways',
        parentResourceId: null,
        parentResourceName: null,
        parentResourceType: null,
        evidence: ['resolver:arm_id', 'appgw_to_public_ip'],
      },
      associatedResource: 'appgw',
      associatedResourceType: 'microsoft.network/applicationgateways',
      associatedService: 'application_gateway',
      prefix: null,
      exposures: [
        {
          kind: 'https',
          evidenceSource: 'appgw_listener',
          evidence: 'appgw:appgw listener on port 443',
          confidence: 'high',
        },
      ],
      concerns: ['attached_to_app_gateway', 'https_exposed'],
      tags: {},
    },
  ],
};

void publicIpAddressesReport;

const legacyPublicIpAddressesReport: PublicIpAddressesReport = {
  ...publicIpAddressesReport,
};
delete legacyPublicIpAddressesReport.schemaVersion;
void legacyPublicIpAddressesReport;

const invalidPublicIpAddressesReportSchemaVersion: PublicIpAddressesReport = {
  ...publicIpAddressesReport,
  // @ts-expect-error public IP addresses report schema version must match the published report contract.
  schemaVersion: '2026-05-02.graph-v1',
};

const invalidPublicIpAddressesAssociatedService: PublicIpAddressesReport = {
  ...publicIpAddressesReport,
  items: [
    {
      ...publicIpAddressesReport.items[0],
      // @ts-expect-error associatedService uses the public IP perimeter service vocabulary.
      associatedService: 'virtual_network',
    },
  ],
};

const invalidPublicIpAddressesConcern: PublicIpAddressesReport = {
  ...publicIpAddressesReport,
  items: [
    {
      ...publicIpAddressesReport.items[0],
      // @ts-expect-error concerns use the public IP perimeter concern vocabulary.
      concerns: ['internet_exposed'],
    },
  ],
};

const invalidPublicIpAddressesExposureSourceKind: PublicIpAddressesReport = {
  ...publicIpAddressesReport,
  items: [
    {
      ...publicIpAddressesReport.items[0],
      exposures: [
        {
          ...publicIpAddressesReport.items[0].exposures[0],
          // @ts-expect-error exposure source kind distinguishes broad internet exposure from supported restricted source types.
          sourceKind: 'corp_allowlist',
        },
      ],
    },
  ],
};

const invalidPublicIpAddressesExposureScope: PublicIpAddressesReport = {
  ...publicIpAddressesReport,
  items: [
    {
      ...publicIpAddressesReport.items[0],
      exposures: [
        {
          ...publicIpAddressesReport.items[0].exposures[0],
          scope: {
            // @ts-expect-error exposure scope uses the public IP perimeter reachability vocabulary.
            kind: 'virtual_network',
          },
        },
      ],
    },
  ],
};

const invalidPublicIpAddressesRemediationOptionKind: PublicIpAddressesReport = {
  ...publicIpAddressesReport,
  items: [
    {
      ...publicIpAddressesReport.items[0],
      remediationOptions: [
        {
          ...publicIpAddressesReport.items[0].remediationOptions![0],
          // @ts-expect-error remediation options use the public IP perimeter remediation vocabulary.
          kind: 'private_endpoint',
        },
      ],
    },
  ],
};

void invalidPublicIpAddressesReportSchemaVersion;
void invalidPublicIpAddressesAssociatedService;
void invalidPublicIpAddressesConcern;
void invalidPublicIpAddressesExposureSourceKind;
void invalidPublicIpAddressesExposureScope;
void invalidPublicIpAddressesRemediationOptionKind;
