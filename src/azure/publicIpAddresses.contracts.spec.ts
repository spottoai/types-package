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
    exposedRdp: 0,
    exposedSsh: 0,
    exposedHttps: 1,
    byService: {
      load_balancer: 1,
      application_gateway: 1,
    },
    byConcern: {
      attached_to_load_balancer: 1,
      attached_to_app_gateway: 1,
      https_exposed: 1,
    },
    byLocation: {
      centralus: 2,
    },
    byPrefix: {},
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
      exposures: [],
      concerns: ['attached_to_load_balancer'],
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

void invalidPublicIpAddressesReportSchemaVersion;
void invalidPublicIpAddressesAssociatedService;
void invalidPublicIpAddressesConcern;
