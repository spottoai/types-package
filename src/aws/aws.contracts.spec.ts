import {
  AWS_COMMAND_ACTIONS,
  AWS_COMMAND_ENTITIES,
  AWS_COMMAND_PROVIDER,
  AWS_COMMAND_SCHEMA_VERSION,
  AWS_FORBIDDEN_CREDENTIAL_FIELDS,
  AWS_SCHEDULED_REFRESH_SCAN_KINDS,
  type AwsAccountDeleteCommand,
  type AwsAccountRefreshCommand,
  type AwsBillingSourceRefreshCommand,
  type AwsCommand,
  type AwsCompanyTrustSetupResponse,
  type AwsEstateDeleteCommand,
  type AwsEstateReconcileCommand,
  type AwsOrganizationCommitmentsRefreshCommand,
  type AwsScheduledRefreshTickCommand,
} from '../index';

// @ts-expect-error The abandoned single-account setup request is not exported.
import type { AwsCloudAccountSetupRequest } from '../index';
// @ts-expect-error The abandoned single-account status response is not exported.
import type { AwsCloudAccountStatusResponse } from '../index';
// @ts-expect-error Inline billing-export configuration moved into AwsEstatesManifest.
import type { AwsBillingExportConfiguration } from '../index';
// @ts-expect-error The old account-only queue contract is not exported.
import type { AwsRequestMessageV1 } from '../index';
// @ts-expect-error Alpha contracts do not retain version-suffixed aliases.
import type { AwsCloudAccountOnboardingBundleV1 } from '../index';

const estateReconcile: AwsEstateReconcileCommand = {
  schemaVersion: AWS_COMMAND_SCHEMA_VERSION,
  provider: AWS_COMMAND_PROVIDER,
  entity: 'estate',
  action: 'reconcile',
  companyId: 'company-example',
  estateId: 'estate-example',
  manifestRevision: 'etag-42',
  requestId: 'request-estate-reconcile',
  correlationId: 'correlation-example',
  requestedAt: '2026-07-31T00:00:00.000Z',
};

const estateDelete: AwsEstateDeleteCommand = {
  ...estateReconcile,
  action: 'delete',
  requestId: 'request-estate-delete',
};

const accountRefresh: AwsAccountRefreshCommand = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'account',
  action: 'refresh',
  companyId: 'company-example',
  estateId: 'estate-example',
  accountId: '123456789012',
  cloudAccountId: 'cloud-account-example',
  manifestRevision: 'etag-42',
  requestId: 'request-account-refresh',
  correlationId: 'correlation-example',
  requestedAt: '2026-07-31T00:01:00.000Z',
};

const accountDelete: AwsAccountDeleteCommand = {
  ...accountRefresh,
  action: 'delete',
  requestId: 'request-account-delete',
};

const billingSourceRefresh: AwsBillingSourceRefreshCommand = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'billing-source',
  action: 'refresh',
  companyId: 'company-example',
  estateId: 'estate-example',
  billingSourceId: 'example-data-export',
  manifestRevision: 'etag-42',
  requestId: 'request-billing-refresh',
  correlationId: 'correlation-example',
  requestedAt: '2026-07-31T00:02:00.000Z',
};

const organizationCommitmentsRefresh: AwsOrganizationCommitmentsRefreshCommand = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'organization-commitments',
  action: 'refresh',
  companyId: 'company-example',
  estateId: 'estate-example',
  manifestRevision: 'etag-42',
  requestId: 'request-organization-commitments-refresh',
  correlationId: 'correlation-example',
  requestedAt: '2026-07-31T00:03:00.000Z',
};

const scheduledFullRefreshTick: AwsScheduledRefreshTickCommand = {
  schemaVersion: AWS_COMMAND_SCHEMA_VERSION,
  provider: AWS_COMMAND_PROVIDER,
  entity: 'scheduler',
  action: 'tick',
  scanKind: 'full',
  scheduledAt: '2026-09-21T00:00:00.000Z',
  requestId: 'aws-scheduled-refresh:full:2026-09-21T00:00:00.000Z',
  correlationId: 'aws-scheduled-refresh:full:2026-09-21T00:00:00.000Z',
  requestedAt: '2026-09-21T00:00:00.000Z',
};

