import type { ConnectWiseRoutingFields } from './recommendations';
import type { AutotaskShareOverrides } from '../integrations/autotask';
import type { AzureDevOpsShareOverrides } from '../integrations/azureDevOps';
import type { GitHubShareOverrides } from '../integrations/github';
import type { HaloRoutingOverrides } from '../integrations/halo';

export const WORK_ITEM_LANES = ['prioritized', 'todo', 'in-progress', 'completed'] as const;
export const DEFAULT_WORK_BOARD_ID = 'kanban';
export const WORK_ITEM_EXTERNAL_TICKET_PROVIDERS = ['jira', 'halo', 'connectwise', 'autotask', 'azuredevops', 'github'] as const;
export const WORK_ITEM_SHARE_CHANNELS = ['email', ...WORK_ITEM_EXTERNAL_TICKET_PROVIDERS] as const;

export type WorkItemLane = (typeof WORK_ITEM_LANES)[number];

export type WorkItemSourceType =
  | 'recommendation'
  | 'service-retirement'
  | 'resource'
  | 'backup'
  | 'commitments-purchase-recommendation'
  | 'commitments-renewal'
  | 'governance-finding'
  | 'governance-policy-assignment'
  | 'governance-policy-exemption'
  | 'governance-rbac-assignment'
  | 'governance-privileged-assignment'
  | 'governance-custom-role'
  | 'perimeter-public-ip'
  | 'health-event'
  | 'hybrid-benefit'
  | 'change-activity'
  | 'review-checklist-item'
  | 'alert-instance'
  | 'collection';

export type WorkItemExternalTicketProvider = (typeof WORK_ITEM_EXTERNAL_TICKET_PROVIDERS)[number];
export type WorkItemShareChannel = (typeof WORK_ITEM_SHARE_CHANNELS)[number];

export interface WorkItemSourceReference {
  sourceType: WorkItemSourceType;
  sourceId: string;
  providerName?: string;
  providerScopeId?: string;
  subscriptionId?: string;
  resourceId?: string;
  groupId?: string;
}

export interface WorkItemDeepLink {
  path: string;
  label?: string;
  context?: Record<string, unknown>;
}

export interface WorkItemSnapshot {
  title: string;
  summary?: string;
  category?: string;
  impact?: string;
  effort?: string;
  status?: string;
  subscriptionId?: string;
  subscriptionIds?: string[];
  subscriptionName?: string;
  resourceId?: string;
  resourceName?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface WorkItem {
  workItemId: string;
  companyId: string;
  boardId: string;
  lane: WorkItemLane;
  laneOrder: number;
  swimLaneId?: string;
  sourceType: WorkItemSourceType;
  sourceId: string;
  title: string;
  summary?: string;
  sourceReferences?: WorkItemSourceReference[];
  snapshot?: WorkItemSnapshot;
  deepLink?: WorkItemDeepLink;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WorkItemQuery {
  companyId: string;
  boardId?: string;
  lanes?: WorkItemLane[];
  sourceTypes?: WorkItemSourceType[];
  search?: string;
  limit?: number;
}

export interface UpsertWorkItemRequest {
  workItemId?: string;
  companyId: string;
  boardId?: string;
  lane: WorkItemLane;
  laneOrder?: number;
  swimLaneId?: string | null;
  sourceType: WorkItemSourceType;
  sourceId: string;
  title: string;
  summary?: string;
  sourceReferences?: WorkItemSourceReference[];
  snapshot?: WorkItemSnapshot;
  deepLink?: WorkItemDeepLink;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateWorkItemLaneRequest {
  lane: WorkItemLane;
  laneOrder: number;
  swimLaneId?: string | null;
  updatedAt?: string;
}

export interface WorkItemLaneBatchUpdate extends UpdateWorkItemLaneRequest {
  workItemId: string;
}

export interface WorkItemCardListResponse {
  items: WorkItem[];
  limit: number;
  truncated: boolean;
}

export interface ShareWorkItemRequest {
  shareType: WorkItemShareChannel;
  recipients?: string[];
  message?: string;
  targetCompanyId?: string;
  halo?: HaloRoutingOverrides;
  connectwise?: ConnectWiseRoutingFields;
  autotask?: AutotaskShareOverrides;
  azuredevops?: AzureDevOpsShareOverrides;
  github?: GitHubShareOverrides;
}

export interface WorkItemShareDetail {
  label: string;
  value: string;
}

/**
 * Server-produced, bounded representation used by external ticket integrations.
 * Clients must never be allowed to submit this projection directly.
 */
export interface WorkItemShareProjection {
  workItemId: string;
  sourceType: WorkItemSourceType;
  sourceId: string;
  title: string;
  summary?: string;
  category?: string;
  impact?: string;
  effort?: string;
  status?: string;
  subscriptionIds: string[];
  subscriptionNames: string[];
  subscriptionCount: number;
  resourceIds: string[];
  resourceCount: number;
  details: WorkItemShareDetail[];
  sourcePath?: string;
  sourceLabel?: string;
}

export interface WorkItemShareQueueMessage extends ShareWorkItemRequest {
  action: 'share';
  entity: 'work-item';
  companyId: string;
  boardId: string;
  workItem: WorkItemShareProjection;
  originUrl?: string;
  integrationCompanyId?: string;
  byUserId?: string;
  byUserDisplayName?: string;
  requestId: string;
  shareRequestId: string;
  eventId: string;
}

export type WorkItemUpsertRequest = UpsertWorkItemRequest;

export type WorkItemLaneUpdateRequest = UpdateWorkItemLaneRequest;
