# DEV-1163 RI Recommendation Aggregation — Types Package

## Metadata

Status: approved
Approved: Yes
Iterations: 1
Last updated: 2026-08-25
Repo: types-package
Domain: recommendations
Parent spec: `core/specs/recommendations/dev-1163-ri-recommendation-aggregation/dev-1163-ri-recommendation-aggregation.md`

## Scope and Success Criteria

Add an optional, additive `ReservedInstanceRecommendationRenderData` contract to the existing recommendation render-data union. It must carry no money, require explicit provider scope and identity arrays, and leave all existing recommendations source-compatible.

## Approach

- Define the RI compatibility group and aggregate render-data interfaces in `src/azure/recommendations.ts`.
- Add the type to `RecommendationKnownRenderData`.
- Use narrow literals for the render-data kind and family ID.
- Verify declaration output with the package build.

## Test Strategy and DoD

- TypeScript build proves the export and union are consumable.
- Cloud-engine and UI producer-consumer tests provide runtime contract evidence.
- No runtime validator or API endpoint is added.
- `npm run build` passes and regenerates the expected declarations. (`build:check` is intentionally main-branch-only and is not a feature-branch gate.)
