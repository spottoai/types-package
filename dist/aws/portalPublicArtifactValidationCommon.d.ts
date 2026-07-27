import { type AwsPortalAccountSummaryScope, type AwsPortalResourceCollectionScope } from './portalPublicArtifacts';
import { type AwsPublicArtifactType } from './publicArtifacts';
import { asRecord, assertExactKeys, assertPublicJson, assertValue, isoTimestamp, requiredEnum, requiredString, stringArray } from './pluginPublicArtifactValidationHelpers';
export { asRecord, assertExactKeys, assertPublicJson, assertValue, isoTimestamp, requiredEnum, requiredString, stringArray };
export declare function validatePortalEnvelope(artifact: Record<string, unknown>, artifactType: AwsPublicArtifactType, allowed: readonly string[]): {
    accountId: string;
    runId: string;
    portalGeneratedAt: string;
    bodyGeneratedAt: string;
};
export declare function validateGeneration(value: unknown, field: string): {
    runId: string;
    generatedAt: string;
};
export declare function validateResourceScope(value: unknown, accountId: string, field: string): AwsPortalResourceCollectionScope;
export declare function validateAccountScope(value: unknown, accountId: string, field: string): AwsPortalAccountSummaryScope;
export declare function validateHistoryAccountScope(value: unknown, accountId: string, field: string): void;
export declare function validatePeriod(value: unknown, field: string): void;
export declare function validateFreshness(value: unknown, field: string, timestampField: string): void;
export declare function requiredBoolean(value: unknown, field: string): boolean;
export declare function nonNegativeInteger(value: unknown, field: string): number;
export declare function finiteNumber(value: unknown, field: string): number;
export declare function validateJsonObject(value: unknown, field: string): void;
export declare function validateJsonArray(value: unknown, field: string): unknown[];
export declare function assertRegionsBelong(regions: unknown, allowedRegions: string[], field: string): void;
export declare function assertUnique(values: string[], field: string): void;
export declare function regionArray(value: unknown, field: string): string[];
export declare function requiredPublicIdentifier(value: unknown, field: string): string;
export declare function dateValue(value: unknown, field: string): string;
//# sourceMappingURL=portalPublicArtifactValidationCommon.d.ts.map