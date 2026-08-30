import type {
  AzureCloudAccountSyncFeatureId,
  AzureSyncFeatureId,
  AzureSubscriptionSyncFeatureId,
  AzureGdapCapabilityStatus,
  AzureGdapAuthorizationProfileSummary,
  AzureGdapAuthorizationProfileListResponse,
  AzureGdapCloudAccountCreateRequest,
  AzureGdapCloudAccountMetadata,
  AzureGdapCloudAccountStatusResponse,
  AzureGdapCreateAuthorizationProfileRequest,
  AzureGdapDraftValidationRequest,
  AzureGdapDraftValidationResponse,
  AzureGdapEligibleAuthorizationProfilesResponse,
  AzureGdapPartnerAuthorizationStartResponse,
  AzureGdapRelationshipLifecycle,
  AzureGdapStartPartnerAuthorizationRequest,
  AzureGdapSubscriptionOption,
  AzureGdapValidationStatus,
  AzureDelegatedAuthErrorCode,
  AzureGuestAccessScanSchedulingMode,
  AzureGuestAccessStatus,
  AzureGuestAccessStatusReason,
  CloudAccount,
  CloudAccountAuthMode,
  CloudAccountScanSchedulingMode,
  CloudAccountFirstSyncNotificationStatus,
  CloudAccountSyncFeatureOptOutsUpdateRequest,
  PublicCloudAccountDto,
  SyncProgressIssue,
  SubscriptionAccount,
  SubscriptionInfoBase,
  SubscriptionSyncFeatureOptOutsUpdateRequest,
} from './accounts';
import type {
  AzureBillingExportConfigurationInput,
  AzureBillingExportScopeType,
  AzureManualOnboardingImportV1,
  CloudAccountBillingExportLocatorConfiguration,
  CloudAccountTenantSyncRequestMessage,
} from '../index';
import type { CompanySubscription, SecureScoreEvidence } from '../azure/subscriptions';
import {
  AZURE_SYNC_FEATURE_METADATA,
  AZURE_SYNC_FEATURE_ORDER,
  getAzureSyncFeatureIdsForScope,
  getAzureSyncFeatureMetadata,
  getAzureSyncFeatureOptions,
  isAzureSyncFeatureId,
  isAzureSyncFeatureSupportedInScope,
  sortAzureSyncFeatureIds,
} from './accounts';
import {
  AZURE_MANUAL_ONBOARDING_IMPORT_KIND,
  AZURE_MANUAL_ONBOARDING_IMPORT_SCHEMA_VERSION,
  CLOUD_ACCOUNT_BILLING_EXPORT_LOCATOR_SCHEMA_VERSION,
} from '../index';
import {
  CloudAccountReadPermission,
  SubscriptionReadPermission,
  CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA,
  SUBSCRIPTION_READ_PERMISSIONS_METADATA,
} from './readPermissions';

const cloudAccountWithRecommendationEffortProfile: CloudAccount = {
  companyId: 'comp-123',
  id: 'tenant-client-id-123',
  name: 'Production Azure Tenant',
  companyName: 'Spotto',
  provider: 'Azure',
  tenantId: 'tenant-123',
  createdAt: new Date('2026-03-29T00:00:00.000Z'),
  updatedAt: new Date('2026-03-29T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  effortProfile: 'enterprise',
  readBitmask:
    CloudAccountReadPermission.ManagementGroupReader |
    CloudAccountReadPermission.GraphApplicationReadAll |
    CloudAccountReadPermission.GraphRoleAssignmentScheduleReadDirectory |
    CloudAccountReadPermission.GraphRoleEligibilityScheduleReadDirectory |
    CloudAccountReadPermission.GraphRoleManagementReadDirectory |
    CloudAccountReadPermission.GraphGroupMemberReadAll |
    CloudAccountReadPermission.GraphUserReadAll |
    CloudAccountReadPermission.GraphAuditLogReadAll,
  syncFeatureOptOuts: ['activityMonitoring', 'relationshipGraphs'],
};

const cloudAccountWithoutRecommendationEffortProfile: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-456',
  effortProfile: undefined,
};

const servicePrincipalAccountWithoutAuthMode: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-sp-compat',
};

const delegatedCloudAccount: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'delegated-account-123',
  authMode: 'delegatedUser',
  onboardingStatus: 'active',
  scanSchedulingMode: 'onDemandOnly',
  guestAccessStatus: 'completed',
  guestAccessStatusReason: 'billing_2m_failed',
  guestAccessRunId: 'guest-run-123',
  guestAccessLastRunId: 'guest-run-122',
  guestAccessQueuedAt: '2026-06-16T08:00:00.000Z',
  guestAccessScanStartedAt: '2026-06-16T08:01:00.000Z',
  guestAccessScanCompletedAt: '2026-06-16T08:30:00.000Z',
  guestAccessLastSuccessfulScanAt: '2026-06-16T08:30:00.000Z',
  delegatedTokenCache: 'internal-token-cache',
  delegatedSetupExpiresAt: '2026-05-17T00:00:00.000Z',
  delegatedTrialStartedAt: new Date('2026-05-10T00:00:00.000Z'),
  delegatedTrialExpiresAt: '2026-06-09T00:00:00.000Z',
  reauthRequired: false,
  lastAuthErrorCode: 'interaction_required',
  lastAuthErrorAt: '2026-05-11T00:00:00.000Z',
  connectedUserObjectId: 'user-object-123',
  connectedUserTenantId: 'tenant-123',
  connectedUserEmail: 'owner@example.com',
  connectedUserDisplayName: 'Azure Owner',
  connectedAt: '2026-05-10T00:00:00.000Z',
  lastTokenRefreshAt: new Date('2026-05-10T01:00:00.000Z'),
  lastDelegatedTokenCacheUpdatedAt: '2026-05-10T01:00:00.000Z',
};

