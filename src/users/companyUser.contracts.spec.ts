import type { User, UserInviteLink } from '../index';
import { CompanyUser } from './companyUser';

const invitedCompanyUser = new CompanyUser();
invitedCompanyUser.userId = 'user-123';
invitedCompanyUser.companyId = 'comp-123';
invitedCompanyUser.email = 'owner@example.com';
invitedCompanyUser.firstName = 'Azure';
invitedCompanyUser.lastName = 'Owner';
invitedCompanyUser.role = 1;
invitedCompanyUser.isPendingInvite = true;
invitedCompanyUser.invitedBy = 'admin-123';
invitedCompanyUser.createdAt = new Date('2026-05-10T00:00:00.000Z');
invitedCompanyUser.updatedAt = new Date('2026-05-10T00:00:00.000Z');
invitedCompanyUser.inviteType = 'trial';
invitedCompanyUser.onboardingIntent = 'azureDelegatedConnect';
invitedCompanyUser.canConnectAzureTrial = true;
invitedCompanyUser.onboardingIntentCreatedAt = '2026-05-10T00:00:00.000Z';
invitedCompanyUser.onboardingIntentExpiresAt = '2026-05-17T00:00:00.000Z';

const invitedUser: User = {
  id: 'user-123',
  firstName: 'Azure',
  lastName: 'Owner',
  email: 'owner@example.com',
  createdAt: '2026-05-10T00:00:00.000Z',
  updatedAt: '2026-05-10T00:00:00.000Z',
  companyId: 'comp-123',
  role: 1,
  isPendingInvite: true,
  invitedBy: 'admin-123',
  inviteType: 'trial',
  onboardingIntent: 'azureDelegatedConnect',
  canConnectAzureTrial: true,
  onboardingIntentCreatedAt: new Date('2026-05-10T00:00:00.000Z'),
  onboardingIntentExpiresAt: '2026-05-17T00:00:00.000Z',
};

const inviteLink: UserInviteLink = {
  link: 'https://app.spotto.ai/invite/token',
  inviteType: 'trial',
  onboardingIntent: 'azureDelegatedConnect',
  canConnectAzureTrial: true,
};

void invitedCompanyUser;
void invitedUser;
void inviteLink;
