import { Comment, RecommendationHistory } from './recommendationState';

export enum RecommendationCategory {
  Cost = 'Cost',
  Performance = 'Performance',
  Reliability = 'Reliability',
  Security = 'Security',
  Compliance = 'Compliance',
  OperationalExcellence = 'OperationalExcellence',
  OperationalExcellenceAlternative = 'Operational Excellence',
}
export interface RecommendationResources {
  recommendation: CustomAzureRecommendation;
  resourceIds: string[];
}

export interface Recommendation {
  id: string;
  name: string;
  category: RecommendationCategory;
  type?: string; // custom
  description?: string;
  remediation?: string;
  impact: string;
  links?: { name: string; url: string }[];
  considerations?: string;
  potentialBenefits?: string;
  effort?: string;
  costImpact?: number;
  performanceImpact?: number;
  confidencePercentage?: number;
  resources?: ResourceReference[]; // array of resources that have this recommendation

  // Deprecated fields, kept for compatibility
  subcategory?: string;
  solution?: string;
  source?: string;
  service?: string;
}

export interface RecommendationSummary {
  category: RecommendationCategory;
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface ResourceId {
  id: string;
}

export interface ResourceReference {
  id: string;
  name: string;
}

export interface ReliabilityRecommendation extends Recommendation {
  referenceID: string;
  resourceType: string;
  resourceTypeShortName: string;
  service: string;
}

export interface CustomAzureRecommendation extends Recommendation {
  subcategory: string;
  service: string;
  source: string;
  fileName: string;
}

export interface RecommendationCollection {
  recommendation: CustomAzureRecommendation;
  results: ResourceId[];
}

export interface AzureRecommendationLite {
  category: string; // e.g. Cost, Performance, Reliability, Security, Compliance, OperationalExcellence, Operational Excellence, HighAvailability
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface RecommendationStats {
  total: number; // total number of recommendations in the subscription
  high: number; // total number of high recommendations in the subscription
  medium: number; // total number of medium recommendations in the subscription
  low: number; // total number of low recommendations in the subscription
}

// Recommendation with state information, name "ExtendedRecommendation" in the portal at the moment
export interface RecommendationWithState extends Recommendation {
  status?: 'Active' | 'Prioritized' | 'Postponed' | 'Dismissed' | 'Completed' | 'Archived';
  read?: boolean;
  scheduledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  flagged?: boolean;
  comments?: Comment[];
  history?: RecommendationHistory[];
}