const delegatedAuthMode: CloudAccountAuthMode = 'delegatedUser';
const gdapAuthMode: CloudAccountAuthMode = 'gdap';
const awsCrossAccountRoleAuthMode: CloudAccountAuthMode = 'crossAccountRole';
const delegatedAuthErrorCode: AzureDelegatedAuthErrorCode = 'claims_challenge';
const cloudAccountScanSchedulingMode: CloudAccountScanSchedulingMode = 'daily';
const guestAccessScanSchedulingMode: AzureGuestAccessScanSchedulingMode = 'onDemandOnly';
const guestAccessStatus: AzureGuestAccessStatus = 'tenantAuthorizationRequired';
const guestAccessStatusReason: AzureGuestAccessStatusReason = 'refresh_requires_interaction';
const gdapValidationStatus: AzureGdapValidationStatus = 'degraded';

// @ts-expect-error guest access scan scheduling is on-demand only.
const invalidGuestAccessScanSchedulingMode: AzureGuestAccessScanSchedulingMode = 'daily';

const gdapCapabilityStatus: AzureGdapCapabilityStatus = {
  key: 'partnerAuthorization',
  status: 'ready',
  checkedAt: '2026-06-11T00:00:00.000Z',
};

const gdapCloudAccountMetadata: AzureGdapCloudAccountMetadata = {
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapRelationshipDisplayName: 'Customer GDAP relationship',
  gdapRelationshipStatus: 'active',
  gdapAccessAssignmentId: 'assignment-123',
  gdapAccessAssignmentStatus: 'active',
  gdapSecurityGroupId: 'security-group-123',
  gdapSecurityGroupDisplayName: 'Azure Managers',
  gdapRoles: [
    {
      roleTemplateId: 'directory-readers-template-id',
      displayName: 'Directory Readers',
    },
  ],
  gdapExpiresAt: '2026-12-11T00:00:00.000Z',
  gdapPartnerAuthorizationStatus: 'ready',
  gdapAppConsentStatus: 'ready',
  gdapLastValidatedAt: '2026-06-11T00:00:00.000Z',
  gdapLastValidationStatus: 'degraded',
  gdapLastValidationErrorCode: 'cost_management_unavailable',
  gdapLastValidationMessage: 'Cost Management read access is unavailable.',
  gdapScheduledEligible: false,
  gdapScheduledEligibilityReason: 'Manual validation required before scheduled scans are enabled.',
  gdapCapabilities: [gdapCapabilityStatus],
};

const gdapCloudAccount: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'gdap-account-123',
  authMode: 'gdap',
  tenantId: 'customer-tenant-123',
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapRelationshipDisplayName: 'Customer GDAP relationship',
  gdapRelationshipStatus: 'active',
  gdapAccessAssignmentId: 'assignment-123',
  gdapAccessAssignmentStatus: 'active',
  gdapSecurityGroupId: 'security-group-123',
  gdapSecurityGroupDisplayName: 'Azure Managers',
  gdapRolesJson: JSON.stringify(gdapCloudAccountMetadata.gdapRoles),
  gdapExpiresAt: '2026-12-11T00:00:00.000Z',
  gdapPartnerAuthorizationStatus: 'ready',
  gdapAppConsentStatus: 'ready',
  gdapLastValidatedAt: new Date('2026-06-11T00:00:00.000Z'),
  gdapLastValidationStatus: 'degraded',
  gdapLastValidationErrorCode: 'cost_management_unavailable',
  gdapLastValidationMessage: 'Cost Management read access is unavailable.',
  gdapScheduledEligible: false,
  gdapScheduledEligibilityReason: 'Manual validation required before scheduled scans are enabled.',
  gdapCapabilities: [gdapCapabilityStatus],
  gdapCredentialReference: 'internal-gdap-credential-reference',
};

const gdapAuthorizationProfileSummary: AzureGdapAuthorizationProfileSummary = {
  id: 'gdapauth-profile-123',
  companyId: 'root-msp-123',
  displayName: 'Root MSP GDAP authorization',
  partnerTenantId: 'partner-tenant-123',
  authorizationStatus: 'ready',
  hasCredential: true,
  authorizedAt: '2026-06-11T00:00:00.000Z',
  expiresAt: '2026-12-11T00:00:00.000Z',
  lastValidatedAt: '2026-06-11T00:00:00.000Z',
  lastValidationStatus: 'ready',
  createdAt: '2026-06-10T00:00:00.000Z',
  updatedAt: '2026-06-11T00:00:00.000Z',
};

const invalidGdapAuthorizationProfileSummaryWithCredentialReference: AzureGdapAuthorizationProfileSummary = {
  ...gdapAuthorizationProfileSummary,
  // @ts-expect-error public authorization profile summaries must not expose credential references.
  credentialReference: 'cloudaccounts/credentials/gdap/profile-token-cache.json',
};

const gdapAuthorizationProfileListResponse: AzureGdapAuthorizationProfileListResponse = {
  profiles: [gdapAuthorizationProfileSummary],
};

const gdapEligibleAuthorizationProfilesResponse: AzureGdapEligibleAuthorizationProfilesResponse = {
  rootCompanyId: 'root-msp-123',
  profiles: [gdapAuthorizationProfileSummary],
};

const gdapCreateAuthorizationProfileRequest: AzureGdapCreateAuthorizationProfileRequest = {
  displayName: 'Root MSP GDAP authorization',
  partnerTenantId: 'partner-tenant-123',
};

const gdapStartPartnerAuthorizationRequest: AzureGdapStartPartnerAuthorizationRequest = {
  redirectAfter: '/companies/root-msp-123/cloud-accounts/connect-gdap',
};

