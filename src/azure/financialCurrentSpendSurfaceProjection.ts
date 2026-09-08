import type { ArtifactGeneration } from '../common/artifactGeneration';
import type { CostBasis, FinancialEstimateLensV1 } from './costComposition';
import type { FinancialChargeInclusionPolicyRefV2, FinancialWindowKindV2 } from './financialScopeBaseline';
import type { FinancialEvidenceIntervalV1 } from './financialScopeEvidence';

export const FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_SCHEMA_VERSION_V1 = 1 as const;
export const FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_CONTRACT_VERSION_V1 =
  'financial-current-spend-surface-projection/v1' as const;

/** Exact requested/observed boundary without baseline coverage members or evidence references. */
export interface FinancialSurfacePeriodV1 {
  windowKind: FinancialWindowKindV2;
  requested: FinancialEvidenceIntervalV1;
  observed?: FinancialEvidenceIntervalV1;
  providerBillingPeriodId?: string;
}

export interface FinancialSurfaceCoordinateDefinitionV1 {
  coordinateId: string;
  periodRole: 'current-spend' | 'comparison' | 'analytics-input' | 'projection-target';
  period: FinancialSurfacePeriodV1;
  costBasis: CostBasis;
  estimateLens: FinancialEstimateLensV1;
  chargeInclusionPolicyRef: FinancialChargeInclusionPolicyRefV2;
  requestedCurrencyCode?: string;
}

export type FinancialSurfaceCoordinateIdentityPreimageV1 = Omit<FinancialSurfaceCoordinateDefinitionV1, 'coordinateId'>;

export interface AvailableFinancialSurfaceMoneyV1 {
  status: 'available';
  amount: string;
  currencyCode: string;
  completeness: 'complete';
  excludedAmount: string;
  withheldAmount: string;
  knownAmount?: never;
  reasonCodes?: never;
}

export interface PartialFinancialSurfaceMoneyV1 {
  status: 'partial';
  knownAmount: string;
  currencyCode: string;
  completeness: 'partial';
  excludedAmount: string;
  withheldAmount: string;
  reasonCodes: [string, ...string[]];
  amount?: never;
}

export interface UnavailableFinancialSurfaceMoneyV1 {
  status: 'unavailable';
  completeness: 'unavailable';
  reasonCodes: [string, ...string[]];
  amount?: never;
  knownAmount?: never;
  currencyCode?: never;
  excludedAmount?: never;
  withheldAmount?: never;
}

export type FinancialSurfaceMoneyV1 =
  | AvailableFinancialSurfaceMoneyV1
  | PartialFinancialSurfaceMoneyV1
  | UnavailableFinancialSurfaceMoneyV1;

export type FinancialCurrentSpendSurfaceCoordinateV1 = FinancialSurfaceCoordinateDefinitionV1 & {
  /** Exact producer composition identity retained for forecast/trend evidence binding. */
  currentSpendCompositionId: string;
  value: FinancialSurfaceMoneyV1;
};

export interface FinancialCurrentSpendSurfaceProjectionV1 {
  schemaVersion: typeof FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_SCHEMA_VERSION_V1;
  contractVersion: typeof FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_CONTRACT_VERSION_V1;
  projectionId: string;
  provider: 'azure';
  providerAccountRefs: [string, ...string[]];
  artifactGeneration: ArtifactGeneration;
  financialAuthorityId: string;
  scope: {
    kind: 'subscription' | 'resource-group' | 'tag-scope' | 'multi-subscription';
    scopeId: string;
    scopeFingerprint: string;
  };
  coordinates: [FinancialCurrentSpendSurfaceCoordinateV1, ...FinancialCurrentSpendSurfaceCoordinateV1[]];
}

export type FinancialCurrentSpendSurfaceProjectionIdentityPreimageV1 = Omit<
  FinancialCurrentSpendSurfaceProjectionV1,
  'projectionId'
>;
