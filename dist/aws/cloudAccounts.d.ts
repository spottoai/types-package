import type { AwsRequestForbiddenCredentialFields } from './requests';
export interface AwsBillingExportConfigurationBase extends AwsRequestForbiddenCredentialFields {
    bucketName: string;
    /** AWS-configured S3 path prefix, excluding the AWS-appended report or export name. */
    prefix: string;
    region: string;
    ownerAccountId: string;
    kmsKeyArn?: string;
}
export interface AwsCurBillingExportConfiguration extends AwsBillingExportConfigurationBase {
    type: 'CUR';
    reportName: string;
    exportArn?: never;
}
export interface AwsDataExportsBillingExportConfiguration extends AwsBillingExportConfigurationBase {
    type: 'DATA_EXPORTS';
    exportArn: string;
    reportName?: never;
}
/** Canonical, non-secret AWS billing-export locator accepted by the public setup flow. */
export type AwsBillingExportConfiguration = AwsCurBillingExportConfiguration | AwsDataExportsBillingExportConfiguration;
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
    /** These AWS-managed preview policies are broad read-only grants, not least-privilege policies. */
    accessScope: 'broad-read-only-preview';
    warning: string;
}
export interface AwsCloudAccountOnboardingBundleV1 {
    schemaVersion: 1;
    roleName: string;
    trustedPrincipalArn: string;
    trustedPrincipalAccountId: string;
    trustPolicy: AwsIamPolicyDocument;
    managedPolicies: AwsIamManagedPolicyDescriptor[];
    /** Stable IAM inline policy name. Later bundles replace/update this policy; they must not attach a second guardrail. */
    guardrailPolicyName: 'SpottoGuardrails';
    guardrailPolicy: AwsIamPolicyDocument;
    /** Stable IAM inline policy name used when billing access is configured. */
    billingAccessPolicyName?: 'SpottoBillingExportRead';
    billingAccessPolicy?: AwsIamPolicyDocument;
    /** Complete API-authored customer artifact suitable for direct copy or download. */
    instructionsMarkdown: string;
}
/** Public lifecycle states for an asynchronously onboarded AWS cloud account. */
export type AwsCloudAccountOnboardingStatus = 'pending' | 'validating' | 'syncing' | 'active' | 'failed' | 'deleting' | 'deleted';
/** Portal-to-API request for the supported AWS cross-account AssumeRole setup path. */
export interface AwsCloudAccountSetupRequest extends AwsRequestForbiddenCredentialFields {
    /** Public setup-provider discriminator. The queue adapter normalizes it to lowercase `aws`. */
    provider: 'AWS';
    /** Optional body echo; API routes must treat the route company ID as authoritative. */
    companyId?: string;
    name: string;
    authMode: 'crossAccountRole';
    roleArn: string;
    /** Optional for connections that do not yet configure billing export ingestion. */
    billingExport?: AwsBillingExportConfiguration;
    /** The API owns External ID issuance; callers must use the prepared value and must not submit an override. */
    externalId?: never;
}
/** Empty Portal-to-API request to issue or retrieve the company-scoped AWS External ID. */
export interface AwsCloudAccountSetupPreparationRequest extends AwsRequestForbiddenCredentialFields {
    /** Used only to render a concrete policy bundle; preparation does not persist this value. */
    billingExport?: AwsBillingExportConfiguration;
    /** AWS account details are intentionally not accepted during company-scoped preparation. */
    accountId?: never;
    /** The API owns External ID issuance; callers cannot submit an override. */
    externalId?: never;
}
/** Company-scoped, immutable trust-policy value issued by Spotto before AWS role creation. */
export interface AwsCloudAccountSetupPreparationResponse extends AwsRequestForbiddenCredentialFields {
    provider: 'AWS';
    externalId: string;
    /** ISO-8601 timestamp for the original server-side issuance. */
    createdAt: string;
    onboardingBundle: AwsCloudAccountOnboardingBundleV1;
}
/** API response confirming that live access validation passed and AWS onboarding was admitted to asynchronous processing. */
export interface AwsCloudAccountSetupAcceptedResponse extends AwsRequestForbiddenCredentialFields {
    provider: 'AWS';
    cloudAccountId: string;
    accountId: string;
    requestId: string;
    correlationId: string;
    status: 'pending';
    /** ISO-8601 timestamp for API admission. */
    acceptedAt: string;
    externalId?: never;
}
/** Public, secret-free status for one AWS cloud-account onboarding lifecycle. */
export interface AwsCloudAccountStatusResponse extends AwsRequestForbiddenCredentialFields {
    provider: 'AWS';
    companyId: string;
    cloudAccountId: string;
    accountId: string;
    name: string;
    authMode: 'crossAccountRole';
    roleArn: string;
    status: AwsCloudAccountOnboardingStatus;
    /** Sanitized machine-readable reason for a blocked or failed lifecycle state. */
    statusReason?: string;
    /** Sanitized user-facing status detail. Raw provider failures must not be returned here. */
    statusMessage?: string;
    currentRequestId?: string;
    correlationId?: string;
    /** ISO-8601 timestamp for the latest status update. */
    updatedAt: string;
    /** ISO-8601 timestamp for the latest sync that produced usable AWS artifacts. */
    lastSuccessfulSyncAt?: string;
    billingStatus?: AwsCloudAccountBillingStatus;
    billingStatusReason?: string;
    billingStatusMessage?: string;
    externalId?: never;
}
export type AwsCloudAccountBillingStatus = 'not-configured' | 'validating' | 'configured-pending-delivery' | 'active' | 'failed';
/** Credential-free engine-owned status row contract used by the API read-only projection seam. */
export interface AwsCloudAccountEngineRequestStatusRecord extends AwsRequestForbiddenCredentialFields {
    provider: 'aws';
    companyId: string;
    cloudAccountId: string;
    awsAccountId: string;
    requestId: string;
    correlationId: string;
    action: 'onboard' | 'refresh' | 'delete';
    requestedAt: string;
    state: 'processing' | 'completed' | 'failed';
    attemptCount: number;
    outcome?: 'onboarded' | 'refresh-admitted' | 'credential-reference-deleted';
    metadataRetained?: boolean;
    syncRequestId?: string;
    failureCode?: string;
    retryable?: boolean;
    ownershipGeneration?: number;
    /** Engine-internal exact-command identity. Public projections must omit it. */
    commandFingerprint?: string;
    billingStatus?: 'not-requested' | 'validated' | 'configured-pending-delivery';
    /** Engine-owned evidence that the admitted sync produced usable artifacts. */
    lastSuccessfulSyncAt?: string;
    updatedAt: string;
    externalId?: never;
    billingExport?: never;
}
//# sourceMappingURL=cloudAccounts.d.ts.map