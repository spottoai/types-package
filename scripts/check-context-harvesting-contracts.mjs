import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let archive = process.argv[2];
const fixtureRoot = await mkdtemp(join(tmpdir(), 'spotto-harvesting-contracts-'));
const consumerPackage = join(fixtureRoot, 'node_modules', '@spottoai', 'types-package');
const run = (command, args, cwd = fixtureRoot) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};
try {
  if (!archive) {
    const npmCli = process.env.npm_execpath ?? join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    const [packed] = JSON.parse(run(process.execPath, [npmCli, 'pack', '--ignore-scripts', '--json', '--pack-destination', fixtureRoot], packageRoot));
    assert.ok(packed?.filename, 'npm pack must produce a contract artifact');
    archive = join(fixtureRoot, packed.filename);
  }
  await mkdir(consumerPackage, { recursive: true });
  run('tar', ['-xzf', resolve(archive), '-C', consumerPackage, '--strip-components=1']);
  await copyFile(join(packageRoot, 'tests', 'fixtures', 'context-harvesting.consumer.ts.fixture'), join(fixtureRoot, 'consumer.ts'));
  run(process.execPath, [
    join(packageRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2020', '--module', 'commonjs', '--moduleResolution', 'node', 'consumer.ts',
  ]);
  const require = createRequire(join(fixtureRoot, 'consumer.cjs'));
  const cjs = require('@spottoai/types-package');
  const manifest = JSON.parse(await readFile(join(consumerPackage, 'package.json'), 'utf8'));
  const esm = await import(pathToFileURL(join(consumerPackage, manifest.exports['.'].import)));
  assert.equal(cjs.COMPANY_CONTEXT_HARVEST_SCHEMA_VERSION, 1);
  assert.equal(esm.COMPANY_CONTEXT_HARVEST_SCHEMA_VERSION, 1);
  console.log('Packed harvesting contracts verified: declaration isolation, exact review, note answer values, unresolved identities and CommonJS/ESM exports.');
} finally {
  const expectedPrefix = join(tmpdir(), 'spotto-harvesting-contracts-');
  if (!fixtureRoot.startsWith(expectedPrefix)) throw new Error('Refusing cleanup outside the contract fixture directory.');
  await rm(fixtureRoot, { recursive: true, force: true });
}
