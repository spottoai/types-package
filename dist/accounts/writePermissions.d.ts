/**
 * Write Permission Bitmask Enum
 * Each permission gets a unique bit position for efficient storage
 */
export declare enum WritePermission {
    /** Permission to dismiss Azure Advisor recommendations */
    DismissRecommendations = 1,// 1
    /** Permission to enable storage inventory reports on storage accounts */
    StorageInventory = 2
}
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
}
/**
 * Permission metadata array
 * Define all available write permissions with their metadata
 */
export declare const WRITE_PERMISSIONS_METADATA: WritePermissionMetadata[];
//# sourceMappingURL=writePermissions.d.ts.map