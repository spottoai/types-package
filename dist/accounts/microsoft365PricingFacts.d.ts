/** Price-independent full-population evidence. No account identifiers or raw reports. */
export interface Microsoft365PricingEdge {
    skuId: string;
    /** Stable target identity, when the reviewed catalogue uniquely resolves it. Older snapshots omit it. */
    targetSkuId?: string | null;
    /** Null means removal without a replacement product. */
    targetSkuPartNumber: string | null;
    count: number;
}
export interface Microsoft365PricingGroupFacts {
    key: string;
    label: string;
    licensedAccountCount: number;
    paidSeatCount: number;
    reviewAccountCount: number;
    /** Allocatable paid assignments, including products with no reference market price. */
    unitsBySku: Record<string, number>;
    /** Full-account reviews take precedence over finding review contributions. */
    fullReviewUnitsBySku: Record<string, number>;
    /** Findings only from accounts without a full-account review. */
    findingReviewEdges: (Microsoft365PricingEdge & {
        kind: 'overlap' | 'downgrade';
    })[];
}
export declare const MICROSOFT_365_PRICING_FACT_GROUP_LIMIT = 10000;
export declare const MICROSOFT_365_PRICING_FACT_CONTRIBUTION_LIMIT = 100000;
export interface Microsoft365PricingFacts {
    /** Overflow retains reference-ranked named groups and a quantity-complete Other tail. */
    groupRanking?: 'reference_price';
    /** Reviewed catalogue identities allow agreed rates for products not held yet. No grant/pricing eligibility is inferred. */
    targetProducts?: {
        skuId: string;
        skuPartNumber: string;
        productName: string;
        referencePrices: Record<string, number | null>;
    }[];
    schemaVersion: 'microsoft-365-pricing-facts/v1';
    /** Availability is independent of whether the original market contained a unit price. */
    evidence: {
        inventoryKnown: boolean;
        usersKnown: boolean;
        signInsKnown: boolean;
        overlapKnown: boolean;
        downgradeKnown: boolean;
        ambiguousPaidAllocation: boolean;
        /** Producer captured review and group quantities for products without a reference price. Older snapshots omit this. */
        unpricedQuantitiesKnown?: true;
        /** Producer counted disabled/inactive/no-Office account unions across paid AND unpriced chargeable products. Older snapshots omit this. */
        chargeableAccountCountsKnown?: true;
    };
    products: {
        skuId: string;
        noOfficeActivityUnits: number | null;
    }[];
    noOfficeActivityAccountCount: number | null;
    downgradeEdges: Microsoft365PricingEdge[];
    /** Reference monthly annual-commitment rates, excluding tax, for non-inventory targets. */
    targetUnitPrices: Record<string, Record<string, number | null>>;
    /** Absent in history. All groups are retained before monetary top-25 ranking. */
    groups?: Record<'domain' | 'department' | 'country', Microsoft365PricingGroupFacts[]>;
    groupsUnavailableReason?: 'group_limit_exceeded' | 'contribution_limit_exceeded';
}
/** Bounds sparse contributions independently from the bounded people artifact. */
export declare function isMicrosoft365PricingFacts(value: unknown): value is Microsoft365PricingFacts;
//# sourceMappingURL=microsoft365PricingFacts.d.ts.map