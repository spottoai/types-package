# Microsoft 365 default onboarding permissions — Shared types

Status: implementation authorized
Approved: Yes
Approval evidence: user explicitly requested all four Microsoft Graph read permissions as onboarding defaults on 2026-10-05.
Last updated: 2026-10-05
Parent: [Cross-repo plan](../../../core/specs/cloud-accounts/microsoft-365-default-permissions/microsoft-365-default-permissions.md)

## Scope and recon

Files inspected: src/accounts/azureSpSetup.ts; azureSpSetup.contracts.spec.ts. Existing defaults already include LicenseAssignment.Read.All, User.Read.All and AuditLog.Read.All; Reports.Read.All is the additive change. Reuse existing permission catalogs and admin-consent handling. No production grants, deployment or Office usage ingestion is part of this edit.

## Implementation and verification

Action: Add graphReportsReadAll to AzureSpPermissionKey without changing existing keys or endpoint/queue shapes. Build declarations and verify consumer compatibility.
Verify: npm run build; npm test; consumer typechecks
Done: all four read permissions are supported in this path with existing opt-outs and no additional write, content, privacy-setting or lifecycle grants. New shared types must be released before consumer deployment. Existing customers gain access only through their authorized onboarding rerun/Update Access or Terraform apply.

## Risks and rollout

Show tenant-wide metadata/report scope without promising token or invoice data. Test exact role resolution, default selection and permission recovery; keep absence/denial distinct from zero use. Publish types before deploying consumers, and do not assume consent activates report collection. Verification results are recorded in the parent plan.
