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
//# sourceMappingURL=security.d.ts.map