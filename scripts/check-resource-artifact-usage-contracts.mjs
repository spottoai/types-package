import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const contracts = require('../dist/common/resourceArtifactUsage.js');
const time = '2026-10-13T00:00:00.000Z';
const id = `artifact:${'a'.repeat(64)}`;
const binding = {
  schemaVersion: 1,
  companyId: 'company-1',
  provider: 'azure',
  accountId: 'sub-1',
  artifactGeneration: { runId: 'run-1', generatedAt: time },
};
const source = {
  sourceId: 'image-inventory',
  scope: { resourceIds: ['registry-1'] },
  status: 'available',
  observedAt: time,
  lastSuccessfulAt: time,
  supportedWorkloadClasses: [],
  collectedWorkloadClasses: [],
};
const summary = {
  id,
  artifactKind: 'container-image',
  name: 'app@sha256:abc',
  ownerResourceId: 'registry-1',
  region: 'australiaeast',
  attributes: { registryHost: 'example.azurecr.io', repository: 'App', digest: `sha256:${'b'.repeat(64)}` },
  aliases: [{ name: 'Release', observedAt: time }],
  usageCount: 1,
  usageCompleteness: 'complete',
  sourceCoverage: [source],
  security: { status: 'available', packageFindingCount: 1, cveCount: 1, severityCounts: { high: 1 }, observedAt: time },
};
const finding = {
  id: 'finding-1',
  providerFindingId: 'assessment-1',
  sourceId: 'vulnerability-findings',
  status: 'active',
  softwareName: 'openssl',
  detectedVersions: ['1'],
  fixedVersion: '2',
  cves: [{ id: 'CVE-2026-1', severity: 'high', fixStatus: 'available' }],
  observedAt: time,
};
const usage = {
  id: 'usage-1',
  sourceId: 'workload-config',
  resourceId: 'app-1',
  resourceName: 'app',
  reference: 'example.azurecr.io/App:Release',
  tag: 'Release',
  digest: `sha256:${'b'.repeat(64)}`,
  observedAt: time,
  resolvedAt: time,
  resolutionState: 'configured-tag-resolved',
  runtimeDigestObserved: false,
};
const prefix = contracts.resourceArtifactUsageRunPrefix(binding.artifactGeneration.runId);
const file = (role, path, extra = {}) => ({ role, path: `${prefix}/${path}`, byteLength: 100, sha256: 'c'.repeat(64), ...extra });
const manifest = {
  ...binding,
  baseRelationshipSnapshotId: 'base-1',
  sourceCoverage: [source],
  expiresAt: '2026-10-14T00:00:00.000Z',
  paging: { maxRows: 200, maxDecodedBytes: 2097152 },
  files: [
    file('graph', 'graph.json.gz'),
    file('index', 'index.json.gz'),
    file('summary', `details/${id}/summary.json.gz`, { artifactId: id }),
    file('findings', `details/${id}/findings/0.json.gz`, { artifactId: id, page: 0 }),
    file('usages', `details/${id}/usages/0.json.gz`, { artifactId: id, page: 0 }),
  ],
};
const index = { ...binding, baseRelationshipSnapshotId: 'base-1', artifacts: [summary], resourceArtifacts: { 'registry-1': [id], 'app-1': [id] } };
const page = { ...binding, artifactId: id, section: 'findings', page: 0, rows: [finding], count: 1, completeness: 'complete' };
const pointer = { ...binding, manifest: { path: `${prefix}/manifest.json`, byteLength: 100, sha256: 'd'.repeat(64) }, completedAt: time };
const valid = (name, value, expected) => assert.deepEqual(contracts[name](JSON.parse(JSON.stringify(value)), expected), [], name);
const invalid = (name, value, expected) => assert.ok(contracts[name](value, expected).length > 0, `${name} must reject ${JSON.stringify(value)}`);
valid('validateResourceArtifactSummary', summary);
valid('validateResourceArtifactFinding', finding);
valid('validateResourceArtifactUsageEvidence', usage);
valid('validateResourceArtifactUsageManifest', manifest, binding);
valid('validateResourceArtifactUsagePointer', pointer, binding);
valid('validateResourceArtifactUsageIndex', index, binding);
valid('validateResourceArtifactDetailPage', page, { ...binding, artifactId: id, section: 'findings', page: 0 });
for (const companyId of ['company-2']) invalid('validateResourceArtifactUsageManifest', { ...manifest, companyId }, binding);
for (const accountId of ['sub-2']) invalid('validateResourceArtifactUsageIndex', { ...index, accountId }, binding);
invalid('validateResourceArtifactDetailPage', { ...page, artifactGeneration: { ...binding.artifactGeneration, runId: 'other' } }, binding);
for (const path of [
  '../manifest.json',
  '/absolute',
  'https://user:pass@example.test/manifest.json',
  `${prefix}/../graph.json.gz`,
  `${prefix}/%2e%2e/graph.json.gz`,
  `${prefix}\\graph.json.gz`,
  `${prefix}/graph.json.gz?token=secret`,
  'runs/other/artifact-usage/graph.json.gz',
])
  invalid('validateResourceArtifactUsageManifest', { ...manifest, files: [{ ...manifest.files[0], path }, ...manifest.files.slice(1)] });
