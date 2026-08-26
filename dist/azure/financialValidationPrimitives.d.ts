export interface CanonicalExactMoney {
    amount: string;
    currencyCode: string;
}
/** Validates the provider-neutral exact-money representation used by financial authorities. */
export declare const isCanonicalExactMoney: (value: unknown) => value is CanonicalExactMoney;
//# sourceMappingURL=financialValidationPrimitives.d.ts.map