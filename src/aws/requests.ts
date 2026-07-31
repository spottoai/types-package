/** Schema version for AWS estate orchestration commands. */
export const AWS_COMMAND_SCHEMA_VERSION = 1 as const;

/** Canonical provider wire value for AWS commands. */
export const AWS_COMMAND_PROVIDER = 'aws' as const;

/** Entities handled by AWS estate orchestration. */
export const AWS_COMMAND_ENTITIES = ['estate', 'account', 'billing-source'] as const;

/** Actions supported across AWS estate orchestration commands. */
export const AWS_COMMAND_ACTIONS = ['reconcile', 'refresh', 'delete'] as const;

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
] as const;

export type AwsCommandSchemaVersion = typeof AWS_COMMAND_SCHEMA_VERSION;
export type AwsCommandProvider = typeof AWS_COMMAND_PROVIDER;
export type AwsCommandEntity = (typeof AWS_COMMAND_ENTITIES)[number];
export type AwsCommandAction = (typeof AWS_COMMAND_ACTIONS)[number];
export type AwsForbiddenCredentialField = (typeof AWS_FORBIDDEN_CREDENTIAL_FIELDS)[number];

/**
 * Makes raw, resolved, or stored AWS credential material unrepresentable.
 * Runtime boundaries must recursively reject the same keys on untyped input.
 */
export type AwsForbiddenCredentialFields = {
  [Field in AwsForbiddenCredentialField]?: never;
};

/**
 * Commands identify desired configuration by manifest revision. They never
 * duplicate role, billing-export, External ID, or manifest bodies.
 */
export type AwsCommandForbiddenConfigurationFields = AwsForbiddenCredentialFields & {
  roleArn?: never;
  externalId?: never;
  billingExport?: never;
  manifest?: never;
};

/** Common secret-free envelope shared by every AWS orchestration command. */
export interface AwsCommandBase extends AwsCommandForbiddenConfigurationFields {
  schemaVersion: AwsCommandSchemaVersion;
  provider: AwsCommandProvider;
  entity: AwsCommandEntity;
  action: AwsCommandAction;
  companyId: string;
  /** Opaque revision returned by the API after persisting aws-estates.json. */
  manifestRevision: string;
  requestId: string;
  correlationId: string;
  /** ISO-8601 timestamp assigned by the API when the command is admitted. */
  requestedAt: string;
}

/** Reconciles one desired estate after a manifest create or update. */
export interface AwsEstateReconcileCommand extends AwsCommandBase {
  entity: 'estate';
  action: 'reconcile';
  estateId: string;
}

/** Removes engine-owned runtime state for one estate removed from the manifest. */
export interface AwsEstateDeleteCommand extends AwsCommandBase {
  entity: 'estate';
  action: 'delete';
  estateId: string;
}

/** Starts resource and recommendation refresh for one connected estate account. */
export interface AwsAccountRefreshCommand extends AwsCommandBase {
  entity: 'account';
  action: 'refresh';
  estateId: string;
  accountId: string;
  cloudAccountId: string;
}

/** Removes one connected account and its engine-owned runtime state. */
export interface AwsAccountDeleteCommand extends AwsCommandBase {
  entity: 'account';
  action: 'delete';
  estateId: string;
  accountId: string;
  cloudAccountId: string;
}

/** Starts independent validation/import for one estate billing source. */
export interface AwsBillingSourceRefreshCommand extends AwsCommandBase {
  entity: 'billing-source';
  action: 'refresh';
  estateId: string;
  billingSourceId: string;
}

/** Complete command union consumed by the dedicated AWS orchestration ingress. */
export type AwsCommand =
  | AwsEstateReconcileCommand
  | AwsEstateDeleteCommand
  | AwsAccountRefreshCommand
  | AwsAccountDeleteCommand
  | AwsBillingSourceRefreshCommand;
