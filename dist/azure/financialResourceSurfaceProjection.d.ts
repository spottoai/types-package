import type { ArtifactGeneration } from '../common/artifactGeneration';
import type { FinancialSurfaceCoordinateDefinitionV1, FinancialSurfaceMoneyV1 } from './financialCurrentSpendSurfaceProjection';
export declare const FINANCIAL_RESOURCE_SURFACE_PROJECTION_SCHEMA_VERSION_V1: 1;
export declare const FINANCIAL_RESOURCE_SURFACE_PROJECTION_CONTRACT_VERSION_V1: "financial-resource-surface-projection/v1";
export type FinancialResourceRoleV1 = 'owner' | 'display-only' | 'unclassified';
export type FinancialResourceSurfaceValueV1 = FinancialSurfaceMoneyV1 & {
    coordinateId: string;
};
interface FinancialResourceScenarioCommonV1 {
    scenarioId: string;
    coordinateId: string;
    recommendationId?: string;
    category: 'cost' | 'security' | 'reliability' | 'performance' | 'operational-excellence' | 'compliance';
    /** Scenario alternatives are mutually exclusive display comparisons, never additive savings members. */
    additivity: 'non-additive';
}
export interface AvailableFinancialResourceScenarioV1 extends FinancialResourceScenarioCommonV1 {
    status: 'available';
    currentAmount: string;
    targetAmount: string;
    changeAmount: string;
    currencyCode: string;
    reasonCodes?: never;
}
export interface PartialFinancialResourceScenarioV1 extends FinancialResourceScenarioCommonV1 {
    status: 'partial';
    currentAmount?: string;
    targetAmount?: string;
    changeAmount?: string;
    currencyCode?: string;
    reasonCodes: [string, ...string[]];
}
export interface UnavailableFinancialResourceScenarioV1 extends FinancialResourceScenarioCommonV1 {
    status: 'unavailable';
    reasonCodes: [string, ...string[]];
    currentAmount?: never;
    targetAmount?: never;
    changeAmount?: never;
    currencyCode?: never;
}
export type FinancialResourceScenarioV1 = AvailableFinancialResourceScenarioV1 | PartialFinancialResourceScenarioV1 | UnavailableFinancialResourceScenarioV1;
export interface FinancialResourceSurfaceMemberV1 {
    resourceId: string;
    resourceType: string;
    financialRole: FinancialResourceRoleV1;
    values: [FinancialResourceSurfaceValueV1, ...FinancialResourceSurfaceValueV1[]];
    scenarios?: FinancialResourceScenarioV1[];
}
/**
 * Subscription-scoped resource display projection. Coordinate metadata occurs
 * once; members carry exact values and coordinate references only.
 */
export interface FinancialResourceSurfaceProjectionV1 {
    schemaVersion: typeof FINANCIAL_RESOURCE_SURFACE_PROJECTION_SCHEMA_VERSION_V1;
    contractVersion: typeof FINANCIAL_RESOURCE_SURFACE_PROJECTION_CONTRACT_VERSION_V1;
    projectionId: string;
    provider: 'azure';
    providerAccountRefs: [string, ...string[]];
    artifactGeneration: ArtifactGeneration;
    financialAuthorityId: string;
    coordinates: [FinancialSurfaceCoordinateDefinitionV1, ...FinancialSurfaceCoordinateDefinitionV1[]];
    resources: FinancialResourceSurfaceMemberV1[];
}
export type FinancialResourceSurfaceProjectionIdentityPreimageV1 = Omit<FinancialResourceSurfaceProjectionV1, 'projectionId'>;
export {};
//# sourceMappingURL=financialResourceSurfaceProjection.d.ts.map