---
name: types-package-architecture
description: Architecture for the shared Spotto TypeScript types package.
---

Status: living
Last updated: 2026-02-15
Owner: TBD
Related docs: README.md, DEPLOYMENT.md

# types-package-architecture

## Purpose
Defines the architecture of the shared TypeScript interfaces package used across Spotto services and apps.

## Scope
- Covers type organization, build outputs, and package publishing for this repo.
- Excludes runtime behavior; this repo is compile-time only.

## System context
- Upstream: API, UI, and worker repos consuming shared contracts.
- Downstream: NPM/Git dependency consumers in Spotto projects.
- Primary responsibility: stable type contracts and shared DTOs.

## Key components
- `src/` - Type definitions organized by domain.
- `scripts/` - Build and validation helpers.

## Data flow (happy path)
1. Types are authored and exported from `src/`.
2. Build produces declaration files for consumers.
3. Downstream repos import types for API/UI contracts.

## Runtime & deployment notes
- Build and publish steps are defined in `README.md` and `DEPLOYMENT.md`.

## Integration boundaries & invariants
- Breaking changes require coordination with all consuming repos.
- Keep index exports stable and versioned appropriately.
