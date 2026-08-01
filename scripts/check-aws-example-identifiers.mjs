import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const fixturePaths = ['src/aws/aws.contracts.spec.ts', 'src/aws/estates.contracts.spec.ts', 'tests/fixtures/aws-public-root.consumer.ts.fixture'];

// AWS documentation-style account identifiers permitted in public examples.
const allowedAccountIds = new Set(['111122223333', '444455556666', '123456789012', '999988887777']);

const failures = [];

for (const fixturePath of fixturePaths) {
  const source = await readFile(resolve(process.cwd(), fixturePath), 'utf8');

  for (const accountId of source.match(/(?<![A-Za-z0-9-])\d{12}(?![A-Za-z0-9-])/g) ?? []) {
    if (!allowedAccountIds.has(accountId)) {
      failures.push(`${fixturePath}: non-example AWS account ID ${accountId}`);
    }
  }

  for (const organizationId of source.match(/\bo-[a-z0-9-]{10,32}\b/giu) ?? []) {
    if (!organizationId.toLowerCase().startsWith('o-example') && !organizationId.toLowerCase().startsWith('o-unexpectedexample')) {
      failures.push(`${fixturePath}: non-example AWS organization ID ${organizationId}`);
    }
  }
}

if (failures.length > 0) {
  console.error('AWS public contract fixtures must use documentation-only identifiers.');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AWS public contract fixture identifiers are documentation-only.');
