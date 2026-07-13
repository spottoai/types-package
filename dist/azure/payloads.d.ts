import { Subscription, SubscriptionPolicies } from './subscriptions.js';
import type { AzureDelegatedAuthErrorCode, AzureDelegatedOAuthStatePhase, AzureDelegatedOnboardingStatus, AzureGuestAccessScanSchedulingMode, AzureGuestAccessStatus, AzureGuestAccessStatusReason, AzureCloudAccountAuthContext, CloudAccountAuthMode, CloudAccountTenantSyncSource, PublicCloudAccountDto } from '../accounts/accounts.js';
import type { CompanyLifecycle } from '../company/company.js';
export interface WorkflowTracingOptions {
    enabled: boolean;
}
export interface SubscriptionSyncRequest {
    tracing?: WorkflowTracingOptions;
}
export interface CloudAccountTenantSyncRequest {
    tracing?: WorkflowTracingOptions;
}
export interface ProcessPayload {
    subscriptionId?: string;
    tenantId?: string;
    authToken?: string;
    authClientId?: string;
    authClientSecret?: string;
    authTenantId?: string;
    companyId?: string;
    cloudAccountId?: string;
    clientId?: string;
    authMode?: CloudAccountAuthMode;
    customerTenantId?: string;
    authorityTenantId?: string;
    partnerTenantId?: string;
    principalClientId?: string;
    credentialReference?: string;
    authContext?: AzureCloudAccountAuthContext;
    tracing?: WorkflowTracingOptions;
}
export interface RequestMessage {
    entity: string;
    /** create, delete */
    action: string;
    companyId: string;
    cloudAccountId: string;
    tenantId: string;
    clientId: string;
    authMode?: CloudAccountAuthMode;
    customerTenantId?: string;
    authorityTenantId?: string;
    partnerTenantId?: string;
    principalClientId?: string;
    credentialReference?: string;
    authContext?: AzureCloudAccountAuthContext;
    subscriptionId?: string;
    refreshComponents?: string[];
    correlationId?: string;
    eventId?: string;
    tracing?: WorkflowTracingOptions;
}
export type ActionExecutionSourceKind = 'manual' | 'schedule' | 'system';
export interface ActionExecutionSource {
    kind: ActionExecutionSourceKind;
    scheduleId?: string;
    scheduleRunId?: string;
    occurrenceId?: string;
    desiredOutcome?: string;
}
export interface ActionExecutionRequestMessage extends RequestMessage {
    entity: 'actions';
    action: 'execute';
    providerName?: 'azure';
    providerScopeId?: string;
    actionDefinitionId: string;
    resourceIds: string[];
    byUserId?: string;
    source?: ActionExecutionSource;
}
export interface CloudAccountTenantSyncRequestMessage extends RequestMessage {
    entity: 'cloudaccount' | 'cloudaccounts';
    action: 'tenant-sync';
    byUserId?: string;
    source: CloudAccountTenantSyncSource;
    correlationId?: string;
    runId?: string;
}
export interface SubscriptionMessage {
    authToken?: string;
    authClientId?: string;
    authClientSecret?: string;
    authTenantId?: string;
    subscription: Subscription;
    companyId: string;
    cloudAccountId?: string;
    tenantId?: string;
    clientId?: string;
    authMode?: CloudAccountAuthMode;
    customerTenantId?: string;
    authorityTenantId?: string;
    partnerTenantId?: string;
    principalClientId?: string;
    credentialReference?: string;
    authContext?: AzureCloudAccountAuthContext;
    /** Provide a list of components to refresh. Leave empty to refresh all components. */
    refreshComponents?: string[];
    sagaRunId?: string;
    eventId?: string;
    tracing?: WorkflowTracingOptions;
    metadata?: Record<string, unknown>;
}
export interface AzureGdapQueueAuthContext extends Omit<AzureCloudAccountAuthContext, 'authMode' | 'cloudAccountId' | 'customerTenantId' | 'partnerTenantId' | 'principalClientId' | 'credentialReference'> {
    authMode?: 'gdap';
    cloudAccountId?: string;
    customerTenantId?: string;
    partnerTenantId?: string;
    principalClientId?: never;
    credentialReference?: never;
}
export interface AzureGdapSubscriptionMessage extends Omit<SubscriptionMessage, 'authToken' | 'authClientId' | 'authClientSecret' | 'authTenantId' | 'clientId' | 'authMode' | 'cloudAccountId' | 'tenantId' | 'customerTenantId' | 'authorityTenantId' | 'partnerTenantId' | 'principalClientId' | 'credentialReference' | 'authContext'> {
    authMode: 'gdap';
    cloudAccountId: string;
    tenantId: string;
    customerTenantId: string;
    partnerTenantId: string;
    authorityTenantId?: string;
    clientId?: never;
    principalClientId?: never;
    credentialReference?: never;
    authContext?: AzureGdapQueueAuthContext;
}
export type AzureGuestAccessAuthFlow = 'azurePowerShellDeviceCode';
export interface AzureGuestAccessDeviceCodeResponse {
    setupId: string;
    userCode: string;
    deviceCodeExpiresAt: string;
    verificationUri: string;
    verificationUriComplete?: string;
    message?: string;
    intervalSeconds?: number;
    status: AzureGuestAccessStatus;
}
export interface AzureGuestAccessStartRequest {
    displayName?: string;
}
export interface AzureGuestAccessTenantItem {
    tenantId: string;
    displayName?: string;
    domainName?: string;
    selected?: boolean;
}
export interface AzureGuestAccessSubscriptionItem {
    subscriptionId: string;
    displayName?: string;
    tenantId: string;
    state?: string;
    selectable: boolean;
    statusReason?: AzureGuestAccessStatusReason;
}
export interface AzureGuestAccessTenantSelectionRequest {
    tenantId: string;
}
export interface AzureGuestAccessConfirmSubscriptionsRequest {
    subscriptionIds: string[];
    displayName?: string;
}
export interface AzureGuestAccessManualScanRequest {
    refreshComponents?: string[];
}
export interface AzureGuestAccessStatusResponse {
    setupId?: string;
    cloudAccountId?: string;
    tenantId?: string;
    status: AzureGuestAccessStatus;
    statusReason?: AzureGuestAccessStatusReason;
    authErrorCode?: AzureDelegatedAuthErrorCode;
    connectedUser?: AzureGuestAccessConnectedUser;
    cloudAccount?: PublicCloudAccountDto;
    tenants?: AzureGuestAccessTenantItem[];
    subscriptions?: AzureGuestAccessSubscriptionItem[];
    scanSchedulingMode: AzureGuestAccessScanSchedulingMode;
    guestAccessRunId?: string;
    guestAccessLastRunId?: string;
    guestAccessQueuedAt?: string;
    guestAccessScanStartedAt?: string;
    guestAccessScanCompletedAt?: string;
    guestAccessLastSuccessfulScanAt?: string;
    expiresAt?: string;
    reauthRequired?: boolean;
}
export interface AzureGuestAccessConnectedUser {
    homeAccountId?: string;
    username?: string;
    name?: string;
    objectId?: string;
}
export interface AzureGuestAccessTokenRelayPayload {
    authFlow: AzureGuestAccessAuthFlow;
    authorityHost: string;
    authorityTenantId: string;
    selectedTenantId?: string;
    clientId: string;
    scopes: string[];
    tokenType: 'Bearer';
    accessToken: string;
    accessTokenExpiresAt: string;
    refreshToken: string;
    connectedUser?: AzureGuestAccessConnectedUser;
    receivedAt: string;
    updatedAt: string;
}
export interface AzureGuestAccessSubscriptionMessageMetadata {
    guestAccessRun: true;
    scanSchedulingMode: AzureGuestAccessScanSchedulingMode;
    guestAccessSource: 'initial' | 'manual';
    authFlow: AzureGuestAccessAuthFlow;
}
export interface AzureGuestAccessSubscriptionMessage extends Omit<SubscriptionMessage, 'authToken' | 'authClientId' | 'authClientSecret' | 'authTenantId' | 'authMode' | 'cloudAccountId' | 'tenantId' | 'clientId' | 'customerTenantId' | 'authorityTenantId' | 'partnerTenantId' | 'principalClientId' | 'credentialReference' | 'authContext' | 'sagaRunId' | 'metadata'> {
    authMode: 'delegatedUser';
    cloudAccountId: string;
    tenantId: string;
    clientId: string;
    sagaRunId: string;
    metadata: AzureGuestAccessSubscriptionMessageMetadata;
    authToken?: never;
    authClientId?: never;
    authClientSecret?: never;
    authTenantId?: never;
    customerTenantId?: never;
    authorityTenantId?: never;
    partnerTenantId?: never;
    principalClientId?: never;
    credentialReference?: never;
    authContext?: never;
}
export interface SubscriptionResponse {
    displayName: string;
    id: string;
    state: string;
    subscriptionId: string;
    subscriptionPolicies: SubscriptionPolicies;
    tenantId: string;
}
export type AzureDelegatedCapabilityStatus = 'available' | 'missingPermission' | 'forbidden' | 'unknown';
export interface AzureDelegatedConnectionStartRequest {
    redirectAfter?: string;
}
export interface AzureDelegatedRedirectError {
    code: AzureDelegatedAuthErrorCode;
    message?: string;
    phase?: AzureDelegatedOAuthStatePhase;
    correlationId?: string;
}
export interface AzureDelegatedPortalRedirectStatus {
    phase: AzureDelegatedOAuthStatePhase;
    status: 'success' | 'error' | 'pending';
    companyId?: string;
    cloudAccountId?: string;
    tenantId?: string;
    redirectAfter?: string;
    error?: AzureDelegatedRedirectError;
}
export interface AzureDelegatedTenantItem {
    tenantId: string;
    displayName?: string;
    label: string;
    isAlreadyConnected: boolean;
    connectedAuthMode?: CloudAccountAuthMode;
}
export interface AzureDelegatedTenantSelectionRequest {
    tenantId: string;
    redirectAfter?: string;
}
export interface AzureDelegatedCapabilityCheck {
    capability: string;
    isAvailable: boolean;
    status: AzureDelegatedCapabilityStatus;
    warningCode?: string;
    warningMessage?: string;
}
export interface AzureDelegatedSubscriptionItem {
    subscriptionId: string;
    displayName: string;
    tenantId: string;
    isVisible: boolean;
    isResourceReadable: boolean;
    isSelectable: boolean;
    warningCode?: string;
    warningMessage?: string;
}
export interface AzureDelegatedOnboardingResponse {
    status: AzureDelegatedOnboardingStatus;
    phase?: AzureDelegatedOAuthStatePhase;
    cloudAccount?: PublicCloudAccountDto;
    tenants?: AzureDelegatedTenantItem[];
    selectedTenantId?: string;
    capabilities?: AzureDelegatedCapabilityCheck[];
    subscriptions?: AzureDelegatedSubscriptionItem[];
    setupExpiresAt?: Date | string;
    trialExpiresAt?: Date | string;
    reauthRequired?: boolean;
    lastAuthErrorCode?: AzureDelegatedAuthErrorCode;
}
export interface AzureDelegatedConfirmSubscriptionsRequest {
    subscriptionIds: string[];
    redirectAfter?: string;
}
export interface AzureDelegatedConfirmSubscriptionsResponse {
    cloudAccount: PublicCloudAccountDto;
    subscriptions: AzureDelegatedSubscriptionItem[];
    onboardingStatus: AzureDelegatedOnboardingStatus;
}
export interface AzureDelegatedReconnectRequest {
    redirectAfter?: string;
}
export interface AzureDelegatedReplaceWithServicePrincipalRequest {
    clientId: string;
    tenantId: string;
    secret: string;
    secretExpiresAt?: Date | string;
    writeClientId?: string;
    writeSecret?: string;
    writeSecretExpiresAt?: Date | string;
}
export interface AzureDelegatedReplaceWithServicePrincipalResponse {
    cloudAccount: PublicCloudAccountDto;
}
export interface AzureDelegatedTrialExtensionRequest {
    expiresAt: Date | string;
    reason?: string;
}
export interface AzureDelegatedTrialExtensionResponse {
    companyId: string;
    companyLifecycle?: CompanyLifecycle;
    azureDelegatedTrialExpiresAt: Date | string;
}
//# sourceMappingURL=payloads.d.ts.map