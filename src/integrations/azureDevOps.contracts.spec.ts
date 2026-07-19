import type {
  AzureDevOpsFieldsPayload,
  AzureDevOpsIntegrationSanitizedConfig,
  AzureDevOpsProject,
  AzureDevOpsShareOverrides,
  AzureDevOpsTicketMetadata,
  AzureDevOpsWorkItemType,
  IntegrationTicketRecord,
  IntegrationTicketStatusRequestItem,
  ShareRecommendationRequest,
} from '../index';
import { ProviderName } from '../index';

const azureDevOpsOverrides: AzureDevOpsShareOverrides = {
  organization: 'example-org',
  organizationUrl: 'https://dev.azure.com/example-org',
  projectId: 'project-123',
  projectName: 'Customer Operations',
  workItemType: 'Task',
  areaPath: 'Customer Operations\\Cloud',
  iterationPath: 'Customer Operations\\Sprint 1',
  assignedTo: 'engineer@example.com',
  tags: ['spotto', 'azure'],
  priority: 2,
  customFields: {
    'Custom.CustomerId': 'comp-123',
    'Custom.EstimatedHours': 4,
  },
};

const sanitizedConfig: AzureDevOpsIntegrationSanitizedConfig = {
  enabled: true,
  authMode: 'servicePrincipal',
  credentialSource: 'azureDevOpsIntegration',
  tenantId: 'tenant-123',
  clientId: 'client-123',
  credentialOwnerCompanyId: 'parent-comp-123',
  hasStoredClientSecret: true,
  ...azureDevOpsOverrides,
};

const fieldsPayload: AzureDevOpsFieldsPayload = {
  organization: 'example-org',
  organizationUrl: 'https://dev.azure.com/example-org',
  authMode: 'servicePrincipal',
  credentialSource: 'azureDevOpsIntegration',
  tenantId: 'tenant-123',
  clientId: 'client-123',
  clientSecret: 'secret-value',
  projectId: 'project-123',
  projectName: 'Customer Operations',
  workItemType: 'Task',
  maxResults: 25,
};

const project: AzureDevOpsProject = {
  id: 'project-123',
  name: 'Customer Operations',
  url: 'https://dev.azure.com/example-org/_apis/projects/project-123',
  state: 'wellFormed',
};

const workItemType: AzureDevOpsWorkItemType = {
  id: 'Task',
  name: 'Task',
  referenceName: 'Microsoft.VSTS.WorkItemTypes.Task',
  states: [{ name: 'To Do', category: 'Proposed' }],
  fields: [
    {
      referenceName: 'System.Title',
      name: 'Title',
      type: 'string',
      required: true,
    },
  ],
};

const shareRequest: ShareRecommendationRequest = {
  shareType: 'azuredevops',
  azuredevops: azureDevOpsOverrides,
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  resourceIds: ['/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1'],
  companyId: 'comp-123',
};

const ticketMetadata: AzureDevOpsTicketMetadata = {
  ticketId: 456,
  ticketNumber: '456',
  ticketUrl: 'https://dev.azure.com/example-org/Customer%20Operations/_workitems/edit/456',
  integrationCompanyId: 'parent-comp-123',
  ...azureDevOpsOverrides,
};

const ticketRecord: IntegrationTicketRecord = {
  companyId: 'comp-123',
  rowKey: 'row-123',
  createdAt: '2026-06-04T00:00:00.000Z',
  createdMs: 1780531200000,
  provider: 'azuredevops',
  ticketId: '456',
  ticketNumber: '456',
  referenceType: 'recommendation',
  referenceId: 'rec-123',
};

const statusRequestItem: IntegrationTicketStatusRequestItem = {
  provider: 'azuredevops',
  ticketId: '456',
  ticketNumber: '456',
  integrationCompanyId: 'parent-comp-123',
};

void sanitizedConfig;
void fieldsPayload;
void project;
void workItemType;
void shareRequest;
void ticketMetadata;
void ticketRecord;
void statusRequestItem;

const invalidShareRequest: ShareRecommendationRequest = {
  // @ts-expect-error Azure DevOps share requests must use the canonical lowercase provider value.
  shareType: 'azureDevOps',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  resourceIds: [],
  companyId: 'comp-123',
};

const invalidSanitizedConfig: AzureDevOpsIntegrationSanitizedConfig = {
  authMode: 'servicePrincipal',
  credentialSource: 'azureDevOpsIntegration',
  // @ts-expect-error Sanitized configs must not expose raw service principal secrets.
  clientSecret: 'secret-value',
};

void invalidShareRequest;
void invalidSanitizedConfig;
