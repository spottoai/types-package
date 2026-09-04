/** The server-owned Microsoft admin-consent workflow this contract may start. */
export type MicrosoftSignInAdminConsentPurpose = 'entraSignIn';

/** Lifecycle of a tenant-bound Microsoft sign-in admin-consent handoff link. */
export type MicrosoftSignInAdminConsentStatus = 'pending' | 'processing' | 'verificationRequired' | 'granted' | 'denied' | 'failed' | 'expired';

/** Creates a handoff link for an administrator to approve Microsoft sign-in. */
export interface CreateMicrosoftSignInAdminConsentLinkRequest {
  purpose: MicrosoftSignInAdminConsentPurpose;
  /** Microsoft Entra tenant ID the administrator must approve. */
  tenantId: string;
  /** Requested validity period. The API owns and enforces the allowed range. */
  expiresInHours?: number;
  /** Display-only name shown to the administrator. */
  requestedByName?: string;
}

/** One delegated permission displayed before the administrator leaves Spotto. */
export interface MicrosoftSignInAdminConsentPermission {
  scope: string;
  title: string;
  description: string;
  resource: string;
}

/** One-time creation response for a Microsoft sign-in admin-consent handoff. */
export interface MicrosoftSignInAdminConsentLinkResponse {
  purpose: MicrosoftSignInAdminConsentPurpose;
  status: 'pending';
  linkId: string;
  companyId: string;
  tenantId: string;
  /** Spotto-hosted handoff URL containing the one-time public token. Clients must not log or persist it. */
  url: string;
  expiresAt: string;
  createdAt: string;
  createdByUserId?: string;
}

/** Public, non-consuming context shown to the Microsoft tenant administrator. */
export interface MicrosoftSignInAdminConsentContextResponse {
  purpose: MicrosoftSignInAdminConsentPurpose;
  status: MicrosoftSignInAdminConsentStatus;
  /** True only while this particular handoff link can still be started. */
  usable: boolean;
  applicationName: string;
  tenantId: string;
  permissions: MicrosoftSignInAdminConsentPermission[];
  requestedByName?: string;
  requestedByCompanyName?: string;
  expiresAt: string;
  completedAt?: string;
  errorCode?: string;
  /** Display-safe failure message. It must not contain credentials, tokens, or internal exception details. */
  errorMessage?: string;
}

/** Result of consuming the handoff link immediately before redirecting to Microsoft. */
export interface MicrosoftSignInAdminConsentStartResponse {
  /** Microsoft admin-consent URL. It must not be an OAuth authorization-code URL and clients must not log it. */
  redirectUrl: string;
  tenantId: string;
  expiresAt: string;
}
