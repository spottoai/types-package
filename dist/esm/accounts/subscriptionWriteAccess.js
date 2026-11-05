import { KNOWN_WRITE_PERMISSION_MASK, WritePermission } from './writePermissions.js';
/**
 * Effective write access for one subscription, as observed from Azure by cloud-engine on each scan.
 *
 * This is a fact about Azure (what the cloud account's identity is currently allowed to do), not a
 * customer choice. Customer consent stays on the cloud account. Storage paths for the document are
 * owned by cloud-engine; this package defines only its shape.
 */
export const SUBSCRIPTION_WRITE_ACCESS_SCHEMA_VERSION = 1;
/** Maximum narrower scopes listed per capability; `grantedScopeCount` carries the full count. */
export const SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_SCOPES = 50;
/** Maximum missing actions listed per capability. */
export const SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_ACTIONS = 100;
export const SUBSCRIPTION_WRITE_CAPABILITY_KEYS = [
    'advisorDismissSync',
    'storageInventory',
    'policyExemptions',
    'resourceScheduling',
    'remediationCleanup',
    'remediationRightsize',
    'commitmentsManage',
];
/** The WritePermission bit each capability sets in the subscription bitmasks. */
export const SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS = {
    advisorDismissSync: WritePermission.DismissRecommendations,
    storageInventory: WritePermission.StorageInventory,
    policyExemptions: WritePermission.PolicyExemptions,
    resourceScheduling: WritePermission.ResourceScheduling,
    remediationCleanup: WritePermission.RemediationCleanup,
    remediationRightsize: WritePermission.RemediationRightsize,
    commitmentsManage: WritePermission.CommitmentsManage,
};
/** Derives the subscription row bitmasks from per-capability results. `available` and `partial` set the effective bit; `partial` also sets the partial bit. */
export function deriveSubscriptionWriteBitmasks(capabilities) {
    let effectiveWriteBitmask = 0;
    let partialWriteBitmask = 0;
    for (const key of SUBSCRIPTION_WRITE_CAPABILITY_KEYS) {
        const status = capabilities[key]?.status;
        const bit = SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS[key];
        if (status === 'available' || status === 'partial')
            effectiveWriteBitmask |= bit;
        if (status === 'partial')
            partialWriteBitmask |= bit;
    }
    return { effectiveWriteBitmask, partialWriteBitmask };
}
/** True when the subscription bitmasks show the permission as granted, fully or at narrower scopes. Unknown bits from newer producers are ignored. */
export function hasEffectiveWritePermission(effectiveWriteBitmask, permission) {
    return ((effectiveWriteBitmask ?? 0) & KNOWN_WRITE_PERMISSION_MASK & permission) === permission;
}
const CAPABILITY_STATUSES = ['available', 'partial', 'unavailable', 'unknown'];
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isUint32 = (value) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
const isStringArray = (value, maxLength) => Array.isArray(value) && value.length <= maxLength && value.every(isNonEmptyString);
const isCapabilityResult = (value) => {
    if (!isRecord(value))
        return false;
    if (!CAPABILITY_STATUSES.includes(value.status))
        return false;
    if (value.missingActions !== undefined && !isStringArray(value.missingActions, SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_ACTIONS))
        return false;
    if (value.grantedScopes !== undefined && !isStringArray(value.grantedScopes, SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_SCOPES))
        return false;
    if (value.grantedScopeCount !== undefined && !isUint32(value.grantedScopeCount))
        return false;
    if (value.reasonCode !== undefined && !isNonEmptyString(value.reasonCode))
        return false;
    if (value.status === 'partial' && !(isUint32(value.grantedScopeCount) && value.grantedScopeCount > 0))
        return false;
    return true;
};
/**
 * Validates a parsed document. Unknown capability keys and bits from a newer producer are ignored;
 * every capability known to this package version must be present, and the bitmasks must match the results.
 */
export function isSubscriptionWriteAccessDocumentV1(value) {
    try {
        return isSubscriptionWriteAccessDocumentV1Unsafe(value);
    }
    catch {
        return false;
    }
}
function isSubscriptionWriteAccessDocumentV1Unsafe(value) {
    if (!isRecord(value))
        return false;
    if (value.schemaVersion !== SUBSCRIPTION_WRITE_ACCESS_SCHEMA_VERSION || value.provider !== 'azure')
        return false;
    if (!isNonEmptyString(value.companyId) || !isNonEmptyString(value.cloudAccountId) || !isNonEmptyString(value.subscriptionId))
        return false;
    if (value.principalObjectId !== undefined && !isNonEmptyString(value.principalObjectId))
        return false;
    if (!isNonEmptyString(value.checkedAt) || Number.isNaN(Date.parse(value.checkedAt)))
        return false;
    if (value.checkStatus === 'failed')
        return isNonEmptyString(value.reasonCode);
    if (value.checkStatus !== 'complete')
        return false;
    if (!isUint32(value.effectiveWriteBitmask) || !isUint32(value.partialWriteBitmask))
        return false;
    if ((value.partialWriteBitmask & ~value.effectiveWriteBitmask) !== 0)
        return false;
    if (!isRecord(value.capabilities))
        return false;
    const capabilities = value.capabilities;
    if (!SUBSCRIPTION_WRITE_CAPABILITY_KEYS.every(key => isCapabilityResult(capabilities[key])))
        return false;
    const derived = deriveSubscriptionWriteBitmasks(capabilities);
    return ((value.effectiveWriteBitmask & KNOWN_WRITE_PERMISSION_MASK) === derived.effectiveWriteBitmask &&
        (value.partialWriteBitmask & KNOWN_WRITE_PERMISSION_MASK) === derived.partialWriteBitmask);
}
