export type AzureDevOpsId = string | number;

export type AzureDevOpsAuthMode = 'servicePrincipal' | 'pat';

export type AzureDevOpsCredentialSource = 'azureDevOpsIntegration';

export type AzureDevOpsFieldValue = string | number | boolean;

export interface AzureDevOpsCustomFields {
  [referenceName: string]: AzureDevOpsFieldValue;
}

export interface AzureDevOpsOrganizationFields {
  organization?: string;
  organizationUrl?: string;
}

export interface AzureDevOpsProjectFields extends AzureDevOpsOrganizationFields {
  projectId?: string;
  projectName?: string;
}

export interface AzureDevOpsRoutingFields extends AzureDevOpsProjectFields {
  workItemType?: string;
  areaPath?: string;
  iterationPath?: string;
  assignedTo?: string;
  tags?: string | string[];
  priority?: string | number;
  customFields?: AzureDevOpsCustomFields;
}

export interface AzureDevOpsCredentialFields {
  authMode?: AzureDevOpsAuthMode;
  credentialSource?: AzureDevOpsCredentialSource;
  tenantId?: string;
  clientId?: string;
  useStoredSecret?: boolean;
  useParentCredentials?: boolean;
  credentialOwnerCompanyId?: string;
}

export interface AzureDevOpsIntegrationConfig extends AzureDevOpsCredentialFields, AzureDevOpsRoutingFields {
  enabled?: boolean;
  clientSecret?: string;
  pat?: string;
}

export interface AzureDevOpsIntegrationSanitizedConfig
  extends Omit<AzureDevOpsIntegrationConfig, 'clientSecret' | 'pat'> {
  hasStoredClientSecret?: boolean;
  hasStoredPat?: boolean;
}

export interface AzureDevOpsIntegrationRequestBase extends AzureDevOpsCredentialFields {
  organization: string;
  organizationUrl?: string;
  clientSecret?: string;
  pat?: string;
}

export interface AzureDevOpsIntegrationMetadataPayload extends AzureDevOpsIntegrationRequestBase {
  searchQuery?: string;
  maxResults?: number;
}

export interface AzureDevOpsProjectMetadataPayload extends AzureDevOpsIntegrationMetadataPayload {
  projectId?: string;
  projectName?: string;
}

export interface AzureDevOpsIntegrationTestPayload extends AzureDevOpsIntegrationMetadataPayload {
  projectId?: string;
  projectName?: string;
  workItemType?: string;
  areaPath?: string;
  iterationPath?: string;
  assignedTo?: string;
  tags?: string | string[];
  priority?: string | number;
  customFields?: AzureDevOpsCustomFields;
}

export type AzureDevOpsProjectsPayload = AzureDevOpsIntegrationMetadataPayload;
export type AzureDevOpsWorkItemTypesPayload = AzureDevOpsProjectMetadataPayload;
export type AzureDevOpsAreasPayload = AzureDevOpsProjectMetadataPayload;
export type AzureDevOpsIterationsPayload = AzureDevOpsProjectMetadataPayload;
export type AzureDevOpsIdentitiesPayload = AzureDevOpsProjectMetadataPayload;

export interface AzureDevOpsFieldsPayload extends AzureDevOpsProjectMetadataPayload {
  workItemType?: string;
}

export interface AzureDevOpsEntity {
  id: string;
  name: string;
  url?: string;
  raw?: Record<string, unknown>;
}

export interface AzureDevOpsProject extends AzureDevOpsEntity {
  state?: string;
}

export interface AzureDevOpsWorkItemState {
  name: string;
  category?: string;
  color?: string;
}

export interface AzureDevOpsWorkItemField {
  referenceName: string;
  name: string;
  type?: string;
  required?: boolean;
  allowedValues?: AzureDevOpsFieldValue[];
  defaultValue?: AzureDevOpsFieldValue;
}

export interface AzureDevOpsWorkItemType extends AzureDevOpsEntity {
  referenceName?: string;
  description?: string;
  color?: string;
  iconUrl?: string;
  states?: AzureDevOpsWorkItemState[];
  fields?: AzureDevOpsWorkItemField[];
}

export interface AzureDevOpsClassificationNode {
  id?: AzureDevOpsId;
  name: string;
  path: string;
  structureType?: 'area' | 'iteration' | string;
  hasChildren?: boolean;
  raw?: Record<string, unknown>;
}

export interface AzureDevOpsIdentity extends AzureDevOpsEntity {
  descriptor?: string;
  displayName?: string;
  uniqueName?: string;
  mailAddress?: string;
}

export interface AzureDevOpsShareDetails extends AzureDevOpsRoutingFields {
  credentialOwnerCompanyId?: string;
}

export type AzureDevOpsShareOverrides = AzureDevOpsShareDetails;

export interface AzureDevOpsTicketMetadata extends AzureDevOpsRoutingFields {
  ticketId?: AzureDevOpsId;
  ticketNumber?: string;
  ticketUrl?: string;
  integrationCompanyId?: string;
}
