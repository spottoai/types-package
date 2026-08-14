/**
 * Write Permission Bitmask Enum
 * Each permission gets a unique bit position for efficient storage
 */
export var WritePermission;
(function (WritePermission) {
    /** Permission to dismiss Azure Advisor recommendations */
    WritePermission[WritePermission["DismissRecommendations"] = 1] = "DismissRecommendations";
    /** Permission to enable storage inventory reports on storage accounts */
    WritePermission[WritePermission["StorageInventory"] = 2] = "StorageInventory";
    /** Permission to create scoped Azure Policy exemptions */
    WritePermission[WritePermission["PolicyExemptions"] = 4] = "PolicyExemptions";
})(WritePermission || (WritePermission = {}));
/**
 * Permission metadata array
 * Define all available write permissions with their metadata
 */
export const WRITE_PERMISSIONS_METADATA = [
    {
        id: WritePermission.DismissRecommendations,
        displayName: 'Dismiss Azure Advisor Recommendations',
        description: 'Allows Spotto to dismiss recommendations in Azure when dismissed here.',
        requiredRoles: ['Advisor Recommendations Contributor'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/advisor/permissions',
        scriptGeneratorUrl: '/scripts/advisor-role',
    },
    {
        id: WritePermission.StorageInventory,
        displayName: 'Enable Storage Inventory Reports',
        description: 'Allows Spotto to enable blob inventory on storage accounts you select.',
        requiredRoles: ['Storage Account Contributor'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/storage/blobs/blob-inventory',
        scriptGeneratorUrl: '/scripts/storage-role',
    },
    {
        id: WritePermission.PolicyExemptions,
        displayName: 'Create Azure Policy Exemptions',
        description: 'Allows Spotto to create narrowly scoped exemptions for selected Azure Policy initiative controls.',
        requiredRoles: ['Custom role with Azure Policy exemption actions at the target and assignment scopes'],
        documentationUrl: 'https://docs.spotto.ai/docs/portal/write-permissions/policy-exemptions',
        scriptGeneratorUrl: '/scripts/policy-exemptions-role',
    },
];