const gdapPartnerAuthorizationStartResponse: AzureGdapPartnerAuthorizationStartResponse = {
  profileId: 'gdapauth-profile-123',
  authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=spotto-gdap-client-id',
  expiresAt: '2026-06-11T01:00:00.000Z',
};

const gdapRelationshipLifecycle: AzureGdapRelationshipLifecycle = {
  relationshipId: 'relationship-123',
  displayName: 'Customer GDAP relationship',
  customerTenantId: 'customer-tenant-123',
  status: 'active',
  accessAssignmentId: 'assignment-123',
  accessAssignmentStatus: 'active',
  securityGroupId: 'security-group-123',
  securityGroupDisplayName: 'Azure Managers',
  roles: [
    {
      roleTemplateId: 'directory-readers-template-id',
      displayName: 'Directory Readers',
    },
  ],
  expiresAt: '2026-12-11T00:00:00.000Z',
  autoExtendEnabled: false,
};

const gdapSubscriptionOption: AzureGdapSubscriptionOption = {
  subscriptionId: 'subscription-a-123',
  displayName: 'Company A Production',
  tenantId: 'customer-tenant-123',
  state: 'Enabled',
};

const gdapDraftValidationRequest: AzureGdapDraftValidationRequest = {
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  tenantId: 'customer-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapAccessAssignmentId: 'assignment-123',
  gdapSecurityGroupId: 'security-group-123',
};

const gdapDraftValidationResponse: AzureGdapDraftValidationResponse = {
  valid: true,
  status: 'ready',
  profile: gdapAuthorizationProfileSummary,
  capabilities: [gdapCapabilityStatus],
  customerTenantId: 'customer-tenant-123',
  appConsentStatus: 'ready',
  relationship: gdapRelationshipLifecycle,
  subscriptions: [gdapSubscriptionOption],
  validationReceipt: 'opaque-customer-scoped-validation-receipt',
  validationExpiresAt: '2026-06-11T00:15:00.000Z',
  message: 'GDAP validation succeeded.',
};

const blockedGdapDraftValidationResponse: AzureGdapDraftValidationResponse = {
  valid: false,
  status: 'blocked',
  profile: gdapAuthorizationProfileSummary,
  capabilities: [
    {
      key: 'appConsent',
      status: 'blocked',
      reason: 'Customer-tenant application consent could not be verified.',
    },
  ],
  customerTenantId: 'customer-tenant-123',
  appConsentStatus: 'blocked',
  relationship: gdapRelationshipLifecycle,
  message: 'Customer application consent is required.',
};

const invalidGdapDraftValidationResponseWithCredentialReference: AzureGdapDraftValidationResponse = {
  ...gdapDraftValidationResponse,
  // @ts-expect-error validation responses must not expose internal credential references.
  credentialReference: 'cloudaccounts/credentials/gdap/profile-token-cache.json',
};

const invalidGdapDraftValidationResponseWithRefreshToken: AzureGdapDraftValidationResponse = {
  ...gdapDraftValidationResponse,
  // @ts-expect-error validation responses must not expose delegated refresh tokens.
  refreshToken: 'refresh-token',
};

// @ts-expect-error a successful validation must include subscriptions, relationship lifecycle, consent state, and an expiring receipt.
const invalidReadyGdapDraftValidationResponseWithoutCreationProof: AzureGdapDraftValidationResponse = {
  valid: true,
  status: 'ready',
  profile: gdapAuthorizationProfileSummary,
  capabilities: [gdapCapabilityStatus],
};

const gdapCloudAccountStatusResponse: AzureGdapCloudAccountStatusResponse = {
  cloudAccountId: 'gdap-account-123',
  companyId: 'customer-company-123',
  status: 'degraded',
  partnerAuthorizationStatus: 'ready',
  appConsentStatus: 'ready',
  lastValidatedAt: '2026-06-11T00:00:00.000Z',
  lastValidationStatus: 'degraded',
  lastValidationErrorCode: 'cost_management_unavailable',
  lastValidationMessage: 'Cost Management read access is unavailable.',
  scheduledEligible: false,
  scheduledEligibilityReason: 'Manual validation required before scheduled scans are enabled.',
  capabilities: [gdapCapabilityStatus],
  relationship: gdapRelationshipLifecycle,
  subscriptions: [gdapSubscriptionOption],
};

const gdapCloudAccountCreateRequest: AzureGdapCloudAccountCreateRequest = {
  companyId: 'customer-company-123',
  name: 'GDAP Azure Account',
  provider: 'Azure',
  authMode: 'gdap',
  tenantId: 'customer-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapAccessAssignmentId: 'assignment-123',
  gdapSecurityGroupId: 'security-group-123',
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  subscriptionIds: ['subscription-a-123'],
  validationReceipt: 'opaque-customer-scoped-validation-receipt',
};

// @ts-expect-error GDAP creation must explicitly select subscriptions and present the validation receipt.
const invalidGdapCloudAccountCreateRequestWithoutSelection: AzureGdapCloudAccountCreateRequest = {
  companyId: 'customer-company-123',
  name: 'GDAP Azure Account',
  provider: 'Azure',
  authMode: 'gdap',
  tenantId: 'customer-tenant-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
};

