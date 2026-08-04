import type {
  Company,
  CompanyCloudAccountIntent,
  CompanyOnboardingState,
  CompanyOnboardingStatus,
  CompanyOnboardingStep,
  UpdateCompanyOnboardingRequest,
} from '../src';

const status: CompanyOnboardingStatus = 'in_progress';
const currentStep: CompanyOnboardingStep = 'invite_users';
const cloudAccountIntent: CompanyCloudAccountIntent = 'delegated';

const onboarding = {
  status,
  currentStep,
  cloudAccountIntent,
  updatedAt: '2026-08-04T08:00:00.000Z',
} satisfies CompanyOnboardingState;

const company = {
  id: 'company-123',
  name: 'Example Company',
  createdAt: new Date('2026-08-04T07:00:00.000Z'),
  updatedAt: new Date('2026-08-04T08:00:00.000Z'),
  createdBy: 'user-123',
  onboarding,
} satisfies Company;

const progressUpdate = {
  currentStep: 'cloud_account',
  cloudAccountIntent: 'connect_now',
} satisfies UpdateCompanyOnboardingRequest;

const dismissalUpdate = {
  status: 'dismissed',
  cloudAccountIntent: 'later',
} satisfies UpdateCompanyOnboardingRequest;

const invalidStatus: UpdateCompanyOnboardingRequest = {
  // @ts-expect-error Onboarding status must use a supported lifecycle value.
  status: 'skipped',
};

const invalidStep: UpdateCompanyOnboardingRequest = {
  // @ts-expect-error Onboarding progress is limited to the defined wizard steps.
  currentStep: 'notifications',
};

const invalidCloudAccountIntent: UpdateCompanyOnboardingRequest = {
  // @ts-expect-error Cloud-account intent must use a supported onboarding decision.
  cloudAccountIntent: 'undecided',
};

void [company, progressUpdate, dismissalUpdate, invalidStatus, invalidStep, invalidCloudAccountIntent];
