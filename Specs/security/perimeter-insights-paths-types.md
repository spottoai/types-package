# Perimeter Insights paths: shared contracts

Status: gateway routing and WAF contract extension in progress
Last updated: 2026-10-19
Owner: Platform
Parent: [Perimeter Insights paths](../../../core/specs/security/perimeter-insights-paths.md)

## Scope

Add optional service classification to exposures and configured-network, gateway-route and WAF evidence to traffic paths. Preserve public-ip-addresses-v1, existing exposure kinds, native Azure/AWS resource identity and reports that omit these additions. No version bump or registry publication in this task.

Types-package owns DTOs and dependency-free shape/invariant validators. Packet evaluation, CIDR/service-tag resolution, application policy, wall-clock freshness and priority remain outside this package. Reusable evaluation mechanics belong in platform-packages.

## Tasks

### Gateway routing and WAF increment

Jay approved extending the shared types before the next engine increment on 2026-10-19. Add optional `TrafficPath.gatewayRoute` without changing the artifact version, destination union, risk policy, existing network evidence or package version. The earlier network/service foundation was published and adopted; this gateway extension awaits owner-controlled publication and consumer adoption.

Model one configured route/target per existing traffic path: gateway, frontend/listener HTTP(S) protocol/port/hosts, basic/default/path match, native routing/path references and order, backend pool/settings plus a configured resource/IP/FQDN target, or a distinct redirect/empty-pool/unresolved outcome. Preserve rewrite references and unresolved path reevaluation. FQDN configuration never implies DNS resolution; redirect/empty-pool metadata never establishes orphan cleanup. External redirect URLs must omit credentials, query and fragment; preserve query/path forwarding flags separately.

WAF evidence retains the gateway/listener/path association chain, selected association, policy versus inline basis, enabled flag and mode. Path overrides listener, which overrides gateway. A missing higher-scope policy stays unverified rather than falling back to a known lower policy. Prevention is a configuration state, not proof of universal protection; retain counts for custom allow rules/exclusions/managed sets as nullable metadata. No source dates, packet algebra, provider SDK, DNS lookup or priority calculation is fabricated by the types package.

| Task | Files | Action | Verify / done |
|---|---|---|---|
| Additive DTOs | Gateway module, traffic-path type, root exports | Bounded route/listener/target/redirect/WAF and observation-source contracts. | Legacy omission and discriminated forwarding compile in source and packed consumers. |
| Strict extension guards | Shared internal evidence primitives and gateway validation module | Dense arrays, source/reference integrity, timestamps, declared coverage/omissions, WAF selection consistency, contradictory forwarding rejection. | Focused CJS/ESM contract checks, including malformed/sparse/stale/partial/redirect/unknown-policy cases. |
| Handoff | Package scripts, fixtures, README and specs | Document publisher/engine/API responsibilities and export the new guards. | Build/declarations, original filtering checks and packed CJS/ESM/legacy/NodeNext consumers; no engine/UI changes or publication. |

Bounds: 64 hosts and path patterns, 32 observed sources, 3 applicable WAF association levels, 64 reasons; existing bounded IDs/labels apply. Missing/partial/clipped route evidence remains explicit. These validators establish shape and declared consistency, not route reachability, provider authorization, truthful collection, actual precedence coverage or WAF effectiveness. Broader unit suites remain paused at Jay's request; focused contract/build/packed checks are required for this shared boundary.

