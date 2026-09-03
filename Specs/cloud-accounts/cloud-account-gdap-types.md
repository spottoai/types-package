# Repo Spec - Types Azure GDAP Cloud Accounts

## Metadata

Status: iteration 8 consent diagnostics contract implemented and verified; prerelease publication pending
Approved: Yes - user explicitly directed adding the optional ProcessPayload property on 2026-08-04; GDAP consent remediation approved 2026-09-03
Iterations: 8
Last updated: 2026-09-03
Repo: types-package
Domain: cloud-accounts
Parent spec: core/specs/cloud-accounts/cloud-account-gdap.md
Spec location: types-package/specs/cloud-accounts/cloud-account-gdap-types.md

## Summary

Add the shared GDAP cloud-account contracts used by API, portal, and cloud-engine.
The types package owns the canonical `gdap` auth mode, GDAP metadata fields, validation/status DTOs, scheduling fields, and queue/auth context additions.

For MSP hierarchy support, shared contracts must represent root/MSP GDAP authorization profiles separately from child/customer GDAP cloud accounts. Child cloud accounts reference eligible root-owned profiles instead of duplicating partner credential references.

## Iteration 8 Decision - 2026-09-03

- Extend the closed reason-code union so Graph consent/token/API failures and Microsoft client-configuration failures remain distinguishable from ARM/RBAC outcomes.
- Keep the new members additive and optional on capability records; runtime consumers may roll out before they consume the new prerelease.
- Package versioning remains owned by the prerelease workflow and is not changed manually.

## Iteration 7 Decision - 2026-09-03

- Add the `armAppConsent` capability key so Graph and Azure Service Management consent cannot be conflated.
- Add an optional, closed `AzureGdapCapabilityReasonCode` union to capability outcomes. The field is additive and safe for older API/UI/cloud-engine versions to ignore.
- Reason codes describe remediation classes only; they never carry Microsoft response text, tokens, claims, tenant identifiers, or credentials.
- Compile-time fixtures cover the new capability and reason-code combinations. Package versioning remains owned by the prerelease workflow.

## Iteration 6 Decision - 2026-08-04

### Open Questions

- None blocking. `SubscriptionType` is already the canonical subscription-classification union and cloud-engine already places this value on the internal process payload.

### Assumptions and Constraints

- [x] Cloud-engine publishes and consumes `subscriptionType` while constructing subscription process messages. (validated in `AzureSyncService` and `SubscriptionPublisherService`)
- [x] `ProcessPayload` is the shared input contract for `SubscriptionPublisherService.publish`. (validated in cloud-engine source)
- [x] The property is optional so existing Service Principal, GDAP, delegated-user, and legacy callers remain source compatible.
- Constraint: package versions are advanced by the prerelease workflow after merge; feature work must not manually change `package.json`.

### Alternatives and Tradeoffs

- Keep a cloud-engine-only intersection type: immediately compiles but preserves contract drift. Rejected as the final fix; allowed only as a temporary compatibility declaration until the package prerelease is published.
- Add an unbounded `string`: matches the current local extension but permits classifications outside the canonical product contract. Rejected.
- Add `subscriptionType?: SubscriptionType` to `ProcessPayload`: additive, backward compatible, and reuses the existing canonical union. Chosen.

### Decision

- Add the optional canonical `SubscriptionType` property to `ProcessPayload` and compile-time fixtures.
- Keep a temporary narrow compatibility annotation in cloud-engine until the automated prerelease is published and consumed, then remove the redundant local declaration.

### Deferred Ideas

- Removing other historical `ProcessPayload` compatibility fields after all consumers use published canonical contracts.

## Current Implementation / Test Readiness - 2026-06-11

This repo is ready for targeted testing of the shared GDAP contract slice.
It defines the data shapes that the API, portal, and cloud-engine consume, but it does not implement any runtime Microsoft auth, persistence, or scan behavior.

Implemented and ready to test:

