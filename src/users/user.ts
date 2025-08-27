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
}

export interface UserProfile extends BaseUser {
  Timestamp: string;
  criticalAlertsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  language: string;
  marketingNotificationsEnabled: boolean;
  monthlyReportsEnabled: boolean;
  newRecommendationsNotify: boolean;
}

export interface test {
  test: string;
}