Primary references checked 2026-10-19: [request routing and redirect targets](https://learn.microsoft.com/en-us/azure/application-gateway/configuration-request-routing-rules), [WAF association precedence](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/policy-overview). Public service endpoints and identity contracts remain subsequent increments.

1. Add runtime checks first in `scripts/check-public-ip-addresses-contracts.mjs`, exercised against CJS and ESM root exports. Cover valid allowed/blocked/unverified partitions, legacy omission, bad dates/ports, duplicate/dangling references, bounded arrays and incomplete/stale/clipped blocked claims. Confirm the new check fails before implementation.
2. Add a focused contract module imported by `src/azure/publicIpAddresses.ts`, keeping individual source files below the repo's size guideline. Expose `PerimeterServiceClassification`, `PublicIpAddressesNetworkAccessEvaluation` and bounded packet/decision/source DTOs through the root. Reuse current resource references, port/protocol and freshness vocabulary. Add optional `Exposure.service` and `TrafficPath.networkAccess`.
3. Add strict runtime guards for the new extensions. Guard scope is structural and internally consistent evidence, not complete report validation or proof of actual reachability. Distinguish assessedAt from observedAt; blocked requires current complete exhaustive coverage, nonempty partitions and observed sources. Allowed requires at least one complete allowed partition. Enforce 64 partitions, 8 decisions per partition, 64 selectors per dimension and 32 evidence sources; clipping never means complete.
4. Extend compile-time Azure/AWS fixtures and the packed consumer fixture; wire the runtime check into `npm test`. Run `npm run build`, the focused check, `npm run check:packed-exports`, then package tests at handoff. Record actual evidence below.

## Acceptance and risks

An old Azure/AWS consumer can omit all three optional extensions. A new consumer can import the root types and guards in CJS and ESM. Validators reject unsupported enum values, contradictory blocked claims and contradictory gateway/WAF configuration. No SDK, I/O dependency, provider service union, financial helper, packet evaluator or hidden clock enters types-package.

The guard cannot establish that a producer evaluated every real packet or collected truthful sources; producer integration tests and consumers' current-time freshness checks remain required. Wire bounds to exported constants so producer/reader limits cannot drift.

## Rollout and evidence

Publish through the existing owner-controlled package release flow, then update compatible app pins. Packed checks prove compatibility before publication; do not install local source imports or committed tarball dependencies into apps.

2026-10-19 verification:

- Red: the new runtime suite first failed on missing guard exports after rebuilding the baseline. Separate CJS/ESM regressions reproduced acceptance of contradictory first-match decisions and sparse packet arrays before their fixes.
- Final `npm test`: passed exit 0. This rebuilt CJS/ESM/declarations, typechecked contract fixtures, passed all 102 new perimeter checks and the existing package checks, and exercised packed Node 24 ESM/CJS plus legacy/NodeNext Azure/AWS/root consumers, regulatory scoreboard and framework checks.
- Scoped ESLint and formatting: passed. DTO and validator modules remain below 500 lines.
- Publication readiness follow-up: full `npm run lint` passed exit 0 on the unchanged implementation, matching the release workflow's lint requirement. The full npm test/packed-consumer results above remain applicable; only documentation changed afterward.
- Independent review verified duplicate filter decisions are rejected while the same NSG at different attachment levels remains valid. It also verified nine sparse/inherited-array cases in each built format are rejected without throwing. No remaining must-fix finding in this foundation.

The baseline worktree was clean, but its tracked dist files were stale against already committed source. Building regenerated 233 substantive tracked output differences, plus EOL-only changes and missing generated files (1,020 dist status entries). These are retained as a coherent build rather than mixing a new root index with old dependency outputs. No unrelated source, package version or lockfile was changed. Review generated output separately from the new perimeter source. The child spec has an explicit .gitignore exception so it can be committed normally.

The network/service foundation was subsequently published in 1.1.49 and adopted by Azure/API. Its earlier validation above is historical; it does not certify later gateway changes or the full feature release.

Gateway/WAF verification on 2026-10-19:

- `npm run build`: passed CJS, ESM, declarations and source contract compilation.
- Focused built runtime checks: existing network/service suite 102/102; new gateway/WAF suite 102/102, each across CJS and ESM. Includes WAF overrides, disabled/inline/absent/unknown states, empty pools, backend literals/FQDN/resources, redirects, unsafe URLs, sparse/oversized arrays and stale/partial evidence.
- Independent review found one issue: gateway coverage issues accepted unknown nested fields. A regression reproduced it in both formats before the fix. Gateway-local exact-key validation now rejects it; the shared NSG validator retains its existing behavior. No other confirmed must-fix finding.
- The build regenerates tracked package outputs and fills missing baseline-generated modules; retain a coherent `dist` tree. No package version, dependency lockfile, app source or UI changed. Existing unrelated staged account changes were preserved.
- Broader package/application suites remain paused at Jay's request. Packed consumer and scoped lint results will be recorded after completion; no full release gate is claimed.

Outstanding: owner-controlled publication of the gateway extension, registry adoption and Application Gateway collection/evaluation in Azure, followed by tolerant API/Ask Spotto consumption and coordinated UI work. Endpoint-service and identity increments remain separate. No feature-level or live-scan readiness is claimed by this types-only increment.
