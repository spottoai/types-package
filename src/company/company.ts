import { SurveyResponse } from './survey';
import { NotificationSubscription } from './notification';
import type { CompanyClassification } from './companyHierarchy';

export type CompanyLifecycle = 'standard' | 'trial';

export interface Company {
  id: string;
  name: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
  preferredTimezone?: string;
  hourlyRateAmount?: number;
  hourlyRateCurrency?: string;
  loginDomainNames?: string[];
  createdBy: string;
  domains?: string;
  requiresApproval?: boolean;
  defaultRole?: number;
  objectives?: SurveyResponse[];
  notifications?: NotificationSubscription[];
  integrations?: CompanyIntegrations;
  billingAccountId?: string;
  parentId?: string;
  parentCompanyName?: string;
  hasChildren?: boolean;
  rootCompanyId?: string;
  parentIntegrationSettings?: ParentIntegrationSettings[];
  companyLifecycle?: CompanyLifecycle;
  azureDelegatedTrialStartedAt?: Date | string;
  azureDelegatedTrialUsedAt?: Date | string;
  azureDelegatedTrialExpiresAt?: Date | string;
}

export interface CompanyCreate {
  name: string;
  website?: string;
  createdAt?: Date | string;
  preferredTimezone?: string;
  hourlyRateAmount?: number;
  hourlyRateCurrency?: string;
  domains?: string;
  requiresApproval?: boolean;
  defaultRole?: number;
  objectives?: SurveyResponse[];
  notifications?: NotificationSubscription[];
  integrations?: CompanyIntegrations;
  parentId?: string;
  billingAccountId?: string;
  companyLifecycle?: CompanyLifecycle;
  azureDelegatedTrialStartedAt?: Date | string;
  azureDelegatedTrialUsedAt?: Date | string;
  azureDelegatedTrialExpiresAt?: Date | string;
}

export interface UserCompany {
  email: string;
  companyId: string;
  companyName: string;
  userId: string;
  role: number;
  parentId?: string;
  parentCompanyName?: string;
  hasChildren?: boolean;
  rootCompanyId?: string;
  classification?: CompanyClassification;
  companyLifecycle?: CompanyLifecycle;
  azureDelegatedTrialExpiresAt?: Date | string;
}

export type KnownIntegrationProvider = 'jira' | 'halo' | 'connectwise';
export type IntegrationProvider = KnownIntegrationProvider | (string & {});

export interface ParentIntegrationSettings {
  provider: IntegrationProvider;
  credentialOwnerCompanyId?: string;
  properties: Record<string, string>;
}

export interface CompanyIntegrations {
  enabled: boolean;
  provider: IntegrationProvider;
  properties: Map<string, string> | Record<string, string>;
  secret: string;
}
