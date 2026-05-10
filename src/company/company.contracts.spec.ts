import type { Company, CompanyCreate, UserCompany } from '../index';

const standardCompany: Company = {
  id: 'comp-123',
  name: 'Spotto',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
};

const trialCompany: Company = {
  ...standardCompany,
  id: 'comp-trial-123',
  companyLifecycle: 'trial',
  azureDelegatedTrialStartedAt: '2026-05-10T00:00:00.000Z',
  azureDelegatedTrialUsedAt: new Date('2026-05-10T00:00:00.000Z'),
  azureDelegatedTrialExpiresAt: '2026-06-09T00:00:00.000Z',
};

const trialCompanyCreate: CompanyCreate = {
  name: 'Trial Company',
  createdAt: '2026-05-10T00:00:00.000Z',
  companyLifecycle: 'trial',
  azureDelegatedTrialExpiresAt: '2026-06-09T00:00:00.000Z',
};

const userCompanyTrialFields: UserCompany = {
  email: 'owner@example.com',
  companyId: 'comp-trial-123',
  companyName: 'Trial Company',
  userId: 'user-123',
  role: 1,
  companyLifecycle: 'trial',
  azureDelegatedTrialExpiresAt: '2026-06-09T00:00:00.000Z',
};

void standardCompany;
void trialCompany;
void trialCompanyCreate;
void userCompanyTrialFields;
