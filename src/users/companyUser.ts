import type { InviteType, OnboardingIntent } from './user';
import type { CustomPropertyValues } from '../customProperties';

export type CompanyUserAuthMode = 'cognito' | 'sso' | 'unknown';

export class CompanyUser {
  id?: string;
  userId!: string;
  companyId!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: number;
  isPendingInvite!: boolean;
  authProviderName?: string;
  authProviderType?: string;
  authMode?: CompanyUserAuthMode;
  canResetPassword?: boolean;
  canResetMfa?: boolean;
  invitedBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
  inviteType?: InviteType;
  onboardingIntent?: OnboardingIntent;
  canConnectAzureTrial?: boolean;
  onboardingIntentCreatedAt?: Date | string;
  onboardingIntentExpiresAt?: Date | string;
  customProperties?: CustomPropertyValues;
}

export interface CompanyUserHierarchyLocation {
  companyId: string;
  companyName: string;
}

/** One explicit company membership, enriched with its hierarchy and effective access. */
export interface CompanyUserHierarchyAssignment {
  user: CompanyUser;
  companyId: string;
  companyName: string;
  hierarchyPath: CompanyUserHierarchyLocation[];
  hierarchyDepth: number;
  directRoleKeys: string[];
  effectiveRoleKeys: string[];
  effectivePermissionKeys: string[];
}

export interface CompanyUserHierarchyResponse {
  rootCompanyId: string;
  assignments: CompanyUserHierarchyAssignment[];
}

export interface CompanyUserRemovalRequest {
  includeDescendants: boolean;
}

export interface CompanyUserRemovalResult {
  rootCompanyId: string;
  removedCompanyIds: string[];
  remainingCompanyCount: number;
  identityDeleted: boolean;
}
