/** Background Current State admission prerequisites. Interactive covers may omit prepared-by; background v1 requires it. */
export declare const CURRENT_STATE_REPORT_SUPPORTED_CURRENCIES: readonly ["USD", "NZD", "AUD", "CAD", "EUR", "GBP", "JPY", "CNY", "KRW", "INR", "BRL", "SEK", "NOK", "DKK", "CHF", "SGD", "HKD"];
export declare const CURRENT_STATE_REPORT_MAX_HOURLY_RATE = 10000;
export interface CurrentStateReportPrerequisitesV1 {
    hourlyRateAmount?: number;
    hourlyRateCurrency?: string;
    scopeCurrencyCode: string;
    preparedBy?: string;
    providerName?: string | null;
    parentCompanyName?: string | null;
}
export declare const validateCurrentStateReportPrerequisitesV1: (input: CurrentStateReportPrerequisitesV1) => {
    ok: true;
} | {
    ok: false;
    failureCode: "invalid-rate" | "invalid-currency" | "no-prepared-by";
};
//# sourceMappingURL=reportJobPrerequisites.d.ts.map