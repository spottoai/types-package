import type {
  PortalAccessBootstrapResponse,
  PortalAccessScopeDefinition,
  PortalAccessScopeSummary,
  PortalAccessTagPredicate,
} from '../src/features-and-permissions/access';

const bootstrap = {
  customerId: 'company-1',
  principalType: 'user',
  principalId: 'user-1',
  catalogVersion: '3',
  featureSets: [],
  features: [],
} satisfies PortalAccessBootstrapResponse;

void bootstrap;

const awsScope = {
  id: 'aws-production',
  name: 'AWS Production',
  enabled: true,
  providerName: 'aws',
  cloudAccounts: { mode: 'all' },
  subscriptionGroups: { mode: 'all' },
  subscriptions: { mode: 'selected', ids: ['001122334455'] },
  resourceFilter: { mode: 'tag_collection', tagCollectionId: 'aws-tags' },
} satisfies PortalAccessScopeDefinition;
const awsTags = { source: 'aws', key: 'Environment', operator: 'equals', value: 'Production' } satisfies PortalAccessTagPredicate;
void awsScope;
void awsTags;

const legacyScopeSummary = {
  fingerprint: 'opaque-legacy-scope',
  eligibleSubscriptionCount: 1,
  scopes: [{ id: 'azure-scope', name: 'Azure' }],
} satisfies PortalAccessScopeSummary;
const mixedScopeSummary = {
  ...legacyScopeSummary,
  hasTagFilter: true,
  providerNames: ['azure', 'aws'],
} satisfies PortalAccessScopeSummary;
void mixedScopeSummary;
