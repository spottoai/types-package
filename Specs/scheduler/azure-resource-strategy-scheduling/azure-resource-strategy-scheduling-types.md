# Azure Resource Strategy Scheduling — Types Package

Status: approved
Approval required: Yes — breaking shared scheduler contract
Approved: Yes
Approver/evidence: User approval in the Codex sessions on 2026-09-15 to begin implementation, on 2026-09-16 to unify resource-strategy and recommendation-action scheduling without legacy contracts, and on 2026-09-18 to expose durable dry-run evaluation progress separately from schedule and command-operation state and to keep Action Lab evidence outside customer runtime contracts
Iterations: 7
Last updated: 2026-09-19
Owner: Platform
Repo: types-package
Domain: scheduler
Parent spec: `core/specs/scheduler/azure-resource-strategy-scheduling/azure-resource-strategy-scheduling.md`
Spec location: `types-package/Specs/scheduler/azure-resource-strategy-scheduling/azure-resource-strategy-scheduling-types.md`

## Summary

Replace both service-specific resource DTOs and the old D1 recommendation scheduler DTOs with one strict schedule-definition/projection union. The original provider-neutral `resource-strategy-weekly` interface remains intact as one member; a bounded `recommendation-action` member preserves the current user flow without preserving the old transport. This package describes public data and portable validation only.

## Scope

In scope:

- The original `resource-strategy-weekly` write/projection interfaces.
- `ScheduleWriteRequest`/`ScheduleProjection` unions discriminated by `definitionType`.
- A bounded `recommendation-action` definition with once/recurring trigger, `implement` operation and existing target selectors.
- Weekly transition rules and a portable edge-case fixture corpus.
- Static capability projection, private readiness and lifecycle/status DTOs.
- Non-authoritative scheduling opportunities.
- Non-persisting draft preview request/response.
- Exact-scope permission manifest projection and confirmation references.
- Generic `SchedulerTickRequestMessageV1`, internal occurrence union and resource transition envelope required between runtime modules.
- Generic `SchedulerControlRequestMessageV1`, `SchedulerOperationAcceptedResponse` and `SchedulerOperationProjection` for the asynchronous API/engine boundary.
- `ResourceScheduleDryRunEvaluationProjection` for durable queued/running/retrying/terminal progress, containing the existing final dry-run verdict only after a complete evaluation.
- Removal of VM/Bastion-specific DTOs, old `ScheduleSummary`/target/schedule-type transport, `SchedulerBatchQueueMessage` and resource-prefixed tick contract.

Out of scope:

- Runtime catalogue/configuration content.
- Azure operations, Action/ActionPermission schemas or service-specific permission types.
- Storage entity and due-index shapes.
- UI view models/localization.
- Compatibility unions or validators for any removed scheduler contract.

## Success Criteria

- A second capability using `weekly-availability` compiles without a new public discriminator or resource-specific DTO.
- Public authoring cannot carry Action IDs, provider verbs/endpoints, permission arrays, baselines or internal transitions.
- `resource-strategy-weekly` is the only resource-scheduling definition discriminator in this delivery.
- `recommendation-action` is the only additional definition family and accepts only `operation = implement`.
- Money-bearing preview/opportunity types require basis, provenance, period, currency evidence and additivity.
- VM/Bastion contracts, old base-scheduler contracts, batch queue message and resource-prefixed tick are absent from the built package.
- Scheduler control commands contain no endpoint/function key, provider request, Action ID, permission array or baseline authority; terminal operation results are strictly paired with their command kind.
- Dry-run evaluation distinguishes infrastructure progress/failure from a completed blocked verdict and strictly binds every state to schedule revision and control generation.

## Local Recon

