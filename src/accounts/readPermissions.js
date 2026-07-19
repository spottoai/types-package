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
    /** Permission to read subscription resource groups. */
    SubscriptionReadPermission[SubscriptionReadPermission["ResourceGroupsReader"] = 4] = "ResourceGroupsReader";
    /** Permission to read subscription resource inventory. */
    SubscriptionReadPermission[SubscriptionReadPermission["ResourceInventoryReader"] = 8] = "ResourceInventoryReader";
    /** Permission to read Azure Activity Log events. */
    SubscriptionReadPermission[SubscriptionReadPermission["ActivityLogReader"] = 16] = "ActivityLogReader";
    /** Permission to run Azure Resource Graph queries. */
    SubscriptionReadPermission[SubscriptionReadPermission["ResourceGraphReader"] = 32] = "ResourceGraphReader";
    /** Permission to read Azure Cost Management query results. */
    SubscriptionReadPermission[SubscriptionReadPermission["CostManagementReader"] = 64] = "CostManagementReader";
    /** Permission to read Azure Consumption usage details. */
    SubscriptionReadPermission[SubscriptionReadPermission["ConsumptionUsageReader"] = 128] = "ConsumptionUsageReader";
    /** Permission to read Azure Advisor recommendations. */
    SubscriptionReadPermission[SubscriptionReadPermission["AdvisorRecommendationsReader"] = 256] = "AdvisorRecommendationsReader";
    /** Permission to read Defender for Cloud security posture data. */
    SubscriptionReadPermission[SubscriptionReadPermission["SecurityReader"] = 512] = "SecurityReader";
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
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/azure-monitor/roles-permissions-security',
    },
    {
        id: SubscriptionReadPermission.LogAnalyticsDataReader,
        displayName: 'Log Analytics Data Reader',
        description: 'Allows Spotto to run Log Analytics and App Insights data queries.',
        requiredRoles: ['Log Analytics Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/azure-monitor/logs/manage-access',
    },
    {
        id: SubscriptionReadPermission.ResourceGroupsReader,
        displayName: 'Resource Groups Reader',
        description: 'Allows Spotto to read resource groups for subscription inventory and grouping.',
        requiredRoles: ['Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/general#reader',
    },
    {
        id: SubscriptionReadPermission.ResourceInventoryReader,
        displayName: 'Resource Inventory Reader',
        description: 'Allows Spotto to read subscription resources for inventory, recommendations, relationship graph, and portal/plugin views.',
        requiredRoles: ['Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/general#reader',
    },
    {
        id: SubscriptionReadPermission.ActivityLogReader,
        displayName: 'Activity Log Reader',
        description: 'Allows Spotto to read Azure Activity Log events for operational context and refresh decisions.',
        requiredRoles: ['Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log',
    },
    {
        id: SubscriptionReadPermission.ResourceGraphReader,
        displayName: 'Resource Graph Reader',
        description: 'Allows Spotto to run Azure Resource Graph queries used by inventory, governance, reliability, and security checks.',
        requiredRoles: ['Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/governance/resource-graph/overview',
    },
    {
        id: SubscriptionReadPermission.CostManagementReader,
        displayName: 'Cost Management Reader',
        description: 'Allows Spotto to read scoped Azure Cost Management data for costs, budgets, and savings calculations.',
        requiredRoles: ['Cost Management Reader', 'Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/assign-access-acm-data',
    },
    {
        id: SubscriptionReadPermission.ConsumptionUsageReader,
        displayName: 'Consumption Usage Reader',
        description: 'Allows Spotto to read Azure usage detail rows for usage attribution and commitment analysis.',
        requiredRoles: ['Cost Management Reader', 'Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/rest/api/consumption/usage-details/list',
    },
    {
        id: SubscriptionReadPermission.AdvisorRecommendationsReader,
        displayName: 'Advisor Recommendations Reader',
        description: 'Allows Spotto to read Azure Advisor recommendations for recommendation import and optimization workflows.',
        requiredRoles: ['Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/advisor/advisor-overview',
    },
    {
        id: SubscriptionReadPermission.SecurityReader,
        displayName: 'Security Reader',
        description: 'Allows Spotto to read Defender for Cloud assessments, secure score, and security posture data.',
        requiredRoles: ['Security Reader', 'Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/permissions',
    },
];
exports.CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA = [
    {
        id: CloudAccountReadPermission.ManagementGroupReader,
        displayName: 'Management Group Reader',
        description: 'Allows Spotto to read tenant management group entities.',
        requiredRoles: ['Management Group Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/governance/management-groups/how-to/protect-resource-hierarchy',
    },
    {
        id: CloudAccountReadPermission.ReservationsReader,
        displayName: 'Reservations Reader',
        description: 'Allows Spotto to read reservation resources and reservation usage artifacts.',
        requiredRoles: ['Reservations Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/view-reservations',
    },
    {
        id: CloudAccountReadPermission.SavingsPlanReader,
        displayName: 'Savings Plan Reader',
        description: 'Allows Spotto to read savings plan resources.',
        requiredRoles: ['Savings plan Reader'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/view-utilization',
    },
    {
        id: CloudAccountReadPermission.GraphApplicationReadAll,
        displayName: 'Graph Application Read.All',
        description: 'Allows Spotto to read Microsoft Graph applications and service principals.',
        requiredRoles: ['Application.Read.All'],
        documentationUrl: 'https://learn.microsoft.com/en-us/graph/permissions-reference#applicationreadall',
    },
];
//# sourceMappingURL=readPermissions.js.map