# Types Package

A shared TypeScript interfaces package. This package contains common interfaces that can be reused across your API, frontend, and backend projects.

## Features

- **Shared Interfaces**: Common TypeScript interfaces for API requests/responses, database models, frontend components, and backend services
- **Git Dependencies**: Designed to work with Git dependencies
- **TypeScript Declaration Files**: Built with declaration files for better IDE support
- **Modular Structure**: Organized by domain (API, Database, Frontend, Backend)

## Installation

Add this to your consuming project's `package.json`:

```json
{
  "dependencies": {
    "@spotto/types-package": "git+https://github.com/spottoai/types-package.git#main"
  }
}
```

Or for a specific branch/tag:

```json
{
  "dependencies": {
    "@spotto/types-package": "git+https://github.com/spottoai/types-package.git#v1.0.0"
  }
}
```

## Usage

### Importing Interfaces

```typescript
// Import all interfaces
import * as Types from '@spottoai/types-package';

// Import specific interfaces
import { User } from '@spottoai/types-package';

// Import AWS-only public artifact contracts
import type {
  AwsPortalAccountSummaryArtifact,
  AwsPortalResourceCollectionArtifact,
} from '@spottoai/types-package/aws';
```

The root entry point also exports the provider-neutral artifact generation,
manifest, descriptor, and completed-pointer contracts. Storage paths and
runtime persistence records deliberately remain owned by the producing engine.

## Development

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Building

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean

# Code linting
npm run lint

# Code formatting
npm run format

# Build with checks
npm run build:check
```

### Adding New Interfaces

1. Create new interface files in the appropriate `src/` subdirectory
2. Export them from the corresponding index file
3. Update the main `src/index.ts` if needed
4. Build the package: `npm run build`

### Directory Structure

```
src/
├── example/
│   └── common.ts        # Common types
└── index.ts             # Main export file
```

## Versioning

This package follows semantic versioning with automated prereleases from `main`:

1. Do not manually bump `package.json` in a feature change.
2. Merge the validated change to `main`.
3. The `Prerelease and Publish` workflow runs lint/build checks, increments the prerelease version, publishes it to npm, and creates the matching Git tag.
4. Consumers must update their dependency and lockfile to the published version before removing any temporary compatibility declarations.

`prepublishOnly` performs a clean build and compiles a consumer against the packed artifact, preventing source-only exports from being published accidentally.

## Contributing

1. Create a feature branch
2. Add your new interfaces or modifications
3. Update the main index file if needed
4. Build and test the package
5. Submit a pull request

## License

MIT License - see LICENSE file for details
