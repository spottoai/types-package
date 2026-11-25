import type { EnvironmentType } from '../common/provider.js';

export interface EnvironmentReviewStartRequest {
  requestId: string;
  subscriptionIds: string[];
}

export interface EnvironmentReviewSubscription {
  subscriptionId: string;
  name: string;
  scanCompletedAt?: string;
  environmentType?: EnvironmentType;
}

export interface EnvironmentReviewEvidence {
  id: number;
  service: string;
  group?: string;
  region?: string;
  environment?: 'Production' | 'Non-Production';
}

/** A workload the review identified from resource groups, names, tags and services. */
export interface EnvironmentReviewWorkload {
  name: string;
  summary: string;
  /** Resource groups in the reviewed inventory that make up the workload. */
  resourceGroups: string[];
  environment?: 'Production' | 'Non-Production';
  /** Billed cost of the workload's resources in the last 30 days, in `EnvironmentReviewCost.currency`. */
  cost30Days?: number;
}

export interface EnvironmentReviewCostGroup {
  name: string;
  cost30Days: number;
  previous30Days?: number;
}

/** Deterministic 30-day cost totals from the reviewed scan, with an optional model-written explanation. */
export interface EnvironmentReviewCost {
  currency: string;
  last30Days: number;
  previous30Days?: number;
  topResourceGroups: EnvironmentReviewCostGroup[];
  narrative?: string;
}

/** A recommendation from the same completed scan. */
export interface EnvironmentReviewOpportunity {
  headline: string;
  category?: string;
  impact?: string;
  monthlySavings?: number;
  resourcesCount?: number;
}

export interface EnvironmentReviewInventorySummary {
  resourceCount: number;
  resourceGroupCount: number;
  regions: string[];
  topServices: { service: string; count: number }[];
  /** Share (0-1) of resources carrying a recognised environment tag. */
  environmentTagCoverage: number;
}

export type EnvironmentReviewConfidence = 'high' | 'medium' | 'low';

export interface EnvironmentReviewProposal {
  scanCompletedAt: string;
  newerScanAvailable?: boolean;
  /** One-line description of what the subscription is for. Absent on runs created before the narrative review. */
  headline?: string;
  /** Private engineer narrative. */
  purpose: string;
  workloads?: EnvironmentReviewWorkload[];
  environmentType?: EnvironmentType;
  classificationReason: string;
  classificationConfidence?: EnvironmentReviewConfidence;
  partialInventory: boolean;
  inventory?: EnvironmentReviewInventorySummary;
  cost?: EnvironmentReviewCost;
  opportunities?: EnvironmentReviewOpportunity[];
  risks?: string[];
  evidence: EnvironmentReviewEvidence[];
  purposeEvidenceIds: number[];
  followUpQuestions: string[];
  /** Coarse scope-local description suitable for the account Notes audience. Never contains costs. */
  notesSuggestion: string;
  currentNotes?: string;
  currentEnvironmentType?: EnvironmentType;
}

export interface EnvironmentReviewScopeResult {
  subscriptionId: string;
  name: string;
  status: 'queued' | 'running' | 'ready' | 'saved' | 'dismissed' | 'unavailable' | 'failed';
  proposal?: EnvironmentReviewProposal;
}

export interface EnvironmentReviewRun {
  runId: string;
  createdAt: string;
  expiresAt: string;
  status: 'queued' | 'running' | 'complete';
  scopes: EnvironmentReviewScopeResult[];
}

export interface EnvironmentReviewSaveRequest {
  requestId: string;
  changes: {
    subscriptionId: string;
    notes?: string;
    environmentType?: EnvironmentType;
    confirmClassification?: boolean;
    confirmNotes?: boolean;
  }[];
}

export interface EnvironmentReviewSaveResponse {
  outcomes: { subscriptionId: string; status: 'saved' | 'conflict' | 'failed' }[];
}
