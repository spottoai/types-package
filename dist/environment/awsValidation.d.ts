import type { EnvironmentAwsAccountCompiledGenerationPointerV1, EnvironmentAwsAccountProjectionV1, EnvironmentAwsAccountSourceBindingV1, EnvironmentAwsMoneyValueV1 } from './awsContracts.js';
/** AWS money retains the shared financial checks and a separate provenance namespace. */
export declare const isEnvironmentAwsMoneyValueV1: (value: unknown) => value is EnvironmentAwsMoneyValueV1;
export declare const isEnvironmentAwsAccountSourceBindingV1: (value: unknown) => value is EnvironmentAwsAccountSourceBindingV1;
/** Validates the complete bounded AWS account projection, including every nested reference. */
export declare const isEnvironmentAwsAccountProjectionV1: (value: unknown) => value is EnvironmentAwsAccountProjectionV1;
/** Same fixed document tree and independent run identity as the Azure generation protocol. */
export declare const isEnvironmentAwsAccountCompiledGenerationPointerV1: (value: unknown) => value is EnvironmentAwsAccountCompiledGenerationPointerV1;
//# sourceMappingURL=awsValidation.d.ts.map