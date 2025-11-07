export interface EventStatus {
  /** PartitionKey */
  eventId: string;
  /** RowKey（ objectType + objectId） */
  objectKey: string;
  label: string;
  /** dismiss / implement / restore / share / process … */
  event: string;
  /** recommendation / notification / subscription … */
  eventDomain: string;
  /** recommendation / resource / subscription / notification */
  objectType: string;
  objectId?: string;
  subjectId?: string;
  /** resource / subscription */
  scope?: string;
  /** Success / Failed / Processing / Requested */
  status: string;
  /** ISO timestamp */
  statusAt: string;
  statusHistory: Array<{ status: string; occurredAt: string }>;
  subscriptionId?: string;
  tenantId?: string;
  companyId?: string;
  errorMessage?: string;
  errorStack?: string[];
  /** ticket/url */
  sharedWith?: string[];
  /** email / slack / jira … */
  channel?: string;
  userId?: string;
  context?: Record<string, unknown>;
}

export interface UserEvent {
  /** PartitionKey */
  userId: string;
  /** RowKey */
  eventId: string;
  objectKey?: string;
  label: string;
  event: string;
  eventDomain: string;
  objectType: string;
  objectId?: string;
  subjectId?: string;
  status: string;
  statusAt: string;
  subscriptionId?: string;
  tenantId?: string;
  companyId?: string;
  errorMessage?: string;
  channel?: string;
  sharedWith?: string[];
  lastStatusRead: boolean;
}
