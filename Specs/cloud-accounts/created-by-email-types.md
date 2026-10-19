# Cloud account creator email — shared contract

Status: implemented; build and contract compilation passed
Last updated: 2026-10-19
Parent: ../../../core/specs/cloud-accounts/created-by-email.md
Approval: user authorized implementation (“Proceed”).

`CloudAccount` already defines `createdBy: string` and `createdAt: Date`; `PublicCloudAccountDto` retains these properties. `AzureSpSetupDurableStateV1` already defines `initiatedByEmail?: string`. Document creator email as server-authored and immutable, with empty/absent legacy values supported at read boundaries. Keep the shape unchanged; no version bump or package publication is needed.

Task: update JSDoc in src/accounts/accounts.ts and verify package build/contract checks. API and UI consume the current published shape; the engine already consumes the durable-state email. No migration, new helper or dependency.
