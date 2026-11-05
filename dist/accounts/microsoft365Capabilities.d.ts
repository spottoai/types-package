/** Additive, engine-owned capability evidence. Old license snapshots omit these fields. */
export type Microsoft365CapabilityEvidenceState = 'complete' | 'partial' | 'unknown';
export interface Microsoft365CapabilityDefinition {
    id: string;
    name: string;
    group: string;
}
export interface Microsoft365ServicePlanEvidence {
    servicePlanId: string;
    name: string;
    capabilityId: string | null;
    /** Provider provisioning is independent of assignment enablement and deployment. */
    provisioningStatus: string | null;
    appliesTo: string | null;
}
export interface Microsoft365CapabilityComparison {
    priceListVersion?: string;
    priceEvidenceByCurrency?: Record<string, {
        current: Microsoft365CapabilityPriceEvidence;
        target: Microsoft365CapabilityPriceEvidence;
    }>;
    targetSkuId: string;
    targetProductName: string;
    source: 'tenant' | 'publisher';
    addedCapabilityIds: string[];
    lostCapabilityIds: string[];
    /** Unmapped plan differences are not proof of equivalent licensing rights. */
    unverifiedPlanCount: number;
    /** Target minus current monthly retail price per user license, annual commitment excluding tax. Standalone/non-additive; not contract savings or a quantity-scaled total. */
    monthlyRetailDifferenceByCurrency: Record<string, number | null>;
}
/** Constituents of a per-user-license retail comparison, never invoice or contract evidence. */
export interface Microsoft365CapabilityPriceEvidence {
    unitPriceMonthly: number | null;
    confidence: 'verified' | 'reference' | null;
    source: string | null;
    checkedAt: string | null;
}
/** Absent means list prices (engine output). The API sets `agreed` or `mixed` after applying customer prices. */
export type Microsoft365StepUpPriceBasis = 'list' | 'agreed' | 'mixed';
/** One currency of a step-up scenario: monthly per-license amounts, annual commitment, excluding tax. Null is unknown, never zero. */
export interface Microsoft365StepUpMoney {
    priceBasis?: Microsoft365StepUpPriceBasis;
    fromUnitPriceMonthly: number | null;
    toUnitPriceMonthly: number | null;
    toPriceConfidence: 'verified' | 'reference' | null;
    /** Target minus source price for one account. */
    perAccountDifference: number | null;
    /** perAccountDifference × accountCount. */
    grossDifference: number | null;
    /** Priced subset of replaced products: unit price × holders in scope. */
    replacedMonthly: number;
    unpricedReplacedProductCount: number;
    /** grossDifference − replacedMonthly. Conditional; never part of savings totals. */
    netDifference: number | null;
}
export interface Microsoft365StepUpReplacedProduct {
    skuId: string;
    skuPartNumber: string;
    productName: string;
    /** In-scope accounts holding this product. */
    accountCount: number;
    /** `rule`: a curated overlap rule lists the target as covering it. `service_plans`: every plan is in the target. */
    basis: 'rule' | 'service_plans';
    /** Unit price per supported currency; null is unknown. */
    unitPriceMonthlyByCurrency: Record<string, number | null>;
}
export interface Microsoft365StepUpCapabilityGain {
    capabilityId: string;
    /** In-scope accounts without this capability enabled through any current license. */
    gainingAccountCount: number;
    /** In-scope accounts that already have it enabled through another license, such as an add-on. */
    alreadyEnabledAccountCount: number;
}
/** One account in a step-up group, per currency: what it costs today and on the target. Null is unknown, never zero. */
export interface Microsoft365StepUpSegmentMoney {
    priceBasis?: Microsoft365StepUpPriceBasis;
    /** Source product plus the group's included products, for one account. */
    currentPerAccount: number | null;
    targetPerAccount: number | null;
    /** targetPerAccount − currentPerAccount; negative means the higher plan costs less. */
    differencePerAccount: number | null;
    /** differencePerAccount × accountCount. */
    differenceTotal: number | null;
}
/** In-scope accounts that hold the same set of products the target already includes. Aggregate only. */
export interface Microsoft365StepUpSegment {
    /** Sorted; empty for accounts that hold none of them. Every ID is one of the step-up's replaced products. */
    replacedSkuIds: string[];
    accountCount: number;
    /** Group accounts without a successful sign-in for 90+ days. */
    inactiveAccountCount: number;
    monthlyByCurrency: Record<string, Microsoft365StepUpSegmentMoney>;
}
/** Tenant-level upgrade scenario such as Microsoft 365 E3 → E5 → E7. Aggregate only: no account identifiers. */
export interface Microsoft365StepUpComparison {
    /** `${fromSkuId}:${toSkuId}` */
    id: string;
    fromSkuId: string;
    fromProductName: string;
    toSkuId: string;
    toProductName: string;
    /** Target plans come from the tenant when it owns the target, else the reviewed publisher catalogue. */
    targetSource: 'tenant' | 'publisher';
    /** Enabled accounts assigned the source product and not already assigned the target. */
    accountCount: number;
    /** In-scope accounts without a successful sign-in for 90+ days. */
    inactiveAccountCount: number;
    /** False when any account's assignments or capabilities are partial or unknown; counts are then minimums. */
    accountsComplete: boolean;
    addedCapabilityIds: string[];
    lostCapabilityIds: string[];
    unverifiedPlanCount: number;
    capabilityGains: Microsoft365StepUpCapabilityGain[];
    replacedProducts: Microsoft365StepUpReplacedProduct[];
    priceListVersion: string;
    monthlyByCurrency: Record<string, Microsoft365StepUpMoney>;
    /** Accounts grouped by the included products they already pay for, so the cheapest moves can be shown first. Optional for older snapshots. */
    segments?: Microsoft365StepUpSegment[];
}
export interface Microsoft365ProductCapabilities {
    state: Microsoft365CapabilityEvidenceState;
    plans: Microsoft365ServicePlanEvidence[];
    omittedPlanCount: number;
    comparison?: Microsoft365CapabilityComparison;
}
export interface Microsoft365AccountCapabilities {
    state: Microsoft365CapabilityEvidenceState;
    enabledIds: string[];
    disabledIds: string[];
    unknownIds: string[];
    errorIds: string[];
    unavailableIds: string[];
}
export type Microsoft365CapabilityNoticeKind = 'assignment_error' | 'retired_service' | 'redundant_addon' | 'suspended_subscription';
/** Notices never contribute directly to additive unused-license money. */
export interface Microsoft365CapabilityNotice {
    kind: Microsoft365CapabilityNoticeKind;
    skuId: string;
    accountId?: string;
    assignedByGroup?: string | null;
    code?: string;
    title: string;
    detail: string;
    sourceUrl?: string;
    retiredAt?: string;
    coveredBySkuIds?: string[];
}
export interface Microsoft365CapabilityProjection {
    catalogueVersion: string;
    definitions: Microsoft365CapabilityDefinition[];
    accountsComplete: boolean;
    summary: Array<{
        capabilityId: string;
        includedProductCount: number;
        /** Contributing owned SKU IDs after curated tier expansion; bounded detail, not an entitlement rule for readers. */
        includedSkuIds?: string[];
        enabledAccountCount: number | null;
        /** Confirmed minimum before portal detail truncation. */
        observedEnabledAccountCount: number;
    }>;
    notices: Microsoft365CapabilityNotice[];
    /** Observed notices before portal detail truncation, not a tenant-wide absence claim. */
    observedNoticeCount: number;
    omittedNoticeCount: number;
    /** Curated upgrade scenarios; old snapshots omit them. Conditional, never additive savings. */
    stepUps?: Microsoft365StepUpComparison[];
}
/** Validates one aggregate step-up money row; gross and net are unknown together with the per-account difference. */
export declare function isMicrosoft365StepUpMoney(value: unknown): value is Microsoft365StepUpMoney;
/** Validates one group's money: the difference is unknown exactly when either price is, and the total follows the difference. */
export declare function isMicrosoft365StepUpSegmentMoney(value: unknown): value is Microsoft365StepUpSegmentMoney;
/** Validates one step-up and its internal arithmetic counts. Capability IDs are checked against definitions by the projection. */
export declare function isMicrosoft365StepUpComparison(value: unknown): value is Microsoft365StepUpComparison;
export declare function isMicrosoft365ProductCapabilities(value: unknown): value is Microsoft365ProductCapabilities;
export declare function isMicrosoft365AccountCapabilities(value: unknown): value is Microsoft365AccountCapabilities;
export declare function isMicrosoft365CapabilityProjection(value: unknown): value is Microsoft365CapabilityProjection;
/** Validates one informational capability notice independently of an account-detail cap. */
export declare function isMicrosoft365CapabilityNotice(notice: unknown): notice is Microsoft365CapabilityNotice;
//# sourceMappingURL=microsoft365Capabilities.d.ts.map