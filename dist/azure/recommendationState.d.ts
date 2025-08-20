export interface RecommendationState {
    resourceId: string;
    recommendationId: string;
    subscriptionId: string;
    companyId: string;
    category: 'Cost' | 'Performance' | 'Security' | 'Reliability' | 'Operational Excellence';
    impact: 'High' | 'Medium' | 'Low';
    effort: 'High' | 'Medium' | 'Low';
    read: boolean;
    status: 'Active' | 'Prioritized' | 'Dismissed' | 'Archived';
    scheduledAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
    flagged: boolean;
    comments: Comment[];
    history: RecommendationHistory[];
}
export interface RecommendationHistory {
    userId: string;
    createdAt: Date;
    action: 'Dismiss' | 'Restore' | 'Prioritize' | 'Unprioritize' | 'Implement';
    reason?: string;
}
export interface Comment {
    comment: string;
    userId: string;
    createdAt: Date;
}
//# sourceMappingURL=recommendationState.d.ts.map