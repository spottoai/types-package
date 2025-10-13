import { Comment, RecommendationHistory } from './recommendationState';
import { SecurityAssessmentStatus, SecurityImpact, SubscriptionSecurityStatus } from './security';
import { SubscriptionSummaryLite } from './subscriptions';
import { SavingsPotential } from './views';

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
  impactReason?: string;
  links?: { name: string; url: string }[];
  considerations?: string;
  potentialBenefits?: string;
  effort?: string;
  effortReason?: string;
  risk?: string;
  riskReason?: string;
  costImpact?: number; // Could deprecate later
  costImpactReason?: string;
  costImpactDetails?: CostImpactDetails;
  performanceImpact?: number;
  performanceImpactReason?: string;
  confidencePercentage?: number;
  confidenceReason?: string;
  resources?: ResourceReference[]; // array of resources that have this recommendation
  securityImpactDetails?: SecurityImpact; // only for security recommendations
  resolved?: boolean; // whether the recommendation has been resolved or not, eg, Security Assessment is "Healthy" should be true
  securityAssessmentStatuses?: SecurityAssessmentStatus[];
  // Deprecated fields, kept for compatibility
  subcategory?: string;
  solution?: string;
  source?: string;
  service?: string;
  // need to be string to be store in json
  createdTime?: string; // need to have different name to avoid conflict with createdAt with RecommendationWithState
  lastUpdatedTime?: string; // need to have different name to avoid conflict with updatedAt with RecommendationWithState
}

export interface CostImpactDetails {
  name: string; // e.g. "Saving Plan", "Reserved Instance", "Windows migration to Linux"
  monthlySavings?: number;
  currentSpend?: number;
  savingPercentage?: number; // e.g. 20 for 20%
  minMonthlySavings?: number;
  maxMonthlySavings?: number;
}

export interface RecommendationSummary {
  category: RecommendationCategory;
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface RecommendationWithResources {
  recommendation: Recommendation;
  resources: RecommendationResource[];
  savings?: SavingsPotential;
}

export interface RecommendationResource {
  id: string;
  name: string;
  type: string;
  spend: number;
  spendAmortized: number;
}

export interface RecommendationsView {
  recommendations: RecommendationWithResources[];
  securityImpactDetails?: SecurityImpact[];
  subscriptionSecurityStatus?: SubscriptionSecurityStatus;
  savings?: SavingsPotential;
  subscription: SubscriptionSummaryLite;
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

export interface DismissRecommendationRequest extends RecommendationActionRequest {
  dismissReason: string;
}

export interface ShareRecommendationRequest extends RecommendationActionRequest {
  shareType: 'email' | 'slack' | 'teams';
  email?: string;
}

export interface RecommendationActionRequest {
  recommendationId: string;
  recommendationTitle?: string;
  subscriptionId: string;
  resourceIds: string[];
  resourceGroupName?: string;
  companyId: string;
  byUserId?: string;
}

export interface RecommendationActionResponse {
  success: boolean;
  message?: string;
  affectedResources?: string[];
}

interface test {
  a: string;
}
