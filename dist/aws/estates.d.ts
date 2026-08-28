import { type AwsForbiddenCredentialFields } from './requests';
/** Schema version for the API-owned AWS company estate manifest. */
export declare const AWS_ESTATES_MANIFEST_SCHEMA_VERSION: 1;
/** Public provider discriminator used by the AWS estate manifest API. */
export declare const AWS_ESTATES_MANIFEST_PROVIDER: "AWS";
export declare const AWS_ESTATE_KINDS: readonly ["standalone", "organization"];
export declare const AWS_ESTATE_ACCOUNT_SOURCES: readonly ["manual"];
export declare const AWS_ESTATE_ROLE_DEPLOYMENT_MODES: readonly ["customer-managed"];
export declare const AWS_ESTATE_ACCOUNT_PURPOSES: readonly ["resource-discovery", "organization-discovery", "commitments-planning", "billing-definition", "billing-storage"];
/**
 * Credential-shaped fields that manifest API boundaries must reject
 * recursively before persisting untyped JSON.
 */
export declare const AWS_ESTATES_MANIFEST_FORBIDDEN_CREDENTIAL_FIELDS: readonly ["accessKeyId", "secretAccessKey", "sessionToken", "credentials", "resolvedCredentials", "secret", "encryptedSecret", "credentialReference", "externalId", "accessToken", "connectionString", "sasToken", "storageCredential"];
export type AwsEstatesManifestSchemaVersion = typeof AWS_ESTATES_MANIFEST_SCHEMA_VERSION;
export type AwsEstatesManifestProvider = typeof AWS_ESTATES_MANIFEST_PROVIDER;
export type AwsEstateKind = (typeof AWS_ESTATE_KINDS)[number];
export type AwsEstateAccountSource = (typeof AWS_ESTATE_ACCOUNT_SOURCES)[number];
export type AwsEstateRoleDeploymentMode = (typeof AWS_ESTATE_ROLE_DEPLOYMENT_MODES)[number];
export type AwsEstateAccountPurpose = (typeof AWS_ESTATE_ACCOUNT_PURPOSES)[number];
export type AwsEstatesManifestForbiddenCredentialField = (typeof AWS_ESTATES_MANIFEST_FORBIDDEN_CREDENTIAL_FIELDS)[number];
/**
 * Makes setup secrets and storage credentials unrepresentable in persisted
 * estate-manifest DTOs.
 */
export type AwsEstatesManifestForbiddenCredentialFields = AwsForbiddenCredentialFields & {
    externalId?: never;
    accessToken?: never;
    connectionString?: never;
    sasToken?: never;
    storageCredential?: never;
};
/** Commercial-partition AssumeRole ARN bound to one exact AWS account. */
export type AwsEstateRoleArn<TAccountId extends string = string> = `arn:aws:iam::${TAccountId}:role/${string}`;
/**
 * One AWS account intentionally included in an estate. Repeated company and
 * estate identities make accidentally cross-scoped objects detectable.
 */
export interface AwsEstateAccountMembership<TCompanyId extends string = string, TEstateId extends string = string, TAccountId extends string = string> extends AwsEstatesManifestForbiddenCredentialFields {
    schemaVersion: 1;
    companyId: TCompanyId;
    estateId: TEstateId;
    accountId: TAccountId;
    name: string;
    roleArn: AwsEstateRoleArn<TAccountId>;
    purposes: AwsEstateAccountPurpose[];
    enabled: boolean;
    /** Existing Spotto cloud-account identity once this membership is connected. */
    cloudAccountId?: string;
}
/** One intentionally excluded account in a manually maintained organization estate. */
export interface AwsEstateExcludedAccount<TCompanyId extends string = string, TEstateId extends string = string> extends AwsEstatesManifestForbiddenCredentialFields {
    schemaVersion: 1;
    companyId: TCompanyId;
    estateId: TEstateId;
    accountId: string;
    name?: string;
    reason?: string;
}
export interface AwsEstateWideBillingCoverage extends AwsEstatesManifestForbiddenCredentialFields {
    type: 'estate';
    accountIds?: never;
}
export interface AwsEstateAccountBillingCoverage<TAccountId extends string = string> extends AwsEstatesManifestForbiddenCredentialFields {
    type: 'accounts';
    accountIds: TAccountId[];
}
export type AwsEstateBillingCoverage<TAccountId extends string = string> = AwsEstateWideBillingCoverage | AwsEstateAccountBillingCoverage<TAccountId>;
export interface AwsEstateBillingDestination extends AwsEstatesManifestForbiddenCredentialFields {
    bucketName: string;
    /** Customer-configured S3 base prefix before AWS-appended export path segments. */
    basePrefix: string;
    region: string;
    /** Optional when bucket ownership was not supplied or discovered during setup. */
    bucketOwnerAccountId?: string;
    kmsKeyArn?: string;
}
export interface AwsEstateCurBillingExport extends AwsEstatesManifestForbiddenCredentialFields {
    type: 'CUR';
    reportName: string;
    destination: AwsEstateBillingDestination;
    exportArn?: never;
}
export interface AwsEstateDataExportsBillingExport<TDefinitionAccountId extends string = string> extends AwsEstatesManifestForbiddenCredentialFields {
    type: 'DATA_EXPORTS';
    /** ARN returned by BCM Data Exports; its account is the definition role account. */
    exportArn: `arn:aws:bcm-data-exports:${string}:${TDefinitionAccountId}:export/${string}`;
    /** Exact BCM Data Exports Export.Name used to scope the delivered S3 root. */
    exportName: string;
    destination: AwsEstateBillingDestination;
    reportName?: never;
}
export type AwsEstateBillingExport<TDefinitionAccountId extends string = string> = AwsEstateCurBillingExport | AwsEstateDataExportsBillingExport<TDefinitionAccountId>;
/**
 * One billing export used by an estate. Definition, payer, storage, and access
 * identities are explicit because large AWS estates can split these roles
 * across different accounts.
 */
