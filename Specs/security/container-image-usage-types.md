Status: implemented; registry package verified; consumer deployment assessment outstanding
Last updated: 2026-10-13
Owner: Platform
Domain: security
Parent spec: [Container image usage](../../../core/specs/security/container-image-usage/container-image-usage.md)
Approval required: Parent design approved; package publishing remains a separate delivery action.
Approved: Yes; parent design and implementation approved by the user on 2026-10-13.

# Container image usage — shared contracts

## Outcome and boundaries

Provide neutral artifact usage, coverage, paging and detail contracts consumed by Azure engine, API and Portal. Reuse `src/common/resourceGraph.ts` for the graph overlay and `src/common/resourceIdentity.ts` for open identifiers. Keep `src/azure/relationships.ts` v1, existing graph exports and AWS consumers compatible. No SDK, I/O, cryptography implementation or provider-operation catalogue belongs in types-package.

An image is a synthetic graph node with an open type and generic artifact classification attributes. Application anchors use resource nodes; missing slot anchors use workload synthetic nodes. Existing node kinds/roles and child-to-parent containment suffice. Do not add an ACR/image-specific public enum or public route family. A broad migration of legacy Azure graph formats is outside this work.

## Proposed contract surface

Add `src/common/resourceArtifactUsage.ts` with dependency-free contracts and trust-boundary validators. Export through the established package barrels/subpaths used by consumers; verify actual packed imports rather than relying on sibling source paths.

- `ResourceArtifactUsageManifest`: company and provider/account binding, artifact generation, base relationship snapshot ID, source coverage, freshness, graph/index/detail declarations and paging limits. Declared artifact paths are relative producer-owned paths; validation rejects traversal, absolute URLs, credentials and cross-generation ownership.
- `ResourceArtifactSummary`: immutable artifact ID, open artifact kind, display name, owning resource/subscription, registry/repository/digest attributes, timestamped aliases, supported actions limited to reads, source coverage, and observed usage/finding counts with their completeness.
- `ResourceArtifactUsageEvidence`: parent resource and child workload identities, reference, observed time, configured tag/digest resolution state, resolution time and provenance. An explicit runtime-observation variant is available for future adapters; configured evidence cannot satisfy its required observed runtime fields.
- `ResourceArtifactFinding`: stable finding identity and provider source identity, software/package, detected versions, optional fixed version, CVEs/severity/fix status, and source/evaluation observations. Distinct CVEs and package findings are independently defined; unknown fix or severity remains explicit.
- `ResourceArtifactDetailPage`: authorized account/generation/artifact binding, one declared section (`summary`, `findings`, or `usages`), rows, observed counts/completeness, and continuation metadata. Opaque cursors do not accept storage paths.
- Source coverage: independent source ID, scope, status/reason, observed and last-success times, supported/collected workload classes and collection limits. A source failure cannot serialize a complete zero count. A partial result may expose a labeled observed minimum. Missing runtime collection is explicit.

No monetary values are introduced on image summaries or synthetic image nodes. Existing native resource costs remain owned by their resource.

## Sequential tasks

1. **Define contracts and invariants.** Files: proposed neutral module, current common graph/identity/generation contracts and package export definitions. Action: pin the fields, variants, page identity and source coverage from the parent; preserve existing shapes and exports. Verify: consumers can express all 11 synthetic pilot joins, denied/partial sources and index-to-child associations without provider-service enums. Done: one neutral typed contract covers engine/API/UI use cases.
2. **Implement validators and examples.** Files: proposed contract validators/tests and synthetic examples. Action: validate bindings, generations, references, limits, declared paths and state-specific evidence; allow open provider family/synthetic identifiers. Verify: unknown provider services are accepted by identifier format, while traversal, wrong scope/run/artifact and configured-as-runtime data are rejected. Done: trust boundaries can validate stored content before returning it.
3. **Prove package compatibility.** Files: contract/check scripts, export smoke fixtures and consumer specs. Action: build, pack and validate ESM/CommonJS imports with representative engine/API/UI/legacy Azure/AWS consumers. Verify: `npm test`, `npm run check:resource-graph-contracts`, `npm run check:packed-exports` as applicable; avoid redundant commands already included in the final gate. Done: published-contract adoption is verified before producers depend on it.

## Acceptance, risks and rollout

Synthetic fixtures preserve reference spelling, distinct registry identities, moving tags, duplicate aliases, multi-platform indexes and partial-source counts. Artifact IDs do not masquerade as ARM IDs. Graph metadata carries compact summaries, never entire CVE lists. Detail pages cannot join a graph from another generation.

The new module is additive and independently versioned; publish before readers, then pin consumers through their normal dependency/lock workflow. Package publishing itself remains a separate delivery action. The final patch must pass existing graph, packed import and contract checks, with no provider runtime dependency added.

## Implementation evidence — 2026-10-13

Implemented provider-neutral contracts and exact-shape validators in `src/common/resourceArtifactUsage.ts`; root and narrow `common/resource-artifact-usage` exports are additive. The exact engine/API/UI schema is recorded in [contract handoff](../../../core/specs/security/container-image-usage/contract-handoff.md). Legacy Azure relationship and AWS graph shapes are unchanged. V1 configured evidence explicitly forbids claiming runtime digest observation; a future runtime adapter must introduce its own explicit observation contract.

- `npm test`: passed, including build, typechecked contracts, new runtime trust-boundary checks, all existing contract gates, and actual packed CommonJS/ESM/TypeScript consumers.
- Additional targeted `node scripts/check-resource-artifact-usage-contracts.mjs`: passed after expanding multi-platform, semantic run IDs, source bounds, partial pagination and missing-file cases.
- `npm pack --ignore-scripts --pack-destination <ignored implementation-baseline> --silent`: passed; local `spottoai-types-package-1.1.35.tgz` supplied for consumer validation. Existing prepare uses POSIX `test`/`true` and cannot run under Windows cmd; build was run explicitly before packing. No publish/commit/push performed.

