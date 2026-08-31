import type { ArtifactGeneration } from '../common/artifactGeneration';
import type { CostBasis, EstimateLens } from './costComposition';
import type { FinancialBaselinePeriodV2, FinancialChargeInclusionPolicyRefV2 } from './financialScopeBaseline';
import type { FinancialSavingsUnavailableReasonV1 } from './financialSavingsAuthority';

export const FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1 = 1 as const;
export const FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1 = 'financial-savings-surface-projection/v1' as const;

export type FinancialSavingsSurfaceV1 = 'recommendations' | 'resources' | 'dashboard';

export const FINANCIAL_SAVINGS_QUERY_SELECTION_CONTRACT_VERSION_V1 = 'financial-savings-query-selection/v1' as const;

/**
 * Non-monetary query membership selected by an authorized transport. The UI
 * Financial Domain applies this membership to a producer-owned full projection
 * through the shared Kernel; the API never composes financial totals.
 */
export interface FinancialSavingsQuerySelectionV1 {
  contractVersion: typeof FINANCIAL_SAVINGS_QUERY_SELECTION_CONTRACT_VERSION_V1;
  filterFingerprint: string;
  recommendationIds: string[];
}

export const FINANCIAL_SAVINGS_RESOURCE_QUERY_SELECTION_CONTRACT_VERSION_V1 =
  'financial-savings-resource-query-selection/v1' as const;

/** Non-monetary canonical allocation membership selected by a resource query. */
export interface FinancialSavingsResourceQuerySelectionV1 {
  contractVersion: typeof FINANCIAL_SAVINGS_RESOURCE_QUERY_SELECTION_CONTRACT_VERSION_V1;
  filterFingerprint: string;
  allocationIds: string[];
  recommendationIds: string[];
}

export type FinancialSavingsSurfaceScopeV1 =
  | { kind: 'subscription-full' }
  | {
      kind: 'recommendation-query';
      filterFingerprint: string;
      /** Complete matched recommendation set before sorting and pagination. */
      recommendationIds: string[];
    }
  | {
      kind: 'resource-query';
      filterFingerprint: string;
      /** Complete canonical allocation set owned by matched resources before pagination. */
      allocationIds: string[];
      recommendationIds: string[];
    };

export interface FinancialSavingsAllocationContributionV1 {
  allocationId: string;
  savingsMinorUnits: number;
}

export interface FinancialSavingsRecommendationContributionV1 {
  recommendationId: string;
  allocationIds: [string, ...string[]];
  savingsMinorUnits: number;
  /**
   * Exact allocation amounts retained so resource membership can be composed
   * without approximation. Optional only for V1 projections produced before
   * resource-query composition was introduced; resource-query projection
   * fails closed when this evidence is absent.
   */
  allocations?: [FinancialSavingsAllocationContributionV1, ...FinancialSavingsAllocationContributionV1[]];
}

/**
 * Non-monetary lifecycle membership retained with a full savings surface.
 * It lets a reader invalidate an immutable projection when a resource-scoped
 * recommendation changes state without reading or recomputing financial data.
 */
export interface FinancialSavingsLifecycleBindingV1 {
  resourceId: string;
  recommendationId: string;
  allocationIds: [string, ...string[]];
}

interface FinancialSavingsSurfaceCoordinateCommonV1 {
  /** Identity of the exact source Financial Authority coordinate. */
  coordinateId: string;
  periodRole: 'current' | 'previous';
  period: FinancialBaselinePeriodV2;
  costBasis: CostBasis;
  estimateLens: EstimateLens;
  /** Exact charge scope inherited from the current Financial Authority baseline. */
  chargeInclusionPolicyRef: FinancialChargeInclusionPolicyRefV2;
  requestedCurrencyCode?: string;
  currentAggregateBaselineId?: string;
}

export interface AvailableFinancialSavingsSurfaceCoordinateV1 extends FinancialSavingsSurfaceCoordinateCommonV1 {
  status: 'available';
  currentAggregateBaselineId: string;
  currentAggregate: {
    amount: string;
    currencyCode: string;
  };
  accountingCurrencyCode: string;
  minorUnitScale: number;
  roundingMode: 'half-away-from-zero';
  recommendationContributions: FinancialSavingsRecommendationContributionV1[];
  aggregate: {
    allocationIds: string[];
    savingsMinorUnits: number;
  };
}

/** Proven contributions retained while one or more in-scope scenarios lack target evidence. */
export interface PartialFinancialSavingsSurfaceCoordinateV1
  extends Omit<AvailableFinancialSavingsSurfaceCoordinateV1, 'status'> {
  status: 'partial';
  unavailableRecommendationIds: [string, ...string[]];
}

export interface UnavailableFinancialSavingsSurfaceCoordinateV1 extends FinancialSavingsSurfaceCoordinateCommonV1 {
  status: 'unavailable';
  unavailableReason: FinancialSavingsUnavailableReasonV1;
}

export type FinancialSavingsSurfaceCoordinateEnvelopeV1 =
  | AvailableFinancialSavingsSurfaceCoordinateV1
  | PartialFinancialSavingsSurfaceCoordinateV1
  | UnavailableFinancialSavingsSurfaceCoordinateV1;

export interface FinancialSavingsSurfaceProjectionV1 {
  schemaVersion: typeof FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1;
  contractVersion: typeof FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1;
  projectionId: string;
  surface: FinancialSavingsSurfaceV1;
  scope: FinancialSavingsSurfaceScopeV1;
  provider: 'azure';
  providerAccountRefs: [string, ...string[]];
  artifactGeneration: ArtifactGeneration;
  financialAuthorityId: string;
  savingsAuthorityId: string;
  /** Optional for pre-binding V1 artifacts; readers fail savings closed when required evidence is absent. */
  lifecycleBindings?: [FinancialSavingsLifecycleBindingV1, ...FinancialSavingsLifecycleBindingV1[]];
  coordinates: [FinancialSavingsSurfaceCoordinateEnvelopeV1, ...FinancialSavingsSurfaceCoordinateEnvelopeV1[]];
}

export type FinancialSavingsSurfaceProjectionIdentityPreimageV1 = Omit<FinancialSavingsSurfaceProjectionV1, 'projectionId'>;
