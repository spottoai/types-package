/**
 * Write Permission Bitmask Enum
 * Each permission gets a unique bit position for efficient storage
 */
export declare enum WritePermission {
    /** Permission to dismiss Azure Advisor recommendations */
    DismissRecommendations = 1,// 1
    /** Permission to enable storage inventory reports on storage accounts */
    StorageInventory = 2,// 2
    /** Permission to create scoped Azure Policy exemptions */
    PolicyExemptions = 4,// 4
    /** Permission to run approved resource scheduling capabilities */
    ResourceScheduling = 8,// 8
    /** Permission to delete idle or orphaned resources when a clean-up recommendation is implemented */
    RemediationCleanup = 16,// 16
    /** Permission to resize, reconfigure, deallocate, or start resources when a recommendation is implemented */
    RemediationRightsize = 32,// 32
    /** Permission to manage reservations and savings plans */
    CommitmentsManage = 64
}
/**
 * Union of every WritePermission bit defined in this package version.
 * Consumers mask persisted values with this so bits added by a newer producer are ignored, not misread.
 * Bits are only ever added; an existing bit's meaning never changes.
 */
export declare const KNOWN_WRITE_PERMISSION_MASK: number;
/**
 * Metadata for a write permission
 * Contains display information, required roles, and documentation links
 */
export interface WritePermissionMetadata {
    /** Unique identifier matching the WritePermission enum */
    id: WritePermission;
    /** Human-readable display name */
    displayName: string;
    /** Description of what this permission allows */
    description: string;
    /** Required Azure RBAC role(s) for this permission */
    requiredRoles: string[];
    /** URL to documentation about this permission */
    documentationUrl?: string;
    /** URL to script generator for creating custom roles */
    scriptGeneratorUrl?: string;
    /** Identifies permissions whose provider grants come from an immutable multi-group manifest. */
    permissionManifestKind?: 'resource-scheduling';
}
/**
 * Permission metadata array
 * Define all available write permissions with their metadata
 */
export declare const WRITE_PERMISSIONS_METADATA: WritePermissionMetadata[];
//# sourceMappingURL=writePermissions.d.ts.map