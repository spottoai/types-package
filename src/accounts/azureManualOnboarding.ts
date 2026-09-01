/** Cost Management dataset represented by one Azure billing export source. */
export type AzureBillingExportDatasetType = 'actual' | 'amortized';

/** Azure scopes at which Cost Management exports can be configured. */
export type AzureBillingExportScopeType =
  | 'subscription'
  | 'resourceGroup'
  | 'managementGroup'
  | 'billingAccount'
  | 'billingProfile'
  | 'invoiceSection'
  | 'department'
  | 'enrollmentAccount'
  | 'partnerCustomer';

/**
 * Optional direct Blob destination supplied for one Cost Management export.
 *
 * Omitting `destination` from the dataset configuration asks the API to resolve it
 * from the export definition. When supplied, the destination must identify the
 * storage account by resource ID or account name and must include the complete
 * container path needed by cloud-engine.
 */
export type AzureBillingExportDestinationInput =
  | {
      storageAccountResourceId: string;
      storageAccountName?: string;
      container: string;
      rootFolderPath: string;
    }
  | {
      storageAccountResourceId?: string;
      storageAccountName: string;
      container: string;
      rootFolderPath: string;
    };

/** User- or script-supplied configuration for one billing export source. */
export interface AzureBillingExportSourceInput {
  datasetType: AzureBillingExportDatasetType;
  scopeType: AzureBillingExportScopeType;
  scopePath: string;
  exportName: string;
  destination?: AzureBillingExportDestinationInput;
}

/** A manual-onboarding billing export configuration must contain at least one source. */
export interface AzureBillingExportConfigurationInput {
  sources: [AzureBillingExportSourceInput, ...AzureBillingExportSourceInput[]];
}

/** Overall ability to read a detected export and its configured Blob destination. */
export type AzureManualOnboardingBillingExportReadability = 'readable' | 'accessDenied' | 'unavailable' | 'unknown';

/**
 * One Azure Cost Management export detected with the submitted manual-onboarding
 * credentials. `source` is the exact V1 input that can be selected for saving.
 */
export interface AzureManualOnboardingBillingExportDetectedSource {
  source: AzureBillingExportSourceInput;
  exportResourceId: string;
  exportDisplayName?: string;
  scopeDisplayName?: string;
  isCompatible: boolean;
  readability: AzureManualOnboardingBillingExportReadability;
}

/**
 * A storage account referenced by at least one detected export. Results are
 * deduplicated case-insensitively by `storageAccountResourceId`.
 */
export interface AzureManualOnboardingBillingExportStorageOption {
  storageAccountResourceId: string;
  storageAccountName: string;
  subscriptionId: string;
  resourceGroupName: string;
  displayName?: string;
  location?: string;
  isReadable: boolean;
}

export type AzureManualOnboardingBillingExportDiscoveryWarningCode =
  | 'scopeAccessDenied'
  | 'exportUnreadable'
  | 'storageAccessDenied'
  | 'storageUnreadable'
  | 'discoveryUnavailable'
  | 'resultTruncated';

/** Public-safe diagnostic emitted when billing-export discovery is incomplete. */
export interface AzureManualOnboardingBillingExportDiscoveryWarning {
  code: AzureManualOnboardingBillingExportDiscoveryWarningCode;
  message: string;
  scopePath?: string;
  exportResourceId?: string;
  storageAccountResourceId?: string;
}

/** Shared producer/consumer bounds for the optional V1 discovery projection. */
export const AZURE_MANUAL_ONBOARDING_BILLING_EXPORT_DISCOVERY_LIMITS_V1 = {
  detectedSources: 50,
  storageOptions: 50,
  warnings: 20,
} as const;

/**
 * Optional billing-export projection returned by manual credential validation.
 * Producers must honor the V1 limits and set `truncated` when any result is omitted.
 */
export interface AzureManualOnboardingBillingExportDiscoveryResult {
  detectedSources: AzureManualOnboardingBillingExportDetectedSource[];
  storageOptions: AzureManualOnboardingBillingExportStorageOption[];
  warnings: AzureManualOnboardingBillingExportDiscoveryWarning[];
  truncated: boolean;
}

/** Credentials emitted by manual Azure onboarding tooling for import into Spotto. */
export interface AzureManualOnboardingCredentialsInput {
  tenantId: string;
  clientId: string;
  /** Required when creating a cloud account; may be absent when an existing credential is reused. */
  clientSecret?: string;
  clientSecretExpiresAt?: string;
}

export const AZURE_MANUAL_ONBOARDING_IMPORT_SCHEMA_VERSION = 1 as const;
export const AZURE_MANUAL_ONBOARDING_IMPORT_KIND = 'spotto.azure.manual-onboarding' as const;

/** Versioned JSON handoff emitted by Setup-SpottoAzure.ps1 and accepted by manual onboarding UI. */
export interface AzureManualOnboardingImportV1 {
  schemaVersion: typeof AZURE_MANUAL_ONBOARDING_IMPORT_SCHEMA_VERSION;
  kind: typeof AZURE_MANUAL_ONBOARDING_IMPORT_KIND;
  credentials: AzureManualOnboardingCredentialsInput;
  billingExports?: AzureBillingExportConfigurationInput;
}

export type AzureBillingExportConfigurationVerificationStatus = 'notConfigured' | 'unverified' | 'verified' | 'failed';

/** Public-safe status only; it intentionally excludes billing scopes and storage topology. */
export interface AzureBillingExportConfigurationStatus {
  configured: boolean;
  actualConfigured: boolean;
  amortizedConfigured: boolean;
  destinationProvided: boolean;
  verificationStatus: AzureBillingExportConfigurationVerificationStatus;
}
