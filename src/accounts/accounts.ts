import { SurveyResponse } from '../company';
import type { EffortEstimateProfileName } from '../azure/recommendations';

export type SubscriptionType = 'Production' | 'Non-Production' | 'Mixed';
export type CloudAccountAuthMode = 'servicePrincipal' | 'delegatedUser';
export type CloudAccountTenantSyncSource = 'manual' | 'scheduled' | 'onboarding';
export type CloudAccountTenantSyncStatus = 'Idle' | 'Requested' | 'Processing' | 'Completed' | 'Error';
export type BillingExportLocatorScopeType = 'tenant' | 'billingAccount';

export interface BillingExportLocatorEntry {
  scopeType: BillingExportLocatorScopeType;
  scopePath: string;
  exportName: string;
  storageAccountName: string;
  container: string;
  rootFolderPath: string;
}

export interface CloudAccountBillingExportLocator {
  actual?: BillingExportLocatorEntry;
  amortized?: BillingExportLocatorEntry;
}

export const SUBSCRIPTION_SYNC_STEP_ORDER = [
  'metrics',
  'resourcegroups',
  'activities',
  'queries',
  'reliability',
  'billing',
  'costestimation',
  'pricing',
  'commitments',
  'views',
] as const;
export type SubscriptionSyncStepId = (typeof SUBSCRIPTION_SYNC_STEP_ORDER)[number];
export type AzureDelegatedOnboardingStatus = 'subscriptionSelectionRequired' | 'active' | 'setupExpired';
export type AzureDelegatedAuthErrorCode =
  | 'invalid_grant'
  | 'interaction_required'
  | 'consent_required'
  | 'claims_challenge'
  | 'forbidden'
  | 'unknown';
export type AzureDelegatedOAuthStatePhase = 'discoverTenants' | 'tenantSelectionRequired' | 'tenantConsent' | 'completed' | 'failed';

export interface CloudAccount {
  /** Partition Key */
  companyId: string;
  /** Row Key (Azure Client ID, AWS Access Key ID) */
  id: string;
  name: string;
  companyName: string;
  /** AWS, Azure, GCP, etc. */
  provider: string;
  /** Optional list of subscription group names for this cloud account */
  groupNames?: string[];
  /** Azure Tenant ID */
  tenantId?: string;
  secret?: string;
  secretExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: string;
  objectives?: SurveyResponse[];
  /** Preferred recommendation effort-estimate profile for this cloud account. */
  effortProfile?: EffortEstimateProfileName;
  writeSecret?: string;
  writeSecretExpiresAt?: Date;
  writeClientId?: string;
  writeBitmask?: number;
  readBitmask?: number;
}

export interface SubscriptionInfoBase {
  name: string;
  friendlyName?: string;
  cloudAccountId: string;
  cloudAccountName: string;
  /** Optional group name for subscription-level grouping */
  groupName?: string;
  /** Optional emoji shortcode (Slack-style, e.g. "/face") */
  icon?: string;
  /** Optional subscription type (Production, Non-Production, Mixed) */
  subscriptionType?: SubscriptionType;
  status?: string;
  statusLabel?: string;
  error?: string;
  lastUpdated?: string;
  quotaId?: string;
  duration?: string;
  currency?: string;
  currencySymbol?: string;
  foundCurrency?: boolean;
  ready?: boolean;
  secureScore?: number;
  showAmortizedCosts?: boolean;
  totalCost?: number;
  billingItems?: number;
  activityItems?: number;
  eventId?: string;
  readBitmask?: number;
}

export interface SubscriptionAccount extends SubscriptionInfoBase {
  /** Partition Key (Azure Subscription ID) */
  id: string;
  /** Row Key */
  companyId: string;
}