- `CloudAccountAuthMode` supports `servicePrincipal`, `delegatedUser`, and `gdap`.
- `CloudAccount` includes optional GDAP relationship, access-assignment, validation, capability, scheduling, and internal credential-reference fields.
- Current `gdapCredentialReference` is a transitional internal field. Profile-backed contracts now use `gdapAuthorizationCompanyId` and `gdapAuthorizationProfileId` on child cloud accounts plus a separate non-secret authorization profile summary DTO.
- `AzureGdapAuthorizationProfileSummary` represents the root/MSP-owned profile without exposing its internal `credentialReference`.
- GDAP queue/auth context contracts can carry the non-secret root authorization company/profile IDs while still prohibiting credential references on GDAP subscription messages.
- `PublicCloudAccountDto` excludes `secret`, `writeSecret`, `delegatedTokenCache`, `billingExportLocator`, and `gdapCredentialReference`.
- `AzureCloudAccountAuthContext` includes explicit cloud-account, customer tenant, authority tenant, partner tenant, principal client ID, and credential-reference fields for internal runtime contexts.
- `AzureGdapSubscriptionMessage` requires `authMode='gdap'`, `cloudAccountId`, customer/partner tenant context, and prohibits token, client-secret, client-ID, principal-client-ID, and credential-reference fields.
- Contract tests cover GDAP account metadata, public DTO redaction, GDAP subscription queue redaction, and legacy Service Principal compatibility.

Not implemented in this slice:

- Runtime auth-mode validation.
- API DTO projection or persistence.
- Portal rendering behavior.
- Cloud-engine token acquisition or credential-reference resolution.
- Runtime root hierarchy validation and credential lookup remain API/cloud-engine responsibilities, not package behavior.

Testing notes:

- Validate this repo with the package build/typecheck because the contract tests are TypeScript compile-time assertions.
- Live Microsoft GDAP onboarding or scans are outside this repo.

## Iteration 5 Discovery - 2026-08-03

### Open Questions

- The API implementation must decide how validation receipts are signed or persisted. The shared contract treats the receipt as opaque.
- The exact Microsoft subscription-state values retained by the API remain an implementation detail; the shared option exposes the returned state as optional text.

### Assumptions and Constraints

- [x] A child company selects subscriptions only from the subscriptions returned by its own customer-tenant validation. (validated by the parent architecture)
- [x] Validation proof must be customer/setup scoped so concurrent onboarding for companies A, B, and C cannot overwrite or reuse one shared profile draft slot. (validated by review finding)
- [x] Relationship expiry and customer app-consent readiness must be returned with validation results. (validated by review finding)
- Constraint: validation receipts are opaque, short-lived proof values and must not contain tokens, credential references, or raw Microsoft claims.
- Constraint: selected subscription IDs belong to the child cloud account and must not be stored on the reusable root authorization profile.

### Alternatives and Tradeoffs

- Keep the current profile-scoped draft slot: fewer contract changes, but concurrent child setup can overwrite another child's validation proof. Rejected.
- Let the API silently attach every visible subscription: simpler UI, but prevents an MSP from assigning only the subscriptions that belong to company A, B, or C. Rejected.
- Return subscription options plus an opaque validation receipt and require explicit subscription IDs on create: adds a coordinated API/UI change, but preserves tenant isolation and explicit ownership. Chosen.

### Decision

- Extend draft validation responses with customer consent, relationship lifecycle, discovered subscription options, and an opaque expiring validation receipt.
- Require GDAP create requests to submit the receipt and at least one explicitly selected subscription ID; runtime cardinality and membership validation remain API responsibilities.
- Keep all new response fields free of credentials and token material.

### Deferred Ideas

- Runtime receipt signing/storage format.
- Subscription grouping and bulk assignment across multiple child companies.
- Per-subscription capability matrices beyond readable/unreadable discovery.

## Scope (Repo-Specific)

In scope:

- Extend `CloudAccountAuthMode` with `gdap`.
- Add shared GDAP relationship, access assignment, role, validation, and capability types.
- Add optional GDAP metadata fields to `CloudAccount`.
- Add root/MSP authorization profile DTOs and child cloud-account profile reference fields.
- Extend public cloud-account DTOs with non-secret GDAP status fields.
- Add queue/auth context fields for auth-mode-aware Azure processing.
- Add partner authorization, app consent, and scheduled eligibility status fields.
- Add contract tests for legacy Service Principal compatibility and public redaction.
- Add discovered subscription option and explicit subscription selection contracts.
- Add opaque validation receipt and expiry fields that bind validation to account creation.
- Add relationship lifecycle and customer app-consent status to validation/status DTOs.

Out of scope:

