import type { CompanySubscription } from '../azure/subscriptions';
import type {
  SubscriptionAccount,
  SubscriptionInfoBase,
  SubscriptionWriteAccessCompleteDocumentV1,
  SubscriptionWriteAccessDocumentV1,
  SubscriptionWriteAccessFailedDocumentV1,
  SubscriptionWriteCapabilityKey,
  SubscriptionWriteCapabilityResultV1,
} from '../index';
import {
  KNOWN_WRITE_PERMISSION_MASK,
  SUBSCRIPTION_WRITE_CAPABILITY_KEYS,
  SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS,
  WritePermission,
  deriveSubscriptionWriteBitmasks,
  hasEffectiveWritePermission,
  isSubscriptionWriteAccessDocumentV1,
} from '../index';

const subscriptionInfoBase: SubscriptionInfoBase = {
  name: 'Dev apps',
  cloudAccountId: 'cloud-123',
  cloudAccountName: 'Contoso',
};

// Both bitmasks are optional: a subscription that has never been checked omits them.
const unchecked: SubscriptionInfoBase = subscriptionInfoBase;

const checked: SubscriptionInfoBase = {
  ...subscriptionInfoBase,
  effectiveWriteBitmask: WritePermission.DismissRecommendations | WritePermission.ResourceScheduling,
  partialWriteBitmask: WritePermission.ResourceScheduling,
};

const checkedAccount: SubscriptionAccount = { ...checked, id: 'sub-1', companyId: 'comp-123' };
const checkedCompanySubscription: CompanySubscription = { ...checked, id: 'sub-1', companyId: 'comp-123' };

const invalidBitmaskType: SubscriptionInfoBase = {
  ...subscriptionInfoBase,
  // @ts-expect-error Write bitmasks are numeric.
  effectiveWriteBitmask: '1',
};

const newBits: WritePermission[] = [WritePermission.RemediationCleanup, WritePermission.RemediationRightsize, WritePermission.CommitmentsManage];

const allKeys: readonly SubscriptionWriteCapabilityKey[] = SUBSCRIPTION_WRITE_CAPABILITY_KEYS;
const schedulingBit: WritePermission = SUBSCRIPTION_WRITE_CAPABILITY_PERMISSIONS.resourceScheduling;

// @ts-expect-error Capability keys are a closed set.
const invalidKey: SubscriptionWriteCapabilityKey = 'deleteEverything';

const unavailable: SubscriptionWriteCapabilityResultV1 = {
  status: 'unavailable',
  missingActions: ['Microsoft.Advisor/recommendations/suppressions/write'],
};

// @ts-expect-error Capability status is a closed set.
const invalidStatus: SubscriptionWriteCapabilityResultV1 = { status: 'granted' };

const capabilities: Record<SubscriptionWriteCapabilityKey, SubscriptionWriteCapabilityResultV1> = {
  advisorDismissSync: { status: 'available' },
  storageInventory: unavailable,
  policyExemptions: { status: 'unknown', reasonCode: 'throttled' },
  resourceScheduling: { status: 'partial', grantedScopeCount: 1, grantedScopes: ['/subscriptions/sub-1/resourceGroups/rg-dev'] },
  remediationCleanup: unavailable,
  remediationRightsize: unavailable,
  commitmentsManage: unavailable,
};

const complete: SubscriptionWriteAccessCompleteDocumentV1 = {
  schemaVersion: 1,
  provider: 'azure',
  companyId: 'comp-123',
  cloudAccountId: 'cloud-123',
  subscriptionId: 'sub-1',
  checkedAt: '2026-09-28T00:00:00.000Z',
  checkStatus: 'complete',
  ...deriveSubscriptionWriteBitmasks(capabilities),
  capabilities,
};

const failed: SubscriptionWriteAccessFailedDocumentV1 = {
  schemaVersion: 1,
  provider: 'azure',
  companyId: 'comp-123',
  cloudAccountId: 'cloud-123',
  subscriptionId: 'sub-1',
  checkedAt: '2026-09-28T00:00:00.000Z',
  checkStatus: 'failed',
  reasonCode: 'throttled',
};

// @ts-expect-error A failed check requires a reason code.
const failedWithoutReason: SubscriptionWriteAccessFailedDocumentV1 = { ...failed, reasonCode: undefined };

const completeMissingCapability: SubscriptionWriteAccessCompleteDocumentV1 = {
  ...complete,
  // @ts-expect-error A complete check must list every known capability.
  capabilities: { advisorDismissSync: { status: 'available' } },
};

const documents: SubscriptionWriteAccessDocumentV1[] = [complete, failed];
const mask: number = KNOWN_WRITE_PERMISSION_MASK;
const usable: boolean = hasEffectiveWritePermission(checked.effectiveWriteBitmask, WritePermission.ResourceScheduling);
const valid: boolean = isSubscriptionWriteAccessDocumentV1(complete);

export const subscriptionWriteAccessContractExamples = {
  unchecked,
  checkedAccount,
  checkedCompanySubscription,
  invalidBitmaskType,
  newBits,
  allKeys,
  schedulingBit,
  invalidKey,
  invalidStatus,
  failedWithoutReason,
  completeMissingCapability,
  documents,
  mask,
  usable,
  valid,
};
