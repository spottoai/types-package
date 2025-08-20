import { Link } from './common.js';
export type RecommendationCategory = 'Cost' | 'Performance' | 'Reliability' | 'Security' | 'OperationalExcellence' | 'Operational Excellence';
export interface RecommendationResources {
    recommendation: CustomAzureRecommendation;
    resourceIds: string[];
}
export interface Recommendation {
    id: string;
    type?: string;
    name: string;
    category: RecommendationCategory;
    impact: 'High' | 'Medium' | 'Low';
    links?: Link[];
    risk?: string;
    effort?: string;
    description?: string;
    potentialBenefits?: string;
    remediation?: string;
    resources?: ResourceReference[];
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
//# sourceMappingURL=recommendations.d.ts.map