- API persistence logic.
- Microsoft Graph or Partner Center client implementation.
- UI copy/rendering.
- cloud-engine token acquisition.
- Public docs.
- Receipt signing, persistence, replay prevention, and subscription membership validation runtime logic.

## Deferred Ideas

- Bring-your-own partner app registration contracts.
- First-class Azure Lighthouse auth mode/metadata.
- Full per-workload GDAP role matrix after first scan modules are finalized.
- Billing export creation/update contracts for GDAP.
- Cross-root or multiple-parent authorization profile sharing.

## Success Criteria (Full MVP - Repo)

- `CloudAccountAuthMode` supports `servicePrincipal`, `delegatedUser`, and `gdap`.
- Missing `authMode` remains representable as legacy Service Principal behavior.
- GDAP cloud accounts can store relationship/access-assignment metadata without Service Principal secret fields.
- GDAP child cloud accounts can reference a root/MSP authorization profile by non-secret owner/profile IDs.
- Shared profile DTOs can expose non-secret authorization status without exposing credential references.
- Public DTOs can show GDAP status and capability information without token/credential references.
- Public DTOs can show sanitized validation messages without raw Microsoft claims or token errors.
- Draft validation returns the customer tenant, relationship lifecycle, app-consent status, discovered subscriptions, and an opaque expiring receipt.
- GDAP account creation requires explicit selected subscription IDs and the validation receipt.
- Queue/auth contracts include `authMode`, explicit tenant fields, and cloud-account identity fields.
- Contract tests fail if raw token, refresh token, token cache, app secret, or internal credential reference fields are exposed publicly.

## Assumptions and Constraints (Post-Recon)

- [x] `CloudAccountAuthMode` currently exists in `src/accounts/accounts.ts`. (validated)
- [x] `CloudAccount` already has optional `authMode` and delegated-token-related internal fields. (validated)
- [x] Missing `authMode` must be treated by consuming repos as `servicePrincipal`. (validated by parent decision)
- [x] `gdap-{uniqueId}` is a cloud account ID, not an Azure app/client ID. (validated by parent decision)
- [x] Root/MSP authorization profiles are reusable by eligible child/customer cloud accounts in the same hierarchy. Profile registration is root-only. (validated by parent decision)
- [ ] Exact optional workload role matrix is unresolved. (unvalidated)
- Constraint: shared public DTOs must not expose internal credential/token references.
- Constraint: queue message types must remain backward compatible for existing Service Principal messages.

## Cross-Repo Touchpoints

- API imports GDAP account metadata, validation DTOs, and queue/auth context contracts.
- UI imports setup/status/capability DTOs and displays non-secret GDAP metadata.
- cloud-engine imports `authMode`, queue/auth context fields, and GDAP lifecycle/status names.
- Core parent spec remains the source of product and architecture decisions.

## Local Recon (Required Before Approach)

- Entry points checked:
  - `src/accounts/accounts.ts`
  - `src/azure/payloads.ts`
- Existing patterns found:
  - optional cloud-account auth mode
  - public DTO redaction through omitted sensitive fields
  - shared Azure payload and queue contract placement
- Relevant docs/README:
  - `core/specs/cloud-accounts/cloud-account-gdap.md`
  - `types-package/specs/cloud-accounts/cloud-account-guest-access-types.md`
- Remaining questions:
  - exact field names can be adjusted during implementation if existing table/property naming conventions require it.

## Approach

- Add `gdap` to the existing auth-mode union instead of introducing a parallel account-type enum.
- Keep GDAP fields optional on `CloudAccount` so existing rows and consumers remain compatible.
- Separate customer tenant, partner tenant, authority tenant, and cloud account ID in shared contracts.
- Model capability validation as explicit status objects so UI can distinguish unsupported, degraded, failed, and ready states.
- Keep internal credential reference fields excluded from public DTOs, even if they exist on internal cloud account records.
- Model root/MSP authorization profiles as a separate shared DTO so UI/API/cloud-engine do not overload `CloudAccount` for partner credential ownership.
- Add non-secret profile references to GDAP cloud account metadata.
- Model subscription discovery as public, non-secret options owned by the child setup flow rather than the reusable root profile.
- Keep validation receipts opaque so consumers cannot depend on their encoding or claims.

## Proposed Shared Types