const manualBillingExportConfigurationByStorageName: AzureBillingExportConfigurationInput = {
  sources: [
    {
      datasetType: 'actual',
      scopeType: 'billingAccount',
      scopePath: '/providers/Microsoft.Billing/billingAccounts/billing-account-123',
      exportName: 'Cortex-actual-cost',
      destination: {
        storageAccountName: 'eroadstaazurebilling',
        container: 'azurecostmanagement',
        rootFolderPath: 'eroad',
      },
    },
    {
      datasetType: 'amortized',
      scopeType: 'billingProfile',
      scopePath: '/providers/Microsoft.Billing/billingAccounts/billing-account-123/billingProfiles/profile-123',
      exportName: 'Cortex-amortized-cost',
      destination: {
        storageAccountName: 'eroadstaazurebilling',
        container: 'azurecostmanagement',
        rootFolderPath: 'eroad',
      },
    },
    {
      datasetType: 'actual',
      scopeType: 'subscription',
      scopePath: '/subscriptions/subscription-123',
      exportName: 'spotto-actual-daily',
      destination: {
        storageAccountName: 'billingexportstenant123',
        container: 'cost-exports',
        rootFolderPath: 'spotto/subscription-123',
      },
    },
  ],
};

const manualBillingExportConfigurationWithApiResolvedDestination: AzureBillingExportConfigurationInput = {
  sources: [
    {
      datasetType: 'actual',
      scopeType: 'managementGroup',
      scopePath: '/providers/Microsoft.Management/managementGroups/tenant-123',
      exportName: 'tenant-actual-daily',
    },
  ],
};

const manualBillingExportConfigurationByStorageResourceId: AzureBillingExportConfigurationInput = {
  sources: [
    {
      datasetType: 'amortized',
      scopeType: 'invoiceSection',
      scopePath: '/providers/Microsoft.Billing/billingAccounts/billing-account-123/billingProfiles/profile-123/invoiceSections/section-123',
      exportName: 'amortized-daily',
      destination: {
        storageAccountResourceId: '/subscriptions/sub-123/resourceGroups/billing-rg/providers/Microsoft.Storage/storageAccounts/billingexports',
        container: 'cost-exports',
        rootFolderPath: 'spotto',
      },
    },
  ],
};

const supportedManualBillingExportScopes: AzureBillingExportScopeType[] = [
  'subscription',
  'resourceGroup',
  'managementGroup',
  'billingAccount',
  'billingProfile',
  'invoiceSection',
  'department',
  'enrollmentAccount',
  'partnerCustomer',
];

const manualOnboardingImport: AzureManualOnboardingImportV1 = {
  schemaVersion: AZURE_MANUAL_ONBOARDING_IMPORT_SCHEMA_VERSION,
  kind: AZURE_MANUAL_ONBOARDING_IMPORT_KIND,
  credentials: {
    tenantId: 'tenant-123',
    clientId: 'client-123',
    clientSecret: 'generated-secret-value',
    clientSecretExpiresAt: '2027-08-30',
  },
  billingExports: manualBillingExportConfigurationByStorageName,
};

const manualOnboardingImportForReusedCredential: AzureManualOnboardingImportV1 = {
  schemaVersion: 1,
  kind: 'spotto.azure.manual-onboarding',
  credentials: {
    tenantId: 'tenant-123',
    clientId: 'client-123',
  },
  billingExports: manualBillingExportConfigurationWithApiResolvedDestination,
};

const invalidEmptyManualBillingExportConfiguration: AzureBillingExportConfigurationInput = {
  // @ts-expect-error At least one billing export source must be configured.
  sources: [],
};

const invalidLegacyManualBillingExportConfiguration: AzureBillingExportConfigurationInput = {
  // @ts-expect-error Manual onboarding uses the source collection, not the legacy persisted locator shape.
  actual: {
    scopeType: 'billingAccount',
    scopePath: '/providers/Microsoft.Billing/billingAccounts/billing-account-123',
    exportName: 'actual-daily',
  },
};

const invalidPartialManualBillingExportDestination: AzureBillingExportConfigurationInput = {
  sources: [
    {
      datasetType: 'actual',
      scopeType: 'billingAccount',
      scopePath: '/providers/Microsoft.Billing/billingAccounts/billing-account-123',
      exportName: 'actual-daily',
      // @ts-expect-error A supplied destination requires a storage identifier, container, and root folder.
      destination: {
        storageAccountName: 'billingexports',
        container: 'cost-exports',
      },
    },
  ],
};

const invalidManualBillingExportScope: AzureBillingExportConfigurationInput = {
  sources: [
    {
      datasetType: 'actual',
      // @ts-expect-error Tenant-root exports are represented explicitly as management-group scopes.
      scopeType: 'tenant',
      scopePath: '/providers/Microsoft.Management/managementGroups/tenant-123',
      exportName: 'tenant-actual-daily',
    },
  ],
};

const invalidManualBillingExportDataset: AzureBillingExportConfigurationInput = {
  sources: [
    {
      // @ts-expect-error The ingestion contract currently supports only Actual and Amortized datasets.
      datasetType: 'usage',
      scopeType: 'subscription',
      scopePath: '/subscriptions/subscription-123',
      exportName: 'usage-daily',
    },
  ],
};

const legacyCloudAccountBillingExportLocator: CloudAccountBillingExportLocatorConfiguration = {
  actual: {
    scopeType: 'billingAccount',
    scopePath: '/providers/Microsoft.Billing/billingAccounts/billing-account-123',
    exportName: 'Cortex-actual-cost',
    storageAccountName: 'eroadstaazurebilling',
    container: 'azurecostmanagement',
    rootFolderPath: 'eroad',
  },
};

