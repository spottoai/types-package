export type HaloId = string | number;
export interface HaloRoutingOverrides {
    queueId?: HaloId;
    queueName?: string;
    teamId?: HaloId;
    teamName?: string;
    agentId?: HaloId;
    agentName?: string;
    ticketClientId?: HaloId;
    ticketClientName?: string;
    siteId?: HaloId;
    siteName?: string;
    ticketTypeId?: HaloId;
    ticketTypeName?: string;
    itilTicketTypeId?: HaloId;
    itilTicketTypeName?: string;
    priorityId?: HaloId;
    priorityName?: string;
    statusId?: HaloId;
    statusName?: string;
    impactId?: HaloId;
    impactName?: string;
    urgencyId?: HaloId;
    urgencyName?: string;
    sourceId?: HaloId;
    sourceName?: string;
    slaId?: HaloId;
    slaName?: string;
    category1?: string;
    category2?: string;
    category3?: string;
    category4?: string;
}
export type HaloRoutingFields = HaloRoutingOverrides;
export interface HaloIntegrationRequestBase {
    baseUrl: string;
    clientId: string;
    secret?: string;
    useStoredSecret?: boolean;
    credentialOwnerCompanyId?: string;
}
export interface HaloIntegrationMetadataPayload extends HaloIntegrationRequestBase {
    searchQuery?: string;
    maxResults?: number;
}
export interface HaloIntegrationTestPayload extends HaloIntegrationRequestBase, HaloRoutingOverrides {
}
export type HaloQueuesPayload = HaloIntegrationMetadataPayload;
export type HaloTeamsPayload = HaloIntegrationMetadataPayload;
export type HaloAgentsPayload = HaloIntegrationMetadataPayload;
export type HaloClientsPayload = HaloIntegrationMetadataPayload;
export type HaloSitesPayload = HaloIntegrationMetadataPayload;
export type HaloTicketTypesPayload = HaloIntegrationMetadataPayload;
export type HaloItilTicketTypesPayload = HaloIntegrationMetadataPayload;
export type HaloPrioritiesPayload = HaloIntegrationMetadataPayload;
export type HaloStatusesPayload = HaloIntegrationMetadataPayload;
export type HaloImpactsPayload = HaloIntegrationMetadataPayload;
export type HaloUrgenciesPayload = HaloIntegrationMetadataPayload;
export type HaloSourcesPayload = HaloIntegrationMetadataPayload;
export type HaloCategoriesPayload = HaloIntegrationMetadataPayload;
export interface HaloEntity {
    id: HaloId;
    name: string;
}
//# sourceMappingURL=halo.d.ts.map