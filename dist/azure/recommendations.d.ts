import { Comment, RecommendationHistory } from './recommendationState';
export declare enum RecommendationCategory {
    Cost = "Cost",
    Performance = "Performance",
    Reliability = "Reliability",
    Security = "Security",
    HighAvailability = "HighAvailability",
    OperationalExcellence = "OperationalExcellence"
}
export interface RecommendationResources {
    recommendation: CustomAzureRecommendation;
    resourceIds: string[];
}
export interface Recommendation {
    id: string;
    name: string;
    category: RecommendationCategory;
    type?: string;
    description?: string;
    remediation?: string;
    impact: string;
    links?: {
        name: string;
        url: string;
    }[];
    considerations?: string;
    potentialBenefits?: string;
    effort?: string;
    costImpact?: number;
    performanceImpact?: number;
    confidencePercentage?: number;
    resources?: ResourceReference[];
    subcategory?: string;
    solution?: string;
    source?: string;
    service?: string;
}
export interface RecommendationSummary {
    category: RecommendationCategory;
    total: number;
    high: number;
    medium: number;
    low: number;
}
export interface ResourceId {
    id: string;
}
export interface ResourceReference {
    id: string;
    name: string;
}
export interface ReliabilityRecommendation extends Recommendation {
    referenceID: string;
    resourceType: string;
    resourceTypeShortName: string;
    service: string;
}
export interface CustomAzureRecommendation extends Recommendation {
    subcategory: string;
    service: string;
    source: string;
    fileName: string;
}
export interface RecommendationCollection {
    recommendation: CustomAzureRecommendation;
    results: ResourceId[];
}
export interface AzureRecommendationLite {
    category: string;
    total: number;
    high: number;
    medium: number;
    low: number;
}
export interface RecommendationStats {
    total: number;
    high: number;
    medium: number;
    low: number;
}
export interface RecommendationWithState extends Recommendation {
    status?: 'Active' | 'Prioritized' | 'Postponed' | 'Dismissed' | 'Completed' | 'Archived';
    read?: boolean;
    scheduledAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    flagged?: boolean;
    comments?: Comment[];
    history?: RecommendationHistory[];
}
//# sourceMappingURL=recommendations.d.ts.map