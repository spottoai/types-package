import type { RecommendationEffortEstimateBreakdown } from './recommendations';
export interface ResourcesByType {
    type: string;
    resources: number;
    /** effective spend baseline used by summaries (rolling 30-day window in current pipeline) */
    spendBilling?: number;
    /** amortized variant of spendBilling */
    spendBillingAmortized?: number;
    /** previous-window baseline aligned with spendBilling semantics */
    spendPreviousBilling?: number;
    spendPreviousBillingAmortized?: number;
    /** total spend over the last 30 days */
    spend30Days?: number;
    spend30DaysAmortized?: number;
    /** total spend over the previous 30 days */
    spendPrevious30Days?: number;
    spendPrevious30DaysAmortized?: number;
    /** total spend over the last 7 days */
    spend7Days?: number;
    spend7DaysAmortized?: number;
    /** total spend over the previous 7 days */
    spendPrevious7Days?: number;
    spendPrevious7DaysAmortized?: number;
}
export interface ResourceByLocation {
    location: string;
    resources: number;
    /** effective spend baseline used by summaries (rolling 30-day window in current pipeline) */
    spendBilling?: number;
    /** amortized variant of spendBilling */
    spendBillingAmortized?: number;
    /** previous-window baseline aligned with spendBilling semantics */
    spendPreviousBilling?: number;
    spendPreviousBillingAmortized?: number;
    /** total spend over the last 30 days */
    spend30Days?: number;
    spend30DaysAmortized?: number;
    /** total spend over the previous 30 days */
    spendPrevious30Days?: number;
    spendPrevious30DaysAmortized?: number;
    /** total spend over the last 7 days */
    spend7Days?: number;
    spend7DaysAmortized?: number;
    /** total spend over the previous 7 days */
    spendPrevious7Days?: number;
    spendPrevious7DaysAmortized?: number;
}
export interface ResourceTypeReference {
    type: string;
}
export interface ResourceLink {
    name: string;
    url: string;
    doc: string;
    disabled?: boolean;
}
export interface AzureResourceNotesFields {
    knownIssues?: string;
    troubleshooting?: string;
    performance?: string;
    maintenance?: string;
    migration?: string;
    dependencies?: string;
    securityCompliance?: string;
}
export type AzureResourceNotesField = keyof AzureResourceNotesFields;
export interface GetAzureResourceNotesQuery {
    resourceId: string;
}
export interface AzureResourceNotes {
    resourceId: string;
    subscriptionId: string;
    notes: AzureResourceNotesFields;
    updatedAt?: string;
    updatedByUserId?: string;
    updatedByDisplayName?: string;
}
export interface SaveAzureResourceNotesRequest {
    resourceId: string;
    notes: AzureResourceNotesFields;
}
export interface RecommendationEffortEstimateProfileOverride {
    effortHours?: number;
    breakdown?: RecommendationEffortEstimateBreakdown;
}
export interface RecommendationEffortEstimateProfilesOverride {
    clickops?: RecommendationEffortEstimateProfileOverride;
    devops?: RecommendationEffortEstimateProfileOverride;
    enterprise?: RecommendationEffortEstimateProfileOverride;
}
export interface RecommendationBulkEffortEstimateProfileOverride {
    setupHours?: number;
    perResourceHours?: number;
    validationHours?: number;
}
export interface RecommendationBulkEffortEstimateProfilesOverride {
    clickops?: RecommendationBulkEffortEstimateProfileOverride;
    devops?: RecommendationBulkEffortEstimateProfileOverride;
    enterprise?: RecommendationBulkEffortEstimateProfileOverride;
}
export interface RecommendationBulkEffortEstimatesOverride {
    supported?: boolean;
    threshold?: number;
    profiles?: RecommendationBulkEffortEstimateProfilesOverride;
}
export interface RecommendationEffortEstimatesOverride {
    profiles?: RecommendationEffortEstimateProfilesOverride;
    bulk?: RecommendationBulkEffortEstimatesOverride;
    notes?: string;
}
export interface AzureResourceEffortEstimateOverride {
    recommendationId: string;
    effortEstimatesOverride: RecommendationEffortEstimatesOverride;
    updatedAt?: string;
    updatedByUserId?: string;
    updatedByDisplayName?: string;
}
export interface AzureResourceEffortEstimatesDocument {
    version: '1.0';
    overrides: AzureResourceEffortEstimateOverride[];
}
//# sourceMappingURL=resources.d.ts.map