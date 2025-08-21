# Types Package

A shared TypeScript interfaces package for private repositories. This package contains common interfaces that can be reused across your API, frontend, and backend projects.
**⚠️ RESTRICTED USE - INTERNAL SPOTTO AI ONLY ⚠️**

This is a proprietary TypeScript interfaces package for internal use by Spotto AI (www.spotto.ai) only. This package contains common interfaces that can be reused across Spotto AI's API, frontend, and backend projects.

**IMPORTANT**: This repository is made public solely for internal sharing between Spotto AI projects. External use, distribution, or modification is strictly prohibited. See LICENSE file for full terms.

## Features

- **Shared Interfaces**: Common TypeScript interfaces for API requests/responses, database models, frontend components, and backend services
- **Git Dependencies**: Designed to work with Git dependencies for private repositories
- **TypeScript Declaration Files**: Built with declaration files for better IDE support
- **Modular Structure**: Organized by domain (API, Database, Frontend, Backend)

## Installation

Since this is a private repository, you'll need to use Git dependencies instead of npm. Add this to your consuming project's `package.json`:
Since this is an internal Spotto AI package, you'll need to use Git dependencies. Add this to your consuming project's `package.json`:

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
import * as Types from '@spotto/types-package';

// Import specific interfaces
import { User } from '@spotto/types-package';
```
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

This package follows semantic versioning. When making changes:

1. Update the version in `package.json`
2. Create a Git tag for the new version
3. Push the tag to the repository

## Contributing

1. Create a feature branch
2. Add your new interfaces or modifications
3. Update the main index file if needed
4. Build and test the package
5. Submit a pull request

## License

MIT License - see LICENSE file for details
**PROPRIETARY LICENSE** - This software is proprietary to Spotto AI and is made available publicly solely for internal use. External use, distribution, or modification is strictly prohibited. See LICENSE file for full terms and restrictions.

For licensing inquiries, contact: legal@spotto.ai