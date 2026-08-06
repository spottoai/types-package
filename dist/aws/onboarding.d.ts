import type { AwsEstateAccountPurpose } from './estates';
import type { AwsForbiddenCredentialFields } from './requests';
export interface AwsIamPolicyStatement {
    Sid: string;
    Effect: 'Allow' | 'Deny';
    Principal?: {
        AWS: string;
    };
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
    /** AWS-managed preview policies can be broader than the final least-privilege policy. */
    accessScope: 'broad-read-only-preview';
    warning: string;
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
    /** Stable inline policy name; later bundles replace rather than duplicate it. */
    guardrailPolicyName: 'SpottoGuardrails';
    guardrailPolicy: AwsIamPolicyDocument;
    /** Optional policy used for billing definition, storage, and KMS access. */
    billingAccessPolicyName?: 'SpottoBillingExportRead';
    billingAccessPolicy?: AwsIamPolicyDocument;
    /** Complete customer-facing artifact suitable for direct copy or download. */
    instructionsMarkdown: string;
}
/** Authorized company-scoped response used before customer role deployment. */
export interface AwsCompanyTrustSetupResponse extends AwsForbiddenCredentialFields {
    provider: 'AWS';
    externalId: string;
    /** ISO-8601 timestamp for the original immutable server-side issuance. */
    createdAt: string;
    onboardingBundle: AwsRoleOnboardingBundle;
}
//# sourceMappingURL=onboarding.d.ts.map