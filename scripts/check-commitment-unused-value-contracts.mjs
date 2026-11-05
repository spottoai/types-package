import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = await mkdtemp(join(tmpdir(), 'spotto-unused-value-contracts-'));
let archive = process.argv[2];
const run = (command, args, cwd = fixtureRoot) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};
const installed = join(fixtureRoot, 'node_modules', '@spottoai', 'types-package');
if (!archive) {
  const npmCli = process.env.npm_execpath ?? join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  const [packed] = JSON.parse(run(process.execPath, [npmCli, 'pack', '--ignore-scripts', '--json', '--pack-destination', fixtureRoot], packageRoot));
  archive = join(fixtureRoot, packed.filename);
}
await mkdir(installed, { recursive: true });
run('tar', ['-xzf', resolve(archive), '-C', installed, '--strip-components=1']);
const manifest = JSON.parse(await readFile(join(installed, 'package.json'), 'utf8'));
assert.ok(!manifest.dependencies || Object.keys(manifest.dependencies).length === 0);
for (const mode of ['commonjs', 'nodenext']) {
  const name = mode === 'commonjs' ? 'consumer.ts' : 'consumer.mts';
  await copyFile(join(packageRoot, 'tests', 'fixtures', 'commitment-unused-value.consumer.ts.fixture'), join(fixtureRoot, name));
  run(process.execPath, [
    join(packageRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--strict',
    '--skipLibCheck',
    '--target',
    'ES2020',
    '--module',
    mode,
    '--moduleResolution',
    mode === 'commonjs' ? 'node' : 'nodenext',
    name,
  ]);
  run(process.execPath, [mode === 'commonjs' ? 'consumer.js' : 'consumer.mjs']);
}
const cjs = createRequire(join(fixtureRoot, 'probe.cjs'));
for (const subpath of ['.', './azure/recommendations']) {
  const entry = manifest.exports[subpath];
  await readFile(join(installed, entry.types));
  cjs(subpath === '.' ? manifest.name : manifest.name + subpath.slice(1));
  await import(pathToFileURL(join(installed, entry.import)));
}
assert.match(await readFile(join(installed, 'dist/azure/recommendations.d.ts'), 'utf8'), /unusedCommitmentValue/);
assert.match(await readFile(join(installed, 'dist/azure/commitmentsPlanning.d.ts'), 'utf8'), /unusedCommitmentValue/);
console.log(run(process.execPath, [join(packageRoot, 'scripts', 'check-commitment-unused-value-runtime.mjs'), installed], packageRoot).trim());
console.log(run(process.execPath, [join(packageRoot, 'scripts', 'check-report-assessment-bindings.mjs'), installed], packageRoot).trim());
console.log(
  `Packed unused-value contracts verified: CJS/ESM, Node/NodeNext, root/subpath, available/unavailable, basis pairing. Retained fixture: ${fixtureRoot}`
);
// The commitments contract gate shares one exact archive across financial evidence and current assessment authority.
console.log(
  run(
    process.execPath,
    [join(packageRoot, 'scripts', 'check-packed-benefit-assessment-admission-contracts.mjs'), resolve(archive)],
    packageRoot
  ).trim()
);
