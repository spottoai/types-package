# types-package AGENTS.md

## Overview

Shared TypeScript interfaces package used across Spotto services and apps.

## Shared code contribution

Check [Shared Platform Packages](../core/specs/platform/shared-platform-packages/shared-platform-packages.md)
before adding helpers. Keep shared contracts and existing dependency-free contract
validators here; reusable implementation belongs in portable platform subpaths.
Types-package depends on neither platform nor platform-node. Do not add I/O/SDK
dependencies or copy an exported implementation into contracts. Review financial
semantics and affected consumers when a pure helper crosses the contract boundary.

## How to read this repo

- Start with this `AGENTS.md`.
- Many folders include a `README.md` with local instructions; treat those as authoritative.
- Skills live in `.agents/skills/types-package-architecture/SKILL.md`.

## Key docs

- `README.md`
- `REPO_LAYOUT.md`
- `.agents/skills/types-package-architecture/SKILL.md`
- `DEPLOYMENT.md`
- [Shared Platform Packages - Contract Boundary](specs/platform/shared-platform-packages-types-package.md) (draft)

## Key folders

- `src/` (type sources)
- `specs/` (repo-local type specs)
- `scripts/` (build checks)

## Architecture

- `.agents/skills/types-package-architecture/SKILL.md`

## Skills

- `.agents/skills/types-package-architecture/SKILL.md`

## Related core docs

- `../core/skills/coding-standards/SKILL.md`
- `../core/skills/spec-workflow/SKILL.md`
