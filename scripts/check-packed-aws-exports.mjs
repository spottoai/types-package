import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const awsFixturePath = join(packageRoot, 'tests', 'fixtures', 'aws-public-root.consumer.ts.fixture');
const resourceOptimizationFixturePath = join(packageRoot, 'tests', 'fixtures', 'resource-optimization.consumer.ts.fixture');
const recommendationTracksFixturePath = join(packageRoot, 'tests', 'fixtures', 'recommendation-tracks.consumer.ts.fixture');
const recommendationWorkflowApiFixturePath = join(packageRoot, 'tests', 'fixtures', 'recommendation-workflow-api.consumer.ts.fixture');
const recommendationWorkflowUiFixturePath = join(packageRoot, 'tests', 'fixtures', 'recommendation-workflow-ui.consumer.ts.fixture');
const azureSpSetupApiFixturePath = join(packageRoot, 'tests', 'fixtures', 'azure-sp-setup-api.consumer.ts.fixture');
const azureSpSetupCloudEngineFixturePath = join(packageRoot, 'tests', 'fixtures', 'azure-sp-setup-cloud-engine.consumer.ts.fixture');
const azureSpSetupUiFixturePath = join(packageRoot, 'tests', 'fixtures', 'azure-sp-setup-ui.consumer.ts.fixture');
const commitmentsPlanningFixturePath = join(packageRoot, 'tests', 'fixtures', 'commitments-planning.consumer.ts.fixture');
const narrowAwsRuntimeFixturePath = join(packageRoot, 'tests', 'fixtures', 'narrow-aws-runtime.consumer.ts.fixture');
const artifactEvidenceCorpusPath = join(packageRoot, 'fixtures', 'artifact-evidence-contract-corpus.json');
const artifactEvidenceCorpus = JSON.parse(await readFile(artifactEvidenceCorpusPath, 'utf8'));
const legacyBillingMetadataLiteral = JSON.stringify(artifactEvidenceCorpus.fixtures.legacyBillingCostAnalysisMetadataV1, null, 2);
const legacyBillingFallbackDocument = {
  ...artifactEvidenceCorpus.fixtures.legacyBillingCostAnalysisMetadataV1,
  artifactState: 'fallback',
  artifactSource: 'legacy-transition',
};
const packedBillingV7DocumentsLiteral = JSON.stringify({
  limits: artifactEvidenceCorpus.objectLimitsV1,
  diagnosticDiscovery: artifactEvidenceCorpus.diagnosticDiscoveryV1,
  observation: artifactEvidenceCorpus.fixtures.billingAnalyzerInputObservationPointerV1,
  inputManifest: artifactEvidenceCorpus.fixtures.billingAnalyzerInputManifestV2,
  outputManifest: artifactEvidenceCorpus.fixtures.billingAnalyzerOutputManifestV2,
  legacyBusiness: artifactEvidenceCorpus.fixtures.legacyBillingCostAnalysisMetadataV1,
  legacyFallback: legacyBillingFallbackDocument,
  current: artifactEvidenceCorpus.fixtures.billingCostAnalysisMetadataV2,
  partial: artifactEvidenceCorpus.fixtures.billingCostAnalysisMetadataPartialV2,
  completeEmpty: artifactEvidenceCorpus.fixtures.billingCostAnalysisMetadataCompleteEmptyV2,
});
const packedBillingV7ProbeSource = `
const billingV7 = ${packedBillingV7DocumentsLiteral};
const prototypeBearingBusiness = { ...billingV7.legacyBusiness, future: JSON.parse('{"__proto__":{"polluted":true}}') };
if (JSON.stringify(root.BILLING_ARTIFACT_OBJECT_LIMITS_V1) !== JSON.stringify(billingV7.limits) ||
    !Object.isFrozen(root.BILLING_ARTIFACT_OBJECT_LIMITS_V1) ||
    root.BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH !== billingV7.diagnosticDiscovery.relativeSuffix ||
    root.buildBillingAnalyzerInputObservationPointerPath(billingV7.diagnosticDiscovery.subscriptionId) !== billingV7.diagnosticDiscovery.absolutePath ||
    !root.isBillingAnalyzerInputObservationPointerPath(billingV7.diagnosticDiscovery.absolutePath) ||
    root.isBillingAnalyzerInputObservationPointerPath('subscriptions/../history/billing/analyzer-inputs/latest-enqueued.json') ||
    !root.isBillingCostAnalysisBusinessPayloadV1(billingV7.legacyBusiness) ||
    root.isBillingCostAnalysisBusinessPayloadV1({ ...billingV7.legacyBusiness, artifactState: 'current' }) ||
    root.isBillingCostAnalysisBusinessPayloadV1(prototypeBearingBusiness) ||
    !root.isBillingCostAnalysisLegacyFallbackResponse(billingV7.legacyFallback) ||
    !root.isBillingCostAnalysisVerifiedReadResponse(billingV7.current) ||
    !root.isBillingCostAnalysisVerifiedReadResponse(billingV7.completeEmpty) ||
    root.isBillingCostAnalysisVerifiedReadResponse(billingV7.partial) ||
    !root.isBillingCostAnalysisReadResponse(billingV7.current) ||
    !root.isBillingCostAnalysisReadResponse(billingV7.legacyFallback) ||
    root.isBillingCostAnalysisReadResponse(billingV7.partial) ||
    root.isBillingCostAnalysisMetadataV2({ ...billingV7.current, artifactState: 'fallback' }) ||
    root.isBillingCostAnalysisMetadataV2({ ...billingV7.current, artifactSource: 'legacy-transition' }) ||
    root.isBillingAnalyzerInputCurrentPointerV1(billingV7.observation) ||
    root.isBillingAnalysisCurrentPointerV1(billingV7.observation)) {
  throw new Error('Packed billing v7 export/response/discovery probe failed');
}
const exactInput = structuredClone(billingV7.inputManifest);
exactInput.inputs[0].byteCount = billingV7.limits.inputObjectStoredBytes;
const oversizedInput = structuredClone(exactInput);
oversizedInput.inputs[0].byteCount += 1;
const exactOutput = structuredClone(billingV7.outputManifest);
exactOutput.artifacts[0].byteLength = billingV7.limits.metadataStoredBytes;
exactOutput.artifacts.push({
  path: 'subscriptions/sub-123/billing/generations/billing-input-generation-42/plots/daily.json.gz',
  name: 'daily.json.gz',
  mediaType: 'application/json',
  contentEncoding: 'gzip',
  byteLength: billingV7.limits.plotStoredBytes,
  sha256: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
});
const oversizedOutput = structuredClone(exactOutput);
oversizedOutput.artifacts[1].byteLength += 1;
if (!root.isBillingAnalyzerInputManifestV2(exactInput) ||
    root.isBillingAnalyzerInputManifestV2(oversizedInput) ||
    !root.isBillingAnalyzerOutputManifestV2(exactOutput) ||
    root.isBillingAnalyzerOutputManifestV2(oversizedOutput)) {
  throw new Error('Packed billing v7 stored-object boundary probe failed');
}
`;
const promotionObservationLiteral = JSON.stringify(artifactEvidenceCorpus.fixtures.billingAnalysisPromotionObservationV1, null, 2);
const digestRelationPromotionObservationLiteral = JSON.stringify(
  artifactEvidenceCorpus.observationDigestVectors.find(vector => vector.name === 'equal revision and different output digest').observation,
  null,
  2
);
const packedObservationRuntimeVectors = ['equal revision and same output digest', 'equal revision and different output digest'].map(name => {
  const vector = artifactEvidenceCorpus.observationDigestVectors.find(candidate => candidate.name === name);
  if (vector === undefined) throw new Error(`Missing packed observation runtime vector: ${name}`);
  return vector;
});
const packedObservationRuntimeVectorsLiteral = JSON.stringify(packedObservationRuntimeVectors);
const digestRepairRuntimeDocuments =
  '{"outputManifest":{"schemaVersion":2,"status":"completed","subscriptionId":"sub-123","generationId":"billing-input-generation-42","ownership":{"provider":"azure","tenantId":"tenant-1","companyId":"company-1","cloudAccountId":"cloud-account-1","accountId":"sub-123","ownershipEpochRevision":3},"revision":{"ownershipEpochRevision":3,"sourceRevision":42,"policyRevision":7},"inputManifestPath":"subscriptions/sub-123/history/billing/analyzer-inputs/generations/billing-input-generation-42/manifest.json","inputManifestDigest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","artifacts":[{"path":"subscriptions/sub-123/billing/generations/billing-input-generation-42/metadata.json","name":"metadata.json","mediaType":"application/json","contentEncoding":"identity","byteLength":1924,"sha256":"77e5c414e955b33a68e0131874eb95fc6e6f4cf81cd1cc318d3563712479fd5e"}],"publicationDecision":{"processing":"succeeded","evidence":"partial","publication":"partial","dependencies":[{"name":"billing-history","required":true,"support":"supported","applicability":"applicable","attempt":"succeeded","coverage":"complete","emptyEvidence":"populated","freshness":"current","evidence":"complete","publication":"completed","generationId":"billing-input-generation-42","digest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","sourceRevision":42,"policyRevision":7},{"name":"exchange-rates","required":false,"support":"supported","applicability":"applicable","attempt":"failed","coverage":"none","emptyEvidence":"not-observed","freshness":"unknown","evidence":"insufficient","publication":"suppressed","reasonCode":"exchange-rates-unavailable"}],"claims":[{"claimId":"cost-analysis","sectionPaths":["chartData","anomalies"],"requiredDependencies":["billing-history"],"evidence":"partial","publication":"partial","issues":[{"code":"exchange-rates-unavailable","blocking":false,"dependency":"exchange-rates"}]}],"issues":[{"code":"exchange-rates-unavailable","blocking":false,"dependency":"exchange-rates"}]},"manifestDigest":"eba62c30e4081c047d6ef10a62b72992905abed1350149b0e0b953328166ac06","completedAt":"2026-08-13T00:05:00.000Z","outputBindingDigest":"82073ad7769e4b90d979617dcebcadb6d25c54d7c0c287a561caa72df764ec63"},"metadata":{"schemaVersion":2,"subscriptionId":"sub-123","billingGenerationId":"billing-input-generation-42","ownership":{"provider":"azure","tenantId":"tenant-1","companyId":"company-1","cloudAccountId":"cloud-account-1","accountId":"sub-123","ownershipEpochRevision":3},"revision":{"ownershipEpochRevision":3,"sourceRevision":42,"policyRevision":7},"artifactState":"partial","artifactEvidence":{"processing":"succeeded","evidence":"partial","publication":"partial","dependencies":[{"name":"billing-history","required":true,"support":"supported","applicability":"applicable","attempt":"succeeded","coverage":"complete","emptyEvidence":"populated","freshness":"current","evidence":"complete","publication":"completed","generationId":"billing-input-generation-42","digest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","sourceRevision":42,"policyRevision":7},{"name":"exchange-rates","required":false,"support":"supported","applicability":"applicable","attempt":"failed","coverage":"none","emptyEvidence":"not-observed","freshness":"unknown","evidence":"insufficient","publication":"suppressed","reasonCode":"exchange-rates-unavailable"}],"claims":[{"claimId":"cost-analysis","sectionPaths":["chartData","anomalies"],"requiredDependencies":["billing-history"],"evidence":"partial","publication":"partial","issues":[{"code":"exchange-rates-unavailable","blocking":false,"dependency":"exchange-rates"}]}],"issues":[{"code":"exchange-rates-unavailable","blocking":false,"dependency":"exchange-rates"}]},"inputManifestDigest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","outputBindingDigest":"82073ad7769e4b90d979617dcebcadb6d25c54d7c0c287a561caa72df764ec63","chartData":{"schemaVersion":1,"source":"aggregated","dataWindow":{"startDate":1754006400,"endDate":1756684800,"pointCount":0},"views":{},"detectors":{"threshold":2,"methods":[]}},"anomalies":[],"currencyCode":"NZD","currencySymbol":"$"},"inputManifest":{"schemaVersion":2,"status":"completed","subscriptionId":"sub-123","generationId":"billing-input-generation-42","publicationKey":"billing-input:sub-123:source-run-42","ownership":{"provider":"azure","tenantId":"tenant-1","companyId":"company-1","cloudAccountId":"cloud-account-1","accountId":"sub-123","ownershipEpochRevision":3},"revision":{"ownershipEpochRevision":3,"sourceRevision":42,"policyRevision":7},"coveragePlanDigest":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","asOfUtc":"2026-08-13T00:00:00.000Z","stableCutoffUtc":"2026-08-12T00:00:00.000Z","requestedPeriods":[{"fromInclusive":"2026-07-01T00:00:00.000Z","throughExclusive":"2026-08-01T00:00:00.000Z","dateBasis":"utc","basis":"amortized"}],"inputs":[{"path":"subscriptions/sub-123/history/billing/analyzer-inputs/generations/billing-input-generation-42/months/month_2026-07.json.gz","versionId":"version-1","etag":"etag-1","sha256":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","byteCount":512,"rowCount":31,"basis":"amortized","currencyCode":"NZD","coverage":"complete"}],"manifestDigest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","completedAt":"2026-08-13T00:05:00.000Z"}}';
