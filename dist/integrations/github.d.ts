export type GitHubId = string | number;
export type GitHubAuthMode = 'githubApp' | 'fineGrainedPat';
export type GitHubFieldValue = string | number | boolean;
export interface GitHubCustomFields {
    [fieldName: string]: GitHubFieldValue;
}
export interface GitHubRepositoryFields {
    owner?: string;
    repo?: string;
    repositoryId?: GitHubId;
}
export interface GitHubRoutingFields extends GitHubRepositoryFields {
    labels?: string[];
    assignees?: string[];
    milestone?: GitHubId;
    issueType?: string;
    defaultTitlePrefix?: string;
    customFields?: GitHubCustomFields;
}
export interface GitHubCredentialFields {
    authMode?: GitHubAuthMode;
    appId?: string;
    installationId?: string;
    useStoredSecret?: boolean;
    useParentCredentials?: boolean;
    credentialOwnerCompanyId?: string;
}
export interface GitHubIntegrationConfig extends GitHubCredentialFields, GitHubRoutingFields {
    enabled?: boolean;
    privateKey?: string;
    pat?: string;
}
export interface GitHubIntegrationSanitizedConfig extends Omit<GitHubIntegrationConfig, 'privateKey' | 'pat'> {
    hasStoredPrivateKey?: boolean;
    hasStoredPat?: boolean;
}
export interface GitHubIntegrationRequestBase extends GitHubCredentialFields, GitHubRepositoryFields {
    privateKey?: string;
    pat?: string;
}
export interface GitHubIntegrationMetadataPayload extends GitHubIntegrationRequestBase {
    searchQuery?: string;
    maxResults?: number;
}
export interface GitHubIntegrationTestPayload extends GitHubIntegrationMetadataPayload, GitHubRoutingFields {
}
export type GitHubRepositoriesPayload = GitHubIntegrationMetadataPayload;
export type GitHubLabelsPayload = GitHubIntegrationMetadataPayload;
export type GitHubMilestonesPayload = GitHubIntegrationMetadataPayload;
export type GitHubAssigneesPayload = GitHubIntegrationMetadataPayload;
export interface GitHubEntity {
    id: GitHubId;
    name: string;
    url?: string;
    raw?: Record<string, unknown>;
}
export interface GitHubRepository extends GitHubEntity {
    owner: string;
    repo: string;
    fullName: string;
    private?: boolean;
    defaultBranch?: string;
}
export interface GitHubLabel {
    id?: GitHubId;
    name: string;
    color?: string;
    description?: string;
    raw?: Record<string, unknown>;
}
export interface GitHubMilestone {
    id?: GitHubId;
    number: number;
    title: string;
    state?: 'open' | 'closed' | string;
    dueOn?: string;
    raw?: Record<string, unknown>;
}
export interface GitHubAssignee {
    id?: GitHubId;
    login: string;
    name?: string;
    avatarUrl?: string;
    raw?: Record<string, unknown>;
}
export interface GitHubShareDetails extends GitHubRoutingFields {
    credentialOwnerCompanyId?: string;
}
export type GitHubShareOverrides = GitHubShareDetails;
export interface GitHubTicketMetadata extends GitHubRoutingFields {
    ticketId?: GitHubId;
    issueNumber?: number;
    ticketUrl?: string;
    integrationCompanyId?: string;
}
//# sourceMappingURL=github.d.ts.map