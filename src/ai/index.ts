// Common AI interfaces shared between frontend and backend

export type AIResponseStatus = 'complete' | 'needs_clarification' | 'needs_more_metrics';

export type RecommendationPillar = 'Cost Optimization' | 'Performance Efficiency' | 'Security' | 'Reliability' | 'Operational Excellence';

export type RecommendationType = 'advisor' | 'custom' | 'ai_generated';

export interface RecommendationAction {
  action: 'fix';
  recommendation_id: string;
}

export interface AIRecommendation {
  priority_rank: number;
  pillar: RecommendationPillar;
  description: string;
  type: RecommendationType;
  reference_ids: string[];
  actions: RecommendationAction[];
}

export interface StructuredAIResponse {
  status: AIResponseStatus;
  clarification_request: string | null;
  metrics_request: string[];
  friendly_message: string;
  recommendations: AIRecommendation[];
}

// Common PageContext interface - unified version
export interface PageContext {
  pageType: 'resource-detail' | 'recommendation-detail' | 'dashboard' | string;
  resourceId?: string;
  recommendationId?: string;
  subscriptionId?: string;
  pageUrl?: string;
}

// Common message interface for AI conversations
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string; // Date for backend, string for frontend
  structuredResponse?: StructuredAIResponse;
  responseId?: string; // Response ID for continuity
}