invalid('validateResourceArtifactSummary', { ...summary, security: { status: 'restricted', packageFindingCount: 0 } });
invalid('validateResourceArtifactSummary', { ...summary, security: { status: 'unavailable', cveCount: 0 } });
invalid('validateResourceArtifactSummary', { ...summary, id: id.toUpperCase() });
invalid('validateResourceArtifactSummary', { ...summary, usageCompleteness: 'unavailable', usageCount: 0 });
invalid('validateResourceArtifactUsageEvidence', { ...usage, runtimeDigestObserved: true });
invalid('validateResourceArtifactUsageEvidence', { ...usage, resolutionState: 'unresolved' });
invalid('validateResourceArtifactUsageEvidence', { ...usage, resolutionState: 'configured-tag-resolved', digest: undefined });
invalid('validateResourceArtifactUsageEvidence', { ...usage, resolutionState: 'configured-tag-resolved', resolvedAt: undefined });
invalid('validateResourceArtifactUsageIndex', { ...index, resourceArtifacts: { 'app-1': ['artifact:' + 'e'.repeat(64)] } });
invalid('validateResourceArtifactUsageManifest', { ...manifest, files: [...manifest.files, manifest.files[0]] });
invalid('validateResourceArtifactDetailPage', { ...page, rows: Array(201).fill(finding) });
invalid('validateResourceArtifactDetailPage', { ...page, rows: [{ ...finding, softwareName: 'x'.repeat(2097152) }] });
invalid('validateResourceArtifactDetailPage', page, { ...binding, artifactId: 'artifact:' + 'e'.repeat(64) });
invalid('validateResourceArtifactDetailPage', { ...page, nextPage: '../secrets' });
invalid('validateResourceArtifactDetailPage', { ...page, count: 0 });
invalid('validateResourceArtifactDetailPage', { ...page, completeness: 'restricted' });
invalid('validateResourceArtifactDetailPage', { ...page, rows: [summary], section: 'summary', completeness: 'restricted' });
valid('validateResourceArtifactUsageEvidence', { ...usage, resolutionState: 'configured-digest', tag: undefined, resolvedAt: undefined });
valid('validateResourceArtifactUsageEvidence', {
  ...usage,
  resolutionState: 'changed-during-collection',
  digest: undefined,
  resolvedAt: undefined,
  previousDigest: `sha256:${'b'.repeat(64)}`,
  currentDigest: `sha256:${'c'.repeat(64)}`,
});
valid('validateResourceArtifactSummary', {
  ...summary,
  artifactKind: 'new-provider-artifact',
  attributes: { opaqueProviderAttribute: 'ok' },
  usageCompleteness: 'partial',
  sourceCoverage: [{ ...source, status: 'partial', reason: 'limit-reached', lastSuccessfulAt: undefined }],
});
for (const name of [
  'validateResourceArtifactUsageManifest',
  'validateResourceArtifactUsagePointer',
  'validateResourceArtifactUsageIndex',
  'validateResourceArtifactSummary',
  'validateResourceArtifactFinding',
  'validateResourceArtifactUsageEvidence',
  'validateResourceArtifactDetailPage',
]) {
  for (const value of [null, [], 'bad', 1, Object.create({ schemaVersion: 1 })]) invalid(name, value);
}