- Entry points: `src/scheduler/resourceStrategy.ts`, `src/scheduler/resourceStrategyContracts.ts`, `src/scheduler/schedulerContracts.ts`, `src/scheduler/index.ts`, `src/azure/payloads.ts`, `src/index.ts`.
- VM and Bastion schedules use the same `resource-strategy-weekly` definition, distinguished by capability identity and provider-neutral strategy configuration rather than dedicated schedule contracts.
- Resource-strategy and recommendation-action definitions share the strict scheduler union; legacy VM, Bastion and batch-specific scheduler exports are absent.
- Current package build emits CommonJS, ESM and declaration artifacts and runs consumer package checks.
- Published `.425` is the current consumer baseline and must be superseded by a coordinated package release for the additive `restore-and-delete` command.
- Remaining questions: none.

## Contract Families

### Capability and presentation

- `ResourceStrategy = on-off | dial | sku-change | recreate`.
- `ResourceSchedulingCapabilityRef` carries opaque `capabilityId` and immutable `capabilityVersion` exactly as defined by the parent interface.
- `ResourceSchedulingCapabilityProjection` retains the parent fields for content identity, provider/resource types, strategy, display metadata, configuration schema, recommendation/lifecycle/execution policy, baseline, cost, cadence, disruption, restore, automation, dependencies and acknowledgement.
- The projection remains tenant-independent and excludes Action IDs, provider requests, permission internals and per-company readiness.
- Action Lab results are engineering release/CI/audit artifacts and are not represented in the public capability projection, readiness or dry-run contracts.

### Generic weekly schedule

- `definitionType = resource-strategy-weekly`.
- `ResourceStrategyWeeklyScheduleWriteRequest` retains `providerScopeId`, required `cloudAccountId`, exact `resourceId`, capability ref, name, IANA timezone, default parameters, weekly rules, busy policy, blackout dates, active range, initial mode, notification policy, acknowledgements and notes.
- Each rule retains stable `ruleId`, `transition = reduce | restore`, Sunday-through-Saturday `daysOfWeek = 0..6`, `desiredStateAtLocal` and optional parameter overrides.
- `ResourceStrategyWeeklyScheduleProjection` retains schedule/revision/control/ETag/status/audit fields and permission-manifest reference from the parent interface.
- Clients cannot add Action IDs, endpoints, provider API versions, permission arrays, baselines or compiled due rows.

### Unified schedule union and recommendation action

- `ScheduleWriteRequest = ResourceStrategyWeeklyScheduleWriteRequest | RecommendationActionScheduleWriteRequest`.
- `ScheduleProjection = ResourceStrategyWeeklyScheduleProjection | RecommendationActionScheduleProjection`; callers narrow only through `definition.definitionType`.
- `RecommendationActionScheduleWriteRequest` contains `definitionType = recommendation-action`, name, IANA timezone, a bounded once/recurring trigger, provider-scope/cloud-account identity, recommendation ID, `operation = implement`, current single/selected/provider-scope target selector, initial active/paused mode, notes and bounded configuration.
- Provider name, target count, due timestamps, occurrence/run identity, execution payload and action metadata are server-derived and absent from writes.
- `SchedulerTickRequestMessageV1` replaces the resource-prefixed tick without carrying a company, schedule, resource, family or Action selection.
- `SchedulerControlRequestMessageV1` carries one create/update/delete/lifecycle/preview/readiness/catalogue command on the existing request queue. It binds company, actor, correlation and operation identity without exposing transport destinations or provider operations.
- `SchedulerOperationAcceptedResponse` supports `202 Accepted`; `SchedulerOperationProjection` is a pending/succeeded/failed union whose typed result is constrained to the originating operation kind.
- `ScheduledOccurrenceV1` is an internal discriminated union. It includes the unchanged resource transition envelope and a recommendation-action occurrence containing only validated target/recommendation identity, trigger/occurrence identity and correlation metadata.
- The package exports no `SchedulerBatchQueueMessage`, `SchedulerBatchRunItem`, old `ScheduleTargetType`/`ScheduleType` transport or compatibility validator.

### Canonical weekly fixture corpus

The package exports or packages one dependency-free corpus consumed by UI and cloud-engine tests. Cases cover:

