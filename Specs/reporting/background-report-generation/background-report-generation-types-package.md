# Background report generation in types-package

Type: repo
Status: living
Owner: Platform
Last updated: 2026-10-27
Core feature: [Background report generation](../../../../core/specs/reporting/generation/background-report-generation/background-report-generation.md)

## Contracts and boundaries

The reporting-jobs subpath defines immutable requests, identities, lifecycle rows, queue pointers and safe status projections. The scheduler subpath defines report-generation schedules. Contracts contain no provider SDK, storage access or application configuration.

Report types are `sdm`, `architecture-assessment` and `report-pack`. Report Pack configuration requires an explicit three-letter uppercase currency and a nonempty, unique selection from twelve stable catalogue IDs. Strict parsing rejects unknown fields and unsupported IDs. Canonical serialization uses catalogue order so request identity does not depend on checkbox order.

Pack job IDs use the same reverse-time and scope-hash scheme as other reports. Pack filenames end in `.zip`; other background reports require `.docx`. Filename sanitization, bounded lengths and row/projection validation agree on the extension. A filename must contain a name before its extension.

The scheduled report union accepts Report Pack without a separate scheduler family or broker schema. Existing SDM and Current State shapes remain unchanged. The original scheduler can be captured in the existing optional requestedByUserId field without changing the immutable request specification.

## Consumer and release contract

API, scheduler and reportworker adopt published registry versions through their manifests and locks. Package publication precedes consumer adoption; a local built-package replacement is development feedback rather than clean-install evidence. Consumers must recognize Report Pack IDs and validate ZIP metadata before accepting pack work.

## Verification

Canonical `npm test` builds CommonJS/ESM outputs and runs the reporting-job, Report Pack and packed-export checks. The pack checks cover canonical selection, invalid/duplicate/path-like IDs, unknown fields, schedule acceptance, job identity and ZIP/DOCX filename boundaries. Consumer builds and runtime checks belong to their owning repositories.
