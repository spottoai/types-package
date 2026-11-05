export declare const AWS_ACCOUNT_ID_PATTERN: RegExp;
export declare const AWS_REGION_PATTERN: RegExp;
export declare const isAwsCredentialKey: (key: string) => boolean;
export declare const isForbiddenAwsPublicKey: (key: string) => boolean;
/** Rejects non-JSON values plus credential, physical-path, and operational-marker keys recursively. */
export declare function assertAwsPublicJson(value: unknown, field: string): void;
export declare function assertAccount(value: unknown, accountId: string, field: string): void;
//# sourceMappingURL=validationHelpers.d.ts.map