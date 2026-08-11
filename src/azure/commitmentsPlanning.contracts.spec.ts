import {
  ProviderName,
  ProviderScopeType,
  type AwsCommitmentsInventoryItem,
  type AwsCommitmentsPlanningView,
  type AwsCommitmentsPurchaseRecommendation,
  type AzureCommitmentsPlanningView,
  type CommitmentsInventoryItem,
  type CommitmentsPlanningView,
  type CommitmentsPurchaseRecommendation,
  type ProviderScopeRecord,
  type ProviderScopedCommitmentsPlanningView,
} from '../index';

interface ExtendedLegacyCommitmentsPlanningView extends CommitmentsPlanningView {
  consumerExtension?: string;
}

const baseView = {
  version: '2.0',
  generatedAt: '2026-08-11T00:00:00.000Z',
  utilizationSummary: {
    total: 0,
    withData: 0,
    byBenefitType: [],
  },
  expirySummary: {
    expired: 0,
    expiring30d: 0,
    expiring60d: 0,
    expiring90d: 0,
    expiring180d: 0,
  },
  inventory: [],
  resourceCoverage: [],
  obsoleteCandidates: [],
  pricingContext: { source: 'unknown' },
  termStrategy: [],
} satisfies CommitmentsPlanningView;

const legacyAzureView = {
  ...baseView,
  subscription: {
    companyId: 'company-123',
    tenantId: 'tenant-123',
    subscriptionId: 'subscription-123',
    displayName: 'Azure Production',
  },
} satisfies CommitmentsPlanningView;

const extendedLegacyAzureView = {
  ...legacyAzureView,
  consumerExtension: 'consumer-owned',
} satisfies ExtendedLegacyCommitmentsPlanningView;

// @ts-expect-error New provider-aware producers cannot omit provider identity.
const invalidProviderlessStrictView: ProviderScopedCommitmentsPlanningView = baseView;

const providerAwareAzureView = {
  ...legacyAzureView,
  providerScope: {
    providerName: ProviderName.Azure,
    providerScopeId: 'subscription-123',
  },
} satisfies AzureCommitmentsPlanningView;

const invalidProviderAwareAzureIdentity = {
  ...baseView,
  providerScope: providerAwareAzureView.providerScope,
  // @ts-expect-error Provider-aware Azure views retain subscription identity until API migration.
} satisfies AzureCommitmentsPlanningView;

const awsInventoryItem = {
  id: 'ri-123',
  benefitType: 'reservation',
  commitmentFamily: 'compute-reservation',
  sourceKind: 'aws-native',
  sourceId: 'ri-123',
  scope: 'Single',
  appliedScopeType: 'linked-account',
  appliedScopeProperties: {
    accountId: '123456789012',
    region: 'us-east-1',
    availabilityZone: 'us-east-1a',
  },
  type: 'ec2-reserved-instance',
  status: 'active',
  provider: ProviderName.Aws,
  shape: {
    provider: 'aws',
    commitmentFamily: 'compute-reservation',
    resourceType: 'ec2-instance',
    region: 'us-east-1',
    availabilityZone: 'us-east-1a',
    skuName: 'm7i.large',
    platform: 'linux',
    attributes: {
      offeringClass: 'standard',
      instanceCount: 2,
    },
  },
} satisfies AwsCommitmentsInventoryItem;

const awsPurchaseRecommendation = {
  id: 'sp-rec-123',
  groupKey: 'compute-savings-plan:us-east-1',
  commitmentFamily: 'compute-savings-plan',
  action: 'buy',
  purchaseScope: 'linked-account',
  appliedScopeProperties: {
    accountId: '123456789012',
    region: 'us-east-1',
  },
  targetShape: {
    provider: 'aws',
    commitmentFamily: 'compute-savings-plan',
    region: 'us-east-1',
    attributes: { savingsPlanType: 'COMPUTE_SP' },
  },
  source: {
    sourceKind: 'aws-native',
    sourceId: 'sp-rec-123',
  },
  termMonths: 12,
  quantity: 1,
  estimatedAnnualSavings: {
    amount: 1200,
    currency: 'USD',
  },
} satisfies AwsCommitmentsPurchaseRecommendation;

const awsView = {
  ...baseView,
  providerScope: {
    providerName: ProviderName.Aws,
    providerScopeId: '123456789012',
  },
  inventory: [awsInventoryItem],
  purchaseRecommendations: [awsPurchaseRecommendation],
  pricingContext: { source: 'recommendation-apis', currency: 'USD' },
  freshness: {
    status: 'current',
    generatedAt: '2026-08-11T00:00:00.000Z',
    entries: [
      {
        section: 'inventory',
        status: 'current',
        sourceKind: 'aws-native',
      },
    ],
  },
} satisfies AwsCommitmentsPlanningView;

const invalidAwsSubscriptionIdentity = {
  ...awsView,
  // @ts-expect-error AWS artifacts cannot also carry legacy Azure subscription identity.
  subscription: legacyAzureView.subscription,
} satisfies AwsCommitmentsPlanningView;

