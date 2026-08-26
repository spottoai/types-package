export enum ProviderName {
  Azure = 'azure',
  Aws = 'aws',
}

/** Provider-neutral user classification for a connected cloud environment. */
export type EnvironmentType = 'Production' | 'Non-Production' | 'Mixed';

/** Lifecycle states returned by AWS Account Management. */
export type AwsAccountState = 'PENDING_ACTIVATION' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

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

/** User-owned display metadata shared by provider scopes and cloud accounts. */
export interface ProviderScopeDisplayMetadata {
  /** Raw user override. This is distinct from provider and configured names. */
  friendlyName?: string;
  groupName?: string;
  icon?: string;
  environmentType?: EnvironmentType;
}

/** Provider-aware scope data returned to shared selectors and account displays. */
export interface ProviderScopeSelectionItem extends ProviderScopeDisplayMetadata, ProviderScope {
  companyId: string;
  scopeType: ProviderScopeType;
  /** Legacy provider-scope name retained for mixed-version consumers. */
  name: string;
  /** Server-computed effective name after applying the documented fallback order. */
  displayName?: string;
  /** Account name supplied during provider setup or manifest configuration. */
  configuredName?: string;
  /** Native provider account name. This value is read-only provider data. */
  providerAccountName?: string;
  /** ISO-8601 native provider account creation timestamp. */
  providerAccountCreatedAt?: string;
  /** Native AWS account lifecycle state. */
  providerAccountState?: AwsAccountState;
  cloudAccountId: string;
  cloudAccountName: string;
  /** Azure compatibility field; new provider-neutral consumers use environmentType. */
  subscriptionType?: EnvironmentType;
  status?: string;
  statusLabel?: string;
  currencyCode?: string;
  currencySymbol?: string;
  ready: boolean;
  secureScore?: number;
  spend30Days?: number;
}

/** Partial provider-scope display update; omitted fields stay unchanged and null clears an override. */
export interface ProviderScopeDisplayMetadataUpdateRequest {
  friendlyName?: string | null;
  groupName?: string | null;
  icon?: string | null;
  environmentType?: EnvironmentType | null;
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
  /** Native AWS Account Management name, when enrichment is permitted. */
  providerAccountName?: string;
  /** ISO-8601 AWS account creation timestamp, when enrichment is permitted. */
  providerAccountCreatedAt?: string;
  /** Native AWS Account Management lifecycle state, when enrichment is permitted. */
  providerAccountState?: AwsAccountState;
}

/** Canonical indexed provider-scope record. */
export type ProviderScopeRecord = AzureSubscriptionProviderScope | AwsAccountProviderScope;
