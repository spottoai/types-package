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
    parentIntegrationSettings?: ParentIntegrationSettings[];
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
//# sourceMappingURL=company.d.ts.map