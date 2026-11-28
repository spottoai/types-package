import type { CapabilityReasonCode } from '../common/capabilityPassport';
import { isRecommendationActionFixType, type RecommendationActionFixType } from '../azure/recommendations';
import { KNOWN_WRITE_PERMISSION_MASK, WritePermission } from './writePermissions';

/**
 * Effective write access for one subscription, as observed from Azure by cloud-engine on each scan.
 *
 * This is a fact about Azure (what the cloud account's identity is currently allowed to do), not a
 * customer choice. Customer consent stays on the cloud account. Storage paths for the document are
 * owned by cloud-engine; this package defines only its shape.
 */
export const SUBSCRIPTION_WRITE_ACCESS_SCHEMA_VERSION = 1 as const;

/** Maximum narrower scopes listed per capability; `grantedScopeCount` carries the full count. */
export const SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_SCOPES = 50 as const;

/** Maximum missing actions listed per capability. */
export const SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_ACTIONS = 100 as const;

/** Capabilities every complete version 1 document carries. */
export const SUBSCRIPTION_WRITE_CAPABILITY_BASE_KEYS = [
  'advisorDismissSync',
  'storageInventory',
  'policyExemptions',
  'resourceScheduling',
  'remediationCleanup',
  'remediationRightsize',
  'commitmentsManage',
] as const;

/**
 * Capabilities added after version 1 was first published. A document written by an older producer omits them;
 * read a missing one as `unknown`, never as missing access.
 */
export const SUBSCRIPTION_WRITE_CAPABILITY_ADDED_KEYS = ['remediationConfiguration', 'remediationPower', 'remediationLicensing'] as const;

export const SUBSCRIPTION_WRITE_CAPABILITY_KEYS = [...SUBSCRIPTION_WRITE_CAPABILITY_BASE_KEYS, ...SUBSCRIPTION_WRITE_CAPABILITY_ADDED_KEYS] as const;

export type SubscriptionWriteCapabilityBaseKey = (typeof SUBSCRIPTION_WRITE_CAPABILITY_BASE_KEYS)[number];
export type SubscriptionWriteCapabilityAddedKey = (typeof SUBSCRIPTION_WRITE_CAPABILITY_ADDED_KEYS)[number];
export type SubscriptionWriteCapabilityKey = (typeof SUBSCRIPTION_WRITE_CAPABILITY_KEYS)[number];

/** The WritePermission bit each capability sets in the subscription bitmasks. */
export const SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS: Readonly<Record<SubscriptionWriteCapabilityKey, WritePermission>> = {
  advisorDismissSync: WritePermission.DismissRecommendations,
  storageInventory: WritePermission.StorageInventory,
  policyExemptions: WritePermission.PolicyExemptions,
  resourceScheduling: WritePermission.ResourceScheduling,
  remediationCleanup: WritePermission.RemediationCleanup,
  remediationRightsize: WritePermission.RemediationRightsize,
  commitmentsManage: WritePermission.CommitmentsManage,
  remediationConfiguration: WritePermission.RemediationConfiguration,
  remediationPower: WritePermission.RemediationPower,
  remediationLicensing: WritePermission.RemediationLicensing,
};

/** The write capability that grants each recommendation fix type. Each fix type has its own Spotto-managed role. */
export const RECOMMENDATION_ACTION_FIX_TYPE_WRITE_CAPABILITIES: Readonly<Record<RecommendationActionFixType, SubscriptionWriteCapabilityKey>> = {
  configuration: 'remediationConfiguration',
  rightsize: 'remediationRightsize',
  power: 'remediationPower',
  licensing: 'remediationLicensing',
  cleanup: 'remediationCleanup',
};

export interface AzureRecommendationFixSelection {
  subscriptionId: string;
  fixTypes: RecommendationActionFixType[];
}

/** Explicit selection of scopes and fix types under the catalog the administrator reviewed. */
export interface AzureRecommendationFixConsent {
  catalogVersion: string;
  subscriptions: AzureRecommendationFixSelection[];
}

/** Spotto's stored execution policy. Azure RBAC must still allow each operation. */
export interface AzureRecommendationFixPolicy {
  revision: string;
  /** Missing subscriptions have no enabled fix types once this policy is configured. */
  subscriptions: AzureRecommendationFixSelection[];
}

/** A disable hard-stops Spotto use. Azure assignment removal uses a separately authorized setup. */
export interface AzureRecommendationFixDisableRequest {
  expectedPolicyRevision: string;
  subscriptions: AzureRecommendationFixSelection[];
}

export interface AzureRecommendationFixCatalog {
  /** Identifies the exact role operations and verified action coverage. */
  version: string;
  roles: AzureRecommendationFixRole[];
}

