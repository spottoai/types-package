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
npm run lint:fix
npm run format
npm run format:check
npm run build:check
```

## Publish
- `npm run prepublishOnly` runs clean + build before publish.

## Release workflow
Follow the standard process in `../core/DEPLOYMENT.md` unless a repo-specific exception is documented above.
