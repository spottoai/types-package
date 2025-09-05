export interface RecommendationState {
  // Partition Key: resourceId (Hash)
  resourceId: string;
  recommendationId: string; // Row Key
  subscriptionId: string;
  category: 'Cost' | 'Performance' | 'Security' | 'Reliability' | 'Operational Excellence';
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  read: boolean; // true if the user has read the recommendation
  status: 'Active' | 'Prioritized' | 'Postponed' | 'Dismissed' | 'Completed' | 'Archived';
  scheduledAt?: Date; // Date the recommendation was scheduled for
  createdAt: Date; // Date the recommendation state was created
  updatedAt?: Date; // Date the recommendation state was last updated
  flagged: boolean; // true if the recommendation is flagged
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
