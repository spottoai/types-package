import type {
  CreateMicrosoftSignInAdminConsentLinkRequest,
  MicrosoftSignInAdminConsentContextResponse,
  MicrosoftSignInAdminConsentLinkResponse,
  MicrosoftSignInAdminConsentStartResponse,
  MicrosoftSignInAdminConsentStatus,
} from '../index';

const createRequest: CreateMicrosoftSignInAdminConsentLinkRequest = {
  purpose: 'entraSignIn',
  tenantId: '00000000-0000-0000-0000-000000000001',
  expiresInHours: 24,
  requestedByName: 'Spotto administrator',
};

const linkResponse: MicrosoftSignInAdminConsentLinkResponse = {
  purpose: 'entraSignIn',
  status: 'pending',
  linkId: 'mshandoff-00000000-0000-0000-0000-000000000001',
  companyId: 'company-1',
  tenantId: createRequest.tenantId,
  url: 'https://portal.example.test/microsoft-consent/mshl_public-token',
  expiresAt: '2026-09-05T00:00:00.000Z',
  createdAt: '2026-09-04T00:00:00.000Z',
  createdByUserId: 'user-1',
};

const contextResponse: MicrosoftSignInAdminConsentContextResponse = {
  purpose: 'entraSignIn',
  status: 'verificationRequired',
  usable: false,
  applicationName: 'Spotto',
  tenantId: createRequest.tenantId,
  permissions: [
    {
      scope: 'openid',
      title: 'Sign users in',
      description: 'Allows users in this tenant to sign in to Spotto.',
      resource: 'Microsoft identity platform',
    },
  ],
  requestedByName: createRequest.requestedByName,
  requestedByCompanyName: 'Example Company',
  expiresAt: linkResponse.expiresAt,
  completedAt: '2026-09-04T00:10:00.000Z',
};

const startResponse: MicrosoftSignInAdminConsentStartResponse = {
  redirectUrl: 'https://login.microsoftonline.com/00000000-0000-0000-0000-000000000001/v2.0/adminconsent',
  tenantId: createRequest.tenantId,
  expiresAt: linkResponse.expiresAt,
};

const statuses: MicrosoftSignInAdminConsentStatus[] = ['pending', 'processing', 'verificationRequired', 'granted', 'denied', 'failed', 'expired'];

const invalidPurposeRequest: CreateMicrosoftSignInAdminConsentLinkRequest = {
  // @ts-expect-error Sign-in consent must not select the separate GDAP application workflow.
  purpose: 'azureGdap',
  tenantId: createRequest.tenantId,
};

const clientConfiguredRequest: CreateMicrosoftSignInAdminConsentLinkRequest = {
  purpose: 'entraSignIn',
  tenantId: createRequest.tenantId,
  // @ts-expect-error Microsoft application configuration is server-owned.
  clientId: 'client-controlled-application-id',
};

const scopeConfiguredRequest: CreateMicrosoftSignInAdminConsentLinkRequest = {
  purpose: 'entraSignIn',
  tenantId: createRequest.tenantId,
  // @ts-expect-error Microsoft scopes are server-owned.
  scopes: ['openid'],
};

void createRequest;
void linkResponse;
void contextResponse;
void startResponse;
void statuses;
void invalidPurposeRequest;
void clientConfiguredRequest;
void scopeConfiguredRequest;