export interface AwsEstateBillingSource<TCompanyId extends string = string, TEstateId extends string = string, TAccountId extends string = string, TDefinitionRoleAccountId extends TAccountId = TAccountId, TStorageRoleAccountId extends TAccountId = TAccountId> extends AwsEstatesManifestForbiddenCredentialFields {
    schemaVersion: 1;
    companyId: TCompanyId;
    estateId: TEstateId;
    billingSourceId: string;
    name: string;
    /** Account whose role can read/validate the CUR or Data Exports definition. */
    definitionRoleAccountId: TDefinitionRoleAccountId;
    payerAccountId: TAccountId;
    /** Account whose role can list/read the S3 export destination. */
    storageRoleAccountId: TStorageRoleAccountId;
    export: AwsEstateBillingExport<TDefinitionRoleAccountId>;
    coverage: AwsEstateBillingCoverage<TAccountId>;
    enabled: boolean;
}
/** Organization identity and how its desired account membership is maintained. */
export interface AwsEstateOrganization<TCompanyId extends string = string, TEstateId extends string = string, TAccountId extends string = string> extends AwsEstatesManifestForbiddenCredentialFields {
    schemaVersion: 1;
    companyId: TCompanyId;
    estateId: TEstateId;
    organizationId: string;
    managementAccountId: TAccountId;
    accountSource: AwsEstateAccountSource;
    roleDeploymentMode: AwsEstateRoleDeploymentMode;
    excludedAccounts: AwsEstateExcludedAccount<TCompanyId, TEstateId>[];
}
interface AwsEstateBase<TCompanyId extends string, TEstateId extends string, TAccountId extends string> extends AwsEstatesManifestForbiddenCredentialFields {
    schemaVersion: 1;
    companyId: TCompanyId;
    estateId: TEstateId;
    name: string;
    enabled: boolean;
    accounts: AwsEstateAccountMembership<TCompanyId, TEstateId, TAccountId>[];
    billingSources: AwsEstateBillingSource<TCompanyId, TEstateId, TAccountId>[];
}
export interface AwsStandaloneEstate<TCompanyId extends string = string, TEstateId extends string = string, TAccountId extends string = string> extends AwsEstateBase<TCompanyId, TEstateId, TAccountId> {
    kind: 'standalone';
    organization?: never;
}
export interface AwsOrganizationEstate<TCompanyId extends string = string, TEstateId extends string = string, TAccountId extends string = string> extends AwsEstateBase<TCompanyId, TEstateId, TAccountId> {
    kind: 'organization';
    organization: AwsEstateOrganization<TCompanyId, TEstateId, TAccountId>;
}
export type AwsEstate<TCompanyId extends string = string, TEstateId extends string = string, TAccountId extends string = string> = AwsStandaloneEstate<TCompanyId, TEstateId, TAccountId> | AwsOrganizationEstate<TCompanyId, TEstateId, TAccountId>;
/** Complete API-owned desired state stored at companies/{companyId}/aws/aws-estates.json. */
export interface AwsEstatesManifest<TCompanyId extends string = string> extends AwsEstatesManifestForbiddenCredentialFields {
    schemaVersion: AwsEstatesManifestSchemaVersion;
    provider: AwsEstatesManifestProvider;
    companyId: TCompanyId;
    /** ISO-8601 timestamp assigned by the API after validating the complete document. */
    updatedAt: string;
    estates: AwsEstate<TCompanyId>[];
}
export {};
//# sourceMappingURL=estates.d.ts.map