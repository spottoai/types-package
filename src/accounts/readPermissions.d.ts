import type { SubscriptionAccount } from './accounts';
/**
 * Subscription-scoped read capability bitmask enum.
 * Each capability maps to a single bit.
 */
export declare enum SubscriptionReadPermission {
    /** Permission to read Azure Monitor metrics. */
    MonitoringReader = 1,// 1
    /** Permission to run Log Analytics / App Insights data queries. */
    LogAnalyticsDataReader = 2
}
/**
 * Cloud-account-scoped read capability bitmask enum.
 * Each capability maps to a single bit.
 */
export declare enum CloudAccountReadPermission {
    /** Permission to read management group entities. */
    ManagementGroupReader = 1,// 1
    /** Permission to read reservation resources and related consumption artifacts. */
    ReservationsReader = 2,// 2
    /** Permission to read savings plan resources. */
    SavingsPlanReader = 4,// 4
    /** Permission to read Microsoft Graph applications/service principals. */
    GraphApplicationReadAll = 8,// 8
    /** Permission to read Microsoft Graph privileged role assignment schedules. */
    GraphRoleAssignmentScheduleReadDirectory = 16,// 16
    /** Permission to read Microsoft Graph privileged role eligibility schedules. */
    GraphRoleEligibilityScheduleReadDirectory = 32,// 32
    /** Permission to read Microsoft Graph role-management metadata. */
    GraphRoleManagementReadDirectory = 64,// 64
    /** Permission to read Microsoft Graph group memberships. */
    GraphGroupMemberReadAll = 128,// 128
    /** Permission to read Microsoft Graph user metadata. */
    GraphUserReadAll = 256,// 256
    /** Permission to inspect Microsoft Graph privileged role assignment schedule requests. */
    GraphRoleAssignmentScheduleReadWriteDirectory = 512,// 512
    /** Permission to read Microsoft Graph audit logs. */
    GraphAuditLogReadAll = 1024
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
export type SubscriptionValidationStatus = 'confirmed' | 'unauthorized' | 'forbidden' | 'throttled' | 'unavailable';
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
export declare const SUBSCRIPTION_READ_PERMISSIONS_METADATA: SubscriptionReadPermissionMetadata[];
export declare const CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA: CloudAccountReadPermissionMetadata[];
//# sourceMappingURL=readPermissions.d.ts.map
