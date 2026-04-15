import type { SubscriptionAccount } from './accounts';

/**
 * Subscription-scoped read capability bitmask enum.
 * Each capability maps to a single bit.
 */
export enum SubscriptionReadPermission {
  /** Permission to read Azure Monitor metrics. */
  MonitoringReader = 1 << 0, // 1
  /** Permission to run Log Analytics / App Insights data queries. */
  LogAnalyticsDataReader = 1 << 1, // 2
}

/**
 * Cloud-account-scoped read capability bitmask enum.
 * Each capability maps to a single bit.
 */
export enum CloudAccountReadPermission {
  /** Permission to read management group entities. */
  ManagementGroupReader = 1 << 0, // 1
  /** Permission to read reservation resources and related consumption artifacts. */
  ReservationsReader = 1 << 1, // 2
  /** Permission to read savings plan resources. */
  SavingsPlanReader = 1 << 2, // 4
  /** Permission to read Microsoft Graph applications/service principals. */
  GraphApplicationReadAll = 1 << 3, // 8
}

/**
 * Metadata for a subscription-scoped read capability.
 */
export interface SubscriptionReadPermissionMetadata {
  id: SubscriptionReadPermission;
  displayName: string;
  description: string;
  requiredRoles: string[];
}

/**
 * Metadata for a cloud-account-scoped read capability.
 */
export interface CloudAccountReadPermissionMetadata {
  id: CloudAccountReadPermission;
  displayName: string;
  description: string;
  requiredRoles: string[];
}

export type SubscriptionValidationStatus =
  | 'confirmed'
  | 'unauthorized'
  | 'forbidden'
  | 'throttled'
  | 'unavailable';

export interface SubscriptionReadValidationResult {
  subscription: SubscriptionAccount;
  valid: boolean;
  status: SubscriptionValidationStatus;
  statusCode: number;
  message?: string;
}

export interface CloudAccountReadAccessValidation {
  valid: boolean;
  subscriptions: SubscriptionAccount[];
  subscriptionResults: SubscriptionReadValidationResult[];
}

export interface CloudAccountWriteAccessValidation {
  valid: boolean;
  subscriptions: SubscriptionAccount[];
}

export interface CloudAccountValidationResult {
  valid: boolean;
  readAccess: CloudAccountReadAccessValidation;
  writeAccess?: CloudAccountWriteAccessValidation;
}

export const SUBSCRIPTION_READ_PERMISSIONS_METADATA: SubscriptionReadPermissionMetadata[] = [
  {
    id: SubscriptionReadPermission.MonitoringReader,
    displayName: 'Monitoring Reader',
    description: 'Allows Spotto to read Azure Monitor metrics for subscription resources.',
    requiredRoles: ['Monitoring Reader'],
  },
  {
    id: SubscriptionReadPermission.LogAnalyticsDataReader,
    displayName: 'Log Analytics Data Reader',
    description: 'Allows Spotto to run Log Analytics and App Insights data queries.',
    requiredRoles: ['Log Analytics Reader'],
  },
];

export const CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA: CloudAccountReadPermissionMetadata[] = [
  {
    id: CloudAccountReadPermission.ManagementGroupReader,
    displayName: 'Management Group Reader',
    description: 'Allows Spotto to read tenant management group entities.',
    requiredRoles: ['Management Group Reader'],
  },
  {
    id: CloudAccountReadPermission.ReservationsReader,
    displayName: 'Reservations Reader',
    description: 'Allows Spotto to read reservation resources and reservation usage artifacts.',
    requiredRoles: ['Reader'],
  },
  {
    id: CloudAccountReadPermission.SavingsPlanReader,
    displayName: 'Savings Plan Reader',
    description: 'Allows Spotto to read savings plan resources.',
    requiredRoles: ['Reader'],
  },
  {
    id: CloudAccountReadPermission.GraphApplicationReadAll,
    displayName: 'Graph Application Read.All',
    description: 'Allows Spotto to read Microsoft Graph applications and service principals.',
    requiredRoles: ['Application.Read.All'],
  },
];
