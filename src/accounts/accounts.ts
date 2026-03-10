import { SurveyResponse } from '../company';

export type SubscriptionType = 'Production' | 'Non-Production' | 'Mixed';

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
  writeSecret?: string;
  writeSecretExpiresAt?: Date;
  writeClientId?: string;
  writeBitmask?: number;
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
}

export interface SubscriptionAccount extends SubscriptionInfoBase {
  /** Partition Key (Azure Subscription ID) */
  id: string;
  /** Row Key */
  companyId: string;
}
