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
    GraphApplicationReadAll = 8
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
export declare const SUBSCRIPTION_READ_PERMISSIONS_METADATA: SubscriptionReadPermissionMetadata[];
export declare const CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA: CloudAccountReadPermissionMetadata[];
//# sourceMappingURL=readPermissions.d.ts.map