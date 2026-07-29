export enum ProviderName {
  Azure = 'azure',
  Aws = 'aws',
}

/** Provider-owned resource boundary kind used by indexed scope records. */
export enum ProviderScopeType {
  Subscription = 'subscription',
  Account = 'account',
}

/** Minimal provider-scope identity used by requests, workflows, and storage keys. */
export interface ProviderScope {
  providerName: ProviderName;
  providerScopeId: string;
}

/** Shared indexed-scope fields. Prefer ProviderScopeRecord for concrete records. */
export interface ProviderScopeRecordBase extends ProviderScope {
  companyId: string;
  scopeType: ProviderScopeType;
  name: string;
  cloudAccountId: string;
  status?: string;
}

export interface AzureSubscriptionProviderScope extends ProviderScopeRecordBase {
  providerName: ProviderName.Azure;
  scopeType: ProviderScopeType.Subscription;
}

export interface AwsAccountProviderScope extends ProviderScopeRecordBase {
  providerName: ProviderName.Aws;
  scopeType: ProviderScopeType.Account;
}

/** Canonical indexed provider-scope record. */
export type ProviderScopeRecord = AzureSubscriptionProviderScope | AwsAccountProviderScope;
