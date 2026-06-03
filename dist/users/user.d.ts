export type InviteType = 'standard' | 'trial';
export type OnboardingIntent = 'azureDelegatedConnect';
export interface InviteOnboardingIntent {
    inviteType?: InviteType;
    onboardingIntent?: OnboardingIntent;
    canConnectAzureTrial?: boolean;
    onboardingIntentCreatedAt?: Date | string;
    onboardingIntentExpiresAt?: Date | string;
}
export interface BaseUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}
export interface User extends BaseUser {
    companyId: string;
    role: number;
    isPendingInvite: boolean;
    invitedBy: string;
    inviteType?: InviteType;
    onboardingIntent?: OnboardingIntent;
    canConnectAzureTrial?: boolean;
    onboardingIntentCreatedAt?: Date | string;
    onboardingIntentExpiresAt?: Date | string;
}
export interface UserProfile extends BaseUser {
    name?: string;
    Timestamp: string;
    criticalAlertsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    language: string;
    marketingNotificationsEnabled: boolean;
    monthlyReportsEnabled: boolean;
    newRecommendationsNotify: boolean;
}
export interface UserInviteLink extends InviteOnboardingIntent {
    link: string;
}
//# sourceMappingURL=user.d.ts.map