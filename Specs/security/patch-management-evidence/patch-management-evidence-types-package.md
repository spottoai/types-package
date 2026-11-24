# Patch management evidence contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-11-25
Core feature: [Patch management evidence](../../../../core/specs/security/vulnerabilities/patch-management-evidence/patch-management-evidence.md)

## Ownership and semantics

`src/azure/vmPatchManagement.ts` owns the VM patch artifact, status unions, schema
constant and nullable assessment, installation and summary counters. Null means
unavailable; zero is a measured non-negative integer. Optional assessment
`countCoverage` distinguishes current, stale and unavailable count evidence.
`availablePatchCountsByClassification` retains known provider classifications
without claiming that overlapping categories sum to a total.

The engine owns source normalization; API owns authorization/scoped recomputation;
shared reporting owns presentation. Missing new provenance on an old artifact
must not promote initialized numeric zeros into current measurements.

## Coordinated compatibility

The current schema constant remains 1. Nullable counters change the previous
numeric-only wire contract and require coordinated reader-first deployment; they
are not backward compatible with old readers merely because fields already exist.
Publish the types package through its normal reviewed release, adopt it in API,
UI/reportworker and cloud-engine, and deploy compatible API and reporting/Portal
readers before enabling the nullable producer. Refresh active report workers and
browser clients before the producer cutover. Private source-path compilation is
compatibility evidence, never registry adoption or a deployable dependency.

Rolling readers back while nullable artifacts remain accessible is unsafe. First
stop the nullable producer and replace affected published generations with a
compatible producer/reader pair, or retain the new readers. Do not coerce unknown
values to zero to permit a rollback. A future versioned coexistence mechanism must
normalize old and new shapes explicitly; changing a number alone does not protect
old clients that ignore it.

## Verification

Compile-time contract fixtures accept null counters and explicit count provenance
and reject incompatible schema/status literals. Consumer tests must distinguish
observed zero, partial classifications, stale/future evidence and legacy zeros,
including scoped membership and truncated reports.