const artifactEvidenceConsumerSource = `
import {
  BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH,
  BILLING_ARTIFACT_OBJECT_LIMITS_V1,
  buildBillingAnalyzerInputObservationPointerPath,
  canonicalizeBillingAnalyzerInputManifestV2ForDigest,
  canonicalizeBillingAnalysisPromotionObservationV1ForDigest,
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest,
  canonicalizeBillingOutputBindingV1,
  compareArtifactRevisionVector,
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalysisPromotionObservationV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputObservationPointerV1,
  isBillingAnalyzerInputObservationPointerPath,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisBusinessPayloadV1,
  isBillingCostAnalysisLegacyFallbackResponse,
  isBillingCostAnalysisMetadataV2,
  isBillingCostAnalysisReadResponse,
  isBillingCostAnalysisVerifiedReadResponse,
  isCompletedAzureViewSetV2,
  isCompletedViewManifestV3,
  isEnforceableArtifactOwnershipBinding,
  projectBillingOutputBindingV1FromManifest,
  projectBillingOutputBindingV1FromMetadata,
  type ArtifactApplicabilityVerdict,
  type ArtifactAttemptOutcome,
  type ArtifactClaimDependencyDecision,
  type ArtifactCoverageVerdict,
  type ArtifactDependencyDescriptor,
  type ArtifactEmptyEvidenceVerdict,
  type ArtifactEvidenceVerdict,
  type ArtifactFreshnessVerdict,
  type ArtifactObservedRange,
  type ArtifactOwnershipBinding,
  type ArtifactProcessingLifecycle,
  type ArtifactPublicationDecision,
  type ArtifactPublicationVerdict,
  type ArtifactRevisionComparison,
  type ArtifactRevisionVector,
  type ArtifactSupportVerdict,
  type BillingAnalysisCurrentPointerV1,
  type BillingAnalysisPromotionObservationV1,
  type BillingAnalyzerInputCurrentPointerV1,
  type BillingAnalyzerInputObservationPointerV1,
  type BillingAnalyzerInputManifestV2,
  type BillingAnalyzerOutputManifestV2,
  type BillingAnalyzerRequestV2,
  type BillingArtifactReadState,
  type BillingCostAnalysisMetadata,
  type BillingCostAnalysisLegacyFallbackResponse,
  type BillingCostAnalysisMetadataV2,
  type BillingCostAnalysisReadResponse,
  type BillingCostAnalysisVerifiedReadResponse,
  type BillingOutputBindingV1,
  type CompletedAzureViewSetV2,
  type CompletedViewManifestV3,
} from '@spottoai/types-package';

const runtimeExports = [
  BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH,
  BILLING_ARTIFACT_OBJECT_LIMITS_V1,
  buildBillingAnalyzerInputObservationPointerPath,
  canonicalizeBillingAnalyzerInputManifestV2ForDigest,
  canonicalizeBillingAnalysisPromotionObservationV1ForDigest,
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest,
  canonicalizeBillingOutputBindingV1,
  compareArtifactRevisionVector,
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalysisPromotionObservationV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputObservationPointerV1,
  isBillingAnalyzerInputObservationPointerPath,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisBusinessPayloadV1,
  isBillingCostAnalysisLegacyFallbackResponse,
  isBillingCostAnalysisMetadataV2,
  isBillingCostAnalysisReadResponse,
  isBillingCostAnalysisVerifiedReadResponse,
  isCompletedAzureViewSetV2,
  isCompletedViewManifestV3,
  isEnforceableArtifactOwnershipBinding,
  projectBillingOutputBindingV1FromManifest,
  projectBillingOutputBindingV1FromMetadata,
];

type Dev1036PublishedTypes = [
  ArtifactApplicabilityVerdict,
  ArtifactAttemptOutcome,
  ArtifactClaimDependencyDecision,
  ArtifactCoverageVerdict,
  ArtifactDependencyDescriptor,
  ArtifactEmptyEvidenceVerdict,
  ArtifactEvidenceVerdict,
  ArtifactFreshnessVerdict,
  ArtifactObservedRange,
  ArtifactOwnershipBinding,
  ArtifactProcessingLifecycle,
  ArtifactPublicationDecision,
  ArtifactPublicationVerdict,
  ArtifactRevisionComparison,
  ArtifactRevisionVector,
  ArtifactSupportVerdict,
  BillingAnalysisCurrentPointerV1,
  BillingAnalysisPromotionObservationV1,
  BillingAnalyzerInputCurrentPointerV1,
  BillingAnalyzerInputObservationPointerV1,
  BillingAnalyzerInputManifestV2,
  BillingAnalyzerOutputManifestV2,
  BillingAnalyzerRequestV2,
  BillingArtifactReadState,
  BillingCostAnalysisMetadata,
  BillingCostAnalysisLegacyFallbackResponse,
  BillingCostAnalysisMetadataV2,
  BillingCostAnalysisReadResponse,
  BillingCostAnalysisVerifiedReadResponse,
  BillingOutputBindingV1,
  CompletedAzureViewSetV2,
  CompletedViewManifestV3,
];

const legacyBillingMetadata = ${legacyBillingMetadataLiteral} satisfies BillingCostAnalysisMetadata;
const legacyBillingFallback = ${JSON.stringify(legacyBillingFallbackDocument, null, 2)} satisfies BillingCostAnalysisLegacyFallbackResponse;
const verifiedBillingRead = ${JSON.stringify(artifactEvidenceCorpus.fixtures.billingCostAnalysisMetadataV2, null, 2)} satisfies BillingCostAnalysisVerifiedReadResponse;
const billingReadResponses: BillingCostAnalysisReadResponse[] = [legacyBillingFallback, verifiedBillingRead];
const promotionObservation = ${promotionObservationLiteral} satisfies BillingAnalysisPromotionObservationV1;
const digestRelationPromotionObservation = ${digestRelationPromotionObservationLiteral} satisfies BillingAnalysisPromotionObservationV1;
const digestRepairDocuments = ${digestRepairRuntimeDocuments} as unknown as {
  outputManifest: BillingAnalyzerOutputManifestV2;
  metadata: BillingCostAnalysisMetadataV2;
  inputManifest: BillingAnalyzerInputManifestV2;
};
const manifestBinding: BillingOutputBindingV1 = projectBillingOutputBindingV1FromManifest(digestRepairDocuments.outputManifest);
const metadataBinding: BillingOutputBindingV1 = projectBillingOutputBindingV1FromMetadata(digestRepairDocuments.metadata);
const packedCanonicalPreimages: string[] = [
  canonicalizeBillingOutputBindingV1(manifestBinding),
  canonicalizeBillingOutputBindingV1(metadataBinding),
  canonicalizeBillingAnalyzerInputManifestV2ForDigest(digestRepairDocuments.inputManifest),
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest(digestRepairDocuments.outputManifest),
  canonicalizeBillingAnalysisPromotionObservationV1ForDigest(promotionObservation),
  canonicalizeBillingAnalysisPromotionObservationV1ForDigest(digestRelationPromotionObservation),
];
const observationRuntimeChecks: boolean[] = [
  isBillingAnalysisPromotionObservationV1(promotionObservation),
  isBillingAnalysisPromotionObservationV1(digestRelationPromotionObservation),
  canonicalizeBillingAnalysisPromotionObservationV1ForDigest(digestRelationPromotionObservation).includes(
    '"outputDigestRelation":"different"'
  ),
  !isBillingAnalysisCurrentPointerV1(promotionObservation),
  !isBillingAnalyzerInputCurrentPointerV1(promotionObservation),
  isBillingAnalyzerInputObservationPointerV1(${JSON.stringify(artifactEvidenceCorpus.fixtures.billingAnalyzerInputObservationPointerV1)}),
];

void runtimeExports;
void legacyBillingMetadata;
void billingReadResponses;
void packedCanonicalPreimages;
void observationRuntimeChecks;
void (null as unknown as Dev1036PublishedTypes);
`;
const dev1036RuntimeExportNames = [
  'buildBillingAnalyzerInputObservationPointerPath',
  'compareArtifactRevisionVector',
  'isArtifactOwnershipBinding',
  'isArtifactPublicationDecision',
  'isBillingAnalysisCurrentPointerV1',
  'isBillingAnalysisPromotionObservationV1',
  'isBillingAnalyzerInputCurrentPointerV1',
  'isBillingAnalyzerInputObservationPointerV1',
  'isBillingAnalyzerInputObservationPointerPath',
  'isBillingAnalyzerInputManifestV2',
  'isBillingAnalyzerOutputManifestV2',
  'isBillingAnalyzerRequestV2',
  'isBillingCostAnalysisBusinessPayloadV1',
  'isBillingCostAnalysisLegacyFallbackResponse',
  'isBillingCostAnalysisMetadataV2',
  'isBillingCostAnalysisReadResponse',
  'isBillingCostAnalysisVerifiedReadResponse',
  'isCompletedAzureViewSetV2',
  'isCompletedViewManifestV3',
  'isEnforceableArtifactOwnershipBinding',
  'projectBillingOutputBindingV1FromManifest',
  'projectBillingOutputBindingV1FromMetadata',
  'canonicalizeBillingOutputBindingV1',
  'canonicalizeBillingAnalyzerInputManifestV2ForDigest',
  'canonicalizeBillingAnalyzerOutputManifestV2ForDigest',
  'canonicalizeBillingAnalysisPromotionObservationV1ForDigest',
];
const requiredDigestRepairRuntimeExports = [
  'projectBillingOutputBindingV1FromManifest',
  'projectBillingOutputBindingV1FromMetadata',
  'canonicalizeBillingOutputBindingV1',
  'canonicalizeBillingAnalyzerInputManifestV2ForDigest',
  'canonicalizeBillingAnalyzerOutputManifestV2ForDigest',
  'canonicalizeBillingAnalysisPromotionObservationV1ForDigest',
];
for (const exportName of requiredDigestRepairRuntimeExports) {
  if (!dev1036RuntimeExportNames.includes(exportName)) {
    throw new Error(`packed DEV-1036 gate must execute digest-repair root export: ${exportName}`);
  }
}
const portfolioFixturePath = join(packageRoot, 'tests', 'fixtures', 'portfolio.consumer.ts.fixture');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeModulesBin = join(packageRoot, 'node_modules', '.bin');
const tscCommand = join(nodeModulesBin, process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
const subprocessEnvironment = { ...process.env };
delete subprocessEnvironment.npm_config_dry_run;
delete subprocessEnvironment.NPM_CONFIG_DRY_RUN;

const run = (command, args, cwd, captureOutput = false) => {
  const invocation =
    process.platform === 'win32' && command.toLowerCase().endsWith('.cmd')
      ? {
          command: process.env.ComSpec || 'cmd.exe',
          args: ['/d', '/s', '/c', command, ...args],
        }
      : { command, args };

  const result = spawnSync(invocation.command, invocation.args, {
    cwd,
    encoding: 'utf8',
    env: subprocessEnvironment,
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
  run(npmCommand, ['run', 'build'], packageRoot);
  const packOutput = run(npmCommand, ['pack', '--ignore-scripts', '--json', '--pack-destination', tempRoot], packageRoot, true);
  const [packedArtifact] = JSON.parse(packOutput);
  if (!packedArtifact?.filename) {
    throw new Error('npm pack did not return an artifact filename.');
  }

  const consumerRoot = join(tempRoot, 'consumer');
  await mkdir(consumerRoot, { recursive: true });
  await writeFile(join(consumerRoot, 'package.json'), JSON.stringify({ private: true, type: 'module' }, null, 2));
  await copyFile(awsFixturePath, join(consumerRoot, 'aws-public-root.consumer.ts'));
  await copyFile(resourceOptimizationFixturePath, join(consumerRoot, 'resource-optimization.consumer.ts'));
  await copyFile(recommendationTracksFixturePath, join(consumerRoot, 'recommendation-tracks.consumer.ts'));
  await copyFile(recommendationWorkflowApiFixturePath, join(consumerRoot, 'recommendation-workflow-api.consumer.ts'));
  await copyFile(recommendationWorkflowUiFixturePath, join(consumerRoot, 'recommendation-workflow-ui.consumer.ts'));
  await copyFile(azureSpSetupApiFixturePath, join(consumerRoot, 'azure-sp-setup-api.consumer.ts'));
  await copyFile(azureSpSetupCloudEngineFixturePath, join(consumerRoot, 'azure-sp-setup-cloud-engine.consumer.ts'));
  await copyFile(azureSpSetupUiFixturePath, join(consumerRoot, 'azure-sp-setup-ui.consumer.ts'));
  await copyFile(commitmentsPlanningFixturePath, join(consumerRoot, 'commitments-planning.consumer.ts'));
  await writeFile(join(consumerRoot, 'artifact-evidence.consumer.ts'), artifactEvidenceConsumerSource);
  await copyFile(narrowAwsRuntimeFixturePath, join(consumerRoot, 'narrow-aws-runtime.consumer.ts'));
  await copyFile(portfolioFixturePath, join(consumerRoot, 'portfolio.consumer.ts'));

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
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      'aws-public-root.consumer.ts',
      'resource-optimization.consumer.ts',
      'recommendation-tracks.consumer.ts',
      'recommendation-workflow-api.consumer.ts',
      'recommendation-workflow-ui.consumer.ts',
      'azure-sp-setup-api.consumer.ts',
      'azure-sp-setup-cloud-engine.consumer.ts',
      'azure-sp-setup-ui.consumer.ts',
      'commitments-planning.consumer.ts',
      'artifact-evidence.consumer.ts',
      'narrow-aws-runtime.consumer.ts',
      'portfolio.consumer.ts',
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import { createHash } from 'node:crypto'; import root from '@spottoai/types-package'; const vectors = ${packedObservationRuntimeVectorsLiteral}; const sha256 = value => createHash('sha256').update(value).digest('hex'); for (const vector of vectors) { const canonical = root.canonicalizeBillingAnalysisPromotionObservationV1ForDigest(vector.observation); if (!root.isBillingAnalysisPromotionObservationV1(vector.observation) || canonical !== vector.expectedCanonical || sha256(canonical) !== vector.expectedDigest || vector.observation.observationDigest !== vector.expectedDigest) throw new Error('Packed ESM observation probe failed: ' + vector.name); }`,
    ],
    consumerRoot
  );
  run(process.execPath, ['--input-type=module', '-e', `import root from '@spottoai/types-package'; ${packedBillingV7ProbeSource}`], consumerRoot);
  run(process.execPath, ['-e', `const root = require('@spottoai/types-package'); ${packedBillingV7ProbeSource}`], consumerRoot);
  run(
    process.execPath,
    [
      '-e',
      `const { createHash } = require('node:crypto'); const root = require('@spottoai/types-package'); const vectors = ${packedObservationRuntimeVectorsLiteral}; const sha256 = value => createHash('sha256').update(value).digest('hex'); for (const vector of vectors) { const canonical = root.canonicalizeBillingAnalysisPromotionObservationV1ForDigest(vector.observation); if (!root.isBillingAnalysisPromotionObservationV1(vector.observation) || canonical !== vector.expectedCanonical || sha256(canonical) !== vector.expectedDigest || vector.observation.observationDigest !== vector.expectedDigest) throw new Error('Packed CommonJS observation probe failed: ' + vector.name); }`,
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import root from '@spottoai/types-package'; import aws from '@spottoai/types-package/aws'; import recommendations from '@spottoai/types-package/azure/recommendations'; import provider from '@spottoai/types-package/common/provider'; const dev1036RuntimeExportNames = ${JSON.stringify(dev1036RuntimeExportNames)}; const documents = ${digestRepairRuntimeDocuments}; const manifestBinding = root.projectBillingOutputBindingV1FromManifest(documents.outputManifest); const metadataBinding = root.projectBillingOutputBindingV1FromMetadata(documents.metadata); const bindingCanonical = root.canonicalizeBillingOutputBindingV1(manifestBinding); const metadataBindingCanonical = root.canonicalizeBillingOutputBindingV1(metadataBinding); const inputPreimage = root.canonicalizeBillingAnalyzerInputManifestV2ForDigest(documents.inputManifest); const outputPreimage = root.canonicalizeBillingAnalyzerOutputManifestV2ForDigest(documents.outputManifest); if (JSON.stringify(manifestBinding) !== JSON.stringify(metadataBinding) || bindingCanonical !== metadataBindingCanonical || !bindingCanonical.includes('"kind":"billing-analysis-output"') || inputPreimage.includes('"manifestDigest"') || outputPreimage.includes('"manifestDigest"') || !outputPreimage.includes('"outputBindingDigest"') || root.AWS_COMMAND_PROVIDER !== 'aws' || root.AWS_COMMAND_SCHEMA_VERSION !== 1 || root.ARTIFACT_GENERATION_SCHEMA_VERSION !== 1 || root.SystemTrackIds.resourceHygiene !== 'resource-hygiene' || root.RecommendationFocusModes.finops !== 'finops' || !Array.isArray(root.AWS_COMMAND_ACTIONS) || !Array.isArray(root.AWS_COMMAND_ENTITIES) || !Array.isArray(root.AWS_FORBIDDEN_CREDENTIAL_FIELDS) || aws.AWS_ESTATES_MANIFEST_SCHEMA_VERSION !== 1 || aws.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION !== 2 || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('plugin-resource') || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('account-summary-ai-cost-summary') || aws.AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME !== 'resources.json.gz' || aws.AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME !== 'relationships.json.gz' || aws.buildAwsPluginSubscriptionLogicalName('a'.repeat(64)) !== 'plugin-subscription--' + 'a'.repeat(64) + '.json.gz' || typeof aws.sha256AwsPluginIdentity !== 'function' || typeof aws.validateAwsPluginGenerationManifest !== 'function' || typeof aws.validateAwsPortalAccountSummaryAiCostSummaryArtifact !== 'function' || typeof aws.validateAwsPortalRelationshipArtifact !== 'function' || typeof aws.validateAwsCommitmentsPlanningViewIdentity !== 'function' || !dev1036RuntimeExportNames.every(name => typeof root[name] === 'function') || recommendations.RecommendationCategory.Cost !== 'Cost' || provider.ProviderName.Azure !== 'azure') process.exit(1);`,
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import root from '@spottoai/types-package'; import aws from '@spottoai/types-package/aws'; import relationships from '@spottoai/types-package/aws/relationships'; import commitments from '@spottoai/types-package/aws/commitments-planning'; import recommendations from '@spottoai/types-package/azure/recommendations'; import provider from '@spottoai/types-package/common/provider'; if (root.AWS_COMMAND_PROVIDER !== 'aws' || root.AWS_COMMAND_SCHEMA_VERSION !== 1 || root.ARTIFACT_GENERATION_SCHEMA_VERSION !== 1 || root.SystemTrackIds.resourceHygiene !== 'resource-hygiene' || root.RecommendationFocusModes.finops !== 'finops' || !Array.isArray(root.AWS_COMMAND_ACTIONS) || !Array.isArray(root.AWS_COMMAND_ENTITIES) || !Array.isArray(root.AWS_FORBIDDEN_CREDENTIAL_FIELDS) || root.AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME !== 'commitments-planning.json.gz' || typeof root.validateAwsPortalCommitmentsPlanningArtifact !== 'function' || aws.AWS_ESTATES_MANIFEST_SCHEMA_VERSION !== 1 || aws.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION !== 2 || aws.AWS_PORTAL_RELATIONSHIP_CONFIDENCE_SCORES.high !== 1 || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('plugin-resource') || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('account-summary-ai-cost-summary') || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('commitments-planning') || aws.AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME !== 'resources.json.gz' || aws.AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME !== 'relationships.json.gz' || aws.AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME !== 'commitments-planning.json.gz' || aws.buildAwsPluginSubscriptionLogicalName('a'.repeat(64)) !== 'plugin-subscription--' + 'a'.repeat(64) + '.json.gz' || typeof aws.sha256AwsPluginIdentity !== 'function' || typeof aws.validateAwsPluginGenerationManifest !== 'function' || typeof aws.validateAwsPortalAccountSummaryAiCostSummaryArtifact !== 'function' || typeof aws.validateAwsPortalRelationshipArtifact !== 'function' || typeof aws.validateAwsCommitmentsPlanningViewIdentity !== 'function' || typeof aws.validateAwsPortalCommitmentsPlanningArtifact !== 'function' || typeof relationships.validateAwsPortalRelationshipArtifact !== 'function' || typeof commitments.validateAwsCommitmentsPlanningViewIdentity !== 'function' || recommendations.RecommendationCategory.Cost !== 'Cost' || provider.ProviderName.Azure !== 'azure') process.exit(1);",
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '-e',
      `const root = require('@spottoai/types-package'); const aws = require('@spottoai/types-package/aws'); const recommendations = require('@spottoai/types-package/azure/recommendations'); const provider = require('@spottoai/types-package/common/provider'); const dev1036RuntimeExportNames = ${JSON.stringify(dev1036RuntimeExportNames)}; const documents = ${digestRepairRuntimeDocuments}; const manifestBinding = root.projectBillingOutputBindingV1FromManifest(documents.outputManifest); const metadataBinding = root.projectBillingOutputBindingV1FromMetadata(documents.metadata); const bindingCanonical = root.canonicalizeBillingOutputBindingV1(manifestBinding); const metadataBindingCanonical = root.canonicalizeBillingOutputBindingV1(metadataBinding); const inputPreimage = root.canonicalizeBillingAnalyzerInputManifestV2ForDigest(documents.inputManifest); const outputPreimage = root.canonicalizeBillingAnalyzerOutputManifestV2ForDigest(documents.outputManifest); if (JSON.stringify(manifestBinding) !== JSON.stringify(metadataBinding) || bindingCanonical !== metadataBindingCanonical || !bindingCanonical.includes('"kind":"billing-analysis-output"') || inputPreimage.includes('"manifestDigest"') || outputPreimage.includes('"manifestDigest"') || !outputPreimage.includes('"outputBindingDigest"') || root.ARTIFACT_GENERATION_SCHEMA_VERSION !== 1 || root.SystemTrackIds.resourceHygiene !== 'resource-hygiene' || root.RecommendationFocusModes.finops !== 'finops' || aws.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || typeof root.validateAwsPluginSubscriptionDetailArtifact !== 'function' || typeof aws.buildAwsPluginResourceLogicalName !== 'function' || typeof root.validateAwsPortalResourceCollectionDetailArtifact !== 'function' || typeof root.validateAwsPortalRelationshipArtifact !== 'function' || typeof root.validateAwsCommitmentsPlanningViewIdentity !== 'function' || !dev1036RuntimeExportNames.every(name => typeof root[name] === 'function') || recommendations.RecommendationCategory.Cost !== 'Cost' || provider.ProviderName.Azure !== 'azure') process.exit(1);`,
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '-e',
      "const root = require('@spottoai/types-package'); const aws = require('@spottoai/types-package/aws'); const relationships = require('@spottoai/types-package/aws/relationships'); const commitments = require('@spottoai/types-package/aws/commitments-planning'); const recommendations = require('@spottoai/types-package/azure/recommendations'); const provider = require('@spottoai/types-package/common/provider'); if (root.ARTIFACT_GENERATION_SCHEMA_VERSION !== 1 || root.SystemTrackIds.resourceHygiene !== 'resource-hygiene' || root.RecommendationFocusModes.finops !== 'finops' || aws.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_RELATIONSHIP_CONFIDENCE_SCORES.high !== 1 || typeof root.validateAwsPluginSubscriptionDetailArtifact !== 'function' || typeof aws.buildAwsPluginResourceLogicalName !== 'function' || typeof root.validateAwsPortalResourceCollectionDetailArtifact !== 'function' || typeof root.validateAwsPortalRelationshipArtifact !== 'function' || typeof root.validateAwsCommitmentsPlanningViewIdentity !== 'function' || typeof relationships.validateAwsPortalRelationshipArtifact !== 'function' || typeof commitments.validateAwsCommitmentsPlanningViewIdentity !== 'function' || recommendations.RecommendationCategory.Cost !== 'Cost' || provider.ProviderName.Azure !== 'azure') process.exit(1);",
    ],
    consumerRoot
  );

  run(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import root from '@spottoai/types-package'; if (root.PORTFOLIO_PROJECTION_SCHEMA_VERSION !== '2026-08-02' || !root.PORTFOLIO_PROJECTION_COMPATIBLE_SCHEMA_VERSIONS.includes(root.PORTFOLIO_PROJECTION_SCHEMA_VERSION) || root.PORTFOLIO_PROJECTION_DETAIL_TARGET_DECODED_BYTES !== 2 * 1024 * 1024 || root.PORTFOLIO_PROJECTION_MAX_COMPRESSED_BYTES !== 8 * 1024 * 1024 || root.PORTFOLIO_PROJECTION_MAX_DECODED_BYTES !== 32 * 1024 * 1024) process.exit(1);",
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '-e',
      "const root = require('@spottoai/types-package'); if (root.PORTFOLIO_CLOUD_ACCOUNT_SUMMARY_SCHEMA_VERSION !== '2026-08-13' || root.PORTFOLIO_PROJECTION_DETAIL_TARGET_COMPRESSED_BYTES !== 1024 * 1024 || root.PORTFOLIO_PROJECTION_MAX_REQUEST_DECODED_BYTES !== 24 * 1024 * 1024) process.exit(1);",
    ],
    consumerRoot
  );

  process.stdout.write('Packed Node 24 ESM/CommonJS root/AWS/Portfolio/narrow runtime plus API/cloud-engine/UI consumers verified.\n');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
