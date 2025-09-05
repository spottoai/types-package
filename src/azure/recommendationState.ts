// Base state interface for recommendations
export interface RecommendationState {
  // Partition Key: resourceId (Hash)
  resourceId: string;
  recommendationId: string; // Row Key
  subscriptionId: string;
  companyId: string; // Company ID to which the resource belongs
  category: 'Cost' | 'Performance' | 'Security' | 'Reliability' | 'Operational Excellence';
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  read: boolean; // true if the user has read the recommendation
  status: 'Active' | 'Prioritized' | 'Dismissed' | 'Archived';
  scheduledAt?: Date; // Date the recommendation was scheduled for
  createdAt: Date; // Date the recommendation state was created
  updatedAt?: Date; // Date the recommendation state was last updated
  flagged: boolean; // true if the recommendation is flagged
  comments: Comment[];
  history: RecommendationHistory[];
  custom: boolean;
}

export interface RecommendationHistory {
  userId: string;
  createdAt: Date;
  action: 'Dismiss' | 'Restore' | 'Prioritize' | 'Unprioritize' | 'Implement'; // restore means back from dismissed state
  reason?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}
