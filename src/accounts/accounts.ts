import { SurveyResponse } from '../company';

export interface CloudAccount {
  /** Partition Key */
  companyId: string;
  /** Row Key (Azure Client ID, AWS Access Key ID) */
  id: string;
  name: string;
  companyName: string;
  /** AWS, Azure, GCP, etc. */
  provider: string;
  /** Azure Tenant ID */
  tenantId?: string;
  secret?: string;
  secretExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: string;
  objectives?: SurveyResponse[];
}

export interface SubscriptionInfoBase {
  name: string;
  cloudAccountId: string;
  cloudAccountName: string;
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
