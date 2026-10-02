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

- Published privately to GitHub Packages (`publishConfig.registry` in
  `package.json`); it is no longer published to registry.npmjs.org.
- `npm run prepublishOnly` runs clean + build before publish.
- Releases are stable semver (1.1.0 onward) with the `latest` distribution tag;
  prerelease `-beta.N` versions are no longer published.
- For a supervised manual recovery, authenticate with a token that has
  `write:packages` (`export NODE_AUTH_TOKEN=...`) and run `npm publish --tag latest`.

## Release workflow

Follow the standard process in `../core/DEPLOYMENT.md` unless a repo-specific exception is documented above.

The release workflow and packed-consumer gate run on Node 24. The package
retains CommonJS output for existing consumers while verifying both the root
and `/aws` entry points from a Node 24 ESM consumer.
