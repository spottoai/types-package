import type { PaginationParams } from '../common/pagination.js';
// Base (shared) alert enums/types for all alert categories
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export type AlertLifecycleEvent = 'open' | 'acknowledged' | 'resolved';
export type AlertCategory = 'cost' | 'performance' | 'other';
export type TagMatchMode = 'any' | 'all';

export interface BaseAlertTag {
  key: string;
  value: string;
}

export interface BaseAlertScope {
  subscriptionIds?: string[];
  tags?: BaseAlertTag[];
  tagMatch?: TagMatchMode;
}

export interface BaseAlertDestinationSlackOrTeams {
  name: string;
  webhookUrl?: string | null;
}

export interface BaseAlertDestinationWebhook {
  name: string;
  url?: string | null;
  /**
   * v1 defaults to sending only 'open'; when unspecified, treat as ['open'].
   */
  events?: AlertLifecycleEvent[];
  auth?: { type: 'bearer'; tokenRef?: string | null };
}

export interface BaseAlertDestinationJira {
  enabled: boolean;
  projectKey: string;
  issueType: string;
  labels?: string[];
  epicKey?: string;
}

export interface BaseAlertDestinations {
  slack?: BaseAlertDestinationSlackOrTeams[];
  teams?: BaseAlertDestinationSlackOrTeams[];
  webhooks?: BaseAlertDestinationWebhook[];
  jira?: BaseAlertDestinationJira;
  emails?: BaseAlertDestinationEmail[];
}

export interface BaseAlertDestinationEmail {
  name?: string;
  email?: string | null;
  events?: AlertLifecycleEvent[]; // default to ['open']
}

export interface BaseAlertDefinition<
  TCriteria = unknown,
  TDestinations = BaseAlertDestinations,
  TScope = BaseAlertScope,
  TType extends string = string,
> {
  id: string;
  companyId: string;
  name: string;
  enabled: boolean;
  category: AlertCategory;
  type: TType;
  scope: TScope;
  criteria?: TCriteria;
  destinations?: TDestinations;
  /**
   * Server-authored audit fields. Optional on create/update requests; always present on persisted records.
   */
  createdAt?: string;
  createdByUserId?: string;
  updatedAt?: string;
  updatedByUserId?: string;
}

export type BaseAlertSummary = Record<string, unknown>;

export interface BaseAlertComment {
  id: string;
  userId: string;
  userName?: string;
  message: string;
  createdAt: string;
  /**
   * Optional edit tracking; omit if edits are not supported.
   */
  updatedAt?: string;
  editedByUserId?: string;
}

export interface BaseAlertInstance<TSummary = BaseAlertSummary, TScope = BaseAlertScope, TType extends string = string, TBreakdown = unknown> {
  id: string;
  companyId: string;
  companyName: string;
  definitionId: string;
  category: AlertCategory;
  type: TType;
  status: AlertStatus;
  severity: AlertSeverity;
  scope: TScope;
  discriminator?: { kind: string; value: string };
  scopeSignature?: string;
  createdAt: string;
  /**
   * If not yet updated, set equal to createdAt.
   */
  lastSeenAt?: string;
  acknowledgedAt?: string | null;
  acknowledgedByUserId?: string | null;
  acknowledgedByUserName?: string | null;
  /**
   * Optional freeform note captured when acknowledging an alert.
   */
  acknowledgedNote?: string | null;
  resolvedAt?: string | null;
  resolvedByUserId?: string | null;
  resolvedByUserName?: string | null;
  /**
   * Optional freeform note captured when resolving an alert.
   */
  resolvedNote?: string | null;
  jiraIssueKey?: string;
  comments?: BaseAlertComment[];
  summary?: TSummary;
  breakdown?: TBreakdown;
  detailPath?: string;
}

export interface ListAlertsParams<TType extends string = string> extends PaginationParams {
  status?: AlertStatus;
  type?: TType;
  definitionId?: string;
  since?: string;
  until?: string;
}

export type ListAlertDefinitionsParams = PaginationParams;
