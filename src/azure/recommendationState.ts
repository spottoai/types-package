/** Base state interface for recommendations */
export interface RecommendationState {
  /** Partition Key: resourceId (Hash) */
  resourceId: string;
  /** Row Key */
  recommendationId: string;
  subscriptionId: string;
  /** Company ID to which the resource belongs */
  companyId: string;
  category: 'Cost' | 'Performance' | 'Security' | 'Compliance' | 'Reliability' | 'Operational Excellence';
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  /** true if the user has read the recommendation */
  read: boolean;
  status: 'Active' | 'Prioritized' | 'Dismissed' | 'Archived';
  /** Date the recommendation was scheduled for */
  scheduledAt?: Date;
  /** Date the recommendation state was created */
  createdAt: Date;
  /** Date the recommendation state was last updated */
  updatedAt?: Date;
  /** true if the recommendation is flagged */
  flagged: boolean;
  comments: Comment[];
  history: RecommendationHistory[];
  custom: boolean;
  /** Date when the status started */
  statusStartAt?: string;
  /** Date when the status is expected to change */
  statusEndAt?: string;
}

export interface RecommendationHistory {
  userId: string;
  createdAt: Date;
  /** restore means back from dismissed state */
  action: 'Dismiss' | 'Restore' | 'Prioritize' | 'Unprioritize' | 'Implement';
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
