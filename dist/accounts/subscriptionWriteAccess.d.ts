import type { CapabilityReasonCode } from '../common/capabilityPassport';
import { WritePermission } from './writePermissions';
/**
 * Effective write access for one subscription, as observed from Azure by cloud-engine on each scan.
 *
 * This is a fact about Azure (what the cloud account's identity is currently allowed to do), not a
 * customer choice. Customer consent stays on the cloud account. Storage paths for the document are
 * owned by cloud-engine; this package defines only its shape.
 */
export declare const SUBSCRIPTION_WRITE_ACCESS_SCHEMA_VERSION: 1;
/** Maximum narrower scopes listed per capability; `grantedScopeCount` carries the full count. */
export declare const SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_SCOPES: 50;
/** Maximum missing actions listed per capability. */
export declare const SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_ACTIONS: 100;
export declare const SUBSCRIPTION_WRITE_CAPABILITY_KEYS: readonly ["advisorDismissSync", "storageInventory", "policyExemptions", "resourceScheduling", "remediationCleanup", "remediationRightsize", "commitmentsManage"];
export type SubscriptionWriteCapabilityKey = (typeof SUBSCRIPTION_WRITE_CAPABILITY_KEYS)[number];
/** The WritePermission bit each capability sets in the subscription bitmasks. */
export declare const SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS: Readonly<Record<SubscriptionWriteCapabilityKey, WritePermission>>;
/**
 * - `available`: every required action is allowed across the whole subscription.
 * - `partial`: not allowed across the subscription, but granted in full at one or more resource groups or resources.
 * - `unavailable`: not granted anywhere Spotto can see.
 * - `unknown`: the check could not decide (see `reasonCode`); treat as not usable, but do not report it as missing.
 */
export type SubscriptionWriteCapabilityStatus = 'available' | 'partial' | 'unavailable' | 'unknown';
export interface SubscriptionWriteCapabilityResultV1 {
    status: SubscriptionWriteCapabilityStatus;
    /** Required actions or data actions not allowed at subscription scope. Present for `partial` and `unavailable`. */
    missingActions?: string[];
    /** For `partial`: how many narrower scopes grant every required action. */
    grantedScopeCount?: number;
    /** For `partial`: up to `SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_SCOPES` of those scopes, as ARM resource IDs. */
    grantedScopes?: string[];
    /** For `unknown`: why the check could not decide. */
    reasonCode?: CapabilityReasonCode;
}
interface SubscriptionWriteAccessDocumentBaseV1 {
    schemaVersion: typeof SUBSCRIPTION_WRITE_ACCESS_SCHEMA_VERSION;
    provider: 'azure';
    companyId: string;
    cloudAccountId: string;
    subscriptionId: string;
    /** Object ID of the service principal whose access was checked, when known. */
    principalObjectId?: string;
    /** ISO 8601 UTC time the check finished. */
    checkedAt: string;
}
export interface SubscriptionWriteAccessCompleteDocumentV1 extends SubscriptionWriteAccessDocumentBaseV1 {
    checkStatus: 'complete';
    /** Same value written to the subscription row. Equals `deriveSubscriptionWriteBitmasks(capabilities).effectiveWriteBitmask`. */
    effectiveWriteBitmask: number;
    /** Same value written to the subscription row. Always a subset of `effectiveWriteBitmask`. */
    partialWriteBitmask: number;
    capabilities: Record<SubscriptionWriteCapabilityKey, SubscriptionWriteCapabilityResultV1>;
}
/** The check could not run. The subscription row keeps its previous bitmasks so a transient failure never switches a feature off. */
export interface SubscriptionWriteAccessFailedDocumentV1 extends SubscriptionWriteAccessDocumentBaseV1 {
    checkStatus: 'failed';
    reasonCode: CapabilityReasonCode;
}
export type SubscriptionWriteAccessDocumentV1 = SubscriptionWriteAccessCompleteDocumentV1 | SubscriptionWriteAccessFailedDocumentV1;
export interface SubscriptionWriteBitmasks {
    effectiveWriteBitmask: number;
    partialWriteBitmask: number;
}
/** Derives the subscription row bitmasks from per-capability results. `available` and `partial` set the effective bit; `partial` also sets the partial bit. */
export declare function deriveSubscriptionWriteBitmasks(capabilities: Partial<Record<SubscriptionWriteCapabilityKey, Pick<SubscriptionWriteCapabilityResultV1, 'status'>>>): SubscriptionWriteBitmasks;
/** True when the subscription bitmasks show the permission as granted, fully or at narrower scopes. Unknown bits from newer producers are ignored. */
export declare function hasEffectiveWritePermission(effectiveWriteBitmask: number | undefined, permission: WritePermission): boolean;
/**
 * Validates a parsed document. Unknown capability keys and bits from a newer producer are ignored;
 * every capability known to this package version must be present, and the bitmasks must match the results.
 */
export declare function isSubscriptionWriteAccessDocumentV1(value: unknown): value is SubscriptionWriteAccessDocumentV1;
export {};
//# sourceMappingURL=subscriptionWriteAccess.d.ts.map