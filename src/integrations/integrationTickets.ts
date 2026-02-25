import { PaginationResult } from '../common';
import { IntegrationProvider } from '../company';

export type IntegrationTicketReferenceType = 'recommendation';

export interface IntegrationTicketRecord {
  /** PartitionKey */
  companyId: string;
  /** RowKey */
  rowKey: string;
  /** ISO timestamp */
  createdAt: string;
  createdMs: number;
  provider: IntegrationProvider;
  ticketId: string;
  ticketUrl?: string;
  subscriptionId?: string;
  referenceType: IntegrationTicketReferenceType;
  referenceId: string;
  resourceIds?: string[];
  referenceUrl?: string;
  recommendationTitle?: string;
  resourceType?: string;
  resourceName?: string;
  shareMessage?: string;
  reportedBy?: string;
  recommendationRisk?: string;
  recommendationImpact?: string;
  recommendationScore?: string;
  recommendationEffort?: string;
  recommendationEffortHours?: string;
  integrationCompanyId?: string;
  eventId?: string;
  correlationId?: string;
}

export type IntegrationTicketStatusCategory = 'open' | 'in_progress' | 'closed' | 'unknown';

export interface IntegrationTicketStatus {
  status?: string;
  statusCategory: IntegrationTicketStatusCategory;
  summary?: string;
  assignee?: string;
  priority?: string;
  /** ISO timestamp */
  updatedAt?: string;
  url?: string;
  error?: string;
}

export type IntegrationTicketListResponse = PaginationResult<IntegrationTicketRecord>;

export interface IntegrationTicketStatusRequestItem {
  provider: IntegrationProvider;
  ticketId: string;
  integrationCompanyId?: string;
  rowKey?: string;
  ticketUrl?: string;
}

export interface IntegrationTicketStatusBatchRequest {
  tickets: IntegrationTicketStatusRequestItem[];
}

export interface IntegrationTicketStatusBatchItem {
  provider: IntegrationProvider;
  ticketId: string;
  integrationCompanyId?: string;
  rowKey?: string;
  status: IntegrationTicketStatus;
}

export interface IntegrationTicketStatusBatchResponse {
  tickets: IntegrationTicketStatusBatchItem[];
}