Build regenerated 227 tracked outputs and 341 new outputs from the current source tree, much of which was already committed and newer than checked-in dist. Concurrent unrelated Microsoft 365 contract edits also appeared after the initial baseline and were preserved. Feature-owned outputs account for 5 tracked and 5 new files. No unrelated source was changed by this task. Exact generated-path inventory and ownership classification are in the ignored engine evidence file `apps/azure/samples/acr-investigation/implementation-baseline/types-package-generated-dist-drift.json`. Generated dependencies are retained so the local packed package remains runnable; release review must assess the existing source/dist drift.

Registry release and consumer dependency declarations/locks are verified at 1.1.36 in the final proof below. Runtime adoption and deployment remain separate assessments; successful package checks do not establish deployment.


## Generic containment ruling — 2026-10-13

Integration exposed an existing neutral validator assumption: synthetic nodes could only be contained by structural Region/zone/group nodes. Approved artifact/workload ownership requires synthetic image-to-registry and missing-slot-to-application containment. `ResourceGraphArtifact` retains the same schema and open identifiers; generic validation now additionally permits a synthetic child's parent to be a resource or another synthetic node in the same Region. There are no provider/service enums or changes to legacy Azure graph formats. Ordinary resources retain Region/zone/group parents.

Every node still has exactly one containment parent except the single scope root, which has none. Because synthetic-to-synthetic ownership removes the previous kind-order proof, validation now explicitly walks every containment chain to the scope, rejects cycles/detached hierarchies, and memoizes successful paths. The iterative algorithm uses linear time/memory and avoids stack overflow for deeply nested ownership.

Fail-first evidence: the new image/resource ownership assertion failed with `synthetic nodes cannot be contained by resource nodes` before the validator change. Focused generic/AWS graph and artifact-usage checks pass after implementation; tests preserve cross-Region and original resource-parent restrictions and reject same-Region detached cycles, cycle-dependent workloads and orphan synthetics. A reversed-node-order 5,000-level ownership chain passes. Packed CommonJS/ESM graph consumption verification passed via `npm run check:packed-exports`, including typed public imports and all existing runtime probes. Focused ESLint and `git diff --check` also passed. The local 1.1.35 tarball was refreshed with the generic containment change; SHA-256 `903d10c027a836edd894ebc709b90bbefd46b2b66113b49df3bc1cd9c9966fee`. The full package gate is deferred to the final integration tree as requested.


## Final package drift diagnosis and proof — 2026-10-13

The integration gate's final scoreboard check failed after compiled output was replaced concurrently: current source still exported `RegulatoryScoreboardOverlappingSubscriptionsError` from the scoreboard merge module and root barrel, while `dist/index.js` had reverted to older output without scoreboard/graph/artifact exports; several generated dependency modules were also missing. Requiring that stale root additionally failed for missing `azure/reportEvidence`. This was compiled-output drift, with no artifact-owned source fix needed. An external release commit `5aa0512` changed package/lock version to 1.1.36 during integration; this task did not change versions, reset unrelated work, publish or commit.

Current 1.1.36 verification passed: `npm run check:packed-exports` (includes source build/typechecks, packed ESM/CommonJS/TypeScript public imports), followed by `node scripts/check-regulatory-scoreboard-contracts.mjs`, `node scripts/check-resource-graph-contracts.mjs` and `node scripts/check-resource-artifact-usage-contracts.mjs`. A direct ESM named-import probe also confirmed the scoreboard class and artifact/graph validators were exported functions. No full package gate was repeated.

The current local tarball is `apps/azure/samples/acr-investigation/implementation-baseline/spottoai-types-package-1.1.36.tgz` in cloud-engine, SHA-256 `38f361ad2a956f123275ac7fb3b358d3870079419c91ac43e521f2c5ac2fd15c`. Local packed proof does not establish registry publication or production deployment. Earlier explicitly restored 1.1.35 consumers remain distinct from this current-version proof.


## Registry publication and pins verified — 2026-10-13

Read-only GitHub Packages metadata and version-specific download verified `@spottoai/types-package@1.1.36`. The types-package checkout's user scope registry resolves to npmjs (older beta channel), so the authoritative query used cloud-engine's existing GitHub Packages configuration without mutating any npm configuration. Registry SHA1 `6fc688d7f1f182363fd3da55d377963dee9d0c5c` and SHA512 integrity matched the downloaded bytes; tarball SHA-256 is `83a9fd79430f41ef0947b3bc19192aa42f9a408160f27cdb5890eef397b1f82c`.

All 21 narrow artifact runtime exports match the local package. Fifteen selected artifact/graph CommonJS, ESM and declaration outputs, including common/root barrels, are byte-identical to the verified local 1.1.36 package. Both packages passed actual self-export CommonJS and ESM import checks, scope-bound manifest/index/page validation, restricted-count and configured-as-runtime rejections, synthetic resource/child ownership, containment cycle rejection, preserved resource-parent policy, and scoreboard class availability.

Evidence/replay: ignored `cloud-engine/apps/azure/samples/acr-investigation/implementation-baseline/registry-proof/registry-artifact-contract-proof.json` and `verify-registry-contracts.mjs`. The parent independently verified engine root/app, API and UI declarations/locks already pin 1.1.36. Registry publication and dependency pins are therefore verified; runtime adoption of published outputs and deployment remain separate. No consumer dependency copies, manifest/lock/config edits, publication or Git actions were performed by this diagnostic task.
