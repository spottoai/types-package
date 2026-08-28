import type { ArtifactGeneration } from '../common/artifactGeneration';
import type { AvailableOwnerFinancialScopeBaselineV2 } from './financialScopeBaseline';
export declare const FINANCIAL_SAVINGS_AUTHORITY_SCHEMA_VERSION_V1: 1;
export declare const FINANCIAL_SAVINGS_AUTHORITY_CONTRACT_VERSION_V1: "financial-savings-authority/v1";
export declare const FINANCIAL_SAVINGS_RESOURCE_PROJECTION_CONTRACT_VERSION_V1: "financial-savings-resource-projection/v1";
export type FinancialSavingsUnavailableReasonV1 = 'scenario-coverage-unproven' | 'unmigrated-scenario-producer' | 'projection-unavailable' | 'activation-unavailable' | 'allocation-unavailable';
export declare const FINANCIAL_ELIGIBILITY_ASSESSMENT_SCHEMA_VERSION_V1: 1;
export declare const FINANCIAL_ELIGIBILITY_ASSESSMENT_CONTRACT_VERSION_V1: "financial-eligibility-assessment/v1";
export type FinancialEligibilityBenefitKindV1 = 'savings-plan' | 'reservation' | 'licence' | 'other';
export type FinancialEligibilityUnavailableReasonV1 = 'rule-evidence-unavailable' | 'eligibility-baseline-unavailable' | 'eligible-components-unavailable' | 'denominator-unavailable' | 'current-baseline-mapping-unavailable' | 'currency-conflict' | 'reconciliation-failure';
interface FinancialEligibilityAssessmentCommonV1 {
    schemaVersion: typeof FINANCIAL_ELIGIBILITY_ASSESSMENT_SCHEMA_VERSION_V1;
    contractVersion: typeof FINANCIAL_ELIGIBILITY_ASSESSMENT_CONTRACT_VERSION_V1;
    eligibilityId: string;
    provider: 'azure';
    providerAccountRefs: [string, ...string[]];
    scopeId: string;
    scenarioId: string;
    benefitKind: FinancialEligibilityBenefitKindV1;
    ruleVersion: string;
    evaluatedAt: string;
}
export interface AvailableFinancialEligibilityAssessmentV1 extends FinancialEligibilityAssessmentCommonV1 {
    status: 'available';
    ruleEvidenceRefId: string;
    eligibilityBaselineId: string;
    denominator: {
        denominatorId: string;
        kind: 'eligible-spend';
        componentIds: [string, ...string[]];
        amount: string;
        currencyCode: string;
    };
    eligibleComponentIds: [string, ...string[]];
    excludedComponentIds: string[];
    currentBaselineMapping: {
        currentBaselineId: string;
        compatibility: 'compatible';
        mappings: [
            {
                currentComponentId: string;
                eligibilityComponentIds: [string, ...string[]];
            },
            ...Array<{
                currentComponentId: string;
                eligibilityComponentIds: [string, ...string[]];
            }>
        ];
    };
}
export interface UnavailableFinancialEligibilityAssessmentV1 extends FinancialEligibilityAssessmentCommonV1 {
    status: 'unavailable';
    ruleEvidenceRefId?: string;
    unavailableReason: FinancialEligibilityUnavailableReasonV1;
    eligibilityBaselineId?: string;
}
export type FinancialEligibilityAssessmentV1 = AvailableFinancialEligibilityAssessmentV1 | UnavailableFinancialEligibilityAssessmentV1;
export type FinancialEligibilityAssessmentIdentityPreimageV1 = Omit<AvailableFinancialEligibilityAssessmentV1, 'eligibilityId'> | Omit<UnavailableFinancialEligibilityAssessmentV1, 'eligibilityId'>;
export type FinancialSavingsDenominatorKindV1 = 'eligible-spend' | 'projection-affected-current';
/** Canonical identity of the exact monetary subset used by a savings calculation. */
export interface FinancialSavingsDenominatorIdentityPreimageV1 {
    kind: FinancialSavingsDenominatorKindV1;
    baselineId: string;
    componentIds: [string, ...string[]];
    amount: string;
    currencyCode: string;
}
export type FinancialSavingsEligibilityReferenceV1 = {
    kind: 'not-applicable';
} | {
    kind: 'unavailable';
    reason: FinancialEligibilityUnavailableReasonV1;
} | {
    kind: 'mapped';
    eligibilityId: string;
    eligibilityBaselineId: string;
    currentComponentIds: [string, ...string[]];
    eligibilityComponentIds: [string, ...string[]];
};
export type FinancialSavingsActivationResultV1 = 'included' | 'excluded' | 'unavailable';
export type FinancialSavingsLifecycleStateV1 = 'Active' | 'Prioritized' | 'Dismissed' | 'Archived' | 'Implementing' | 'Implemented' | 'Failed' | 'Unrecognized';
export type FinancialSavingsActivationReasonV1 = 'active' | 'prioritized' | 'dismissal-expired' | 'implementing' | 'failed' | 'archived' | 'implemented' | 'dismissed-active' | 'lifecycle-stale' | 'lifecycle-unavailable' | 'lifecycle-conflict' | 'unrecognized-lifecycle' | 'generation-mismatch' | 'projection-unavailable' | 'eligibility-unavailable';
export interface FinancialSavingsActivationV1 {
    activationId: string;
    /** Producer-unique scenario identity used to bind the Financial Projection. */
    scenarioId: string;
    /** Customer-facing recommendation lifecycle identity represented by the scenario. */
    recommendationId: string;
    /** Required when included; optional when lifecycle or financial evidence excludes/unavailable the scenario. */
    projectionId?: string;
    lifecycleState: FinancialSavingsLifecycleStateV1;
    lifecycleVersion: string;
    lifecycleEvidenceRefId: string;
    result: FinancialSavingsActivationResultV1;
    reason: FinancialSavingsActivationReasonV1;
    evaluatedAt: string;
    policyVersion: string;
}
export type FinancialSavingsActivationIdentityPreimageV1 = Omit<FinancialSavingsActivationV1, 'activationId'>;
/** One active, exact allocation. Monetary values cross the minor-unit boundary exactly once here. */
export interface FinancialSavingsAllocationV1 {
    allocationId: string;
    ownerScopeId: string;
    billableComponentIds: [string, ...string[]];
    scenarioId: string;
    recommendationId: string;
    baselineId: string;
    projectionId: string;
    denominatorId: string;
    eligibility: FinancialSavingsEligibilityReferenceV1;
    activationId: string;
    savingsMinorUnits: number;
}
export type FinancialSavingsAllocationIdentityPreimageV1 = Omit<FinancialSavingsAllocationV1, 'allocationId'>;
/** Producer-computed resource contribution. Consumers never rebuild it from allocations. */
export interface FinancialSavingsResourceContributionV1 {
    ownerScopeId: string;
    allocationIds: [string, ...string[]];
    savingsMinorUnits: number;
}
/** Producer-owned recommendation attribution within one canonical owner. */
export interface FinancialSavingsOwnerRecommendationContributionV1 {
    ownerScopeId: string;
    recommendationId: string;
    allocationIds: [string, ...string[]];
    savingsMinorUnits: number;
}
export interface AvailableFinancialSavingsCoordinateV1 {
    status: 'available';
    coordinateId: string;
    currentAggregateBaselineId: string;
    accountingCurrencyCode: string;
    minorUnitScale: number;
    roundingMode: 'half-away-from-zero';
    scenarioCoverage: {
        status: 'complete';
        evidenceRefId: string;
        scenarioIds: string[];
    };
    activations: FinancialSavingsActivationV1[];
    allocations: FinancialSavingsAllocationV1[];
    resourceContributions: FinancialSavingsResourceContributionV1[];
    recommendationContributions: FinancialSavingsOwnerRecommendationContributionV1[];
    aggregate: {
        allocationIds: string[];
        savingsMinorUnits: number;
    };
}
export interface PartialFinancialSavingsCoordinateV1 extends Omit<AvailableFinancialSavingsCoordinateV1, 'status' | 'scenarioCoverage'> {
    status: 'partial';
    scenarioCoverage: {
        status: 'partial';
        evidenceRefId: string;
        scenarioIds: string[];
    };
}
export interface UnavailableFinancialSavingsCoordinateV1 {
    status: 'unavailable';
    coordinateId: string;
    currentAggregateBaselineId?: string;
    unavailableReason: FinancialSavingsUnavailableReasonV1;
}
export type FinancialSavingsCoordinateEnvelopeV1 = AvailableFinancialSavingsCoordinateV1 | PartialFinancialSavingsCoordinateV1 | UnavailableFinancialSavingsCoordinateV1;
/** Savings authority paired one-to-one with every coordinate in a Financial Authority view. */
export interface FinancialSavingsAuthorityV1 {
    schemaVersion: typeof FINANCIAL_SAVINGS_AUTHORITY_SCHEMA_VERSION_V1;
    contractVersion: typeof FINANCIAL_SAVINGS_AUTHORITY_CONTRACT_VERSION_V1;
    savingsAuthorityId: string;
    financialAuthorityId: string;
    artifactGeneration: ArtifactGeneration;
    eligibilityBaselines: AvailableOwnerFinancialScopeBaselineV2[];
    eligibilityAssessments: FinancialEligibilityAssessmentV1[];
    coordinates: [FinancialSavingsCoordinateEnvelopeV1, ...FinancialSavingsCoordinateEnvelopeV1[]];
}
export type FinancialSavingsAuthorityIdentityPreimageV1 = Omit<FinancialSavingsAuthorityV1, 'savingsAuthorityId'>;
export interface AvailableFinancialSavingsResourceCoordinateV1 {
    status: 'available';
    coordinateId: string;
    currentAggregateBaselineId: string;
    accountingCurrencyCode: string;
    minorUnitScale: number;
    roundingMode: 'half-away-from-zero';
    resourceContribution?: FinancialSavingsResourceContributionV1;
    recommendationContributions: FinancialSavingsOwnerRecommendationContributionV1[];
}
/** Proven resource contributions retained with explicit scenario gaps. */
export interface PartialFinancialSavingsResourceCoordinateV1 extends Omit<AvailableFinancialSavingsResourceCoordinateV1, 'status'> {
    status: 'partial';
    unavailableScenarioIds: [string, ...string[]];
}
export type FinancialSavingsResourceCoordinateEnvelopeV1 = AvailableFinancialSavingsResourceCoordinateV1 | PartialFinancialSavingsResourceCoordinateV1 | UnavailableFinancialSavingsCoordinateV1;
/** Compact, non-additive API projection for one canonical savings owner. */
export interface FinancialSavingsResourceProjectionV1 {
    contractVersion: typeof FINANCIAL_SAVINGS_RESOURCE_PROJECTION_CONTRACT_VERSION_V1;
    savingsAuthorityId: string;
    financialAuthorityId: string;
    artifactGeneration: ArtifactGeneration;
    scopeId: string;
    coordinates: [FinancialSavingsResourceCoordinateEnvelopeV1, ...FinancialSavingsResourceCoordinateEnvelopeV1[]];
}
export {};
//# sourceMappingURL=financialSavingsAuthority.d.ts.map