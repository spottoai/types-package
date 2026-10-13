# Microsoft 365 license capability insights: Shared contracts

Status: implemented; published SDK 1.1.24 adopted in UI, API and cloud-engine
Last updated: 2026-10-09
Owner: Product and Platform
Approval: Jay authorised Phase 1 implementation on 8 October 2026; publication/deployment and live changes remain separate.
Parent spec: [Capability insights](../../../core/specs/licensing/microsoft-365-license-capability-insights/microsoft-365-license-capability-insights.md)

## Scope and contract

Implement the parent's frozen Phase 1 contract. Existing snapshots remain readable; uncollected or ambiguous evidence stays unknown. No new Graph baseline permission, automatic license action or contract-specific savings claim is introduced. Company/cloud-account authorization and tenant separation stay enforced.

## Task

**Files:** src/accounts/microsoft365Capabilities.ts; microsoft365Licenses.ts; root exports; contract scripts.

**Action:** Additive product/account/tenant capabilities with bounds, exclusive assignment states, scoped notices and legacy-compatible validators.

**Verify:** CJS/ESM capability contract checks; pricing compatibility; build and packed exports.

**Done:** The changed reader/producer boundary has fresh passing evidence or a concrete recorded gap; no readiness, release or live-validation claim is inferred from file existence.

## Verification

9 October review repair: `withMicrosoft365AccountPricing` accepts optional
existing license metadata and withholds account prices/paid membership for mixed
trial allocation or producer-withheld assigned quantities. Other confirmed paid
products may still supply a partial account estimate. No DTO fields or schema
versions change. CJS/ESM regressions verify current and older helper callers.
This helper change needs a new registry release and consumer adoption before
delivery; local candidate verification is recorded in the parent evidence.

CJS/ESM builds, contract typecheck, capability validator and pricing compatibility checks pass. Review adds strict scalar enum validation and counterexamples for array-valued state/source/confidence/kind, negative constituent prices, unsafe source URLs and invalid dates. Expanded CJS/ESM checks pass against installed registry version 1.1.24 in UI, API and cloud-engine after Jay's dependency update. This follow-up does not overwrite the registry installation with a local candidate. Initial full package-gate and fresh consumer evidence are recorded in [implementation evidence](../../../core/specs/licensing/microsoft-365-license-capability-insights/implementation-evidence.md).