```ts
export type CloudAccountAuthMode =
  | 'servicePrincipal'
  | 'delegatedUser'
  | 'gdap';

export type AzureGdapRelationshipStatus =
  | 'unknown'
  | 'created'
  | 'approvalPending'
  | 'active'
  | 'terminated'
  | 'expired';

export type AzureGdapAccessAssignmentStatus =
  | 'unknown'
  | 'pending'
  | 'active'
  | 'deleting'
  | 'deleted'
  | 'error';

export type AzureGdapValidationStatus =
  | 'notValidated'
  | 'ready'
  | 'degraded'
  | 'blocked'
  | 'expired'
  | 'reauthRequired';

export type AzureGdapCapabilityKey =
  | 'partnerAuthorization'
  | 'relationship'
  | 'accessAssignment'
  | 'appConsent'
  | 'subscriptionDiscovery'
  | 'resourceInventory'
  | 'resourceGraph'
  | 'costRead'
  | 'billingExportSetup'
  | 'monitoringRead'
  | 'graphInventory'
  | 'scheduledScan';

export interface AzureGdapCapabilityStatus {
  key: AzureGdapCapabilityKey;
  status: 'ready' | 'degraded' | 'blocked' | 'unsupported' | 'notChecked';
  reason?: string;
  checkedAt?: string;
  requiredRoles?: string[];
  requiredAzureRoles?: string[];
}

export interface AzureGdapRoleAssignment {
  roleId?: string;
  roleTemplateId?: string;
  displayName: string;
}

export interface AzureGdapCloudAccountMetadata {
  gdapAuthorizationCompanyId?: string; // must be the hierarchy rootCompanyId
  gdapAuthorizationProfileId?: string;
  gdapPartnerTenantId: string;
  gdapCustomerTenantId: string;
  gdapRelationshipId: string;
  gdapRelationshipDisplayName?: string;
  gdapRelationshipStatus?: AzureGdapRelationshipStatus;
  gdapAccessAssignmentId?: string;
  gdapAccessAssignmentStatus?: AzureGdapAccessAssignmentStatus;
  gdapSecurityGroupId?: string;
  gdapSecurityGroupDisplayName?: string;
  gdapRoles?: AzureGdapRoleAssignment[];
  gdapExpiresAt?: string;
  gdapAutoExtendEnabled?: boolean;
  gdapPartnerAuthorizationStatus?: AzureGdapValidationStatus;
  gdapAppConsentStatus?: AzureGdapValidationStatus;
  gdapLastValidatedAt?: string;
  gdapLastValidationStatus?: AzureGdapValidationStatus;
  gdapLastValidationErrorCode?: string;
  gdapLastValidationMessage?: string;
  gdapScheduledEligible?: boolean;
  gdapScheduledEligibilityReason?: string;
  gdapCapabilities?: AzureGdapCapabilityStatus[];
}

export interface AzureGdapAuthorizationProfileSummary {
  id: string;
  companyId: string; // hierarchy rootCompanyId / MSP owner
  displayName: string;
  partnerTenantId: string;
  authorizationStatus: AzureGdapValidationStatus;
  authorizedAt?: string;
  expiresAt?: string;
  lastValidatedAt?: string;
  lastValidationStatus?: AzureGdapValidationStatus;
  lastValidationErrorCode?: string;
  lastValidationMessage?: string;
}

export interface AzureCloudAccountAuthContext {
  authMode?: CloudAccountAuthMode;
  cloudAccountId: string;
  gdapAuthorizationCompanyId?: string; // must be the hierarchy rootCompanyId
  gdapAuthorizationProfileId?: string;
  customerTenantId?: string;
  authorityTenantId?: string;
  partnerTenantId?: string;
  principalClientId?: string;
  credentialReference?: string;
}
```

`CloudAccount` additions:

