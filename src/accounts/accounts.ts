export interface CompanySubscription {
  companyId: string; // Partition Key
  id: string; // Row Key (Azure Subscription ID)
  name: string;
  cloudAccountId: string;
  cloudAccountName: string;
  status?: string;
  error?: string;
  lastUpdated?: string;
  duration?: string;
  currency?: string;
  currencySymbol?: string;
  foundCurrency?: boolean;
}

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

export interface SurveyResponse {
  id: string;
  label: string;
  value: string | string[] | number | boolean;
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
}
