/** Schema version for AWS estate orchestration commands. */
export const AWS_COMMAND_SCHEMA_VERSION = 1;
/** Canonical provider wire value for AWS commands. */
export const AWS_COMMAND_PROVIDER = 'aws';
/** Entities handled by AWS estate orchestration. */
export const AWS_COMMAND_ENTITIES = ['estate', 'account', 'billing-source', 'organization-commitments'];
/** Actions supported across AWS estate orchestration commands. */
export const AWS_COMMAND_ACTIONS = ['reconcile', 'refresh', 'delete'];
/** Credential-shaped keys forbidden from shared AWS configuration and commands. */
export const AWS_FORBIDDEN_CREDENTIAL_FIELDS = [
    'accessKeyId',
    'secretAccessKey',
    'sessionToken',
    'credentials',
    'resolvedCredentials',
    'secret',
    'encryptedSecret',
    'credentialReference',
];