const versionedCloudAccountBillingExportLocator: CloudAccountBillingExportLocatorConfiguration = {
  schemaVersion: CLOUD_ACCOUNT_BILLING_EXPORT_LOCATOR_SCHEMA_VERSION,
  sources: [
    {
      datasetType: 'actual',
      scopeType: 'billingProfile',
      scopePath: '/providers/Microsoft.Billing/billingAccounts/billing-account-123/billingProfiles/profile-123',
      exportName: 'Cortex-actual-cost',
      storageAccountName: 'eroadstaazurebilling',
      container: 'azurecostmanagement',
      rootFolderPath: 'eroad',
    },
    {
      datasetType: 'actual',
      scopeType: 'subscription',
      scopePath: '/subscriptions/subscription-123',
      exportName: 'spotto-actual-daily',
      storageAccountName: 'billingexportstenant123',
      container: 'cost-exports',
      rootFolderPath: 'spotto/subscription-123',
    },
  ],
};

const invalidEmptyVersionedCloudAccountBillingExportLocator: CloudAccountBillingExportLocatorConfiguration = {
  schemaVersion: CLOUD_ACCOUNT_BILLING_EXPORT_LOCATOR_SCHEMA_VERSION,
  // @ts-expect-error A versioned persisted locator must contain at least one source.
  sources: [],
};

const invalidVersionedCloudAccountBillingExportLocatorSchema: CloudAccountBillingExportLocatorConfiguration = {
  // @ts-expect-error Persisted locator schema versions are exact discriminants.
  schemaVersion: 2,
  sources: versionedCloudAccountBillingExportLocator.sources,
};

const invalidManualOnboardingImportVersion: AzureManualOnboardingImportV1 = {
  // @ts-expect-error Unsupported bundle schema versions must not compile as V1.
  schemaVersion: 2,
  kind: AZURE_MANUAL_ONBOARDING_IMPORT_KIND,
  credentials: {
    tenantId: 'tenant-123',
    clientId: 'client-123',
  },
};

const publicCloudAccountDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'delegated-account-123',
  name: 'Delegated Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  authMode: 'delegatedUser',
  tenantId: 'tenant-123',
  createdAt: new Date('2026-03-29T00:00:00.000Z'),
  updatedAt: new Date('2026-03-29T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  onboardingStatus: 'active',
  scanSchedulingMode: 'onDemandOnly',
  guestAccessStatus: 'completed',
  guestAccessStatusReason: 'billing_2m_failed',
  guestAccessRunId: 'guest-run-123',
  guestAccessLastSuccessfulScanAt: '2026-06-16T08:30:00.000Z',
  connectedUserEmail: 'owner@example.com',
  secretPreview: 'abc*****',
  writeSecretPreview: 'xyz*****',
  billingExportConfigurationStatus: {
    configured: true,
    actualConfigured: true,
    amortizedConfigured: true,
    destinationProvided: true,
    verificationStatus: 'verified',
  },
  syncFeatureOptOuts: ['billing'],
};

const invalidPublicCloudAccountBillingExportLocatorDto: PublicCloudAccountDto = {
  ...publicCloudAccountDto,
  // @ts-expect-error Raw billing export locator coordinates remain internal.
  billingExportLocator: manualBillingExportConfigurationByStorageResourceId,
};

const publicAwsCloudAccountDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'aws-account-123',
  name: 'Production AWS',
  companyName: 'Spotto',
  provider: 'AWS',
  authMode: 'crossAccountRole',
  accountId: '123456789012',
  awsEstateId: 'estate-example',
  roleArn: 'arn:aws:iam::123456789012:role/ExampleReadOnlyRole',
  awsRolePurposes: ['resource-discovery'],
  status: 'pending',
  statusMessage: 'AWS onboarding request accepted.',
  createdAt: new Date('2026-07-15T00:00:00.000Z'),
  updatedAt: new Date('2026-07-15T00:00:00.000Z'),
  createdBy: 'user-123',
};

const invalidPublicAwsCloudAccountExternalIdDto: PublicCloudAccountDto = {
  ...publicAwsCloudAccountDto,
  // @ts-expect-error AWS external IDs are setup-only and must not appear in public DTOs.
  externalId: 'customer-secret-external-id',
};

const invalidPublicAwsCloudAccountCredentialsDto: PublicCloudAccountDto = {
  ...publicAwsCloudAccountDto,
  // @ts-expect-error Resolved AWS credentials must not appear in public DTOs.
  credentials: { accessKeyId: 'AKIAEXAMPLE', secretAccessKey: 'raw-secret' },
};

const invalidPublicAwsCloudAccountCredentialReferenceDto: PublicCloudAccountDto = {
  ...publicAwsCloudAccountDto,
  // @ts-expect-error Internal AWS credential locators must not appear in public DTOs.
  credentialReference: 'cloudaccounts/credentials/example',
};

const azureSyncFeatureId: AzureSyncFeatureId = 'activityMonitoring';

// @ts-expect-error resource inventory is always enabled and cannot be configured as an opt-out.
const invalidAzureSyncFeatureId: AzureSyncFeatureId = 'resourceInventory';

const azureSyncFeatureOrderShapeCheck: readonly AzureSyncFeatureId[] = AZURE_SYNC_FEATURE_ORDER;
const azureCloudAccountSyncFeatureId: AzureCloudAccountSyncFeatureId = 'availabilityZones';
const azureSubscriptionSyncFeatureId: AzureSubscriptionSyncFeatureId = 'activityMonitoring';

// @ts-expect-error availability zones are cloud-account scoped and cannot be configured directly on a subscription.
const invalidAzureSubscriptionSyncFeatureId: AzureSubscriptionSyncFeatureId = 'availabilityZones';

const azureSyncFeatureMetadataShapeCheck = AZURE_SYNC_FEATURE_METADATA.map(item => ({
  id: item.id,
  displayName: item.displayName,
  description: item.description,
  supportedScopes: item.supportedScopes,
  warning: 'warning' in item ? item.warning : undefined,
}));

