import { SurveyResponse } from './survey';
import { NotificationSubscription } from './notification';
import type { CompanyClassification } from './companyHierarchy';
import type { CustomPropertyDefinition, CustomPropertyValues } from '../customProperties';
import type { PortalDelegationScope } from '../features-and-permissions/access';

export type CompanyLifecycle = 'standard' | 'trial';

export type CompanyOnboardingStatus = 'in_progress' | 'completed' | 'dismissed';

export type CompanyOnboardingStep = 'company' | 'invite_users' | 'cloud_account' | 'complete';

export type CompanyCloudAccountIntent = 'connect_now' | 'delegated' | 'later';

export interface CompanyOnboardingState {
  status: CompanyOnboardingStatus;
  currentStep: CompanyOnboardingStep;
  cloudAccountIntent?: CompanyCloudAccountIntent;
  updatedAt: string;
}

export interface UpdateCompanyOnboardingRequest {
  status?: CompanyOnboardingStatus;
  currentStep?: CompanyOnboardingStep;
  cloudAccountIntent?: CompanyCloudAccountIntent;
}

export interface CompanyBusinessHoursPeriod {
  startDayOfWeek: number;
  startTimeLocal: string;
  endDayOfWeek: number;
  endTimeLocal: string;
}

export interface CompanyBusinessHours {
  periods: CompanyBusinessHoursPeriod[];
}

export interface Company {
  id: string;
  name: string;
  companyId?: string;
  companyName?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
  preferredTimezone?: string;
  businessHours?: CompanyBusinessHours;
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
  setupComplete?: boolean;
  /** Tracks onboarding decisions only; cloud connectivity remains authoritative in cloud-account records. */
  onboarding?: CompanyOnboardingState;
  azureDelegatedTrialStartedAt?: Date | string;
  azureDelegatedTrialUsedAt?: Date | string;
  azureDelegatedTrialExpiresAt?: Date | string;
  customPropertyDefinitions?: CustomPropertyDefinition[];
  customProperties?: CustomPropertyValues;
}

export interface CompanyCreate {
  name: string;
  website?: string;
  createdAt?: Date | string;
  preferredTimezone?: string;
  businessHours?: CompanyBusinessHours;
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
  setupComplete?: boolean;
  azureDelegatedTrialStartedAt?: Date | string;
  azureDelegatedTrialUsedAt?: Date | string;
  azureDelegatedTrialExpiresAt?: Date | string;
  customProperties?: CustomPropertyValues;
}

export interface UserCompany {
  email: string;
  companyId: string;
  companyName: string;
  userId: string;
  role: number;
  advancedRoles?: Array<{
    roleKey: string;
    delegationScope: PortalDelegationScope;
  }>;
  cloudAccountCount?: number;
  isDemo?: boolean;
  parentId?: string;
  parentCompanyName?: string;
  hasChildren?: boolean;
  rootCompanyId?: string;
  classification?: CompanyClassification;
  companyLifecycle?: CompanyLifecycle;
  setupComplete?: boolean;
  azureDelegatedTrialExpiresAt?: Date | string;
}

export type KnownIntegrationProvider = 'jira' | 'halo' | 'connectwise' | 'autotask' | 'azuredevops' | 'github';
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
