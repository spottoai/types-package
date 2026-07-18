import type { AwsBillingExportConfiguration } from './cloudAccounts';
/** Schema version for the first AWS cloud-account Service Bus ingress contract. */
export declare const AWS_REQUEST_SCHEMA_VERSION: 1;
/** Canonical provider wire value for AWS request messages. */
export declare const AWS_REQUEST_PROVIDER: "aws";
/** Entity handled by the first AWS Service Bus ingress contract. */
export declare const AWS_REQUEST_ENTITY: "cloudaccount";
/** Actions supported by the first AWS Service Bus ingress contract. */
export declare const AWS_REQUEST_ACTIONS: readonly ["onboard", "refresh", "delete"];
/** Credential-shaped keys rejected at the AWS request boundary. */
export declare const AWS_REQUEST_FORBIDDEN_CREDENTIAL_FIELDS: readonly ["accessKeyId", "secretAccessKey", "sessionToken", "credentials", "resolvedCredentials", "secret", "encryptedSecret", "credentialReference"];
export type AwsRequestSchemaVersion = typeof AWS_REQUEST_SCHEMA_VERSION;
export type AwsRequestProvider = typeof AWS_REQUEST_PROVIDER;
export type AwsRequestEntity = typeof AWS_REQUEST_ENTITY;
export type AwsRequestActionV1 = (typeof AWS_REQUEST_ACTIONS)[number];
export type AwsRequestForbiddenCredentialField = (typeof AWS_REQUEST_FORBIDDEN_CREDENTIAL_FIELDS)[number];
/**
 * Makes raw or resolved AWS credential material unrepresentable on typed ingress messages.
 * Runtime queue boundaries must also reject these keys on untyped input.
 */
export type AwsRequestForbiddenCredentialFields = {
    [Field in AwsRequestForbiddenCredentialField]?: never;
};
/** Common secret-free envelope fields shared by every AWS request v1 action. */
export interface AwsRequestMessageV1Base extends AwsRequestForbiddenCredentialFields {
    schemaVersion: AwsRequestSchemaVersion;
    provider: AwsRequestProvider;
    entity: AwsRequestEntity;
    action: AwsRequestActionV1;
    companyId: string;
    cloudAccountId: string;
    awsAccountId: string;
    requestId: string;
    correlationId: string;
    /** ISO-8601 timestamp assigned by the API when the command is admitted. */
    requestedAt: string;
}
/** Starts AWS AssumeRole validation, persistence, and the first asynchronous sync. */
export interface AwsOnboardRequestMessageV1 extends AwsRequestMessageV1Base {
    action: 'onboard';
    roleArn: string;
    /** Server-issued setup metadata used for AssumeRole trust verification; never return it in public status DTOs. */
    externalId: string;
    /** Optional non-secret billing-export locator validated and persisted by the API. */
    billingExport?: AwsBillingExportConfiguration;
}
/** Starts a refresh from persisted AWS onboarding state. */
export interface AwsRefreshRequestMessageV1 extends AwsRequestMessageV1Base {
    action: 'refresh';
    roleArn?: never;
    externalId?: never;
    billingExport?: never;
}
/** Removes the AWS cloud-account connection and its engine-owned onboarding state. */
export interface AwsDeleteRequestMessageV1 extends AwsRequestMessageV1Base {
    action: 'delete';
    roleArn?: never;
    externalId?: never;
    billingExport?: never;
}
/** Versioned, credential-free command consumed only by the dedicated AWS Service Bus ingress. */
export type AwsRequestMessageV1 = AwsOnboardRequestMessageV1 | AwsRefreshRequestMessageV1 | AwsDeleteRequestMessageV1;
export type AwsRequestMessage = AwsRequestMessageV1;
//# sourceMappingURL=requests.d.ts.map