export interface AzureRecommendationFixRole {
  fixType: RecommendationActionFixType;
  operations: string[];
  /** Only published, verified actions that the role supports. */
  actionIds: string[];
}

export type AzureRecommendationFixAccessStatus = 'on' | 'missing' | 'off' | 'unknown';

export interface AzureRecommendationFixSubscriptionAccess {
  subscriptionId: string;
  status: AzureRecommendationFixAccessStatus;
  checkedAt?: string;
  /** Partial Azure access can coexist with a role-coverage status of Missing. */
  observedAccess?: SubscriptionWriteCapabilityResultV1;
  updateAccess?: boolean;
}

export interface AzureRecommendationFixRoleAccess {
  fixType: RecommendationActionFixType;
  subscriptions: AzureRecommendationFixSubscriptionAccess[];
  /** Count from the current authorized recommendation set, when that set is available. */
  fixableRecommendationCount?: number;
}

export interface AzureCloudAccountActionsResponse {
  cloudAccountId: string;
  catalog: AzureRecommendationFixCatalog;
  /** Revision to compare on writes, including a server-defined initial revision for legacy accounts. */
  policyRevision: string;
  roles: AzureRecommendationFixRoleAccess[];
  /** Existing write-back capabilities keep their own permissions and are not fix types. */
  writeBack?: Array<{
    capability: Extract<SubscriptionWriteCapabilityKey, 'advisorDismissSync' | 'storageInventory' | 'policyExemptions' | 'resourceScheduling'>;
    subscriptions: AzureRecommendationFixSubscriptionAccess[];
  }>;
}

/** Refresh only these subscriptions after an Azure role or credential change. */
export interface AzureRecommendationFixAccessRefreshRequest {
  subscriptionIds: string[];
}

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

/** Per-capability results: every base capability, plus each added capability the producer knew about. */
export type SubscriptionWriteCapabilityResultsV1 = Record<SubscriptionWriteCapabilityBaseKey, SubscriptionWriteCapabilityResultV1> &
  Partial<Record<SubscriptionWriteCapabilityAddedKey, SubscriptionWriteCapabilityResultV1>>;

export interface SubscriptionWriteAccessCompleteDocumentV1 extends SubscriptionWriteAccessDocumentBaseV1 {
  checkStatus: 'complete';
  /** Missing on legacy evidence. Consumers require a current version before using fix-role observations for readiness. */
  fixCatalogVersion?: string;
  /** Observations keyed by action definition ID. Omitted entries and targets outside truncated scope evidence need a check. */
  recommendationActions?: Record<string, SubscriptionRecommendationActionAccessV1>;
  /** Same value written to the subscription row. Equals `deriveSubscriptionWriteBitmasks(capabilities).effectiveWriteBitmask`. */
  effectiveWriteBitmask: number;
  /** Same value written to the subscription row. Always a subset of `effectiveWriteBitmask`. */
  partialWriteBitmask: number;
  capabilities: SubscriptionWriteCapabilityResultsV1;
}

