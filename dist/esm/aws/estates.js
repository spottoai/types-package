import { AWS_FORBIDDEN_CREDENTIAL_FIELDS } from './requests.js';
/** Schema version for the API-owned AWS company estate manifest. */
export const AWS_ESTATES_MANIFEST_SCHEMA_VERSION = 1;
/** Public provider discriminator used by the AWS estate manifest API. */
export const AWS_ESTATES_MANIFEST_PROVIDER = 'AWS';
export const AWS_ESTATE_KINDS = ['standalone', 'organization'];
export const AWS_ESTATE_ACCOUNT_SOURCES = ['manual'];
export const AWS_ESTATE_ROLE_DEPLOYMENT_MODES = ['customer-managed'];
export const AWS_ESTATE_ACCOUNT_PURPOSES = ['resource-discovery', 'organization-discovery', 'billing-definition', 'billing-storage'];
/**
 * Credential-shaped fields that manifest API boundaries must reject
 * recursively before persisting untyped JSON.
 */
export const AWS_ESTATES_MANIFEST_FORBIDDEN_CREDENTIAL_FIELDS = [
    ...AWS_FORBIDDEN_CREDENTIAL_FIELDS,
    'externalId',
    'accessToken',
    'connectionString',
    'sasToken',
    'storageCredential',
];
