export interface RecommendationState {
    resourceId: string;
    recommendationId: string;
    subscriptionId: string;
    category: 'Cost' | 'Performance' | 'Security' | 'Reliability' | 'Operational Excellence';
    impact: 'High' | 'Medium' | 'Low';
    effort: 'High' | 'Medium' | 'Low';
    read: boolean;
    status: 'Active' | 'Prioritized' | 'Postponed' | 'Dismissed' | 'Completed' | 'Archived';
    scheduledAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
    flagged: boolean;
    comments: Comment[];
    history: RecommendationHistory[];
    customerId: string;
    custom: boolean;
}
export interface RecommendationHistory {
    userId: string;
    createdAt: Date;
    action: 'Dismiss' | 'Postpone' | 'Prioritize';
    reason?: string;
}
export interface Comment {
    comment: string;
    userId: string;
    createdAt: Date;
}
//# sourceMappingURL=recommendationStates.d.ts.map