const azureSyncFeatureHelperShapeCheck: {
  isKnown: boolean;
  availabilityZonesCloudAccountOnly: boolean;
  subscriptionOptions: readonly { id: AzureSyncFeatureId }[];
  subscriptionOptionIds: AzureSyncFeatureId[];
  metadata: { id: AzureSyncFeatureId };
  sorted: AzureSyncFeatureId[];
} = {
  isKnown: isAzureSyncFeatureId('activityMonitoring'),
  availabilityZonesCloudAccountOnly:
    isAzureSyncFeatureSupportedInScope('availabilityZones', 'cloudAccount') &&
    !isAzureSyncFeatureSupportedInScope('availabilityZones', 'subscription'),
  subscriptionOptions: getAzureSyncFeatureOptions('subscription'),
  subscriptionOptionIds: getAzureSyncFeatureIdsForScope('subscription'),
  metadata: getAzureSyncFeatureMetadata('billing'),
  sorted: sortAzureSyncFeatureIds(['pricing', 'activityMonitoring']),
};

const cloudAccountSyncFeatureOptOutsUpdateRequest: CloudAccountSyncFeatureOptOutsUpdateRequest = {
  syncFeatureOptOuts: ['activityMonitoring', 'commitments', 'availabilityZones'],
};

const subscriptionSyncFeatureOptOutsUpdateRequest: SubscriptionSyncFeatureOptOutsUpdateRequest = {
  syncFeatureOptOuts: ['activityMonitoring', 'relationshipGraphs'],
};

const invalidSubscriptionSyncFeatureOptOutsUpdateRequest: SubscriptionSyncFeatureOptOutsUpdateRequest = {
  // @ts-expect-error availabilityZones is not configurable at subscription scope.
  syncFeatureOptOuts: ['availabilityZones'],
};

const invalidCloudAccountSyncFeatureOptOutsUpdateRequest: CloudAccountSyncFeatureOptOutsUpdateRequest = {
  // @ts-expect-error resourceInventory is not part of AzureSyncFeatureId.
  syncFeatureOptOuts: ['resourceInventory'],
};

const subscriptionInfoBaseWithSyncFeatureOptOuts: SubscriptionInfoBase = {
  name: 'Production Subscription',
  cloudAccountId: 'tenant-client-id-123',
  cloudAccountName: 'Production Azure Tenant',
  hostname: 'worker-host:1.0.0',
  syncFeatureOptOuts: ['activityMonitoring'],
};

const subscriptionAccountWithSyncFeatureOptOuts: SubscriptionAccount = {
  ...subscriptionInfoBaseWithSyncFeatureOptOuts,
  id: 'sub-123',
  companyId: 'comp-123',
};

const availableZeroSecureScoreEvidence: SecureScoreEvidence = {
  status: 'available',
  percentage: 0,
  currentScore: 0,
  maxScore: 100,
  weight: 1,
  observedAt: '2026-08-10T00:00:00.000Z',
};

const subscriptionAccountWithSecureScoreEvidence: SubscriptionAccount = {
  ...subscriptionAccountWithSyncFeatureOptOuts,
  secureScore: 0,
  secureScoreEvidence: availableZeroSecureScoreEvidence,
};

const cloudAccountWithAzureSpSetupReadiness: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  azureSpSetupProvisioningStatus: 'partial',
  azureSpSetupActiveSetupId: 'setup-123',
  azureSpSetupActiveExecutionId: 'execution-123',
  azureSpSetupReadinessVersion: 'readiness-7',
  azureSpSetupActiveRepairSetupId: 'repair-setup-123',
  azureSpSetupActiveRepairExecutionId: 'repair-execution-123',
  azureSpSetupActiveRepairPhase: 'retrying',
  azureSpSetupLastRepairResult: 'partial',
  azureSpSetupLastRepairAttemptedAt: '2026-08-09T00:00:00.000Z',
  azureSpSetupPermissionManifestVersion: 'azure-sp-setup-2026-08-09',
  azureSpSetupLastResult: 'partial',
  azureSpSetupLastAttemptedAt: '2026-08-09T00:00:00.000Z',
  azureSpSetupSummaryJson: '{"schemaVersion":1}',
};

const subscriptionWithAzureSpSetupReadiness: SubscriptionInfoBase = {
  ...subscriptionInfoBaseWithSyncFeatureOptOuts,
  azureSpSetupReaderReadiness: 'granted',
  azureSpSetupReadinessSetupId: 'setup-123',
  azureSpSetupReadinessExecutionId: 'execution-123',
  azureSpSetupReadinessVerifiedAt: '2026-08-09T00:10:00.000Z',
};

const subscriptionNeedingAzureSpSetupRepair: SubscriptionInfoBase = {
  ...subscriptionInfoBaseWithSyncFeatureOptOuts,
  azureSpSetupReaderReadiness: 'failed',
  azureSpSetupReadinessErrorCode: 'subscription_reader_assignment_failed',
};

const companySubscriptionWithSyncFeatureOptOuts: CompanySubscription = {
  ...subscriptionInfoBaseWithSyncFeatureOptOuts,
  id: 'sub-123',
  companyId: 'comp-123',
};

const companySubscriptionWithSecureScoreEvidence: CompanySubscription = {
  ...companySubscriptionWithSyncFeatureOptOuts,
  secureScore: 0,
  secureScoreEvidence: availableZeroSecureScoreEvidence,
};

