import { type CurrentSpendCompositionIdentityPreimageV1, type CurrentSpendCompositionMemberV1, type CurrentSpendCompositionV1, type FinancialDataflowCoordinateV1, type FinancialDataflowScopeV1 } from './financialDataflow';
export type FinancialDataflowJsonRecordV1 = Record<string, unknown>;
export declare const FINANCIAL_DATAFLOW_LIMITS_V1: {
    readonly maximumIdentifierLength: 2048;
    readonly maximumProviderAccounts: 256;
    readonly maximumMembers: 20000;
    readonly maximumReasonCodes: 64;
    readonly maximumJsonBytes: 5242880;
    readonly maximumJsonDepth: 64;
    readonly maximumJsonNodes: 200000;
};
export declare const isFinancialDataflowRecordV1: (value: unknown) => value is FinancialDataflowJsonRecordV1;
export declare const hasFinancialDataflowExactFieldsV1: (value: FinancialDataflowJsonRecordV1, required: readonly string[], optional?: readonly string[]) => boolean;
/** Applies the same aggregate byte/node/depth envelope to already-parsed public validator inputs. */
export declare const isFinancialDataflowValueWithinLimitsV1: (value: unknown) => boolean;
export declare const isFinancialDataflowIdentityV1: (value: unknown) => value is string;
export declare const isFinancialDataflowHashV1: (value: unknown) => value is string;
export declare const isFinancialDataflowCurrencyV1: (value: unknown) => value is string;
export declare const isFinancialDataflowIsoInstantV1: (value: unknown) => value is string;
export declare const isFinancialDataflowCalendarDateV1: (value: unknown) => value is string;
export declare const isFinancialDataflowSortedUniqueStringsV1: (value: unknown, maximum: number, validate?: (entry: unknown) => entry is string) => value is string[];
export declare const canonicalizeFinancialDataflowJsonV1: (value: unknown) => string;
/** Parses bounded JSON while rejecting duplicate and prototype-sensitive object keys. */
export declare const parseFinancialDataflowJsonV1: (text: string) => unknown;
export declare const isFinancialDataflowScopeV1: (value: unknown) => value is FinancialDataflowScopeV1;
export declare const isFinancialDataflowCoordinateV1: (value: unknown) => value is FinancialDataflowCoordinateV1;
export declare const canonicalizeFinancialDataflowCoordinateV1: (value: FinancialDataflowCoordinateV1) => string;
export declare const createFinancialDataflowCoordinateIdV1: (value: FinancialDataflowCoordinateV1) => string;
export declare const canonicalizeCurrentSpendMembershipV1: (members: readonly CurrentSpendCompositionMemberV1[]) => string;
export declare const createCurrentSpendMembershipDigestV1: (members: readonly CurrentSpendCompositionMemberV1[]) => string;
export declare const canonicalizeCurrentSpendCompositionIdentityV1: (value: CurrentSpendCompositionIdentityPreimageV1) => string;
export declare const createCurrentSpendCompositionIdV1: (value: CurrentSpendCompositionIdentityPreimageV1) => string;
export declare const isCurrentSpendCompositionV1: (value: unknown) => value is CurrentSpendCompositionV1;
/** Proves that composition membership and money reconcile to exact V2 baseline envelopes. */
export declare const isCurrentSpendCompositionCompatibleV1: (composition: unknown, baselines: unknown) => boolean;
//# sourceMappingURL=financialDataflowValidation.d.ts.map