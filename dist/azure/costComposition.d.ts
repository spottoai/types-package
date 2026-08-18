/** Controls whether a financial projection includes actual, estimated, or both source components. */
export type EstimateLens = 'actual-only' | 'actual-plus-estimated' | 'estimates-only';
/** Financial basis kept independent throughout composition and projection. */
export type CostBasis = 'billed' | 'amortized';
/** Reason a supported monetary component cannot be returned. */
export type MoneyUnavailableReason = 'billing-unavailable' | 'not-produced' | 'currency-unresolved' | 'coverage-unproven';
/** Versioned source-independent identity for one billable coverage interval. */
export interface BillableCoverageIdentity {
    schemaVersion: 1;
    identityVersion: string;
    scopeRef: string;
    periodRef: string;
    startDate: string;
    endDateExclusive: string;
    dateBasis: 'utc' | 'billing-calendar' | 'company-local';
    timeZone?: string;
    allocationOwnerResourceId: string;
    billableComponentKey: string;
    meterKey?: string;
    pricingDimensionKey?: string;
}
/** Auditable money value with explicit currency, coverage, and source generations. */
export interface MoneyComponent {
    amount: string;
    currencyCode: string;
    currencyResolutionRef: string;
    coverageRef: string;
    sourceGenerationRefs: string[];
    rowCount: number;
}
/** Money is either present with evidence or absent with a typed reason. */
export type ComponentAvailability = {
    status: 'available';
    component: MoneyComponent;
} | {
    status: 'unavailable';
    reasonCode: MoneyUnavailableReason;
};
/** Declares support independently from current data availability. */
export interface ComponentState {
    support: 'supported' | 'unsupported' | 'unknown';
    availability: ComponentAvailability;
}
/** Links replaced estimate coverage to the actual generation that superseded it. */
export interface SupersessionRef {
    estimatedCoverageRef: string;
    actualSourceGenerationRef: string;
    disposition: 'fully-superseded' | 'partially-superseded';
}
/** Composition for one billed or amortized basis. */
export interface CostBasisComposition {
    basis: CostBasis;
    actual: ComponentState;
    estimated: ComponentState;
    combined: ComponentAvailability;
    status: 'actual-only' | 'actual-plus-estimated' | 'estimated-only' | 'unavailable';
    estimateReason?: 'billing-lag' | 'billing-unavailable-sponsorship' | 'other';
    estimateMethodRef?: string;
    estimateConfidence?: 'high' | 'medium' | 'low' | 'unknown';
    uncertaintyRef?: string;
    supersessionRefs: SupersessionRef[];
}
/** Canonical source composition plus the lens applied by a projection boundary. */
export interface CostComposition {
    schemaVersion: 1;
    compositionId: string;
    coverageIdentity: BillableCoverageIdentity;
    selectedLens: EstimateLens;
    billed: CostBasisComposition;
    amortized: CostBasisComposition;
    coverageCompletenessRef: string;
    allocationRef: string;
}
/** Monetary value safe for customer responses. */
export interface PublicMoneyComponent {
    amount: string;
    currencyCode: string;
}
/** Customer availability omits internal source, coverage, row-count, and reason references. */
export type PublicComponentAvailability = {
    status: 'available';
    component: PublicMoneyComponent;
} | {
    status: 'unavailable';
};
/** Customer support and availability for one actual or estimated component. */
export interface PublicComponentState {
    support: ComponentState['support'];
    availability: PublicComponentAvailability;
}
/** Customer projection for one billed or amortized basis. */
export interface PublicCostBasisComposition {
    basis: CostBasis;
    actual: PublicComponentState;
    estimated: PublicComponentState;
    combined: PublicComponentAvailability;
    status: CostBasisComposition['status'];
    estimateConfidence?: CostBasisComposition['estimateConfidence'];
}
/** Customer-facing cost composition with no authority, identity, generation, or evidence references. */
export interface PublicCostComposition {
    schemaVersion: 1;
    selectedLens: EstimateLens;
    billed: PublicCostBasisComposition;
    amortized: PublicCostBasisComposition;
}
/** Exact dependency-free validator for the public cost-composition boundary. */
export declare const isPublicCostComposition: (value: unknown) => value is PublicCostComposition;
//# sourceMappingURL=costComposition.d.ts.map