const publicGdapCloudAccountDto: PublicCloudAccountDto = {
  ...publicCloudAccountDto,
  id: 'gdap-account-123',
  name: 'GDAP Azure Account',
  authMode: 'gdap',
  tenantId: 'customer-tenant-123',
  onboardingStatus: undefined,
  connectedUserEmail: undefined,
  gdapPartnerTenantId: 'partner-tenant-123',
  gdapAuthorizationCompanyId: 'root-msp-123',
  gdapAuthorizationProfileId: 'gdapauth-profile-123',
  gdapCustomerTenantId: 'customer-tenant-123',
  gdapRelationshipId: 'relationship-123',
  gdapRelationshipStatus: 'active',
  gdapAccessAssignmentId: 'assignment-123',
  gdapAccessAssignmentStatus: 'active',
  gdapPartnerAuthorizationStatus: 'ready',
  gdapAppConsentStatus: 'ready',
  gdapLastValidatedAt: '2026-06-11T00:00:00.000Z',
  gdapLastValidationStatus: 'degraded',
  gdapLastValidationErrorCode: 'cost_management_unavailable',
  gdapLastValidationMessage: 'Cost Management read access is unavailable.',
  gdapScheduledEligible: false,
  gdapScheduledEligibilityReason: 'Manual validation required before scheduled scans are enabled.',
  gdapCapabilities: [gdapCapabilityStatus],
};

const invalidPublicCloudAccountTokenCacheDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-123',
  name: 'Public Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose token cache data.
  delegatedTokenCache: 'internal-token-cache',
};

const invalidPublicCloudAccountTokenRelayPayloadDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-token-relay-123',
  name: 'Public Azure Account With Token Relay',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-06-16T00:00:00.000Z'),
  updatedAt: new Date('2026-06-16T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose guest access token relay payloads.
  guestAccessTokenRelayPayload: 'encrypted-or-raw-token-relay-payload',
};

const invalidPublicCloudAccountTokenRelayReferenceDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-token-relay-ref-123',
  name: 'Public Azure Account With Token Relay Reference',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-06-16T00:00:00.000Z'),
  updatedAt: new Date('2026-06-16T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose token relay storage locators.
  guestAccessTokenRelayReference: 'cloudaccounts/guest-access/token-relay/run.json',
};

const invalidPublicCloudAccountSecretDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-secret-123',
  name: 'Public Azure Account With Secret',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose read secrets.
  secret: 'service-principal-secret',
};

const invalidPublicCloudAccountWriteSecretDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-account-write-secret-123',
  name: 'Public Azure Account With Write Secret',
  companyName: 'Spotto',
  provider: 'Azure',
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose write secrets.
  writeSecret: 'write-service-principal-secret',
};

const invalidPublicCloudAccountGdapCredentialReferenceDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-gdap-account-123',
  name: 'Public GDAP Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  authMode: 'gdap',
  createdAt: new Date('2026-06-11T00:00:00.000Z'),
  updatedAt: new Date('2026-06-11T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose GDAP credential references.
  gdapCredentialReference: 'internal-gdap-credential-reference',
};

const invalidPublicCloudAccountPartnerBillingScopeDto: PublicCloudAccountDto = {
  companyId: 'comp-123',
  id: 'public-gdap-billing-account-123',
  name: 'Public GDAP Azure Account',
  companyName: 'Spotto',
  provider: 'Azure',
  authMode: 'gdap',
  createdAt: new Date('2026-07-30T00:00:00.000Z'),
  updatedAt: new Date('2026-07-30T00:00:00.000Z'),
  createdBy: 'user-123',
  status: 'Active',
  // @ts-expect-error public cloud-account DTOs must not expose partner billing scope identifiers.
  cspPartnerBillingScope: {
    billingAccountId: 'billing-account-123',
    customerId: 'customer-123',
    scopePath: '/providers/Microsoft.Billing/billingAccounts/billing-account-123/customers/customer-123',
    validatedAt: '2026-07-30T00:00:00.000Z',
  },
};

const cloudAccountWithTenantSyncState: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-789',
  tenantSyncStatus: 'Requested',
  tenantSyncRequestedAt: new Date('2026-04-02T00:00:00.000Z'),
  tenantSyncSource: 'manual',
};

const partialDataSyncProgressIssue: SyncProgressIssue = {
  type: 'partialData',
  scope: 'component',
  title: 'Log Analytics table coverage is partial',
  message: 'Cost-only analysis completed, but table-level recommendations and metrics are incomplete.',
  degraded: true,
  metadata: {
    reason: 'topTablesAccessDenied',
    affectedWorkspaceCount: 2,
    retryable: false,
    error: undefined,
  },
};

const cloudAccountWithFirstSyncNotification: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  id: 'tenant-client-id-first-sync',
  firstSyncNotificationStatus: 'Pending',
  firstSyncNotificationUserId: 'user-123',
};

const firstSyncNotificationStatus: CloudAccountFirstSyncNotificationStatus = 'Sending';