- Business Hours and Daily presets;
- cross-midnight;
- Sunday/Monday week wrap;
- touching periods;
- exact start/end boundaries;
- spring-forward missing local time;
- fall-back first/second occurrence policy;
- invalid overlap/conflicting final modes.

Each valid case includes the displayed availability periods, equivalent transition rules and sampled boundary/instant expectations. The corpus uses the parent contract's weekday numbering and field names. The package does not own the production resolver.

### Readiness and lifecycle

- `ResourceSchedulingReadinessProjection` retains the parent `state` union and company/cloud-account/provider-scope/resource/capability identity, timestamps, reason codes, missing actions, required/offending scopes and repair link.
- `ResourceSchedulingExecutionProjection` retains the parent lifecycle state, active recovery cycle, `restoreOwed`, last run phase/outcome and allowed commands.
- Generic lifecycle commands include `restore-now` for a one-time availability override and `restore-and-delete` for the protected restore, verify and delete workflow. Neither command exposes provider-specific restore mechanics.
- Raw provider errors and baseline values remain excluded.

### Dry-run evaluation

- `ResourceScheduleDryRunProjection` remains the bounded final `ready | blocked` verdict and carries the 31-day window, check results and result freshness timestamps.
- `ResourceScheduleDryRunEvaluationProjection` adds `queued | running | retrying | ready | blocked | failed`, deterministic evaluation identity, revision/generation fencing, bounded timestamps, attempt metadata, optional final result and redacted terminal error.
- `result` exists only for `ready | blocked`; `error` exists only for `failed`; `nextAttemptAtUtc` exists only for `retrying`; `completedAtUtc` exists only for terminal state.
- The contract exposes no percentage or provider-specific check stage because dry-run checks execute in parallel and the engine owns their implementation.

### Opportunity and preview

- `ResourceSchedulingOpportunity` has no schedule ID, active status, mutation command or Action reference.
- Preview request carries normalized unsaved draft, canonical `draftHash`, evidence references and bounded concurrency context.
- Optional `draftPeriodKey` is request-local correlation only.
- Preview response echoes `draftHash` and returns typed availability plus optional aggregate/per-window standalone scenario money.
- Money requires basis, provenance, period/coverage, currency evidence, additivity and evidence timestamp.
- Preview shapes have no field that can persist, materialize, dispatch or execute.

### Permission projection

- Complete-manifest reference/hash and confirmation request.
- Ordered exact-scope grant groups with group hash, operation-set hash, exact assignment scope, principal reference and immutable role/assignment references.
- Added/removed permission diff entries bind grant-group hash, provider scope, exact assignment scope, operation kind and operation. A scope move is represented explicitly as one removal and one addition, even when the provider operation is unchanged.
- `new` and `missing` mean that the effective target manifest is absent, so their added-operation diff must cover every operation in the complete current manifest.
- Opaque provider operations are display data, never a union of Azure services.
- Client confirmation cannot supply or edit operation arrays or role JSON.

### Internal transition envelope

`ScheduledResourceTransitionV1` retains the parent fields for company/provider/cloud-account/resource identity, schedule/revision/control generation, rule/occurrence/run identity, desired and dispatch times, optional reduce deadline, immutable capability ref, transition, bounded parameters, permission-manifest ref and correlation. It never carries a client baseline or unverified Action ID.

## Direct Replacement Inventory

| Current contract                                        | Replacement/removal                                                                     |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `vm-runtime-weekly` definition/configuration            | Parent-defined `resource-strategy-weekly` contract and weekly transition rules          |
| `bastion-availability-weekly` and `bastionSchedule*.ts` | Removed; Bastion authoring uses `resource-strategy-weekly` plus a `recreate` capability |
| client `resource-operation`/operation/Action selection  | Opaque capability reference                                                             |
| service-specific readiness DTOs                         | Generic readiness                                                                       |
| Bastion validation/check script                         | Generic contract and forbidden-field checks                                             |
| old `ScheduleWriteRequest` target/schedule-type union   | New definition-discriminated schedule union                                             |
| `ScheduleSummary`/`ScheduleDocument`                    | Family projection union                                                                 |
| `SchedulerBatchQueueMessage`/run item                   | Removed; cloud-engine creates authoritative occurrences                                 |
| `ResourceSchedulerTickRequestMessageV1`                 | `SchedulerTickRequestMessageV1`                                                         |
| synchronous engine response                             | accepted operation plus bounded operation projection                                    |

