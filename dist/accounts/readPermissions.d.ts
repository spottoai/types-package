import type { SubscriptionAccount } from './accounts';
/**
 * Subscription-scoped read capability bitmask enum.
 * Each capability maps to a single bit.
 */
export declare enum SubscriptionReadPermission {
    /** Permission to read Azure Monitor metrics. */
    MonitoringReader = 1,// 1
    /** Permission to run Log Analytics / App Insights data queries. */
    LogAnalyticsDataReader = 2,// 2
    /** Permission to read subscription resource groups. */
    ResourceGroupsReader = 4,// 4
    /** Permission to read subscription resource inventory. */
    ResourceInventoryReader = 8,// 8
    /** Permission to read Azure Activity Log events. */
    ActivityLogReader = 16,// 16
    /** Permission to run Azure Resource Graph queries. */
    ResourceGraphReader = 32,// 32
    /** Permission to read Azure Cost Management query results. */
    CostManagementReader = 64,// 64
    /** Permission to read Azure Consumption usage details. */
    ConsumptionUsageReader = 128,// 128
    /** Permission to read Azure Advisor recommendations. */
    AdvisorRecommendationsReader = 256,// 256
    /** Permission to read Defender for Cloud security posture data. */
    SecurityReader = 512
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
    documentationUrl?: string;
}
/**
 * Metadata for a cloud-account-scoped read capability.
 */
export interface CloudAccountReadPermissionMetadata {
    id: CloudAccountReadPermission;
    displayName: string;
    description: string;
    requiredRoles: string[];
    documentationUrl?: string;
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