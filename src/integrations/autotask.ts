export type AutotaskId = string | number;

export type AutotaskTicketFieldName =
  | 'queueID'
  | 'status'
  | 'priority'
  | 'ticketCategory'
  | 'ticketType'
  | 'source'
  | 'issueType'
  | 'subIssueType'
  | 'serviceLevelAgreementID';

export interface AutotaskRoutingFields {
  companyId?: AutotaskId;
  companyName?: string;
  projectId?: AutotaskId;
  projectName?: string;
  queueId?: AutotaskId;
  queueName?: string;
  statusId?: AutotaskId;
  statusName?: string;
  priorityId?: AutotaskId;
  priorityName?: string;
  ticketCategoryId?: AutotaskId;
  ticketCategoryName?: string;
  ticketTypeId?: AutotaskId;
  ticketTypeName?: string;
  sourceId?: AutotaskId;
  sourceName?: string;
  issueTypeId?: AutotaskId;
  issueTypeName?: string;
  subIssueTypeId?: AutotaskId;
  subIssueTypeName?: string;
  contactId?: AutotaskId;
  contactName?: string;
  resourceId?: AutotaskId;
  resourceName?: string;
  serviceLevelAgreementId?: AutotaskId;
  serviceLevelAgreementName?: string;
}

export type AutotaskShareOverrides = AutotaskRoutingFields;

export interface AutotaskCredentialFields {
  baseUrl?: string;
  zoneBaseUrl?: string;
  username?: string;
  apiIntegrationCode?: string;
  useParentCredentials?: boolean;
  credentialOwnerCompanyId?: string;
}

export interface AutotaskTenancyContractSelection {
  contractId?: AutotaskId;
  contractName?: string;
}

export interface AutotaskIntegrationConfig extends AutotaskCredentialFields, AutotaskRoutingFields, AutotaskTenancyContractSelection {
  enabled?: boolean;
  secret?: string;
}

export interface AutotaskIntegrationSanitizedConfig extends Omit<AutotaskIntegrationConfig, 'secret'> {
  hasStoredSecret?: boolean;
}

export interface AutotaskIntegrationRequestBase {
  baseUrl?: string;
  zoneBaseUrl?: string;
  username: string;
  secret?: string;
  apiIntegrationCode: string;
  useStoredSecret?: boolean;
  credentialOwnerCompanyId?: string;
}

export interface AutotaskIntegrationMetadataPayload extends AutotaskIntegrationRequestBase {
  searchQuery?: string;
  maxResults?: number;
}

export interface AutotaskIntegrationTestPayload extends AutotaskIntegrationRequestBase, AutotaskRoutingFields, AutotaskTenancyContractSelection {}

export type AutotaskZonePayload = AutotaskIntegrationRequestBase;
export type AutotaskCompaniesPayload = AutotaskIntegrationMetadataPayload;
export type AutotaskProjectsPayload = AutotaskIntegrationMetadataPayload;
export type AutotaskContactsPayload = AutotaskIntegrationMetadataPayload;
export type AutotaskResourcesPayload = AutotaskIntegrationMetadataPayload;

export interface AutotaskContractsPayload extends AutotaskIntegrationMetadataPayload {
  autotaskCompanyId: AutotaskId;
  selectedContractId?: AutotaskId;
}

export interface AutotaskTicketFieldOptionsPayload extends AutotaskIntegrationMetadataPayload {
  field: AutotaskTicketFieldName;
}

export interface AutotaskZoneInformation {
  zoneName?: string;
  url: string;
  webUrl?: string;
  ci?: number;
}

export interface AutotaskEntity {
  id: AutotaskId;
  name: string;
  raw?: Record<string, unknown>;
}

export interface AutotaskTicketFieldOption extends AutotaskEntity {
  field: AutotaskTicketFieldName;
  isActive?: boolean;
}

export interface AutotaskContractOption extends AutotaskEntity {
  companyId: AutotaskId;
  contractNumber?: string;
  status?: AutotaskId;
  statusLabel?: string;
  startDate?: string;
  endDate?: string;
  isDefaultContract?: boolean;
  isAvailable: boolean;
}

export interface AutotaskTicketMetadata extends AutotaskRoutingFields, AutotaskTenancyContractSelection {
  ticketId?: AutotaskId;
  ticketUrl?: string;
  integrationCompanyId?: string;
}
