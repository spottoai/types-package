/*
 * AWS Connect (Launch Stack onboarding) contracts. The connect stack registers the deploying account
 * automatically, so the portal polls `connect/check` (normally without an account ID) while the
 * customer deploys it, then `connect/members` while member-account roles roll out through the
 * StackSet. Every field is nonsecret discovery metadata.
 */

/** Known `connect/check` warning codes. Clients must tolerate codes they do not know. */
export type AwsConnectWarning =
  | 'organizations-access-denied'
  | 'exports-access-denied'
  | 'exports-truncated'
  /** A read ran out of time; the response holds what was read before it. */
  | 'discovery-timeout';

/**
 * Why an export can't be used as a cost source: `table` is not COST_AND_USAGE_REPORT (CUR 2.0),
 * `format` is not Parquet, `unreadable` means its definition couldn't be read.
 */
export type AwsConnectExportUnsupportedReason = 'format' | 'table' | 'unreadable';

export interface AwsConnectCheckRequest {
  /** 12-digit account that deployed the connect stack. Omit it to use the newest registration. */
  accountId?: string;
  /** Defaults to SpottoReadOnlyRole. */
  roleName?: string;
}

export interface AwsConnectAccount {
  accountId: string;
  name?: string;
}

/**
 * Where the connected account sits: the organization's `management` account, a `member` account,
 * `standalone` (AWS reports no organization) or `unknown` (the organization couldn't be read, see
 * `warnings`). Never treat `unknown` as standalone.
 */
export type AwsConnectOrganizationState = 'management' | 'member' | 'standalone' | 'unknown';

export interface AwsConnectOrganization {
  organizationId: string;
  managementAccountId: string;
  isManagementAccount: boolean;
  rootId?: string;
}

export interface AwsConnectOrganizationAccount {
  accountId: string;
  name: string;
  status: string;
}

export interface AwsConnectExportDestination {
  bucketName: string;
  basePrefix: string;
  region: string;
  bucketOwnerAccountId?: string;
}

export interface AwsConnectExport {
  exportArn: string;
  exportName: string;
  status?: string;
  destination?: AwsConnectExportDestination;
  /** True for a CUR 2.0 (COST_AND_USAGE_REPORT) export delivered as Parquet. */
  supported: boolean;
  /** Set when `supported` is false. */
  unsupportedReason?: AwsConnectExportUnsupportedReason;
}

/**
 * The role isn't there yet: no registration has arrived (and no `accountId` was given), or AssumeRole
 * was denied or the role was not found.
 */
export interface AwsConnectCheckWaitingResponse {
  status: 'waiting';
  accountId?: string;
}

export interface AwsConnectCheckConnectedResponse {
  status: 'connected';
  accountId: string;
  roleArn: string;
  account: AwsConnectAccount;
  organizationState: AwsConnectOrganizationState;
  /** Present for `management` and `member`. */
  organization?: AwsConnectOrganization;
  /** Management account only, ACTIVE first, at most 1,000. */
  accounts: AwsConnectOrganizationAccount[];
  accountsTruncated: boolean;
  exports: AwsConnectExport[];
  /** For example 'organizations-access-denied' or 'exports-access-denied' (see AwsConnectWarning). */
  warnings: string[];
}

export type AwsConnectCheckResponse = AwsConnectCheckWaitingResponse | AwsConnectCheckConnectedResponse;

export interface AwsConnectMembersRequest {
  /** 1..200 unique 12-digit account IDs. */
  accountIds: string[];
  /** Defaults to SpottoReadOnlyRole. */
  roleName?: string;
}

export interface AwsConnectMembersResponse {
  accounts: Array<{ accountId: string; connected: boolean }>;
}

/** A connect stack deployment reported by its registration custom resource. */
export interface AwsConnectRegistration {
  accountId: string;
  roleArn: string;
  stackId: string;
  costData: 'CreateExport' | 'None';
  exportArn?: string;
  billingBucketName?: string;
  /** Template version (`YYYY-MM-DD.N`) the stack was last created or updated with. */
  templateVersion?: string;
  /** ISO 8601 time the latest accepted stack event (Create or Update) arrived. */
  receivedAt: string;
}

/**
 * Every registration that hasn't been deleted, newest first, one per account. It is the durable
 * record of what each account has deployed; clients apply their own window when offering detections.
 */
export interface AwsConnectRegistrationsResponse {
  registrations: AwsConnectRegistration[];
  /** Latest published template version; a registration with another version has an update available. */
  currentTemplateVersion: string;
}
