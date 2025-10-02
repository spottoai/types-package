export interface SecurityImpact {
    subscriptionId: string;
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
//# sourceMappingURL=security.d.ts.map