import type {
  AwsCloudAccountSetupAcceptedResponse,
  AwsCloudAccountSetupPreparationRequest,
  AwsCloudAccountSetupPreparationResponse,
  AwsCloudAccountSetupRequest,
  AwsCloudAccountStatusResponse,
  AwsCloudAccountEngineRequestStatusRecord,
  AwsDeleteRequestMessageV1,
  AwsOnboardRequestMessageV1,
  AwsRefreshRequestMessageV1,
  AwsRequestActionV1,
  AwsRequestMessageV1,
} from '../index';

const onboardMessage: AwsOnboardRequestMessageV1 = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'cloudaccount',
  action: 'onboard',
  companyId: 'company-123',
  cloudAccountId: 'cloud-account-123',
  awsAccountId: '123456789012',
  roleArn: 'arn:aws:iam::123456789012:role/SpottoReadOnly',
  externalId: 'external-id-123',
  requestId: 'request-123',
  correlationId: 'correlation-123',
  requestedAt: '2026-07-15T00:00:00.000Z',
  billingExport: {
    type: 'DATA_EXPORTS',
    exportArn: 'arn:aws:bcm-data-exports:::export:example/837fcfce-f85b-4600-b333-b38a12c3a927',
    bucketName: 'spotto-billing-export',
    prefix: 'data-exports/example',
    region: 'ap-southeast-2',
    ownerAccountId: '123456789012',
  },
};

const refreshMessage: AwsRefreshRequestMessageV1 = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'cloudaccount',
  action: 'refresh',
  companyId: 'company-123',
  cloudAccountId: 'cloud-account-123',
  awsAccountId: '123456789012',
  requestId: 'request-124',
  correlationId: 'correlation-123',
  requestedAt: '2026-07-15T00:01:00.000Z',
};

const deleteMessage: AwsDeleteRequestMessageV1 = {
  schemaVersion: 1,
  provider: 'aws',
  entity: 'cloudaccount',
  action: 'delete',
  companyId: 'company-123',
  cloudAccountId: 'cloud-account-123',
  awsAccountId: '123456789012',
  requestId: 'request-125',
  correlationId: 'correlation-123',
  requestedAt: '2026-07-15T00:02:00.000Z',
};

const allMessages: AwsRequestMessageV1[] = [onboardMessage, refreshMessage, deleteMessage];
const actions: AwsRequestActionV1[] = ['onboard', 'refresh', 'delete'];

const setupRequest: AwsCloudAccountSetupRequest = {
  provider: 'AWS',
  companyId: 'company-123',
  name: 'Production AWS',
  authMode: 'crossAccountRole',
  roleArn: 'arn:aws:iam::123456789012:role/SpottoReadOnly',
  billingExport: {
    type: 'CUR',
    reportName: 'spotto-cur',
    bucketName: 'spotto-billing-export',
    prefix: 'cur/spotto-cur',
    region: 'ap-southeast-2',
    ownerAccountId: '123456789012',
  },
};

const setupPreparationResponse: AwsCloudAccountSetupPreparationResponse = {
  provider: 'AWS',
  externalId: 'external-id-123',
  createdAt: '2026-07-15T00:00:00.000Z',
  onboardingBundle: {
    schemaVersion: 1,
    roleName: 'SpottoReadOnlyRole',
    trustedPrincipalArn: 'arn:aws:iam::715809501612:user/spotto-cloud-engine-prod',
    trustedPrincipalAccountId: '715809501612',
    trustPolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowSpottoCloudEngineAccess',
          Effect: 'Allow',
          Principal: { AWS: 'arn:aws:iam::715809501612:user/spotto-cloud-engine-prod' },
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
    instructionsMarkdown: '# Create the role using the generated policies.',
  },
};

const setupPreparationRequest: AwsCloudAccountSetupPreparationRequest = {};