const scheduledComponentRefreshTick: AwsScheduledRefreshTickCommand = {
  ...scheduledFullRefreshTick,
  scanKind: 'components',
  scheduledAt: '2026-09-21T04:30:00.000Z',
  requestId: 'aws-scheduled-refresh:components:2026-09-21T04:30:00.000Z',
  correlationId: 'aws-scheduled-refresh:components:2026-09-21T04:30:00.000Z',
  requestedAt: '2026-09-21T04:30:00.000Z',
};

const commands: AwsCommand[] = [
  estateReconcile,
  estateDelete,
  accountRefresh,
  accountDelete,
  billingSourceRefresh,
  organizationCommitmentsRefresh,
  scheduledFullRefreshTick,
  scheduledComponentRefreshTick,
];

const companyTrustSetup: AwsCompanyTrustSetupResponse = {
  provider: 'AWS',
  externalId: 'example-server-issued-external-id',
  createdAt: '2026-07-31T00:00:00.000Z',
  onboardingBundle: {
    schemaVersion: 1,
    roleName: 'SpottoReadOnlyRole',
    rolePurposes: ['resource-discovery', 'organization-discovery', 'billing-definition', 'billing-storage'],
    trustedPrincipalArn: 'arn:aws:iam::111122223333:role/ExampleSpottoPrincipal',
    trustedPrincipalAccountId: '111122223333',
    trustPolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowSpottoCloudEngineAccess',
          Effect: 'Allow',
          Principal: { AWS: 'arn:aws:iam::111122223333:role/ExampleSpottoPrincipal' },
          Action: 'sts:AssumeRole',
        },
      ],
    },
    managedPolicies: [
      {
        name: 'ReadOnlyAccess',
        arn: 'arn:aws:iam::aws:policy/ReadOnlyAccess',
        accessScope: 'broad-read-only-preview',
        warning: 'Broad preview access.',
      },
    ],
    guardrailPolicyName: 'SpottoGuardrails',
    guardrailPolicy: {
      Version: '2012-10-17',
      Statement: [{ Sid: 'DenySecretReads', Effect: 'Deny', Action: 'secretsmanager:GetSecretValue', Resource: '*' }],
    },
    commitmentsAccessPolicyName: 'SpottoCommitmentsPlanning',
    commitmentsAccessPolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'ReadOrganizationCommitments',
          Effect: 'Allow',
          Action: [
            'ce:GetReservationCoverage',
            'ce:GetReservationUtilization',
            'ce:GetReservationPurchaseRecommendation',
            'ce:GetSavingsPlansCoverage',
            'ce:GetSavingsPlansUtilization',
            'ce:GetSavingsPlansPurchaseRecommendation',
            'ce:ListSavingsPlansPurchaseRecommendationGeneration',
            'ce:StartSavingsPlansPurchaseRecommendationGeneration',
            'ec2:DescribeReservedInstances',
            'organizations:DescribeOrganization',
            'organizations:ListAccounts',
            'savingsplans:DescribeSavingsPlans',
          ],
          Resource: '*',
        },
      ],
    },
    instructionsMarkdown: '# Create the role using the generated policies.',
  },
};

const invalidProvider: AwsCommand = {
  ...accountRefresh,
  // @ts-expect-error AWS command provider wire value is lowercase.
  provider: 'AWS',
};

const invalidEstateAction: AwsEstateReconcileCommand = {
  ...estateReconcile,
  // @ts-expect-error Estate reconciliation cannot be relabelled as refresh.
  action: 'refresh',
};

const invalidBillingEntity: AwsBillingSourceRefreshCommand = {
  ...billingSourceRefresh,
  // @ts-expect-error Billing-source refresh is not an account command.
  entity: 'account',
};

const invalidCommandWithRole: AwsAccountRefreshCommand = {
  ...accountRefresh,
  // @ts-expect-error Commands resolve role metadata from aws-estates.json.
  roleArn: 'arn:aws:iam::123456789012:role/ExampleReadOnlyRole',
};

