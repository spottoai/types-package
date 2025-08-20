import { Link } from './common.js';

export type RecommendationCategory =
  | 'Cost'
  | 'Performance'
  | 'Reliability'
  | 'Security'
  | 'OperationalExcellence'
  | 'Operational Excellence';

export interface RecommendationResources {
  recommendation: CustomAzureRecommendation;
  resourceIds: string[];
}

export interface Recommendation {
  id: string;
  type?: string; /// The type could be "Custom"
  name: string; // e.g. "Virtual Machine Low Memory Usage"
  category: RecommendationCategory;
  impact: 'High' | 'Medium' | 'Low';
  links?: Link[];
  risk?: string; // what is the risk of implementing the solution
  effort?: string; // the effort to implement the recommendation
  description?: string; // full description of the recommendation
  potentialBenefits?: string; // the potential benefits of implementing the recommendation
  remediation?: string; // the remediation for the recommendation
  resources?: ResourceReference[]; // array of resources that have this recommendation
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
  category: string; // e.g. Cost, Performance, Reliability, Security, OperationalExcellence, Operational Excellence, HighAvailability
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