```ts
gdapAuthorizationCompanyId?: string; // must be the hierarchy rootCompanyId
gdapAuthorizationProfileId?: string;
gdapPartnerTenantId?: string;
gdapCustomerTenantId?: string;
gdapRelationshipId?: string;
gdapRelationshipDisplayName?: string;
gdapRelationshipStatus?: AzureGdapRelationshipStatus;
gdapAccessAssignmentId?: string;
gdapAccessAssignmentStatus?: AzureGdapAccessAssignmentStatus;
gdapSecurityGroupId?: string;
gdapSecurityGroupDisplayName?: string;
gdapRolesJson?: string;
gdapExpiresAt?: Date | string;
gdapAutoExtendEnabled?: boolean;
gdapPartnerAuthorizationStatus?: AzureGdapValidationStatus;
gdapAppConsentStatus?: AzureGdapValidationStatus;
gdapLastValidatedAt?: Date | string;
gdapLastValidationStatus?: AzureGdapValidationStatus;
gdapLastValidationErrorCode?: string;
gdapLastValidationMessage?: string; // sanitized public-safe message only
gdapScheduledEligible?: boolean;
gdapScheduledEligibilityReason?: string;
gdapCredentialReference?: string; // transitional internal only; profile-backed setup stores credentialReference on authorization profile
```

Queue contract rule:

- Existing Service Principal messages remain valid when `authMode` is missing.
- New Azure messages should include `authMode`, `cloudAccountId`, `customerTenantId`, `authorityTenantId`, and `partnerTenantId` when applicable.
- GDAP messages may include non-secret `gdapAuthorizationCompanyId` and `gdapAuthorizationProfileId`, but cloud-engine must rehydrate and validate persisted profile/cloud-account records and root-company eligibility before token use.
- `principalClientId` is populated only when there is an Azure app/client ID.
- `credentialReference` is internal runtime metadata only and must not contain token material. GDAP subscription queue messages should resolve it from the persisted authorization profile, or from the cloud account only for transitional direct-reference flows, instead of putting it on queue messages.
- GDAP subscription queue messages must not include `clientId`, `authClientId`, `principalClientId`, token, secret, or credential-reference fields.

## Tasks (Sequential)

1. Lock the validation-to-creation contract with compile-time fixtures.
   Files: `src/accounts/accounts.contracts.spec.ts`.
   Action: add fixtures for relationship lifecycle, app-consent state, discovered subscription options, opaque validation receipt/expiry, explicit create selections, and prohibited credential/token fields.
   Verify: `npm run typecheck:contracts` fails before implementation and passes afterward.
   Done: fixtures describe the complete child-company subscription selection hand-off and reject secret-bearing public shapes.

2. Extend the canonical GDAP account DTOs.
   Files: `src/accounts/accounts.ts`.
   Action: add the subscription option and relationship lifecycle interfaces; extend draft validation, account status, and create request DTOs without changing Service Principal or delegated-user contracts.
   Verify: `npm run build` and `npm run typecheck:contracts`.
   Done: API and UI can import one canonical contract for validation receipts and explicit child-company subscription selection.

3. Verify generated package output and security invariants.
   Files: generated `dist/**` and tracked compiler outputs, package configuration unchanged.
   Action: run the package quality gates, inspect the diff for accidental secret-capable fields, and confirm packed declarations expose the new types.
   Verify: `npm test`, `npm run lint`, `npm run format:check`, and `npm run build`.
   Done: source and emitted declarations agree; all package gates pass; no new dependency or secret-bearing contract is introduced.

## Goal-Backward Must-Haves

Truths:

- Types expose `authMode='gdap'`.
- GDAP metadata is separate from Service Principal `secret` fields.
- GDAP root authorization profile DTOs are separate from child cloud-account metadata.
- Queue contracts can carry auth mode and tenant identity explicitly.
- Public DTOs never include token or raw credential material.

Artifacts:

- GDAP account metadata types.
- GDAP root authorization profile summary/status types.
- GDAP validation/capability types.
- GDAP relationship lifecycle and subscription option types.
- Opaque validation receipt and explicit selected-subscription fields.
- Auth context/queue additions.
- Contract fixtures for SP, GDAP, and delegated-user accounts.

Key Links:

- `CloudAccount.authMode` -> API validation branch -> cloud-engine auth branch.
- `CloudAccount.id` -> `cloudAccountId`; only SP mode treats `clientId` as Azure app/client ID.
- `gdapAuthorizationCompanyId` + `gdapAuthorizationProfileId` -> API root hierarchy eligibility -> cloud-engine profile-backed token resolution.

## Test Strategy

