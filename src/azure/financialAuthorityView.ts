import type { ArtifactGeneration } from '../common/artifactGeneration';
import type { CostBasis, EstimateLens } from './costComposition';
import type { FinancialProjectionEnvelopeV1 } from './financialProjection';
import type { FinancialBaselinePeriodV2, FinancialScopeBaselineEnvelopeV2 } from './financialScopeBaseline';
import type { FinancialEvidenceAssessmentV1, FinancialEvidenceBundleV1 } from './financialScopeEvidence';
import type { FinancialAuthorityComponentDescriptorV1, FinancialDisplayRollupV1 } from './financialDisplayRollup';

export const FINANCIAL_AUTHORITY_VIEW_SCHEMA_VERSION_V1 = 1 as const;
export const FINANCIAL_AUTHORITY_VIEW_CONTRACT_VERSION_V1 = 'financial-authority-view/v1' as const;

/** Complete resource-inventory ownership coverage for this authority. */
export interface FinancialAuthorityScopeCoverageV1 {
  /** Normalized Azure resource type, for example `microsoft.compute/virtualmachines`. */
  resourceType: string;
  /**
   * Whether this inventory scope is additive, positively known to be
   * display-only, or still lacks enough ownership evidence to classify.
   */
  financialRole: 'owner' | 'display-only' | 'unclassified';
  scopeIds: [string, ...string[]];
}

/** One exact period, basis, estimate lens, and requested-currency coordinate. */
export interface FinancialAuthorityCoordinateV1 {
  coordinateId: string;
  /** Artifact-relative role; exact boundaries remain authoritative in period. */
  periodRole: 'current' | 'previous';
  period: FinancialBaselinePeriodV2;
  costBasis: CostBasis;
  estimateLens: EstimateLens;
  requestedCurrencyCode?: string;
  /**
   * One projection for every covered inventory scope. Entries whose coverage
   * role is display-only or unclassified must be typed unavailable and are
   * not members of the subscription aggregate.
   */
  ownerBaselines: [FinancialScopeBaselineEnvelopeV2, ...FinancialScopeBaselineEnvelopeV2[]];
  residualBaseline: FinancialScopeBaselineEnvelopeV2;
  aggregateBaseline: FinancialScopeBaselineEnvelopeV2;
  componentDescriptors: FinancialAuthorityComponentDescriptorV1[];
  displayRollups: FinancialDisplayRollupV1[];
  projections: FinancialProjectionEnvelopeV1[];
}

/**
 * The sole customer-facing financial authority embedded in one immutable Portal
 * resources artifact. Consumers validate and select it; they never recompute it.
 */
export interface FinancialAuthorityViewV1 {
  schemaVersion: typeof FINANCIAL_AUTHORITY_VIEW_SCHEMA_VERSION_V1;
  contractVersion: typeof FINANCIAL_AUTHORITY_VIEW_CONTRACT_VERSION_V1;
  authorityId: string;
  provider: 'azure';
  providerAccountRefs: [string, ...string[]];
  artifactGeneration: ArtifactGeneration;
  billingGenerationId: string;
  scopeCoverage: [FinancialAuthorityScopeCoverageV1, ...FinancialAuthorityScopeCoverageV1[]];
  evidenceBundles: FinancialEvidenceBundleV1[];
  evidenceAssessments: [FinancialEvidenceAssessmentV1, ...FinancialEvidenceAssessmentV1[]];
  coordinates: [FinancialAuthorityCoordinateV1, ...FinancialAuthorityCoordinateV1[]];
}

export const FINANCIAL_AUTHORITY_RESOURCE_PROJECTION_CONTRACT_VERSION_V1 = 'financial-authority-resource-projection/v1' as const;

/** Compact, non-additive API projection of one scope from the canonical authority. */
export interface FinancialAuthorityResourceCoordinateV1 {
  coordinateId: string;
  periodRole: 'current' | 'previous';
  period: FinancialBaselinePeriodV2;
  costBasis: CostBasis;
  estimateLens: EstimateLens;
  requestedCurrencyCode?: string;
  ownerBaseline: FinancialScopeBaselineEnvelopeV2;
  componentDescriptors: FinancialAuthorityComponentDescriptorV1[];
  displayRollups: FinancialDisplayRollupV1[];
  projections: FinancialProjectionEnvelopeV1[];
}

export interface FinancialAuthorityResourceProjectionV1 {
  contractVersion: typeof FINANCIAL_AUTHORITY_RESOURCE_PROJECTION_CONTRACT_VERSION_V1;
  authorityId: string;
  provider: 'azure';
  providerAccountRefs: [string, ...string[]];
  artifactGeneration: ArtifactGeneration;
  billingGenerationId: string;
  resourceType: string;
  financialRole: FinancialAuthorityScopeCoverageV1['financialRole'];
  scopeId: string;
  evidenceBundles: FinancialEvidenceBundleV1[];
  evidenceAssessments: FinancialEvidenceAssessmentV1[];
  coordinates: [FinancialAuthorityResourceCoordinateV1, ...FinancialAuthorityResourceCoordinateV1[]];
}

export type FinancialAuthorityCoordinateIdentityPreimageV1 = Omit<FinancialAuthorityCoordinateV1, 'coordinateId'>;
export type FinancialAuthorityViewIdentityPreimageV1 = Omit<FinancialAuthorityViewV1, 'authorityId'>;
