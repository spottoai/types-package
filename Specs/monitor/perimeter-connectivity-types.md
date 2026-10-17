# Perimeter connectivity evidence contracts

Status: types implemented; consumer adoption pending
Last updated: 2026-10-17
Repo: types-package
Scope approved: user requested types-package changes first after reviewing the engine-first proposal.

## Intent and scope

Perimeter Insights must distinguish configured forwarding from a path to a running
workload, and explain its destination without requiring the dependency graph.
This phase adds shared evidence contracts only. Collection, risk classification,
runtime validation, UI rendering and exports remain consumer follow-ups.

Recon: `src/azure/publicIpAddresses.ts` already owns the Azure/AWS report envelope,
exposure evidence and collection coverage. The root barrel exports it. Contract
checks compile source fixtures, then `npm test` verifies packed consumers.

## Contract decisions

- Keep the existing schema identifier, required fields, assignment semantics and
  aggregate exposure counts. Add optional item `connectivity` and exposure
  `trafficPathIds`. Legacy omission means unknown connectivity, never no backend.
- Publish one item-level path catalogue. Exposure path IDs reference that
  catalogue so mixed backends can be assessed for each rule without duplicating
  paths or applying an unrelated orphan to every exposure.
- Each path has an opaque unique ID, optional native rule reference, ordered
  resource hops after the public endpoint, protocol, separate frontend/backend
  port ranges, configuration observation time and evidence descriptions.
  Null port ranges mean unavailable mappings, not all ports. Empty arrays do not
  prove that no forwarding exists. Resource IDs retain native provider identity.
- A destination discriminant distinguishes a resolved workload, proven detached
  NIC, proven unconfigured backend, and unresolved evidence. A workload carries
  a separate power-state observation time, provenance and optional native state.
  Transitional and unknown states cannot authorize an inactive-workload downgrade.
  A referenced resource missing from collection is unresolved, not detached.
- Connectivity carries required collection coverage and the existing artifact
  freshness vocabulary. Complete coverage includes all relevant rules, target
  resolution and required workload observations; truncated catalogues are partial.
  Missing or stale/expired/unknown evidence never authorizes reducing severity.
  Consumers must re-evaluate freshness from observation times as the report ages;
  report publication time is not collection or runtime-state evidence.
  Missing observation times cannot establish current evidence. A complete
  collection may still have unknown power state; that cannot establish inactivity.
- A configured path and running VM do not prove end-to-end reachability. Existing
  `effectiveReachability` remains separate. No risk policy or severity calculator
  is added to this package. Empty LB pools alone do not establish an orphan:
  direct inbound NAT targets and NIC reverse references must also be considered.
- Add `remove_unused_network_resources` to the remediation vocabulary for a
  review-based cleanup recommendation; the kind does not authorize deletion.

## Sequential tasks and verification

1. Extend source contract tests and the existing packed public-IP consumer.
   Files: `src/azure/publicIpAddresses.contracts.spec.ts`,
   `tests/fixtures/public-ip-addresses.consumer.ts.fixture`.
   Verify: `npm run typecheck:contracts` fails for absent extension types/fields.
   Done: fixtures cover remapped RDP, running/deallocated/detached/no-backend/
   unresolved destinations, mixed paths, unknown observations and legacy omission.
2. Add and document the optional evidence types.
   Files: `src/azure/publicIpAddresses.ts`, `README.md`, this spec, `.gitignore`.
   Verify: source contracts compile; malformed destination combinations and invalid
   state/mapping values remain compile errors.
   Done: existing Azure/AWS producers need no changes and root exports expose types.
3. Build and verify the package boundary.
   Files: generated `dist/azure/publicIpAddresses.d.ts` and declaration map.
   Verify: `npm test` (build, contracts and packed ESM/CommonJS consumer gates),
   focused ESLint/Prettier, `git diff --check`.
   Done: record results below; leave unrelated local changes intact.

## Consumer handoff and rollout

Release a new types-package version before consumer adoption; this phase does not
publish or change the package version. Azure cloud-engine must collect and emit
the path catalogue, prove negative attachment/backend facts using complete
inventories, retain backend service ports and map raw VM power-state evidence.
API must preserve the extension and validate untrusted identities/references in
the authorized company/subscription. UI's common perimeter model must assess
all relevant paths conservatively, then update row destinations, filters,
dashboard signals, remediation and CSV/Word exports consistently. AWS retains
legacy behavior until its producer opts into these optional contracts.

Rollback: stop emitting/reading the optional fields and retain the existing
report schema and exposure evidence. No queues, storage paths, permissions or
provider-side operations change here. Do not derive confirmed vulnerability or
reachability claims from configuration or workload power alone.

## Completion evidence

- Baseline `npm run typecheck:contracts`: passed before adding the new fixtures.
- Fail-first `npm run typecheck:contracts`: failed for missing connectivity types,
  fields and cleanup remediation kind; passed after adding the contracts.
- `npm test`: passed, including CJS/ESM builds, the full contract suite and the
  packed Node 24 ESM/CommonJS public-IP consumer with legacy Azure/AWS fixtures.
- Focused ESLint and Prettier checks: passed for the changed type and source
  fixture; the packed TypeScript fixture and this spec also passed Prettier.
- Scoped `git diff --check`: passed, including generated public-IP declarations.
- Package version remains 1.1.43; no release or consumer dependency update was
  performed. Engine/API/UI and browser verification are follow-up work outside
  this types-only phase. The report's severity behavior has not changed yet.
