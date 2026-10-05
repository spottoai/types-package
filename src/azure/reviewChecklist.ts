import type { CloudAccountAuthMode } from '../accounts/accounts.js';
import type { AzureGuestAccessSubscriptionMessageMetadata } from './payloads.js';
import type { CommentMention, CommentNotificationContext } from './recommendationState.js';

export interface ReviewChecklistRequest {
  tenantId?: string;
  subscriptionIds: string[];
  checklistId?: string;
  categories?: string[];
  onlyFailed?: boolean;
  limitEvidence?: number;
}

export interface ReviewChecklistPayload extends ReviewChecklistRequest {
  cloudAccountId: string;
  companyId?: string;
  authMode?: CloudAccountAuthMode;
  guestAccessRunId?: string;
  metadata?: AzureGuestAccessSubscriptionMessageMetadata & { guestAccessRunId?: string };
}

export interface ReviewChecklistScanRequest {
  cloudAccountId: string;
  subscriptionId: string;
}

export type ReviewChecklistItemStatus = 'NotVerified' | 'Open' | 'Fulfilled' | 'Error' | 'NotRequired' | 'NA';
export type ReviewChecklistProviderName = 'azure' | 'aws';
export type ReviewChecklistAssessmentMode = 'manual' | 'automated';

/** Stored evidence references; their presence alone never proves compliance. */
export interface ReviewChecklistAssessmentEvidence {
  source: string;
  observedAt?: string;
  controlIds?: string[];
  regions?: string[];
  resourceIds?: string[];
  findingIds?: string[];
}

export interface ReviewChecklistItem {
  guid: string;
  assessmentMode?: ReviewChecklistAssessmentMode;
  id?: string;
  category?: string;
  subcategory?: string;
  text?: string;
  description?: string;
  severity?: string;
  waf?: string;
  service?: string;
  topics?: string[];
  link?: string;
  training?: string;
  headline?: string;
  plainSummary?: string;
  effortHours?: number;
  effortReason?: string;
  graph?: string;
  hasGraph?: boolean;
  graphSourceAI?: boolean;
}

export interface ReviewChecklistItemState {
  guid: string;
  providerName?: ReviewChecklistProviderName;
  checklistId: string;
  subscriptionId: string;
  status?: ReviewChecklistItemStatus;
  statusSource?: 'system' | 'user';
  comments?: string;
  mentions?: CommentMention[];
  notificationContext?: CommentNotificationContext;
  lastUpdated?: string;
  updatedBy?: string;
  updatedByUserId?: string;
}

export interface ReviewChecklistItemStateUpdateRequest {
  companyId?: string;
  /** AWS status precondition: the definition version observed by the client. */
  sourceVersion?: string;
  /** AWS connection precondition; authorization derives the authoritative binding. */
  cloudAccountId?: string;
  status?: ReviewChecklistItemStatus;
  comments?: string;
  mentions?: CommentMention[];
  notificationContext?: CommentNotificationContext;
}

export interface ReviewChecklistDefinition {
  checklistId: string;
  providerName?: ReviewChecklistProviderName;
  source?: {
    commit?: string;
    syncedAt?: string;
  };
  metadata?: {
    name?: string;
    state?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
  categories?: string[];
  items: ReviewChecklistItem[];
}

export interface ReviewChecklistItemResult {
  guid: string;
  status: ReviewChecklistItemStatus;
  compliantCount: number;
  nonCompliantCount: number;
  compliantIds: string[];
  nonCompliantIds: string[];
  error?: string;
}

export interface ReviewChecklistItemOutput extends ReviewChecklistItemResult {
  assessmentMode?: ReviewChecklistAssessmentMode;
  assessmentReason?: string;
  assessmentEvidence?: ReviewChecklistAssessmentEvidence;
  id: string | null;
  category: string | null;
  subcategory: string | null;
  text: string | null;
  description: string | null;
  severity: string | null;
  waf: string | null;
  service: string | null;
  link: string | null;
  training: string | null;
  headline: string | null;
  plainSummary: string | null;
  effortHours: number | null;
  effortReason: string | null;
  hasGraph: boolean | null;
  graphSourceAI: boolean | null;
  comments?: string | null;
  mentions?: CommentMention[];
  notificationContext?: CommentNotificationContext;
  statusSource?: 'system' | 'user';
  lastUpdated?: string | null;
  updatedBy?: string | null;
}

export interface ReviewChecklistSubscriptionResult {
  subscriptionId: string;
  items: ReviewChecklistItemOutput[];
}

export type ChecklistScanStatus = 'Completed' | 'Failed' | 'In Progress' | 'NotRun';

export interface ReviewChecklistDocument {
  checklistId: string;
  /** Optional async assessment receipt, used by provider-neutral refresh consumers. */
  requestId?: string;
  requestedAt?: string;
  providerName?: ReviewChecklistProviderName;
  companyId?: string;
  cloudAccountId?: string;
  providerScopeId?: string;
  tenantId: string;
  subscriptionId: string;
  sourceVersion?: string;
  name: string | null;
  state: string | null;
  timestamp: string | null;
  scanStatus: ChecklistScanStatus;
  /** ISO 8601 timestamp */
  generatedAt: string;
  items: ReviewChecklistItemOutput[];
}

export interface ReviewChecklistRunResult {
  checklistId: string;
  tenantId: string;
  sourceVersion?: string;
  name: string | null;
  state: string | null;
  timestamp: string | null;
  scanStatus: ChecklistScanStatus;
  generatedAt: string;
  subscriptions: ReviewChecklistSubscriptionResult[];
}

export type ReviewChecklistCatalogueState = 'Preview' | 'preview' | 'GA' | 'Deprecated' | string | null;

export interface ReviewChecklistCatalogueEntry {
  id: string;
  providerName?: ReviewChecklistProviderName;
  name: string;
  serviceName: string;
  state: ReviewChecklistCatalogueState;
  /** ISO 8601 date (YYYY-MM-DD) */
  lastModified: string;
  star: boolean;
}

export type ReviewChecklistCatalogue = ReviewChecklistCatalogueEntry[];
