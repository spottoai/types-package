import type { CostBasis, FinancialEstimateLensV1 } from './costComposition';
import type { FinancialEvidenceIntervalV1 } from './financialScopeEvidence';
import type { FinancialChargeInclusionPolicyRefV2, FinancialWindowKindV2 } from './financialScopeBaseline';
import type { FinancialChargeSelectionV1 } from './financialChargeComposition';

export const FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1 = 1 as const;
export const FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1 = 'current-spend-composition/v1' as const;

export type FinancialDataflowScopeKindV1 = 'resource' | 'resource-group' | 'subscription' | 'tag-scope' | 'multi-subscription';
export type FinancialDataflowPeriodRoleV1 = 'current-spend' | 'comparison' | 'analytics-input' | 'projection-target';

/** Stable period identity. Result-specific observed coverage and gaps live in evidence artifacts, not the coordinate ID. */
export interface FinancialDataflowPeriodV1 {
  windowKind: FinancialWindowKindV2;
  requested: FinancialEvidenceIntervalV1;
  providerBillingPeriodId?: string;
}

export interface FinancialDataflowScopeV1 {
  kind: FinancialDataflowScopeKindV1;
  scopeId: string;
  /** Digest of normalized membership and selector semantics, not a display label. */
  scopeFingerprint: string;
}

/** Stored-byte descriptor shared by immutable financial delivery manifests. */
export interface FinancialDataflowJsonGzipArtifactDescriptorV1 {
  path: string;
  sha256: string;
  byteCount: number;
  mediaType: 'application/json';
  contentEncoding: 'gzip';
}

export interface FinancialDataflowTagSelectorV1 {
  key: string;
  value: string;
}

export type FinancialDataflowScopeSelectorV1 =
  | { kind: 'resource'; resourceIds: [string, ...string[]] }
  | { kind: 'resource-group'; resourceGroupIds: [string, ...string[]] }
  | { kind: 'subscription'; subscriptionIds: [string, ...string[]] }
  | { kind: 'tag-scope'; tags: [FinancialDataflowTagSelectorV1, ...FinancialDataflowTagSelectorV1[]]; tagMatch: 'any' | 'all' }
  | { kind: 'multi-subscription'; subscriptionIds: [string, ...string[]] };

export type FinancialAccountingCurrencyStateV1 =
  | { status: 'resolved'; currencyCode: string }
  | { status: 'unresolved'; reasonCode: 'currency-unresolved' | 'currency-conflicting'; currencyCode?: never };

/** Exact identity dimensions shared by current spend, analytics, and policy inputs. */
export interface FinancialDataflowCoordinateV1 {
  companyId: string;
  provider: 'azure';
  providerAccountRefs: [string, ...string[]];
  scope: FinancialDataflowScopeV1;
  periodRole: FinancialDataflowPeriodRoleV1;
  period: FinancialDataflowPeriodV1;
  costBasis: CostBasis;
  estimateLens: FinancialEstimateLensV1;
  /** Requested presentation currency. A resolved coordinate must resolve to this currency; this never implies FX conversion. */
  requestedCurrencyCode?: string;
  accountingCurrency: FinancialAccountingCurrencyStateV1;
  /** Registered, digest-bound policy that changes current-spend and downstream result identity. */
  chargeInclusionPolicyRef: FinancialChargeInclusionPolicyRefV2;
}

export interface IncludedCurrentSpendMemberV1 {
  memberScopeId: string;
  baselineId: string;
  chargeCompositionId: string;
  status: 'included';
  reasonCode?: never;
}

export interface UnavailableCurrentSpendMemberV1 {
  memberScopeId: string;
  status: 'unavailable';
  reasonCode: string;
  baselineId?: never;
}

export type CurrentSpendCompositionMemberV1 = IncludedCurrentSpendMemberV1 | UnavailableCurrentSpendMemberV1;

interface CurrentSpendCompositionCommonV1 {
  schemaVersion: typeof FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1;
  contractVersion: typeof FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1;
  compositionId: string;
  coordinate: FinancialDataflowCoordinateV1;
  members: CurrentSpendCompositionMemberV1[];
  membershipDigest: string;
  algorithmVersion: string;
}

export interface AvailableCurrentSpendCompositionV1 extends CurrentSpendCompositionCommonV1 {
  amount: { status: 'available'; amount: string; currencyCode: string; knownAmount?: never; reasonCodes?: never };
  chargeSelection: FinancialChargeSelectionV1;
}

export interface PartialCurrentSpendCompositionV1 extends CurrentSpendCompositionCommonV1 {
  amount: { status: 'partial'; knownAmount: string; currencyCode: string; reasonCodes: [string, ...string[]]; amount?: never };
  chargeSelection: FinancialChargeSelectionV1;
}

export interface UnavailableCurrentSpendCompositionV1 extends CurrentSpendCompositionCommonV1 {
  amount: {
    status: 'unavailable';
    reasonCodes: [string, ...string[]];
    amount?: never;
    knownAmount?: never;
    currencyCode?: never;
  };
  chargeSelection?: never;
}

export type CurrentSpendCompositionV1 = AvailableCurrentSpendCompositionV1 | PartialCurrentSpendCompositionV1 | UnavailableCurrentSpendCompositionV1;

export type CurrentSpendCompositionIdentityPreimageV1 = CurrentSpendCompositionV1 extends infer Composition
  ? Composition extends CurrentSpendCompositionV1
    ? Omit<Composition, 'compositionId'>
    : never
  : never;
