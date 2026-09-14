import type { SubscriptionAccount } from './accounts';
import type { AzureManualOnboardingBillingExportDiscoveryResult } from './azureManualOnboarding';
/**
 * Validation-only Azure service-principal input. Persistence metadata is
 * intentionally excluded because a cloud account does not exist yet during onboarding.
 */
export interface CloudAccountValidationRequest {
    companyId: string;
    provider: 'Azure';
    id: string;
    name: string;
    companyName?: string;
    authMode?: 'servicePrincipal';
    tenantId: string;
    secret: string;
    useWriteAccess?: boolean;
    writeClientId?: string;
    writeSecret?: string;
    includeBillingExportDiscovery?: boolean;
}
export type SubscriptionValidationStatus = 'confirmed' | 'forbidden' | 'unauthorized' | 'throttled' | 'unavailable';
export interface SubscriptionReadValidationResult {
    subscription: SubscriptionAccount;
    valid: boolean;
    status: SubscriptionValidationStatus;
    statusCode: number;
    message?: string;
}
export interface CloudAccountReadAccessValidation {
    valid: boolean;
    subscriptions: SubscriptionAccount[];
    subscriptionResults: SubscriptionReadValidationResult[];
}
export interface CloudAccountWriteAccessValidation {
    valid: boolean;
    subscriptions: SubscriptionAccount[];
}
export type CloudAccountCapabilityValidationStatus = 'confirmed' | 'missing' | 'notApplicable' | 'notTested' | 'warning' | 'unknown';
export type CloudAccountCapabilityValidationScope = 'tenant' | 'subscription' | 'resource' | 'write';
export interface CloudAccountCapabilityValidationResult {
    key: string;
    section: string;
    scope: CloudAccountCapabilityValidationScope;
    status: CloudAccountCapabilityValidationStatus;
    severity: 'required' | 'recommended' | 'optional';
    displayName: string;
    description: string;
    requiredRoles: string[];
    affectedFeatures: string[];
    documentationUrl?: string;
    testedBy: string;
    subscriptionId?: string;
    statusCode?: number;
    message?: string;
}
export interface CloudAccountValidationResult {
    valid: boolean;
    readAccess: CloudAccountReadAccessValidation;
    writeAccess?: CloudAccountWriteAccessValidation;
    capabilityChecks?: CloudAccountCapabilityValidationResult[];
    billingExportDiscovery?: AzureManualOnboardingBillingExportDiscoveryResult;
}
export interface CloudAccountCapabilityValidationProgress {
    result: CloudAccountCapabilityValidationResult;
    completed: number;
    total: number;
}
export interface CloudAccountCapabilityValidationPlan {
    tenantCheckCount: number;
    subscriptionCheckCount: number;
    subscriptionCount: number;
    totalCheckCount: number;
}
export type CloudAccountValidationStreamEvent = {
    event: 'started';
    message: string;
} | {
    event: 'readAccessStarted';
    message: string;
} | {
    event: 'subscriptionsDiscovered';
    message: string;
    readAccess: CloudAccountReadAccessValidation;
    visibleSubscriptionCount: number;
    readableSubscriptionCount: number;
} | {
    event: 'capabilityStarted';
    message: string;
    plan: CloudAccountCapabilityValidationPlan;
} | {
    event: 'capabilityResult';
    message: string;
    result: CloudAccountCapabilityValidationResult;
    completed: number;
    total: number;
} | {
    event: 'writeAccessStarted';
    message: string;
} | {
    event: 'writeAccessCompleted';
    message: string;
    writeAccess: CloudAccountWriteAccessValidation;
} | {
    event: 'billingExportDiscoveryCompleted';
    message: string;
    result: AzureManualOnboardingBillingExportDiscoveryResult;
} | {
    event: 'completed';
    message: string;
    result: CloudAccountValidationResult;
} | {
    event: 'error';
    message: string;
};
//# sourceMappingURL=validation.d.ts.map