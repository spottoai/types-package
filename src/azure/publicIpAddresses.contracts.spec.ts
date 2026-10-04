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

// AWS shares the report envelope while retaining native ARNs and rule evidence.
const awsPublicIpAddressesReport: PublicIpAddressesReport = {
  schemaVersion: PUBLIC_IP_ADDRESSES_SCHEMA_VERSION,
  subscription: {
    companyId: 'comp-123',
    subscriptionId: '123456789012',
    displayName: 'Production AWS account',
  },
  timestamp: '2026-10-04T05:18:44.163Z',
  summary: {
    ...publicIpAddressesReport.summary,
    total: 1,
    assigned: 1,
    exposedRdp: 0,
    exposedHttps: 0,
    exposedDatabase: 1,
    byService: { database: 1 },
    byConcern: { database_exposed: 1 },
    byLocation: { 'ap-southeast-2': 1 },
    remediationOptionCounts: { restrict_ingress_allowlist: 1 },
  },
  coverage: {
    status: 'partial',
    sources: [
      { family: 'rds-db-instances', location: 'ap-southeast-2', status: 'complete' },
      { family: 'ec2-security-groups', location: 'ap-southeast-2', status: 'partial', reason: 'One security group reference is unresolved.' },
      { family: 'elbv2-listeners', location: 'ap-southeast-2', status: 'missing', reason: 'Collection was denied.' },
    ],
    issues: [{
      code: 'missing_security_group',
      message: 'Referenced security group was not collected; absence of exposure findings does not establish safety.',
      resourceId: 'arn:aws:rds:ap-southeast-2:123456789012:db:production',
      family: 'ec2-security-groups',
      location: 'ap-southeast-2',
    }],
  },
  items: [{
    ...publicIpAddressesReport.items[0],
    id: 'arn:aws:rds:ap-southeast-2:123456789012:db:production',
    name: 'production',
    resourceGroup: null,
    location: 'ap-southeast-2',
    sku: { name: null, tier: null },
    zones: [],
    allocationMethod: null,
    ipVersion: null,
    ipAddress: null,
    fqdn: 'production.example.us-east-1.rds.amazonaws.com',
    assignment: {
      via: 'direct_ip_configuration',
      resourceId: 'arn:aws:rds:ap-southeast-2:123456789012:db:production',
      resourceName: 'production',
      resourceType: 'AWS::RDS::DBInstance',
      parentResourceId: null,
      parentResourceName: null,
      parentResourceType: null,
      evidence: ['rds:PubliclyAccessible'],
    },
    associatedResource: 'production',
    associatedResourceType: 'AWS::RDS::DBInstance',
    associatedService: 'database',
    exposures: [{
      kind: 'database',
      evidenceSource: 'security_group_rule',
      evidence: 'Security group allows TCP/5432 from 0.0.0.0/0.',
      confidence: 'medium',
      sourceKind: 'internet',
      sourcePrefixes: ['0.0.0.0/0'],
      destinationPortRanges: [{ value: '5432', from: 5432, to: 5432 }],
      protocol: 'tcp',
      effectiveReachability: 'possible',
      securityGroupRule: {
        id: 'sgr-0123456789abcdef0',
        name: 'public-postgres',
        groupId: 'sg-0123456789abcdef0',
        groupName: 'database',
        direction: 'inbound',
        access: 'allow',
        sourceAddressPrefixes: ['0.0.0.0/0'],
        destinationPortRanges: ['5432'],
        protocol: 'tcp',
        description: 'Public database access',
      },
    }],
    concerns: ['database_exposed'],
    remediationOptions: [{
      kind: 'restrict_ingress_allowlist',
      label: 'Restrict ingress to approved sources',
      summary: 'Limit database ingress to approved private networks or CIDR ranges.',
      suitability: 'recommended',
    }],
  }],
};

const awsListenerExposure: PublicIpAddressesReport['items'][number]['exposures'][number] = {
  kind: 'https',
  evidenceSource: 'lb_listener',
  evidence: 'Internet-facing load balancer has a TLS listener on TCP/443.',
  confidence: 'medium',
  effectiveReachability: 'possible',
};

