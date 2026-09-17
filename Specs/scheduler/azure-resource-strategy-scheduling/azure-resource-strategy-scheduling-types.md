# Azure Resource Strategy Scheduling — Types Package

Status: approved
Approval required: Yes — breaking shared scheduler contract
Approved: Yes
Approver/evidence: User approval in the Codex session on 2026-09-15 to begin implementation
Iterations: 2
Last updated: 2026-09-15
Owner: Platform
Repo: types-package
Domain: scheduler
Parent spec: `core/specs/scheduler/azure-resource-strategy-scheduling/azure-resource-strategy-scheduling.md`
Spec location: `types-package/Specs/scheduler/azure-resource-strategy-scheduling/azure-resource-strategy-scheduling-types.md`

## Summary

Replace service-specific resource schedule DTOs with the parent specification's original provider-neutral `resource-strategy-weekly` contract family. This package describes public data and portable validation only. It contains no capability catalogue, provider operation mapping, Action ID, permission matrix, persistence record or runtime scheduler logic.

## Scope

In scope:

- The original `resource-strategy-weekly` write/projection interfaces.
- Weekly transition rules and a portable edge-case fixture corpus.
- Static capability projection, private readiness and lifecycle/status DTOs.
- Non-authoritative scheduling opportunities.
- Non-persisting draft preview request/response.
- Exact-scope permission manifest projection and confirmation references.
- Internal transition/run envelopes required between cloud-engine modules.
- Removal of VM- and Bastion-specific resource scheduler contracts.

Out of scope:

- Runtime catalogue/configuration content.
- Azure operations, Action/ActionPermission schemas or service-specific permission types.
- Storage entity and due-index shapes.
- UI view models/localization.
- Compatibility unions or validators for removed resource schedules.

## Success Criteria

- A second capability using `weekly-availability` compiles without a new public discriminator or resource-specific DTO.
- Public authoring cannot carry Action IDs, provider verbs/endpoints, permission arrays, baselines or internal transitions.
- `resource-strategy-weekly` is the only resource-scheduling definition discriminator in this delivery.
- Money-bearing preview/opportunity types require basis, provenance, period, currency evidence and additivity.
- VM/Bastion contracts and their package check scripts/exports are absent from the built package.

## Local Recon

- Entry points: `src/scheduler/scheduler.ts`, `src/scheduler/index.ts`, `src/index.ts`.
- Current VM contract: `definitionType = vm-runtime-weekly` and `targetType = resource-operation`.
- Current Bastion contract: `src/scheduler/bastionSchedule*.ts`, exported by the scheduler barrel and verified by `scripts/check-bastion-schedule-contracts.mjs`.
- Current package build emits CommonJS, ESM and declaration artifacts and runs consumer package checks.
- Remaining questions: none.

## Contract Families

### Capability and presentation

- `ResourceStrategy = on-off | dial | sku-change | recreate`.
- `ResourceSchedulingCapabilityRef` carries opaque `capabilityId` and immutable `capabilityVersion` exactly as defined by the parent interface.
- `ResourceSchedulingCapabilityProjection` retains the parent fields for content identity, provider/resource types, strategy, display metadata, configuration schema, recommendation/lifecycle/execution policy, baseline, cost, cadence, disruption, restore, automation, dependencies, acknowledgement and evidence.
- The projection remains tenant-independent and excludes Action IDs, provider requests, permission internals and per-company readiness.

### Generic weekly schedule

- `definitionType = resource-strategy-weekly`.
- `ResourceStrategyWeeklyScheduleWriteRequest` retains `providerScopeId`, required `cloudAccountId`, exact `resourceId`, capability ref, name, IANA timezone, default parameters, weekly rules, busy policy, blackout dates, active range, initial mode, notification policy, acknowledgements and notes.
- Each rule retains stable `ruleId`, `transition = reduce | restore`, Sunday-through-Saturday `daysOfWeek = 0..6`, `desiredStateAtLocal` and optional parameter overrides.
- `ResourceStrategyWeeklyScheduleProjection` retains schedule/revision/control/ETag/status/audit fields and permission-manifest reference from the parent interface.
- Clients cannot add Action IDs, endpoints, provider API versions, permission arrays, baselines or compiled due rows.

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
- Raw provider errors and baseline values remain excluded.

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

| Current contract                                        | Replacement/removal                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `vm-runtime-weekly` definition/configuration            | Parent-defined `resource-strategy-weekly` contract and weekly transition rules |
| `bastion-availability-weekly` and `bastionSchedule*.ts` | Removed; Bastion appears only as recommendation-only capability projection     |
| client `resource-operation`/operation/Action selection  | Opaque capability reference                                                    |
| service-specific readiness DTOs                         | Generic readiness                                                              |
| Bastion validation/check script                         | Generic contract and forbidden-field checks                                    |

No old definition, validator, export or package artifact remains after the coordinated cutover.

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

4. Remove service-specific resource schedule contracts.
   Files: `src/scheduler/scheduler.ts`, `src/scheduler/bastionSchedule*.ts`, `scripts/check-bastion-schedule-contracts.mjs`, package scripts and generated build output
   Action: delete VM/Bastion resource-schedule branches and client resource-operation authoring while preserving unrelated scheduler families.
   Verify: forbidden-literal scan over source/build/package tarball and negative fixtures.
   Done: old resource-schedule contract families are absent from published artifacts.

5. Verify downstream compilation.
   Files: package/consumer smoke fixtures
   Action: pack locally and compile the coordinated API/cloud-engine/UI branches against the tarball or local source mapping.
   Verify: package full gate plus three consumer checks.
   Done: the breaking contract is proved as one coordinated release input, not published independently.

## Test Strategy

- Type tests: discriminants, required fields, forbidden authoring authority and exhaustive unions.
- Runtime guards: malformed, prototype-key, oversized and unknown-field payloads.
- Property/corpus: displayed period/transition-rule normalization and boundary expectations using weekday `0..6`.
- Package: CommonJS, ESM, declaration and packed-export checks.
- Cross-repo: local package consumed by API/cloud-engine/UI.
- Coverage target: 80% for changed runtime validators; compile-only types use explicit positive/negative fixtures.

## Definition of Done

- [ ] Generic contracts and validators pass.
- [ ] Old VM/Bastion resource scheduling exports are absent.
- [ ] Preview/opportunity contracts are provably non-executable.
- [ ] Money is fully qualified and missing differs from zero.
- [ ] Weekly fixture corpus is consumed by UI and cloud-engine tests.
- [ ] Packed ESM/CommonJS/declaration outputs pass.
- [ ] API/cloud-engine/UI compile against the same local package artifact.
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