No old definition, validator, queue message, export or package artifact remains after the coordinated cutover.

## Tasks

1. Add failing generic contract tests.
   Files: new `src/scheduler/resourceStrategy.contracts.spec.ts`, contract type-test configuration
   Action: assert the parent interfaces field-for-field and reject service-specific discriminators, client actions, provider operations, baselines, ambiguous money and mutable capability references.
   Verify: run the focused contract compiler and confirm the expected RED failures before implementation.
   Done: tests fail only because the new contract is absent or old fields remain accepted.

2. Add generic DTOs, validators and fixture corpus.
   Files: new `src/scheduler/resourceStrategy.ts`, optional focused validator module, `src/scheduler/fixtures/weekly-availability-v1.json`
   Action: implement the parent contract families above with strict bounded runtime guards where public JSON is accepted; additive preview/opportunity DTOs must not replace or narrow the parent interfaces.
   Verify: focused type/runtime tests, invalid/prototype-key/oversize fixtures and corpus integrity check.
   Done: all generic contract tests pass without importing runtime catalogue data.

3. Export the new contract family.
   Files: `src/scheduler/index.ts`, `src/index.ts`, package export/typecheck fixtures
   Action: expose root and scheduler entry points for API/cloud-engine/UI.
   Verify: ESM, CommonJS and declaration consumer fixtures compile on Node 24.
   Done: all three consumers resolve identical types and validators.

4. Remove every legacy scheduler contract.
   Files: `src/scheduler/scheduler.ts`, `src/scheduler/bastionSchedule*.ts`, `scripts/check-bastion-schedule-contracts.mjs`, package scripts and generated build output
   Action: delete VM/Bastion resource branches, the old base-scheduler target/schedule-type DTOs, batch message and resource-prefixed tick; add the strict union without aliases or compatibility fields.
   Verify: forbidden-literal scan over source/build/package tarball and negative fixtures for old DTO/event names.
   Done: only the approved definition union, generic tick and occurrence envelopes remain in published artifacts.

5. Verify downstream compilation.
   Files: package/consumer smoke fixtures
   Action: pack locally and compile the coordinated API/cloud-engine/UI branches against the tarball or local source mapping.
   Verify: package full gate plus three consumer checks.
   Done: the breaking contract is proved as one coordinated release input, not published independently.

6. Add the asynchronous command/operation contract.
   Files: scheduler contract/validation modules and focused runtime/type tests.
   Action: define strict queue commands, accepted response and operation projections for schedule mutations, explicit readiness refresh, preview and catalogue bootstrap.
   Verify: exact-key validation, command/result pairing, size bounds and local API/cloud-engine/UI compilation.
   Done: local package build and focused contract checks pass; coordinated publication remains a release step.

7. Add the durable dry-run evaluation contract.
   Files: scheduler contracts, validation, exports, compile fixtures and focused runtime tests.
   Action: define the strict evaluation state machine around the existing final verdict, with exact field combinations, bounded errors/timestamps and no legacy pending wrapper.
   Verify: fail-first tests for every valid state plus mismatched identity, illegal result/error fields, malformed timestamps, duplicate/unknown fields and DTO-size limits; compile API/cloud-engine/UI against the same local output.
   Done: consumers can distinguish queued/running/retrying/ready/blocked/failed without inferring state from `404` or schedule mode.

## Test Strategy

