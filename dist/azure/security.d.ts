export interface SecurityImpact {
    id?: string;
    controlDisplayName: string;
    controlName: string;
    recommendationIds: string[];
    notApplicableResourceCount: number;
    unhealthyResourceCount: number;
    healthyResourceCount: number;
    totalResourceCount: number;
    maxScore: number;
    currentScore: number;
    potentialScoreIncrease: number;
}
export interface SecurityAssessmentStatus {
    resourceId: string;
    status: 'Healthy' | 'Unhealthy' | 'NotApplicable';
}
export interface SubscriptionSecurityStatus {
    activeRecommendations: number;
    totalRecommendations: number;
    healthyResources: number;
    unhealthyResources: number;
    notApplicableResources: number;
}
//# sourceMappingURL=security.d.ts.map