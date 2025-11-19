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
  /** custom */
  type?: string;
  description?: string;
  remediation?: string;
  impact: string;
  impactReason?: string;
  links?: { name: string; url: string }[];
  considerations?: string;
  potentialBenefits?: string;
  effort?: string;
  effortReason?: string;
  /** e.g. 10 hours */
  effortHours?: number;
  risk?: string;
  riskReason?: string;
  /** Could deprecate later */
  costImpact?: number;
  costImpactReason?: string;
  costImpactDetails?: CostImpactDetails;
  performanceImpact?: number;
  performanceImpactReason?: string;
  confidencePercentage?: number;
  confidenceReason?: string;
  /** array of resources that have this recommendation */
  resources?: ResourceReference[];
  /** only for security recommendations */
  securityImpactDetails?: SecurityImpact;
  /** whether the recommendation has been resolved or not, eg, Security Assessment is "Healthy" should be true */
  resolved?: boolean;
  securityAssessmentStatuses?: SecurityAssessmentStatus[];
  /** Deprecated fields, kept for compatibility */
  subcategory?: string;
  solution?: string;
  source?: string;
  service?: string;
  /**
   * Stored as string to allow JSON persistence.
   * Uses a different name to avoid conflict with RecommendationWithState.createdAt.
   */
  createdTime?: string;
  /** Avoids conflict with RecommendationWithState.updatedAt */
  lastUpdatedTime?: string;
}

export interface CostImpactDetails {
  /** e.g. "Saving Plan", "Reserved Instance", "Windows migration to Linux" */
  name: string;
  monthlySavings?: number;
  currentSpend?: number;
  /** e.g. 20 for 20% */
  savingPercentage?: number;
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
  savings?: SavingsPotential;
  currency?: string;
  currencySymbol?: string;
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
  savings?: SavingsPotential;
  currency?: string;
  currencySymbol?: string;
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
  /** e.g. Cost, Performance, Reliability, Security, Compliance, OperationalExcellence, Operational Excellence, HighAvailability */
  category: string;
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface RecommendationStats {
  /** total number of recommendations in the subscription */
  total: number;
  /** total number of high recommendations in the subscription */
  high: number;
  /** total number of medium recommendations in the subscription */
  medium: number;
  /** total number of low recommendations in the subscription */
  low: number;
}

/** Recommendation with state information, name "ExtendedRecommendation" in the portal at the moment */
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
  shareType: 'email' | 'slack' | 'teams' | 'jira' | 'halo' | 'connectwise';
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

export interface ServiceRetirementRecommendation {
  Id: number;
  ServiceName: string;
  RetiringFeature: string;
  RetirementDate: string;
  Link: string;
  effort: string;
  effortHours: number;
  effortReason: string;
  risk: string;
  riskReason: string;
  considerations: string;
  confidencePercentage: number;
  confidenceReason: string;
  lastProcessedAt: string;
}

export interface JiraShareDetails {
  projectKey?: string;
  epicKey?: string;
  label?: string;
}

export interface JiraIntegrationRequestBase {
  siteUrl: string;
  email: string;
  secret?: string;
  useStoredSecret?: boolean;
}

export interface JiraIntegrationTestPayload extends JiraIntegrationRequestBase {
  projectKey?: string;
}

export interface JiraIntegrationEpicsPayload extends JiraIntegrationRequestBase {
  projectKey: string;
  maxResults?: number;
}

export interface JiraIntegrationProjectsPayload extends JiraIntegrationRequestBase {
  maxResults?: number;
}

export interface JiraIntegrationLabelsPayload extends JiraIntegrationRequestBase {
  projectKey: string;
  maxResults?: number;
  searchQuery?: string;
}

export interface JiraEntity {
  id: string;
  key: string;
  name: string;
}

export interface JiraLabel {
  name: string;
}
