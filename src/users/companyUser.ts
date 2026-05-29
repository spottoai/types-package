import type { InviteType, OnboardingIntent } from './user';

export class CompanyUser {
  id?: string;
  userId!: string;
  companyId!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: number;
  isPendingInvite!: boolean;
  invitedBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
  inviteType?: InviteType;
  onboardingIntent?: OnboardingIntent;
  canConnectAzureTrial?: boolean;
  onboardingIntentCreatedAt?: Date | string;
  onboardingIntentExpiresAt?: Date | string;
}
