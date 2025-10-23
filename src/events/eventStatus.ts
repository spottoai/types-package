export interface EventStatus {
  eventId: string; //  PartitionKey
  objectKey: string; //  RowKey（ objectType + objectId）
  label: string;
  event: string; // dismiss / implement / restore / share / process …
  eventDomain: string; // recommendation / notification / subscription …
  objectType: string; // recommendation / resource / subscription / notification
  objectId?: string;
  subjectId?: string;
  scope?: string; // resource / subscription
  status: string; // Success / Failed / Processing / Requested
  statusAt: string; // ISO timestamp
  statusHistory: Array<{ status: string; occurredAt: string }>;
  subscriptionId?: string;
  tenantId?: string;
  companyId?: string;
  errorMessage?: string;
  errorStack?: string[];
  sharedWith?: string[]; // ticket/url
  channel?: string; // email / slack / jira …
  userId?: string;
  context?: Record<string, unknown>;
}

export interface UserEvent {
  userId: string; // PartitionKey
  eventId: string; // RowKey
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
