# Features and permissions contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-10-29
Core feature: [Features and permissions](../../../../core/specs/access/authorization/features-and-permissions/features-and-permissions.md)

## Scope and implementation state

Root-exported access contracts are implemented in `src/features-and-permissions`.
Promotion-template DTOs, optional access metadata and mixed-audit projections are
implemented here. API storage/validation/audit delivery, platform evaluation and
Portal editor/modal adoption remain Designed in their owning repositories. These
contracts grant no access and implement no promotion workflow.

The [core promotion rules](../../../../core/specs/access/authorization/features-and-permissions/features-and-permissions.md#promotion-templates)
own inheritance, presentation and safety. The
[API contract](../../../../api/specs/access/features-and-permissions/features-and-permissions-api.md#promotion-templates-designed)
owns endpoints, normalization, runtime content validation and conditional storage.

## Template and message DTOs

`promotionTemplates.ts` exports the company/template reference, content, persisted
document, summaries, list/detail responses, create/update requests and resolved
message query/response. The feature barrel and package root expose them without
new runtime dependencies or package subpaths.

`PortalPromotionTemplateBody` reuses Company Notes answer `format`/`doc` fields;
ordinary note `document` and optional plain-text contracts are unchanged. This is
shared document structure, not proof of safe content: API validates the restricted
promotion node/mark/URL schema, input size and ownership at runtime.

Create accepts content only; update requires status and `expectedRevision`.
Administrative responses carry identity, modification metadata and a revision;
detail adds `localUsageCount`. Lists contain summaries without body or pagination.
`PortalFeaturePromotionResponse` contains only company, feature, action, title,
body and optional contact action. It excludes owner/reference/audit fields and a
cache revision. A 204 response has no message body.

## Access compatibility

`PortalCompanyFeatureOverrideWriteRequest` is the strict new authoring DTO: Allow
has no presentation/reference; Deny/Restrict accept Hidden, Teaser or Promo, with
a reference only for explicit Promo. The broad legacy
`PortalCompanyFeatureOverrideUpsertRequest` remains source compatible, including
old presentation values. API validation and stored-row normalization enforce the
core matrix; changing a type does not perform that migration.

Stored overrides and audit snapshots add optional `promotionTemplateRef`.
Effective/feature access results add optional `promotionAvailable` and
`restrictionSource`; feature-set summaries also carry optional restriction
provenance. Optionality preserves older responses. Administrative configuration
may expose the template reference; ordinary bootstrap does not.
`PortalFeaturePresentationSource` carries the shared evaluator's internal winner
identity/reference and is not an ordinary bootstrap payload.

## Audit compatibility and consumer adoption

Existing `PortalFeatureSetAuditAction`, `PortalFeatureSetAuditEvent` and
`PortalFeatureSetAuditPage` retain their feature-set-only meaning. The optional
feature-set discriminator permits existing stored events without `targetType`.
New `PortalPromotionTemplateAuditEvent` uses `targetType: promotion_template`, a
template ID, one of the four lifecycle actions and revision/status snapshots;
it cannot use a fabricated feature-set key or contain template bodies.

New readers adopt `PortalFeatureAuditEvent`, `PortalFeatureAuditAction` and
`PortalFeatureAuditPage` for the same mixed stream. Narrow on `targetType` before
reading a target's identity; an absent discriminator denotes a legacy feature-set
event. Existing feature-set pages remain assignable to the mixed projection.
API/UI must adopt the mixed DTOs before emitting/rendering template events; the
legacy page type must not describe a response containing template events.

Package release, API/UI adoption and the platform evaluator's provenance/source
selection are separate work. The current package version is unchanged by this
source change. No API/UI feature is claimed implemented by publishing the types.

## Verification

- `npm run typecheck:contracts` compiles positive and negative fixtures in
  `tests/promotionTemplates.contracts.spec.ts`, including old request/event/page
  compatibility, strict writes, audit targets, snapshots and public response keys.
- `npm run build` emits declarations and CommonJS/ESM artifacts.
- `npm run check:packed-exports` compiles the installed root declarations from
  ESM and CommonJS promotion consumer fixtures; `npm test` includes this check.
- Run focused ESLint/Prettier and specification/link checks for changed files.
