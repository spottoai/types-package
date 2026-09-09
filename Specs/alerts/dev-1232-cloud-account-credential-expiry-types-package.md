# DEV-1232 Cloud Account Credential Expiry - Types Package

## Metadata

Status: approved
Approved: Yes - user approved the proposed scope and decisions on 2026-09-09
Iterations: 2
Last updated: 2026-09-09
Owner: Platform
Repo: types-package
Domain: alerts
Parent spec: `core/specs/alerts/dev-1232-cloud-account-credential-expiry/dev-1232-cloud-account-credential-expiry.md`
Spec location: `types-package/Specs/alerts/dev-1232-cloud-account-credential-expiry-types-package.md`

## Summary

Add the compile-time contract for an account-scoped `credentialExpiry` definition sourced from Spotto Cloud Account metadata. Preserve all existing quick-alert types and the current Retirement Tracker credential criteria.

## Scope

In scope:

- Add `cloudAccounts` to `QuickAlertSource`.
- Add `cloud-account-credential-expiry-30d` to `QuickAlertTemplateId`.
- Add `CloudAccountCredentialExpiryAlertCriteria` as a second criteria variant for `kind: credentialExpiry`.
- Add optional `cloudAccountIds` to `BaseAlertScope`.
- Add Cloud Account identity, role, expiry state, and basis to `QuickAlertSummary`.
- Add Cloud Account scope and source-coverage diagnostics to `AlertDefinitionRunState`:
  - `lastScopeCloudAccountIdsCount?: number`
  - `lastScopeCloudAccountIdsSample?: string[]`
  - `lastSourceCoverageStatus?: 'complete' | 'partial'`
  - `lastSourceFailedItemCount?: number`
- Contract fixtures proving existing and new source variants remain distinguishable.

Out of scope:

- Runtime validation, storage reads, date parsing, or notifications.
- Secret-bearing fields in any alert contract.

## Contract Shape

```ts
export type CloudAccountCredentialRole = 'readServicePrincipal' | 'writeServicePrincipal' | 'readWriteServicePrincipal';

export type CloudAccountCredentialExpiryState = 'expiring' | 'expired' | 'expiryUnknown';

export interface CloudAccountCredentialExpiryAlertCriteria
  extends QuickAlertCriteriaBase<'credentialExpiry', 'cloudAccounts', 'cloud-account-credential-expiry-30d'> {
  lookaheadDays: number;
  alertWhenExpiryUnknown?: boolean;
}
```

Keep `CredentialExpiryAlertCriteria` as the existing `serviceRetirement` variant for source compatibility. `QuickAlertCriteriaFor<'credentialExpiry'>` becomes the union of both variants.

## Tasks

1. Add failing compile-time fixtures for both credential sources.
   - Files: `tests/quickAlerts.contract-test.ts` and/or the established alert contract test.
   - Cases: legacy Retirement Tracker definition, Cloud Account definition, create/update input, new summary fields, account/coverage run-state diagnostics, and invalid source/template combinations using `@ts-expect-error`.
2. Extend scope and quick-alert contracts.
   - Files: `src/events/baseAlert.ts`, `src/events/quickAlerts.ts`, `src/events/alertDefinitionRun.ts`, relevant barrels.
   - Preserve the existing exported criteria name and alert type values.
3. Ensure generated declarations and package exports expose the additions.
   - Verify: targeted contract typecheck, build, and packed-export checks.
4. Validate consumers against one local packed artifact before publishing a beta.
   - Consumers: API, cloud-engine, UI.

## Compatibility Rules

- No existing alert type, template, source, field, or export is removed or renamed.
- `cloudAccountIds` and summary/run-state additions are optional so old persisted rows remain readable.
- Runtime layers, not structural typing alone, enforce that a `cloudAccounts` definition uses account scope without subscriptions/tags.
- No `clientSecret`, `secret`, `writeSecret`, token, or credential reference is introduced.

## Test Strategy

- Compile valid definitions for both `credentialExpiry` sources.
- Prove source-specific template IDs and criteria fields narrow correctly.
- Prove server-authored fields remain excluded from create/update inputs.
- Prove old quick-alert fixtures compile unchanged.
- Run package build, lint/format, contract typecheck, and packed exports per repository scripts.

## Definition of Done

- All three consumers compile from the same local tarball.
- Existing Retirement Tracker contract behavior remains source-compatible.
- Invalid source/template combinations fail compilation in fixtures.
- Published package contains no secret-bearing alert field.

## Rollback

The additions are backward compatible. Consumers must stop writing/reading the new source before reverting the package version.

## References

- Parent spec
- `src/events/baseAlert.ts`
- `src/events/quickAlerts.ts`
- `src/events/alertDefinitionRun.ts`
- `src/accounts/accounts.ts`