const awsPrivateSessionOption: PublicIpAddressesReport['items'][number]['remediationOptions'] = [{
  kind: 'private_session_access',
  label: 'Use private session access',
  summary: 'Use AWS Systems Manager Session Manager for administration.',
  suitability: 'conditional',
}, {
  kind: 'front_with_waf',
  label: 'Protect web ingress with a WAF',
  summary: 'Use a compatible web application firewall for HTTPS services.',
  suitability: 'conditional',
}];

const invalidCoverage: NonNullable<PublicIpAddressesReport['coverage']> = {
  // @ts-expect-error report coverage never represents missing evidence as healthy.
  status: 'healthy',
  sources: [],
  issues: [],
};

const invalidSecurityGroupRule: NonNullable<typeof awsListenerExposure.securityGroupRule> = {
  // @ts-expect-error AWS rule metadata uses groupId; Azure-specific metadata stays in nsgRule.
  networkSecurityGroupId: 'sg-0123456789abcdef0',
};

void awsPublicIpAddressesReport;
void awsListenerExposure;
void awsPrivateSessionOption;
void invalidCoverage;
void invalidSecurityGroupRule;

// Public Kafka and nonstandard TCP/UDP services retain native ports and source uncertainty.
const kafkaExposure: PublicIpAddressesReport['items'][number]['exposures'][number] = {
  kind: 'kafka',
  evidenceSource: 'security_group_rule',
  evidence: 'Captured MSK public bootstrap broker and TCP/9194 ingress.',
  confidence: 'medium',
  sourceKind: 'restricted_public',
  sourcePrefixes: ['203.0.113.10/32'],
  destinationPortRanges: [{ value: '9194', from: 9194, to: 9194 }],
  protocol: 'tcp',
  effectiveReachability: 'possible',
};
const otherExposure: typeof kafkaExposure = {
  kind: 'other',
  evidenceSource: 'lb_listener',
  evidence: 'Captured nonstandard UDP listener on port 7777; routing was not evaluated.',
  confidence: 'medium',
  sourceKind: 'unknown',
  destinationPortRanges: [{ value: '7777', from: 7777, to: 7777 }],
  protocol: 'udp',
  effectiveReachability: 'unknown',
};
const messageBrokerReport: PublicIpAddressesReport = {
  ...awsPublicIpAddressesReport,
  summary: { ...awsPublicIpAddressesReport.summary, exposedKafka: 1, exposedOther: 1 },
  items: [
    {
      ...awsPublicIpAddressesReport.items[0],
      id: 'arn:aws:kafka:ap-southeast-2:123456789012:cluster/production/01234567-abcd-4321-abcd-0123456789ab-1',
      associatedService: 'message_broker',
      exposures: [kafkaExposure, otherExposure],
      concerns: ['kafka_exposed', 'other_exposed'],
    },
  ],
};
const legacySummaryCounts: Pick<PublicIpAddressesReport['summary'], 'exposedKafka' | 'exposedOther'> = {};
const invalidKafkaExposure: typeof kafkaExposure = {
  ...kafkaExposure,
  // @ts-expect-error native service names do not replace the shared exposure vocabulary.
  kind: 'mqtt',
};
const invalidKafkaPort: typeof kafkaExposure = {
  ...kafkaExposure,
  // @ts-expect-error destination port bounds use numbers, not provider strings.
  destinationPortRanges: [{ value: '9194', from: '9194', to: 9194 }],
};
const invalidKafkaReachability: typeof kafkaExposure = {
  ...kafkaExposure,
  // @ts-expect-error source evidence does not introduce a confirmed reachability value.
  effectiveReachability: 'confirmed',
};
const invalidMessageBrokerConcern: PublicIpAddressesReport['items'][number]['concerns'] = [
  // @ts-expect-error provider product names do not replace the shared concern vocabulary.
  'msk_exposed',
];
const invalidKafkaCount: typeof legacySummaryCounts = {
  // @ts-expect-error exposure endpoint counts use numeric summary fields.
  exposedKafka: '1',
};
void [
  messageBrokerReport,
  legacySummaryCounts,
  invalidKafkaExposure,
  invalidKafkaPort,
  invalidKafkaReachability,
  invalidMessageBrokerConcern,
  invalidKafkaCount,
];
