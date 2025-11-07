export interface SecurityImpact {
  id?: string;
  controlDisplayName: string;
  controlName: string;
  /** Recommendation ids */
  recommendationIds: string[];
  notApplicableResourceCount: number;
  unhealthyResourceCount: number;
  healthyResourceCount: number;
  totalResourceCount: number;
  maxScore: number;
  currentScore: number;
  potentialScoreIncrease: number;
}

/** For individual resource status */
export interface SecurityAssessmentStatus {
  resourceId: string;
  status: 'Healthy' | 'Unhealthy' | 'NotApplicable';
}

/** For subscription level */
export interface SubscriptionSecurityStatus {
  activeRecommendations: number;
  totalRecommendations: number;
  healthyResources: number;
  unhealthyResources: number;
  notApplicableResources: number;
}
