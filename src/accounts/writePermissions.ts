/**
 * Write Permission Bitmask Enum
 * Each permission gets a unique bit position for efficient storage
 */
export enum WritePermission {
  /** Permission to dismiss Azure Advisor recommendations */
  DismissRecommendations = 1 << 0, // 1
  /** Permission to enable storage inventory reports on storage accounts */
  StorageInventory = 1 << 1, // 2
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
export const WRITE_PERMISSIONS_METADATA: WritePermissionMetadata[] = [
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
