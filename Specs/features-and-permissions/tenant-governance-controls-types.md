# Tenant governance controls — shared contracts plan

Parent: `core/specs/features-and-permissions/tenant-governance-controls/tenant-governance-controls.md`

## Scope

- Add hierarchy membership summary and scoped removal contracts under users.
- Add audit contracts (stable actor ID plus optional display name and email), an Azure-continuation paged audit response, and feature-set configuration contracts under features and permissions.
- Keep historical `locked` and `unlocked` audit actions readable, but expose no live feature-set lock state, mutation request, or configuration metadata.
- Keep all additions backward compatible and avoid runtime dependencies.

## Verification

- Compile-only exactness checks for closed unions and required governance fields.
- Package build, lint, formatting, and contract checks.
- Publish before API/UI dependency bumps.
