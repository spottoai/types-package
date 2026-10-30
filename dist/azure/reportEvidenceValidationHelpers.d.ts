import { type JsonRecord } from '../common/validationHelpers';
export type { JsonRecord } from '../common/validationHelpers';
export { isRecord, isString, isOptionalString, isFiniteNumber, isOptionalFiniteNumber, isOptionalBoolean, isCount, isDateTime, isStringArray, isCountRecord, countTotal, hasOptionalStrings, hasOptionalNumbers, isBoundedRows, } from '../common/validationHelpers';
export declare const isProjectionRows: (value: unknown, limit?: 50) => boolean;
export declare const hasRequiredRecords: (value: JsonRecord, keys: readonly string[]) => boolean;
export declare const isSourceFileStatus: (value: unknown) => boolean;
export declare const isTagCoverage: (value: unknown) => boolean;
export declare const isResourceSummary: (value: unknown) => boolean;
export declare const isCostSummary: (value: unknown) => boolean;
export declare const isRecommendationSummary: (value: unknown) => boolean;
export declare const isRetirementSummary: (value: unknown) => boolean;
export declare const isCommitmentExpirySummary: (value: unknown) => boolean;
export declare const isEvidenceReference: (value: unknown) => boolean;
//# sourceMappingURL=reportEvidenceValidationHelpers.d.ts.map