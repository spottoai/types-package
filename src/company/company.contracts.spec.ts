import type {
  Company,
  CompanyBusinessHours,
  CompanyCreate,
  CompanyHierarchyClassificationUpdateRequest,
  CompanyHierarchyMoveRequest,
  CompanyHierarchyTreeDocument,
  UserCompany,
} from '../index';

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

const companyWithHierarchy: Company = {
  ...standardCompany,
  rootCompanyId: 'comp-root-123',
};

const businessHours: CompanyBusinessHours = {
  periods: [
    {
      startDayOfWeek: 1,
      startTimeLocal: '08:00',
      endDayOfWeek: 5,
      endTimeLocal: '18:00',
    },
  ],
};

const trialCompanyCreate: CompanyCreate = {
  name: 'Trial Company',
  createdAt: '2026-05-10T00:00:00.000Z',
  businessHours,
  companyLifecycle: 'trial',
  azureDelegatedTrialExpiresAt: '2026-06-09T00:00:00.000Z',
};

const userCompanyTrialFields: UserCompany = {
  email: 'owner@example.com',
  companyId: 'comp-trial-123',
  companyName: 'Trial Company',
  userId: 'user-123',
  role: 1,
  rootCompanyId: 'comp-trial-123',
  classification: 'customer',
  companyLifecycle: 'trial',
  azureDelegatedTrialExpiresAt: '2026-06-09T00:00:00.000Z',
};

const moveRequest: CompanyHierarchyMoveRequest = {
  newParentCompanyId: 'comp-parent-123',
};

const classificationUpdateRequest: CompanyHierarchyClassificationUpdateRequest = {
  classification: 'container',
};

const hierarchyTree: CompanyHierarchyTreeDocument = {
  builtAt: '2026-05-10T00:00:00.000Z',
  root: {
    companyId: 'comp-root-123',
    companyName: 'Root',
    classification: 'container',
    children: [],
  },
};

void standardCompany;
void trialCompany;
void companyWithHierarchy;
void businessHours;
void trialCompanyCreate;
void userCompanyTrialFields;
void moveRequest;
void classificationUpdateRequest;
void hierarchyTree;
