// Types for recommendation actions that are not available in @spotto/types-package

export interface RecommendationActionRequest {
  recommendationId: string;
  subscriptionId: string;
  resourceIds: string[];
  resourceGroupName?: string;
  companyId: string;
}

export interface DismissRecommendationRequest extends RecommendationActionRequest {
  dismissReason: string;
}

export interface RecommendationActionResponse {
  success: boolean;
  message?: string;
  affectedResources?: string[];
}
