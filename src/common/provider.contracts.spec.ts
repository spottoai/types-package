import {
  ProviderName,
  ProviderScopeType,
  type AwsAccountState,
  type AwsAccountProviderScope,
  type AzureSubscriptionProviderScope,
  type CloudAccount,
  type EnvironmentType,
  type ProviderScope,
  type ProviderScopeDisplayMetadataUpdateRequest,
  type ProviderScopeRecord,
  type ProviderScopeSelectionItem,
  type SubscriptionType,
} from '../index';

const environmentType: EnvironmentType = 'Production';
const subscriptionType: SubscriptionType = environmentType;
const environmentTypeFromSubscription: EnvironmentType = subscriptionType;

const awsAccountState: AwsAccountState = 'ACTIVE';

const azureSubscriptionScope = {
  providerName: ProviderName.Azure,
  providerScopeId: '12345678-1234-1234-1234-123456789012',
  companyId: 'company-123',
  scopeType: ProviderScopeType.Subscription,
  name: 'Production',
  cloudAccountId: 'azure-cloud-account-123',
  status: 'Enabled',
} satisfies AzureSubscriptionProviderScope;

const awsAccountScope = {
  providerName: ProviderName.Aws,
  providerScopeId: '123456789012',
  companyId: 'company-123',
  scopeType: ProviderScopeType.Account,
  name: 'Production AWS',
  cloudAccountId: 'aws-cloud-account-123',
  status: 'active',
  providerAccountName: 'Spotto Production',
  providerAccountCreatedAt: '2024-04-05T06:07:08.000Z',
  providerAccountState: awsAccountState,
} satisfies AwsAccountProviderScope;

const providerScopeSelectionItem = {
  companyId: 'company-123',
  providerName: ProviderName.Aws,
  providerScopeId: '123456789012',
  scopeType: ProviderScopeType.Account,
  name: 'Production AWS',
  friendlyName: 'Payments',
  displayName: 'Payments',
  configuredName: 'Production AWS',
  providerAccountName: 'Spotto Production',
  providerAccountCreatedAt: '2024-04-05T06:07:08.000Z',
  providerAccountState: 'ACTIVE',
  cloudAccountId: 'aws-cloud-account-123',
  cloudAccountName: 'Production AWS',
  groupName: 'Customer workloads',
  icon: '/moneybag',
  environmentType: 'Production',
  ready: true,
} satisfies ProviderScopeSelectionItem;

const providerScopeMetadataUpdate: ProviderScopeDisplayMetadataUpdateRequest = {
  friendlyName: 'Payments',
  groupName: 'Customer workloads',
  icon: '/moneybag',
  environmentType: 'Production',
};

const providerScopeMetadataClear: ProviderScopeDisplayMetadataUpdateRequest = {
  friendlyName: null,
  groupName: null,
  icon: null,
  environmentType: null,
};

const providerScopeMetadataPartialUpdate: ProviderScopeDisplayMetadataUpdateRequest = {
  friendlyName: 'Payments production',
};

const storedAwsDisplayMetadata = {
  friendlyName: 'Payments',
  groupName: 'Customer workloads',
  icon: '/moneybag',
  environmentType: 'Production',
} satisfies Pick<CloudAccount, 'friendlyName' | 'groupName' | 'icon' | 'environmentType'>;

const invalidProviderScopeEnvironmentUpdate: ProviderScopeDisplayMetadataUpdateRequest = {
  // @ts-expect-error Environment classification uses the closed shared vocabulary.
  environmentType: 'Development',
};

const invalidAwsAccountState: AwsAccountProviderScope = {
  ...awsAccountScope,
  // @ts-expect-error AWS provider state uses the Account Management lifecycle vocabulary.
  providerAccountState: 'PENDING_CLOSURE',
};

const invalidProviderFactMutation: ProviderScopeDisplayMetadataUpdateRequest = {
  // @ts-expect-error Native provider facts are read-only and cannot be changed through display metadata.
  providerAccountName: 'Renamed in Spotto',
};

const invalidAwsSensitiveFact: AwsAccountProviderScope = {
  ...awsAccountScope,
  // @ts-expect-error Public provider-scope facts must not expose AWS account email.
  providerAccountEmail: 'owner@example.com',
};

const providerScopeRecords: ProviderScopeRecord[] = [azureSubscriptionScope, awsAccountScope];

const providerScopeIdentities: ProviderScope[] = providerScopeRecords;

const invalidAwsProvider: AwsAccountProviderScope = {
  ...awsAccountScope,
  // @ts-expect-error An AWS account record must use the AWS provider discriminator.
  providerName: ProviderName.Azure,
};

const invalidAwsScopeType: AwsAccountProviderScope = {
  ...awsAccountScope,
  // @ts-expect-error An AWS account record cannot use subscription scope.
  scopeType: ProviderScopeType.Subscription,
};

const invalidAzureProvider: AzureSubscriptionProviderScope = {
  ...azureSubscriptionScope,
  // @ts-expect-error An Azure subscription record must use the Azure provider discriminator.
  providerName: ProviderName.Aws,
};

const invalidAzureScopeType: AzureSubscriptionProviderScope = {
  ...azureSubscriptionScope,
  // @ts-expect-error An Azure subscription record cannot use account scope.
  scopeType: ProviderScopeType.Account,
};

const invalidProviderScopeRecord: ProviderScopeRecord = {
  ...awsAccountScope,
  // @ts-expect-error Provider-scope records use the closed scope-type vocabulary.
  scopeType: 'organization',
};

void [
  providerScopeRecords,
  providerScopeIdentities,
  environmentType,
  subscriptionType,
  environmentTypeFromSubscription,
  providerScopeSelectionItem,
  providerScopeMetadataUpdate,
  providerScopeMetadataClear,
  providerScopeMetadataPartialUpdate,
  storedAwsDisplayMetadata,
  invalidProviderScopeEnvironmentUpdate,
  invalidAwsAccountState,
  invalidProviderFactMutation,
  invalidAwsSensitiveFact,
  invalidAwsProvider,
  invalidAwsScopeType,
  invalidAzureProvider,
  invalidAzureScopeType,
  invalidProviderScopeRecord,
];
