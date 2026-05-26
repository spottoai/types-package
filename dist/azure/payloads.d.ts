import { Subscription, SubscriptionPolicies } from './subscriptions.js';
import type { AzureDelegatedAuthErrorCode, AzureDelegatedOAuthStatePhase, AzureDelegatedOnboardingStatus, CloudAccountAuthMode, CloudAccountTenantSyncSource, PublicCloudAccountDto } from '../accounts/accounts.js';
import type { CompanyLifecycle } from '../company/company.js';
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
}
export interface RequestMessage {
    entity: string;
    /** create, delete */
    action: string;
    companyId: string;
    cloudAccountId: string;
    tenantId: string;
    clientId: string;
    subscriptionId?: string;
    refreshComponents?: string[];
    correlationId?: string;
    eventId?: string;
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
    /** Provide a list of components to refresh. Leave empty to refresh all components. */
    refreshComponents?: string[];
    sagaRunId?: string;
    eventId?: string;
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