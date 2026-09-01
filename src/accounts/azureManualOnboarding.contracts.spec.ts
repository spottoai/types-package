import {
  AZURE_MANUAL_ONBOARDING_BILLING_EXPORT_DISCOVERY_LIMITS_V1,
  type AzureBillingExportScopeType,
  type AzureManualOnboardingBillingExportDetectedSource,
  type AzureManualOnboardingBillingExportDiscoveryResult,
} from './azureManualOnboarding';
import type { CloudAccountValidationRequest, CloudAccountValidationResult, CloudAccountValidationStreamEvent } from './validation';

const scopePaths: Record<AzureBillingExportScopeType, string> = {
  subscription: '/subscriptions/00000000-0000-0000-0000-000000000001',
  resourceGroup: '/subscriptions/00000000-0000-0000-0000-000000000001/resourceGroups/billing-exports',
  managementGroup: '/providers/Microsoft.Management/managementGroups/root-management-group',
  billingAccount: '/providers/Microsoft.Billing/billingAccounts/billing-account',
  billingProfile: '/providers/Microsoft.Billing/billingAccounts/billing-account/billingProfiles/billing-profile',
  invoiceSection: '/providers/Microsoft.Billing/billingAccounts/billing-account/billingProfiles/billing-profile/invoiceSections/invoice-section',
  department: '/providers/Microsoft.Billing/billingAccounts/billing-account/departments/department',
  enrollmentAccount: '/providers/Microsoft.Billing/billingAccounts/billing-account/enrollmentAccounts/enrollment-account',
  partnerCustomer: '/providers/Microsoft.Billing/billingAccounts/billing-account/customers/customer',
};

const detectedSources: AzureManualOnboardingBillingExportDetectedSource[] = Object.entries(scopePaths).map(([scopeType, scopePath], index) => ({
  source: {
    datasetType: index % 2 === 0 ? 'actual' : 'amortized',
    scopeType: scopeType as AzureBillingExportScopeType,
    scopePath,
    exportName: `${scopeType}-daily`,
    destination: {
      storageAccountResourceId:
        '/subscriptions/00000000-0000-0000-0000-000000000001/resourceGroups/billing-exports/providers/Microsoft.Storage/storageAccounts/spottoexports',
      storageAccountName: 'spottoexports',
      container: 'cost-exports',
      rootFolderPath: `spotto/${scopeType}`,
    },
  },
  exportResourceId: `${scopePath}/providers/Microsoft.CostManagement/exports/${scopeType}-daily`,
  exportDisplayName: `${scopeType} daily export`,
  scopeDisplayName: scopeType,
  isCompatible: true,
  readability: 'readable',
}));

const billingExportDiscovery: AzureManualOnboardingBillingExportDiscoveryResult = {
  detectedSources,
  storageOptions: [
    {
      storageAccountResourceId:
        '/subscriptions/00000000-0000-0000-0000-000000000001/resourceGroups/billing-exports/providers/Microsoft.Storage/storageAccounts/spottoexports',
      storageAccountName: 'spottoexports',
      subscriptionId: '00000000-0000-0000-0000-000000000001',
      resourceGroupName: 'billing-exports',
      displayName: 'Spotto billing exports',
      location: 'australiaeast',
      isReadable: true,
    },
  ],
  warnings: [
    {
      code: 'scopeAccessDenied',
      message: 'One inaccessible billing scope was skipped.',
      scopePath: '/providers/Microsoft.Billing/billingAccounts/inaccessible-account',
    },
  ],
  truncated: false,
};

const validationRequestWithDiscovery: CloudAccountValidationRequest = {
  id: 'client-id',
  companyId: 'company-id',
  name: 'Azure account',
  companyName: 'Example Company',
  provider: 'Azure',
  tenantId: 'tenant-id',
  secret: 'client-secret',
  useWriteAccess: true,
  writeClientId: 'write-client-id',
  writeSecret: 'write-client-secret',
  includeBillingExportDiscovery: true,
};

const minimalValidationRequest: CloudAccountValidationRequest = {
  id: 'client-id',
  companyId: 'company-id',
  name: 'Azure account',
  provider: 'Azure',
  tenantId: 'tenant-id',
  secret: 'client-secret',
};

const validationResultWithDiscovery = {
  billingExportDiscovery,
} satisfies Pick<CloudAccountValidationResult, 'billingExportDiscovery'>;

const validationResultWithoutDiscovery = {} satisfies Pick<CloudAccountValidationResult, 'billingExportDiscovery'>;

const discoveryCompletedEvent: CloudAccountValidationStreamEvent = {
  event: 'billingExportDiscoveryCompleted',
  message: 'Billing export discovery completed.',
  result: billingExportDiscovery,
};

const detectedSourceLimit: 50 = AZURE_MANUAL_ONBOARDING_BILLING_EXPORT_DISCOVERY_LIMITS_V1.detectedSources;
const storageOptionLimit: 50 = AZURE_MANUAL_ONBOARDING_BILLING_EXPORT_DISCOVERY_LIMITS_V1.storageOptions;
const warningLimit: 20 = AZURE_MANUAL_ONBOARDING_BILLING_EXPORT_DISCOVERY_LIMITS_V1.warnings;

void validationRequestWithDiscovery;
void minimalValidationRequest;
void validationResultWithDiscovery;
void validationResultWithoutDiscovery;
void discoveryCompletedEvent;
void detectedSourceLimit;
void storageOptionLimit;
void warningLimit;
