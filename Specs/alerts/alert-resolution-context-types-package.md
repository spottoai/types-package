# Optional alert resolution context

Type: repo
Core feature: core/specs/alerts/alerts-near-real-time-remediation.md

`QuickAlertSummary.resolution?: AlertResolutionContext` is an additive public contract. Version 1 records Azure remediation kind, source directory, source identity and observation date; optional application client/object, service-principal object, credential, Key Vault object, benefit and resource identities support subtype-specific guidance. It never includes credential values or private keys. IDs are named by their meaning: an opaque sourceEntryId is not an ARM or directory-object ID. Optional documentation URLs require validation by consumers.

`ApplicationCredentialRetirementRenderData` now declares the existing service-principal source fields plus the collector's source tenant. The application client ID and directory object ID remain separate.

Older summaries remain valid. Consumers must ignore future versions and unknown kinds, validate external URLs and handle missing identities with manual guidance. Producer updates preserve alert IDs and status. Compile-time fixtures cover existing and enriched summaries; producer and UI tests cover serialized storage and runtime validation.

Publish this additive contract before updating consuming package ranges/lockfiles and deploying producer/UI changes. Local worktree links prove compilation against this source but do not establish registry availability. No package publish or deployment is performed by this change.
