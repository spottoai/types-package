Status: living
Last updated: 2026-03-05
Owner: Platform

# types-package Repo Layout

This repo follows the cross-repo documentation layout in `../core/REPO_LAYOUT.md`.
Folder `README.md` files are authoritative for local implementation details.

## Top-level entrypoints

- `AGENTS.md` for repo orientation and related standards.
- `README.md` for package purpose, usage, and development flow.
- `DEPLOYMENT.md` for release/tagging workflow.
- `REPO_LAYOUT.md` for file/folder responsibilities.
- `.agents/skills/types-package-architecture/SKILL.md` for package architecture guidance.

## Source layout

- `src/index.ts` package export surface.
- `src/accounts/`, `src/company/`, `src/users/` domain DTOs.
- `src/azure/`, `src/tags/`, `src/events/` platform contract types.
- `src/aws/` AWS public request and artifact contracts, also published through
  `@spottoai/types-package/aws`: the secret-free AWS estates desired-state
  manifest, estate/account/billing-source orchestration commands, the global
  scheduled-refresh tick that carries only its cadence kind and exact scheduler
  timestamp, company trust setup shapes, the account and organization
  commitments contracts and
  validators, the lifecycle artifact, and the AWS binding of the resource graph
  (`resourceGraph.ts`, AWS account/Region/ARN/Availability Zone format rules).
  AWS Portal resource/account/history/AI and plugin artifact contracts are
  owned by `cloud-engine-aws`. Engine persistence and saga types are
  intentionally excluded.
- `src/common/` provider-neutral contracts, including the resource graph
  (`resourceGraph.ts`, `resourceGraphValidation.ts`) and its open identity
  vocabulary (`resourceIdentity.ts`). Adding a provider service never requires
  a change here.
- `src/ai/`, `src/common/`, `src/identity/`, `src/feedbacks/`, `src/unknown/` shared and specialized contracts.

## Specs and tooling

- `specs/` repo-local type specs and migration notes.
- `scripts/build-check.sh` build verification helper.
- `scripts/check-resource-graph-contracts.mjs` executes generic and AWS
  resource graph round-trip and rejection checks against built package output.
- `scripts/release.sh` release automation helper.
- `dist/` generated package output.

## Supporting configuration

- `package.json` scripts and published package metadata.
- `eslint.config.js`, `.prettierrc`, and `tsconfig.json` quality/tooling config.
