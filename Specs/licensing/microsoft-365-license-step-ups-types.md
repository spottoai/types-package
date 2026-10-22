# Microsoft 365 step-up comparisons: Shared contracts

Status: implemented locally, not yet published
Last updated: 2026-10-21
Owner: Product and Platform
Approval: Jay asked on 21 October 2026 for every types-package change for the step-up work (all phases) in one change; publication and consumer adoption remain separate.
Parent spec: [Step-up comparisons](../../../core/specs/licensing/microsoft-365-license-step-ups/microsoft-365-license-step-ups.md)

## Scope and contract

**Files:** src/accounts/microsoft365Capabilities.ts; src/accounts/microsoft365LicensePortal.ts; scripts/check-microsoft365-license-contracts.mjs.

- `Microsoft365CapabilityProjection.stepUps?: Microsoft365StepUpComparison[]` (at most 16, unique `id`). `Microsoft365LicenseSummaryCapabilities` inherits it. Old snapshots omit it.
- `Microsoft365StepUpComparison`, `Microsoft365StepUpMoney`, `Microsoft365StepUpReplacedProduct`, `Microsoft365StepUpCapabilityGain` and `Microsoft365StepUpPriceBasis`, with `isMicrosoft365StepUpComparison` and `isMicrosoft365StepUpMoney` guards.
- 1.1.58 adds optional `segments` (account groups): `Microsoft365StepUpSegment` (`replacedSkuIds`, `accountCount`, `inactiveAccountCount`, `monthlyByCurrency`) and `Microsoft365StepUpSegmentMoney` (`priceBasis?`, `currentPerAccount`, `targetPerAccount`, `differencePerAccount`, `differenceTotal`) with `isMicrosoft365StepUpSegmentMoney`. Groups are aggregate: no account identifiers.
- Later phases need no further contract change: `replacedProducts[].unitPriceMonthlyByCurrency` gives the UI each product's monthly value, and the optional `monthlyByCurrency[].priceBasis` (`list` when absent, `agreed` or `mixed`) lets the API pricing decorator mark re-valued money in the same shape.

**Rules:** `id` is `${fromSkuId}:${toSkuId}` and the two differ. Inactive accounts never exceed `accountCount`. Each gain is for an added capability, and gaining plus already-enabled equals `accountCount`. Replaced products are unique, never the source or target, held by 1 to `accountCount` accounts, `basis` `rule` or `service_plans`, with non-negative or null unit prices. Money rows: non-negative or null unit prices, and the per-account difference, gross and net are known or unknown together. At most 16 ISO currency codes. Added and lost capability IDs must be defined. The summary is an exact-key aggregate boundary: no account identifiers anywhere in a step-up. The source product and every replaced product must be in the summary's licenses; the target may come from the publisher catalogue. Segments: at most 32; `replacedSkuIds` sorted, unique and a subset of the replaced products, with unique keys; `accountCount` positive, inactive not above it, and all groups together not above the comparison's `accountCount`; exact segment and money keys; the difference is null exactly when either price is null, and the total exactly when the difference is.

## Verification

21 October 2026: CJS and ESM builds and `typecheck:contracts` pass. `node --test scripts/check-microsoft365-license-contracts.mjs`: 38 pass, including a step-up test per format covering the valid shape, legacy summaries without step-ups, agreed-price basis and 20 rejected mutations (privacy, arithmetic, identity, holdings, bounds and enums). The capability and pricing-override contract checks pass. The full `npm test` gate was not run.

22 October 2026 (1.1.58): 38 pass, adding a valid segments fixture and 11 rejected segment mutations (unsorted, duplicate or unknown skuIds, zero or excess counts, inactive above count, inconsistent nulls, extra keys and more than 32 groups).

## Consumers

1. Publish the release.
2. API, UI and reportworker adopt it and render step-ups when present.
3. cloud-engine adopts it, removes its engine-local `Microsoft365StepUpTypes.ts` and replaces the summary acceptance check in `buildMicrosoft365LicenseArtifacts` with a direct assignment. Done: all three consumers are on 1.1.58.
