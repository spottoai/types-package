export type {
  CloudAccountCapabilityValidationPlan,
  CloudAccountCapabilityValidationProgress,
  CloudAccountCapabilityValidationResult,
  CloudAccountCapabilityValidationScope,
  CloudAccountCapabilityValidationStatus,
  CloudAccountReadAccessValidation,
  CloudAccountValidationResult,
  CloudAccountValidationStreamEvent,
  CloudAccountWriteAccessValidation,
  SubscriptionReadValidationResult,
  SubscriptionValidationStatus,
} from './validation';

/**
 * Subscription-scoped read capability bitmask enum.
 * Each capability maps to a single bit.
 */
export enum SubscriptionReadPermission {
  /** Permission to read Azure Monitor metrics. */
  MonitoringReader = 1 << 0, // 1
  /** Permission to run Log Analytics / App Insights data queries. */
  LogAnalyticsDataReader = 1 << 1, // 2
  /** Permission to read subscription resource groups. */
  ResourceGroupsReader = 1 << 2, // 4
  /** Permission to read subscription resource inventory. */
  ResourceInventoryReader = 1 << 3, // 8
  /** Permission to read Azure Activity Log events. */
  ActivityLogReader = 1 << 4, // 16
  /** Permission to run Azure Resource Graph queries. */
  ResourceGraphReader = 1 << 5, // 32
  /** Permission to read Azure Cost Management query results. */
  CostManagementReader = 1 << 6, // 64
  /** Permission to read Azure Consumption usage details. */
  ConsumptionUsageReader = 1 << 7, // 128
  /** Permission to read Azure Advisor recommendations and Advisor score. */
  AdvisorRecommendationsReader = 1 << 8, // 256
  /** Permission to read Defender for Cloud security posture data. */
  SecurityReader = 1 << 9, // 512
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
  /** Permission to read Microsoft Graph privileged role assignment schedules. */
  GraphRoleAssignmentScheduleReadDirectory = 1 << 4, // 16
  /** Permission to read Microsoft Graph privileged role eligibility schedules. */
  GraphRoleEligibilityScheduleReadDirectory = 1 << 5, // 32
  /** Permission to read Microsoft Graph role-management metadata. */
  GraphRoleManagementReadDirectory = 1 << 6, // 64
  /** Permission to read Microsoft Graph group memberships. */
  GraphGroupMemberReadAll = 1 << 7, // 128
  /** Permission to read Microsoft Graph user metadata. */
  GraphUserReadAll = 1 << 8, // 256
  /** Permission to inspect Microsoft Graph privileged role assignment schedule requests. */
  GraphRoleAssignmentScheduleReadWriteDirectory = 1 << 9, // 512
  /** Permission to read Microsoft Graph audit logs. */
  GraphAuditLogReadAll = 1 << 10, // 1024
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

export const SUBSCRIPTION_READ_PERMISSIONS_METADATA: SubscriptionReadPermissionMetadata[] = [
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
    displayName: 'Advisor Reader',
    description: 'Allows Spotto to read Azure Advisor recommendations and Advisor score for recommendation import and optimization workflows.',
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

export const CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA: CloudAccountReadPermissionMetadata[] = [
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
  {
    id: CloudAccountReadPermission.GraphRoleAssignmentScheduleReadDirectory,
    displayName: 'Graph RoleAssignmentSchedule Read.Directory',
    description: 'Allows Spotto to read active Microsoft Graph role assignment schedules.',
    requiredRoles: ['RoleAssignmentSchedule.Read.Directory'],
    documentationUrl: 'https://learn.microsoft.com/en-us/graph/permissions-reference#roleassignmentschedulereaddirectory',
  },
  {
    id: CloudAccountReadPermission.GraphRoleEligibilityScheduleReadDirectory,
    displayName: 'Graph RoleEligibilitySchedule Read.Directory',
    description: 'Allows Spotto to read eligible Microsoft Graph role schedules.',
    requiredRoles: ['RoleEligibilitySchedule.Read.Directory'],
    documentationUrl: 'https://learn.microsoft.com/en-us/graph/permissions-reference#roleeligibilityschedulereaddirectory',
  },
  {
    id: CloudAccountReadPermission.GraphRoleManagementReadDirectory,
    displayName: 'Graph RoleManagement Read.Directory',
    description: 'Allows Spotto to read Microsoft Graph role-management metadata.',
    requiredRoles: ['RoleManagement.Read.Directory'],
    documentationUrl: 'https://learn.microsoft.com/en-us/graph/permissions-reference#rolemanagementreaddirectory',
  },
  {
    id: CloudAccountReadPermission.GraphGroupMemberReadAll,
    displayName: 'Graph GroupMember Read.All',
    description: 'Allows Spotto to read Microsoft Graph group memberships.',
    requiredRoles: ['GroupMember.Read.All'],
    documentationUrl: 'https://learn.microsoft.com/en-us/graph/permissions-reference#groupmemberreadall',
  },
  {
    id: CloudAccountReadPermission.GraphUserReadAll,
    displayName: 'Graph User Read.All',
    description: 'Allows Spotto to read Microsoft Graph user metadata.',
    requiredRoles: ['User.Read.All'],
    documentationUrl: 'https://learn.microsoft.com/en-us/graph/permissions-reference#userreadall',
  },
  {
    id: CloudAccountReadPermission.GraphRoleAssignmentScheduleReadWriteDirectory,
    displayName: 'Graph RoleAssignmentSchedule ReadWrite.Directory',
    description: 'Allows Spotto to inspect Microsoft Graph role assignment schedule requests for privileged-access governance.',
    requiredRoles: ['RoleAssignmentSchedule.ReadWrite.Directory'],
    documentationUrl: 'https://learn.microsoft.com/en-us/graph/permissions-reference#roleassignmentschedulereadwritedirectory',
  },
  {
    id: CloudAccountReadPermission.GraphAuditLogReadAll,
    displayName: 'Graph AuditLog Read.All',
    description: 'Allows Spotto to read Microsoft Graph audit logs.',
    requiredRoles: ['AuditLog.Read.All'],
    documentationUrl: 'https://learn.microsoft.com/en-us/graph/permissions-reference#auditlogreadall',
  },
];
