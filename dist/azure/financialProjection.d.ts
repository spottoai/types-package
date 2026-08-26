export declare const FINANCIAL_PROJECTION_SCHEMA_VERSION_V1: 1;
export declare const FINANCIAL_PROJECTION_CONTRACT_VERSION_V1: "financial-projection/v1";
export type FinancialProjectionOperationKindV1 = 'replace-rate' | 'replace-quantity' | 'remove-component' | 'schedule-quantity' | 'commitment-coverage';
export type FinancialProjectionTargetProvenanceV1 = 'retail-derived' | 'provider-quote-derived' | 'billing-backed' | 'estimated' | 'configuration-derived';
export type FinancialProjectionTargetPeriodConventionV1 = 'same-observed-quantity' | 'same-period-quantity' | 'normalized-average-month';
export interface FinancialProjectionNormalizedAverageMonthV1 {
    kind: 'normalized-average-month';
    annualDayCount: 365;
    monthDivisor: 12;
    hoursPerDay: 24;
    normalizedHours: '730';
}
export interface FinancialProjectionObservedPeriodProfileV1 {
    kind: 'observed-period';
    dayCount: number;
    hoursPerDay: 24;
    hourCount: string;
    currencyMinorUnitScale: number;
    roundingMode: 'half-even';
}
export type FinancialProjectionTargetPeriodProfileV1 = FinancialProjectionNormalizedAverageMonthV1 | FinancialProjectionObservedPeriodProfileV1;
interface FinancialProjectionRequestCommonV1 {
    schemaVersion: typeof FINANCIAL_PROJECTION_SCHEMA_VERSION_V1;
    contractVersion: typeof FINANCIAL_PROJECTION_CONTRACT_VERSION_V1;
    provider: 'azure';
    providerAccountRefs: [string, ...string[]];
    scopeId: string;
    scenarioId: string;
    operationKind: FinancialProjectionOperationKindV1;
    baselineCostBasis: 'billed' | 'amortized';
    baselineEstimateLens: 'actual-only' | 'actual-plus-estimated' | 'estimates-only';
    targetCostBasis: 'billed' | 'amortized';
    targetProvenance: FinancialProjectionTargetProvenanceV1;
    targetPeriodConvention: FinancialProjectionTargetPeriodConventionV1;
    targetPeriodProfile?: FinancialProjectionTargetPeriodProfileV1;
}
export interface FinancialProjectionAmountsV1 {
    total: string;
    affected: string;
    unchanged: string;
}
export interface FinancialProjectionChangeV1 {
    /** Signed target minus current amount. */
    delta: string;
    /** Non-negative current minus target amount; zero for increases. */
    savings: string;
    /** Non-negative target minus current amount; zero for savings. */
    increase: string;
}
interface FinancialProjectionAppliedComponentTargetCommonV1 {
    componentId: string;
    targetAmount: string;
    targetConfigurationId: string;
    targetEvidenceRefIds: [string, ...string[]];
}
export interface FinancialProjectionCommitmentQuoteV1 {
    kind: 'whole-term';
    amount: string;
    currencyCode: string;
    termMonths: number;
    termDayCount: number;
}
export interface FinancialProjectionCommitmentCoverageV1 {
    instrumentKind: 'reservation';
    productId: string;
    quote: FinancialProjectionCommitmentQuoteV1;
    purchaseQuantity: string;
    eligibleQuantity: {
        amount: string;
        unit: string;
    };
    existingCoveredQuantity: {
        amount: string;
        unit: string;
    };
    coveredQuantity: {
        amount: string;
        unit: string;
    };
    commitmentCharge: {
        amount: string;
        currencyCode: string;
    };
    uncoveredQuantity: {
        amount: string;
        unit: string;
    };
    uncoveredRate: {
        amount: string;
        currencyCode: string;
        quantityUnit: string;
    };
    uncoveredRemainderRule: 'billing-derived-effective-rate';
    effectivePeriod: {
        startDate: string;
        endDateExclusive: string;
        dateBasis: 'utc' | 'billing-calendar';
    };
}
export type FinancialProjectionAppliedComponentTargetV1 = FinancialProjectionAppliedComponentTargetCommonV1 & ({
    sourceQuantity: {
        amount: string;
        unit: string;
    };
    targetRate: {
        amount: string;
        currencyCode: string;
        quantityUnit: string;
    };
} | {
    sourceRate: {
        amount: string;
        unit: string;
        currencyCode: string;
    };
    targetQuantity: {
        amount: string;
        unit: string;
    };
} | {
    targetAmount: '0';
    configurationTransformation: {
        kind: 'remove-component';
        targetQuantity: {
            amount: '0';
            unit: string;
        };
        ruleEvidenceRefId: string;
    };
} | {
    commitmentCoverage: FinancialProjectionCommitmentCoverageV1;
});
export interface AvailableFinancialProjectionV1 extends FinancialProjectionRequestCommonV1 {
    status: 'available';
    affectedComponentIds: [string, ...string[]];
    /** Exact source and target inputs actually applied to every affected component. */
    appliedComponentTargets: [FinancialProjectionAppliedComponentTargetV1, ...FinancialProjectionAppliedComponentTargetV1[]];
    accountingCurrencyCode: string;
    targetEvidenceBundleId: string;
    targetAssessmentId: string;
    baselineId: string;
    projectionId: string;
    current: FinancialProjectionAmountsV1;
    target: FinancialProjectionAmountsV1;
    change: FinancialProjectionChangeV1;
    reconciliation: {
        status: 'reconciled';
        difference: '0';
    };
}
export declare const FINANCIAL_PROJECTION_UNAVAILABLE_REASONS_V1: readonly ["baseline-unavailable", "affected-component-not-found", "target-evidence-unavailable", "target-period-incompatible", "target-basis-incompatible", "target-currency-conflicting", "quantity-unavailable", "rate-unavailable", "reconciliation-failure", "unsupported-operation"];
export type FinancialProjectionUnavailableReasonV1 = (typeof FINANCIAL_PROJECTION_UNAVAILABLE_REASONS_V1)[number];
export interface UnavailableFinancialProjectionV1 extends FinancialProjectionRequestCommonV1 {
    status: 'unavailable';
    unavailableReason: FinancialProjectionUnavailableReasonV1;
    affectedComponentIds: string[];
    accountingCurrencyCode?: string;
    targetEvidenceBundleId?: string;
    targetAssessmentId?: string;
    baselineId?: string;
    appliedComponentTargets?: never;
    projectionId?: never;
    current?: never;
    target?: never;
    change?: never;
    reconciliation?: never;
}
export type FinancialProjectionEnvelopeV1 = AvailableFinancialProjectionV1 | UnavailableFinancialProjectionV1;
export type FinancialProjectionIdentityPreimageV1 = Omit<AvailableFinancialProjectionV1, 'status' | 'projectionId' | 'current' | 'target' | 'change' | 'reconciliation'>;
export {};
//# sourceMappingURL=financialProjection.d.ts.map