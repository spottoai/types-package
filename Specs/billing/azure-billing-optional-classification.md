# Optional Azure billing classification contract

Status: implemented; registry version 1.1.12 verified and adopted by engine. Last updated: 2026-10-06. User authorized implementation.
Parent: [core plan](../../../core/specs/billing/azure-billing-optional-classification.md).

Files: `src/azure/prices.ts`, contract tests. Add optional provider strings `pricingModel` and `chargeType` to `ResourceSpend`; absence means unavailable evidence. These are not eligibility flags. Keep existing exports, prices, currency and discount contracts unchanged.

Verify: package build/typecheck accepts old rows and arbitrary provider strings; engine compiles against built local declarations. No publishing or version changes in this task. Existing API/UI readers remain compatible; discount exclusion is deferred.

Verification: `npm run build` and `npm run typecheck:contracts` passed, including the new historical/provider-string fixture. Engine build and 11,927 unit tests passed against the built local declarations. Publication is deferred; consumer manifests were not repinned to a local package.

Follow-up: user supplied registry package 1.1.12. Installed declarations include `pricingModel` and `chargeType`; the engine root/workspace now pin 1.1.12 and normal engine typecheck passes without local declaration overrides. Publication was not performed by this agent. No unit tests were rerun during adoption.
