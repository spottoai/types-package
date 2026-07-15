import { SurveyResponse } from '../company';
import type { EffortEstimateProfileName } from '../azure/recommendations';
export type SubscriptionType = 'Production' | 'Non-Production' | 'Mixed';
export type CloudAccountAuthMode = 'servicePrincipal' | 'delegatedUser' | 'gdap';
export type CloudAccountTenantSyncSource = 'manual' | 'scheduled' | 'onboarding';
export type CloudAccountTenantSyncStatus = 'Idle' | 'Requested' | 'Processing' | 'Completed' | 'Error';
export type CloudAccountFirstSyncNotificationStatus = 'Pending' | 'Sending' | 'Sent' | 'Error';
export type BillingExportLocatorScopeType = 'tenant' | 'billingAccount';
export type AzureGdapRelationshipStatus = 'unknown' | 'created' | 'approvalPending' | 'active' | 'terminated' | 'expired';
export type AzureGdapAccessAssignmentStatus = 'unknown' | 'pending' | 'active' | 'deleting' | 'deleted' | 'error';
export type AzureGdapValidationStatus = 'notValidated' | 'ready' | 'degraded' | 'blocked' | 'expired' | 'reauthRequired';
export type AzureGdapCapabilityKey = 'partnerAuthorization' | 'relationship' | 'accessAssignment' | 'appConsent' | 'subscriptionDiscovery' | 'resourceInventory' | 'resourceGraph' | 'costRead' | 'billingExportSetup' | 'monitoringRead' | 'graphInventory' | 'scheduledScan';
export type AzureGdapCapabilityStatusValue = 'ready' | 'degraded' | 'blocked' | 'unsupported' | 'notChecked';
export interface AzureGdapCapabilityStatus {
    key: AzureGdapCapabilityKey;
    status: AzureGdapCapabilityStatusValue;
    reason?: string;
    checkedAt?: string;
    requiredRoles?: string[];
    requiredAzureRoles?: string[];
}
export interface AzureGdapRoleAssignment {
    roleId?: string;
    roleTemplateId?: string;
    displayName: string;
}
export interface AzureGdapCloudAccountMetadata {
    gdapAuthorizationCompanyId?: string;
    gdapAuthorizationProfileId?: string;
    gdapPartnerTenantId: string;
    gdapCustomerTenantId: string;
    gdapRelationshipId: string;
    gdapRelationshipDisplayName?: string;
    gdapRelationshipStatus?: AzureGdapRelationshipStatus;
    gdapAccessAssignmentId?: string;
    gdapAccessAssignmentStatus?: AzureGdapAccessAssignmentStatus;
    gdapSecurityGroupId?: string;
    gdapSecurityGroupDisplayName?: string;
    gdapRoles?: AzureGdapRoleAssignment[];
    gdapExpiresAt?: string;
    gdapAutoExtendEnabled?: boolean;
    gdapPartnerAuthorizationStatus?: AzureGdapValidationStatus;
    gdapAppConsentStatus?: AzureGdapValidationStatus;
    gdapLastValidatedAt?: string;
    gdapLastValidationStatus?: AzureGdapValidationStatus;
    gdapLastValidationErrorCode?: string;
    gdapLastValidationMessage?: string;
    gdapScheduledEligible?: boolean;
    gdapScheduledEligibilityReason?: string;
    gdapCapabilities?: AzureGdapCapabilityStatus[];
}
export interface AzureCloudAccountAuthContext {
    authMode?: CloudAccountAuthMode;
    cloudAccountId: string;
    gdapAuthorizationCompanyId?: string;
    gdapAuthorizationProfileId?: string;
    customerTenantId?: string;
    authorityTenantId?: string;
    partnerTenantId?: string;
    principalClientId?: string;
    credentialReference?: string;
}
export interface AzureGdapAuthorizationProfileSummary {
    id: string;
    companyId: string;
    displayName: string;
    partnerTenantId: string;
    authorizationStatus: AzureGdapValidationStatus;
    hasCredential: boolean;
    authorizedAt?: string;
    expiresAt?: string;
    lastValidatedAt?: string;
    lastValidationStatus?: AzureGdapValidationStatus;
    lastValidationErrorCode?: string;
    lastValidationMessage?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface AzureGdapAuthorizationProfileListResponse {
    profiles: AzureGdapAuthorizationProfileSummary[];
}
export interface AzureGdapEligibleAuthorizationProfilesResponse {
    rootCompanyId: string;
    profiles: AzureGdapAuthorizationProfileSummary[];
}
export interface AzureGdapCreateAuthorizationProfileRequest {
    displayName?: string;
    partnerTenantId?: string;
}
export interface AzureGdapStartPartnerAuthorizationRequest {
    redirectAfter?: string;
}
export interface AzureGdapPartnerAuthorizationStartResponse {
    profileId: string;
    authorizationUrl: string;
    expiresAt: string;
}
export interface AzureGdapDraftValidationRequest {
    gdapAuthorizationCompanyId?: string;
    gdapAuthorizationProfileId?: string;
    gdapPartnerTenantId?: string;
    gdapCustomerTenantId?: string;
    tenantId?: string;
    gdapRelationshipId?: string;
    gdapAccessAssignmentId?: string;
    gdapSecurityGroupId?: string;
}
export interface AzureGdapDraftValidationResponse {
    valid: boolean;
    status: AzureGdapValidationStatus;
    profile?: AzureGdapAuthorizationProfileSummary;
    capabilities: AzureGdapCapabilityStatus[];
    message?: string;
}
export interface AzureGdapCloudAccountStatusResponse {
    cloudAccountId: string;
    companyId: string;
    status: AzureGdapValidationStatus;
    partnerAuthorizationStatus?: AzureGdapValidationStatus;
    appConsentStatus?: AzureGdapValidationStatus;
    lastValidatedAt?: string | Date;
    lastValidationStatus?: AzureGdapValidationStatus;
    lastValidationErrorCode?: string;
    lastValidationMessage?: string;
    scheduledEligible?: boolean;
    scheduledEligibilityReason?: string;
    capabilities?: AzureGdapCapabilityStatus[];
}
export interface AzureGdapCloudAccountCreateRequest {
    companyId: string;
    name: string;
    provider: 'Azure';
    authMode: 'gdap';
    tenantId: string;
    gdapCustomerTenantId: string;
    gdapPartnerTenantId: string;
    gdapRelationshipId: string;
    gdapAccessAssignmentId?: string;
    gdapSecurityGroupId?: string;
    gdapAuthorizationCompanyId: string;
    gdapAuthorizationProfileId: string;
}
export interface BillingExportLocatorEntry {
    scopeType: BillingExportLocatorScopeType;
    scopePath: string;
    exportName: string;
    storageAccountName: string;
    container: string;
    rootFolderPath: string;
}
export interface CloudAccountBillingExportLocator {
    actual?: BillingExportLocatorEntry;
    amortized?: BillingExportLocatorEntry;
}
export declare const AZURE_SYNC_FEATURE_ORDER: readonly ["activityMonitoring", "metrics", "billing", "pricing", "costEstimation", "commitments", "relationshipGraphs", "governance", "availabilityZones", "reliability", "perimeterInsights", "reportEvidencePack"];
export type AzureSyncFeatureId = (typeof AZURE_SYNC_FEATURE_ORDER)[number];
export type AzureSyncFeatureConfigurationScope = 'cloudAccount' | 'subscription';
export interface AzureSyncFeatureMetadata {
    id: AzureSyncFeatureId;
    displayName: string;
    description: string;
    supportedScopes: readonly AzureSyncFeatureConfigurationScope[];
    warning?: string;
}
export declare const AZURE_SYNC_FEATURE_METADATA: readonly [{
    readonly id: "activityMonitoring";
    readonly displayName: "Activity monitoring";
    readonly description: "Collects Azure activity logs and activity-derived operational events.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
    readonly warning: "Disabling activity monitoring prevents activity log collection and related detections.";
}, {
    readonly id: "metrics";
    readonly displayName: "Metrics";
    readonly description: "Collects subscription resource metrics used for utilization and rightsizing insights.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "billing";
    readonly displayName: "Billing";
    readonly description: "Collects billing and cost usage data.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "pricing";
    readonly displayName: "Pricing";
    readonly description: "Collects Azure price data used for cost calculations.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "costEstimation";
    readonly displayName: "Cost estimation";
    readonly description: "Builds estimated costs when billing-backed usage is unavailable or incomplete.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "commitments";
    readonly displayName: "Reservations and commitments";
    readonly description: "Collects reserved instances, savings plans, and commitment utilization data.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "relationshipGraphs";
    readonly displayName: "Relationship graphs";
    readonly description: "Builds relationship graph artifacts from scanned Azure resources.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "governance";
    readonly displayName: "Governance";
    readonly description: "Builds tenant and subscription governance reports and graph artifacts.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "availabilityZones";
    readonly displayName: "Availability zones";
    readonly description: "Collects tenant-level availability zone mappings.";
    readonly supportedScopes: readonly ["cloudAccount"];
}, {
    readonly id: "reliability";
    readonly displayName: "Reliability";
    readonly description: "Collects reliability signals and recommendations for subscription resources.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "perimeterInsights";
    readonly displayName: "Perimeter insights";
    readonly description: "Builds public IP and perimeter exposure insights.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}, {
    readonly id: "reportEvidencePack";
    readonly displayName: "Report evidence pack";
    readonly description: "Builds evidence artifacts used by reports and review workflows.";
    readonly supportedScopes: readonly ["cloudAccount", "subscription"];
}];
type AzureSyncFeatureMetadataEntry = (typeof AZURE_SYNC_FEATURE_METADATA)[number];
type AzureSyncFeatureIdsForScope<Scope extends AzureSyncFeatureConfigurationScope> = AzureSyncFeatureMetadataEntry extends infer Feature ? Feature extends {
    id: AzureSyncFeatureId;
    supportedScopes: readonly AzureSyncFeatureConfigurationScope[];
} ? Scope extends Feature['supportedScopes'][number] ? Feature['id'] : never : never : never;
export type AzureCloudAccountSyncFeatureId = AzureSyncFeatureIdsForScope<'cloudAccount'>;
export type AzureSubscriptionSyncFeatureId = AzureSyncFeatureIdsForScope<'subscription'>;
export declare const isAzureSyncFeatureId: (value: string) => value is AzureSyncFeatureId;
export declare const getAzureSyncFeatureMetadata: (featureId: AzureSyncFeatureId) => AzureSyncFeatureMetadata;
export declare const isAzureSyncFeatureSupportedInScope: (featureId: AzureSyncFeatureId, scope: AzureSyncFeatureConfigurationScope) => boolean;
export declare const sortAzureSyncFeatureIds: (featureIds: readonly AzureSyncFeatureId[]) => AzureSyncFeatureId[];
export declare const getAzureSyncFeatureOptions: (scope: AzureSyncFeatureConfigurationScope) => AzureSyncFeatureMetadata[];
export declare const getAzureSyncFeatureIdsForScope: (scope: AzureSyncFeatureConfigurationScope) => AzureSyncFeatureId[];
export interface CloudAccountSyncFeatureOptOutsUpdateRequest {
    syncFeatureOptOuts: AzureCloudAccountSyncFeatureId[];
}
export interface SubscriptionSyncFeatureOptOutsUpdateRequest {
    syncFeatureOptOuts: AzureSubscriptionSyncFeatureId[];
}
export declare const SUBSCRIPTION_SYNC_STEP_ORDER: readonly ["metrics", "resourcegroups", "activities", "queries", "reliability", "billing", "costestimation", "pricing", "commitments", "views"];
export type SubscriptionSyncStepId = (typeof SUBSCRIPTION_SYNC_STEP_ORDER)[number];
export type AzureDelegatedOnboardingStatus = 'subscriptionSelectionRequired' | 'active' | 'setupExpired';
export type AzureDelegatedAuthErrorCode = 'invalid_grant' | 'interaction_required' | 'consent_required' | 'claims_challenge' | 'forbidden' | 'unknown';
export type AzureDelegatedOAuthStatePhase = 'discoverTenants' | 'tenantSelectionRequired' | 'tenantConsent' | 'completed' | 'failed';
export type CloudAccountScanSchedulingMode = 'every12Hours' | 'daily' | 'weekly' | 'onDemandOnly';
export type AzureGuestAccessScanSchedulingMode = 'onDemandOnly';
export type AzureGuestAccessStatus = 'created' | 'deviceCodePending' | 'tenantDiscoveryRequired' | 'tenantSelectionRequired' | 'tenantAuthorizationRequired' | 'subscriptionSelectionRequired' | 'queued' | 'scanning' | 'completed' | 'partial' | 'failed' | 'reauthRequired' | 'cancelled' | 'expired';
export type AzureGuestAccessStatusReason = 'device_code_expired' | 'tenant_discovery_failed' | 'tenant_selection_required' | 'tenant_authorization_required' | 'microsoft_account_mismatch' | 'no_readable_subscriptions' | 'subscription_read_forbidden' | 'token_relay_missing' | 'setup_expired' | 'stale_message' | 'refresh_token_expired' | 'token_refresh_failed' | 'refresh_requires_interaction' | 'resource_inventory_failed' | 'resource_graph_failed' | 'billing_2m_failed' | 'scan_failed' | 'cancelled_by_user' | 'unknown';
export interface AzureGuestAccessCloudAccountFields {
    /** Public-safe guest access lifecycle status. Token relay payloads are never stored in this field. */
    guestAccessStatus?: AzureGuestAccessStatus;
    /** Public-safe reason for the current guest access lifecycle state. */
    guestAccessStatusReason?: AzureGuestAccessStatusReason;
    /** Current guest access run correlation ID. This is not a token relay storage locator. */
    guestAccessRunId?: string;
    /** Previous guest access run correlation ID. This is not a token relay storage locator. */
    guestAccessLastRunId?: string;
    /** Timestamp for when the current guest access run was queued. */
    guestAccessQueuedAt?: Date | string;
    /** Timestamp for when the current guest access scan started. */
    guestAccessScanStartedAt?: Date | string;
    /** Timestamp for when the current guest access scan completed. */
    guestAccessScanCompletedAt?: Date | string;
    /** Timestamp for the last completed guest access scan with usable results. */
    guestAccessLastSuccessfulScanAt?: Date | string;
}
export interface CloudAccount extends AzureGuestAccessCloudAccountFields {
    /** Partition Key */
    companyId: string;
    /** Row Key (Azure Client ID, AWS Access Key ID) */
    id: string;
    name: string;
    companyName: string;
    /** AWS, Azure, GCP, etc. */
    provider: string;
    /** Missing authMode should be treated as servicePrincipal by consumers for backward compatibility. */
    authMode?: CloudAccountAuthMode;
    /** Optional list of subscription group names for this cloud account */
    groupNames?: string[];
    /** Azure Tenant ID */
    tenantId?: string;
    secret?: string;
    secretExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    status: string;
    objectives?: SurveyResponse[];
    /** Preferred recommendation effort-estimate profile for this cloud account. */
    effortProfile?: EffortEstimateProfileName;
    writeSecret?: string;
    writeSecretExpiresAt?: Date;
    writeClientId?: string;
    writeBitmask?: number;
    readBitmask?: number;
    tenantSyncStatus?: CloudAccountTenantSyncStatus;
    tenantSyncRequestedAt?: Date;
    tenantSyncStartedAt?: Date;
    tenantSyncCompletedAt?: Date;
    tenantSyncError?: string;
    tenantSyncSource?: CloudAccountTenantSyncSource;
    firstSyncNotificationStatus?: CloudAccountFirstSyncNotificationStatus;
    firstSyncNotificationUserId?: string;
    /** Azure sync features disabled for this cloud account. Cloud-account opt-outs are hard denies for subscriptions. */
    syncFeatureOptOuts?: AzureSyncFeatureId[];
    /**
     * Internal legacy delegated-user token cache. Do not expose this field in public API DTOs.
     * Guest access token relay payloads use AzureGuestAccessTokenRelayPayload and must not be
     * stored on CloudAccount or returned through PublicCloudAccountDto.
     */
    delegatedTokenCache?: string;
    /** Legacy delegated-user onboarding status. Guest access lifecycle state uses guestAccessStatus fields. */
    onboardingStatus?: AzureDelegatedOnboardingStatus;
    scanSchedulingMode?: CloudAccountScanSchedulingMode;
    delegatedSetupExpiresAt?: Date | string;
    delegatedTrialStartedAt?: Date | string;
    delegatedTrialExpiresAt?: Date | string;
    reauthRequired?: boolean;
    lastAuthErrorCode?: AzureDelegatedAuthErrorCode;
    lastAuthErrorAt?: Date | string;
    connectedUserObjectId?: string;
    connectedUserTenantId?: string;
    connectedUserEmail?: string;
    connectedUserDisplayName?: string;
    connectedAt?: Date | string;
    lastTokenRefreshAt?: Date | string;
    lastDelegatedTokenCacheUpdatedAt?: Date | string;
    gdapAuthorizationCompanyId?: string;
    gdapAuthorizationProfileId?: string;
    gdapPartnerTenantId?: string;
    gdapCustomerTenantId?: string;
    gdapRelationshipId?: string;
    gdapRelationshipDisplayName?: string;
    gdapRelationshipStatus?: AzureGdapRelationshipStatus;
    gdapAccessAssignmentId?: string;
    gdapAccessAssignmentStatus?: AzureGdapAccessAssignmentStatus;
    gdapSecurityGroupId?: string;
    gdapSecurityGroupDisplayName?: string;
    gdapRolesJson?: string;
    gdapExpiresAt?: Date | string;
    gdapAutoExtendEnabled?: boolean;
    gdapPartnerAuthorizationStatus?: AzureGdapValidationStatus;
    gdapAppConsentStatus?: AzureGdapValidationStatus;
    gdapLastValidatedAt?: Date | string;
    gdapLastValidationStatus?: AzureGdapValidationStatus;
    gdapLastValidationErrorCode?: string;
    /** Sanitized public-safe validation message. Do not store raw Microsoft claims or token errors here. */
    gdapLastValidationMessage?: string;
    gdapScheduledEligible?: boolean;
    gdapScheduledEligibilityReason?: string;
    gdapCapabilities?: AzureGdapCapabilityStatus[];
    /** Internal GDAP credential locator. Do not expose this field in public API DTOs. */
    gdapCredentialReference?: string;
    /** Internal manual billing export locator override. Do not expose this field in public API DTOs. */
    billingExportLocator?: string | CloudAccountBillingExportLocator;
}
export type PublicCloudAccountDto = Omit<CloudAccount, 'delegatedTokenCache' | 'secret' | 'writeSecret' | 'billingExportLocator' | 'gdapCredentialReference'> & {
    /** Display-only masked preview of the stored read secret. Never contains the full secret value. */
    secretPreview?: string;
    /** Display-only masked preview of the stored write secret. Never contains the full secret value. */
    writeSecretPreview?: string;
    /** Guest access token relay payloads are internal only and must never appear in public DTOs. */
    guestAccessTokenRelayPayload?: never;
    /** Guest access token relay storage locators are internal only and must never appear in public DTOs. */
    guestAccessTokenRelayReference?: never;
};
export type SyncProgressIssueType = 'capabilityMissing' | 'billingExport' | 'partialData';
export type SyncProgressIssueScope = 'cloudAccount' | 'subscription' | 'component';
export type SyncProgressIssueMetadataValue = string | number | boolean | undefined;
export interface SyncProgressIssue {
    type: SyncProgressIssueType;
    scope: SyncProgressIssueScope;
    capabilityKey?: string;
    capabilityDisplayName?: string;
    capabilityDescription?: string;
    requiredRoles?: string[];
    message: string;
    code?: string;
    title?: string;
    remediation?: string;
    sourceSelected?: 'export' | 'query';
    fallbackUsed?: boolean;
    degraded?: boolean;
    metadata?: Record<string, SyncProgressIssueMetadataValue>;
}
export type SubscriptionSyncProgressStepStatus = 'idle' | 'pending' | 'queued' | 'inProgress' | 'completed' | 'error';
export type SubscriptionSyncProgressSubStepStatus = SubscriptionSyncProgressStepStatus | 'skipped';
export type SubscriptionSyncProgressContextValue = string | number | boolean;
export interface SubscriptionSyncProgressSubStep {
    id: string;
    status: SubscriptionSyncProgressSubStepStatus;
    label?: string;
    attempts?: number;
    lastUpdated?: string;
    lastError?: string;
    durationMs?: number;
    context?: Record<string, SubscriptionSyncProgressContextValue>;
}
export interface SubscriptionSyncProgressStep {
    id: SubscriptionSyncStepId;
    status: SubscriptionSyncProgressStepStatus;
    attempts: number;
    lastUpdated: string;
    lastError?: string;
    runId?: string;
    active: boolean;
    callCount?: number;
    note?: string;
    issue?: SyncProgressIssue;
    subSteps?: SubscriptionSyncProgressSubStep[];
}
export interface SubscriptionSyncProgress {
    runId?: string;
    overallStatus: 'idle' | 'processing' | 'completed' | 'error';
    progressLabel: string;
    completedSteps: number;
    totalSteps: number;
    activeComponents: SubscriptionSyncStepId[];
    currentStepId?: SubscriptionSyncStepId;
    lastErrorComponent?: SubscriptionSyncStepId;
    lastErrorMessage?: string;
    initiatedAt?: string;
    completedAt?: string;
    lastUpdated: string;
    steps: SubscriptionSyncProgressStep[];
}
export interface SubscriptionInfoBase {
    name: string;
    friendlyName?: string;
    cloudAccountId: string;
    cloudAccountName: string;
    /** Optional group name for subscription-level grouping */
    groupName?: string;
    /** Optional emoji shortcode (Slack-style, e.g. "/face") */
    icon?: string;
    /** Optional subscription type (Production, Non-Production, Mixed) */
    subscriptionType?: SubscriptionType;
    status?: string;
    statusLabel?: string;
    error?: string;
    lastUpdated?: string;
    quotaId?: string;
    duration?: string;
    currency?: string;
    currencySymbol?: string;
    foundCurrency?: boolean;
    ready?: boolean;
    secureScore?: number;
    advisorScore?: number;
    advisorScoreCost?: number;
    advisorScoreSecurity?: number;
    advisorScorePerformance?: number;
    advisorScoreReliability?: number;
    advisorScoreOperationalExcellence?: number;
    showAmortizedCosts?: boolean;
    totalCost?: number;
    billingItems?: number;
    activityItems?: number;
    eventId?: string;
    readBitmask?: number;
    syncProgress?: SubscriptionSyncProgress | string | null;
    /** Azure sync features disabled for this subscription in addition to cloud-account opt-outs. */
    syncFeatureOptOuts?: AzureSyncFeatureId[];
    /** Azure sync features disabled by the parent cloud account. Returned to administrators only. */
    cloudAccountSyncFeatureOptOuts?: AzureSyncFeatureId[];
    /** Effective Azure sync features disabled after applying cloud-account hard denies. Returned to administrators only. */
    effectiveSyncFeatureOptOuts?: AzureSyncFeatureId[];
    /** Purpose bound to the current delegated guest-access run. */
    guestAccessWorkloadKind?: 'fullScan' | 'reviewChecklist';
    /** Normalized checklist identifier when the current guest-access run is review-checklist-only. */
    guestAccessChecklistId?: string;
}
export interface SubscriptionAccount extends SubscriptionInfoBase {
    /** Partition Key (Azure Subscription ID) */
    id: string;
    /** Row Key */
    companyId: string;
}
export {};
//# sourceMappingURL=accounts.d.ts.map