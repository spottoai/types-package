import type {
  Company,
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
  rootCompanyId: 'comp-trial-123',
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
void trialCompanyCreate;
void userCompanyTrialFields;
void moveRequest;
void classificationUpdateRequest;
void hierarchyTree;