export interface SubscriptionRecommendationActionAccessV1 extends SubscriptionWriteCapabilityResultV1 {
  /** Evidence applies only to this version of the action's required permissions. */
  actionVersion: string;
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
export function deriveSubscriptionWriteBitmasks(
  capabilities: Partial<Record<SubscriptionWriteCapabilityKey, Pick<SubscriptionWriteCapabilityResultV1, 'status'>>>
): SubscriptionWriteBitmasks {
  let effectiveWriteBitmask = 0;
  let partialWriteBitmask = 0;
  for (const key of SUBSCRIPTION_WRITE_CAPABILITY_KEYS) {
    const status = capabilities[key]?.status;
    const bit = SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS[key];
    if (status === 'available' || status === 'partial') effectiveWriteBitmask |= bit;
    if (status === 'partial') partialWriteBitmask |= bit;
  }
  return { effectiveWriteBitmask, partialWriteBitmask };
}

/** True when the subscription bitmasks show the permission as granted, fully or at narrower scopes. Unknown bits from newer producers are ignored. */
export function hasEffectiveWritePermission(effectiveWriteBitmask: number | undefined, permission: WritePermission): boolean {
  return ((effectiveWriteBitmask ?? 0) & KNOWN_WRITE_PERMISSION_MASK & permission) === permission;
}

const CAPABILITY_STATUSES: readonly SubscriptionWriteCapabilityStatus[] = ['available', 'partial', 'unavailable', 'unknown'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** Validates the explicit selection. Ownership, catalog matching and RBAC remain server checks. */
export function isAzureRecommendationFixConsent(value: unknown): value is AzureRecommendationFixConsent {
  if (!isRecord(value) || !isNonEmptyString(value.catalogVersion) || !Array.isArray(value.subscriptions) || !value.subscriptions.length) {
    return false;
  }
  if (!Object.keys(value).every(key => key === 'catalogVersion' || key === 'subscriptions')) return false;

  const subscriptions = new Set<string>();
  for (const selection of value.subscriptions) {
    if (!isRecord(selection) || !isNonEmptyString(selection.subscriptionId) || !Array.isArray(selection.fixTypes)) return false;
    if (!Object.keys(selection).every(key => key === 'subscriptionId' || key === 'fixTypes')) return false;
    if (!selection.fixTypes.length || !selection.fixTypes.every(isRecommendationActionFixType)) return false;
    if (new Set(selection.fixTypes).size !== selection.fixTypes.length) return false;

    const subscriptionId = selection.subscriptionId.trim().toLowerCase();
    if (subscriptions.has(subscriptionId)) return false;
    subscriptions.add(subscriptionId);
  }
  return true;
}

const isUint32 = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xffffffff;

const isStringArray = (value: unknown, maxLength: number): value is string[] =>
  Array.isArray(value) && value.length <= maxLength && value.every(isNonEmptyString);

const isCapabilityResult = (value: unknown): value is SubscriptionWriteCapabilityResultV1 => {
  if (!isRecord(value)) return false;
  if (!CAPABILITY_STATUSES.includes(value.status as SubscriptionWriteCapabilityStatus)) return false;
  if (value.missingActions !== undefined && !isStringArray(value.missingActions, SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_ACTIONS)) return false;
  if (value.grantedScopes !== undefined && !isStringArray(value.grantedScopes, SUBSCRIPTION_WRITE_ACCESS_MAX_LISTED_SCOPES)) return false;
  if (value.grantedScopeCount !== undefined && !isUint32(value.grantedScopeCount)) return false;
  if (value.reasonCode !== undefined && !isNonEmptyString(value.reasonCode)) return false;
  if (value.status === 'partial' && !(isUint32(value.grantedScopeCount) && value.grantedScopeCount > 0)) return false;
  return true;
};

/**
 * Validates a parsed document. Unknown capability keys and bits from a newer producer are ignored. Every base
 * capability must be present; an added capability is checked when present. The bitmasks must match the results.
 */
export function isSubscriptionWriteAccessDocumentV1(value: unknown): value is SubscriptionWriteAccessDocumentV1 {
  try {
    return isSubscriptionWriteAccessDocumentV1Unsafe(value);
  } catch {
    return false;
  }
}

function isSubscriptionWriteAccessDocumentV1Unsafe(value: unknown): value is SubscriptionWriteAccessDocumentV1 {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== SUBSCRIPTION_WRITE_ACCESS_SCHEMA_VERSION || value.provider !== 'azure') return false;
  if (!isNonEmptyString(value.companyId) || !isNonEmptyString(value.cloudAccountId) || !isNonEmptyString(value.subscriptionId)) return false;
  if (value.principalObjectId !== undefined && !isNonEmptyString(value.principalObjectId)) return false;
  if (!isNonEmptyString(value.checkedAt) || Number.isNaN(Date.parse(value.checkedAt))) return false;

  if (value.checkStatus === 'failed') return isNonEmptyString(value.reasonCode);
  if (value.checkStatus !== 'complete') return false;
  if (value.fixCatalogVersion !== undefined && !isNonEmptyString(value.fixCatalogVersion)) return false;
  if (value.recommendationActions !== undefined) {
    if (!isNonEmptyString(value.fixCatalogVersion) || !isRecord(value.recommendationActions)) return false;
    if (
      !Object.entries(value.recommendationActions).every(
        ([id, access]) => isNonEmptyString(id) && isRecord(access) && isNonEmptyString(access.actionVersion) && isCapabilityResult(access)
      )
    )
      return false;
  }

  if (!isUint32(value.effectiveWriteBitmask) || !isUint32(value.partialWriteBitmask)) return false;
  if ((value.partialWriteBitmask & ~value.effectiveWriteBitmask) !== 0) return false;
  if (!isRecord(value.capabilities)) return false;
  const capabilities = value.capabilities;
  if (!SUBSCRIPTION_WRITE_CAPABILITY_BASE_KEYS.every(key => isCapabilityResult(capabilities[key]))) return false;
  if (!SUBSCRIPTION_WRITE_CAPABILITY_ADDED_KEYS.every(key => capabilities[key] === undefined || isCapabilityResult(capabilities[key]))) return false;

  const derived = deriveSubscriptionWriteBitmasks(
    capabilities as Partial<Record<SubscriptionWriteCapabilityKey, SubscriptionWriteCapabilityResultV1>>
  );
  return (
    (value.effectiveWriteBitmask & KNOWN_WRITE_PERMISSION_MASK) === derived.effectiveWriteBitmask &&
    (value.partialWriteBitmask & KNOWN_WRITE_PERMISSION_MASK) === derived.partialWriteBitmask
  );
}
