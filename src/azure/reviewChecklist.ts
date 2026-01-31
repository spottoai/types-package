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
}

export interface ReviewChecklistScanRequest {
  cloudAccountId: string;
  subscriptionIds: string[];
}

export type ReviewChecklistItemStatus = 'NotVerified' | 'Open' | 'Fulfilled' | 'Error';

export interface ReviewChecklistItem {
  guid: string;
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

export interface ReviewChecklistDefinition {
  checklistId: string;
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
}

export interface ReviewChecklistSubscriptionResult {
  subscriptionId: string;
  items: ReviewChecklistItemOutput[];
}

export type ChecklistScanStatus = 'Completed' | 'Failed' | 'In Progress';

export interface ReviewChecklistDocument {
  checklistId: string;
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
  name: string;
  state: ReviewChecklistCatalogueState;
  /** ISO 8601 date (YYYY-MM-DD) */
  lastModified: string;
}

export type ReviewChecklistCatalogue = ReviewChecklistCatalogueEntry[];
