# Perimeter Insights paths: shared contracts

Status: implemented foundation — publication and consumer adoption pending
Last updated: 2026-10-19
Owner: Platform
Parent: [Perimeter Insights paths](../../../core/specs/security/perimeter-insights-paths.md)

## Scope

Add optional service classification to exposures and configured-network evidence to traffic paths. Preserve public-ip-addresses-v1, existing exposure kinds, native Azure/AWS resource identity and reports that omit these additions. No version bump or registry publication in this task.

Types-package owns DTOs and dependency-free shape/invariant validators. Packet evaluation, CIDR/service-tag resolution, application policy, wall-clock freshness and priority remain outside this package. Reusable evaluation mechanics belong in platform-packages.

## Tasks

1. Add runtime checks first in `scripts/check-public-ip-addresses-contracts.mjs`, exercised against CJS and ESM root exports. Cover valid allowed/blocked/unverified partitions, legacy omission, bad dates/ports, duplicate/dangling references, bounded arrays and incomplete/stale/clipped blocked claims. Confirm the new check fails before implementation.
2. Add a focused contract module imported by `src/azure/publicIpAddresses.ts`, keeping individual source files below the repo's size guideline. Expose `PerimeterServiceClassification`, `PublicIpAddressesNetworkAccessEvaluation` and bounded packet/decision/source DTOs through the root. Reuse current resource references, port/protocol and freshness vocabulary. Add optional `Exposure.service` and `TrafficPath.networkAccess`.
3. Add strict runtime guards for the new extensions. Guard scope is structural and internally consistent evidence, not complete report validation or proof of actual reachability. Distinguish assessedAt from observedAt; blocked requires current complete exhaustive coverage, nonempty partitions and observed sources. Allowed requires at least one complete allowed partition. Enforce 64 partitions, 8 decisions per partition, 64 selectors per dimension and 32 evidence sources; clipping never means complete.
4. Extend compile-time Azure/AWS fixtures and the packed consumer fixture; wire the runtime check into `npm test`. Run `npm run build`, the focused check, `npm run check:packed-exports`, then package tests at handoff. Record actual evidence below.

## Acceptance and risks

An old Azure/AWS consumer can omit both fields. A new consumer can import the root types and guards in CJS and ESM. Validators reject unsupported enum values and contradictory blocked claims. No SDK, I/O dependency, provider service union, financial helper, packet evaluator or hidden clock enters types-package.

The guard cannot establish that a producer evaluated every real packet or collected truthful sources; producer integration tests and consumers' current-time freshness checks remain required. Wire bounds to exported constants so producer/reader limits cannot drift.

## Rollout and evidence

Publish through the existing owner-controlled package release flow, then update compatible app pins. Packed checks prove compatibility before publication; do not install local source imports or committed tarball dependencies into apps.

2026-10-19 verification:

- Red: the new runtime suite first failed on missing guard exports after rebuilding the baseline. Separate CJS/ESM regressions reproduced acceptance of contradictory first-match decisions and sparse packet arrays before their fixes.
- Final `npm test`: passed exit 0. This rebuilt CJS/ESM/declarations, typechecked contract fixtures, passed all 102 new perimeter checks and the existing package checks, and exercised packed Node 24 ESM/CJS plus legacy/NodeNext Azure/AWS/root consumers, regulatory scoreboard and framework checks.
- Scoped ESLint and formatting: passed. DTO and validator modules remain below 500 lines.
- Independent review verified duplicate filter decisions are rejected while the same NSG at different attachment levels remains valid. It also verified nine sparse/inherited-array cases in each built format are rejected without throwing. No remaining must-fix finding in this foundation.

The baseline worktree was clean, but its tracked dist files were stale against already committed source. Building regenerated 233 substantive tracked output differences, plus EOL-only changes and missing generated files (1,020 dist status entries). These are retained as a coherent build rather than mixing a new root index with old dependency outputs. No unrelated source, package version or lockfile was changed. Review generated output separately from the new perimeter source. The child spec has an explicit .gitignore exception so it can be committed normally.

Outstanding: owner-controlled package publication and Azure/API/coordinated UI adoption. No feature-level or live-scan readiness claimed by this foundation.
