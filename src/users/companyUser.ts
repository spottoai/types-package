import type { InviteType, OnboardingIntent } from './user';

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
}
