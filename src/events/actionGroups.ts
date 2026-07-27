export interface ActionGroupEmailAction {
  name?: string;
  email: string;
}

export interface ActionGroupSlackOrTeamsAction {
  name: string;
  webhookUrl: string;
}

export interface ActionGroupWebhookAction {
  name: string;
  url: string;
  auth?: {
    type: 'bearer';
    tokenRef?: string;
  };
}

export interface ActionGroupJiraAction {
  enabled: true;
  projectKey: string;
  issueType: string;
  labels?: string[];
  epicKey?: string;
}

export interface ActionGroupActions {
  emails?: ActionGroupEmailAction[];
  slack?: ActionGroupSlackOrTeamsAction[];
  teams?: ActionGroupSlackOrTeamsAction[];
  webhooks?: ActionGroupWebhookAction[];
  jira?: ActionGroupJiraAction;
}

export interface ActionGroup {
  id: string;
  companyId: string;
  name: string;
  actions: ActionGroupActions;
  createdAt: string;
  createdByUserId: string;
  updatedAt: string;
  updatedByUserId: string;
}

export interface ActionGroupCounts {
  emails: number;
  slack: number;
  teams: number;
  webhooks: number;
  jira: number;
  total: number;
}

export interface ActionGroupSummary {
  id: string;
  companyId: string;
  name: string;
  counts: ActionGroupCounts;
  usageCount: number;
  alertUsageCount: number;
  notificationUsageCount: number;
  createdAt: string;
  createdByUserId: string;
  updatedAt: string;
  updatedByUserId: string;
}

export interface ActionGroupRecipientPreview {
  emails: Array<Pick<ActionGroupEmailAction, 'name' | 'email'>>;
  slack: Array<Pick<ActionGroupSlackOrTeamsAction, 'name'>>;
  teams: Array<Pick<ActionGroupSlackOrTeamsAction, 'name'>>;
  webhooks: Array<Pick<ActionGroupWebhookAction, 'name'>>;
  hasJira: boolean;
}

export interface ActionGroupPreview extends ActionGroupSummary {
  recipients: ActionGroupRecipientPreview;
}

export interface ActionGroupDestinationPreview {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'jira';
  label: string;
}

export interface ActionGroupListItem extends ActionGroupSummary {
  destinationPreviews: ActionGroupDestinationPreview[];
  remainingDestinationCount: number;
}

export interface ActionGroupListResponse {
  results: ActionGroupListItem[];
}

export type CreateActionGroupInput = Pick<ActionGroup, 'name' | 'actions'>;
export type UpdateActionGroupInput = Pick<ActionGroup, 'name' | 'actions'>;