const internalProviderScope = {
  providerName: ProviderName.Aws,
  providerScopeId: '123456789012',
  companyId: 'company-123',
  scopeType: ProviderScopeType.Account,
  name: 'AWS Production',
  cloudAccountId: 'cloud-account-123',
  status: 'active',
} satisfies ProviderScopeRecord;

const invalidTypedPublicProviderScope = {
  ...awsView,
  // @ts-expect-error Internal provider-index records are not public artifact identities.
  providerScope: internalProviderScope,
} satisfies AwsCommitmentsPlanningView;

const invalidPublicProviderScopeMetadata = {
  ...awsView,
  providerScope: {
    providerName: ProviderName.Aws,
    providerScopeId: '123456789012',
    // @ts-expect-error Public artifacts cannot expose internal provider-index metadata.
    companyId: 'company-123',
  },
} satisfies AwsCommitmentsPlanningView;

const invalidAwsInventoryProvider = {
  ...awsInventoryItem,
  // @ts-expect-error AWS-native inventory must identify the AWS provider.
  provider: ProviderName.Azure,
} satisfies AwsCommitmentsInventoryItem;

const invalidLinkedAccountIdentity = {
  ...awsInventoryItem,
  // @ts-expect-error Linked-account inventory must identify its AWS account.
  appliedScopeProperties: { region: 'us-east-1' },
} satisfies AwsCommitmentsInventoryItem;

const invalidAwsRecommendationSource = {
  ...awsPurchaseRecommendation,
  source: {
    // @ts-expect-error AWS recommendations require AWS-native source evidence.
    sourceKind: 'azure-native',
  },
} satisfies AwsCommitmentsPurchaseRecommendation;

const invalidAwsRecommendationShape = {
  ...awsPurchaseRecommendation,
  targetShape: {
    ...awsPurchaseRecommendation.targetShape,
    // @ts-expect-error AWS recommendations cannot carry an Azure target shape.
    provider: 'azure',
  },
} satisfies AwsCommitmentsPurchaseRecommendation;

const invalidAwsRecommendationEligibility = {
  ...awsPurchaseRecommendation,
  eligibility: {
    status: 'available_now',
    action: 'buy',
    targetShape: {
      // @ts-expect-error AWS recommendation eligibility cannot carry Azure shapes.
      provider: 'azure',
    },
  },
} satisfies AwsCommitmentsPurchaseRecommendation;

const invalidAwsPricingQuote = {
  ...awsPurchaseRecommendation,
  // @ts-expect-error Azure reservation quote payloads are forbidden on AWS recommendations.
  pricingQuote: {},
} satisfies AwsCommitmentsPurchaseRecommendation;

const invalidAwsStorageCapacity = {
  ...awsView,
  // @ts-expect-error Azure storage-capacity planning is forbidden on AWS views.
  storageCapacity: {},
} satisfies AwsCommitmentsPlanningView;

const invalidAwsCredentialHealth = {
  ...awsView,
  // @ts-expect-error Internal Azure credential health is forbidden on AWS views.
  credentialHealth: { credentialId: 'credential-123' },
} satisfies AwsCommitmentsPlanningView;

const invalidCommitmentFamily = {
  ...awsInventoryItem,
  // @ts-expect-error Commitment families use a closed provider-neutral vocabulary.
  commitmentFamily: 'ec2-reserved-instance',
} satisfies CommitmentsInventoryItem;

const invalidSourceKind = {
  ...awsInventoryItem,
  // @ts-expect-error Commitment sources use a closed provider-aware vocabulary.
  sourceKind: 'cost-explorer',
} satisfies CommitmentsInventoryItem;

const invalidAppliedScope = {
  ...awsInventoryItem,
  // @ts-expect-error Payer scope is deferred until its authority contract is approved.
  appliedScopeType: 'payer-account',
} satisfies CommitmentsInventoryItem;

const invalidPurchaseScope = {
  ...awsPurchaseRecommendation,
  // @ts-expect-error Payer scope is deferred until its authority contract is approved.
  purchaseScope: 'payer-account',
} satisfies CommitmentsPurchaseRecommendation;

const invalidBenefitScope = {
  ...awsInventoryItem,
  // @ts-expect-error AWS sharing maps to the existing coarse BenefitScope vocabulary.
  scope: 'Organization',
} satisfies CommitmentsInventoryItem;

void [
  legacyAzureView,
  extendedLegacyAzureView,
  invalidProviderlessStrictView,
  providerAwareAzureView,
  invalidProviderAwareAzureIdentity,
  awsView,
  invalidAwsSubscriptionIdentity,
  invalidPublicProviderScopeMetadata,
  invalidTypedPublicProviderScope,
  invalidAwsInventoryProvider,
  invalidLinkedAccountIdentity,
  invalidAwsRecommendationSource,
  invalidAwsRecommendationShape,
  invalidAwsRecommendationEligibility,
  invalidAwsPricingQuote,
  invalidAwsStorageCapacity,
  invalidAwsCredentialHealth,
  invalidCommitmentFamily,
  invalidSourceKind,
  invalidAppliedScope,
  invalidPurchaseScope,
  invalidBenefitScope,
];
