import { SurveyResponse } from '../company';

export interface CloudAccount {
  companyId: string; // Partition Key
  id: string; // Row Key (Azure Client ID, AWS Access Key ID)
  name: string;
  companyName: string;
  provider: string; // AWS, Azure, GCP, etc.
  tenantId?: string; // Azure Tenant ID
  secret?: string;
  secretExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: string;
  objectives?: SurveyResponse[];
}

export interface SubscriptionAccount {
  id: string; // Partition Key (Azure Subscription ID)
  companyId: string; // Row Key
  name: string;
  cloudAccountId: string;
  cloudAccountName: string;
  status?: string;
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
}
