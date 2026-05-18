import { SurveyResponse } from '../company';
import type { EffortEstimateProfileName } from '../azure/recommendations';

export type SubscriptionType = 'Production' | 'Non-Production' | 'Mixed';
export type CloudAccountAuthMode = 'servicePrincipal' | 'delegatedUser';
export type CloudAccountTenantSyncSource = 'manual' | 'scheduled' | 'onboarding';
export type CloudAccountTenantSyncStatus = 'Idle' | 'Requested' | 'Processing' | 'Completed' | 'Error';
export const SUBSCRIPTION_SYNC_STEP_ORDER = [
  'metrics',
  'resourcegroups',
  'activities',
  'queries',
  'reliability',
  'billing',
  'costestimation',
  'pricing',
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
export type AzureDelegatedOAuthStatePhase =
  | 'discoverTenants'
  | 'tenantSelectionRequired'
  | 'tenantConsent'
  | 'completed'
  | 'failed';

export interface CloudAccount {
  /** Partition Key */
  companyId: string;
  /** Row Key (Azure Client ID, AWS Access Key ID) */
  id: string;
  name: string;
  companyName: string;
  /** AWS, Azure, GCP, etc. */
  provider: string;
  /** Missing authMode should be treated as servicePrincipal by consumers for backward compatibility. */
  authMode?: CloudAccountAuthMode;
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
  tenantSyncStatus?: CloudAccountTenantSyncStatus;
  tenantSyncRequestedAt?: Date;
  tenantSyncStartedAt?: Date;
  tenantSyncCompletedAt?: Date;
  tenantSyncError?: string;
  tenantSyncSource?: CloudAccountTenantSyncSource;
  /** Internal delegated-user token cache. Do not expose this field in public API DTOs. */
  delegatedTokenCache?: string;
  onboardingStatus?: AzureDelegatedOnboardingStatus;
  delegatedSetupExpiresAt?: Date | string;
  delegatedTrialStartedAt?: Date | string;
  delegatedTrialExpiresAt?: Date | string;
  reauthRequired?: boolean;
  lastAuthErrorCode?: AzureDelegatedAuthErrorCode;
  lastAuthErrorAt?: Date | string;
  connectedUserObjectId?: string;
  connectedUserTenantId?: string;
  connectedUserEmail?: string;
  connectedUserDisplayName?: string;
  connectedAt?: Date | string;
  lastTokenRefreshAt?: Date | string;
  lastDelegatedTokenCacheUpdatedAt?: Date | string;
}

export type PublicCloudAccountDto = Omit<CloudAccount, 'delegatedTokenCache' | 'secret' | 'writeSecret'> & {
  /** Display-only masked preview of the stored read secret. Never contains the full secret value. */
  secretPreview?: string;
  /** Display-only masked preview of the stored write secret. Never contains the full secret value. */
  writeSecretPreview?: string;
};

export interface SyncProgressIssue {
  type: 'capabilityMissing' | 'billingExport';
  scope: 'cloudAccount' | 'subscription';
  capabilityKey?: string;
  capabilityDisplayName?: string;
  capabilityDescription?: string;
  requiredRoles?: string[];
  message: string;
  code?: string;
  title?: string;
  remediation?: string;
  sourceSelected?: 'export' | 'query';
  fallbackUsed?: boolean;
  degraded?: boolean;
}

export interface SubscriptionSyncProgressStep {
  id: SubscriptionSyncStepId;
  status: 'idle' | 'pending' | 'queued' | 'inProgress' | 'completed' | 'error';
  attempts: number;
  lastUpdated: string;
  lastError?: string;
  runId?: string;
  active: boolean;
  callCount?: number;
  note?: string;
  issue?: SyncProgressIssue;
}

export interface SubscriptionSyncProgress {
  runId?: string;
  overallStatus: 'idle' | 'processing' | 'completed' | 'error';
  progressLabel: string;
  completedSteps: number;
  totalSteps: number;
  activeComponents: SubscriptionSyncStepId[];
  currentStepId?: SubscriptionSyncStepId;
  lastErrorComponent?: SubscriptionSyncStepId;
  lastErrorMessage?: string;
  initiatedAt?: string;
  completedAt?: string;
  lastUpdated: string;
  steps: SubscriptionSyncProgressStep[];
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
  syncProgress?: SubscriptionSyncProgress | string | null;
}

export interface SubscriptionAccount extends SubscriptionInfoBase {
  /** Partition Key (Azure Subscription ID) */
  id: string;
  /** Row Key */
  companyId: string;
}
