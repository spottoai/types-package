/** Public display-conversion evidence; provider billing facts remain in their source currency. */
export declare const CURRENCY_CONVERSION_CONTRACT_VERSION: 1;
export declare const CURRENCY_CONVERSION_HEADER = "X-Spotto-Currency-Conversion";
export declare const CURRENCY_CONVERSION_RATE_SOURCE: "European Central Bank euro foreign exchange reference rates";
/** Common evidence on a converted batch envelope/header or individual document. */
export interface CurrencyConversionContextV1 {
    contractVersion: typeof CURRENCY_CONVERSION_CONTRACT_VERSION;
    targetCurrency: string;
    /** Real calendar date, YYYY-MM-DD. Freshness is checked by the API. */
    rateDate: string;
    /** Lowercase hexadecimal SHA-256 of the API's canonical reference date/rate table. */
    rateSnapshotId: string;
    rateSource: typeof CURRENCY_CONVERSION_RATE_SOURCE;
}
export interface CurrencyConversionRateV1 {
    sourceCurrency: string;
    /** Exact positive decimal quote against EUR; EUR itself is 1. */
    sourceRate: string;
    /** Exact positive decimal quote of the target currency against EUR. */
    targetRate: string;
    /** Disclosure only: at most 18 fractional digits, rounded half away from zero. Never use for arithmetic. */
    rate: string;
}
export interface CurrencyConversionV1 extends CurrencyConversionContextV1 {
    /** Converted when any declared source differs from target; empty money documents are unchanged. */
    status: 'converted' | 'unchanged';
    /** Unique source entries in ascending ISO-code order, all quoting the same target. */
    rates: CurrencyConversionRateV1[];
}
/** Public per-row failure classifications; private diagnostics never cross the read contract. */
export type CurrencyConversionUnavailableCodeV1 = 'currency-source-unknown' | 'currency-conversion-unavailable' | 'currency-access-denied';
export interface CurrencyConversionUnavailableV1 {
    targetCurrency: string;
    code: CurrencyConversionUnavailableCodeV1;
}
/**
 * Optional companions on public read DTOs only. Persisted billing records and write
 * requests retain their original contracts. Successful currency/amount fields use
 * the display unit; billingCurrency retains the authoritative original ISO code.
 * An unavailable row omits display currency/symbol and amounts. Successful and
 * unavailable companions are mutually exclusive on the wire.
 */
export interface CurrencyDisplayProjectionFieldsV1 {
    billingCurrency?: string;
    currencyConversion?: CurrencyConversionV1;
    currencyConversionUnavailable?: CurrencyConversionUnavailableV1;
}
/** Representable discovery scales; the API/platform owns authoritative ISO code/scale membership. */
export type CurrencyConversionMinorUnitScaleV1 = 0 | 1 | 2 | 3 | 4;
export interface CurrencyConversionCurrencyV1 {
    code: string;
    minorUnitScale: CurrencyConversionMinorUnitScaleV1;
}
/** Company-authorized capability discovery; no chosen user currency or company settings. */
export interface CurrencyConversionDiscoveryV1 extends Omit<CurrencyConversionContextV1, 'targetCurrency'> {
    /** Unique supported codes in ascending order, always including EUR. */
    currencies: CurrencyConversionCurrencyV1[];
}
export declare function isCurrencyConversionUnavailableV1(value: unknown): value is CurrencyConversionUnavailableV1;
/** Validates declared wire evidence, not freshness, hash authenticity, supported-code membership or FX arithmetic. */
export declare function isCurrencyConversionContextV1(value: unknown): value is CurrencyConversionContextV1;
export declare function isCurrencyConversionRateV1(value: unknown): value is CurrencyConversionRateV1;
/** Checks status and cross-entry consistency in addition to the context/rate wire contracts. */
export declare function isCurrencyConversionV1(value: unknown): value is CurrencyConversionV1;
export declare function isCurrencyConversionDiscoveryV1(value: unknown): value is CurrencyConversionDiscoveryV1;
//# sourceMappingURL=currencyConversion.d.ts.map