- Type tests: discriminants, required fields, forbidden authoring authority and exhaustive unions.
- Runtime guards: malformed, prototype-key, oversized and unknown-field payloads.
- Dry-run lifecycle: exact state/field combinations, revision/generation identity, attempt/timestamp bounds and nested verdict validity.
- Property/corpus: displayed period/transition-rule normalization and boundary expectations using weekday `0..6`.
- Package: CommonJS, ESM, declaration and packed-export checks.
- Cross-repo: local package consumed by API/cloud-engine/UI.
- Coverage target: 80% for changed runtime validators; compile-only types use explicit positive/negative fixtures.

## Definition of Done

- [x] Generic contracts and validators pass.
- [x] Old VM/Bastion resource scheduling exports are absent.
- [x] Old base-scheduler DTOs, batch message and resource-prefixed tick exports are absent.
- [x] The recommendation-action definition accepts only the current UI behavior and derives runtime authority server-side.
- [x] Preview/opportunity contracts are provably non-executable.
- [x] Money is fully qualified and missing differs from zero.
- [x] Weekly fixture corpus is consumed by UI and cloud-engine tests.
- [x] Packed ESM/CommonJS/declaration outputs pass.
- [x] API/cloud-engine/UI compile against the same local package artifact.
- [x] Durable dry-run evaluation contract and validator are implemented and consumed by API/cloud-engine/UI.
- [ ] Security/performance/modularity review is complete.
- [ ] Integration validation is recorded in the parent verification matrix.
- [ ] Swagger is N/A; API owns generation.
- [ ] Demo and MCP are N/A for this package.

## Risks and Mitigations

- Risk: generic types become an arbitrary workflow DSL. Mitigation: retain the bounded parent `resource-strategy-weekly` definition and never expose provider operations.
- Risk: shared contracts leak Azure concepts. Mitigation: generic readiness categories and opaque provider reason/operation data.
- Risk: removing Bastion breaks consumers unexpectedly. Mitigation: coordinated compile/artifact scan; no independent package publication.
- Risk: types imply preview authority. Mitigation: separate names/shapes and forbidden schedule/action fields.

## Plan Iteration Notes

- Iteration 1 (2026-09-15): drafted a new `resource-strategy` plus trigger-union contract.
- Iteration 2 (2026-09-15): restored the parent specification's original `resource-strategy-weekly`, capability, readiness, execution and transition interfaces as the normative baseline; retained only additive bounded preview, fixture and permission-consent contracts.
- Iteration 3 (2026-09-16): retained the resource weekly interface while adding the unified definition/projection union and bounded recommendation-action member; replaced both old scheduler transports plus `ResourceSchedulerTickRequestMessageV1` with one generic tick/occurrence boundary.
- Iteration 4 (2026-09-17): added the asynchronous scheduler control command, accepted response and typed operation projection while keeping runtime behavior outside the package.
- Iteration 5 (2026-09-18): separated dry-run evaluation progress from schedule mode and command operations. Added a strict queued/running/retrying/terminal projection around the existing final verdict, with no compatibility wrapper, fake percentage or provider-specific stage.
- Iteration 6 (2026-09-18): removed Action Lab evidence from the public capability and dry-run contracts. Action Lab remains engineering-only release, CI and audit proof; customer runtime authority comes from published capability policy plus tenant-specific Azure readiness and transition preflight.
- Iteration 7 (2026-09-19): added the provider-neutral `restore-and-delete` lifecycle command and allowed-command projection value for protected restore, verification and schedule deletion.

## Runtime Environment

- Start: N/A; this is a compile-time package.
- Required environment variables: none.
- Emulator/fixtures: no emulator; use the portable weekly JSON corpus and package consumer fixtures.
- Node: `nvm use 24`.
- Focused verification: `npm run typecheck:contracts` and the new focused scheduler check.
- Canonical gate: `npm test`.
- Additional: `npm run lint`, `npm run build`, `npm pack --dry-run`.

## References

- `core/specs/scheduler/azure-resource-strategy-scheduling/azure-resource-strategy-scheduling.md`
- `types-package/src/scheduler/scheduler.ts`
- `types-package/src/scheduler/index.ts`
- `types-package/.agents/skills/types-package-architecture/SKILL.md`
