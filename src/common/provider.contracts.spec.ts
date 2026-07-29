import {
  ProviderName,
  ProviderScopeType,
  type AwsAccountProviderScope,
  type AzureSubscriptionProviderScope,
  type ProviderScope,
  type ProviderScopeRecord,
} from '../index';

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
} satisfies AwsAccountProviderScope;

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
  invalidAwsProvider,
  invalidAwsScopeType,
  invalidAzureProvider,
  invalidAzureScopeType,
  invalidProviderScopeRecord,
];
