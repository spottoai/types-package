import type { AwsEstateAccountPurpose } from './estates';
import type { AwsForbiddenCredentialFields } from './requests';

export interface AwsIamPolicyStatement {
  Sid: string;
  Effect: 'Allow' | 'Deny';
  Principal?: { AWS: string };
  Action: string | string[];
  Resource?: string | string[];
  NotResource?: string | string[];
  Condition?: Record<string, Record<string, string | string[]>>;
}

export interface AwsIamPolicyDocument {
  Version: '2012-10-17';
  Statement: AwsIamPolicyStatement[];
}

export interface AwsIamManagedPolicyDescriptor {
  name: string;
  arn: string;
  /**
   * `aws-managed-read-only`: an AWS managed read baseline (ViewOnlyAccess, SecurityAudit) attached to every role,
   * narrowed by the inline read policy's data and secret deny. `broad-read-only-preview`: a broader preview policy.
   */
  accessScope: 'aws-managed-read-only' | 'broad-read-only-preview';
  warning: string;
}

/**
 * Customer-managed policy the customer creates in their account and attaches to the role. Used when grants do not fit
 * the role's 10,240-character inline policy quota; each document is at most 6,144 characters. The policy name is stable,
 * so later bundles update the policy (a new default version) rather than create another.
 */
export interface AwsIamCustomerManagedPolicy {
  policyName: string;
  /** Why the role needs it, for review before attaching. */
  description: string;
  policyDocument: AwsIamPolicyDocument;
}

/**
 * API-authored customer artifact for creating one purpose-scoped Spotto role.
 * External ID is returned separately by the authorized company setup response.
 */
export interface AwsRoleOnboardingBundle extends AwsForbiddenCredentialFields {
  schemaVersion: 1;
  roleName: string;
  rolePurposes: AwsEstateAccountPurpose[];
  trustedPrincipalArn: string;
  trustedPrincipalAccountId: string;
  trustPolicy: AwsIamPolicyDocument;
  managedPolicies: AwsIamManagedPolicyDescriptor[];
  /** Stable inline read-only access policy name; later bundles replace rather than duplicate it. */
  readAccessPolicyName: 'SpottoReadOnlyAccess';
  readAccessPolicy: AwsIamPolicyDocument;
  /** Optional policy used for billing definition, storage, and KMS access. */
  billingAccessPolicyName?: 'SpottoBillingExportRead';
  billingAccessPolicy?: AwsIamPolicyDocument;
  /** Optional customer-managed policy for organization commitments evidence. */
  commitmentsAccessPolicyName?: 'SpottoCommitmentsPlanning';
  commitmentsAccessPolicy?: AwsIamPolicyDocument;
  /** Customer-managed policies to create and attach, e.g. framework assessment read actions for resource discovery. */
  customerManagedPolicies?: AwsIamCustomerManagedPolicy[];
  /** Complete customer-facing artifact suitable for direct copy or download. */
  instructionsMarkdown: string;
}

/** One configured deployment boundary; geography and environment are independent of an AWS account's resources. */
export type AwsOnboardingDeployment = 'dev-au' | 'prod-au' | 'prod-us' | 'prod-eu';

/** API-owned binding used unchanged by Portal, scripts and Terraform. Contains no credentials. */
export interface AwsOnboardingConfiguration {
  deployment: AwsOnboardingDeployment;
  region: 'ap-southeast-2' | 'us-east-1' | 'eu-north-1';
  registrationTopicArn: string;
  roleName: string;
  exportName: string;
}

/** Existing company setup response containing the trust binding and deployable role bundle. */
export interface AwsCompanyRoleBundleSetupResponse extends AwsForbiddenCredentialFields {
  provider: 'AWS';
  externalId: string;
  /** ISO-8601 timestamp for the original immutable server-side issuance. */
  createdAt: string;
  onboardingBundle: AwsRoleOnboardingBundle;
}

/** Regional Connect setup also requires the API-owned deployment configuration. */
export interface AwsCompanyTrustSetupResponse extends AwsCompanyRoleBundleSetupResponse {
  onboarding: AwsOnboardingConfiguration;
}
