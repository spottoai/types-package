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
    createdAt: string;
    createdByUserId: string;
    updatedAt: string;
    updatedByUserId: string;
}
export interface ActionGroupListResponse {
    results: ActionGroupSummary[];
}
export type CreateActionGroupInput = Pick<ActionGroup, 'name' | 'actions'>;
export type UpdateActionGroupInput = Pick<ActionGroup, 'name' | 'actions'>;
//# sourceMappingURL=actionGroups.d.ts.map