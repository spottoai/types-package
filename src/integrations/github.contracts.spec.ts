import type {
  GitHubAssignee,
  GitHubIntegrationSanitizedConfig,
  GitHubLabel,
  GitHubMilestone,
  GitHubRepository,
  GitHubShareOverrides,
  GitHubTicketMetadata,
  IntegrationTicketRecord,
  IntegrationTicketStatusRequestItem,
  ShareRecommendationRequest,
  ShareTicketMetadata,
} from '../index';
import { ProviderName } from '../index';

const githubOverrides: GitHubShareOverrides = {
  owner: 'spotto-ai',
  repo: 'customer-ops',
  repositoryId: 12345,
  labels: ['spotto', 'cost-optimization'],
  assignees: ['octocat'],
  milestone: 7,
  issueType: 'Task',
  defaultTitlePrefix: '[Spotto]',
  credentialOwnerCompanyId: 'parent-comp-123',
  customFields: {
    recommendationId: 'rec-123',
    estimatedHours: 4,
  },
};

const sanitizedConfig: GitHubIntegrationSanitizedConfig = {
  enabled: true,
  authMode: 'githubApp',
  appId: '123456',
  installationId: '987654',
  hasStoredPrivateKey: true,
  ...githubOverrides,
};

const repository: GitHubRepository = {
  id: 12345,
  name: 'customer-ops',
  owner: 'spotto-ai',
  repo: 'customer-ops',
  fullName: 'spotto-ai/customer-ops',
  url: 'https://api.github.com/repos/spotto-ai/customer-ops',
  private: true,
  defaultBranch: 'main',
};

const label: GitHubLabel = {
  id: 10,
  name: 'spotto',
  color: '2f80ed',
  description: 'Created by Spotto',
};

const milestone: GitHubMilestone = {
  id: 20,
  number: 7,
  title: 'Q3 remediation',
  state: 'open',
};

const assignee: GitHubAssignee = {
  id: 30,
  login: 'octocat',
  name: 'Mona Octocat',
};

const shareRequest: ShareRecommendationRequest = {
  shareType: 'github',
  github: githubOverrides,
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  resourceIds: ['/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1'],
  companyId: 'comp-123',
};

const ticketMetadata: GitHubTicketMetadata = {
  ticketId: 'spotto-ai/customer-ops#42',
  issueNumber: 42,
  ticketUrl: 'https://github.com/spotto-ai/customer-ops/issues/42',
  integrationCompanyId: 'parent-comp-123',
  ...githubOverrides,
};

const shareTicketMetadata: ShareTicketMetadata = {
  provider: 'github',
  ticketId: 'spotto-ai/customer-ops#42',
  ticketUrl: 'https://github.com/spotto-ai/customer-ops/issues/42',
  integrationCompanyId: 'parent-comp-123',
};

const ticketRecord: IntegrationTicketRecord = {
  companyId: 'comp-123',
  rowKey: 'row-123',
  createdAt: '2026-06-04T00:00:00.000Z',
  createdMs: 1780531200000,
  provider: 'github',
  ticketId: 'spotto-ai/customer-ops#42',
  ticketUrl: 'https://github.com/spotto-ai/customer-ops/issues/42',
  referenceType: 'recommendation',
  referenceId: 'rec-123',
};

const statusRequestItem: IntegrationTicketStatusRequestItem = {
  provider: 'github',
  ticketId: 'spotto-ai/customer-ops#42',
  integrationCompanyId: 'parent-comp-123',
};

void sanitizedConfig;
void repository;
void label;
void milestone;
void assignee;
void shareRequest;
void ticketMetadata;
void shareTicketMetadata;
void ticketRecord;
void statusRequestItem;

const invalidShareRequest: ShareRecommendationRequest = {
  // @ts-expect-error GitHub share requests must use the canonical lowercase provider value.
  shareType: 'GitHub',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  recommendationId: 'rec-123',
  resourceIds: [],
  companyId: 'comp-123',
};

const invalidSanitizedConfig: GitHubIntegrationSanitizedConfig = {
  authMode: 'githubApp',
  appId: '123456',
  installationId: '987654',
  // @ts-expect-error Sanitized configs must not expose raw GitHub App private keys.
  privateKey: 'private-key-value',
};

void invalidShareRequest;
void invalidSanitizedConfig;
