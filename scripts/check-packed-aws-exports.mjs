import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath = join(packageRoot, 'tests', 'fixtures', 'aws-public-root.consumer.ts.fixture');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeModulesBin = join(packageRoot, 'node_modules', '.bin');
const tscCommand = join(nodeModulesBin, process.platform === 'win32' ? 'tsc.cmd' : 'tsc');

const run = (command, args, cwd, captureOutput = false) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: captureOutput ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}.`);
  }

  return result.stdout ?? '';
};

const tempRoot = await mkdtemp(join(tmpdir(), 'spotto-types-package-'));

try {
  const packOutput = run(npmCommand, ['pack', '--ignore-scripts', '--json', '--pack-destination', tempRoot], packageRoot, true);
  const [packedArtifact] = JSON.parse(packOutput);
  if (!packedArtifact?.filename) {
    throw new Error('npm pack did not return an artifact filename.');
  }

  const consumerRoot = join(tempRoot, 'consumer');
  await mkdir(consumerRoot, { recursive: true });
  await writeFile(join(consumerRoot, 'package.json'), JSON.stringify({ private: true }, null, 2));
  await copyFile(fixturePath, join(consumerRoot, 'aws-public-root.consumer.ts'));

  run(
    npmCommand,
    ['install', '--ignore-scripts', '--no-save', '--package-lock=false', '--legacy-peer-deps', join(tempRoot, packedArtifact.filename)],
    consumerRoot
  );
  run(
    tscCommand,
    [
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2020',
      '--module',
      'commonjs',
      '--moduleResolution',
      'node',
      'aws-public-root.consumer.ts',
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '-e',
      "const pkg = require('@spottoai/types-package'); if (pkg.AWS_REQUEST_PROVIDER !== 'aws' || pkg.AWS_REQUEST_SCHEMA_VERSION !== 1 || !Array.isArray(pkg.AWS_REQUEST_ACTIONS) || !Array.isArray(pkg.AWS_REQUEST_FORBIDDEN_CREDENTIAL_FIELDS)) process.exit(1);",
    ],
    consumerRoot
  );

  process.stdout.write('Packed AWS and existing Azure compatibility exports verified.\n');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
