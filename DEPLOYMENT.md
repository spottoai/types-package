Status: living
Last updated: 2026-02-15
Owner: Platform

# Development & Publishing

## Install

```bash
npm install
```

## Build

```bash
npm run build
npm run dev       # watch mode
npm run clean     # clean dist
```

## Quality checks

```bash
npm run lint
npm test
npm run lint:fix
npm run format
npm run format:check
npm run build:check
```

## Publish

- `npm run prepublishOnly` runs clean + build before publish.
- Prereleases use the explicit `beta` distribution tag. For a supervised manual
  recovery, run `npm publish --access public --tag beta`.

## Release workflow

Follow the standard process in `../core/DEPLOYMENT.md` unless a repo-specific exception is documented above.

The prerelease workflow and packed-consumer gate run on Node 24. The package
retains CommonJS output for existing consumers while verifying both the root
and `/aws` entry points from a Node 24 ESM consumer.
