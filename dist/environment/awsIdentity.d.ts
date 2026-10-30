import type { EnvironmentAwsAccountScopeV1 } from './awsContracts.js';
/** Validates the exact AWS account/company identity without coercing account IDs. */
export declare const isEnvironmentAwsAccountScopeV1: (value: unknown) => value is EnvironmentAwsAccountScopeV1;
export declare const environmentAwsScopesEqual: (left: unknown, right: unknown) => boolean;
export declare const isEnvironmentAwsResourceTypeV1: (value: unknown) => value is string;
/** Scoped native IDs and referenced AWS-owned policies do not assert customer ownership. */
export declare const isEnvironmentAwsResourceIdV1: (scope: unknown, value: unknown) => value is string;
//# sourceMappingURL=awsIdentity.d.ts.map