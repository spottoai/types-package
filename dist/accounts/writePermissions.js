"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WRITE_PERMISSIONS_METADATA = exports.KNOWN_WRITE_PERMISSION_MASK = exports.WritePermission = void 0;
/**
 * Write Permission Bitmask Enum
 * Each permission gets a unique bit position for efficient storage
 */
var WritePermission;
(function (WritePermission) {
    /** Permission to dismiss Azure Advisor recommendations */
    WritePermission[WritePermission["DismissRecommendations"] = 1] = "DismissRecommendations";
    /** Permission to enable storage inventory reports on storage accounts */
    WritePermission[WritePermission["StorageInventory"] = 2] = "StorageInventory";
    /** Permission to create scoped Azure Policy exemptions */
    WritePermission[WritePermission["PolicyExemptions"] = 4] = "PolicyExemptions";
    /** Permission to run approved resource scheduling capabilities */
    WritePermission[WritePermission["ResourceScheduling"] = 8] = "ResourceScheduling";
    /** Permission to delete idle or orphaned resources when a clean-up recommendation is implemented */
    WritePermission[WritePermission["RemediationCleanup"] = 16] = "RemediationCleanup";
    /** Permission to resize, reconfigure, deallocate, or start resources when a recommendation is implemented */
    WritePermission[WritePermission["RemediationRightsize"] = 32] = "RemediationRightsize";
    /** Permission to manage reservations and savings plans */
    WritePermission[WritePermission["CommitmentsManage"] = 64] = "CommitmentsManage";
})(WritePermission || (exports.WritePermission = WritePermission = {}));
/**
 * Union of every WritePermission bit defined in this package version.
 * Consumers mask persisted values with this so bits added by a newer producer are ignored, not misread.
 * Bits are only ever added; an existing bit's meaning never changes.
 */
exports.KNOWN_WRITE_PERMISSION_MASK = WritePermission.DismissRecommendations |
    WritePermission.StorageInventory |
    WritePermission.PolicyExemptions |
    WritePermission.ResourceScheduling |
    WritePermission.RemediationCleanup |
    WritePermission.RemediationRightsize |
    WritePermission.CommitmentsManage;
/**
 * Permission metadata array
 * Define all available write permissions with their metadata
 */
exports.WRITE_PERMISSIONS_METADATA = [
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
    {
        id: WritePermission.ResourceScheduling,
        displayName: 'Resource Scheduling',
        description: 'Allows Spotto to run explicitly approved resource scheduling capabilities at their exact Azure scopes.',
        requiredRoles: [],
        permissionManifestKind: 'resource-scheduling',
    },
    {
        id: WritePermission.RemediationCleanup,
        displayName: 'Clean Up Unused Resources',
        description: 'Allows Spotto to delete idle or orphaned resources (for example unattached disks, public IPs and network interfaces) when you implement a clean-up recommendation.',
        requiredRoles: ['Custom role with the delete actions of the Spotto clean-up remediation catalog'],
    },
    {
        id: WritePermission.RemediationRightsize,
        displayName: 'Rightsize and Reconfigure Resources',
        description: 'Allows Spotto to resize, reconfigure, deallocate, or start resources when you implement a rightsizing recommendation.',
        requiredRoles: ['Custom role with the write, deallocate and start actions of the Spotto rightsizing remediation catalog'],
    },
    {
        id: WritePermission.CommitmentsManage,
        displayName: 'Manage Reservations and Savings Plans',
        description: 'Allows Spotto to change reservation and savings plan scope and settings.',
        requiredRoles: ['Reservations Contributor'],
        documentationUrl: 'https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/view-reservations',
    },
];
//# sourceMappingURL=writePermissions.js.map