void cloudAccountWithRecommendationEffortProfile;
void cloudAccountWithoutRecommendationEffortProfile;
void servicePrincipalAccountWithoutAuthMode;
void delegatedCloudAccount;
void delegatedAuthMode;
void gdapAuthMode;
void awsCrossAccountRoleAuthMode;
void delegatedAuthErrorCode;
void cloudAccountScanSchedulingMode;
void guestAccessScanSchedulingMode;
void guestAccessStatus;
void guestAccessStatusReason;
void invalidGuestAccessScanSchedulingMode;
void gdapValidationStatus;
void gdapCapabilityStatus;
void gdapCloudAccountMetadata;
void gdapCloudAccount;
void gdapAuthorizationProfileSummary;
void invalidGdapAuthorizationProfileSummaryWithCredentialReference;
void gdapAuthorizationProfileListResponse;
void gdapEligibleAuthorizationProfilesResponse;
void gdapCreateAuthorizationProfileRequest;
void gdapStartPartnerAuthorizationRequest;
void gdapPartnerAuthorizationStartResponse;
void gdapRelationshipLifecycle;
void gdapSubscriptionOption;
void gdapDraftValidationRequest;
void gdapDraftValidationResponse;
void blockedGdapDraftValidationResponse;
void invalidGdapDraftValidationResponseWithCredentialReference;
void invalidGdapDraftValidationResponseWithRefreshToken;
void invalidReadyGdapDraftValidationResponseWithoutCreationProof;
void gdapCloudAccountStatusResponse;
void gdapCloudAccountCreateRequest;
void invalidGdapCloudAccountCreateRequestWithoutSelection;
void publicCloudAccountDto;
void publicAwsCloudAccountDto;
void invalidPublicAwsCloudAccountExternalIdDto;
void invalidPublicAwsCloudAccountCredentialsDto;
void invalidPublicAwsCloudAccountCredentialReferenceDto;
void azureSyncFeatureId;
void invalidAzureSyncFeatureId;
void azureSyncFeatureOrderShapeCheck;
void azureCloudAccountSyncFeatureId;
void azureSubscriptionSyncFeatureId;
void invalidAzureSubscriptionSyncFeatureId;
void azureSyncFeatureMetadataShapeCheck;
void azureSyncFeatureHelperShapeCheck;
void cloudAccountSyncFeatureOptOutsUpdateRequest;
void subscriptionSyncFeatureOptOutsUpdateRequest;
void invalidSubscriptionSyncFeatureOptOutsUpdateRequest;
void invalidCloudAccountSyncFeatureOptOutsUpdateRequest;
void subscriptionInfoBaseWithSyncFeatureOptOuts;
void subscriptionAccountWithSyncFeatureOptOuts;
void subscriptionAccountWithSecureScoreEvidence;
void cloudAccountWithAzureSpSetupReadiness;
void subscriptionWithAzureSpSetupReadiness;
void subscriptionNeedingAzureSpSetupRepair;
void companySubscriptionWithSyncFeatureOptOuts;
void companySubscriptionWithSecureScoreEvidence;
void publicGdapCloudAccountDto;
void invalidPublicCloudAccountTokenCacheDto;
void invalidPublicCloudAccountTokenRelayPayloadDto;
void invalidPublicCloudAccountTokenRelayReferenceDto;
void invalidPublicCloudAccountSecretDto;
void invalidPublicCloudAccountWriteSecretDto;
void invalidPublicCloudAccountGdapCredentialReferenceDto;
void cloudAccountWithTenantSyncState;
void cloudAccountWithFirstSyncNotification;
void partialDataSyncProgressIssue;
void firstSyncNotificationStatus;

const combinedSubscriptionReadPermission = SubscriptionReadPermission.MonitoringReader | SubscriptionReadPermission.LogAnalyticsDataReader;

const combinedCloudAccountReadPermission =
  CloudAccountReadPermission.ReservationsReader |
  CloudAccountReadPermission.SavingsPlanReader |
  CloudAccountReadPermission.GraphApplicationReadAll |
  CloudAccountReadPermission.GraphRoleAssignmentScheduleReadDirectory |
  CloudAccountReadPermission.GraphRoleEligibilityScheduleReadDirectory |
  CloudAccountReadPermission.GraphRoleManagementReadDirectory |
  CloudAccountReadPermission.GraphGroupMemberReadAll |
  CloudAccountReadPermission.GraphUserReadAll |
  CloudAccountReadPermission.GraphAuditLogReadAll;

const subscriptionReadPermissionMetadataShapeCheck = SUBSCRIPTION_READ_PERMISSIONS_METADATA.map(item => ({
  id: item.id,
  displayName: item.displayName,
  requiredRoles: item.requiredRoles,
}));

const cloudAccountReadPermissionMetadataShapeCheck = CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA.map(item => ({
  id: item.id,
  displayName: item.displayName,
  requiredRoles: item.requiredRoles,
}));

const graphCloudAccountReadPermissionMetadataShapeCheck = CLOUD_ACCOUNT_READ_PERMISSIONS_METADATA.filter(item =>
  item.requiredRoles.some(role => role.includes('.'))
).map(item => ({
  id: item.id,
  requiredRoles: item.requiredRoles,
}));

const invalidCloudAccountRecommendationEffortProfile: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  // @ts-expect-error recommendation effort profile must use the recommendation profile-name union.
  effortProfile: 'manual',
};

const invalidFirstSyncNotificationStatus: CloudAccount = {
  ...cloudAccountWithRecommendationEffortProfile,
  // @ts-expect-error first sync notification status must use the supported status union.
  firstSyncNotificationStatus: 'Queued',
};

const tenantSyncRequestMessage: CloudAccountTenantSyncRequestMessage = {
  entity: 'cloudaccount',
  action: 'tenant-sync',
  companyId: 'comp-123',
  cloudAccountId: 'tenant-client-id-123',
  tenantId: 'tenant-123',
  clientId: 'tenant-client-id-123',
  source: 'manual',
};

// @ts-expect-error CloudAccountTenantSyncRequestMessage.source is required.
const invalidTenantSyncRequestMessage: CloudAccountTenantSyncRequestMessage = {
  entity: 'cloudaccount',
  action: 'tenant-sync',
  companyId: 'comp-123',
  cloudAccountId: 'tenant-client-id-123',
  tenantId: 'tenant-123',
  clientId: 'tenant-client-id-123',
};

void invalidCloudAccountRecommendationEffortProfile;
void invalidFirstSyncNotificationStatus;
void tenantSyncRequestMessage;
void invalidTenantSyncRequestMessage;
void combinedSubscriptionReadPermission;
void combinedCloudAccountReadPermission;
void subscriptionReadPermissionMetadataShapeCheck;
void cloudAccountReadPermissionMetadataShapeCheck;
void graphCloudAccountReadPermissionMetadataShapeCheck;
