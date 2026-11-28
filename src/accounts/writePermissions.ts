/**
 * Write Permission Bitmask Enum
 * Each permission gets a unique bit position for efficient storage
 */
export enum WritePermission {
  /** Permission to dismiss Azure Advisor recommendations */
  DismissRecommendations = 1 << 0, // 1
  /** Permission to enable storage inventory reports on storage accounts */
  StorageInventory = 1 << 1, // 2
  /** Permission to create scoped Azure Policy exemptions */
  PolicyExemptions = 1 << 2, // 4
  /** Permission to run approved resource scheduling capabilities */
  ResourceScheduling = 1 << 3, // 8
  /** Permission to delete eligible unused, data-free resources when a clean-up recommendation is implemented */
  RemediationCleanup = 1 << 4, // 16
  /**
   * Permission to run rightsize fixes (size, tier or capacity changes) when a recommendation is implemented.
   * Older evidence used the same bit for a broader catalog that included settings and power.
   * Match the observation's fix catalog version before using this bit for current coverage.
   */
  RemediationRightsize = 1 << 5, // 32
  /** Permission to manage reservations and savings plans */
  CommitmentsManage = 1 << 6, // 64
  /** Permission to run configuration fixes (reversible setting changes) when a recommendation is implemented */
  RemediationConfiguration = 1 << 7, // 128
  /** Permission to run power fixes (deallocate, start, pause or resume) when a recommendation is implemented */
  RemediationPower = 1 << 8, // 256
  /** Permission to run licensing fixes such as Azure Hybrid Benefit when a recommendation is implemented */
  RemediationLicensing = 1 << 9, // 512
}

/**
 * Union of every WritePermission bit defined in this package version.
 * Consumers mask persisted values with this so bits added by a newer producer are ignored, not misread.
 * Bits are only ever added; an existing bit's meaning never changes.
 */
export const KNOWN_WRITE_PERMISSION_MASK: number =
  WritePermission.DismissRecommendations |
  WritePermission.StorageInventory |
  WritePermission.PolicyExemptions |
  WritePermission.ResourceScheduling |
  WritePermission.RemediationCleanup |
  WritePermission.RemediationRightsize |
  WritePermission.CommitmentsManage |
  WritePermission.RemediationConfiguration |
  WritePermission.RemediationPower |
  WritePermission.RemediationLicensing;

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
    description:
      'Allows Spotto to delete eligible unused resources that hold no data, such as unused network interfaces, when you implement a clean-up recommendation.',
    requiredRoles: ['Spotto clean-up fixes custom role'],
  },
  {
    id: WritePermission.RemediationRightsize,
    displayName: 'Rightsize Resources',
    description: 'Allows Spotto to change the size, tier or capacity of resources when you implement a rightsizing recommendation.',
    requiredRoles: ['Spotto rightsize fixes custom role'],
  },
  {
    id: WritePermission.RemediationConfiguration,
    displayName: 'Change Settings',
    description: 'Allows Spotto to change resource settings, such as minimum TLS or HTTPS only, when you implement a recommendation.',
    requiredRoles: ['Spotto configuration fixes custom role'],
  },
  {
    id: WritePermission.RemediationPower,
    displayName: 'Stop and Start Resources',
    description: 'Allows Spotto to deallocate, start, pause or resume resources when you implement a recommendation.',
    requiredRoles: ['Spotto power fixes custom role'],
  },
  {
    id: WritePermission.RemediationLicensing,
    displayName: 'Apply Licensing Benefits',
    description: 'Allows Spotto to apply licence settings such as Azure Hybrid Benefit when you implement a recommendation.',
    requiredRoles: ['Spotto licensing fixes custom role'],
  },
  {
    id: WritePermission.CommitmentsManage,
    displayName: 'Manage Reservations and Savings Plans',
    description: 'Allows Spotto to change reservation and savings plan scope and settings.',
    requiredRoles: ['Reservations Contributor'],
    documentationUrl: 'https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/view-reservations',
  },
];
