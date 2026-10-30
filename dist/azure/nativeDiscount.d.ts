import { type AzureFinancialChargeSourceV1, type AzureFinancialChargeSpendBreakdownV1, type DecompositionTreeFinancialChargeSourceBasisCostsV1 } from './financialChargePolicy.js';
/**
 * Configured native discount (subscription `nativeDiscountPercent`), applied on read.
 *
 * "Native" means the cloud provider's own charges (for Azure, the `azure-native`
 * financial charge source). Marketplace and unknown-source amounts are never
 * discounted. These functions are the single implementation of the arithmetic, so
 * the API read projection and any evaluation path (cost alerts, budgets,
 * notifications) produce identical numbers. They never mutate stored artifacts.
 */
export declare const NATIVE_DISCOUNT_MAX_PERCENT = 100;
export declare const NATIVE_DISCOUNT_BASIS_POINTS_SCALE = 10000;
/** True for a finite percentage from 0 to 100 inclusive with at most two decimals. */
export declare const isValidNativeDiscountPercent: (value: unknown) => value is number;
/**
 * Converts a configured percentage to integer basis points (5.25 -> 525).
 * Returns undefined when the value is absent or invalid; callers then apply no discount.
 */
export declare const toNativeDiscountBasisPoints: (percent: unknown) => number | undefined;
/**
 * Applies the discount to a signed native amount in integer minor units, rounding half away
 * from zero once. Credits and refunds receive the same factor. Returns undefined for invalid input.
 */
export declare const applyNativeDiscountMinorUnits: (nativeMinorUnits: number, basisPoints: number) => number | undefined;
export interface NativeDiscountSourceMinorUnits {
    nativeMinorUnits: number;
    /** Signed eligible subset; omission preserves the legacy full-native discount. Zero is produced evidence. */
    nativeDiscountEligibleMinorUnits?: number;
    marketplaceMinorUnits: number;
    unknownMinorUnits: number;
}
/** Provider-native rows without pricing-model evidence retain legacy eligibility. Source proof is supplied by the caller. */
export declare const isAzureNativeDiscountEligible: (source: AzureFinancialChargeSourceV1, pricingModel: unknown) => boolean;
/** Uniform-rate borrowing needs gross membership proof; legacy records retain their original rule. */
export declare const isAzureNativeSpendFullyDiscountEligible: (breakdown: AzureFinancialChargeSpendBreakdownV1 | undefined) => boolean;
/** Display amount: unchanged excluded native, Marketplace and unknown amounts plus discounted eligible native. */
export declare const projectNativeDiscountSourceMinorUnits: (source: NativeDiscountSourceMinorUnits, basisPoints: number) => number | undefined;
/**
 * Projects one Cost Tree source basis (tree total or node). Returns undefined when material
 * unknown-source charges exist (`status: partial`): an exact discounted value is then unavailable.
 */
export declare const projectDecompositionTreeSourceBasisMinorUnits: (basis: DecompositionTreeFinancialChargeSourceBasisCostsV1 | undefined, basisPoints: number) => number | undefined;
/**
 * Projects the billed or amortized total of a rolling spend breakdown (subscription or resource).
 * Returns undefined when the basis is unavailable or material unknown-source charges exist.
 */
export declare const projectFinancialChargeSpendBasisMinorUnits: (breakdown: AzureFinancialChargeSpendBreakdownV1 | undefined, basis: "billed" | "amortized", basisPoints: number) => number | undefined;
/** Converts a decimal amount to integer minor units using its exact decimal text, half away from zero. */
export declare const toNativeDiscountMinorUnits: (amount: number, minorUnitScale?: number) => number | undefined;
/**
 * Applies the discount to a decimal amount known to be entirely native (for example Azure-native
 * eligible recommendation savings or licensing figures). Eligibility is proved by callers; a native
 * financial source alone does not prove Reservation/SavingsPlan amounts eligible.
 */
export declare const applyNativeDiscountToNativeAmount: (amount: number, basisPoints: number, minorUnitScale?: number) => number | undefined;
/** Response metadata contract identity for API read projections of the configured native discount. */
export declare const NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1: "native-discount-projection/v1";
/** Response header carrying the projection metadata for streamed and batched reads. */
export declare const NATIVE_DISCOUNT_PROJECTION_HEADER = "X-Spotto-Native-Discount";
/** Maximum number of nulled JSON paths listed in one metadata object. */
export declare const NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS = 200;
/**
 * - `none`: no rate is configured; amounts are the stored amounts.
 * - `applied`: every money value in the response carries the configured rate.
 * - `partial`: the rate was applied, but some values could not be proved native/Marketplace and were set to `null`.
 * - `unavailable`: the rate could not be resolved for this response; amounts are the stored amounts.
 */
export type NativeDiscountProjectionStatusV1 = 'none' | 'applied' | 'partial' | 'unavailable';
export type NativeDiscountProjectionReasonV1 = 
/** Rate lookup found no owning subscription record, several, or a company mismatch. */
'owner-unresolved'
/** The stored rate failed validation. */
 | 'invalid-setting'
/** A value had no matching source split (period, generation, currency or basis). */
 | 'source-split-missing'
/** A value included material unknown-source charges. */
 | 'unknown-source';
/**
 * Root-level `nativeDiscountProjection` object on projected JSON documents, and the value of the
 * `X-Spotto-Native-Discount` header on streamed or batched reads (without `unavailablePaths`).
 */
export interface NativeDiscountProjectionV1 {
    contractVersion: typeof NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1;
    status: NativeDiscountProjectionStatusV1;
    /** Integer basis points applied (525 = 5.25%). Present for `applied` and `partial`. */
    basisPoints?: number;
    /** Required for `unavailable`; optional explanation for `partial`. */
    reason?: NativeDiscountProjectionReasonV1;
    /** RFC 6901 JSON Pointers of values set to `null` (`partial` only, JSON responses only). */
    unavailablePaths?: string[];
    /** True when more than `NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS` values were nulled. */
    unavailablePathsTruncated?: true;
}
/** Exact validator for `NativeDiscountProjectionV1`, including status-specific field rules. */
export declare const isNativeDiscountProjectionV1: (value: unknown) => value is NativeDiscountProjectionV1;
/**
 * Serializes projection metadata for the `X-Spotto-Native-Discount` header, for example
 * `v1; status=applied; bps=525`. JSON paths are never sent in the header.
 */
export declare const formatNativeDiscountProjectionHeader: (projection: NativeDiscountProjectionV1) => string;
/** Parses the `X-Spotto-Native-Discount` header; returns undefined for an absent or invalid value. */
export declare const parseNativeDiscountProjectionHeader: (header: string | null | undefined) => NativeDiscountProjectionV1 | undefined;
//# sourceMappingURL=nativeDiscount.d.ts.map