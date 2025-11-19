import { SurveyResponse } from './survey';
import { NotificationSubscription } from './notification';

export interface Company {
  id: string;
  name: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface CompanyCreate {
  name: string;
  website?: string;
  domains?: string;
  requiresApproval?: boolean;
  defaultRole?: number;
  objectives?: SurveyResponse[];
  notifications?: NotificationSubscription[];
  integrations?: CompanyIntegrations;
  parentId?: string;
  billingAccountId?: string;
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
}

export interface CompanyIntegrations {
  enabled: boolean;
  provider: 'jira' | 'halo' | 'connectwise';
  properties: Map<string, string>;
  secret: string;
}
