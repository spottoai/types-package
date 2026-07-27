import type {
  AutotaskIntegrationConfig,
  AutotaskIntegrationSanitizedConfig,
  AutotaskShareOverrides,
  AutotaskTicketFieldOption,
  AutotaskTicketFieldOptionsPayload,
  AutotaskTicketMetadata,
  IntegrationTicketRecord,
  IntegrationTicketStatusRequestItem,
  ShareRecommendationRequest,
} from '../index';
import { ProviderName } from '../index';

const autotaskOverrides: AutotaskShareOverrides = {
  companyId: 123,
  companyName: 'Example Customer',
  queueId: 10,
  queueName: 'Service Desk',
  statusId: 1,
  statusName: 'New',
  priorityId: 2,
  priorityName: 'Normal',
  sourceId: 4,
  sourceName: 'Spotto',
};

const sanitizedConfig: AutotaskIntegrationSanitizedConfig = {
  enabled: true,
  baseUrl: 'https://ww3.autotask.net',
  zoneBaseUrl: 'https://webservices3.autotask.net/atservicesrest/',
  username: 'api-user@example.com',
  apiIntegrationCode: 'tracking-code',
  hasStoredSecret: true,
  ...autotaskOverrides,
};

const tenancyConfig: AutotaskIntegrationConfig = {
  ...sanitizedConfig,
  contractId: 20,
  contractName: 'Managed Services',
};

const fieldOptionsPayload: AutotaskTicketFieldOptionsPayload = {
  username: 'api-user@example.com',
  secret: 'secret-value',
  apiIntegrationCode: 'tracking-code',
  zoneBaseUrl: 'https://webservices3.autotask.net/atservicesrest/',
  field: 'queueID',
  maxResults: 25,
};

const fieldOption: AutotaskTicketFieldOption = {
  id: 10,
  name: 'Service Desk',
  field: 'queueID',
  isActive: true,
};

const shareRequest: ShareRecommendationRequest = {
  shareType: 'autotask',
  autotask: autotaskOverrides,
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  resourceIds: ['/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1'],
  companyId: 'comp-123',
};

const ticketMetadata: AutotaskTicketMetadata = {
  ticketId: 'T20260604.0001',
  ticketUrl: 'https://ww3.autotask.net/Mvc/ServiceDesk/TicketDetail.mvc?ticketId=456',
  integrationCompanyId: 'parent-comp-123',
  contractId: 20,
  contractName: 'Managed Services',
  ...autotaskOverrides,
};

const ticketRecord: IntegrationTicketRecord = {
  companyId: 'comp-123',
  rowKey: 'row-123',
  createdAt: '2026-06-04T00:00:00.000Z',
  createdMs: 1780531200000,
  provider: 'autotask',
  ticketId: 'T20260604.0001',
  referenceType: 'recommendation',
  referenceId: 'rec-123',
};

const statusRequestItem: IntegrationTicketStatusRequestItem = {
  provider: 'autotask',
  ticketId: 'T20260604.0001',
  integrationCompanyId: 'parent-comp-123',
};

void sanitizedConfig;
void tenancyConfig;
void fieldOptionsPayload;
void fieldOption;
void shareRequest;
void ticketMetadata;
void ticketRecord;
void statusRequestItem;

const invalidShareRequest: ShareRecommendationRequest = {
  // @ts-expect-error Autotask share requests must use the canonical lowercase provider value.
  shareType: 'AutoTask',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  resourceIds: [],
  companyId: 'comp-123',
};

const invalidFieldOptionsPayload: AutotaskTicketFieldOptionsPayload = {
  username: 'api-user@example.com',
  apiIntegrationCode: 'tracking-code',
  // @ts-expect-error Field options are restricted to known Autotask ticket field names.
  field: 'boardID',
};

const invalidShareOverrides: AutotaskShareOverrides = {
  companyId: 123,
  // @ts-expect-error Contracts are tenancy configuration, not per-share overrides.
  contractId: 20,
};

void invalidShareRequest;
void invalidFieldOptionsPayload;
void invalidShareOverrides;
