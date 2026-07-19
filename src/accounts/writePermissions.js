"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WRITE_PERMISSIONS_METADATA = exports.WritePermission = void 0;
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
})(WritePermission || (exports.WritePermission = WritePermission = {}));
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
];
//# sourceMappingURL=writePermissions.js.map