const engineStatus: AwsCloudAccountEngineRequestStatusRecord = {
  provider: 'aws',
  companyId: 'company-123',
  cloudAccountId: 'cloud-account-123',
  awsAccountId: '123456789012',
  requestId: 'request-123',
  correlationId: 'correlation-123',
  action: 'onboard',
  requestedAt: '2026-07-15T00:00:00.000Z',
  state: 'completed',
  attemptCount: 1,
  outcome: 'onboarded',
  ownershipGeneration: 1,
  billingStatus: 'configured-pending-delivery',
  lastSuccessfulSyncAt: '2026-07-15T00:04:59.000Z',
  updatedAt: '2026-07-15T00:05:00.000Z',
};

const setupAcceptedResponse: AwsCloudAccountSetupAcceptedResponse = {
  provider: 'AWS',
  cloudAccountId: 'cloud-account-123',
  accountId: '123456789012',
  requestId: 'request-123',
  correlationId: 'correlation-123',
  status: 'pending',
  acceptedAt: '2026-07-15T00:00:00.000Z',
};

const statusResponse: AwsCloudAccountStatusResponse = {
  provider: 'AWS',
  companyId: 'company-123',
  cloudAccountId: 'cloud-account-123',
  accountId: '123456789012',
  name: 'Production AWS',
  authMode: 'crossAccountRole',
  roleArn: 'arn:aws:iam::123456789012:role/SpottoReadOnly',
  status: 'active',
  currentRequestId: 'request-123',
  correlationId: 'correlation-123',
  updatedAt: '2026-07-15T00:05:00.000Z',
  lastSuccessfulSyncAt: '2026-07-15T00:05:00.000Z',
};

const setupRequestWithoutExternalId: AwsCloudAccountSetupRequest = {
  ...setupRequest,
};

const { externalId: _externalId, ...onboardWithoutExternalId } = onboardMessage;
// @ts-expect-error Onboarding requires the server-issued External ID.
const invalidOnboardWithoutExternalId: AwsOnboardRequestMessageV1 = onboardWithoutExternalId;

const invalidUppercaseProvider: AwsRequestMessageV1 = {
  ...refreshMessage,
  // @ts-expect-error New AWS wire contracts use the canonical lowercase provider value only.
  provider: 'AWS',
};

const invalidSchemaVersion: AwsRequestMessageV1 = {
  ...refreshMessage,
  // @ts-expect-error Unsupported schema versions must be rejected by the v1 contract.
  schemaVersion: 2,
};

const invalidEntity: AwsRequestMessageV1 = {
  ...refreshMessage,
  // @ts-expect-error AWS request v1 is scoped to the cloud-account ingress entity.
  entity: 'subscription',
};

const invalidAction: AwsRequestMessageV1 = {
  ...refreshMessage,
  // @ts-expect-error AWS request v1 supports only onboard, refresh, and delete.
  action: 'create',
};

const invalidOnboardWithoutRole: AwsOnboardRequestMessageV1 = {
  ...onboardMessage,
  // @ts-expect-error Onboarding requires the cross-account role ARN.
  roleArn: undefined,
};

const invalidRefreshWithRole: AwsRefreshRequestMessageV1 = {
  ...refreshMessage,
  // @ts-expect-error Refresh resolves persisted onboarding state and must not carry role metadata.
  roleArn: onboardMessage.roleArn,
};

const invalidDeleteWithExternalId: AwsDeleteRequestMessageV1 = {
  ...deleteMessage,
  // @ts-expect-error Delete must not carry sensitive onboarding setup metadata.
  externalId: onboardMessage.externalId,
};

const invalidRefreshWithBilling: AwsRefreshRequestMessageV1 = {
  ...refreshMessage,
  // @ts-expect-error Refresh resolves persisted billing state and must not carry a billing locator.
  billingExport: onboardMessage.billingExport,
};

const invalidDeleteWithBilling: AwsDeleteRequestMessageV1 = {
  ...deleteMessage,
  // @ts-expect-error Delete resolves persisted billing state and must not carry a billing locator.
  billingExport: onboardMessage.billingExport,
};

