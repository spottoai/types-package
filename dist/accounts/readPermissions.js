"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA = exports.SUBSCRIPTION_READ_PERMISSIONS_METADATA = exports.CloudAccountReadPermission = exports.SubscriptionReadPermission = void 0;
/**
 * Subscription-scoped read capability bitmask enum.
 * Each capability maps to a single bit.
 */
var SubscriptionReadPermission;
(function (SubscriptionReadPermission) {
    /** Permission to read Azure Monitor metrics. */
    SubscriptionReadPermission[SubscriptionReadPermission["MonitoringReader"] = 1] = "MonitoringReader";
    /** Permission to run Log Analytics / App Insights data queries. */
    SubscriptionReadPermission[SubscriptionReadPermission["LogAnalyticsDataReader"] = 2] = "LogAnalyticsDataReader";
})(SubscriptionReadPermission || (exports.SubscriptionReadPermission = SubscriptionReadPermission = {}));
/**
 * Cloud-account-scoped read capability bitmask enum.
 * Each capability maps to a single bit.
 */
var CloudAccountReadPermission;
(function (CloudAccountReadPermission) {
    /** Permission to read management group entities. */
    CloudAccountReadPermission[CloudAccountReadPermission["ManagementGroupReader"] = 1] = "ManagementGroupReader";
    /** Permission to read reservation resources and related consumption artifacts. */
    CloudAccountReadPermission[CloudAccountReadPermission["ReservationsReader"] = 2] = "ReservationsReader";
    /** Permission to read savings plan resources. */
    CloudAccountReadPermission[CloudAccountReadPermission["SavingsPlanReader"] = 4] = "SavingsPlanReader";
    /** Permission to read Microsoft Graph applications/service principals. */
    CloudAccountReadPermission[CloudAccountReadPermission["GraphApplicationReadAll"] = 8] = "GraphApplicationReadAll";
})(CloudAccountReadPermission || (exports.CloudAccountReadPermission = CloudAccountReadPermission = {}));
exports.SUBSCRIPTION_READ_PERMISSIONS_METADATA = [
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
exports.CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA = [
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
//# sourceMappingURL=readPermissions.js.map