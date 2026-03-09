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
- `src/ai/`, `src/common/`, `src/identity/`, `src/feedbacks/`, `src/unknown/` shared and specialized contracts.

## Specs and tooling
- `specs/` repo-local type specs and migration notes.
- `scripts/build-check.sh` build verification helper.
- `scripts/release.sh` release automation helper.
- `dist/` generated package output.

## Supporting configuration
- `package.json` scripts and published package metadata.
- `eslint.config.js`, `.prettierrc`, and `tsconfig.json` quality/tooling config.
