import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const esmRoot = join(packageRoot, 'dist', 'esm');

const exists = async (path) => access(path).then(() => true, () => false);

const listJavaScriptFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listJavaScriptFiles(path) : Promise.resolve(entry.name.endsWith('.js') ? [path] : []);
    })
  );
  return files.flat();
};

const resolveRelativeSpecifier = async (file, specifier) => {
  if (extname(specifier)) return specifier;
  const target = resolve(dirname(file), specifier);
  if (await exists(`${target}.js`)) return `${specifier}.js`;
  if (await exists(join(target, 'index.js'))) return `${specifier}/index.js`;
  throw new Error(`Cannot resolve ESM specifier ${specifier} from ${relative(packageRoot, file)}.`);
};

const rewriteRelativeSpecifiers = async (file) => {
  const source = await readFile(file, 'utf8');
  const pattern = /((?:from\s+|import\s*\(\s*|import\s+)["'])(\.\.?\/[^"']+)(["'])/g;
  const matches = [...source.matchAll(pattern)];
  let output = source;
  for (const match of matches.reverse()) {
    const specifier = await resolveRelativeSpecifier(file, match[2]);
    const replacement = `${match[1]}${specifier}${match[3]}`;
    output = `${output.slice(0, match.index)}${replacement}${output.slice(match.index + match[0].length)}`;
  }
  await writeFile(file, output);
};

await Promise.all((await listJavaScriptFiles(esmRoot)).map(rewriteRelativeSpecifiers));
await writeFile(join(esmRoot, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);

const entryRoot = join(esmRoot, 'entries');
await mkdir(entryRoot, { recursive: true });
const entries = {
  root: '../index.js',
  aws: '../aws/index.js',
  relationships: '../aws/portalRelationshipPublicArtifactValidation.js',
  'commitments-planning': '../aws/commitmentsPlanningValidation.js',
  recommendations: '../azure/recommendations.js',
  provider: '../common/provider.js',
};
await Promise.all(
  Object.entries(entries).map(([name, target]) =>
    writeFile(join(entryRoot, `${name}.js`), `export * from '${target}';\nimport * as namespace from '${target}';\nexport default namespace;\n`)
  )
);