- Unit/contract:
  - auth-mode union includes `gdap`
  - legacy missing auth mode fixture still compiles
  - GDAP fixture contains no required `secret`
  - GDAP fixture can reference a root authorization profile
  - authorization profile summary fixture does not expose `credentialReference`
  - validation response contains customer consent, relationship lifecycle, discovered subscriptions, and expiring receipt
  - create request requires an opaque receipt and explicit subscription IDs
  - validation response rejects token, refresh-token, token-cache, secret, and credential-reference fields
  - public DTO omits `gdapCredentialReference`, token cache, refresh token, and secret fields
  - public DTO exposes only sanitized validation error code/message fields
  - queue fixture includes auth context and no token material
- Integration/E2E: N/A for shared types.
- Coverage target: existing types-package contract coverage standard.

## Definition of Done (Full MVP DoD)

### Feature Criteria

- Shared types support GDAP cloud accounts and validation status.
- Shared types support customer-scoped subscription discovery and explicit subscription selection.
- Shared types bind draft validation to creation through an opaque expiring receipt.
- Shared types support root/MSP authorization profile summaries and child cloud-account profile references.
- Shared queue/auth contracts support auth-mode-aware Azure processing.
- Sensitive GDAP internals are excluded from public DTO contracts.
- Existing SP and delegated-user consumers remain source-compatible.

### Completion Checklist

- [x] Unit/contract tests added with happy/error/boundary coverage for the implemented shared contract slice
- [x] Feature validated through package build/typecheck
- [x] Code quality review for the implemented shared contract slice
- [ ] Docs repo updated under Features section (N/A for first implementation)
- [ ] MCP server updated and tested end-to-end (N/A)
- [ ] Swagger/OpenAPI specs updated (N/A)
- [ ] Demo environment data updated (N/A)

## Risks and Mitigations

- Risk: shared contracts become too broad before MVP scan modules are fixed.
- Mitigation: keep optional capability keys extensible and require API validation to report unsupported modules explicitly.

- Risk: `gdap-{uniqueId}` prefix becomes a type discriminator.
- Mitigation: contract tests require `authMode='gdap'`; prefix is only an ID convention.

- Risk: public DTO leaks credential references.
- Mitigation: explicit redaction fixtures for GDAP internal fields.

- Risk: profile DTO exposes enough internal detail to leak partner credential state.
- Mitigation: expose only non-secret owner/profile/partner/status fields and keep `credentialReference` internal to API/cloud-engine stores.

- Risk: a validation receipt is mistaken for an authorization token or parsed by consumers.
- Mitigation: name it as an opaque receipt, expose no claim structure, and require the API to validate it server-side.

- Risk: selected subscription IDs are accepted without belonging to the validated customer tenant.
- Mitigation: require API membership validation against the receipt-bound discovered set; the types package cannot enforce runtime membership.

## Rollback / Feature Flag

- Shared type additions are backward compatible and do not need a runtime flag.
- Runtime rollout is controlled by API/UI flags from child specs.

## Security Considerations

- Treat partner/customer tenant IDs and relationship IDs as support-sensitive metadata.
- Do not expose internal credential references in public cloud account DTOs.
- Do not expose authorization profile credential references in public profile DTOs.
- Queue contracts must not permit raw token or refresh-token fields for GDAP.

## Runtime Environment

- Start: N/A.
- Env vars: N/A.
- Tests: existing types-package typecheck and contract test commands.

## Iteration 5 Verification Evidence - 2026-08-03

- TDD: `npm run typecheck:contracts` failed on the missing lifecycle/subscription types and response/create fields before implementation, then passed after implementation.
- `npm run build`: passed, including declaration emit and contract typecheck.
- `npm test`: passed all contract and packed-consumer checks.
- `npm run lint`: passed.
- `npx prettier --check src/accounts/accounts.ts src/accounts/accounts.contracts.spec.ts`: passed.
- Full-repo `npm run format:check`: existing baseline failure across 227 files; the two files changed by this iteration pass the same formatter check.
- Security review: no token, secret, credential-reference, or dependency fields were added to the public contract; negative fixtures reject credential references and refresh tokens. Receipt replay protection and subscription membership validation remain required API work.

## References

- core/specs/cloud-accounts/cloud-account-gdap.md
- types-package/specs/cloud-accounts/cloud-account-guest-access-types.md
- types-package/src/accounts/accounts.ts
- types-package/src/azure/payloads.ts
