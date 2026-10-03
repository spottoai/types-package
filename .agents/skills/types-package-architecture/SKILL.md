---
name: types-package-architecture
description: Architecture of the shared Spotto TypeScript types package that defines the contracts and DTOs consumed by api, ui, and worker repos. Use when adding or changing shared types, build outputs, or package publishing, or when a contract change must be coordinated across repos.
---

Status: living
Last updated: 2026-10-04
Owner: TBD
Related docs: README.md, DEPLOYMENT.md

# types-package-architecture

## Purpose
Defines the architecture of the shared TypeScript interfaces package used across Spotto services and apps.

## Scope
- Covers type organization, build outputs, and package publishing for this repo.
- Contracts plus small dependency-free pure helpers (validators, path builders and shared merge rules) tested against `dist`.

## System context
- Upstream: API, UI, and worker repos consuming shared contracts.
- Downstream: NPM/Git dependency consumers in Spotto projects.
- Primary responsibility: stable type contracts and shared DTOs.

## Key components
- `src/` - Type definitions and pure contract helpers organized by domain.
- `src/azure/regulatoryComplianceScoreboard*.ts` - Scoreboard contracts, evidence classification, merge/trend helpers and validation shared by collection, API, UI and reports.
- `scripts/` - Build and validation helpers.

## Data flow (happy path)
1. Types are authored and exported from `src/`.
2. Build produces declarations plus CommonJS and ESM runtime outputs for consumers.
3. Downstream repos import types and pure helpers through package exports. Packed consumer checks verify both module formats.

## Runtime & deployment notes
- Build and publish steps are defined in `README.md` and `DEPLOYMENT.md`.

## Integration boundaries & invariants
- Breaking changes require coordination with all consuming repos.
- Keep index exports stable and versioned appropriately.
