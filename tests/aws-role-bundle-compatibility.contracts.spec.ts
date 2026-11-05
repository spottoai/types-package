import type { AwsCompanyRoleBundleSetupResponse, AwsCompanyTrustSetupResponse, AwsRoleOnboardingBundle } from '../src';

declare const onboardingBundle: AwsRoleOnboardingBundle;

const existingRoleSetup = {
  provider: 'AWS',
  externalId: 'server-issued-external-id',
  createdAt: '2026-10-30T00:00:00.000Z',
  onboardingBundle,
} satisfies AwsCompanyRoleBundleSetupResponse;

// @ts-expect-error Regional Connect setup still requires the deployment configuration.
const missingRegionalBinding: AwsCompanyTrustSetupResponse = existingRoleSetup;
void missingRegionalBinding;