const invalidOnboardWithAccessKey: AwsOnboardRequestMessageV1 = {
  ...onboardMessage,
  // @ts-expect-error AWS request messages must never carry raw access keys.
  accessKeyId: 'AKIAEXAMPLE',
};

const invalidOnboardWithSecretAccessKey: AwsOnboardRequestMessageV1 = {
  ...onboardMessage,
  // @ts-expect-error AWS request messages must never carry raw secret access keys.
  secretAccessKey: 'raw-secret',
};

const invalidOnboardWithSessionToken: AwsOnboardRequestMessageV1 = {
  ...onboardMessage,
  // @ts-expect-error AWS request messages must never carry session tokens.
  sessionToken: 'raw-session-token',
};

const invalidOnboardWithCredentials: AwsOnboardRequestMessageV1 = {
  ...onboardMessage,
  // @ts-expect-error AWS request messages must never carry resolved credential objects.
  credentials: { accessKeyId: 'AKIAEXAMPLE', secretAccessKey: 'raw-secret' },
};

const invalidOnboardWithEncryptedSecret: AwsOnboardRequestMessageV1 = {
  ...onboardMessage,
  // @ts-expect-error AWS request messages must never carry API encryption output.
  encryptedSecret: 'encrypted-secret',
};

const invalidSetupWithAccessKey: AwsCloudAccountSetupRequest = {
  ...setupRequest,
  // @ts-expect-error Preview setup accepts AssumeRole metadata, not customer access keys.
  accessKeyId: 'AKIAEXAMPLE',
};

const invalidSetupWithExternalId: AwsCloudAccountSetupRequest = {
  ...setupRequest,
  // @ts-expect-error External ID is prepared by the API and cannot be overridden by the Portal request.
  externalId: 'caller-controlled-external-id',
};

const invalidSetupWithAccountId: AwsCloudAccountSetupRequest = {
  ...setupRequest,
  // @ts-expect-error The API derives the AWS account ID from roleArn; setup requests must not submit it.
  accountId: '123456789012',
};

const invalidPreparationWithExternalId: AwsCloudAccountSetupPreparationRequest = {
  // @ts-expect-error Preparation is company-scoped and the API generates the External ID.
  externalId: 'caller-controlled-external-id',
};

const invalidPreparationWithAccountId: AwsCloudAccountSetupPreparationRequest = {
  // @ts-expect-error Preparation does not require or accept AWS account details.
  accountId: '123456789012',
};

const invalidLowercaseSetupProvider: AwsCloudAccountSetupRequest = {
  ...setupRequest,
  // @ts-expect-error The existing Portal/API create edge uses uppercase AWS; only the queue envelope uses lowercase aws.
  provider: 'aws',
};

const invalidPublicStatusWithExternalId: AwsCloudAccountStatusResponse = {
  ...statusResponse,
  // @ts-expect-error External ID is setup-only and must not appear in public status DTOs.
  externalId: 'external-id-123',
};

void allMessages;
void actions;
void setupRequest;
void setupRequestWithoutExternalId;
void setupPreparationResponse;
void setupPreparationRequest;
void engineStatus;
void _externalId;
void invalidOnboardWithoutExternalId;
void setupAcceptedResponse;
void statusResponse;
void invalidUppercaseProvider;
void invalidSchemaVersion;
void invalidEntity;
void invalidAction;
void invalidOnboardWithoutRole;
void invalidRefreshWithRole;
void invalidDeleteWithExternalId;
void invalidRefreshWithBilling;
void invalidDeleteWithBilling;
void invalidOnboardWithAccessKey;
void invalidOnboardWithSecretAccessKey;
void invalidOnboardWithSessionToken;
void invalidOnboardWithCredentials;
void invalidOnboardWithEncryptedSecret;
void invalidSetupWithAccessKey;
void invalidSetupWithExternalId;
void invalidSetupWithAccountId;
void invalidPreparationWithExternalId;
void invalidPreparationWithAccountId;
void invalidLowercaseSetupProvider;
void invalidPublicStatusWithExternalId;
