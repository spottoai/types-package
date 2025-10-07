import { Comment, RecommendationHistory } from './recommendationState';
import { SecurityAssessmentStatus, SecurityImpact, SubscriptionSecurityStatus } from './security';
export declare enum RecommendationCategory {
    Cost = "Cost",
    Performance = "Performance",
    Reliability = "Reliability",
    Security = "Security",
    Compliance = "Compliance",
    OperationalExcellence = "OperationalExcellence",
    OperationalExcellenceAlternative = "Operational Excellence"
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
    impactReason?: string;
    links?: {
        name: string;
        url: string;
    }[];
    considerations?: string;
    potentialBenefits?: string;
    effort?: string;
    effortReason?: string;
    risk?: string;
    riskReason?: string;
    costImpact?: number;
    costImpactReason?: string;
    costImpactDetails?: CostImpactDetails;
    performanceImpact?: number;
    performanceImpactReason?: string;
    confidencePercentage?: number;
    confidenceReason?: string;
    resources?: ResourceReference[];
    securityImpactDetails?: SecurityImpact;
    resolved?: boolean;
    securityAssessmentStatuses?: SecurityAssessmentStatus[];
    subcategory?: string;
    solution?: string;
    source?: string;
    service?: string;
    createdTime?: string;
    lastUpdatedTime?: string;
}
export interface CostImpactDetails {
    name: string;
    monthlySavings?: number;
    currentSpend?: number;
    savingPercentage?: number;
    minMonthlySavings?: number;
    maxMonthlySavings?: number;
}
export interface RecommendationSummary {
    category: RecommendationCategory;
    total: number;
    high: number;
    medium: number;
    low: number;
}
export interface RecommendationWithResources {
    recommendation: Recommendation;
    resources: RecommendationResource[];
}
export interface RecommendationResource {
    id: string;
    name: string;
    type: string;
    spend: number;
    spendAmortized: number;
}
export interface RecommendationsView {
    recommendations: RecommendationWithResources[];
    securityImpactDetails?: SecurityImpact[];
    subscriptionSecurityStatus?: SubscriptionSecurityStatus;
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
export interface RecommendationActionRequest {
    recommendationId: string;
    subscriptionId: string;
    resourceIds: string[];
    companyId: string;
}
export interface DismissRecommendationRequest extends RecommendationActionRequest {
    dismissReason: string;
}
export interface RecommendationActionResponse {
    success: boolean;
}
//# sourceMappingURL=recommendations.d.ts.map