const invalidCommandWithExternalId: AwsEstateReconcileCommand = {
  ...estateReconcile,
  // @ts-expect-error External ID is server-owned setup metadata, not a command field.
  externalId: 'server-owned',
};

const invalidCommandWithBilling: AwsBillingSourceRefreshCommand = {
  ...billingSourceRefresh,
  // @ts-expect-error Commands resolve billing configuration from aws-estates.json.
  billingExport: { type: 'CUR' },
};

const invalidCommandWithCredentials: AwsAccountRefreshCommand = {
  ...accountRefresh,
  // @ts-expect-error Raw AWS credentials must never appear on commands.
  credentials: { accessKeyId: 'AKIAEXAMPLE', secretAccessKey: 'raw-secret' },
};

const { manifestRevision: _manifestRevision, ...accountRefreshWithoutRevision } = accountRefresh;
// @ts-expect-error Every command is bound to one exact desired-state revision.
const invalidCommandWithoutRevision: AwsAccountRefreshCommand = accountRefreshWithoutRevision;

const invalidScheduledRefreshKind: AwsScheduledRefreshTickCommand = {
  ...scheduledFullRefreshTick,
  // @ts-expect-error Scheduled AWS ticks support only the approved full and component cadences.
  scanKind: 'billing',
};

const invalidScheduledRefreshWithCompany: AwsScheduledRefreshTickCommand = {
  ...scheduledFullRefreshTick,
  // @ts-expect-error Global scheduler ticks cannot carry one company scope.
  companyId: 'company-example',
};

const invalidScheduledRefreshWithAccount: AwsScheduledRefreshTickCommand = {
  ...scheduledFullRefreshTick,
  // @ts-expect-error Account selection remains engine-owned.
  accountId: '123456789012',
};

const invalidScheduledRefreshWithCredentials: AwsScheduledRefreshTickCommand = {
  ...scheduledFullRefreshTick,
  // @ts-expect-error Scheduled ticks must never carry AWS credentials.
  credentials: { accessKeyId: 'AKIAEXAMPLE', secretAccessKey: 'raw-secret' },
};

const invalidScheduledRefreshWithRegions: AwsScheduledRefreshTickCommand = {
  ...scheduledFullRefreshTick,
  // @ts-expect-error Provider Region planning remains engine-owned.
  regions: ['us-east-1'],
};

const invalidScheduledRefreshWithProviderWindow: AwsScheduledRefreshTickCommand = {
  ...scheduledFullRefreshTick,
  // @ts-expect-error Provider collection windows remain engine-owned.
  timeWindow: { start: '2026-09-20T00:00:00.000Z', end: '2026-09-21T00:00:00.000Z' },
};

const { scheduledAt: _scheduledAt, ...scheduledRefreshWithoutScheduledAt } = scheduledFullRefreshTick;
// @ts-expect-error Scheduled ticks must identify the exact triggering cron slot.
const invalidScheduledRefreshWithoutScheduledAt: AwsScheduledRefreshTickCommand = scheduledRefreshWithoutScheduledAt;

const commandEntities = AWS_COMMAND_ENTITIES;
const commandActions = AWS_COMMAND_ACTIONS;
const scheduledRefreshScanKinds = AWS_SCHEDULED_REFRESH_SCAN_KINDS;
const forbiddenCredentialFields = AWS_FORBIDDEN_CREDENTIAL_FIELDS;

void commands;
void companyTrustSetup;
void invalidProvider;
void invalidEstateAction;
void invalidBillingEntity;
void invalidCommandWithRole;
void invalidCommandWithExternalId;
void invalidCommandWithBilling;
void invalidCommandWithCredentials;
void invalidCommandWithoutRevision;
void invalidScheduledRefreshKind;
void invalidScheduledRefreshWithCompany;
void invalidScheduledRefreshWithAccount;
void invalidScheduledRefreshWithCredentials;
void invalidScheduledRefreshWithRegions;
void invalidScheduledRefreshWithProviderWindow;
void invalidScheduledRefreshWithoutScheduledAt;
void _manifestRevision;
void _scheduledAt;
void commandEntities;
void commandActions;
void scheduledRefreshScanKinds;
void forbiddenCredentialFields;