// A tag alias can occur at multiple observation times without becoming identity.
valid('validateResourceArtifactSummary', { ...summary, aliases: [...summary.aliases, { name: 'Release', observedAt: '2026-10-13T00:01:00.000Z' }] });
// Multi-platform membership is explicit and closed over this generation's index.
const childId = 'artifact:' + 'f'.repeat(64);
const childSummary = { ...summary, id: childId, name: 'App-platform-child' };
const indexSummary = { ...summary, childArtifactIds: [childId] };
valid('validateResourceArtifactUsageIndex', { ...index, artifacts: [indexSummary, childSummary] });
invalid('validateResourceArtifactUsageIndex', { ...index, artifacts: [indexSummary] });
invalid('validateResourceArtifactSummary', { ...summary, childArtifactIds: [id] });
invalid(
  'validateResourceArtifactUsagePointer',
  { ...pointer, artifactGeneration: { ...binding.artifactGeneration, generatedAt: '2026-10-13T00:01:00.000Z' } },
  binding
);
invalid('validateResourceArtifactUsageManifest', { ...manifest, files: manifest.files.filter(file => file.role !== 'index') });
invalid('validateResourceArtifactUsageManifest', { ...manifest, files: manifest.files.filter(file => file.role !== 'summary') });
invalid('validateResourceArtifactUsageManifest', {
  ...manifest,
  files: manifest.files.map(file => (file.role === 'findings' ? { ...file, page: 1, path: file.path.replace('/0.json.gz', '/1.json.gz') } : file)),
});
invalid('validateResourceArtifactUsageManifest', { ...manifest, sourceCoverage: [{ ...source, status: 'available', limits: { truncated: true } }] });
invalid('validateResourceArtifactUsageManifest', { ...manifest, sourceCoverage: [{ ...source, status: 'unavailable' }] });
invalid('validateResourceArtifactUsageManifest', { ...manifest, paging: { ...manifest.paging, maxRows: 201 } });
invalid('validateResourceArtifactUsageManifest', { ...manifest, expiresAt: time });
invalid('validateResourceArtifactUsageManifest', {
  ...manifest,
  files: manifest.files.map((file, index) => (index === 0 ? { ...file, byteLength: 2097153 } : file)),
});
valid('validateResourceArtifactDetailPage', { ...page, page: 1, rows: [finding], count: 2 });
valid('validateResourceArtifactDetailPage', { ...page, completeness: 'restricted', rows: [], count: undefined });
const semanticRun = 'scope/subscription/run#1';
const semanticPrefix = contracts.resourceArtifactUsageRunPrefix(semanticRun);
assert.match(semanticPrefix, /^runs\/r1-[A-Za-z0-9_-]+\/artifact-usage$/);
valid('validateResourceArtifactUsagePointer', {
  ...pointer,
  artifactGeneration: { ...binding.artifactGeneration, runId: semanticRun },
  manifest: { ...pointer.manifest, path: semanticPrefix + '/manifest.json' },
});
valid('validateResourceArtifactUsageIndex', { ...index, provider: 'aws', accountId: '123456789012' });

if (process.env.WRITE_ARTIFACT_USAGE_FIXTURE === '1') {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(
    new URL('../fixtures/resource-artifact-usage.json', import.meta.url),
    JSON.stringify(
      { binding, source, summary, finding, usage, manifest, index, page, pointer, examples: { indexSummary, childSummary, semanticRun } },
      null,
      2
    ) + '\n'
  );
}
console.log('Resource artifact usage contract checks passed.');
